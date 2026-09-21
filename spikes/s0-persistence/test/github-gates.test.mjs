// Offline correctness + detection for the live provider gates against an
// in-memory fake of the GitHub REST API (Contents API blob-sha CAS, branch
// refs, commit history). Proves the GitHub transport + the shared gates without
// a live repo; a live run confirms it.

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { GitHubRepoStore } from "../src/adapters/github-repo-store.mjs";
import {
  conditionalDeleteGitHubRef,
  writeAskPassFiles,
} from "../src/adapters/github-ref-delete.mjs";
import { createCleanupAuthorization } from "../src/cleanup-manifest.mjs";
import { ONEDRIVE_GATE_IMPLEMENTATIONS } from "../src/onedrive-gates.mjs";
import { createSyntheticWorkspace } from "../src/synthetic-fixtures.mjs";

let pass = 0;
let fail = 0;
async function check(name, action) {
  try { await action(); pass++; }
  catch (error) { fail++; console.error(`  FAIL: ${name}`); console.error(`        ${error.stack || error}`); }
}

const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
const gitBlobSha = (content) => crypto.createHash("sha1")
  .update(`blob ${Buffer.byteLength(content)}\0${content}`)
  .digest("hex");

function fakeGitHubRepo() {
  const files = new Map();        // path -> { blobSha, content }
  const history = new Map();      // path -> [ { commitSha, content } ]
  let seq = 0;
  let tip = "base";               // current branch tip commit sha
  let defaultTip = "base";
  let branchCreated = false;
  const stats = { refCreateAttempts: 0, markerWrites: 0 };
  const okJson = (obj, status = 200) => ({ ok: true, status, json: async () => obj, text: async () => JSON.stringify(obj) });
  return {
    stats,
    advanceDefault(nextTip) {
      defaultTip = nextTip;
    },
    seedRunBranch(markerContent) {
      branchCreated = true;
      const blobSha = gitBlobSha(markerContent);
      const commitSha = `c${++seq}`;
      files.set(".tippani-s0-run", { blobSha, content: markerContent });
      history.set(".tippani-s0-run", [{ commitSha, content: markerContent }]);
      tip = commitSha;
    },
    seedWorkspace(workspace) {
      const rel = `${workspace.workspaceId}.json`;
      const content = JSON.stringify(workspace);
      const blobSha = gitBlobSha(content);
      const commitSha = `c${++seq}`;
      files.set(rel, { blobSha, content });
      history.set(rel, [{ commitSha, content }]);
      tip = commitSha;
    },
    async fetch(url, opts) {
      const u = new URL(url);
      const p = u.pathname;
      const method = opts.method;

      if (/\/repos\/[^/]+\/[^/]+$/.test(p) && method === "GET") return okJson({ default_branch: "main" });
      if (p.endsWith("/git/ref/heads/main") && method === "GET") return okJson({ object: { sha: defaultTip } });
      if (/\/git\/ref\/heads\//.test(p) && method === "GET") return okJson({ object: { sha: tip } });
      if (p.endsWith("/git/refs") && method === "POST") {
        stats.refCreateAttempts++;
        if (branchCreated) return { ok: false, status: 422, json: async () => ({}) };
        branchCreated = true;
        return okJson({ ref: "created" }, 201);
      }
      if (/\/git\/refs\/heads\//.test(p) && method === "DELETE") return { ok: true, status: 204, json: async () => ({}) };

      // contents
      const contents = p.match(/\/contents\/(.*)$/);
      if (contents) {
        const rel = decodeURIComponent(contents[1]);
        if (method === "GET" && rel === "") { // list
          const value = [...files.keys()].map((k) => ({ name: k, path: k, type: "file" }));
          return okJson(value);
        }
        if (method === "GET") {
          const ref = u.searchParams.get("ref");
          if (ref && ref !== tip && ref !== "base") { // read at an older commit
            const entry = (history.get(rel) || []).find((h) => h.commitSha === ref);
            return entry ? okJson({ content: b64(entry.content), sha: ref }) : { ok: false, status: 404 };
          }
          const file = files.get(rel);
          return file ? okJson({ content: b64(file.content), sha: file.blobSha }) : { ok: false, status: 404 };
        }
        if (method === "PUT") {
          const body = JSON.parse(opts.body);
          const content = Buffer.from(body.content, "base64").toString("utf8");
          const existing = files.get(rel);
          if (body.sha === undefined && existing) return { ok: false, status: 422, json: async () => ({}) };
          if (body.sha !== undefined && existing && body.sha !== existing.blobSha) return { ok: false, status: 409, json: async () => ({}) };
          const blobSha = gitBlobSha(content);
          seq++;
          const commitSha = `c${seq}`;
          files.set(rel, { blobSha, content });
          if (!history.has(rel)) history.set(rel, []);
          history.get(rel).push({ commitSha, content });
          tip = commitSha;
          if (rel === ".tippani-s0-run") stats.markerWrites++;
          return okJson({ content: { sha: blobSha }, commit: { sha: commitSha } }, existing ? 200 : 201);
        }
        if (method === "DELETE") { files.delete(rel); tip = `c${++seq}`; return okJson({ commit: { sha: tip } }); }
      }
      // commits
      if (p.endsWith("/commits") && method === "GET") {
        const item = decodeURIComponent(u.searchParams.get("path"));
        const value = [...(history.get(item) || [])].reverse().map((h) => ({ sha: h.commitSha }));
        return okJson(value);
      }
      return { ok: false, status: 400, json: async () => ({}), text: async () => "" };
    },
  };
}

function liveContext(scenarioId) {
  const repo = fakeGitHubRepo();
  const runId = `s0-gh-gate-${scenarioId.toLowerCase()}`;
  const storeRoot = path.resolve("spikes/s0-persistence/.test-state", runId);
  fs.rmSync(storeRoot, { recursive: true, force: true });
  fs.mkdirSync(storeRoot, { recursive: true });
  return {
    config: { runId, adapter: "github", backingPath: "github", dryRun: false },
    scenario: { id: scenarioId },
    inProcessProviderClients: true,
    primaryRoot: storeRoot,
    createStore: () => new GitHubRepoStore({
      dryRun: false, owner: "O", repo: "R", runId,
      githubToken: "syn-token", fetchImpl: (u, o) => repo.fetch(u, o), storeRoot,
    }),
    cleanupLocal: () => fs.rmSync(storeRoot, { recursive: true, force: true }),
  };
}

for (const [id, impl] of Object.entries(ONEDRIVE_GATE_IMPLEMENTATIONS)) {
  await check(`gate ${id} reports evidence no stronger than the fake GitHub execution`, async () => {
    const context = liveContext(id);
    try {
      const result = await impl(context);
      if (["S0-COL-002", "S0-COL-003", "S0-COL-006", "S0-BKP-004"].includes(id)) {
        assert.match(result.skip, /in-process|atomic authoritative head/i);
        assert.equal(result.evidence, undefined);
        return;
      }
      assert.ok(result && result.evidence, `${id} must return evidence, got ${JSON.stringify(result)}`);
      assert.ok(!result.blocked, `${id} must not be blocked in a live GitHub context`);
      if (id === "S0-BCK-005") {
        assert.deepEqual(result.evidence.faultsExercised,
          ["auth-expiry", "outage", "quota", "permission-loss", "throttle"]);
        assert.equal(result.evidence.throttleResponses, 1);
        assert.equal(result.evidence.throttleRecoveredByBoundedRetry, true);
        assert.equal(result.evidence.retries, 1);
        assert.deepEqual(result.evidence.retryAfterSeconds, [1]);
        assert.ok(result.evidence.backoffMs >= 1000);
        assert.ok(result.evidence.transferredBytes > 0);
      }
      if (id === "S0-REC-003") {
        assert.equal(result.evidence.faultsExercised.includes("lost-response"), true);
        assert.equal(result.evidence.throttleRecovery.boundedRetries, 1);
      }
      if (["S0-COL-005", "S0-REC-004"].includes(id)) {
        assert.equal(result.evidence.processRestartRecoveredQueue, true);
        assert.notEqual(result.evidence.queueRestartInspectorProcessId, process.pid);
        const writers = result.evidence.queueWriterProcessIds ||
          [result.evidence.queueWriterProcessId];
        assert(writers.every((pid) => Number.isInteger(pid) && pid !== process.pid));
      }
    } finally {
      context.cleanupLocal();
    }
  });
}

await check("GitHub resolveAlias fails closed on duplicate persisted aliases", async () => {
  const repo = fakeGitHubRepo();
  const store = new GitHubRepoStore({
    dryRun: false,
    owner: "O",
    repo: "R",
    runId: "s0-github-duplicate-alias",
    githubToken: "syn-token",
    fetchImpl: (url, request) => repo.fetch(url, request),
  });
  await store.initialize();
  const left = createSyntheticWorkspace({ seed: "github-duplicate-left" });
  const right = createSyntheticWorkspace({ seed: "github-duplicate-right" });
  right.aliases = [left.aliases[0]];
  repo.seedWorkspace(left);
  repo.seedWorkspace(right);
  await assert.rejects(
    store.resolveAlias(left.aliases[0]),
    (error) => error.code === "alias_conflict",
  );
});

await check("GitHub restore validates then fails before any contents mutation", async () => {
  const repo = fakeGitHubRepo();
  const store = new GitHubRepoStore({
    dryRun: false,
    owner: "O",
    repo: "R",
    runId: "s0-github-restore-unsupported",
    githubToken: "syn-token",
    fetchImpl: (url, request) => repo.fetch(url, request),
  });
  await store.initialize();
  const markerWrites = repo.stats.markerWrites;
  await assert.rejects(
    store.restore({
      schemaVersion: 1,
      syntheticData: true,
      workspaces: [createSyntheticWorkspace({ seed: "github-restore" })],
    }),
    (error) => error.code === "restore_atomicity_unsupported",
  );
  assert.equal(repo.stats.markerWrites, markerWrites);
});

await check("gates report Blocked outside a live provider context", async () => {
  for (const [id, impl] of Object.entries(ONEDRIVE_GATE_IMPLEMENTATIONS)) {
    const result = await impl({ config: { backingPath: "local", dryRun: false }, scenario: { id } });
    assert.ok(result.blocked, `${id} must be Blocked on a local backing path`);
  }
});

await check("GitHub initialize attaches after the default branch advances", async () => {
  const repo = fakeGitHubRepo();
  const options = {
    dryRun: false,
    owner: "O",
    repo: "R",
    runId: "s0-github-safe-attach",
    githubToken: "syn-token",
    fetchImpl: (url, request) => repo.fetch(url, request),
  };
  const first = new GitHubRepoStore(options);
  await first.initialize();
  assert.equal(repo.stats.refCreateAttempts, 1);
  assert.equal(repo.stats.markerWrites, 1);
  await first.createWorkspace(createSyntheticWorkspace({ seed: "github-safe-attach" }));
  repo.advanceDefault("base-advanced");

  const resumed = new GitHubRepoStore(options);
  await resumed.initialize();
  assert.equal(repo.stats.refCreateAttempts, 2);
  assert.equal(repo.stats.markerWrites, 1, "attach must not replace the immutable marker");
});

await check("GitHub initialize rejects a foreign preexisting run branch", async () => {
  const repo = fakeGitHubRepo();
  repo.seedRunBranch(JSON.stringify({
    schemaVersion: 1,
    syntheticData: true,
    kind: "tippani-s0-github-run",
    runId: "s0-someone-else",
    ownershipMarker: "tippani-s0:s0-someone-else",
    namespace: "tippani-s0/s0-someone-else",
    branch: "refs/heads/tippani-s0/s0-someone-else",
    owner: "O",
    repository: "R",
    baseSha: "base",
  }));
  const foreign = new GitHubRepoStore({
    dryRun: false,
    owner: "O",
    repo: "R",
    runId: "s0-github-foreign-branch",
    githubToken: "syn-token",
    fetchImpl: (url, request) => repo.fetch(url, request),
  });
  await assert.rejects(
    foreign.initialize(),
    (error) => error.code === "branch_ownership_conflict",
  );
  assert.equal(repo.stats.markerWrites, 0);
});

await check("GitHub teardown conditionally deletes the exact prepared ref", async () => {
  const runId = "s0-github-cleanup";
  const expectedSha = "a".repeat(40);
  const baseSha = "b".repeat(40);
  let deleted = false;
  let deleteInput;
  let store;
  store = new GitHubRepoStore({
    dryRun: false,
    owner: "O",
    repo: "R",
    runId,
    cleanupManifestId: `syn-cleanup-${runId}`,
    effectiveTargetHash: "sha256:syn-target",
    githubToken: "syn-token",
    fetchImpl: async (url, options) => {
      if (url.includes("/contents/.tippani-s0-run")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            content: b64(store.runMarkerContent(baseSha)),
            sha: store.runMarkerBlobSha(baseSha),
          }),
        };
      }
      return deleted
        ? { ok: false, status: 404, headers: new Headers(), json: async () => ({}) }
        : {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ object: { sha: expectedSha } }),
        };
    },
    deleteRef: async (input) => {
      deleteInput = input;
      deleted = true;
      return { ok: true };
    },
  });
  await assert.rejects(store.cleanup(), /manifest authorization/);
  const authorization = createCleanupAuthorization({
    runId,
    backingPath: "github",
    sandbox: {
      ownershipMarker: `tippani-s0:${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      coordinates: { owner: "O", repository: "R" },
      cleanup: { manifestId: `syn-cleanup-${runId}` },
    },
  }, store);
  await store.prepareCleanup(authorization);
  await store.cleanup(authorization);
  assert.equal(deleteInput.ref, `refs/heads/tippani-s0/${runId}`);
  assert.equal(deleteInput.expectedSha, expectedSha);
  assert.equal(deleteInput.token, "syn-token");
  assert.equal(authorization.manifest.phase(authorization.resource), "cleaned");
  assert.equal(authorization.manifest.authorize(authorization.resource), false);
  assert.equal(JSON.stringify(store.providerOperationManifest()).includes("syn-token"), false);
});

await check("a moved GitHub ref rejects the lease and remains in the manifest", async () => {
  const runId = "s0-github-cleanup-race";
  const preparedTip = "c".repeat(40);
  const movedTip = "d".repeat(40);
  const baseSha = "e".repeat(40);
  let tip = preparedTip;
  let store;
  store = new GitHubRepoStore({
    dryRun: false,
    owner: "O",
    repo: "R",
    runId,
    cleanupManifestId: `syn-cleanup-${runId}`,
    effectiveTargetHash: "sha256:syn-target",
    githubToken: "syn-token",
    fetchImpl: async (url) => {
      if (url.includes("/contents/.tippani-s0-run")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            content: b64(store.runMarkerContent(baseSha)),
            sha: store.runMarkerBlobSha(baseSha),
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ object: { sha: tip } }),
      };
    },
    deleteRef: async ({ expectedSha }) => {
      assert.equal(expectedSha, preparedTip);
      return { ok: false, reason: "lease_rejected" };
    },
  });
  const authorization = createCleanupAuthorization({
    runId,
    backingPath: "github",
    sandbox: {
      ownershipMarker: `tippani-s0:${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      coordinates: { owner: "O", repository: "R" },
      cleanup: { manifestId: `syn-cleanup-${runId}` },
    },
  }, store);
  await store.prepareCleanup(authorization);
  tip = movedTip;
  await assert.rejects(store.cleanup(authorization), (error) => error.code === "cleanup_conflict");
  assert.equal(tip, movedTip);
  assert.equal(authorization.manifest.phase(authorization.resource), "prepared");
  assert.equal(authorization.manifest.authorize(authorization.resource), true);
});

await check("GitHub cleanup rechecks an absent ref and rejects concurrent creation", async () => {
  const runId = "s0-github-cleanup-absent-race";
  let exists = false;
  const store = new GitHubRepoStore({
    dryRun: false,
    owner: "O",
    repo: "R",
    runId,
    cleanupManifestId: `syn-cleanup-${runId}`,
    effectiveTargetHash: "sha256:syn-target",
    githubToken: "syn-token",
    fetchImpl: async () => exists
      ? {
        ok: true,
        status: 200,
        json: async () => ({ object: { sha: "tip-new" } }),
      }
      : { ok: false, status: 404, json: async () => ({}) },
  });
  const authorization = createCleanupAuthorization({
    runId,
    backingPath: "github",
    sandbox: {
      ownershipMarker: `tippani-s0:${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      coordinates: { owner: "O", repository: "R" },
      cleanup: { manifestId: `syn-cleanup-${runId}` },
    },
  }, store);
  await store.prepareCleanup(authorization);
  exists = true;
  await assert.rejects(
    store.cleanup(authorization),
    (error) => error.code === "cleanup_conflict",
  );
  assert.equal(authorization.manifest.phase(authorization.resource), "prepared");
  assert.equal(authorization.manifest.authorize(authorization.resource), true);
});

await check("native Git cleanup rejects unsafe input before spawning", async () => {
  await assert.rejects(
    conditionalDeleteGitHubRef({
      owner: "O",
      repository: "R",
      ref: "refs/heads/.hidden",
      expectedSha: "a".repeat(40),
      token: "syn-token",
    }),
    TypeError,
  );
  await assert.rejects(
    conditionalDeleteGitHubRef({
      owner: "O",
      repository: "R",
      ref: "refs/heads/safe",
      expectedSha: "a".repeat(40),
      token: "unsafe\ntoken",
    }),
    TypeError,
  );
});

await check("native Git cleanup uses an executable Windows askpass shim", () => {
  const root = fs.mkdtempSync(path.join(process.cwd(), ".github-askpass-"));
  try {
    const askpassPath = writeAskPassFiles(root, "win32");
    assert.equal(path.extname(askpassPath), ".cmd");
    assert.equal(fs.existsSync(path.join(root, "askpass.cjs")), true);
    const command = fs.readFileSync(askpassPath, "utf8");
    assert.match(command, /askpass\.cjs/);
    assert.match(command, /%\*/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

await check("GitHub cleanup returns to prepared after a confirmed authentication failure", async () => {
  const runId = "s0-github-cleanup-auth";
  const expectedSha = "f".repeat(40);
  const baseSha = "1".repeat(40);
  let store;
  store = new GitHubRepoStore({
    dryRun: false,
    owner: "O",
    repo: "R",
    runId,
    cleanupManifestId: `syn-cleanup-${runId}`,
    effectiveTargetHash: "sha256:syn-target",
    githubToken: "syn-token",
    fetchImpl: async (url) => url.includes("/contents/.tippani-s0-run")
      ? {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          content: b64(store.runMarkerContent(baseSha)),
          sha: store.runMarkerBlobSha(baseSha),
        }),
      }
      : {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ object: { sha: expectedSha } }),
      },
    deleteRef: async () => ({ ok: false, reason: "authentication_failed" }),
  });
  const authorization = createCleanupAuthorization({
    runId,
    backingPath: "github",
    sandbox: {
      ownershipMarker: `tippani-s0:${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      coordinates: { owner: "O", repository: "R" },
      cleanup: { manifestId: `syn-cleanup-${runId}` },
    },
  }, store);
  await store.prepareCleanup(authorization);
  await assert.rejects(
    store.cleanup(authorization),
    (error) => error.code === "provider_error" && error.reason === "authentication_failed",
  );
  assert.equal(authorization.manifest.phase(authorization.resource), "prepared");
});

await check("GitHub cleanup preserves mutating state when absence cannot be confirmed", async () => {
  const runId = "s0-github-cleanup-reconcile";
  const expectedSha = "2".repeat(40);
  const baseSha = "3".repeat(40);
  let deletionAttempted = false;
  let store;
  store = new GitHubRepoStore({
    dryRun: false,
    owner: "O",
    repo: "R",
    runId,
    cleanupManifestId: `syn-cleanup-${runId}`,
    effectiveTargetHash: "sha256:syn-target",
    githubToken: "syn-token",
    fetchImpl: async (url) => {
      if (deletionAttempted) return { ok: false, status: 503, headers: new Headers() };
      if (url.includes("/contents/.tippani-s0-run")) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            content: b64(store.runMarkerContent(baseSha)),
            sha: store.runMarkerBlobSha(baseSha),
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ object: { sha: expectedSha } }),
      };
    },
    deleteRef: async () => {
      deletionAttempted = true;
      return { ok: true };
    },
  });
  const authorization = createCleanupAuthorization({
    runId,
    backingPath: "github",
    sandbox: {
      ownershipMarker: `tippani-s0:${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      coordinates: { owner: "O", repository: "R" },
      cleanup: { manifestId: `syn-cleanup-${runId}` },
    },
  }, store);
  await store.prepareCleanup(authorization);
  await assert.rejects(
    store.cleanup(authorization),
    (error) => error.code === "cleanup_indeterminate" && error.requiresReconciliation === true,
  );
  assert.equal(authorization.manifest.phase(authorization.resource), "mutating");
});

console.log(`s0-github-gates: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
