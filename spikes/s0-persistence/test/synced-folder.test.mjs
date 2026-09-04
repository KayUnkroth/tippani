import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveEffectiveProviderConfig,
  syncTargetHash,
  resolveSyncTarget,
} from "../src/preflight.mjs";
import { decisionConfigRevision } from "../src/evidence-identity.mjs";
import {
  SCENARIO_IMPLEMENTATIONS,
  assessSyncedFolderEvidence,
  validateCrossClientEvidence,
  crossClientEvidenceDigest,
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
const configRevision = decisionConfigRevision(approved);

let pass = 0;
let fail = 0;
async function check(name, action) {
  try { await action(); pass++; }
  catch (error) { fail++; console.error(`  FAIL: ${name}`); console.error(`        ${error.stack || error}`); }
}

function signedArtifact(overrides = {}) {
  const artifact = {
    schemaVersion: 1,
    kind: "onedrive-synced-folder-cross-client-evidence",
    syncTargetHash: approvedHash,
    configRevision,
    clients: [
      { clientId: "device-A-9f2c", observedAt: "2026-09-03T18:00:00.000Z", operations: ["create", "edit"] },
      { clientId: "device-B-1a77", observedAt: "2026-09-03T18:00:05.000Z", operations: ["edit"] },
    ],
    outcomes: { conflict: true, recovery: true, conflictArtifacts: ["workspace-device-B.json"] },
    approval: {
      approver: "Windows sync-client test owner",
      approvedAt: "2026-09-03T20:00:00.000Z",
      reference: "syn-sync-001",
    },
    ...overrides,
  };
  if (!artifact.approval.digest) {
    artifact.approval.digest = crossClientEvidenceDigest(artifact);
  }
  return artifact;
}

function baseInput(overrides = {}) {
  return {
    approvedTargetHash: approvedHash,
    boundTargetHash: approvedHash,
    requiredClientState: "verified-signed-in",
    observedClientState: "verified-signed-in",
    observedClientIdentity: "sync-operator@contoso.example",
    configRevision,
    retainedEvidence: signedArtifact(),
    probe: { createMs: 5, conflictFilesCreated: 0 },
    ...overrides,
  };
}

await check("effective preflight binds an approved sync-root/identity target hash", () => {
  assert.ok(approvedHash && approvedHash.startsWith("sha256:"));
  assert.equal(approved.sandbox.syncTarget.syncRoot, "/approved/OneDrive/tippani-s0");
});

await check("an arbitrary directory produces a different bound hash than the approved target", () => {
  const arbitrary = resolveEffectiveProviderConfig(liveConfig, {
    ...approvedEnv,
    S0_ONEDRIVE_SYNC_ROOT: "/tmp/some-arbitrary-folder",
  });
  assert.notEqual(arbitrary.sandbox.syncTargetHash, approvedHash);
});

await check("a missing sync-client identity cannot be bound", () => {
  const target = resolveSyncTarget(liveConfig, {
    S0_ONEDRIVE_SYNC_ROOT: "/approved/OneDrive/tippani-s0",
    S0_SYNC_CLIENT_STATE: "verified-signed-in",
  });
  assert.equal(syncTargetHash(target), null);
});

await check("an arbitrary directory (bound hash mismatch) cannot pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({ boundTargetHash: "sha256:arbitrary-directory" }));
  assert.ok(detail.blocked);
  assert.match(detail.blocked, /arbitrary directory/i);
});

await check("a default 'running' sync-client state cannot pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({ observedClientState: "running" }));
  assert.ok(detail.blocked);
  assert.match(detail.blocked, /'running'|cannot pass/i);
});

await check("a self-reported client count (no structured artifact) cannot pass", () => {
  // S0_SYNC_INDEPENDENT_CLIENTS=2 is no longer an input; an environment count
  // cannot produce a Pass. Without a structured artifact the result is Incomplete.
  const detail = assessSyncedFolderEvidence(baseInput({ retainedEvidence: null }));
  assert.ok(detail.skip, "no structured artifact must be Incomplete");
  assert.match(detail.skip, /Incomplete/);
  assert.match(detail.skip, /self-reported client counts cannot/i);
  assert.match(detail.skip, /Required future probe/);
  assert.equal(detail.evidence, undefined);
});

await check("an unbound arbitrary conflict JSON cannot pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput({
    retainedEvidence: { conflict: true, independentClients: 2 },
  }));
  assert.ok(detail.skip, "arbitrary conflict JSON must be Incomplete");
  assert.equal(detail.evidence, undefined);
  const errors = validateCrossClientEvidence({ conflict: true, independentClients: 2 }, {
    approvedTargetHash: approvedHash, boundTargetHash: approvedHash, configRevision,
  });
  assert.ok(errors.some((error) => /not bound to the approved sync target/.test(error)));
  assert.ok(errors.some((error) => /two independent sync clients/.test(error)));
});

await check("a valid signed cross-client artifact produces a Pass", () => {
  const detail = assessSyncedFolderEvidence(baseInput());
  assert.ok(detail.evidence, "a fully valid signed artifact should pass");
  assert.deepEqual(detail.evidence.clients, ["device-A-9f2c", "device-B-1a77"]);
  assert.equal(detail.evidence.providerApiCasUsed, false);
  assert.equal(detail.evidence.conflictOutcome, true);
});

await check("a tampered artifact body invalidates the approval digest", () => {
  const artifact = signedArtifact();
  artifact.clients[0].clientId = "device-A-tampered";
  const detail = assessSyncedFolderEvidence(baseInput({ retainedEvidence: artifact }));
  assert.ok(detail.skip);
  assert.match(detail.skip, /digest does not match/);
});

await check("evidence bound to a stale config revision cannot pass", () => {
  const artifact = signedArtifact({ configRevision: "sha256:stale-config" });
  artifact.approval.digest = crossClientEvidenceDigest(artifact);
  const detail = assessSyncedFolderEvidence(baseInput({ retainedEvidence: artifact }));
  assert.ok(detail.skip);
  assert.match(detail.skip, /config revision is stale/);
});

await check("duplicate client IDs are rejected", () => {
  const artifact = signedArtifact({
    clients: [
      { clientId: "device-A", observedAt: "2026-09-03T18:00:00.000Z", operations: ["edit"] },
      { clientId: "device-A", observedAt: "2026-09-03T18:00:05.000Z", operations: ["edit"] },
    ],
  });
  artifact.approval.digest = crossClientEvidenceDigest(artifact);
  const detail = assessSyncedFolderEvidence(baseInput({ retainedEvidence: artifact }));
  assert.ok(detail.skip);
  assert.match(detail.skip, /distinct, immutable/);
});

await check("evidence without a conflict or recovery outcome cannot pass", () => {
  const artifact = signedArtifact({ outcomes: { conflict: false, recovery: false } });
  artifact.approval.digest = crossClientEvidenceDigest(artifact);
  const detail = assessSyncedFolderEvidence(baseInput({ retainedEvidence: artifact }));
  assert.ok(detail.skip);
  assert.match(detail.skip, /conflict or recovery outcome/);
});

await check("the S0-BCK-006 implementation is Blocked without a Windows sync client", async () => {
  if (process.platform === "win32") return;
  const detail = await SCENARIO_IMPLEMENTATIONS["S0-BCK-006"]({ config: approved });
  assert.ok(detail.blocked);
  assert.match(detail.blocked, /Windows OneDrive sync-client/i);
});

await check("decisionConfigRevision incorporates the normalized sync profile", () => {
  const withRunning = structuredClone(liveConfig);
  withRunning.sandbox.syncProfile.requiredClientState = "running";
  assert.notEqual(
    decisionConfigRevision(withRunning),
    decisionConfigRevision(liveConfig),
    "changing requiredClientState must invalidate the config revision",
  );

  const withoutIndependent = structuredClone(liveConfig);
  withoutIndependent.sandbox.syncProfile.requireIndependentClients = false;
  assert.notEqual(
    decisionConfigRevision(withoutIndependent),
    decisionConfigRevision(liveConfig),
    "changing requireIndependentClients must invalidate the config revision",
  );

  const withoutProfile = structuredClone(liveConfig);
  delete withoutProfile.sandbox.syncProfile;
  assert.notEqual(
    decisionConfigRevision(withoutProfile),
    decisionConfigRevision(liveConfig),
    "removing the sync profile must invalidate the config revision",
  );
});

console.log(`s0-synced-folder: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
