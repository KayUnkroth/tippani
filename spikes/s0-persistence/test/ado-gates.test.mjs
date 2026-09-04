// Offline correctness + detection for the live provider gates against an
// in-memory fake of the Azure DevOps Git REST API (branch tip as CAS token,
// oldObjectId ref precondition, commit history, ref delete). Proves the ADO
// transport + the shared gates without a live org; a live run confirms it.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { AdoGitStore } from "../src/adapters/ado-git-store.mjs";
import {
  CleanupManifest,
  createCleanupAuthorization,
} from "../src/cleanup-manifest.mjs";
import { ONEDRIVE_GATE_IMPLEMENTATIONS } from "../src/onedrive-gates.mjs";

let pass = 0;
let fail = 0;
async function check(name, action) {
  try { await action(); pass++; }
  catch (error) { fail++; console.error(`  FAIL: ${name}`); console.error(`        ${error.stack || error}`); }
}

const ZERO = "0000000000000000000000000000000000000000";

function fakeAdoRepo() {
  let tip = null;                 // branch tip commit id (CAS token)
  let seq = 0;
  const files = new Map();        // path -> content (current branch state)
  const history = [];             // { commitId, snapshot: Map }
  const okJson = (obj) => ({ ok: true, status: 200, json: async () => obj, text: async () => JSON.stringify(obj) });
  return {
    async fetch(url, opts) {
      const u = new URL(url);
      const p = u.pathname;
      const method = opts.method;

      if (p.endsWith("/refs") && method === "GET") {
        return okJson({ value: tip ? [{ name: `refs/heads/${u.searchParams.get("filter").replace("heads/", "")}`, objectId: tip }] : [] });
      }
      if (p.endsWith("/refs") && method === "POST") { // delete branch
        tip = null; files.clear();
        return okJson({ value: [{ success: true }] });
      }
      if (p.endsWith("/items") && method === "GET") {
        const single = u.searchParams.get("path");
        if (single) {
          const key = single.replace(/^\//, "");
          const vt = u.searchParams.get("versionDescriptor.versionType");
          if (vt === "commit") {
            const entry = history.find((h) => h.commitId === u.searchParams.get("versionDescriptor.version"));
            const content = entry?.snapshot.get(key);
            return content === undefined ? { ok: false, status: 404 } : { ok: true, status: 200, text: async () => content };
          }
          const content = files.get(key);
          return content === undefined ? { ok: false, status: 404 } : { ok: true, status: 200, text: async () => content };
        }
        // list
        return okJson({ value: [...files.keys()].map((k) => ({ path: `/${k}`, isFolder: false })) });
      }
      if (p.endsWith("/commits") && method === "GET") {
        const item = u.searchParams.get("searchCriteria.itemPath").replace(/^\//, "");
        const value = [...history].reverse().filter((h) => h.snapshot.has(item)).map((h) => ({ commitId: h.commitId }));
        return okJson({ value });
      }
      if (p.endsWith("/pushes") && method === "POST") {
        const push = JSON.parse(opts.body);
        const old = push.refUpdates[0].oldObjectId;
        const expected = tip ?? ZERO;
        if (old !== expected) {
          return { ok: false, status: 409, text: async () => "TF401028: updated by another client", json: async () => ({}) };
        }
        for (const change of push.commits[0].changes) {
          const key = change.item.path.replace(/^\//, "");
          if (change.changeType === "delete") files.delete(key);
          else files.set(key, change.newContent.content);
        }
        tip = `c${++seq}`;
        history.push({ commitId: tip, snapshot: new Map(files) });
        return { ok: true, status: 201, json: async () => ({ refUpdates: [{ newObjectId: tip }], commits: [{ commitId: tip }] }) };
      }
      return { ok: false, status: 400, text: async () => "", json: async () => ({}) };
    },
  };
}

function liveContext(scenarioId) {
  const repo = fakeAdoRepo();
  const runId = `s0-ado-gate-${scenarioId.toLowerCase()}`;
  const storeRoot = path.resolve("spikes/s0-persistence/.test-state", runId);
  fs.rmSync(storeRoot, { recursive: true, force: true });
  fs.mkdirSync(storeRoot, { recursive: true });
  return {
    config: { runId, adapter: "ado", backingPath: "ado", dryRun: false },
    scenario: { id: scenarioId },
    inProcessProviderClients: true,
    primaryRoot: storeRoot,
    createStore: () => new AdoGitStore({
      dryRun: false, org: "O", project: "P", repo: "R", runId,
      adoToken: "syn-token", fetchImpl: (u, o) => repo.fetch(u, o), storeRoot,
    }),
    cleanupLocal: () => fs.rmSync(storeRoot, { recursive: true, force: true }),
  };
}

for (const [id, impl] of Object.entries(ONEDRIVE_GATE_IMPLEMENTATIONS)) {
  await check(`gate ${id} passes against the fake ADO repo`, async () => {
    const context = liveContext(id);
    try {
      const result = await impl(context);
      assert.ok(result && result.evidence, `${id} must return evidence, got ${JSON.stringify(result)}`);
      assert.ok(!result.blocked, `${id} must not be blocked in a live ADO context`);
      if (["S0-COL-002", "S0-COL-003", "S0-COL-006"].includes(id)) {
        assert.equal(result.evidence.accounts, 1);
        assert.equal(result.evidence.clientProcesses, 2);
      }
      if (id === "S0-BCK-005") {
        assert.deepEqual(result.evidence.faultsExercised,
          ["throttle", "auth-expiry", "outage", "quota", "permission-loss"]);
        assert.equal(result.evidence.throttleResponses, 1);
        assert.ok(result.evidence.transferredBytes > 0);
      }
      if (id === "S0-REC-003") {
        assert.equal(result.evidence.faultsExercised.includes("lost-response"), true);
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

await check("gates report Blocked outside a live provider context", async () => {
  for (const [id, impl] of Object.entries(ONEDRIVE_GATE_IMPLEMENTATIONS)) {
    const result = await impl({ config: { backingPath: "local", dryRun: false }, scenario: { id } });
    assert.ok(result.blocked, `${id} must be Blocked on a local backing path`);
  }
});

await check("ADO teardown is manifest-authorized and oldObjectId-conditional", async () => {
  const runId = "s0-ado-cleanup";
  let conditional = false;
  const store = new AdoGitStore({
    dryRun: false,
    org: "O",
    project: "P",
    repo: "R",
    runId,
    cleanupManifestId: `syn-cleanup-${runId}`,
    effectiveTargetHash: "sha256:syn-target",
    adoToken: "syn-token",
    fetchImpl: async (_url, options) => {
      if (options.method === "GET") {
        return { ok: true, status: 200, json: async () => ({ value: [{ objectId: "tip-1" }] }) };
      }
      const update = JSON.parse(options.body)[0];
      conditional = update.oldObjectId === "tip-1" && update.newObjectId === ZERO;
      return { ok: true, status: 200, json: async () => ({ value: [{ success: true }] }) };
    },
  });
  await assert.rejects(store.cleanup(), /manifest authorization/);
  const authorization = createCleanupAuthorization({
    runId,
    backingPath: "ado",
    sandbox: {
      ownershipMarker: `tippani-s0:${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      coordinates: { organization: "O", project: "P", repository: "R" },
      cleanup: { manifestId: `syn-cleanup-${runId}` },
    },
  }, store);
  await store.prepareCleanup(authorization);
  await store.cleanup(authorization);
  assert.equal(conditional, true);
});

await check("ADO cleanup rechecks an absent ref and rejects concurrent creation", async () => {
  const runId = "s0-ado-cleanup-absent-race";
  let tip = null;
  let updates = 0;
  const store = new AdoGitStore({
    dryRun: false,
    org: "O",
    project: "P",
    repo: "R",
    runId,
    cleanupManifestId: `syn-cleanup-${runId}`,
    effectiveTargetHash: "sha256:syn-target",
    adoToken: "syn-token",
    fetchImpl: async (_url, options) => {
      if (options.method === "GET") {
        return {
          ok: true,
          status: 200,
          json: async () => ({ value: tip ? [{ objectId: tip }] : [] }),
        };
      }
      updates++;
      return { ok: true, status: 200, json: async () => ({ value: [{ success: true }] }) };
    },
  });
  const authorization = createCleanupAuthorization({
    runId,
    backingPath: "ado",
    sandbox: {
      ownershipMarker: `tippani-s0:${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      coordinates: { organization: "O", project: "P", repository: "R" },
      cleanup: { manifestId: `syn-cleanup-${runId}` },
    },
  }, store);
  await store.prepareCleanup(authorization);
  tip = "tip-new";
  await assert.rejects(
    store.cleanup(authorization),
    (error) => error.code === "cleanup_conflict",
  );
  assert.equal(updates, 0);
  assert.equal(authorization.manifest.phase(authorization.resource), "prepared");
});

await check("ADO cleanup reconciles a crash after remote ref deletion", async () => {
  const runId = "s0-ado-cleanup-post-delete-crash";
  const root = path.resolve("spikes/s0-persistence/.test-state", runId);
  const manifestPath = path.join(root, "cleanup-manifest.json");
  const config = {
    runId,
    backingPath: "ado",
    sandbox: {
      ownershipMarker: `tippani-s0:${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      coordinates: { organization: "O", project: "P", repository: "R" },
      cleanup: { manifestId: `syn-cleanup-${runId}` },
    },
  };
  let tip = "tip-1";
  let updates = 0;
  const fetchImpl = async (_url, options) => {
    if (options.method === "GET") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ value: tip ? [{ objectId: tip }] : [] }),
      };
    }
    updates++;
    tip = null;
    return { ok: true, status: 200, json: async () => ({ value: [{ success: true }] }) };
  };
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(root, { recursive: true });
  try {
    const first = new AdoGitStore({
      dryRun: false,
      org: "O",
      project: "P",
      repo: "R",
      runId,
      cleanupManifestId: `syn-cleanup-${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      adoToken: "syn-token",
      fetchImpl,
    });
    const authorization = createCleanupAuthorization(config, first, {
      filePath: manifestPath,
    });
    await first.prepareCleanup(authorization);
    authorization.manifest.markDeleted = () => {
      throw new Error("simulated process death after remote deletion");
    };
    await assert.rejects(first.cleanup(authorization), /simulated process death/);
    assert.equal(updates, 1);
    assert.equal(CleanupManifest.load(manifestPath).resources[0].phase, "mutating");

    const resumed = new AdoGitStore({
      dryRun: false,
      org: "O",
      project: "P",
      repo: "R",
      runId,
      cleanupManifestId: `syn-cleanup-${runId}`,
      effectiveTargetHash: "sha256:syn-target",
      adoToken: "syn-token",
      fetchImpl,
    });
    const recovered = createCleanupAuthorization(config, resumed, {
      filePath: manifestPath,
    });
    const result = await resumed.cleanup(recovered);
    assert.equal(result.reconciled, true);
    assert.equal(updates, 1);
    assert.equal(CleanupManifest.load(manifestPath).resources[0].phase, "cleaned");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

console.log(`s0-ado-gates: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
