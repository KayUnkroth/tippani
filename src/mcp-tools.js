// MCP tool definitions and HTTP client for the tippani shim.
// Extracted from src/mcp.js so the tool surface can be unit-tested without
// spawning an MCP transport.

import fs from "fs";
import { z } from "zod";

export function loadSessionToken(tokenPath) {
  try {
    const t = fs.readFileSync(tokenPath, "utf-8").trim();
    return t || null;
  } catch {
    return null;
  }
}

export function createHttpClient({ baseUrl, getBaseUrl, token, getToken, clientName, fetch: fetchImpl = fetch }) {
  const resolveToken = typeof getToken === "function" ? getToken : () => token;
  const resolveBaseUrl = typeof getBaseUrl === "function" ? getBaseUrl : () => baseUrl;
  function headers(extra = {}) {
    const t = resolveToken();
    if (!t) {
      const err = new Error(
        "No tippani session yet — call open_pr first to launch the review portal."
      );
      err.status = 0;
      throw err;
    }
    return {
      "X-Tippani-Client": clientName,
      "Authorization": `Bearer ${t}`,
      ...extra,
    };
  }
  async function req(method, path, body) {
    const init = { method, headers: headers() };
    if (body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    const r = await fetchImpl(resolveBaseUrl() + path, init);
    let parsed = null;
    try { parsed = await r.json(); } catch {}
    if (!r.ok) {
      const msg = (parsed && parsed.error) || r.statusText || ("HTTP " + r.status);
      const err = new Error(msg);
      err.status = r.status;
      err.body = parsed;
      throw err;
    }
    return parsed;
  }
  return {
    get: (p) => req("GET", p),
    post: (p, b) => req("POST", p, b),
    put: (p, b) => req("PUT", p, b),
    delete: (p) => req("DELETE", p),
  };
}

export function buildTools(http, session) {
  // Move the user to a portal path. Single-tab mode (default) steers the one
  // open browser tab in place via the control API; separate-tabs mode opens a
  // fresh browser tab per nav (TIPPANI_SEPARATE_TABS=1).
  async function navigate(path) {
    if (session && session.separateTabs && typeof session.openUrl === "function") {
      await session.openUrl(path);
    } else {
      try { await http.post("/api/v1/nav", { path }); } catch {}
    }
  }
  return [
    {
      name: "open_pr",
      description:
        "Open a spec PR in the tippani review portal — launches a VISIBLE " +
        "browser window so the user watches the review — and load its comment " +
        "threads and changed files. Call this FIRST, before any other tippani " +
        "tool; every other tool operates on the PR opened here. Returns the " +
        "open comment threads. This is the only supported way to review a spec " +
        "PR; do not use the Azure DevOps MCP or git for PR review.",
      inputSchema: {
        prId: z.number().describe("Azure DevOps pull request id"),
        org: z.string().optional().describe(
          "ADO org URL, e.g. https://dev.azure.com/myorg (falls back to saved config)"),
        project: z.string().optional().describe(
          "ADO project name (falls back to saved config)"),
        repo: z.string().optional().describe(
          "ADO repo name (optional; auto-detected from the PR)"),
        refresh: z.boolean().optional().describe(
          "Force re-fetch from ADO, ignoring any cache"),
      },
      handler: async ({ prId, org, project, repo, refresh }) => {
        if (!session || typeof session.ensurePortal !== "function") {
          throw new Error("Portal launcher unavailable in this context.");
        }
        const bind = await session.ensurePortal({ prId, org, project, repo, refresh });
        const data = await http.get("/api/v1/threads");
        const threads = (data && data.threads) || [];
        const openThreads = threads.filter((t) => !t.resolved);
        return {
          prId: Number(prId),
          portalUrl: bind && bind.url,
          openThreadCount: openThreads.length,
          threads,
        };
      },
    },
    {
      name: "list_threads",
      description:
        "List every comment thread on the open PR with status, file, line, " +
        "and comment count. Use this first to see what's open.",
      inputSchema: {},
      handler: () => http.get("/api/v1/threads"),
    },
    {
      name: "triage_summary",
      description:
        "Get a categorized triage summary of every thread on the PR: counts of " +
        "needs-your-reply / awaiting-reviewer / viewed / for-your-information / resolved, " +
        "plus a per-thread list (anchor, category, gist). Use right after show_feedback to " +
        "give the user a brief spoken summary (e.g. 'X resolved, Y need your reply, Z can be " +
        "ignored') and offer to mark the ignorable (FYI) threads as viewed via mark_viewed.",
      inputSchema: {},
      handler: () => http.get("/api/v1/triage"),
    },
    {
      name: "open_thread",
      description:
        "Open a specific comment thread in the user's browser — a single-thread view " +
        "with the comments and a reply box that shows any staged draft. Use to bring the " +
        "user to a thread you want them to look at, or right after stage_draft so they can " +
        "review and post your proposed reply.",
      inputSchema: { threadId: z.number() },
      handler: async ({ threadId }) => {
        await navigate(`/goto/thread/${threadId}`);
        return { ok: true, opened: `/goto/thread/${threadId}` };
      },
    },
    {
      name: "show_feedback",
      description:
        "Open the Feedback page in the user's browser — a cross-thread triage list of every " +
        "comment thread on the PR with its status (needs your reply / awaiting reviewer / " +
        "viewed / resolved) and expandable full threads. Use when the user wants to triage " +
        "the whole PR at a glance rather than drilling into a single file or thread.",
      inputSchema: {},
      handler: async () => {
        await navigate(`/feedback`);
        return { ok: true, opened: `/feedback` };
      },
    },
    {
      name: "open_file",
      description:
        "Open a changed file in the user's browser at the file view, optionally scrolled to a " +
        "line. Use to bring the user to a file or section that isn't tied to a comment (e.g. " +
        "\"show me the Meta-programming section\") — resolve a heading to its line with get_spec " +
        "first. Read-only: opens the view, changes nothing.",
      inputSchema: {
        fileIndex: z.number().describe("0-based index into the PR's changed files"),
        line: z.number().optional().describe("1-based line to scroll to"),
      },
      handler: async ({ fileIndex, line }) => {
        const path = `/file/${fileIndex}` + (line ? `?line=${line}` : "");
        await navigate(path);
        return { ok: true, opened: path };
      },
    },
    {
      name: "get_thread",
      description:
        "Get full content of one thread: every comment plus any staged draft. " +
        "Use after list_threads to read what a reviewer actually said.",
      inputSchema: { threadId: z.number().describe("Thread id from list_threads") },
      handler: ({ threadId }) => http.get(`/api/v1/threads/${threadId}`),
    },
    {
      name: "focus_thread",
      description:
        "Scroll the user's browser to a thread and highlight it. RPC command — " +
        "user sees the change within ~1.5s (browser polls). Pass threadId=null " +
        "to clear focus.",
      inputSchema: { threadId: z.number().nullable().describe("Thread id, or null to clear") },
      handler: ({ threadId }) => http.post("/api/v1/commands/focus", { threadId }),
    },
    {
      name: "stage_draft",
      description:
        "Stage a draft reply for the user to review in tippani's UI. The user " +
        "edits or posts it; you never auto-post. Returns 409 if the user is " +
        "currently typing in that thread's textarea (try again in ~10s).",
      inputSchema: {
        threadId: z.number(),
        content: z.string().describe("Markdown body of the suggested reply"),
        source: z.string().optional().describe("Free-form attribution e.g. model name"),
      },
      handler: ({ threadId, content, source }) =>
        http.put(`/api/v1/threads/${threadId}/draft`, { content, source }),
    },
    {
      name: "clear_draft",
      description: "Remove a staged draft. Idempotent.",
      inputSchema: { threadId: z.number() },
      handler: ({ threadId }) => http.delete(`/api/v1/threads/${threadId}/draft`),
    },
    {
      name: "post_reply",
      description:
        "Post a reply to ADO directly (bypasses staging). Use only when the user " +
        "has explicitly approved a reply via this tool's caller. Returns 409 if " +
        "another reply is already in flight for the same thread.",
      inputSchema: {
        threadId: z.number(),
        content: z.string().describe("Reply body to post to ADO"),
      },
      handler: ({ threadId, content }) =>
        http.post(`/api/v1/threads/${threadId}/reply`, { content }),
    },
    {
      name: "resolve_thread",
      description: "Mark a comment thread resolved in ADO.",
      inputSchema: { threadId: z.number() },
      handler: ({ threadId }) =>
        http.post(`/api/v1/threads/${threadId}/resolve`, {}),
    },
    {
      name: "stage_resolve_thread",
      description:
        "Stage a thread resolution LOCALLY without pushing to ADO — it shows as resolved " +
        "(pending) in the portal and is pushed only at Finalize. Use this (not resolve_thread) " +
        "during review so resolves stay local and undoable until the user finalizes.",
      inputSchema: { threadId: z.number() },
      handler: ({ threadId }) =>
        http.post(`/api/v1/threads/${threadId}/stage-resolve`, {}),
    },
    {
      name: "mark_viewed",
      description:
        "Mark a comment thread as viewed/acknowledged WITHOUT resolving it: it drops out " +
        "of the \"needs your reply\" triage but stays open in ADO, and resurfaces if a newer " +
        "comment is added. Durable (stored as an ADO thread property). Use for threads the " +
        "user has read and intentionally left open. Pass clear=true to un-view.",
      inputSchema: {
        threadId: z.number(),
        clear: z.boolean().optional().describe("Un-view the thread instead of marking it viewed"),
      },
      handler: ({ threadId, clear }) =>
        clear
          ? http.delete(`/api/v1/threads/${threadId}/viewed`)
          : http.post(`/api/v1/threads/${threadId}/viewed`, {}),
    },
    {
      name: "get_spec",
      description:
        "Read the rendered markdown of one file in the PR, with a flat list of " +
        "headings (level, text, 1-based line). Use to ground replies in the " +
        "actual spec content. fileIndex matches the order in tippani's file picker.",
      inputSchema: { fileIndex: z.number().describe("0-based index into the PR's changed files") },
      handler: ({ fileIndex }) => http.get(`/api/v1/specs/${fileIndex}`),
    },
    {
      name: "stage_spec_edit",
      description:
        "Stage a proposed whole-file edit for the user to review in tippani's " +
        "editor before committing. The staged draft is review-only: the user sees " +
        "your version as a diff and can load it into the editor to refine, then " +
        "either commits their own version via Save or tells you to commit_spec with " +
        "explicit content. You never commit without the user. Returns 409 if the " +
        "user is currently editing that file (try again in ~10s).",
      inputSchema: {
        fileIndex: z.number().describe("0-based index into the PR's changed files"),
        content: z.string().describe("Full proposed markdown for the file"),
        source: z.string().optional().describe("Free-form attribution e.g. model name"),
      },
      handler: ({ fileIndex, content, source }) =>
        http.put(`/api/v1/specs/${fileIndex}/draft`, { content, source }),
    },
    {
      name: "get_spec_draft",
      description:
        "Read the current staged spec proposal for a file (the version you staged " +
        "via stage_spec_edit). Review-only — it does not reflect unsaved edits the " +
        "user is making in the portal editor. To commit, pass explicit content to " +
        "commit_spec.",
      inputSchema: { fileIndex: z.number() },
      handler: ({ fileIndex }) => http.get(`/api/v1/specs/${fileIndex}/draft`),
    },
    {
      name: "clear_spec_edit",
      description: "Remove a staged spec edit. Idempotent.",
      inputSchema: { fileIndex: z.number() },
      handler: ({ fileIndex }) => http.delete(`/api/v1/specs/${fileIndex}/draft`),
    },
    {
      name: "commit_spec",
      description:
        "Commit a spec file to the PR's source branch. You must pass the full " +
        "content to commit — the staged draft is review-only and is never committed " +
        "implicitly (this prevents a stale proposal from overwriting the user's " +
        "saved edits). Use only after the user approves. Returns 409 if the branch " +
        "moved since load (reload and retry).",
      inputSchema: {
        fileIndex: z.number(),
        content: z.string().describe("Full markdown to commit (required)"),
        message: z.string().optional().describe("Commit message"),
      },
      handler: ({ fileIndex, content, message }) =>
        http.post(`/api/v1/specs/${fileIndex}/commit`, { content, message }),
    },
  ];
}
