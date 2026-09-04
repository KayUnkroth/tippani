import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveEffectiveProviderConfig,
  syncTargetHash,
  resolveSyncTarget,
} from "../src/preflight.mjs";
import {
  SCENARIO_IMPLEMENTATIONS,
  assessSyncedFolderEvidence,
} from "../src/scenario-implementations.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const liveConfig = JSON.parse(fs.readFileSync(
  path.join(root, "config", "provider-onedrive-live.json"),
  "utf8",
));

const approvedEnv = {
  S0_ONEDRIVE_SYNC_ROOT: "/approved/OneDrive/tippani-s0",
  S0_SYNC_CLIENT_IDENTITY: "sync-operator@contoso.example",
  S0_SYNC_CLIENT_STATE: "verified-signed-in",
};
const approved = resolveEffectiveProviderConfig(liveConfig, approvedEnv);
const approvedHash = approved.sandbox.syncTargetHash;

let pass = 0;
let fail = 0;
async function check(name, action) {
  try { await action(); pass++; }
  catch (error) { fail++; console.error(`  FAIL: ${name}`); console.error(`        ${error.stack || error}`); }
}

function baseInput(overrides = {}) {
  return {
    approvedTargetHash: approvedHash,
    boundTargetHash: approvedHash,
    requiredClientState: "verified-signed-in",
    observedClientState: "verified-signed-in",
    observedClientIdentity: "sync-operator@contoso.example",
    independentClients: 2,
    retainedConflictEvidence: null,
    probe: { createMs: 5, conflictFilesCreated: 0 },
    ...overrides,
  };
}

await check("effective preflight binds an approved sync-root/identity target hash", () => {
  assert.ok(approvedHash && approvedHash.startsWith("sha256:"), "approved sync target hash is required");
  assert.equal(approved.sandbox.syncTarget.syncRoot, "/approved/OneDrive/tippani-s0");
  assert.equal(approved.sandbox.syncTarget.clientIdentity, "sync-operator@contoso.example");
});

await check("an arbitrary directory produces a different bound hash than the approved target", () => {
  const arbitrary = resolveEffectiveProviderConfig(liveConfig, {
    ...approvedEnv,
    S0_ONEDRIVE_SYNC_ROOT: "/tmp/some-arbitrary-folder",
  });
  assert.notEqual(arbitrary.sandbox.syncTargetHash, approvedHash);
});

await check("the approved hash ignores the observed client state", () => {
  const runningState = resolveEffectiveProviderConfig(liveConfig, {
    ...approvedEnv,
    S0_SYNC_CLIENT_STATE: "running",
  });
  assert.equal(runningState.sandbox.syncTargetHash, approvedHash);
});

await check("a missing sync-client identity cannot be bound", () => {
  const target = resolveSyncTarget(liveConfig, {
    S0_ONEDRIVE_SYNC_ROOT: "/approved/OneDrive/tippani-s0",
    S0_SYNC_CLIENT_STATE: "verified-signed-in",
  });
  assert.equal(syncTargetHash(target), null);
});

await check("an arbitrary directory (bound hash mismatch) cannot pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({
    boundTargetHash: "sha256:arbitrary-directory",
  }));
  assert.ok(detail.blocked, "arbitrary directory must not pass");
  assert.match(detail.blocked, /arbitrary directory/i);
  assert.equal(detail.evidence, undefined);
});

await check("an unbound synced-folder run cannot pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({
    approvedTargetHash: null,
    boundTargetHash: null,
  }));
  assert.ok(detail.blocked);
  assert.match(detail.blocked, /arbitrary directory or unverified client/i);
});

await check("a default 'running' sync-client state cannot pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({
    observedClientState: "running",
  }));
  assert.ok(detail.blocked, "default 'running' state must not pass");
  assert.match(detail.blocked, /'running'|cannot pass/i);
  assert.equal(detail.evidence, undefined);
});

await check("a missing observed sync-client identity cannot pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({ observedClientIdentity: "" }));
  assert.ok(detail.blocked);
  assert.match(detail.blocked, /sync-client identity/i);
});

await check("a same-device probe alone is Incomplete, not Pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({
    independentClients: 1,
    retainedConflictEvidence: null,
  }));
  assert.ok(detail.skip, "same-device only must report Incomplete");
  assert.match(detail.skip, /Incomplete/);
  assert.match(detail.skip, /two independent/i);
  assert.equal(detail.evidence, undefined);
});

await check("two independent sync clients produce a Pass with observable evidence", () => {
  const detail = assessSyncedFolderEvidence(baseInput({ independentClients: 2 }));
  assert.ok(detail.evidence, "credible independent clients should pass");
  assert.equal(detail.evidence.providerApiCasUsed, false);
  assert.match(detail.evidence.probe, /two independent/i);
  assert.equal(detail.evidence.independentClients, 2);
});

await check("retained conflict/recovery evidence produces a Pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({
    independentClients: 1,
    retainedConflictEvidence: { conflict: true, source: "retained-cross-device" },
  }));
  assert.ok(detail.evidence, "retained conflict evidence should pass");
  assert.match(detail.evidence.probe, /retained/i);
});

await check("empty retained evidence object does not fabricate a Pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({
    independentClients: 1,
    retainedConflictEvidence: { conflict: false, recovery: false },
  }));
  assert.ok(detail.skip, "non-observable retained evidence must remain Incomplete");
});

await check("the S0-BCK-006 implementation is Blocked without a Windows sync client", async () => {
  if (process.platform === "win32") return;
  const detail = await SCENARIO_IMPLEMENTATIONS["S0-BCK-006"]({ config: approved });
  assert.ok(detail.blocked);
  assert.match(detail.blocked, /Windows OneDrive sync-client/i);
});

console.log(`s0-synced-folder: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
