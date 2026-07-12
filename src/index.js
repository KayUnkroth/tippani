#!/usr/bin/env node

import express from "express";
import open from "open";
import * as azdev from "azure-devops-node-api";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import crypto from "crypto";
import { EDITOR_JS } from "./client/editor.bundle.js";
import { isConflict } from "./conflict.js";
import { decideCanEdit } from "./canedit.js";
import {
  createFocusStore,
  createDraftStore,
  createLockStore,
  createInflightStore,
} from "./api-state.js";
import { registerControlApi } from "./control-api.js";
import { writeInstance, removeInstance } from "./portal-registry.js";
import {
  decodeConfigValue,
  extOf,
  deriveRepoContext,
  summarizeNonMarkdown,
} from "./config-util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Config ---
const CONFIG_DIR = path.join(os.homedir(), ".tippani");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
let PORT = 3847;

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch { return {}; }
}

function saveConfig(cfg) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), { mode: 0o600 });
}

function getConfig() {
  const cfg = loadConfig();
  const args = process.argv.slice(2);
  // CLI flags override config
  const findArg = (name) => {
    const a = args.find(a => a.startsWith(`--${name}=`));
    return a ? a.split("=").slice(1).join("=") : null;
  };
  return {
    org: findArg("org") || process.env.TIPPANI_ORG || cfg.org || null,
    project: decodeConfigValue(findArg("project") || process.env.TIPPANI_PROJECT || cfg.project || null),
    repo: decodeConfigValue(findArg("repo") || process.env.TIPPANI_REPO || cfg.repo || cfg.project || null),
  };
}

// Resolved at startup
let ADO_ORG, ADO_PROJECT, ADO_REPO;

// --- PAT management ---
const PAT_FILE = path.join(CONFIG_DIR, "pat");

function loadPat() {
  try {
    return fs.readFileSync(PAT_FILE, "utf-8").trim();
  } catch {
    return null;
  }
}

function savePat(pat) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(PAT_FILE, pat, { mode: 0o600 });
}

// --- Local cache + pending queue ---
const CACHE_DIR = path.join(CONFIG_DIR, "cache");

function getCachePath(prId) {
  return path.join(CACHE_DIR, `pr-${prId}.json`);
}

function loadCache(prId) {
  try {
    const data = JSON.parse(fs.readFileSync(getCachePath(prId), "utf-8"));
    return data;
  } catch { return null; }
}

function saveCache(prId, data) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true, mode: 0o700 });
    data.cachedAt = new Date().toISOString();
    fs.writeFileSync(getCachePath(prId), JSON.stringify(data, null, 2), { mode: 0o600 });
  } catch (e) {
    console.warn(`  ⚠ Could not write cache: ${e.code || e.message}. Continuing without cache.`);
  }
}

function isCacheFresh(cache, maxAgeMs = 3600000) {
  if (!cache?.cachedAt) return false;
  return (Date.now() - new Date(cache.cachedAt).getTime()) < maxAgeMs;
}

function getPendingPath(prId) {
  return path.join(CACHE_DIR, `pr-${prId}-pending.json`);
}

function loadPending(prId) {
  try {
    return JSON.parse(fs.readFileSync(getPendingPath(prId), "utf-8"));
  } catch { return []; }
}

function savePending(prId, actions) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true, mode: 0o700 });
    fs.writeFileSync(getPendingPath(prId), JSON.stringify(actions, null, 2), { mode: 0o600 });
  } catch (e) {
    console.warn(`  ⚠ Could not save pending queue: ${e.code || e.message}`);
  }
}

function addPending(prId, action) {
  const pending = loadPending(prId);
  action.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  action.createdAt = new Date().toISOString();
  action.synced = false;
  pending.push(action);
  savePending(prId, pending);
  return action;
}

function removePending(prId, actionId) {
  const pending = loadPending(prId).filter((p) => p.id !== actionId);
  savePending(prId, pending);
}

// --- ADO error helper ---
function friendlyAdoError(e, context) {
  const msg = e.message || String(e);
  const status = e.statusCode || e.status || (msg.match(/(\d{3})/) || [])[1];
  if (msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED"))
    return `Could not connect to ADO org. Check the --org URL and your network.`;
  if (status == 401)
    return `Authentication failed (401). Your credentials may be expired.\n  If using az CLI: run 'az login' and re-run. If using a PAT: delete ~/.tippani/pat and re-run.`;
  if (status == 403)
    return `Access denied (403). Your account (or PAT) may lack access to this repo, or the PAT is missing the Code (Read & Write) scope.`;
  if (status == 404 || msg.includes("TF200016"))
    return `Not found (404). Check --project and --repo names.\n  Project: "${ADO_PROJECT}" | Repo: "${ADO_REPO}"`;
  if (msg.includes("VS404689"))
    return `Repo "${ADO_REPO}" not found in project "${ADO_PROJECT}". Check --repo.`;
  if (status == 429)
    return `ADO rate limited (429). Wait a minute and try again.`;
  if (status >= 500)
    return `ADO server error (${status}). Try again in a few minutes.`;
  return `${context}: ${msg}`;
}

async function getTokenFromAzCli() {
  // Dev fallback for standalone use: mint an ADO access token via the az CLI for
  // the host-configured resource. No resource configured → no token.
  const resource = process.env.TIPPANI_ADO_AUDIENCE;
  if (!resource) return null;
  const { execSync } = await import("child_process");
  try {
    const token = execSync(
      `az account get-access-token --resource "${resource}" --query accessToken -o tsv`,
      { encoding: "utf-8", timeout: 15000 }
    ).trim();
    return token;
  } catch {
    return null;
  }
}

function getAdoConnectionBearer(token) {
  const authHandler = azdev.getBearerHandler(token);
  return new azdev.WebApi(ADO_ORG, authHandler);
}

// --- ADO client ---
function getAdoConnection(pat) {
  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  return new azdev.WebApi(ADO_ORG, authHandler);
}

async function getPullRequest(conn, prId) {
  const gitApi = await conn.getGitApi();
  return gitApi.getPullRequestById(prId);
}

// The PR object carries the authoritative repository (getPullRequestById is a
// global lookup). Re-point ADO_REPO/ADO_PROJECT at its stable GUIDs so every
// downstream call targets the real repo, even if the user never passed --repo
// (it would otherwise default to the project name) or passed URL-encoded names.
function applyRepoContextFromPR(pr) {
  const ctx = deriveRepoContext(pr, { repo: ADO_REPO, project: ADO_PROJECT });
  if (ctx.source === "pr") {
    ADO_REPO = ctx.repo;
    ADO_PROJECT = ctx.project;
  }
  return ctx;
}

async function getFileContent(conn, filePath, branch) {
  const gitApi = await conn.getGitApi();
  const versionDesc = branch.replace("refs/heads/", "");
  const item = await gitApi.getItemContent(
    ADO_REPO,
    filePath,
    ADO_PROJECT,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { version: versionDesc, versionType: 0 }
  );
  const chunks = [];
  for await (const chunk of item) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function getPRChangedFiles(conn, prId) {
  const gitApi = await conn.getGitApi();
  const iterations = await gitApi.getPullRequestIterations(ADO_REPO, prId, ADO_PROJECT);
  if (!iterations || iterations.length === 0) return { mdFiles: [], otherFiles: [] };
  const lastIteration = iterations[iterations.length - 1];
  const changes = await gitApi.getPullRequestIterationChanges(
    ADO_REPO, prId, lastIteration.id, ADO_PROJECT
  );
  const entries = (changes.changeEntries || []).filter(
    (c) => c.item?.path && !c.item.isFolder && c.changeType !== 16 // 16 = delete
  );
  const mdFiles = entries
    .filter((c) => c.item.path.toLowerCase().endsWith(".md"))
    .map((c) => ({ path: c.item.path, changeType: c.changeType }));
  const otherFiles = entries
    .filter((c) => !c.item.path.toLowerCase().endsWith(".md"))
    .map((c) => ({ path: c.item.path, ext: extOf(c.item.path) }));
  return { mdFiles, otherFiles };
}

async function getSpecFiles(conn, branch) {
  const gitApi = await conn.getGitApi();
  const versionDesc = branch.replace("refs/heads/", "");
  const items = await gitApi.getItems(
    ADO_REPO,
    ADO_PROJECT,
    "/",
    1, // full recursion
    true,
    undefined,
    undefined,
    undefined,
    { version: versionDesc, versionType: 0 }
  );
  return items
    .filter((i) => i.path?.endsWith(".md") && !i.isFolder)
    .map((i) => i.path);
}

async function getCommentThreads(conn, prId) {
  const gitApi = await conn.getGitApi();
  return gitApi.getThreads(ADO_REPO, prId, ADO_PROJECT);
}

async function createCommentThread(conn, prId, filePath, line, content) {
  const gitApi = await conn.getGitApi();
  const thread = {
    comments: [{ content, commentType: 1 }],
    status: 1, // active
    threadContext: {
      filePath,
      rightFileStart: { line, offset: 1 },
      rightFileEnd: { line, offset: 1 },
    },
  };
  return gitApi.createThread(thread, ADO_REPO, prId, ADO_PROJECT);
}

async function replyToThread(conn, prId, threadId, content) {
  const gitApi = await conn.getGitApi();
  const comment = { content, commentType: 1 };
  return gitApi.createComment(comment, ADO_REPO, prId, threadId, ADO_PROJECT);
}

async function resolveThread(conn, prId, threadId) {
  const gitApi = await conn.getGitApi();
  return gitApi.updateThread({ status: 2 }, ADO_REPO, prId, threadId, ADO_PROJECT);
}

// Durable "viewed" state: ADO comment-thread properties are NOT updatable
// ("Comment thread properties cannot be updated"), so per-thread viewed markers
// live in a single PULL-REQUEST property (tippani.viewed = JSON map
// { threadId: lastViewedCommentId }). PR properties ARE updatable via a
// dedicated API, so this is durable + shared in ADO (not a machine-local file).
// A newer comment id makes a thread resurface as unread.
const VIEWED_PR_PROP = "tippani.viewed";
async function getViewedMap(conn, prId) {
  try {
    const gitApi = await conn.getGitApi();
    const props = await gitApi.getPullRequestProperties(ADO_REPO, prId, ADO_PROJECT);
    const raw = props?.value?.[VIEWED_PR_PROP]?.$value ?? props?.[VIEWED_PR_PROP]?.$value ?? null;
    const m = raw ? JSON.parse(raw) : {};
    return (m && typeof m === "object") ? m : {};
  } catch { return {}; }
}
async function setViewedMap(conn, prId, map) {
  const gitApi = await conn.getGitApi();
  const patch = [{ op: "add", path: "/" + VIEWED_PR_PROP, value: JSON.stringify(map) }];
  return gitApi.updatePullRequestProperties(
    { "Content-Type": "application/json-patch+json" }, patch, ADO_REPO, prId, ADO_PROJECT);
}

// Current tip commit (objectId) of a branch ref like "refs/heads/feature/x".
async function getBranchTip(conn, branchRef) {
  const gitApi = await conn.getGitApi();
  const shortBranch = branchRef.replace("refs/heads/", "");
  const refs = await gitApi.getRefs(ADO_REPO, ADO_PROJECT, `heads/${shortBranch}`);
  const ref = (refs || []).find((r) => r.name === branchRef);
  if (!ref) throw new Error(`Branch ref not found: ${branchRef}`);
  return ref.objectId;
}

// Commit an edited file to a branch via the ADO push API. expectedOldObjectId, when
// provided, is used as the push's oldObjectId (optimistic concurrency — the conflict
// guard in #49 passes the load-time SHA); otherwise the live tip is used.
async function pushFileToBranch(conn, branchRef, filePath, content, message, expectedOldObjectId) {
  const gitApi = await conn.getGitApi();
  const oldObjectId = expectedOldObjectId || (await getBranchTip(conn, branchRef));
  const push = {
    refUpdates: [{ name: branchRef, oldObjectId }],
    commits: [
      {
        comment: message,
        changes: [
          {
            changeType: 2, // VersionControlChangeType.Edit
            item: { path: filePath },
            newContent: { content, contentType: 0 }, // ItemContentType.RawText
          },
        ],
      },
    ],
  };
  const result = await gitApi.createPush(push, ADO_REPO, ADO_PROJECT);
  return result?.commits?.[0]?.commitId || result?.refUpdates?.[0]?.newObjectId || null;
}

// ADO security namespace + permission bit for Git "Contribute" (push) access.
const GIT_SECURITY_NAMESPACE = "2e9eb7ed-3c0a-47d4-87c1-0ffdd275fd87";
const GIT_PERMISSION_GENERIC_CONTRIBUTE = 4;

// Whether the Edit affordance should be offered, gating push access. Decided without a
// network call when it can be: a non-active PR is never editable; offline is allowed
// (edits queue and sync on reconnect, per #48); online-but-unauthenticated can't push.
// If the installed ADO SDK exposes a generic security namespace API, probe ADO for
// GenericContribute at the repository level. azure-devops-node-api@15 does not expose
// that API, so those builds fall through as indeterminate (fail open) and the save path
// surfaces any real rejection. Probe errors also fail open. See decideCanEdit
// (canedit.js) for the gate.
async function computeCanEdit(conn, pr, isOffline) {
  if (isOffline || !conn || pr?.status !== 1) {
    return decideCanEdit({ isOffline, hasConn: !!conn, prStatus: pr?.status, probe: null });
  }
  const projectId = pr?.repository?.project?.id;
  const repoId = pr?.repository?.id;
  let probe = null; // indeterminate => fail open
  if (projectId && repoId) {
    try {
      if (typeof conn.getSecurityApi !== "function") {
        return decideCanEdit({ isOffline, hasConn: true, prStatus: pr.status, probe: null });
      }
      const securityApi = await conn.getSecurityApi();
      const results = await securityApi.hasPermissions(
        GIT_SECURITY_NAMESPACE,
        GIT_PERMISSION_GENERIC_CONTRIBUTE,
        `repoV2/${projectId}/${repoId}`
      );
      probe = Array.isArray(results) ? results[0] === true : results === true;
    } catch (e) {
      console.log("  ⚠ Could not verify push permission; Edit left enabled. (" + e.message + ")");
      probe = null;
    }
  }
  return decideCanEdit({ isOffline, hasConn: true, prStatus: pr.status, probe });
}

// --- Markdown rendering ---
// Spec content schema: allow headings with ids (for TOC) but strip scripts/iframes
const specSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    h1: [...(defaultSchema.attributes?.h1 || []), "id"],
    h2: [...(defaultSchema.attributes?.h2 || []), "id"],
    h3: [...(defaultSchema.attributes?.h3 || []), "id"],
    h4: [...(defaultSchema.attributes?.h4 || []), "id"],
    h5: [...(defaultSchema.attributes?.h5 || []), "id"],
    h6: [...(defaultSchema.attributes?.h6 || []), "id"],
    a: [...(defaultSchema.attributes?.a || []), "id"],
  },
};

async function renderMarkdown(content) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, specSanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeStringify)
    .process(content);
  return String(result);
}

// --- Spec-edit diff (GitHub-style) ---------------------------------------
// Split markdown into blocks separated by blank lines, tracking 1-based line
// ranges so a hunk can be mapped back to a rendered block via the source map.
function splitMdBlocks(md) {
  const lines = (md || "").split("\n");
  const blocks = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") { if (cur) { blocks.push(cur); cur = null; } continue; }
    if (!cur) cur = { text: lines[i], startLine: i + 1, endLine: i + 1 };
    else { cur.text += "\n" + lines[i]; cur.endLine = i + 1; }
  }
  if (cur) blocks.push(cur);
  return blocks;
}

// LCS block diff → ordered ops (same/del/add), matching blocks by exact text.
function diffMdBlocks(oldBlocks, newBlocks) {
  const n = oldBlocks.length, m = newBlocks.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = oldBlocks[i].text === newBlocks[j].text
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (oldBlocks[i].text === newBlocks[j].text) { ops.push({ type: "same", o: oldBlocks[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: "del", o: oldBlocks[i] }); i++; }
    else { ops.push({ type: "add", d: newBlocks[j] }); j++; }
  }
  while (i < n) { ops.push({ type: "del", o: oldBlocks[i] }); i++; }
  while (j < m) { ops.push({ type: "add", d: newBlocks[j] }); j++; }
  return ops;
}

// Compute GitHub-style change hunks between the original and the staged draft.
// Each hunk carries the original line range (to anchor it in the rendered doc)
// plus server-rendered HTML for the removed ("current") and added ("proposed")
// blocks. When a hunk is a single table on both sides, it is rendered as ONE
// merged table with per-row red/green so only the changed rows stand out.
function isTableBlock(text) {
  const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.length >= 2 && lines[0].startsWith("|") && /^\|?[\s:|-]+\|?$/.test(lines[1]) && lines[1].includes("-");
}
function tableRows(text) {
  return text.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|"));
}
function tableCells(rowLine) {
  let s = rowLine.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}
// LCS diff over an array of strings → ordered ops {type:'same'|'del'|'add', val}.
function lcsStringDiff(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ type: "same", val: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: "del", val: a[i] }); i++; }
    else { ops.push({ type: "add", val: b[j] }); j++; }
  }
  while (i < n) { ops.push({ type: "del", val: a[i] }); i++; }
  while (j < m) { ops.push({ type: "add", val: b[j] }); j++; }
  return ops;
}
async function renderCellHtml(md) {
  const h = await renderMarkdown(md || "");
  return h.replace(/^\s*<p>/, "").replace(/<\/p>\s*$/, "").trim();
}
// Render two markdown tables as ONE table with changed rows flagged del/add.
async function renderTableDiff(oldText, newText) {
  const oldRows = tableRows(oldText), newRows = tableRows(newText);
  const header = newRows[0] || oldRows[0];
  const headCells = tableCells(header);
  const cols = headCells.length;
  const ops = lcsStringDiff(oldRows.slice(2), newRows.slice(2)); // skip header + separator
  let html = '<table class="docdiff-table"><thead><tr>';
  for (const c of headCells) html += "<th>" + (await renderCellHtml(c)) + "</th>";
  html += "</tr></thead><tbody>";
  for (const op of ops) {
    const cls = op.type === "del" ? ' class="row-del"' : op.type === "add" ? ' class="row-add"' : "";
    const cells = tableCells(op.val);
    html += "<tr" + cls + ">";
    for (let k = 0; k < cols; k++) html += "<td>" + (await renderCellHtml(cells[k] || "")) + "</td>";
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}
async function computeSpecDiffHunks(originalBody, draftBody) {
  const ops = diffMdBlocks(splitMdBlocks(originalBody), splitMdBlocks(draftBody));
  const hunks = [];
  let idx = 0, lastSameEnd = 0;
  while (idx < ops.length) {
    if (ops[idx].type === "same") { lastSameEnd = ops[idx].o.endLine; idx++; continue; }
    const dels = [], adds = [];
    while (idx < ops.length && ops[idx].type !== "same") {
      if (ops[idx].type === "del") dels.push(ops[idx].o);
      else adds.push(ops[idx].d);
      idx++;
    }
    const oldText = dels.map((b) => b.text).join("\n\n");
    const newText = adds.map((b) => b.text).join("\n\n");
    const hunk = {
      startLine: dels.length ? dels[0].startLine : lastSameEnd,
      endLine: dels.length ? dels[dels.length - 1].endLine : lastSameEnd,
    };
    if (oldText && newText && isTableBlock(oldText) && isTableBlock(newText)) {
      hunk.mergedHtml = await renderTableDiff(oldText, newText);
    } else {
      hunk.oldHtml = oldText ? await renderMarkdown(oldText) : "";
      hunk.newHtml = newText ? await renderMarkdown(newText) : "";
    }
    hunks.push(hunk);
  }
  return hunks;
}

// Safe renderer for user-authored content (comments). Uses rehype-sanitize
// with the default schema, which:
//   - strips raw HTML (remark-rehype already does this by default)
//   - blocks javascript:, data:, vbscript: URLs in href/src
//   - allow-lists tag/attribute combinations
// The default schema is right for comments — no inline IDs, no autolinks,
// nothing the spec renderer's looser specSanitizeSchema needs.
async function renderMarkdownSafe(content) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(content);
  return String(result);
}

function stripFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, body: content };
  const metadata = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...vals] = line.split(":");
    if (key && vals.length) {
      metadata[key.trim()] = vals.join(":").trim().replace(/^["']|["']$/g, "");
    }
  });
  return { metadata, body: match[2] };
}

function buildSourceMap(content) {
  const lines = content.split("\n");
  const toc = [];
  const sourceMap = {};
  let pIdx = 0;
  let inPara = false;
  let paraStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hm = line.match(/^(#{1,6})\s+(.+)/);
    if (hm) {
      const text = hm[2].replace(/[*_`\[\]]/g, "");
      const id = text.toLowerCase().replace(/[^\w]+/g, "-").replace(/-$/, "");
      toc.push({ id, text, level: hm[1].length });
    }
    if (line.trim() === "") {
      if (inPara) {
        sourceMap[pIdx] = { startLine: paraStart + 1, endLine: i };
        pIdx++;
        inPara = false;
      }
    } else if (
      !inPara && !line.startsWith("#") && !line.startsWith("|") &&
      !line.startsWith("```") && !line.startsWith("-") && !line.startsWith("*")
    ) {
      inPara = true;
      paraStart = i;
    }
  }
  if (inPara) sourceMap[pIdx] = { startLine: paraStart + 1, endLine: lines.length };
  return { toc, sourceMap };
}

// --- Shared CSS variable system ---
function cssVariables() {
  return `
:root {
  color-scheme: light;
  --cp-bg: #f7f4ef;
  --cp-bg-elevated: #fcfbf8;
  --cp-surface: #ffffff;
  --cp-surface-soft: #f5f5f5;
  --cp-border: #dedede;
  --cp-border-strong: #919191;
  --cp-text: #242424;
  --cp-text-muted: #5c5c5c;
  --cp-text-soft: #6f6f6f;
  --cp-accent: #b11f4b;
  --cp-accent-hover: #9a1a41;
  --cp-accent-soft: rgba(177, 31, 75, 0.08);
  --cp-accent-fg: #ffffff;
  --cp-success: #16a34a;
  --cp-danger: #dc2626;
  --cp-warning: #f59e0b;
  --cp-link: #0078d4;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.12);
  --cp-overlay: rgba(255, 255, 255, 0.8);
  --cp-panel: rgba(255, 255, 255, 0.86);
  --cp-panel-strong: rgba(255, 255, 255, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.55);
  --cp-highlight: rgba(177, 31, 75, 0.12);
}
html[data-theme="dark"] {
  color-scheme: dark;
  --cp-bg: #3d3b3a;
  --cp-bg-elevated: #343231;
  --cp-surface: #292929;
  --cp-surface-soft: #2e2e2e;
  --cp-border: #474747;
  --cp-border-strong: #5f5f5f;
  --cp-text: #dedede;
  --cp-text-muted: #919191;
  --cp-text-soft: #b0b0b0;
  --cp-accent: #fd8ea1;
  --cp-accent-hover: #fb7b91;
  --cp-accent-soft: rgba(253, 142, 161, 0.14);
  --cp-accent-fg: #1a1a1a;
  --cp-success: #4ade80;
  --cp-danger: #f87171;
  --cp-warning: #fbbf24;
  --cp-link: #4da6ff;
  --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
  --cp-overlay: rgba(41, 41, 41, 0.88);
  --cp-panel: rgba(41, 41, 41, 0.72);
  --cp-panel-strong: rgba(41, 41, 41, 0.96);
  --cp-sheen: rgba(255, 255, 255, 0.04);
  --cp-highlight: rgba(253, 142, 161, 0.12);
}`;
}

function changeTypeBadge(changeType) {
  // ADO changeType: 1=add, 2=edit, 8=rename, etc.
  if (changeType === 1) return { label: "Added", color: "success" };
  return { label: "Modified", color: "accent" };
}

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function stripMarkdown(s) {
  return String(s)
    .replace(/^#{1,6}\s+/gm, "")       // headings
    .replace(/\*\*([^*]+)\*\*/g, "$1")  // bold
    .replace(/\*([^*]+)\*/g, "$1")      // italic
    .replace(/__([^_]+)__/g, "$1")      // bold alt
    .replace(/_([^_]+)_/g, "$1")        // italic alt
    .replace(/`([^`]+)`/g, "$1")        // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/^[-*]\s+/gm, "• ")        // list items
    .replace(/\n{2,}/g, " ")            // collapse newlines
    .replace(/\n/g, " ")
    .trim();
}

// --- File picker landing page ---
function buildPickerPage(pr, changedFiles, threads = []) {
  const prTitle = escHtml(pr.title || "Pull Request");
  const author = escHtml(pr.createdBy?.displayName || "Unknown");
  const prId = pr.pullRequestId;
  const descExcerpt = escHtml(stripMarkdown((pr.description || "").slice(0, 300)).slice(0, 200));
  const openThreadCount = (threads || []).filter(
    (t) => (t.comments?.length || 0) > 0 && !(t.status === 2 || t.status === 4)).length;

  const fileCardsHtml = changedFiles
    .map((f, i) => {
      const fileName = f.path.split("/").pop();
      const parentPath = f.path.split("/").slice(0, -1).join("/") + "/";
      const badge = changeTypeBadge(f.changeType);
      const badgeClass = badge.color === "success" ? "badge-success" : "badge-accent";
      return `<a href="/file/${i}" class="file-card">
        <div class="file-icon">📄</div>
        <div class="file-info">
          <div class="file-name">${escHtml(fileName)}</div>
          <div class="file-path">${escHtml(parentPath)}</div>
        </div>
        <span class="badge ${badgeClass}">${badge.label}</span>
      </a>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tippani — PR #${prId}</title>
<style>
${cssVariables()}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { height: 100%; }
body { font-family: "Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif; background: var(--cp-bg); color: var(--cp-text); min-height: 100%; display: flex; flex-direction: column; align-items: center; padding: 48px 24px; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: var(--cp-border-strong); border-radius: 3px; }
*:focus-visible { outline: 2px solid var(--cp-accent); outline-offset: 2px; border-radius: 4px; }

.brand-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
.logo { width: 32px; height: 32px; border-radius: 8px; background: var(--cp-accent); display: flex; align-items: center; justify-content: center; color: var(--cp-accent-fg); font-size: 12px; font-weight: 700; }
.brand-text { font-size: 15px; font-weight: 600; color: var(--cp-text); }
.brand-text-sub { font-size: 13px; font-weight: 400; color: var(--cp-text-muted); }

.container { width: 100%; max-width: 720px; }

.pr-card { background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: var(--cp-shadow); }
.pr-card h1 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
.pr-meta { font-size: 13px; color: var(--cp-text-muted); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pr-meta .pr-badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; background: var(--cp-accent-soft); color: var(--cp-accent); }
.pr-desc { margin-top: 12px; font-size: 13px; color: var(--cp-text-soft); line-height: 1.5; }

.section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--cp-text-muted); margin-bottom: 12px; }

.file-list { display: flex; flex-direction: column; gap: 6px; }

.file-card { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 12px; text-decoration: none; color: var(--cp-text); transition: all 0.15s; cursor: pointer; }
.file-card:hover { background: var(--cp-accent-soft); border-color: var(--cp-accent); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.file-icon { font-size: 22px; flex-shrink: 0; }
.file-info { flex: 1; min-width: 0; }
.file-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-path { font-size: 12px; color: var(--cp-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.badge-accent { background: var(--cp-accent-soft); color: var(--cp-accent); }
.badge-success { background: rgba(22,163,74,0.1); color: var(--cp-success); }

<\/style>
<script>
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';
<\/script>
</head>
<body>
  <div class="brand-bar">
    <div class="logo">FS</div>
    <span class="brand-text">Tippani</span><span class="brand-text-sub"> · read · annotate · edit</span>
  </div>
  <div class="container">
    <div class="pr-card">
      <h1>${prTitle}</h1>
      <div class="pr-meta">
        <span class="pr-badge">PR #${prId}</span>
        <span>by ${author}</span>
        <span>· ${changedFiles.length} file${changedFiles.length !== 1 ? "s" : ""} changed</span>
      </div>
      ${descExcerpt ? `<div class="pr-desc">${descExcerpt}</div>` : ""}
    </div>
    <div class="section-label">Feedback</div>
    <div class="file-list" style="margin-bottom: 24px;">
      <a href="/feedback" class="file-card">
        <div class="file-icon">💬</div>
        <div class="file-info">
          <div class="file-name">Review feedback</div>
          <div class="file-path">${openThreadCount} open thread${openThreadCount !== 1 ? "s" : ""} across this PR</div>
        </div>
        <span class="badge badge-accent">${openThreadCount}</span>
      </a>
    </div>
    <div class="section-label">Changed Files</div>
    <div class="file-list">
      ${fileCardsHtml}
    </div>
  </div>
</body>
</html>`;
}

// --- Cross-PR feedback triage page ---
// Lists every comment thread across the PR on one screen (no file drill-in),
// with a "waiting on" badge computed from the last commenter vs the PR author.
// Classify a thread for triage. Single source of truth shared by the Feedback
// page and the /api/v1/triage summary so chat counts match the page exactly.
// Precedence: Resolved (ADO) > Viewed (ack) > FYI (system) > needs-you > awaiting-reviewer.
function classifyThread(t, authorName, viewedMap = {}) {
  const comments = t.comments || [];
  const resolved = t.status === 2 || t.status === 4;
  const system = comments.length > 0 && comments.every((c) => c.commentType === 3);
  const last = comments[comments.length - 1];
  const lastBy = last?.author?.displayName || "Unknown";
  const lastId = comments.reduce((m, c) => Math.max(m, c.id || 0), 0);
  const viewedId = viewedMap[String(t.id)];
  const viewed = viewedId != null && Number(viewedId) === lastId;
  let waiting;
  if (resolved) waiting = "resolved";
  else if (viewed) waiting = "viewed";
  else if (system) waiting = "fyi";
  else if (lastBy !== authorName) waiting = "you";
  else waiting = "reviewer";
  return { resolved, system, lastBy, lastId, viewed, waiting };
}

function buildFeedbackPage(pr, threads, changedFiles, viewedMap = {}) {
  const prId = pr.pullRequestId;
  const prTitle = escHtml(pr.title || "Pull Request");
  const author = pr.createdBy?.displayName || "";
  const fileIndexOf = (path) => (changedFiles || []).findIndex((f) => f.path === path);

  const rows = (threads || [])
    .filter((t) => (t.comments?.length || 0) > 0)
    .map((t) => {
      const comments = t.comments || [];
      const file = t.threadContext?.filePath || null;
      const line = t.threadContext?.rightFileStart?.line || null;
      const last = comments[comments.length - 1];
      const { resolved, waiting, lastBy } = classifyThread(t, author, viewedMap);
      const gist = stripMarkdown((last?.content || "").replace(/\s+/g, " ")).slice(0, 180);
      const idx = file ? fileIndexOf(file) : -1;
      const anchor = file ? `${file.split("/").pop()}${line ? ":" + line : ""}` : "PR-level";
      return { id: t.id, resolved, lastBy, waiting, gist, idx, anchor, comments, count: comments.length };
    });

  const rank = (w) => (w === "you" ? 0 : w === "reviewer" ? 1 : w === "viewed" ? 2 : w === "fyi" ? 3 : 4);
  rows.sort((a, b) => rank(a.waiting) - rank(b.waiting) || (a.anchor > b.anchor ? 1 : a.anchor < b.anchor ? -1 : 0));

  const openCount = rows.filter((r) => !r.resolved && r.waiting !== "fyi").length;
  const needCount = rows.filter((r) => r.waiting === "you").length;

  const badgeFor = (w) =>
    w === "you" ? '<span class="fb-badge fb-need">Needs your reply</span>'
      : w === "reviewer" ? '<span class="fb-badge fb-wait">Awaiting reviewer</span>'
      : w === "viewed" ? '<span class="fb-badge fb-viewed">Viewed</span>'
      : w === "fyi" ? '<span class="fb-badge fb-fyi">For your information</span>'
      : '<span class="fb-badge fb-done">Resolved</span>';

  const commentHtml = (c) =>
    `<div class="fb-comment">
      <div class="fb-comment-meta"><span class="fb-comment-author">${escHtml(c.author?.displayName || "Unknown")}</span><span class="fb-comment-date">${c.publishedDate ? new Date(c.publishedDate).toLocaleDateString() : ""}</span></div>
      <div class="fb-comment-body">${c.renderedContent || escHtml(c.content || "")}</div>
    </div>`;

  const cardsHtml = rows.map((r) => {
    const threadHtml = (r.comments || []).map(commentHtml).join("");
    return `<div class="fb-card">
      <div class="fb-top"><span class="fb-anchor">${escHtml(r.anchor)}</span>${badgeFor(r.waiting)}<button type="button" class="fb-toggle" aria-expanded="false" onclick="toggleCard(this)">Expand</button></div>
      <div class="fb-gist">${escHtml(r.gist)}</div>
      <div class="fb-meta">last by ${escHtml(r.lastBy)} \u00b7 ${r.count} comment${r.count !== 1 ? "s" : ""}</div>
      <div class="fb-thread" hidden>
        ${threadHtml}
        <a class="fb-open" href="/goto/thread/${r.id}">Open thread &rarr;</a>
      </div>
    </div>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tippani — PR #${prId} — Feedback</title>
<style>
${cssVariables()}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { height: 100%; }
body { font-family: "Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif; background: var(--cp-bg); color: var(--cp-text); min-height: 100%; display: flex; flex-direction: column; align-items: center; padding: 48px 24px; }
.brand-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.logo { width: 32px; height: 32px; border-radius: 8px; background: var(--cp-accent); display: flex; align-items: center; justify-content: center; color: var(--cp-accent-fg); font-size: 12px; font-weight: 700; }
.brand-text { font-size: 15px; font-weight: 600; }
.brand-text-sub { font-size: 13px; font-weight: 400; color: var(--cp-text-muted); }
.container { width: 100%; max-width: 760px; }
.fb-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
.fb-head h1 { font-size: 19px; font-weight: 700; }
.back { font-size: 13px; color: var(--cp-accent); text-decoration: none; }
.fb-sub { font-size: 13px; color: var(--cp-text-muted); margin-bottom: 20px; }
.fb-list { display: flex; flex-direction: column; gap: 8px; }
.fb-card { display: block; padding: 14px 18px; background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 12px; text-decoration: none; color: var(--cp-text); transition: all 0.15s; }
.fb-card:hover { border-color: var(--cp-accent); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.fb-static { cursor: default; opacity: 0.85; }
.fb-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.fb-anchor { font-size: 13px; font-weight: 600; color: var(--cp-text-soft); }
.fb-badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.fb-need { background: rgba(220,38,38,0.12); color: #dc2626; }
.fb-wait { background: var(--cp-accent-soft); color: var(--cp-accent); }
.fb-viewed { background: var(--cp-border); color: var(--cp-text-muted); }
.fb-fyi { background: rgba(100,116,139,0.14); color: var(--cp-text-muted); }
.fb-done { background: rgba(22,163,74,0.1); color: var(--cp-success); }
.fb-gist { font-size: 13px; color: var(--cp-text); line-height: 1.45; }
.fb-meta { font-size: 12px; color: var(--cp-text-muted); margin-top: 6px; }
.fb-toggle { margin-left: auto; background: none; border: none; padding: 0; font-family: inherit; font-size: 12px; font-weight: 600; color: var(--cp-text-muted); cursor: pointer; white-space: nowrap; }
.fb-toggle:hover { text-decoration: underline; }
.fb-thread { margin-top: 12px; border-top: 1px solid var(--cp-border); padding-top: 12px; display: flex; flex-direction: column; gap: 12px; }
.fb-thread[hidden] { display: none; }
.fb-comment-meta { display: flex; gap: 8px; align-items: baseline; margin-bottom: 4px; }
.fb-comment-author { font-size: 12px; font-weight: 600; }
.fb-comment-date { font-size: 11px; color: var(--cp-text-muted); }
.fb-comment-body { font-size: 13px; line-height: 1.5; color: var(--cp-text); }
.fb-comment-body p { margin: 0 0 6px; }
.fb-comment-body p:last-child { margin-bottom: 0; }
.fb-open { align-self: flex-start; font-size: 12px; color: var(--cp-accent); text-decoration: none; font-weight: 600; }
.fb-empty { font-size: 14px; color: var(--cp-text-muted); padding: 24px; text-align: center; }
<\/style>
<script>
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';
  function toggleCard(btn) {
    const card = btn.closest('.fb-card');
    const body = card && card.querySelector('.fb-thread');
    if (!body) return;
    const willOpen = body.hasAttribute('hidden');
    if (willOpen) { body.removeAttribute('hidden'); btn.textContent = 'Collapse'; btn.setAttribute('aria-expanded', 'true'); }
    else { body.setAttribute('hidden', ''); btn.textContent = 'Expand'; btn.setAttribute('aria-expanded', 'false'); }
  }
<\/script>
</head>
<body>
  <div class="brand-bar">
    <div class="logo">FS</div>
    <span class="brand-text">Tippani</span><span class="brand-text-sub"> · feedback</span>
  </div>
  <div class="container">
    <div class="fb-head">
      <h1>Feedback — ${prTitle}</h1>
      <a class="back" href="/">← PR overview</a>
    </div>
    <div class="fb-sub">PR #${prId} · ${openCount} open thread${openCount !== 1 ? "s" : ""}${needCount ? ` · ${needCount} need${needCount !== 1 ? "" : "s"} your reply` : ""}</div>
    <div class="fb-list">
      ${cardsHtml || '<div class="fb-empty">No comment threads on this PR.</div>'}
    </div>
  </div>
</body>
</html>`;
}

// --- Single-thread view + reply page (PR-level threads) ---
function buildThreadPage(pr, thread, draft, isViewed = false) {
  const prId = pr.pullRequestId;
  const tid = thread.id;
  const file = thread.threadContext?.filePath || null;
  const line = thread.threadContext?.rightFileStart?.line || null;
  const anchor = file ? `${file.split("/").pop()}${line ? ":" + line : ""}` : "PR-level comment";
  const resolved = thread.status === 2 || thread.status === 4;
  const draftContent = (draft && draft.content) || "";

  const commentsHtml = (thread.comments || []).map((c) => {
    const who = escHtml(c.author?.displayName || "Unknown");
    const when = c.publishedDate ? escHtml(new Date(c.publishedDate).toLocaleString()) : "";
    const body = escHtml(c.content || "");
    return `<div class="tc">
      <div class="tc-head"><span class="tc-who">${who}</span><span class="tc-when">${when}</span></div>
      <div class="tc-body">${body}</div>
    </div>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tippani \u2014 PR #${prId} \u2014 Thread ${tid}</title>
<style>
${cssVariables()}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { height: 100%; }
body { font-family: "Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif; background: var(--cp-bg); color: var(--cp-text); min-height: 100%; display: flex; flex-direction: column; align-items: center; padding: 48px 24px; }
.brand-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.logo { width: 32px; height: 32px; border-radius: 8px; background: var(--cp-accent); display: flex; align-items: center; justify-content: center; color: var(--cp-accent-fg); font-size: 12px; font-weight: 700; }
.brand-text { font-size: 15px; font-weight: 600; }
.brand-text-sub { font-size: 13px; font-weight: 400; color: var(--cp-text-muted); }
.container { width: 100%; max-width: 720px; }
.th-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px; }
.th-head h1 { font-size: 18px; font-weight: 700; }
.back { font-size: 13px; color: var(--cp-accent); text-decoration: none; }
.th-sub { font-size: 13px; color: var(--cp-text-muted); margin-bottom: 18px; }
.tc { background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 12px; padding: 14px 18px; margin-bottom: 8px; }
.tc-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
.tc-who { font-size: 13px; font-weight: 600; }
.tc-when { font-size: 12px; color: var(--cp-text-muted); }
.tc-body { font-size: 13px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
.reply-wrap { margin-top: 18px; }
.reply-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--cp-text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.reply-hint { font-size: 12px; color: var(--cp-text-muted); margin-top: 6px; }
.draft-badge { display: none; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 600; background: var(--cp-accent-soft); color: var(--cp-accent); }
textarea { width: 100%; min-height: 120px; padding: 12px 14px; border: 1px solid var(--cp-border-strong); border-radius: 10px; background: var(--cp-surface); color: var(--cp-text); font-family: inherit; font-size: 13px; line-height: 1.5; resize: vertical; }
textarea:focus { outline: 2px solid var(--cp-accent); outline-offset: 1px; }
.actions { display: flex; gap: 10px; margin-top: 12px; }
.btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; border: 1px solid var(--cp-border-strong); background: var(--cp-surface); color: var(--cp-text); cursor: pointer; }
.btn-primary { background: var(--cp-accent); color: var(--cp-accent-fg); border-color: var(--cp-accent); }
.btn:disabled { opacity: 0.6; cursor: default; }
<\/style>
<script>
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';
<\/script>
</head>
<body>
  <div class="brand-bar">
    <div class="logo">FS</div>
    <span class="brand-text">Tippani</span><span class="brand-text-sub"> \u00b7 thread</span>
  </div>
  <div class="container">
    <div class="th-head">
      <h1>${escHtml(anchor)}</h1>
      <a class="back" href="/feedback">\u2190 Feedback</a>
    </div>
    <div class="th-sub">PR #${prId} \u00b7 thread ${tid}${resolved ? " \u00b7 resolved" : ""}${isViewed ? " \u00b7 viewed" : ""}</div>
    ${commentsHtml}
    <div class="reply-wrap">
      <div class="reply-label">Your reply <span class="draft-badge" id="draftBadge">staged by agent</span></div>
      <textarea id="reply" placeholder="Write a reply\u2026">${escHtml(draftContent)}</textarea>
      <div class="reply-hint">Posted replies appear above. Text here is a draft \u2014 nothing is sent until you press Post reply.</div>
      <div class="actions">
        <button class="btn btn-primary" id="postBtn">Post reply</button>
        <button class="btn" id="viewedBtn">${isViewed ? "Viewed \u2713" : "Mark viewed"}</button>
        <button class="btn" id="resolveBtn"${resolved ? " disabled" : ""}>${resolved ? "Resolved" : "Resolve"}</button>
        <button class="btn" id="clearBtn" style="display:${draftContent ? "inline-block" : "none"};">Discard draft</button>
      </div>
    </div>
  </div>
<script>
  const TID = ${tid};
  const box = document.getElementById('reply');
  const draftBadge = document.getElementById('draftBadge');
  const clearBtn = document.getElementById('clearBtn');
  let dirty = false;
  if (box.value) draftBadge.style.display = 'inline-block';
  box.addEventListener('input', () => { dirty = true; draftBadge.style.display = 'none'; if (clearBtn) clearBtn.style.display = 'none'; });
  async function post() {
    const content = box.value.trim();
    if (!content) return;
    const btn = document.getElementById('postBtn');
    btn.disabled = true; btn.textContent = 'Posting\u2026';
    try {
      const r = await fetch('/api/v1/threads/' + TID + '/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
      if (r.ok) { try { await fetch('/api/v1/threads/' + TID + '/draft', { method: 'DELETE' }); } catch {} location.reload(); }
      else { const e = await r.json().catch(() => ({})); alert('Post failed: ' + (e.error || r.status)); btn.disabled = false; btn.textContent = 'Post reply'; }
    } catch (e) { alert('Post failed: ' + e); btn.disabled = false; btn.textContent = 'Post reply'; }
  }
  async function clearDraft() {
    try { await fetch('/api/v1/threads/' + TID + '/draft', { method: 'DELETE' }); } catch {}
    box.value = ''; dirty = true; draftBadge.style.display = 'none'; if (clearBtn) clearBtn.style.display = 'none';
  }
  document.getElementById('postBtn').onclick = post;
  document.getElementById('clearBtn').onclick = clearDraft;
  async function act(path, verb) {
    try {
      const r = await fetch('/api/v1/threads/' + TID + path, { method: verb });
      if (r.ok) { location.href = '/feedback'; }
      else { const e = await r.json().catch(() => ({})); alert('Failed: ' + (e.error || r.status)); }
    } catch (e) { alert('Failed: ' + e); }
  }
  const vb = document.getElementById('viewedBtn'); if (vb) vb.onclick = () => act('/viewed', ${isViewed ? "'DELETE'" : "'POST'"});
  const rb = document.getElementById('resolveBtn'); if (rb && !rb.disabled) rb.onclick = () => act('/resolve', 'POST');
  async function poll() {
    try {
      const r = await fetch('/api/v1/threads/' + TID);
      if (r.ok) { const t = await r.json(); const c = t.draft && t.draft.content;
        if (c && !dirty && box.value !== c) { box.value = c; draftBadge.style.display = 'inline-block'; if (clearBtn) clearBtn.style.display = 'inline-block'; } }
    } catch {}
  }
  setInterval(poll, 1500);
<\/script>
</body>
</html>`;
}

// --- Spec review page (3-column layout) ---
function buildSpecPage(specHtml, toc, metadata, pr, threads, specPath, sourceMap, changedFiles, currentFileIndex, rawMarkdown, canEdit, baseObjectId, viewedMap = {}) {
  const tocHtml = toc
    .map(
      (t) =>
        `<a href="#${t.id}" class="toc-item" style="padding-left:${(t.level - 1) * 12 + 12}px" data-id="${t.id}">${escHtml(t.text)}</a>`
    )
    .join("\n");

  const prTitle = escHtml(metadata.title || pr.title || "Spec Review");
  const author = escHtml(pr.createdBy?.displayName || "Unknown");
  const prId = pr.pullRequestId;

  // Split threads: active (status 1=active, 0=unknown) vs resolved (status 2=fixed, 4=closed etc.)
  const allThreads = (threads || []).filter((t) => t.comments?.length > 0);
  const activeThreads = allThreads.filter((t) => t.status !== 2 && t.status !== 4);
  const resolvedThreads = allThreads.filter((t) => t.status === 2 || t.status === 4);

  function buildThreadHtml(t, isResolved) {
    const anchor = t.threadContext?.filePath
      ? t.threadContext.filePath.split("/").pop() + (t.threadContext.rightFileStart ? `:${t.threadContext.rightFileStart.line}` : "")
      : (t.comments?.[0]?.author?.displayName || "");
    const commentsHtml = t.comments
      .map(
        (c, i) =>
          `<div class="comment ${i > 0 ? "comment-reply" : ""}">
            <div class="comment-meta">
              <span class="comment-author">${escHtml(c.author?.displayName || "Unknown")}</span>
              <span class="comment-date">${new Date(c.publishedDate).toLocaleDateString()}</span>
            </div>
            <div class="comment-body">${c.renderedContent || escHtml(c.content || "")}</div>
          </div>`
      )
      .join("");
    const statusClass = isResolved ? "thread-resolved" : "thread-active";
    const lastId = (t.comments || []).reduce((m, c) => Math.max(m, c.id || 0), 0);
    const viewed = viewedMap[String(t.id)] != null && Number(viewedMap[String(t.id)]) === lastId;
    // If the last comment is mine (the PR author), I've obviously seen the thread —
    // "Mark viewed" is nonsense there.
    const lastComment = (t.comments || [])[t.comments.length - 1];
    const mineLast = !!(lastComment?.author?.displayName && pr.createdBy?.displayName
      && lastComment.author.displayName === pr.createdBy.displayName);
    // Status tag in the thread header. "Replied" = my comment is last (I responded);
    // "Viewed" = I explicitly acknowledged the latest comment.
    const tagStyle = "margin-left:6px;padding:1px 8px;border-radius:99px;font-size:10px;font-weight:600;background:var(--cp-border);color:var(--cp-text-muted);";
    const statusTag = isResolved
      ? ""
      : mineLast
        ? `<span style="${tagStyle}">Replied</span>`
        : viewed
          ? `<span style="${tagStyle}">Viewed</span>`
          : "";
    const actions = isResolved
      ? ``
      : `<div class="thread-actions">
          <button class="btn-thread-reply" onclick="openReply(${t.id})">Reply</button>
          ${(viewed || mineLast) ? "" : `<button class="btn-thread-reply" onclick="toggleViewed(${t.id}, false)">Mark viewed</button>`}
          <button class="btn-thread-resolve" onclick="resolveThread(${t.id})">✓ Resolve</button>
        </div>
        <form class="reply-form" data-thread-id="${t.id}" onsubmit="return false;">
          <textarea class="reply-textarea" rows="3" placeholder="Reply… (⌘/Ctrl+Enter to post and advance, Esc to cancel)"></textarea>
          <div class="reply-form-actions">
            <button type="button" class="reply-btn-post" onclick="submitReply(${t.id})">Post & next</button>
            <button type="button" class="reply-btn-cancel reply-btn-discard" style="display:none;" onclick="discardDraft(${t.id})">Discard draft</button>
            <button type="button" class="reply-btn-cancel reply-btn-close" onclick="closeReply(${t.id})">Cancel</button>
          </div>
        </form>`;
    return `<div class="comment-thread ${statusClass}" data-thread-id="${t.id}" data-thread-line="${t.threadContext?.rightFileStart?.line || ""}">
      ${(anchor || statusTag) ? `<div class="comment-anchor">${isResolved ? "✓ " : ""}${escHtml(anchor)}${statusTag}</div>` : ""}
      ${isResolved ? `<details><summary class="resolved-summary">${escHtml(t.comments[0]?.author?.displayName || "Comment")} — resolved</summary>` : ""}
      ${commentsHtml}
      ${actions}
      ${isResolved ? `</details>` : ""}
    </div>`;
  }

  const activeHtml = activeThreads.length === 0
    ? `<p class="empty-comments">No active comments. Click on a paragraph to start a review.</p>`
    : activeThreads.map(t => buildThreadHtml(t, false)).join("");
  const resolvedHtml = resolvedThreads.map(t => buildThreadHtml(t, true)).join("");
  const threadsHtml = activeHtml + (resolvedThreads.length > 0
    ? `<div class="sidebar-section-label" style="margin-top:16px;">Resolved (${resolvedThreads.length})</div>${resolvedHtml}`
    : "");

  // File navigation list for left sidebar
  const filesNavHtml = changedFiles
    .map((f, i) => {
      const name = f.path.split("/").pop();
      const active = i === currentFileIndex ? "file-nav-active" : "";
      return `<a href="/file/${i}" class="file-nav-item ${active}" title="${escHtml(f.path)}">${escHtml(name)}</a>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${prTitle} — Tippani</title>
<style>
${cssVariables()}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; overflow: hidden; }
body { font-family: "Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif; background: var(--cp-bg); color: var(--cp-text); font-size: 15px; line-height: 1.7; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: var(--cp-border-strong); border-radius: 3px; }
a { color: var(--cp-link); text-decoration: none; }
a:hover { text-decoration: underline; }
*:focus-visible { outline: 2px solid var(--cp-accent); outline-offset: 2px; border-radius: 4px; }
button:focus-visible { outline: 2px solid var(--cp-accent); outline-offset: 2px; }

/* Header */
.header { height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: var(--cp-surface); border-bottom: 1px solid var(--cp-border); flex-shrink: 0; z-index: 50; }
.header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.edit-toggle { font-family: inherit; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 6px; border: 1px solid var(--cp-border); background: var(--cp-bg); color: var(--cp-text); cursor: pointer; transition: background 0.12s, border-color 0.12s; }
.edit-toggle:hover { background: var(--cp-surface-soft); border-color: var(--cp-border-strong); }
.edit-pane-controls { display: none; align-items: center; gap: 4px; padding-right: 2px; border-right: 1px solid var(--cp-border); margin-right: 2px; }
.edit-pane-controls.visible { display: flex; }
.pane-toggle { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; padding: 0; border-radius: 6px; border: 1px solid var(--cp-border); background: var(--cp-bg); color: var(--cp-text-muted); cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 700; transition: background 0.12s, border-color 0.12s, color 0.12s; }
.pane-toggle:hover { background: var(--cp-surface-soft); border-color: var(--cp-border-strong); color: var(--cp-text); }
.pane-toggle.active { background: var(--cp-accent-soft); border-color: var(--cp-accent); color: var(--cp-accent); }
/* Edit-mode visual distinction on the center column */
.main-content.editing { box-shadow: inset 0 0 0 2px var(--cp-accent-soft); background: var(--cp-accent-soft); }
.main-content.editing #spec-editor { background: var(--cp-bg); }
/* --- Formatting toolbar (#55) --- */
.fmt-toolbar { display: flex; align-items: center; gap: 2px; padding: 4px 8px; background: var(--cp-surface, #fff); border-bottom: 1px solid var(--cp-border, #e0e0e0); position: sticky; top: 0; z-index: 10; flex-shrink: 0; flex-wrap: wrap; }
.fmt-group { display: inline-flex; align-items: center; gap: 2px; }
.fmt-sep { width: 1px; height: 20px; background: var(--cp-border, #e0e0e0); margin: 0 4px; }
.fmt-btn { font-family: inherit; font-size: 13px; line-height: 1; min-width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; border: 1px solid transparent; border-radius: 4px; background: transparent; color: var(--cp-text, #1a1a1a); cursor: pointer; transition: background 0.1s, border-color 0.1s; }
.fmt-btn:hover { background: var(--cp-surface-soft, #f5f5f5); border-color: var(--cp-border, #e0e0e0); }
.fmt-btn.active, .fmt-btn[aria-pressed="true"] { background: var(--cp-accent-soft, #e8f0fe); border-color: var(--cp-accent, #1a73e8); color: var(--cp-accent, #1a73e8); }
.fmt-btn code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; pointer-events: none; }
.fmt-heading-btn { font-weight: 600; min-width: 32px; }
.fmt-dropdown { position: absolute; top: 100%; left: 0; margin: 2px 0 0; padding: 4px 0; list-style: none; background: var(--cp-surface, #fff); border: 1px solid var(--cp-border, #e0e0e0); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); z-index: 30; min-width: 140px; }
.fmt-dropdown li { padding: 6px 12px; cursor: pointer; font-size: 13px; color: var(--cp-text, #1a1a1a); }
.fmt-dropdown li:hover { background: var(--cp-surface-soft, #f5f5f5); }
.fmt-dropdown li[aria-selected="true"] { font-weight: 600; color: var(--cp-accent, #1a73e8); }
.fmt-group { position: relative; }
/* Styled tooltip — replaces slow native title tooltip */
.fmt-btn { position: relative; }
.fmt-btn::after { content: attr(title); position: absolute; bottom: -30px; left: 50%; transform: translateX(-50%); padding: 3px 8px; font-size: 11px; font-weight: 500; white-space: nowrap; color: var(--cp-accent-fg, #fff); background: var(--cp-text, #1a1a1a); border-radius: 4px; pointer-events: none; opacity: 0; transition: opacity 0.12s; z-index: 40; }
.fmt-btn:hover::after { opacity: 1; }
.logo { width: 26px; height: 26px; border-radius: 6px; background: var(--cp-accent); display: flex; align-items: center; justify-content: center; color: var(--cp-accent-fg); font-size: 10px; font-weight: 700; flex-shrink: 0; }
.brand { font-size: 13px; font-weight: 600; color: var(--cp-text); flex-shrink: 0; }
.brand-sub { font-size: 11px; font-weight: 400; color: var(--cp-text-muted); flex-shrink: 0; white-space: nowrap; }
.hdr-sep { color: var(--cp-border); margin: 0 2px; }
.pr-info { min-width: 0; }
.pr-info h1 { font-size: 14px; font-weight: 600; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pr-meta { font-size: 11px; color: var(--cp-text-muted); margin-top: 1px; display: flex; align-items: center; gap: 4px; }
.comment-count-active { color: var(--cp-accent); font-weight: 600; }
.comment-count-resolved { color: var(--cp-success); font-weight: 500; }
.comment-count-badge { font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: 99px; background: var(--cp-accent-soft); color: var(--cp-accent); margin-left: 4px; }

/* Inline comment bubble on spec content */
.inline-bubble { position: absolute; right: -8px; top: 2px; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; cursor: pointer; z-index: 5; transition: transform 0.12s; border: none; font-family: inherit; }
.inline-bubble:hover { transform: scale(1.2); }
.inline-bubble-active { background: var(--cp-accent); color: var(--cp-accent-fg); }
.inline-bubble-resolved { background: var(--cp-success); color: #fff; }

/* Comment modal context */
.comment-context { font-size: 12px; color: var(--cp-text-muted); margin-bottom: 8px; }

/* 3-column layout */
.layout { display: flex; flex: 1; min-height: 0; }

/* Resize handles */
.resize-handle { width: 5px; flex-shrink: 0; cursor: col-resize; background: transparent; position: relative; z-index: 10; transition: background 0.15s; }
.resize-handle:hover, .resize-handle.dragging { background: var(--cp-accent-soft); }
.resize-handle::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 3px; height: 32px; border-radius: 2px; background: var(--cp-border-strong); opacity: 0; transition: opacity 0.15s; }
.resize-handle:hover::after, .resize-handle.dragging::after { opacity: 1; }
body.col-resizing { cursor: col-resize !important; user-select: none !important; }
body.col-resizing * { cursor: col-resize !important; user-select: none !important; }

/* Left sidebar */
.sidebar-left { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid var(--cp-border); background: var(--cp-bg-elevated); overflow: hidden; }
.sidebar-left-scroll { flex: 1; overflow-y: auto; padding: 16px; }
.layout.edit-mode.left-collapsed .sidebar-left { width: 42px !important; align-items: center; }
.layout.edit-mode.left-collapsed .sidebar-left-scroll { display: none; }
.layout.edit-mode.left-collapsed .sidebar-left::before { content: 'TOC'; writing-mode: vertical-rl; text-orientation: mixed; margin-top: 16px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--cp-text-muted); }
.layout.edit-mode.left-collapsed #resizeLeft { display: none; }
.sidebar-section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--cp-text-muted); margin-bottom: 8px; margin-top: 16px; }
.sidebar-section-label:first-child { margin-top: 0; }

.toc-item { display: block; font-size: 13px; padding: 4px 8px; border-left: 2px solid transparent; color: var(--cp-text-muted); text-decoration: none; transition: all 0.12s; border-radius: 0 4px 4px 0; }
.toc-item:hover { color: var(--cp-text); background: var(--cp-accent-soft); text-decoration: none; }
.toc-item.active { color: var(--cp-accent); border-left-color: var(--cp-accent); font-weight: 600; }

.file-nav-item { display: block; font-size: 12px; padding: 5px 8px; color: var(--cp-text-muted); text-decoration: none; border-radius: 6px; transition: all 0.12s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-nav-item:hover { background: var(--cp-accent-soft); color: var(--cp-text); text-decoration: none; }
.file-nav-active { background: var(--cp-highlight); color: var(--cp-accent); font-weight: 600; }

/* Main content */
.main-content { flex: 1; min-width: 0; overflow-y: auto; padding: 32px 40px; background: var(--cp-bg); }
.spec { background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 16px; padding: 40px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); max-width: 820px; margin: 0 auto; }
.spec h1 { font-size: 28px; font-weight: 700; margin: 1.5rem 0 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--cp-border); color: var(--cp-text); }
.spec h1 a, .spec h2 a, .spec h3 a, .spec h4 a { color: inherit; text-decoration: none; }
.spec h1 a:hover, .spec h2 a:hover, .spec h3 a:hover { text-decoration: none; opacity: 0.8; }
.spec h2 { font-size: 20px; font-weight: 700; margin: 1.8rem 0 0.6rem; padding-bottom: 6px; border-bottom: 1px solid var(--cp-border); color: var(--cp-text); }
.spec h3 { font-size: 16px; font-weight: 600; margin: 1.4rem 0 0.4rem; color: var(--cp-text); }
.spec p { margin-bottom: 0.75rem; line-height: 1.7; position: relative; border-radius: 6px; padding: 2px 6px; margin-left: -6px; transition: background 0.12s; }

/* Commentable element hover */
.spec .commentable { cursor: pointer; position: relative; }
.spec .commentable:hover { background: var(--cp-accent-soft); border-radius: 6px; }
.spec .commentable .comment-btn { position: absolute; left: -36px; top: 6px; width: 24px; height: 24px; border-radius: 6px; background: var(--cp-accent); color: var(--cp-accent-fg); border: none; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.12s; line-height: 1; z-index: 5; }
.spec .commentable:hover .comment-btn { opacity: 1; }
.spec .commentable .comment-btn:hover { background: var(--cp-accent-hover); }

.spec table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
.spec th { background: var(--cp-surface-soft); padding: 8px 12px; text-align: left; font-weight: 600; border: 1px solid var(--cp-border); }
.spec td { padding: 8px 12px; border: 1px solid var(--cp-border); }
.spec tr:nth-child(even) td { background: var(--cp-surface-soft); }
.spec code { background: var(--cp-surface-soft); padding: 1px 5px; border-radius: 4px; font-family: Consolas, "Courier New", monospace; font-size: 13px; border: 1px solid var(--cp-border); }
.spec pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 10px; overflow-x: auto; margin: 1rem 0; }
.spec pre code { background: none; padding: 0; color: inherit; border: none; font-size: 13px; }
.spec ul, .spec ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
.spec li { margin-bottom: 0.2rem; line-height: 1.6; }
.spec strong { font-weight: 600; }
.spec blockquote { border-left: 3px solid var(--cp-accent); padding-left: 1rem; margin: 1rem 0; color: var(--cp-text-soft); }
.spec img { max-width: 100%; border-radius: 8px; }

/* Right sidebar — comments */
.sidebar-right { width: 320px; flex-shrink: 0; border-left: 1px solid var(--cp-border); background: var(--cp-bg-elevated); overflow-y: auto; padding: 16px; }
.layout.edit-mode.right-collapsed .sidebar-right { width: 42px !important; padding: 0; display: flex; align-items: center; justify-content: flex-start; overflow: hidden; }
.layout.edit-mode.right-collapsed .sidebar-right > * { display: none; }
.layout.edit-mode.right-collapsed .sidebar-right::before { content: 'Comments'; writing-mode: vertical-rl; text-orientation: mixed; margin-top: 16px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: var(--cp-text-muted); }
.layout.edit-mode.right-collapsed #resizeRight { display: none; }
.empty-comments { font-size: 13px; color: var(--cp-text-muted); font-style: italic; padding: 12px 0; }
.comment-thread { background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 16px; padding: 16px; margin-bottom: 10px; font-size: 13px; transition: box-shadow 0.15s; overflow: hidden; min-width: 0; }
.comment-thread:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.thread-active { border-left: 3px solid var(--cp-accent); }
.thread-resolved { border-left: 3px solid var(--cp-success); opacity: 0.7; }
.thread-resolved:hover { opacity: 1; }
.thread-resolved .comment-anchor { color: var(--cp-success); }
.resolved-summary { font-size: 12px; color: var(--cp-success); font-weight: 500; cursor: pointer; list-style: none; }
.resolved-summary::-webkit-details-marker { display: none; }
.resolved-summary::before { content: '▸ '; }
details[open] .resolved-summary::before { content: '▾ '; }
.comment-anchor { font-size: 11px; color: var(--cp-accent); margin-bottom: 8px; font-weight: 500; }
.comment-reply { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--cp-border); }
.comment-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
.comment-author { font-weight: 600; font-size: 12px; color: var(--cp-text); }
.comment-date { font-size: 11px; color: var(--cp-text-muted); }
.comment-body { line-height: 1.5; color: var(--cp-text); overflow-wrap: break-word; word-break: break-word; overflow-x: auto; max-width: 100%; }
.comment-body pre, .comment-body code { white-space: pre-wrap; word-break: break-all; font-size: 11px; font-family: Consolas, "Courier New", monospace; }
.comment-body pre { background: var(--cp-surface-soft); border: 1px solid var(--cp-border); border-radius: 6px; padding: 8px; margin: 6px 0; max-width: 100%; overflow-x: auto; }
.comment-body code { background: var(--cp-surface-soft); padding: 1px 4px; border-radius: 3px; }
.comment-body table { font-size: 11px; border-collapse: collapse; margin: 6px 0; }
.comment-body td, .comment-body th { padding: 4px 6px; border: 1px solid var(--cp-border); white-space: nowrap; }
.comment-body a { color: var(--cp-link); word-break: break-all; }
.comment-body img { max-width: 100%; }
.thread-actions { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--cp-border); display: flex; gap: 10px; }
.btn-thread-reply { background: none; border: none; font-size: 12px; cursor: pointer; padding: 0; color: var(--cp-text-muted); font-weight: 500; transition: color 0.12s; }
.btn-thread-reply:hover { color: var(--cp-accent); }
.btn-thread-resolve { background: none; border: 1px solid var(--cp-success); color: var(--cp-success); font-size: 12px; cursor: pointer; padding: 2px 10px; border-radius: 6px; font-weight: 500; transition: all 0.12s; }
.btn-thread-resolve:hover { background: var(--cp-success); color: #fff; }

/* Inline reply form (Phase 0: keyboard nav, #42) */
.reply-form { display: none; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--cp-border); }
.reply-form.open { display: block; }
.reply-textarea { width: 100%; box-sizing: border-box; font-family: inherit; font-size: 13px; padding: 8px; border: 1px solid var(--cp-border); border-radius: 6px; background: var(--cp-surface-soft); color: var(--cp-text); resize: vertical; min-height: 64px; }
.reply-textarea:focus { outline: none; border-color: var(--cp-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--cp-accent) 25%, transparent); }
.reply-form-actions { display: flex; gap: 8px; margin-top: 8px; }
.reply-btn-post { background: var(--cp-accent); color: #fff; border: none; font-size: 12px; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.reply-btn-post:hover { opacity: 0.9; }
.reply-btn-cancel { background: none; border: 1px solid var(--cp-border); color: var(--cp-text-muted); font-size: 12px; padding: 5px 12px; border-radius: 6px; cursor: pointer; }
.reply-btn-cancel:hover { color: var(--cp-text); }
.reply-external-badge { font-size: 11px; color: var(--cp-accent); background: color-mix(in srgb, var(--cp-accent) 12%, transparent); border: 1px solid color-mix(in srgb, var(--cp-accent) 30%, transparent); border-radius: 6px; padding: 4px 8px; margin-bottom: 6px; }
.comment-thread.thread-focused { box-shadow: 0 0 0 2px var(--cp-accent); }
.kbd-hint { font-size: 11px; color: var(--cp-text-muted); padding: 6px 12px; border-top: 1px solid var(--cp-border); background: var(--cp-surface-soft); }
.kbd-hint kbd { background: var(--cp-surface); border: 1px solid var(--cp-border); border-bottom-width: 2px; border-radius: 3px; padding: 0 4px; font-family: ui-monospace, monospace; font-size: 10px; }

/* Bottom review bar */
.review-bar { height: 64px; display: flex; align-items: center; justify-content: center; gap: 12px; background: var(--cp-panel-strong); backdrop-filter: blur(16px); border-top: 1px solid var(--cp-border); flex-shrink: 0; z-index: 50; }
.review-btn { padding: 10px 28px; font-size: 14px; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.review-btn-approve { background: var(--cp-success); color: #fff; }
.review-btn-approve:hover { opacity: 0.9; }
.review-btn-changes { background: transparent; color: var(--cp-danger); border: 1.5px solid var(--cp-danger); }
.review-btn-changes:hover { background: var(--cp-danger); color: #fff; }

/* Sync status bar */
.sync-bar { display: none; height: 36px; align-items: center; justify-content: center; gap: 10px; background: var(--cp-surface-soft); border-top: 1px solid var(--cp-border); font-size: 12px; color: var(--cp-text-muted); flex-shrink: 0; }
.sync-bar.has-pending { display: flex; }
.sync-bar.offline { background: var(--cp-highlight); }
.sync-status { font-weight: 500; }
.sync-status .count { color: var(--cp-accent); font-weight: 700; }
.sync-btn { padding: 4px 14px; font-size: 12px; font-weight: 600; border-radius: 6px; border: 1px solid var(--cp-accent); background: transparent; color: var(--cp-accent); cursor: pointer; font-family: inherit; transition: all 0.12s; }
.sync-btn:hover { background: var(--cp-accent); color: var(--cp-accent-fg); }
.sync-btn.syncing { opacity: 0.5; pointer-events: none; }

/* Comment input modal */
.comment-modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--cp-overlay); z-index: 100; justify-content: center; align-items: center; }
.comment-modal.active { display: flex; }
.comment-modal-inner { background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 16px; padding: 20px; width: 400px; box-shadow: var(--cp-shadow); }
.comment-modal-inner h3 { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.comment-modal textarea { width: 100%; border: 1px solid var(--cp-border); border-radius: 8px; padding: 10px; font-size: 13px; resize: none; font-family: inherit; background: var(--cp-surface-soft); color: var(--cp-text); }
.comment-modal textarea:focus { outline: none; border-color: var(--cp-accent); }
.comment-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.modal-btn { padding: 7px 18px; font-size: 13px; font-weight: 500; border-radius: 8px; border: 1px solid var(--cp-border); cursor: pointer; font-family: inherit; background: var(--cp-surface); color: var(--cp-text); }
.modal-btn-primary { background: var(--cp-accent); color: var(--cp-accent-fg); border-color: var(--cp-accent); }
.modal-btn-primary:hover { background: var(--cp-accent-hover); }

/* Diff-on-save preview (#46) */
.diff-modal-inner { background: var(--cp-surface); border: 1px solid var(--cp-border); border-radius: 16px; padding: 20px; width: min(720px, 90vw); box-shadow: var(--cp-shadow); display: flex; flex-direction: column; max-height: 80vh; }
.diff-modal-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.diff-modal-head h3 { font-size: 14px; font-weight: 600; }
.diff-stats { font-size: 12px; font-weight: 600; color: var(--cp-text-muted); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.diff-body { flex: 1; overflow: auto; border: 1px solid var(--cp-border); border-radius: 8px; background: var(--cp-bg); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; line-height: 1.5; }
.diff-line { display: flex; white-space: pre-wrap; word-break: break-word; }
.diff-gutter { flex: 0 0 22px; text-align: center; user-select: none; color: var(--cp-text-muted); }
.diff-text { flex: 1; padding-right: 8px; }
.diff-add { background: color-mix(in srgb, var(--cp-success) 14%, transparent); }
.diff-add .diff-gutter { color: var(--cp-success); }
.diff-del { background: color-mix(in srgb, #d93f0b 14%, transparent); }
.diff-del .diff-gutter { color: #d93f0b; }
.diff-empty { padding: 24px; text-align: center; color: var(--cp-text-muted); }
/* Spec-edit diff overlay (GitHub-style current/proposed boxes + right gutter marker) */
.docdiff-hidden { display: none !important; }
.docdiff-widget { position: relative; margin: 6px 0 16px; }
.docdiff-widget::after { content: ''; position: absolute; top: 2px; bottom: 2px; right: -18px; width: 4px; border-radius: 2px; background: var(--cp-text-muted); opacity: .45; }
.docdiff-widget.docdiff-active::after { background: var(--cp-accent); opacity: 1; }
.proposal-source { font-size: 12px; color: var(--cp-text-muted); align-self: center; margin-right: 2px; white-space: nowrap; }
.docdiff-box { border-radius: 8px; border: 1px solid; padding: 4px 14px 8px; }
.docdiff-box > :first-child { margin-top: 6px; }
.docdiff-box::before { display: block; font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; margin: 6px 0 2px; }
.docdiff-old { background: color-mix(in srgb, #d93f0b 12%, transparent); border-color: color-mix(in srgb, #d93f0b 34%, transparent); }
.docdiff-old::before { content: 'Current'; color: #d93f0b; }
.docdiff-new { background: color-mix(in srgb, var(--cp-success) 12%, transparent); border-color: color-mix(in srgb, var(--cp-success) 34%, transparent); margin-top: 6px; }
.docdiff-new::before { content: 'Proposed'; color: var(--cp-success); }
.docdiff-merged { padding: 0 0 0 22px; border: none; background: transparent; overflow: visible; }
.docdiff-merged::before { display: none; }
.docdiff-table { border-collapse: collapse; width: 100%; font-size: 13px; }
.docdiff-table th, .docdiff-table td { border: 1px solid var(--cp-border); padding: 6px 10px; text-align: left; vertical-align: top; background: transparent; }
.docdiff-table tr.row-del > td { background: color-mix(in srgb, #d93f0b 14%, transparent); }
.docdiff-table tr.row-add > td { background: color-mix(in srgb, var(--cp-success) 16%, transparent); }
.docdiff-table tr.row-del > td:first-child, .docdiff-table tr.row-add > td:first-child { position: relative; }
.docdiff-table tr.row-del > td:first-child::before { content: '−'; position: absolute; left: -20px; color: #d93f0b; font-weight: 700; }
.docdiff-table tr.row-add > td:first-child::before { content: '+'; position: absolute; left: -20px; color: var(--cp-success); font-weight: 700; }
.diff-msg-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
.diff-msg-row label { font-size: 12px; font-weight: 600; color: var(--cp-text-muted); white-space: nowrap; }
.diff-msg-row input { flex: 1; font-family: inherit; font-size: 13px; padding: 7px 10px; border-radius: 8px; border: 1px solid var(--cp-border); background: var(--cp-bg); color: var(--cp-text); }
.save-btn { background: var(--cp-accent); color: var(--cp-accent-fg); border-color: var(--cp-accent); }
.save-btn:hover:not(:disabled) { background: var(--cp-accent-hover); }
.save-btn:disabled { opacity: 0.5; cursor: default; }
.dirty-dot { color: var(--cp-accent); font-size: 12px; line-height: 1; margin-right: 2px; }
.conflict-msg { font-size: 13px; line-height: 1.55; color: var(--cp-text); margin-bottom: 6px; }

/* Toast */
.toast { position: fixed; bottom: 80px; right: 24px; background: var(--cp-surface); color: var(--cp-text); padding: 10px 18px; border-radius: 10px; font-size: 13px; display: none; z-index: 200; border: 1px solid var(--cp-border); box-shadow: var(--cp-shadow); }
.toast.show { display: block; }
<\/style>
<script>
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.dataset.theme = 'dark';
<\/script>
</head>
<body style="display:flex;flex-direction:column;">

<div class="header">
  <div class="header-left">
    <a href="/" style="text-decoration:none;display:flex;align-items:center;gap:10px;">
      <div class="logo">FS</div>
      <span class="brand">Tippani</span><span class="brand-sub"> · read · annotate · edit</span>
    </a>
    <span class="hdr-sep">|</span>
    <div class="pr-info">
      <h1>${prTitle}</h1>
      <div class="pr-meta">PR #${prId} by ${author}
        <span class="hdr-sep">·</span>
        <span class="comment-count-active">${activeThreads.length} active</span>
        ${resolvedThreads.length > 0 ? `<span class="comment-count-resolved">· ${resolvedThreads.length} resolved</span>` : ""}
      </div>
    </div>
  </div>
  <div class="header-right">
    <span class="dirty-dot" id="dirtyDot" style="display:none" title="Unsaved changes">●</span>
    ${canEdit ? `<div class="edit-pane-controls" id="editPaneControls" aria-label="Edit layout controls">
      <button class="pane-toggle" id="toggleTocPane" onclick="tippani.togglePane('left')" title="Minimize contents pane" aria-label="Minimize contents pane" aria-pressed="false">T</button>
      <button class="pane-toggle" id="toggleCommentsPane" onclick="tippani.togglePane('right')" title="Minimize comments pane" aria-label="Minimize comments pane" aria-pressed="false">C</button>
      <button class="pane-toggle" id="focusEditPane" onclick="tippani.toggleFocusEdit()" title="Focus editor" aria-label="Focus editor" aria-pressed="false">F</button>
    </div>` : ""}
    ${canEdit ? `<button class="edit-toggle save-btn" id="saveBtn" onclick="tippani.save()" style="display:none" disabled>Save</button>` : ""}
    ${canEdit ? `<button class="edit-toggle" id="editToggle" onclick="tippani.toggle()" title="Toggle edit mode (${"⌘"}/Ctrl+E)">Edit</button>` : ""}
    <span id="proposalSource" class="proposal-source" style="display:none"></span>
    <button class="edit-toggle" id="discardProposalBtn" onclick="tippani.discardProposal()" style="display:none" title="Discard the staged proposed edit for this file">Discard proposal</button>
  </div>
</div>

<div class="layout" id="layout">
  <nav class="sidebar-left" id="sidebarLeft">
    <div class="sidebar-left-scroll">
      <div class="sidebar-section-label">Contents</div>
      ${tocHtml}
      <div class="sidebar-section-label" style="margin-top:24px;">Files in PR</div>
      ${filesNavHtml}
    </div>
  </nav>

  <div class="resize-handle" id="resizeLeft"></div>

  <main class="main-content" id="mainContent">
    ${canEdit ? `<div class="fmt-toolbar" id="fmtToolbar" role="toolbar" aria-label="Formatting" aria-orientation="horizontal" style="display:none">
      <span class="fmt-group">
        <button class="fmt-btn fmt-heading-btn" id="fmtHeading" aria-haspopup="listbox" aria-expanded="false" title="Block type" aria-label="Block type">¶</button>
        <ul class="fmt-dropdown" id="fmtHeadingMenu" role="listbox" aria-label="Block type" style="display:none">
          <li role="option" data-level="0" aria-selected="true">Paragraph</li>
          <li role="option" data-level="1">Heading 1</li>
          <li role="option" data-level="2">Heading 2</li>
          <li role="option" data-level="3">Heading 3</li>
          <li role="option" data-level="4">Heading 4</li>
        </ul>
      </span>
      <span class="fmt-sep" role="separator"></span>
      <span class="fmt-group">
        <button class="fmt-btn" id="fmtBold" aria-pressed="false" title="Bold (⌘B)" aria-label="Bold" tabindex="-1"><b>B</b></button>
        <button class="fmt-btn" id="fmtItalic" aria-pressed="false" title="Italic (⌘I)" aria-label="Italic" tabindex="-1"><i>I</i></button>
        <button class="fmt-btn" id="fmtStrike" aria-pressed="false" title="Strikethrough (⌘⇧S)" aria-label="Strikethrough" tabindex="-1"><s>S</s></button>
        <button class="fmt-btn" id="fmtCode" aria-pressed="false" title="Inline code (⌘E)" aria-label="Inline code" tabindex="-1"><code>&lt;&gt;</code></button>
      </span>
      <span class="fmt-sep" role="separator"></span>
      <span class="fmt-group">
        <button class="fmt-btn" id="fmtBullet" aria-pressed="false" title="Bullet list (⌘⇧8)" aria-label="Bullet list" tabindex="-1">•</button>
        <button class="fmt-btn" id="fmtOrdered" aria-pressed="false" title="Ordered list (⌘⇧7)" aria-label="Ordered list" tabindex="-1">1.</button>
        <button class="fmt-btn" id="fmtTask" aria-pressed="false" title="Task list (⌘⇧9)" aria-label="Task list" tabindex="-1">☐</button>
      </span>
      <span class="fmt-sep" role="separator"></span>
      <span class="fmt-group">
        <button class="fmt-btn" id="fmtQuote" aria-pressed="false" title="Blockquote (⌘⇧.)" aria-label="Blockquote" tabindex="-1">❝</button>
        <button class="fmt-btn" id="fmtCodeBlock" aria-pressed="false" title="Code block (⌘⇧K)" aria-label="Code block" tabindex="-1">▤</button>
        <button class="fmt-btn" id="fmtHR" title="Horizontal rule" aria-label="Horizontal rule" tabindex="-1">―</button>
      </span>
      <span class="fmt-sep" role="separator"></span>
      <span class="fmt-group">
        <button class="fmt-btn" id="fmtLink" title="Link (⌘K)" aria-label="Insert link" tabindex="-1">🔗</button>
        <button class="fmt-btn" id="fmtImage" title="Image" aria-label="Insert image" tabindex="-1">🖼</button>
      </span>
      <span class="fmt-sep" role="separator"></span>
      <span class="fmt-group">
        <button class="fmt-btn" id="fmtIndent" title="Indent (Tab)" aria-label="Indent" tabindex="-1">⇥</button>
        <button class="fmt-btn" id="fmtOutdent" title="Outdent (⇧Tab)" aria-label="Outdent" tabindex="-1">⇤</button>
      </span>
    </div>` : ""}
    <div class="spec" id="spec-content">
      ${specHtml}
    </div>
    <div class="spec spec-edit" id="spec-editor" style="display:none"></div>
  </main>

  <div class="resize-handle" id="resizeRight"></div>

  <aside class="sidebar-right" id="sidebarRight">
    <div class="sidebar-section-label">Comments <span class="comment-count-badge">${activeThreads.length} active</span></div>
    <div class="kbd-hint"><kbd>J</kbd>/<kbd>K</kbd> next/prev · <kbd>R</kbd> reply · <kbd>S</kbd> skip · <kbd>⌘↵</kbd> post &amp; next</div>
    ${threadsHtml}
  </aside>
</div>

<div class="sync-bar" id="syncBar">
  <span class="sync-status" id="syncStatus"></span>
  <button class="sync-btn" id="syncBtn" onclick="syncPending()">Sync to ADO</button>
</div>

<div class="review-bar">
  <button class="review-btn review-btn-approve" onclick="submitReview('approve')">Approve</button>
  <button class="review-btn review-btn-changes" onclick="submitReview('reject')">Request Changes</button>
</div>

<div class="comment-modal" id="commentModal">
  <div class="comment-modal-inner">
    <h3>Add a comment</h3>
    <div class="comment-context" id="commentContext"></div>
    <textarea id="commentText" rows="4" placeholder="Write your comment..."></textarea>
    <div class="comment-modal-actions">
      <button class="modal-btn" onclick="closeModal()">Cancel</button>
      <button class="modal-btn modal-btn-primary" onclick="submitComment()">Comment</button>
    </div>
  </div>
</div>

<div class="comment-modal" id="diffModal">
  <div class="diff-modal-inner">
    <div class="diff-modal-head">
      <h3>Review changes</h3>
      <span class="diff-stats" id="diffStats"></span>
    </div>
    <div class="diff-body" id="diffBody"></div>
    <div class="diff-msg-row" id="diffMsgRow" style="display:none">
      <label for="commitMsg">Commit message</label>
      <input type="text" id="commitMsg" autocomplete="off" />
    </div>
    <div class="comment-modal-actions">
      <button class="modal-btn" id="diffCancel">Cancel</button>
      <button class="modal-btn modal-btn-primary" id="diffConfirm">Confirm &amp; Save</button>
    </div>
  </div>
</div>

<div class="comment-modal" id="conflictModal">
  <div class="comment-modal-inner">
    <h3>File changed on the server</h3>
    <p class="conflict-msg">This file was updated by someone else since you started editing, so your save was not applied. Copy your changes, then reload to get the latest version and re-apply them. Tippani never overwrites someone else's edits automatically.</p>
    <div class="comment-modal-actions">
      <button class="modal-btn" id="conflictCancel">Keep editing</button>
      <button class="modal-btn" id="conflictCopy">Copy my changes</button>
      <button class="modal-btn modal-btn-primary" id="conflictReload">Reload</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>${EDITOR_JS}</script>
<script>
// #47 edit/view toggle. Read-only rendered view is the default; editing is opt-in.
// The CM editor is mounted lazily on first entry and reused, so edits persist
// across toggle cycles within the session. Cmd/Ctrl+E toggles.
window.tippani = (function () {
  // Mutable baseline: updated after a successful save so the editor is no longer
  // dirty and the next diff is measured against the saved state.
  let RAW_MARKDOWN = ${JSON.stringify(rawMarkdown || "")};
  const SPEC_FILE_PATH = ${JSON.stringify(specPath)};
  const FILENAME = SPEC_FILE_PATH.split("/").pop();
  // Branch tip at load time — sent on save so ADO rejects a stale push (#49).
  const BASE_OBJECT_ID = ${JSON.stringify(baseObjectId || null)};
  const ORIG_TITLE = document.title;
  let editor = null;
  let editMode = false;
  let saving = false;
  const paneState = {
    left: localStorage.getItem("fsrp-edit-left-collapsed") === "1",
    right: localStorage.getItem("fsrp-edit-right-collapsed") === "1",
  };

  const el = (id) => document.getElementById(id);
  const isDirty = () => !!editor && editor.getMarkdown() !== RAW_MARKDOWN;
  const toast = (m) => window.showToast && window.showToast(m);

  // Save button is enabled only when there are unsaved changes.
  function updateSaveState() {
    const btn = el("saveBtn");
    if (btn) btn.disabled = saving || !isDirty();
  }

  // Dirty indicator: a dot in the header + an asterisk-equivalent in the title (#49).
  function updateDirtyIndicator() {
    const dirty = isDirty();
    document.title = (dirty ? "● " : "") + ORIG_TITLE;
    const dot = el("dirtyDot");
    if (dot) dot.style.display = dirty ? "" : "none";
  }

  function onEditorChange() {
    updateSaveState();
    updateDirtyIndicator();
  }

  function ensureEditor() {
    if (!editor && window.TippaniEditor)
      editor = window.TippaniEditor.mount(el("spec-editor"), RAW_MARKDOWN, {
        onChange: onEditorChange,
      });
    return editor;
  }

  // --- Formatting toolbar wiring (#55) ----------------------------------------
  // Each button dispatches a command via window.TippaniEditor.commands and
  // refocuses the editor so the user can keep typing.
  function fmtCmd(cmdName, ...args) {
    if (!editor) return;
    const cmds = window.TippaniEditor.commands;
    const fn = typeof cmds[cmdName] === "function" ? cmds[cmdName] : null;
    if (!fn) return;
    // setHeading returns a command function, others are direct commands.
    if (cmdName === "setHeading") {
      cmds.setHeading(args[0])(editor.view);
    } else {
      fn(editor.view);
    }
    editor.view.focus();
  }

  // Wire toolbar buttons after DOM is ready.
  function wireToolbar() {
    const bindings = {
      fmtBold: "toggleBold", fmtItalic: "toggleItalic",
      fmtStrike: "toggleStrikethrough", fmtCode: "toggleInlineCode",
      fmtBullet: "toggleBulletList", fmtOrdered: "toggleOrderedList",
      fmtTask: "toggleTaskList", fmtQuote: "toggleBlockquote",
      fmtCodeBlock: "toggleCodeBlock", fmtHR: "insertHorizontalRule",
      fmtLink: "insertLink", fmtImage: "insertImage",
      fmtIndent: "indentMore", fmtOutdent: "indentLess",
    };
    for (const [id, cmd] of Object.entries(bindings)) {
      const btn = el(id);
      if (btn) btn.addEventListener("click", () => fmtCmd(cmd));
    }

    // Heading dropdown.
    const headBtn = el("fmtHeading");
    const headMenu = el("fmtHeadingMenu");
    if (headBtn && headMenu) {
      headBtn.addEventListener("click", () => {
        const open = headMenu.style.display !== "none";
        headMenu.style.display = open ? "none" : "";
        headBtn.setAttribute("aria-expanded", open ? "false" : "true");
        if (!open) {
          // Close on click-outside.
          const close = (e) => {
            if (!headMenu.contains(e.target) && e.target !== headBtn) {
              headMenu.style.display = "none";
              headBtn.setAttribute("aria-expanded", "false");
              document.removeEventListener("pointerdown", close);
            }
          };
          setTimeout(() => document.addEventListener("pointerdown", close), 0);
          // Close on Escape.
          const esc = (e) => {
            if (e.key === "Escape") {
              headMenu.style.display = "none";
              headBtn.setAttribute("aria-expanded", "false");
              headBtn.focus();
              document.removeEventListener("keydown", esc);
            }
          };
          document.addEventListener("keydown", esc);
        }
      });
      headMenu.addEventListener("click", (e) => {
        const li = e.target.closest("li[data-level]");
        if (!li) return;
        fmtCmd("setHeading", Number(li.dataset.level));
        headMenu.style.display = "none";
        headBtn.setAttribute("aria-expanded", "false");
      });
    }

    // Roving tabindex: arrow keys move focus within toolbar.
    const tb = el("fmtToolbar");
    if (tb) {
      tb.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") return;
        const btns = Array.from(tb.querySelectorAll(".fmt-btn"));
        const idx = btns.indexOf(document.activeElement);
        if (idx < 0) return;
        e.preventDefault();
        let next;
        if (e.key === "ArrowRight") next = (idx + 1) % btns.length;
        else if (e.key === "ArrowLeft") next = (idx - 1 + btns.length) % btns.length;
        else if (e.key === "Home") next = 0;
        else next = btns.length - 1;
        btns[idx].tabIndex = -1;
        btns[next].tabIndex = 0;
        btns[next].focus();
      });
    }
  }

  // Initialize toolbar wiring on first load.
  wireToolbar();

  function updatePaneControls() {
    const controls = el("editPaneControls");
    if (controls) controls.classList.toggle("visible", editMode);
    const toc = el("toggleTocPane");
    const comments = el("toggleCommentsPane");
    const focus = el("focusEditPane");
    if (toc) {
      toc.classList.toggle("active", paneState.left);
      toc.setAttribute("aria-pressed", paneState.left ? "true" : "false");
      toc.title = paneState.left ? "Restore contents pane" : "Minimize contents pane";
      toc.setAttribute("aria-label", toc.title);
    }
    if (comments) {
      comments.classList.toggle("active", paneState.right);
      comments.setAttribute("aria-pressed", paneState.right ? "true" : "false");
      comments.title = paneState.right ? "Restore comments pane" : "Minimize comments pane";
      comments.setAttribute("aria-label", comments.title);
    }
    if (focus) {
      const focused = paneState.left && paneState.right;
      focus.classList.toggle("active", focused);
      focus.setAttribute("aria-pressed", focused ? "true" : "false");
      focus.title = focused ? "Restore edit panes" : "Focus editor";
      focus.setAttribute("aria-label", focus.title);
    }
  }

  function applyEditPaneState() {
    const layout = el("layout");
    if (!layout) return;
    layout.classList.toggle("edit-mode", editMode);
    layout.classList.toggle("left-collapsed", paneState.left);
    layout.classList.toggle("right-collapsed", paneState.right);
    updatePaneControls();
  }

  function setPaneCollapsed(side, collapsed, persist = true) {
    paneState[side] = collapsed;
    if (persist) localStorage.setItem("fsrp-edit-" + side + "-collapsed", collapsed ? "1" : "0");
    applyEditPaneState();
  }

  function togglePane(side) {
    if (!editMode) return;
    setPaneCollapsed(side, !paneState[side]);
  }

  function toggleFocusEdit() {
    if (!editMode) return;
    const collapseBoth = !(paneState.left && paneState.right);
    setPaneCollapsed("left", collapseBoth);
    setPaneCollapsed("right", collapseBoth);
  }

  function enterEdit() {
    if (!ensureEditor()) return;
    el("spec-content").style.display = "none";
    el("spec-editor").style.display = "";
    const tb = el("fmtToolbar");
    if (tb) tb.style.display = "";
    el("mainContent").classList.add("editing");
    const btn = el("editToggle");
    if (btn) btn.textContent = "View";
    const save = el("saveBtn");
    if (save) save.style.display = "";
    updateSaveState();
    updateDirtyIndicator();
    editMode = true;
    applyEditPaneState();
    maybeSeedProposal();
    editor.view.focus();
  }
  function exitEdit() {
    // Unsaved-changes prompt on mode switch. Edits are kept for the session (not
    // discarded) so they survive toggle cycles; saving is via the Save button.
    // Cancel keeps you in edit mode.
    if (isDirty() && !confirm("You have unsaved changes. Switch to read view? Your edits are kept for this session.")) return;
    el("spec-editor").style.display = "none";
    el("spec-content").style.display = "";
    const tb = el("fmtToolbar");
    if (tb) tb.style.display = "none";
    el("mainContent").classList.remove("editing");
    const btn = el("editToggle");
    if (btn) btn.textContent = "Edit";
    const save = el("saveBtn");
    if (save) save.style.display = "none";
    editMode = false;
    applyEditPaneState();
  }
  function toggle() {
    editMode ? exitEdit() : enterEdit();
  }

  // Diff-on-save preview (#46). Resolves true (confirm) / false (cancel). Called
  // by the write path (#48) before committing.
  function showDiff(oldMd, newMd) {
    return new Promise((resolve) => {
      const modal = el("diffModal");
      const body = el("diffBody");
      const stats = el("diffStats");
      const diff = window.TippaniEditor.diffLines(oldMd, newMd);
      const s = window.TippaniEditor.diffStats(diff);
      const noChange = s.added + s.removed === 0;
      stats.textContent = noChange ? "No changes" : "+" + s.added + "  −" + s.removed;
      body.textContent = "";
      if (noChange) {
        const p = document.createElement("div");
        p.className = "diff-empty";
        p.textContent = "No changes to save.";
        body.appendChild(p);
      } else {
        for (const d of diff) {
          const line = document.createElement("div");
          line.className = "diff-line diff-" + d.type;
          const gutter = document.createElement("span");
          gutter.className = "diff-gutter";
          gutter.textContent = d.type === "add" ? "+" : d.type === "del" ? "−" : " ";
          const text = document.createElement("span");
          text.className = "diff-text";
          text.textContent = d.text === "" ? " " : d.text; // build via textContent — XSS-safe
          line.appendChild(gutter);
          line.appendChild(text);
          body.appendChild(line);
        }
      }
      modal.style.display = "flex";
      const done = (result) => {
        modal.style.display = "none";
        el("diffConfirm").onclick = null;
        el("diffCancel").onclick = null;
        resolve(result);
      };
      el("diffConfirm").onclick = () => done(true);
      el("diffCancel").onclick = () => done(false);
    });
  }

  // Save (#48): diff preview (with editable commit message) → commit to PR branch.
  async function save() {
    if (saving || !isDirty()) return;
    const newMd = editor.getMarkdown();
    const msgRow = el("diffMsgRow");
    const msgInput = el("commitMsg");
    const defaultMsg = "tippani: update " + FILENAME;
    if (msgInput) msgInput.value = defaultMsg;
    if (msgRow) msgRow.style.display = "flex";
    const ok = await showDiff(RAW_MARKDOWN, newMd);
    if (msgRow) msgRow.style.display = "none";
    if (!ok) return;
    const message = (msgInput && msgInput.value.trim()) || defaultMsg;

    saving = true;
    const btn = el("saveBtn");
    if (btn) btn.textContent = "Saving…";
    updateSaveState();
    try {
      const r = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: SPEC_FILE_PATH, content: newMd, message, baseObjectId: BASE_OBJECT_ID }),
      });
      const data = await r.json();
      if (data.ok && data.synced) {
        RAW_MARKDOWN = newMd; // new saved baseline → no longer dirty
        toast("Saved — commit " + (data.commitId ? String(data.commitId).slice(0, 8) : "ok"));
      } else if (data.conflict) {
        // Branch moved underneath us — never overwrite blindly (#49).
        showConflict();
      } else if (data.queued) {
        RAW_MARKDOWN = newMd; // safely persisted to the queue; will retry on sync
        toast(data.error ? "Push failed (" + data.error + ") — queued, will retry on sync" : (data.message || "Saved locally — will sync"));
      } else {
        toast("Save failed: " + (data.error || "unknown") + " — your edits are kept");
      }
    } catch (e) {
      toast("Save failed: " + e.message + " — your edits are kept");
    } finally {
      saving = false;
      if (btn) btn.textContent = "Save";
      updateSaveState();
      updateDirtyIndicator();
    }
  }

  // Conflict dialog (#49): the branch moved; offer reload or copy-to-clipboard.
  // Never auto-merge — specs are prose.
  function showConflict() {
    const m = el("conflictModal");
    if (!m) {
      toast("This file was changed on the server — reload before saving.");
      return;
    }
    m.style.display = "flex";
    el("conflictCancel").onclick = () => { m.style.display = "none"; };
    el("conflictCopy").onclick = async () => {
      try {
        await navigator.clipboard.writeText(editor.getMarkdown());
        toast("Your changes copied to the clipboard");
      } catch {
        toast("Copy failed — select the text and copy manually");
      }
    };
    el("conflictReload").onclick = () => location.reload();
  }

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "e" || e.key === "E")) {
      // Only when an Edit affordance exists (write access).
      if (!el("editToggle")) return;
      e.preventDefault();
      toggle();
    }
  });
  // Warn before closing/reloading the tab with unsaved edits (#49).
  window.addEventListener("beforeunload", (e) => {
    if (isDirty()) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    }
  });

  // Warn before navigating to another file (home or file picker) with unsaved
  // edits (#49). Capture phase so it runs before the link navigates.
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const leavesFile = href === "/" || href.startsWith("/file/");
      if (leavesFile && isDirty() &&
          !confirm("You have unsaved changes. Leave this file and discard them?")) {
        e.preventDefault();
      }
    },
    true
  );

  // If a whole-file proposal is staged and the editor is still pristine, seed
  // the editor with the proposal so Edit mode becomes "accept & refine". Guarded
  // so it never clobbers the user's own unsaved edits.
  async function maybeSeedProposal() {
    if (isDirty()) return;
    try {
      const r = await fetch('/api/v1/specs/' + CURRENT_FILE_INDEX + '/draft');
      if (!r.ok) return;
      const data = await r.json();
      const content = data && data.draft && data.draft.content;
      if (content && content !== RAW_MARKDOWN && !isDirty() && editor && editor.setMarkdown) {
        editor.setMarkdown(content);
        updateSaveState();
        updateDirtyIndicator();
      }
    } catch {}
  }

  // Reject a staged proposal: clear the server-side draft and drop the overlay.
  async function discardProposal() {
    if (!confirm('Discard the proposed edit for this file? The document returns to its committed version.')) return;
    try { await fetch('/api/v1/specs/' + CURRENT_FILE_INDEX + '/draft', { method: 'DELETE' }); } catch {}
    if (typeof clearDiffOverlay === 'function') clearDiffOverlay();
    const b = el('discardProposalBtn'); if (b) b.style.display = 'none';
    // If we're in edit mode the editor still holds the seeded proposal — reset it
    // to the committed baseline so "returns to its committed version" is true.
    if (editMode && editor && editor.setMarkdown) {
      editor.setMarkdown(RAW_MARKDOWN);
      updateSaveState();
      updateDirtyIndicator();
    }
  }

  // ?edit=1 still auto-enters edit mode (convenient for testing).
  if (new URLSearchParams(location.search).get("edit") === "1") {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", enterEdit);
    else enterEdit();
  }
  return {
    toggle,
    togglePane,
    toggleFocusEdit,
    enterEdit,
    exitEdit,
    isDirty,
    save,
    showDiff,
    showConflict,
    updateDirtyIndicator,
    discardProposal,
    // Original (last-loaded) markdown — the baseline a save diffs against.
    getOriginal: () => RAW_MARKDOWN,
    // For the write path (#48): current editor buffer (or the original if the
    // editor was never opened).
    getMarkdown: () => (editor ? editor.getMarkdown() : RAW_MARKDOWN),
    getEditor: () => editor,
  };
})();
</script>
<script>
const SPEC_PATH = ${JSON.stringify(specPath)};
const CURRENT_FILE_INDEX = ${JSON.stringify(currentFileIndex)};
const SOURCE_MAP = ${JSON.stringify(sourceMap)};
const TOC_DATA = ${JSON.stringify(toc)};
const THREADS_DATA = ${JSON.stringify(allThreads.map(t => ({
  id: t.id,
  line: t.threadContext?.rightFileStart?.line || null,
  file: t.threadContext?.filePath || null,
  count: (t.comments || []).length,
  resolved: t.status === 2 || t.status === 4
})))};

// TOC scroll spy
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.toc-item').forEach(a => a.classList.remove('active'));
      const link = document.querySelector('.toc-item[data-id="' + entry.target.id + '"]');
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-10% 0px -80% 0px' });

document.querySelectorAll('.spec h1[id], .spec h2[id], .spec h3[id], .spec h4[id]').forEach(el => observer.observe(el));

document.querySelectorAll('.toc-item').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(a.dataset.id);
    if (target) {
      document.getElementById('mainContent').scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
    }
  });
});

// Find nearest preceding heading for a DOM element
function findNearestHeading(el) {
  let node = el.previousElementSibling;
  while (node) {
    if (/^H[1-6]$/.test(node.tagName)) return node.textContent.trim();
    node = node.previousElementSibling;
  }
  // Walk up to parent and try again
  const parent = el.parentElement;
  if (parent && parent.classList.contains('spec')) return '';
  if (parent) return findNearestHeading(parent);
  return '';
}

// Make content blocks commentable with floating + button
let commentLine = 1;
const commentableSelector = '.spec p, .spec li, .spec blockquote, .spec table, .spec pre';
const commentableEls = [];
document.querySelectorAll(commentableSelector).forEach((el, i) => {
  if (el.closest('.commentable')) return;
  el.classList.add('commentable');
  el.style.position = 'relative';
  el.dataset.blockIdx = commentableEls.length;
  commentableEls.push(el);
  const btn = document.createElement('button');
  btn.className = 'comment-btn';
  btn.textContent = '+';
  btn.setAttribute('aria-label', 'Add comment');
  btn.title = 'Add comment';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const mapping = SOURCE_MAP[i];
    commentLine = mapping ? mapping.startLine : 1;
    // Set context in modal
    const heading = findNearestHeading(el);
    const ctx = document.getElementById('commentContext');
    ctx.textContent = heading
      ? '\u00A7 ' + heading + (mapping ? ', line ' + mapping.startLine : '')
      : (mapping ? 'Line ' + mapping.startLine : '');
    document.getElementById('commentModal').classList.add('active');
    document.getElementById('commentText').focus();
  });
  el.prepend(btn);
});

// Place inline comment bubbles on content blocks that have threads
THREADS_DATA.forEach(td => {
  if (!td.line) return;
  const threadEl = document.querySelector('.comment-thread[data-thread-id="' + td.id + '"]');
  const header = threadEl ? (threadEl.querySelector('.comment-anchor') || threadEl) : null;

  // Thread on another file: header navigates to that file (and focuses the thread).
  const sameFile = !td.file || !SPEC_PATH || td.file === SPEC_PATH;
  if (!sameFile) {
    if (header) {
      header.style.cursor = 'pointer';
      header.title = 'Open this file and thread';
      header.addEventListener('click', () => { location.href = '/goto/thread/' + td.id; });
    }
    return;
  }

  // Find the commentable block whose source-map range contains this line; if the
  // exact line isn't inside a block (e.g. a heading or blank line), fall back to
  // the nearest block so the thread still scrolls somewhere sensible.
  let targetEl = null, bestKey = null, bestDist = Infinity;
  for (const key of Object.keys(SOURCE_MAP)) {
    const sm = SOURCE_MAP[key];
    if (td.line >= sm.startLine && td.line <= sm.endLine) { targetEl = commentableEls[parseInt(key)]; break; }
    const dist = td.line < sm.startLine ? sm.startLine - td.line : td.line - sm.endLine;
    if (dist < bestDist) { bestDist = dist; bestKey = key; }
  }
  if (!targetEl && bestKey != null) targetEl = commentableEls[parseInt(bestKey)];
  if (!targetEl) return;
  const bubble = document.createElement('button');
  bubble.className = 'inline-bubble ' + (td.resolved ? 'inline-bubble-resolved' : 'inline-bubble-active');
  bubble.textContent = td.count;
  bubble.title = (td.resolved ? 'Resolved' : 'Active') + ' — ' + td.count + ' comment' + (td.count > 1 ? 's' : '');
  bubble.setAttribute('aria-label', (td.resolved ? 'Resolved' : 'Active') + ' thread, ' + td.count + ' comment' + (td.count > 1 ? 's' : ''));
  bubble.addEventListener('click', (e) => {
    e.stopPropagation();
    if (threadEl) {
      threadEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      threadEl.style.boxShadow = '0 0 0 2px ' + (td.resolved ? 'var(--cp-success)' : 'var(--cp-accent)');
      setTimeout(() => threadEl.style.boxShadow = '', 2000);
    }
  });
  targetEl.appendChild(bubble);

  // Reverse direction: clicking the thread header scrolls the document to the
  // corresponding content block and flashes it.
  if (header) {
    header.style.cursor = 'pointer';
    header.title = 'Jump to this location in the document';
    header.addEventListener('click', () => { scrollDocToThread(td.id); });
  }
});

// GitHub-style diff overlay for a staged spec edit: for each change hunk, hide
// the affected rendered block and show a red "Current" box + green "Proposed"
// box in its place, with a change marker in the right gutter. Server renders
// the HTML; we only place it against the source-mapped block.
function clearDiffOverlay() {
  document.querySelectorAll('.docdiff-widget').forEach((e) => e.remove());
  document.querySelectorAll('.docdiff-hidden').forEach((e) => { e._diffDest = null; e.classList.remove('docdiff-hidden'); });
}
async function applyDiffOverlay() {
  try {
    const r = await fetch('/api/v1/specs/' + CURRENT_FILE_INDEX + '/diff');
    if (!r.ok) return;
    const data = await r.json();
    clearDiffOverlay();
    const hunks = (data && data.hunks) || [];
    const db0 = document.getElementById('discardProposalBtn');
    const ps0 = document.getElementById('proposalSource');
    if (!hunks.length) { if (db0) db0.style.display = 'none'; if (ps0) ps0.style.display = 'none'; return; }
    for (const h of hunks) {
      // Find the rendered block overlapping the hunk's original line range;
      // fall back to the nearest block if the exact line isn't in a block.
      let target = null, bestKey = null, bestDist = Infinity;
      for (const key of Object.keys(SOURCE_MAP)) {
        const sm = SOURCE_MAP[key];
        if (h.startLine <= sm.endLine && h.endLine >= sm.startLine) { target = commentableEls[parseInt(key)]; break; }
        const dist = Math.min(Math.abs(sm.startLine - h.endLine), Math.abs(h.startLine - sm.endLine));
        if (dist < bestDist) { bestDist = dist; bestKey = key; }
      }
      if (!target && bestKey != null) target = commentableEls[parseInt(bestKey)];

      const wrap = document.createElement('div');
      wrap.className = 'docdiff-widget';
      wrap.dataset.start = h.startLine;
      wrap.dataset.end = h.endLine;
      if (h.mergedHtml) {
        const box = document.createElement('div');
        box.className = 'docdiff-box docdiff-merged';
        box.innerHTML = h.mergedHtml;
        wrap.appendChild(box);
      } else {
        if (h.oldHtml) {
          const oldBox = document.createElement('div');
          oldBox.className = 'docdiff-box docdiff-old';
          oldBox.innerHTML = h.oldHtml;
          wrap.appendChild(oldBox);
        }
        if (h.newHtml) {
          const newBox = document.createElement('div');
          newBox.className = 'docdiff-box docdiff-new';
          newBox.innerHTML = h.newHtml;
          wrap.appendChild(newBox);
        }
      }
      if (target && target.parentNode) {
        target.classList.add('docdiff-hidden');
        target.parentNode.insertBefore(wrap, target.nextSibling);
        target._diffDest = wrap;
      } else {
        const spec = document.getElementById('spec-content');
        if (spec) spec.appendChild(wrap);
      }
    }
    updateDiffMarkers();
    const db = document.getElementById('discardProposalBtn');
    if (db) db.style.display = hunks.length ? '' : 'none';
    const ps = document.getElementById('proposalSource');
    if (ps) {
      const who = /user/i.test(data.source || '') ? 'you' : 'the agent';
      ps.textContent = 'Proposed by ' + who;
      ps.title = data.updatedAt ? ('Last updated ' + new Date(data.updatedAt).toLocaleString()) : '';
      ps.style.display = '';
    }
  } catch {}
}
// Color each diff widget's right-gutter marker: pink for the change tied to the
// active (focused) thread, gray for the rest. A thread is tied to a hunk when
// its line falls within the hunk's line range.
function updateDiffMarkers() {
  let line = null;
  const act = THREADS_DATA.find((t) => Number(t.id) === Number(_focusedThreadId));
  if (act) line = act.line;
  document.querySelectorAll('.docdiff-widget').forEach((w) => {
    const s = Number(w.dataset.start), e = Number(w.dataset.end);
    const on = line != null && line >= s && line <= e;
    w.classList.toggle('docdiff-active', on);
  });
}
// Scroll the document content to a source line (respecting the diff overlay's
// replacement widget). In edit mode, scroll the CodeMirror editor to that line.
function scrollToLine(line) {
  if (!Number.isFinite(line)) return;
  const main = document.getElementById('mainContent');
  if (main && main.classList.contains('editing')) { scrollEditorToLine(line); return; }
  let target = null, bestKey = null, bestDist = Infinity;
  for (const key of Object.keys(SOURCE_MAP)) {
    const sm = SOURCE_MAP[key];
    if (line >= sm.startLine && line <= sm.endLine) { target = commentableEls[parseInt(key)]; break; }
    const dist = line < sm.startLine ? sm.startLine - line : line - sm.endLine;
    if (dist < bestDist) { bestDist = dist; bestKey = key; }
  }
  if (!target && bestKey != null) target = commentableEls[parseInt(bestKey)];
  if (!target) return;
  const dest = target._diffDest || target;
  dest.scrollIntoView({ behavior: 'smooth', block: 'center' });
  dest.style.boxShadow = '0 0 0 2px var(--cp-accent)';
  setTimeout(() => { dest.style.boxShadow = ''; }, 1500);
}
// Scroll the document to a thread's location so opening/focusing a thread syncs the doc.
function scrollDocToThread(threadId) {
  const td = THREADS_DATA.find((t) => Number(t.id) === Number(threadId));
  if (!td || !td.line) return;
  if (td.file && SPEC_PATH && td.file !== SPEC_PATH) return;
  scrollToLine(td.line);
}
// Edit mode uses a CodeMirror 6 editor showing the markdown source. Its
// .cm-scroller isn't the overflow element (#mainContent is), so scroll
// #mainContent to the target line using the line block's geometry.
function scrollEditorToLine(lineNo) {
  const ed = window.tippani && window.tippani.getEditor && window.tippani.getEditor();
  const view = ed && ed.view;
  const main = document.getElementById('mainContent');
  if (!view || !view.state || !view.contentDOM || !main || !Number.isFinite(lineNo)) return;
  try {
    const n = Math.max(1, Math.min(lineNo, view.state.doc.lines));
    const pos = view.state.doc.line(n).from;
    const block = view.lineBlockAt(pos);
    const lineViewportTop = view.contentDOM.getBoundingClientRect().top + block.top;
    const mainRect = main.getBoundingClientRect();
    const delta = lineViewportTop - mainRect.top - main.clientHeight / 2 + block.height / 2;
    main.scrollBy({ top: delta, behavior: 'smooth' });
  } catch {}
}
applyDiffOverlay();

// open_file deep-link: /file/<idx>?line=N scrolls to that line once the view settles.
(function () {
  const q = new URLSearchParams(location.search).get('line');
  const n = q ? parseInt(q, 10) : NaN;
  if (Number.isFinite(n)) setTimeout(() => { try { scrollToLine(n); } catch {} }, 400);
})();


function closeModal() {
  document.getElementById('commentModal').classList.remove('active');
  document.getElementById('commentText').value = '';
  document.getElementById('commentContext').textContent = '';
}

// Escape key closes modal; focus trap inside modal
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('commentModal');
  if (!modal.classList.contains('active')) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    const focusable = modal.querySelectorAll('textarea, button');
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

async function submitComment() {
  const text = document.getElementById('commentText').value.trim();
  if (!text) return;
  try {
    const res = await fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: commentLine, content: text, filePath: SPEC_PATH })
    });
    if (!res.ok) throw new Error('Failed');
    const result = await res.json();
    closeModal();
    showToast(result.synced ? 'Comment posted' : 'Comment saved locally \u2014 pending sync');
    updateSyncStatus();
    setTimeout(() => location.reload(), 500);
  } catch (e) {
    showToast('Failed to post comment');
  }
}

async function replyToThread(threadId) {
  // Back-compat shim: open the inline reply form instead of prompt().
  openReply(threadId);
}

// --- Phase 0 keyboard nav (#42) ---
// Tracks which active thread is "focused" for J/K/R/S shortcuts.
let _focusedThreadId = null;

function _getActiveThreadIds() {
  return Array.from(document.querySelectorAll('.comment-thread.thread-active'))
    .map(el => Number(el.getAttribute('data-thread-id')))
    .filter(n => Number.isFinite(n));
}

function focusThread(threadId, { scroll = true } = {}) {
  const ids = _getActiveThreadIds();
  if (!ids.includes(threadId)) return false;
  document.querySelectorAll('.comment-thread.thread-focused')
    .forEach(el => el.classList.remove('thread-focused'));
  const el = document.querySelector('.comment-thread[data-thread-id="' + threadId + '"]');
  if (!el) return false;
  el.classList.add('thread-focused');
  if (scroll) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (scroll && typeof scrollDocToThread === 'function') scrollDocToThread(threadId);
  _focusedThreadId = threadId;
  if (typeof updateDiffMarkers === 'function') updateDiffMarkers();
  return true;
}

function gotoNext() {
  const ids = _getActiveThreadIds();
  if (ids.length === 0) return false;
  const cur = ids.indexOf(_focusedThreadId);
  const next = ids[(cur + 1) % ids.length];
  return focusThread(next);
}

function gotoPrev() {
  const ids = _getActiveThreadIds();
  if (ids.length === 0) return false;
  const cur = ids.indexOf(_focusedThreadId);
  const prev = cur <= 0 ? ids[ids.length - 1] : ids[cur - 1];
  return focusThread(prev);
}

function openReply(threadId) {
  focusThread(threadId);
  const form = document.querySelector('.reply-form[data-thread-id="' + threadId + '"]');
  if (!form) return;
  form.classList.add('open');
  const ta = form.querySelector('.reply-textarea');
  if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length; }
}

// Clicking anywhere on a thread makes it the active/focused thread (and repaints
// the diff-gutter markers so only the active thread's edit shows pink).
document.addEventListener('click', (e) => {
  const th = e.target.closest && e.target.closest('.comment-thread');
  if (!th) return;
  const id = Number(th.getAttribute('data-thread-id'));
  if (!Number.isFinite(id)) return;
  document.querySelectorAll('.comment-thread.thread-focused').forEach((el) => el.classList.remove('thread-focused'));
  th.classList.add('thread-focused');
  _focusedThreadId = id;
  if (typeof updateDiffMarkers === 'function') updateDiffMarkers();
});

function closeReply(threadId) {
  const form = document.querySelector('.reply-form[data-thread-id="' + threadId + '"]');
  if (!form) return;
  form.classList.remove('open');
  const ta = form.querySelector('.reply-textarea');
  if (ta) ta.value = '';
}

// Discard an agent-staged reply draft: delete it server-side and clear the form.
async function discardDraft(threadId) {
  try { await fetch('/api/v1/threads/' + threadId + '/draft', { method: 'DELETE' }); } catch (e) {}
  const form = document.querySelector('.reply-form[data-thread-id="' + threadId + '"]');
  if (!form) return;
  const ta = form.querySelector('.reply-textarea');
  if (ta) { ta.value = ''; delete ta.dataset.externalContent; }
  const badge = form.querySelector('.reply-external-badge');
  if (badge) badge.remove();
  const db = form.querySelector('.reply-btn-discard');
  if (db) db.style.display = 'none';
  const cb = form.querySelector('.reply-btn-close');
  if (cb) cb.style.display = '';
}

// Toggle a thread's durable "viewed" marker, then reload to reflect the tag.
async function toggleViewed(threadId, isViewed) {
  try {
    const r = await fetch('/api/v1/threads/' + threadId + '/viewed', { method: isViewed ? 'DELETE' : 'POST' });
    if (r.ok) { location.reload(); }
    else { const e = await r.json().catch(() => ({})); alert('Failed: ' + (e.error || r.status)); }
  } catch (e) { alert('Failed: ' + e); }
}

async function submitReply(threadId) {
  const form = document.querySelector('.reply-form[data-thread-id="' + threadId + '"]');
  if (!form) return;
  const ta = form.querySelector('.reply-textarea');
  const text = (ta?.value || '').trim();
  if (!text) { ta?.focus(); return; }
  const postBtn = form.querySelector('.reply-btn-post');
  if (postBtn) postBtn.disabled = true;
  try {
    const res = await fetch('/api/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, content: text })
    });
    if (!res.ok) throw new Error('Failed');
    const result = await res.json();
    showToast(result.synced ? 'Reply posted — next thread' : 'Reply queued — next thread');
    updateSyncStatus();
    // Advance before reload so the next thread is pre-focused on reload via hash.
    const ids = _getActiveThreadIds();
    const cur = ids.indexOf(threadId);
    const nextId = ids.length > 1 ? ids[(cur + 1) % ids.length] : null;
    if (nextId != null) {
      try { sessionStorage.setItem('tippani.focusThread', String(nextId)); } catch {}
    }
    setTimeout(() => location.reload(), 400);
  } catch (e) {
    showToast('Failed to reply');
    if (postBtn) postBtn.disabled = false;
  }
}

// Restore focused thread across reloads.
(function() {
  try {
    const saved = sessionStorage.getItem('tippani.focusThread');
    if (saved) {
      sessionStorage.removeItem('tippani.focusThread');
      setTimeout(() => focusThread(Number(saved)), 50);
    }
  } catch {}
})();

document.addEventListener('keydown', (e) => {
  // Cmd/Ctrl+Enter inside a reply textarea: post & advance.
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    const ta = e.target.closest && e.target.closest('.reply-textarea');
    if (ta) {
      const form = ta.closest('.reply-form');
      const tid = Number(form?.getAttribute('data-thread-id'));
      if (Number.isFinite(tid)) { e.preventDefault(); submitReply(tid); }
      return;
    }
  }
  // Escape inside a reply textarea: cancel.
  if (e.key === 'Escape') {
    const ta = e.target.closest && e.target.closest('.reply-textarea');
    if (ta) {
      const form = ta.closest('.reply-form');
      const tid = Number(form?.getAttribute('data-thread-id'));
      if (Number.isFinite(tid)) { e.preventDefault(); closeReply(tid); }
      return;
    }
  }
  // Global shortcuts: only when not typing in a text input/textarea/contenteditable.
  const a = document.activeElement;
  const inEditable = a && (
    a.tagName === 'INPUT' ||
    a.tagName === 'TEXTAREA' ||
    a.isContentEditable
  );
  if (inEditable) return;
  // Ignore modifier-laden keys (let other handlers own them).
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === 'j') { e.preventDefault(); gotoNext(); }
  else if (k === 'k') { e.preventDefault(); gotoPrev(); }
  else if (k === 's') { e.preventDefault(); gotoNext(); }
  else if (k === 'r') {
    e.preventDefault();
    const ids = _getActiveThreadIds();
    if (ids.length === 0) return;
    if (_focusedThreadId == null) focusThread(ids[0]);
    if (_focusedThreadId != null) openReply(_focusedThreadId);
  }
});

// --- Control-API integration (#42 Phase 1) ---
// Poll the server's control-API state every 1.5s. When focus changes from
// an external client (LLM/script), scroll to that thread; when a draft is
// staged externally, populate the textarea and badge it.
(function() {
  let lastVersion = -1;
  const seenDraftKey = (id, d) => id + ':' + (d ? d.updatedAt : '0');
  const lastDraftSeen = new Map();

  // Spec-edit drafts: an agent stages a whole-file proposal; load it into the
  // editor for the user to review/adjust before committing.
  let _specDraftSeen = null; // updatedAt of the last applied agent proposal
  window.__specDraftActive = () => _specDraftSeen !== null;
  function showSpecDraftBadge(source) {
    let b = document.getElementById('specDraftBadge');
    if (!b) {
      b = document.createElement('div');
      b.id = 'specDraftBadge';
      b.className = 'reply-external-badge';
      b.style.margin = '10px 40px 0';
      const main = document.getElementById('mainContent');
      if (main) main.insertBefore(b, main.firstChild);
    }
    b.textContent = '\u2728 Proposed edit from ' + (source || 'external client') + ' \u2014 review, adjust, then Save (or tell it to commit)';
  }
  function clearSpecDraftBadge() {
    const b = document.getElementById('specDraftBadge');
    if (b) b.remove();
  }
  function applyExternalSpecDraft(specDrafts) {
    // Proposed spec edits are intentionally NOT surfaced in the file view for now:
    // show the document normally. Staged drafts still live server-side (commit flow
    // handles them); the review/diff presentation is TBD ("the fun parts").
    clearSpecDraftBadge();
    _specDraftSeen = null;
  }

  function applyExternalDraft(threadId, draft) {
    const form = document.querySelector('.reply-form[data-thread-id="' + threadId + '"]');
    if (!form) return;
    const ta = form.querySelector('.reply-textarea');
    if (!ta) return;
    // Don't clobber user-typed content: only fill if textarea is empty OR the
    // existing content matches a prior external draft (i.e., user hasn't touched it).
    const priorKey = lastDraftSeen.get(threadId);
    const userTouched = ta.value && (!priorKey || !ta.dataset.externalContent || ta.dataset.externalContent !== ta.value);
    if (userTouched) return;
    form.classList.add('open');
    ta.value = draft.content;
    ta.dataset.externalContent = draft.content;
    let badge = form.querySelector('.reply-external-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'reply-external-badge';
      badge.textContent = '✨ Draft from external client — edit or post';
      form.insertBefore(badge, form.firstChild);
    }
    const discardBtn = form.querySelector('.reply-btn-discard');
    if (discardBtn) discardBtn.style.display = '';
    const closeBtn = form.querySelector('.reply-btn-close');
    if (closeBtn) closeBtn.style.display = 'none';
  }

  function clearExternalBadge(threadId) {
    const form = document.querySelector('.reply-form[data-thread-id="' + threadId + '"]');
    if (!form) return;
    const badge = form.querySelector('.reply-external-badge');
    if (badge) badge.remove();
    const ta = form.querySelector('.reply-textarea');
    if (ta) delete ta.dataset.externalContent;
    const discardBtn = form.querySelector('.reply-btn-discard');
    if (discardBtn) discardBtn.style.display = 'none';
    const closeBtn = form.querySelector('.reply-btn-close');
    if (closeBtn) closeBtn.style.display = '';
  }

  async function poll() {
    try {
      const r = await fetch('/api/v1/state');
      if (!r.ok) return;
      const s = await r.json();
      if (s.version !== lastVersion) {
        lastVersion = s.version;
        // Focus change from external client.
        if (s.focusedThreadId != null && s.focusedThreadId !== _focusedThreadId) {
          focusThread(s.focusedThreadId);
        }
        // Apply / clear drafts.
        const seenThisRound = new Set();
        Object.entries(s.drafts || {}).forEach(([id, d]) => {
          const tid = Number(id);
          seenThisRound.add(tid);
          const k = seenDraftKey(tid, d);
          if (lastDraftSeen.get(tid) !== k) {
            lastDraftSeen.set(tid, k);
            applyExternalDraft(tid, d);
          }
        });
        // Drafts that disappeared server-side.
        for (const tid of Array.from(lastDraftSeen.keys())) {
          if (!seenThisRound.has(tid)) {
            lastDraftSeen.delete(tid);
            clearExternalBadge(tid);
          }
        }
        // Apply an externally-staged spec edit for THIS file.
        try { applyDiffOverlay(); } catch {}
      }
    } catch {}
  }
  setInterval(poll, 1500);
  poll();
})();

// User-editing lock heartbeat: while the user types in a reply textarea,
// touch the server-side lock every 3s so external clients get a 409 if they
// try to PUT a draft. Lock TTL on the server is 10s.
(function() {
  let lastTouchTid = null;
  let lastTouchAt = 0;
  document.addEventListener('input', (e) => {
    const ta = e.target.closest && e.target.closest('.reply-textarea');
    if (!ta) return;
    const form = ta.closest('.reply-form');
    const tid = Number(form?.getAttribute('data-thread-id'));
    if (!Number.isFinite(tid)) return;
    const now = Date.now();
    if (tid === lastTouchTid && (now - lastTouchAt) < 3000) return;
    lastTouchTid = tid;
    lastTouchAt = now;
    fetch('/api/v1/threads/' + tid + '/lock', { method: 'POST' }).catch(() => {});
  });
})();

// Spec-edit mirror + lock: while an agent's proposal is loaded in the editor
// and the user edits it, mirror the buffer back to the draft store (source
// 'user-mirror', ignored by our own poll) and hold the file edit lock so the
// agent can't clobber. Debounced ~1.5s so commit_spec sees the user's edits.
(function() {
  let last = null;
  setInterval(async () => {
    if (typeof window.__specDraftActive !== 'function' || !window.__specDraftActive()) return;
    const ed = window.tippani && window.tippani.getEditor && window.tippani.getEditor();
    if (!ed || !ed.getMarkdown) return;
    const cur = ed.getMarkdown();
    if (cur === last) return;
    last = cur;
    try {
      await fetch('/api/v1/specs/' + CURRENT_FILE_INDEX + '/lock', { method: 'POST' });
      await fetch('/api/v1/specs/' + CURRENT_FILE_INDEX + '/draft', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cur, source: 'user-mirror' })
      });
    } catch {}
  }, 1500);
})();

async function resolveThread(threadId) {
  try {
    const res = await fetch('/api/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId })
    });
    if (!res.ok) throw new Error('Failed');
    const result = await res.json();
    showToast(result.synced ? 'Thread resolved' : 'Resolve queued \u2014 pending sync');
    updateSyncStatus();
    setTimeout(() => location.reload(), 500);
  } catch (e) {
    showToast('Failed to resolve');
  }
}

async function submitReview(type) {
  try {
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    if (!res.ok) throw new Error('Failed');
    showToast(type === 'approve' ? 'Approved!' : 'Changes requested');
  } catch (e) {
    showToast('Failed to submit review');
  }
}

// --- Sync status ---
async function updateSyncStatus() {
  try {
    const res = await fetch('/api/pending');
    const data = await res.json();
    const bar = document.getElementById('syncBar');
    const status = document.getElementById('syncStatus');
    const btn = document.getElementById('syncBtn');
    if (data.count > 0) {
      bar.classList.add('has-pending');
      if (data.isOffline) bar.classList.add('offline');
      status.innerHTML = '<span class="count">' + data.count + '</span> comment' + (data.count > 1 ? 's' : '') + ' pending sync';
      btn.style.display = data.isOffline ? 'none' : '';
    } else {
      bar.classList.remove('has-pending');
    }
  } catch {}
}

async function syncPending() {
  const btn = document.getElementById('syncBtn');
  btn.classList.add('syncing');
  btn.textContent = 'Syncing...';
  try {
    const res = await fetch('/api/sync', { method: 'POST' });
    const data = await res.json();
    if (data.synced > 0) showToast(data.synced + ' comment' + (data.synced > 1 ? 's' : '') + ' synced to ADO');
    if (data.failed > 0) showToast(data.failed + ' failed to sync');
    updateSyncStatus();
    if (data.synced > 0) setTimeout(() => location.reload(), 1000);
  } catch (e) {
    showToast('Sync failed \u2014 check your connection');
  }
  btn.classList.remove('syncing');
  btn.textContent = 'Sync to ADO';
}

// Check sync status on page load and periodically
updateSyncStatus();
setInterval(updateSyncStatus, 30000);

// --- Column resize ---
(function() {
  const MIN_W = 160;
  const sidebarLeft = document.getElementById('sidebarLeft');
  const sidebarRight = document.getElementById('sidebarRight');
  const handleLeft = document.getElementById('resizeLeft');
  const handleRight = document.getElementById('resizeRight');

  // Restore saved widths
  const savedL = localStorage.getItem('fsrp-left-w');
  const savedR = localStorage.getItem('fsrp-right-w');
  if (savedL) sidebarLeft.style.width = savedL + 'px';
  if (savedR) sidebarRight.style.width = savedR + 'px';

  function startDrag(handle, panel, side) {
    return function(e) {
      e.preventDefault();
      handle.classList.add('dragging');
      document.body.classList.add('col-resizing');
      const startX = e.clientX;
      const startW = panel.getBoundingClientRect().width;
      function onMove(ev) {
        const dx = side === 'left' ? ev.clientX - startX : startX - ev.clientX;
        const newW = Math.max(MIN_W, Math.min(600, startW + dx));
        panel.style.width = newW + 'px';
      }
      function onUp() {
        handle.classList.remove('dragging');
        document.body.classList.remove('col-resizing');
        localStorage.setItem(side === 'left' ? 'fsrp-left-w' : 'fsrp-right-w', Math.round(panel.getBoundingClientRect().width));
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
  }

  handleLeft.addEventListener('mousedown', startDrag(handleLeft, sidebarLeft, 'left'));
  handleRight.addEventListener('mousedown', startDrag(handleRight, sidebarRight, 'right'));
})();
<\/script>
</body>
</html>`;
}

// --- Module-level state ---
let _conn, _pr, _prId, _branch, _changedFiles, _otherChangedFiles = [], _cache, _isOffline, _canEdit = false;

// Control API state (#42 Phase 1). All in-memory, ephemeral by design.
const _focus = createFocusStore();
const _drafts = createDraftStore({ onChange: () => _focus.bumpVersion() });
const _locks = createLockStore({ ttlMs: 10_000 });
// Proposed spec-edit drafts, keyed by fileIndex (mirrors the reply-draft
// store): an external client stages a whole-file markdown proposal the user
// reviews/edits in the portal editor before committing.
const _specDrafts = createDraftStore({ onChange: () => _focus.bumpVersion() });
const _specLocks = createLockStore({ ttlMs: 10_000 });
const _inflight = createInflightStore();
// Session token authorises external (non-browser-same-origin) mutations.
// Generated fresh per process and printed to stdout at startup.
const _sessionToken = crypto.randomBytes(24).toString("base64url");

// --- Express server ---
async function main() {
  // Parse PR ID (first non-flag argument)
  const args = process.argv.slice(2);
  const positional = args.filter(a => !a.startsWith("--"));
  _prId = parseInt(positional[0]);
  const explicitFile = args.find((a) => a.startsWith("--file="))?.split("=").slice(1).join("=") || positional[1] || null;

  if (!_prId) {
    console.log("Usage: tippani <PR_ID> [options]");
    console.log("");
    console.log("Options:");
    console.log("  --org=<url>       ADO org URL (e.g. https://dev.azure.com/myorg)");
    console.log("  --project=<name>  ADO project name");
    console.log("  --repo=<name>     ADO repo name (optional; auto-detected from the PR)");
    console.log("  --file=<path>     Open a specific file directly");
    console.log("  --refresh         Force re-fetch from ADO (ignore cache)");
    console.log("  --offline         Work from cache only, no ADO connection needed");
    console.log("  --save-config     Save --org/--project/--repo to ~/.tippani/config.json");
    console.log("  --port=<n>        Serve on a specific port (default 3847)");
    console.log("  --headless        Don't open a browser (agent-only session)");
    console.log("  --ado-token=<t>   Use a bearer token for ADO (skip PAT / az CLI)");
    console.log("");
    console.log("Examples:");
    console.log("  tippani 992661");
    console.log("  tippani 992661 --org=https://dev.azure.com/myorg --project='My Project'");
    console.log("  tippani 992661 --offline");
    console.log("");
    console.log("Config: ~/.tippani/config.json (set defaults to avoid repeated flags)");
    process.exit(1);
  }

  // Resolve ADO config
  const adoConfig = getConfig();
  if (!adoConfig.org || !adoConfig.project) {
    console.error("Error: --org and --project are required (or set in ~/.tippani/config.json).");
    console.error("Run: tippani <PR_ID> --org=https://dev.azure.com/YOURORG --project='YOUR PROJECT' --save-config");
    process.exit(1);
  }
  ADO_ORG = adoConfig.org.replace(/\/+$/, "");
  if (!ADO_ORG.startsWith("https://")) ADO_ORG = "https://" + ADO_ORG;
  ADO_PROJECT = adoConfig.project;
  ADO_REPO = adoConfig.repo || adoConfig.project;

  // Save config if requested
  if (args.includes("--save-config")) {
    saveConfig({ org: ADO_ORG, project: ADO_PROJECT, repo: ADO_REPO });
    console.log("Config saved to ~/.tippani/config.json");
  }

  console.log(`  Org: ${ADO_ORG} | Project: ${ADO_PROJECT} | Repo: ${ADO_REPO}`);

  const forceRefresh = args.includes("--refresh");
  _isOffline = args.includes("--offline");

  // Host integration: --port / --headless / --ado-token (or the
  // TIPPANI_* env equivalents). Port lets multiple PRs run at once; headless
  // skips opening a browser (agent-only sessions); ado-token accepts a bearer
  // (e.g. an Entra token) so no PAT / az CLI is needed.
  const portArg = args.find(a => a.startsWith("--port="));
  const portVal = portArg ? parseInt(portArg.split("=")[1], 10) : parseInt(process.env.TIPPANI_PORT || "", 10);
  if (Number.isFinite(portVal) && portVal > 0) PORT = portVal;
  const headless = args.includes("--headless") || process.env.TIPPANI_HEADLESS === "1";
  const adoToken = (args.find(a => a.startsWith("--ado-token="))?.split("=").slice(1).join("=")) || process.env.TIPPANI_ADO_TOKEN || null;

  // Try cache first
  _cache = loadCache(_prId);

  if (_isOffline && !_cache) {
    console.error("No cache found. Run once online first, then use --offline.");
    process.exit(1);
  }

  if (_cache && isCacheFresh(_cache) && !forceRefresh && !_isOffline) {
    // Fresh cache available — still need auth for live actions
    console.log("  Using cached data (cached " + new Date(_cache.cachedAt).toLocaleString() + ")");
    _pr = _cache.pr;
    applyRepoContextFromPR(_pr);
    _branch = _cache.branch;
    _changedFiles = _cache.changedFiles;
    _otherChangedFiles = _cache.otherChangedFiles || [];

    // Establish connection for live actions (comment sync etc.)
    let pat = loadPat();
    if (adoToken) {
      _conn = getAdoConnectionBearer(adoToken);
    } else if (pat) {
      _conn = getAdoConnection(pat);
    } else {
      const token = await getTokenFromAzCli();
      if (token) {
        _conn = getAdoConnectionBearer(token);
      }
      // If no auth available, operate with cached data only
    }
  } else if (_isOffline) {
    // Pure offline — skip auth entirely
    console.log("  Offline mode — using cached data (cached " + new Date(_cache.cachedAt).toLocaleString() + ")");
    _pr = _cache.pr;
    applyRepoContextFromPR(_pr);
    _branch = _cache.branch;
    _changedFiles = _cache.changedFiles;
    _otherChangedFiles = _cache.otherChangedFiles || [];
    _conn = null;
  } else {
    // Need to fetch from ADO
    let pat = loadPat();

    if (adoToken) {
      console.log("Authenticated via provided ADO token.");
      _conn = getAdoConnectionBearer(adoToken);
    } else if (pat) {
      console.log("Using saved PAT...");
      _conn = getAdoConnection(pat);
    } else {
      console.log("Trying az CLI for authentication...");
      const token = await getTokenFromAzCli();
      if (token) {
        console.log("Authenticated via az CLI.");
        _conn = getAdoConnectionBearer(token);
      } else {
        const readline = await import("readline");
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        pat = await new Promise((resolve) => {
          console.log("\nNo credentials found. Recommended: run 'az login' in another terminal, then re-run tippani (no PAT needed).");
          console.log("Otherwise, generate a PAT at:");
          console.log(`  ${ADO_ORG}/_usersSettings/tokens`);
          console.log("  Scope: Code (Read & Write). Note: PAT creation may be blocked by your tenant policy.\n");
          rl.question("Paste your PAT: ", (answer) => {
            rl.close();
            resolve(answer.trim());
          });
        });
        if (!pat) {
          console.error("No PAT provided. Exiting.");
          process.exit(1);
        }
        savePat(pat);
        console.log("PAT saved to ~/.tippani/pat\n");
        _conn = getAdoConnection(pat);
      }
    }

    console.log(`Loading PR #${_prId}...`);
    try {
      _pr = await getPullRequest(_conn, _prId);
    } catch (e) {
      console.error(`\n  Error: ${friendlyAdoError(e, "Loading PR")}\n`);
      process.exit(1);
    }
    console.log(`  "${_pr.title}" by ${_pr.createdBy?.displayName}`);

    // Re-point at the PR's real repository before any repo-scoped calls.
    const _ctx = applyRepoContextFromPR(_pr);
    if (_ctx.source === "pr" && _ctx.repoName) {
      console.log(`  Repository: ${_ctx.projectName || ADO_PROJECT}/${_ctx.repoName}`);
    }

    // Warn if PR is abandoned or completed
    if (_pr.status === 3) console.log("  ⚠ This PR is abandoned. Comments may not be actionable.");
    if (_pr.status === 2) console.log("  ⚠ This PR is completed. Comments may not be actionable.");

    _branch = _pr.sourceRefName;

    console.log("  Fetching changed files...");
    let _fileResult;
    try {
      _fileResult = await getPRChangedFiles(_conn, _prId);
    } catch (e) {
      console.error(`\n  Error: ${friendlyAdoError(e, "Fetching changed files")}\n`);
      process.exit(1);
    }
    _changedFiles = _fileResult.mdFiles;
    _otherChangedFiles = _fileResult.otherFiles;
    console.log(`  ${_changedFiles.length} .md file(s) changed.`);

    // Cache file contents and threads
    console.log("  Caching file contents...");
    const fileContents = {};
    for (const f of _changedFiles) {
      try {
        fileContents[f.path] = await getFileContent(_conn, f.path, _branch);
      } catch (e) {
        console.log("    \u26A0 Could not cache " + f.path);
      }
    }
    const threads = await getCommentThreads(_conn, _prId);
    _cache = { pr: _pr, branch: _branch, changedFiles: _changedFiles, otherChangedFiles: _otherChangedFiles, fileContents, threads, cachedAt: new Date().toISOString() };
    saveCache(_prId, _cache);
    console.log("  Cached to ~/.tippani/cache/pr-" + _prId + ".json");
  }

  if (_changedFiles.length === 0) {
    const others = _otherChangedFiles || [];
    if (others.length > 0) {
      const summary = summarizeNonMarkdown(others);
      console.error(`\n  No markdown (.md) files changed in PR #${_prId}.`);
      console.error(`  tippani reviews markdown specs only, but this PR changed ${others.length} non-markdown file(s):`);
      console.error(`    ${summary.join(", ")}`);
      for (const f of others.slice(0, 5)) console.error(`      - ${f.path}`);
      if (others.length > 5) console.error(`      … and ${others.length - 5} more`);
      console.error(`\n  If the spec is a .docx/.pdf or other format, tippani can't render it yet.`);
      console.error(`  If you expected .md changes, double-check the PR id and that you're on the right repo.\n`);
    } else {
      console.error(`\n  PR #${_prId} has no reviewable changed files (it may be empty, or all changes were deletions).\n`);
    }
    process.exit(1);
  }

  // Determine push access once — gates the Edit affordance in every spec view.
  _canEdit = await computeCanEdit(_conn, _pr, _isOffline);

  // Resolve explicit file to an index
  let openIndex = null;
  if (explicitFile) {
    const idx = _changedFiles.findIndex((f) => f.path === explicitFile);
    openIndex = idx >= 0 ? idx : 0;
  }

  // Start server
  const app = express();
  app.use(express.json());

  // CSRF protection: reject cross-origin mutations
  app.use((req, res, next) => {
    // The token-gated control API (/api/v1/*) does its own bearer-token auth
    // in requireAuth(), so external (non-browser) clients like the MCP shim —
    // which send Authorization + X-Tippani-Client but no browser Origin — must
    // be allowed past this browser-origin CSRF gate.
    if (req.path.startsWith("/api/v1/")) return next();
    if (req.method !== "GET" && req.method !== "HEAD") {
      const origin = req.headers.origin || req.headers.referer || "";
      if (!origin.startsWith(`http://localhost:${PORT}`) && !origin.startsWith(`http://127.0.0.1:${PORT}`)) {
        return res.status(403).json({ error: "Forbidden: cross-origin request" });
      }
    }
    next();
  });

  // File picker or auto-redirect
  app.get("/", (_req, res) => {
    if (_changedFiles.length === 1) {
      return res.redirect("/file/0");
    }
    res.type("html").send(buildPickerPage(_pr, _changedFiles, _cache?.threads || []));
  });

  // Cross-PR feedback triage page (all threads across the PR, no file drill-in).
  app.get("/feedback", async (_req, res) => {
    let threads = _cache?.threads || [];
    if (!_isOffline && _conn) {
      try {
        threads = await getCommentThreads(_conn, _prId);
        if (_cache) { _cache.threads = threads; saveCache(_prId, _cache); }
      } catch { /* use cached threads */ }
    }
    const viewedMap = (!_isOffline && _conn) ? await getViewedMap(_conn, _prId) : {};
    res.type("html").send(buildFeedbackPage(_pr, applyPendingResolves(threads), _changedFiles, viewedMap));
  });

  // Single-thread view + reply page (used for PR-level threads that have no
  // file anchor, so they still get a "jump in and reply" experience).
  app.get("/thread/:id", async (req, res) => {
    let threads = _cache?.threads || [];
    if (!_isOffline && _conn) {
      try {
        threads = await getCommentThreads(_conn, _prId);
        if (_cache) { _cache.threads = threads; saveCache(_prId, _cache); }
      } catch { /* use cached threads */ }
    }
    const t = (threads || []).find((x) => x.id === Number(req.params.id));
    if (!t) return res.redirect("/feedback");
    const viewedMap = (!_isOffline && _conn) ? await getViewedMap(_conn, _prId) : {};
    const lastId = (t.comments || []).reduce((m, c) => Math.max(m, c.id || 0), 0);
    const isViewed = viewedMap[String(t.id)] != null && Number(viewedMap[String(t.id)]) === lastId;
    res.type("html").send(buildThreadPage(_pr, t, _drafts.get(t.id), isViewed));
  });

  // Route a thread to the right view: a FILE thread opens in the file view,
  // focused on that thread (so it shows in the context of the file, with any
  // staged draft inline); a PR-level thread opens the standalone thread page.
  app.get("/goto/thread/:id", async (req, res) => {
    let threads = _cache?.threads || [];
    if (!_isOffline && _conn) {
      try {
        threads = await getCommentThreads(_conn, _prId);
        if (_cache) { _cache.threads = threads; saveCache(_prId, _cache); }
      } catch { /* use cached threads */ }
    }
    const id = Number(req.params.id);
    const t = (threads || []).find((x) => x.id === id);
    if (!t) return res.redirect("/feedback");
    const filePath = t.threadContext?.filePath || null;
    const idx = filePath ? (_changedFiles || []).findIndex((f) => f.path === filePath) : -1;
    if (idx >= 0) {
      // Focus the thread so the freshly-loaded file page scrolls to it and
      // fills any staged draft on its first control-API poll.
      try { _focus.set(id); } catch { /* best effort */ }
      return res.redirect(`/file/${idx}`);
    }
    return res.redirect(`/thread/${id}`);
  });

  // Spec view for a specific file
  app.get("/file/:index", async (req, res) => {
    try {
      const idx = parseInt(req.params.index);
      if (isNaN(idx) || idx < 0 || idx >= _changedFiles.length) {
        return res.redirect("/");
      }
      const filePath = _changedFiles[idx].path;

      // Get content from cache or live
      let raw;
      if (_cache?.fileContents?.[filePath]) {
        raw = _cache.fileContents[filePath];
      } else if (!_isOffline && _conn) {
        raw = await getFileContent(_conn, filePath, _branch);
        if (_cache) {
          _cache.fileContents = _cache.fileContents || {};
          _cache.fileContents[filePath] = raw;
          saveCache(_prId, _cache);
        }
      } else {
        return res.status(503).send("File not in cache and running offline.");
      }

      const { metadata, body } = stripFrontmatter(raw);
      const { toc, sourceMap } = buildSourceMap(body);
      const specHtml = await renderMarkdown(body);

      // Merge cached threads + pending local comments
      let threads = _cache?.threads || [];
      if (!_isOffline && _conn) {
        try {
          threads = await getCommentThreads(_conn, _prId);
          _cache.threads = threads;
          saveCache(_prId, _cache);
        } catch { /* use cached threads */ }
      }

      // Merge pending comments as local-only threads
      const pending = loadPending(_prId);
      const pendingThreads = pending
        .filter(p => p.type === 'comment' && !p.synced)
        .map(p => ({
          id: 'local-' + p.id,
          status: 1,
          threadContext: { filePath: p.filePath, rightFileStart: { line: p.line, offset: 1 }, rightFileEnd: { line: p.line, offset: 1 } },
          comments: [{ author: { displayName: 'You (pending sync)' }, publishedDate: p.createdAt, content: p.content, renderedContent: null }]
        }));

      const allThreads = applyPendingResolves([...threads, ...pendingThreads]);

      // Pre-render comment markdown (always use safe renderer, ignore ADO's renderedContent)
      for (const t of allThreads) {
        for (const c of (t.comments || [])) {
          if (c.content) {
            c.renderedContent = await renderMarkdownSafe(c.content);
          }
        }
      }

      // canEdit gates the Edit affordance; resolved once at startup from the
      // identity's push access to the PR repo (see computeCanEdit).
      const canEdit = _canEdit;
      // Conflict guard (#49): capture the branch tip at load time. Saving passes
      // this back as oldObjectId so ADO rejects the push if the branch has moved.
      let baseObjectId = null;
      if (!_isOffline && _conn) {
        try { baseObjectId = await getBranchTip(_conn, _branch); } catch { /* non-fatal */ }
      }
      const viewedMap = (!_isOffline && _conn) ? await getViewedMap(_conn, _prId) : {};
      res.type("html").send(buildSpecPage(specHtml, toc, metadata, _pr, allThreads, filePath, sourceMap, _changedFiles, idx, body, canEdit, baseObjectId, viewedMap));
    } catch (e) {
      res.status(500).send("Error rendering spec. Check the server console for details.");
      console.error("Spec render error:", e.message);
    }
  });

  // GitHub-style diff of a staged spec edit for one file. Returns change hunks
  // (rendered "current" + "proposed" HTML, anchored to original line ranges) so
  // the file view can overlay red/green boxes without swapping the whole doc.
  app.get("/api/v1/specs/:index/diff", async (req, res) => {
    try {
      const files = _changedFiles || [];
      const idx = parseInt(req.params.index, 10);
      if (!Number.isFinite(idx) || idx < 0 || idx >= files.length) return res.json({ hunks: [] });
      const draft = _specDrafts.get(idx);
      if (!draft || !draft.content || draft.source === "user-mirror") return res.json({ hunks: [] });
      const filePath = files[idx].path;
      let raw = _cache?.fileContents?.[filePath];
      if (!raw && !_isOffline && _conn) {
        try { raw = await getFileContent(_conn, filePath, _branch); } catch { /* fall through */ }
      }
      if (!raw) return res.json({ hunks: [] });
      const { body } = stripFrontmatter(raw);
      const { body: draftBody } = stripFrontmatter(draft.content);
      if (body === draftBody) return res.json({ hunks: [] });
      const hunks = await computeSpecDiffHunks(body, draftBody);
      res.json({ hunks, source: draft.source || null, updatedAt: draft.updatedAt || null });
    } catch (e) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  });

  app.post("/api/comment", async (req, res) => {
    const action = addPending(_prId, { type: 'comment', filePath: req.body.filePath, line: req.body.line, content: req.body.content });
    if (!_isOffline && _conn) {
      try {
        await createCommentThread(_conn, _prId, req.body.filePath, req.body.line, req.body.content);
        action.synced = true;
        const pending = loadPending(_prId);
        const idx = pending.findIndex(p => p.id === action.id);
        if (idx >= 0) pending[idx].synced = true;
        savePending(_prId, pending);
        res.json({ ok: true, synced: true });
      } catch (e) {
        res.json({ ok: true, synced: false, queued: true, message: "Saved locally, will sync later" });
      }
    } else {
      res.json({ ok: true, synced: false, queued: true, message: "Saved locally (offline mode)" });
    }
  });

  // Shared reply/resolve helpers — wraps the inflight guard + pending-queue
  // bookkeeping so both /api/reply (legacy) and /api/v1/threads/:id/reply
  // (control API) share one path.
  async function doReply(threadId, content) {
    const tid = Number(threadId);
    if (Number.isFinite(tid) && !_inflight.acquire(tid)) {
      return { ok: false, status: 409, body: { error: "another reply is already in flight for this thread" } };
    }
    const action = addPending(_prId, { type: 'reply', threadId, content });
    if (!_isOffline && _conn) {
      try {
        await replyToThread(_conn, _prId, threadId, content);
        action.synced = true;
        const pending = loadPending(_prId);
        const i = pending.findIndex(p => p.id === action.id);
        if (i >= 0) pending[i].synced = true;
        savePending(_prId, pending);
        if (Number.isFinite(tid)) { _drafts.delete(tid); _inflight.release(tid); }
        return { ok: true, status: 200, body: { ok: true, synced: true } };
      } catch {
        if (Number.isFinite(tid)) _inflight.release(tid);
        return { ok: true, status: 200, body: { ok: true, synced: false, queued: true } };
      }
    }
    if (Number.isFinite(tid)) { _drafts.delete(tid); _inflight.release(tid); }
    return { ok: true, status: 200, body: { ok: true, synced: false, queued: true } };
  }
  async function doResolve(threadId) {
    const action = addPending(_prId, { type: 'resolve', threadId });
    if (!_isOffline && _conn) {
      try {
        await resolveThread(_conn, _prId, threadId);
        action.synced = true;
        const pending = loadPending(_prId);
        const i = pending.findIndex(p => p.id === action.id);
        if (i >= 0) pending[i].synced = true;
        savePending(_prId, pending);
        return { ok: true, status: 200, body: { ok: true, synced: true } };
      } catch {
        return { ok: true, status: 200, body: { ok: true, synced: false, queued: true } };
      }
    }
    return { ok: true, status: 200, body: { ok: true, synced: false, queued: true } };
  }

  // Queue a resolve locally (pending) WITHOUT pushing to ADO. Finalize's sync
  // pushes it via the existing type:'resolve' handler. Mirrors stage_draft.
  function doStageResolve(threadId) {
    addPending(_prId, { type: 'resolve', threadId });
    return { ok: true, status: 200, body: { ok: true, staged: true, synced: false } };
  }
  // Thread ids with an unsynced pending resolve (staged, not yet pushed).
  function pendingResolvedIds() {
    const set = new Set();
    try {
      for (const p of loadPending(_prId)) {
        if (p.type === 'resolve' && !p.synced) set.add(Number(p.threadId));
      }
    } catch { /* best effort */ }
    return set;
  }
  // Overlay staged resolves onto a thread list so the portal shows them as
  // resolved (pending) before Finalize pushes them.
  function applyPendingResolves(threads) {
    const ids = pendingResolvedIds();
    if (!ids.size) return threads || [];
    return (threads || []).map((t) => ids.has(Number(t.id)) ? { ...t, status: 2, pendingResolve: true } : t);
  }
  // Requires a live connection — this is deliberately NOT queued offline since
  // the whole point is durable, shared state.
  async function doSetViewed(threadId, commentId) {
    if (_isOffline || !_conn) {
      return { ok: false, status: 503, body: { error: "offline: viewed state needs a live Azure DevOps connection" } };
    }
    try {
      const map = await getViewedMap(_conn, _prId);
      if (commentId == null) delete map[String(threadId)];
      else map[String(threadId)] = Number(commentId);
      await setViewedMap(_conn, _prId, map);
      return { ok: true, status: 200, body: { ok: true, viewedCommentId: commentId == null ? null : String(commentId) } };
    } catch (e) {
      return { ok: false, status: 502, body: { error: friendlyAdoError(e, "mark viewed") } };
    }
  }


  // current staged spec draft when content is omitted) to the PR source
  // branch, then clear the draft. Lets an agent commit what the user adjusted
  // in the portal after reviewing the proposal.
  async function doCommitSpec(fileIndex, content, message) {
    const files = _changedFiles || [];
    const idx = Number(fileIndex);
    if (!Number.isFinite(idx) || idx < 0 || idx >= files.length) {
      return { ok: false, status: 404, body: { error: "file index out of range" } };
    }
    const filePath = files[idx].path;
    let bodyContent = content;
    if (typeof bodyContent !== "string") {
      const d = _specDrafts.get(idx);
      bodyContent = d?.content;
    }
    if (typeof bodyContent !== "string") {
      return { ok: false, status: 400, body: { error: "no content provided and no staged draft to commit" } };
    }
    const commitMessage = (message && String(message).trim()) || `tippani: update ${filePath.split("/").pop()}`;
    if (_isOffline || !_conn) {
      addPending(_prId, { type: "save", filePath, content: bodyContent, message: commitMessage });
      _specDrafts.delete(idx);
      return { ok: true, status: 200, body: { ok: true, synced: false, queued: true } };
    }
    try {
      const commitId = await pushFileToBranch(_conn, _branch, filePath, bodyContent, commitMessage);
      if (_cache && _cache.fileContents) { _cache.fileContents[filePath] = bodyContent; saveCache(_prId, _cache); }
      _specDrafts.delete(idx);
      _specLocks.release(idx);
      return { ok: true, status: 200, body: { ok: true, synced: true, commitId } };
    } catch (e) {
      if (isConflict(e)) {
        return { ok: false, status: 409, body: { conflict: true, error: "branch moved; reload before committing" } };
      }
      return { ok: false, status: 502, body: { error: friendlyAdoError(e, "commit spec") } };
    }
  }

  app.post("/api/reply", async (req, res) => {
    const r = await doReply(req.body.threadId, req.body.content);
    res.status(r.status).json(r.body);
  });

  app.post("/api/resolve", async (req, res) => {
    const r = await doResolve(req.body.threadId);
    res.status(r.status).json(r.body);
  });

  // Save an edited spec: commit the markdown to the PR source branch (#48).
  app.post("/api/save", async (req, res) => {
    const { filePath, content, message, baseObjectId } = req.body || {};
    if (typeof content !== "string" || !filePath) {
      return res.status(400).json({ ok: false, error: "filePath and content are required" });
    }
    const commitMessage = (message && String(message).trim()) || `tippani: update ${filePath.split("/").pop()}`;
    // Queue first so a failure/offline never loses the edit.
    const action = addPending(_prId, { type: "save", filePath, content, message: commitMessage });

    if (_isOffline || !_conn) {
      return res.json({ ok: true, synced: false, queued: true, message: "Saved locally (offline) — will push on sync." });
    }
    try {
      // Pass the load-time tip as oldObjectId (#49) — ADO rejects the push if the
      // branch moved underneath the editor (optimistic concurrency).
      const commitId = await pushFileToBranch(_conn, _branch, filePath, content, commitMessage, baseObjectId || undefined);
      const pending = loadPending(_prId);
      const idx = pending.findIndex((p) => p.id === action.id);
      if (idx >= 0) pending[idx].synced = true;
      savePending(_prId, pending);
      // Refresh the local cache so a reload shows the saved content.
      if (_cache && _cache.fileContents) {
        _cache.fileContents[filePath] = content;
        saveCache(_prId, _cache);
      }
      res.json({ ok: true, synced: true, commitId });
    } catch (e) {
      if (isConflict(e)) {
        // Branch moved — drop the queued action so it is never blindly re-pushed
        // by a later sync. The editor keeps the content; the user reloads or copies.
        removePending(_prId, action.id);
        return res.json({ ok: false, conflict: true, error: "This file was updated by someone else since you started editing." });
      }
      // Other failure: edit stays queued (no data loss). Surface an actionable error.
      res.json({ ok: false, synced: false, queued: true, error: friendlyAdoError(e, "save") });
    }
  });

  app.post("/api/review", async (req, res) => {
    try {
      const gitApi = await _conn.getGitApi();
      const vote = req.body.type === "approve" ? 10 : -5;
      res.json({ ok: true, message: "Review submitted (vote: " + vote + ")" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Sync pending actions to ADO
  app.post("/api/sync", async (req, res) => {
    if (_isOffline || !_conn) {
      return res.json({ ok: false, message: "Cannot sync in offline mode" });
    }
    const pending = loadPending(_prId);
    const unsynced = pending.filter(p => !p.synced);
    let synced = 0, failed = 0;
    const errors = [];

    for (const action of unsynced) {
      try {
        if (action.type === 'comment') {
          await createCommentThread(_conn, _prId, action.filePath, action.line, action.content);
        } else if (action.type === 'reply') {
          await replyToThread(_conn, _prId, action.threadId, action.content);
        } else if (action.type === 'resolve') {
          await resolveThread(_conn, _prId, action.threadId);
        } else if (action.type === 'save') {
          await pushFileToBranch(_conn, _branch, action.filePath, action.content, action.message);
          if (_cache && _cache.fileContents) _cache.fileContents[action.filePath] = action.content;
        }
        action.synced = true;
        synced++;
      } catch (e) {
        failed++;
        errors.push({ id: action.id, type: action.type, error: e.message });
      }
    }

    savePending(_prId, pending);

    // Refresh threads cache
    try {
      _cache.threads = await getCommentThreads(_conn, _prId);
      saveCache(_prId, _cache);
    } catch {}

    res.json({ ok: true, synced, failed, total: unsynced.length, errors });
  });

  // Get pending count for status bar
  app.get("/api/pending", (_req, res) => {
    const pending = loadPending(_prId);
    const unsynced = pending.filter(p => !p.synced);
    res.json({ count: unsynced.length, isOffline: _isOffline });
  });

  // ----- Control API (#42 Phase 1) ---------------------------------------
  // Routes live in src/control-api.js so they're mountable in tests without
  // bootstrapping the full ADO flow. Token is generated above; external
  // clients send `Authorization: Bearer <token>` + `X-Tippani-Client: <name>`
  // for mutations, just `X-Tippani-Client` for reads.
  registerControlApi(app, {
    port: PORT,
    sessionToken: _sessionToken,
    focus: _focus,
    drafts: _drafts,
    locks: _locks,
    getThreads: () => _cache?.threads || [],
    getChangedFiles: () => _changedFiles || [],
    getTriage: async () => {
      const threads = applyPendingResolves((_cache?.threads || []).filter((t) => (t.comments?.length || 0) > 0));
      const viewedMap = (!_isOffline && _conn) ? await getViewedMap(_conn, _prId) : {};
      const author = _pr?.createdBy?.displayName || "";
      const items = threads.map((t) => {
        const { resolved, waiting, lastBy } = classifyThread(t, author, viewedMap);
        const file = t.threadContext?.filePath || null;
        const line = t.threadContext?.rightFileStart?.line || null;
        const anchor = file ? `${file.split("/").pop()}${line ? ":" + line : ""}` : "PR-level";
        const last = (t.comments || [])[t.comments.length - 1];
        const gist = stripMarkdown((last?.content || "").replace(/\s+/g, " ")).slice(0, 160);
        return { id: t.id, anchor, waiting, resolved, lastBy, gist };
      });
      const counts = { total: items.length, needsYou: 0, awaitingReviewer: 0, viewed: 0, fyi: 0, resolved: 0 };
      for (const it of items) {
        if (it.waiting === "you") counts.needsYou++;
        else if (it.waiting === "reviewer") counts.awaitingReviewer++;
        else if (it.waiting === "viewed") counts.viewed++;
        else if (it.waiting === "fyi") counts.fyi++;
        else if (it.waiting === "resolved") counts.resolved++;
      }
      return { counts, threads: items };
    },
    readFileMarkdown: async (filePath) => {
      if (_cache?.fileContents?.[filePath]) return _cache.fileContents[filePath];
      if (!_isOffline && _conn) {
        const md = await getFileContent(_conn, filePath, _branch);
        _cache.fileContents = _cache.fileContents || {};
        _cache.fileContents[filePath] = md;
        return md;
      }
      return "";
    },
    postReply: doReply,
    resolveThread: doResolve,
    stageResolve: doStageResolve,
    setViewed: doSetViewed,
    specDrafts: _specDrafts,
    specLocks: _specLocks,
    commitSpec: doCommitSpec,
  });

  const server = app.listen(PORT, "127.0.0.1", () => {
    const base = `http://localhost:${PORT}`;
    const url = openIndex !== null ? `${base}/file/${openIndex}` : base;
    // Persist the session token ONLY after we own the port, so an instance
    // that fails to bind (EADDRINUSE) never deletes the running server's
    // token on exit. 0600 perms; overwritten on each successful startup.
    try {
      fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
      const tokenPath = path.join(CONFIG_DIR, "session-token");
      fs.writeFileSync(tokenPath, _sessionToken + "\n", { mode: 0o600 });
      // Register this portal so MCP clients can discover it by PR/port and
      // adopt it instead of colliding on the port (multi-PR parallelism).
      writeInstance({ port: PORT, prId: _prId, token: _sessionToken, pid: process.pid, url: base });
      const cleanup = () => {
        try { fs.unlinkSync(tokenPath); } catch {}
        removeInstance(PORT);
      };
      process.on("exit", cleanup);
      process.on("SIGINT", () => { cleanup(); process.exit(0); });
      process.on("SIGTERM", () => { cleanup(); process.exit(0); });
    } catch (e) {
      console.warn(`  Warning: could not persist session token: ${e.message}`);
    }
    console.log(`\n  Tippani running at ${base}`);
    console.log(`  Control API token: ${_sessionToken}`);
    console.log(`  External clients: set Authorization: Bearer <token> and X-Tippani-Client: <name>\n`);
    if (!headless) open(url);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n  Error: Port ${PORT} is already in use. Is another tippani instance running?\n`);
    } else {
      console.error(`\n  Error starting server: ${err.message}\n`);
    }
    process.exit(1);
  });
}

main().catch((e) => {
  console.error(`\n  Error: ${friendlyAdoError(e, "Startup")}\n`);
  process.exit(1);
});
