// Provider-path scaffolding tests. No live sandbox exists, so these prove the
// scaffolding fails closed, dry-runs with zero provider calls, emits a
// non-secret preflight sheet, and publishes provider gates as Blocked with
// precise reasons.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ProviderWorkspaceStore } from "../src/adapters/provider-store.mjs";
import { AdoGitStore } from "../src/adapters/ado-git-store.mjs";
import { GitHubRepoStore } from "../src/adapters/github-repo-store.mjs";
import { OneDriveGraphStore } from "../src/adapters/onedrive-store.mjs";
import { createStore } from "../src/adapters/registry.mjs";
import { applicableScenarioIds } from "../src/applicability.mjs";
import {
  buildPreflightSheet,
  renderPreflightSheet,
  runProviderDryRun,
} from "../src/provider-preflight-sheet.mjs";
import {
  findEmbeddedSecrets,
  providerTargetHash,
  resolveEffectiveProviderConfig,
  validatePreflight,
  withResolvedProviderIdentity,
} from "../src/preflight.mjs";
import { BLOCKED_REASONS } from "../src/provider-gates.mjs";
import { runHarness } from "../src/runner.mjs";
import { createSyntheticWorkspace } from "../src/synthetic-fixtures.mjs";
import { OperationBudget } from "../src/operation-budget.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const spikeRoot = path.dirname(here);
// GitHub is the remaining generic-scaffold provider (OneDrive and ADO have real
// transports), so the generic dry-run/fail-closed assertions run against it.
const providerConfig = JSON.parse(fs.readFileSync(
  path.join(spikeRoot, "config", "provider-github-dryrun.json"),
  "utf8",
));

let pass = 0;
let fail = 0;
async function check(name, action) {
  try {
    await action();
    pass++;
  } catch (error) {
    fail++;
    console.error(`  FAIL: ${name}`);
    console.error(`        ${error.stack || error}`);
  }
}

await check("fails closed before any provider call with an unapproved sandbox", async () => {
  const store = new ProviderWorkspaceStore({ backingPath: "ado", sandbox: { approved: false }, dryRun: true });
  await assert.rejects(store.initialize(), (error) => error.code === "preflight_required");
});

await check("registry preserves runtime-only budget, signal, and callback objects", () => {
  const abortController = new AbortController();
  const safetyBudget = new OperationBudget({
    limits: { maxOperations: 10, maxDurationMs: 1000, maxObjects: 10, maxBytes: 1000 },
  });
  const fetchImpl = async () => ({ ok: true, status: 200 });
  const identityResolver = async () => ({ subject: "github:syn-runtime" });
  const store = createStore("github", {
    ...providerConfig,
    owner: "synthetic-owner",
    repo: "synthetic-repository",
    safetyBudget,
    signal: abortController.signal,
    fetchImpl,
    identityResolver,
  });
  assert.equal(store.safetyBudget, safetyBudget);
  assert.equal(store.signal, abortController.signal);
  assert.equal(store.fetchImpl, fetchImpl);
  assert.equal(store.identityResolver, identityResolver);
});

await check("refuses live provider operations until a sandbox is wired in", async () => {
  const store = new ProviderWorkspaceStore({ backingPath: "ado", sandbox: providerConfig.sandbox, dryRun: false });
  await assert.rejects(store.initialize(), (error) => error.code === "provider_live_unavailable");
  assert.equal(store.liveProviderCallCount(), 1, "The refused connect counts as a would-be live call");
});

await check("generic provider store records intended operations and makes zero live calls", async () => {
  // All real provider backing paths now have transports, so this exercises the
  // generic ProviderWorkspaceStore scaffold directly.
  const store = new ProviderWorkspaceStore({ backingPath: "ado", sandbox: providerConfig.sandbox, dryRun: true });
  await store.initialize();
  const workspace = createSyntheticWorkspace({ seed: "provider-ops" });
  await store.createWorkspace(workspace);
  await store.compareAndSwap({
    workspaceId: workspace.workspaceId,
    expectedGeneration: 0,
    operation: { auditEvent: { actor: "Synthetic A", action: "x" } },
  });
  await store.readWorkspace(workspace.workspaceId);
  await store.listWorkspaces();
  await store.backup();
  const operations = store.providerOperationManifest();
  assert.equal(store.liveProviderCallCount(), 0);
  assert.ok(operations.length >= 4, "The dry-run must record its intended provider operations");
  assert.ok(
    operations.some((op) => op.op === "put-workspace" && String(op.precondition).includes("if-none-match")),
    "Create must record an if-none-match precondition",
  );
  assert.ok(
    operations.some((op) => String(op.precondition).includes("if-match")),
    "A mutation must record an if-match generation precondition",
  );
});

await check("dry-run enforces generation CAS in its coherent model", async () => {
  const store = new ProviderWorkspaceStore({ backingPath: "ado", sandbox: providerConfig.sandbox, dryRun: true });
  await store.initialize();
  const workspace = createSyntheticWorkspace({ seed: "provider-cas" });
  await store.createWorkspace(workspace);
  await store.compareAndSwap({
    workspaceId: workspace.workspaceId,
    expectedGeneration: 0,
    operation: { auditEvent: { actor: "Synthetic A", action: "write" } },
  });
  await assert.rejects(
    store.compareAndSwap({
      workspaceId: workspace.workspaceId,
      expectedGeneration: 0,
      operation: { auditEvent: { actor: "Synthetic B", action: "write" } },
    }),
    (error) => error.code === "generation_conflict",
  );
  assert.equal(store.liveProviderCallCount(), 0);
});

await check("preflight sheet is non-secret and lists the dry-run manifest and prerequisites", async () => {
  const sheet = await buildPreflightSheet(providerConfig);
  assert.equal(sheet.liveProviderCalls, 0);
  assert.equal(sheet.identityResolutionCalls, 0);
  assert.deepEqual(findEmbeddedSecrets(sheet), []);
  assert.ok(sheet.dryRunOperations.length >= 4);
  assert.ok(sheet.prerequisites.length > 0);
  assert.ok(Date.parse(sheet.cleanup.expiresAt) > Date.now());
  assert.equal(sheet.cleanup.retentionHours, 24);
  const markdown = renderPreflightSheet(sheet);
  assert.ok(markdown.includes("preflight sheet"));
  assert.ok(markdown.includes("Dry-run operation manifest"));
  assert.ok(markdown.includes(providerConfig.sandbox.namespace));
  assert.equal(sheet.approvalReady, false, "Placeholder coordinates are not approval-ready");
});

await check("live preflight binds provider-derived identity and coordinates to an approved hash", async () => {
  const live = structuredClone(providerConfig);
  live.dryRun = false;
  const targetEnv = {
    S0_GITHUB_TOKEN: "syn-token",
    S0_GITHUB_OWNER: "synthetic-owner",
    S0_GITHUB_REPO: "synthetic-repository",
  };
  const resolved = withResolvedProviderIdentity(
    resolveEffectiveProviderConfig(live, targetEnv),
    "github:syn-identity-001",
    targetEnv,
  );
  assert.ok(resolved.sandbox.effectiveTargetHash?.startsWith("sha256:"));
  const approvedEnv = {
    ...targetEnv,
    S0_PREFLIGHT_APPROVER: "Synthetic Reviewer",
    S0_PREFLIGHT_APPROVED_AT: "2026-09-03T20:00:00.000Z",
    S0_PREFLIGHT_APPROVAL_REFERENCE: "syn-review-91",
    S0_PREFLIGHT_TARGET_HASH: resolved.sandbox.effectiveTargetHash,
  };
  const approved = withResolvedProviderIdentity(live, "github:syn-identity-001", approvedEnv);
  assert.deepEqual(validatePreflight(approved, { env: approvedEnv }), []);

  const mismatched = { ...approvedEnv, S0_GITHUB_REPO: "different-synthetic-repository" };
  const mismatchedTarget = withResolvedProviderIdentity(
    live,
    "github:syn-identity-001",
    mismatched,
  );
  assert(
    validatePreflight(mismatchedTarget, { env: mismatched }).some((error) => /target hash/.test(error)),
    "Runtime substitution must invalidate the approved target hash",
  );

  const sheet = await buildPreflightSheet(live, {
    env: targetEnv,
    identityResolver: async ({ token }) => {
      assert.equal(token, "syn-token");
      return { subject: "github:syn-identity-001" };
    },
  });
  assert.equal(sheet.approvalReady, true);
  assert.equal(sheet.effectiveTargetHash, resolved.sandbox.effectiveTargetHash);
  assert.equal(sheet.identity.subject, "github:syn-identity-001");
  assert.equal(sheet.identity.source, "provider credential");
});

await check("live preflight rejects unresolved placeholders before any network call", () => {
  const live = structuredClone(providerConfig);
  live.dryRun = false;
  const errors = validatePreflight(live, { env: {} });
  assert(errors.some((error) => /resolved before provider calls/.test(error)));
  assert(errors.some((error) => /Structured preflight approval/.test(error)));
});

await check("provider adapter rejects a mismatched approved target before fetch", async () => {
  let calls = 0;
  const store = new GitHubRepoStore({
    dryRun: false,
    owner: "synthetic-owner",
    repo: "synthetic-repository",
    runId: "s0-provider-binding",
    githubToken: "syn-token",
    identityResolver: async () => ({ subject: "github:syn-identity-001" }),
    effectiveTargetHash: "sha256:not-the-effective-target",
    preflightApproval: {
      approver: "Synthetic Reviewer",
      approvedAt: "2026-09-03T20:00:00.000Z",
      reference: "syn-review-91",
      targetHash: "sha256:not-the-effective-target",
    },
    enforcePreflight: true,
    fetchImpl: async () => {
      calls++;
      throw new Error("network must not be reached");
    },
  });
  await assert.rejects(store.initialize(), (error) => error.code === "preflight_required");
  assert.equal(calls, 0);
});

const credentialRotationCases = [
  {
    provider: "github",
    Store: GitHubRepoStore,
    options: { owner: "synthetic-owner", repo: "synthetic-repository" },
    coordinates: { owner: "synthetic-owner", repository: "synthetic-repository" },
    request: async (store) => store.initialize(),
  },
  {
    provider: "ado",
    Store: AdoGitStore,
    options: {
      org: "synthetic-org",
      project: "synthetic-project",
      repo: "synthetic-repository",
    },
    coordinates: {
      organization: "synthetic-org",
      project: "synthetic-project",
      repository: "synthetic-repository",
    },
    request: async (store) => {
      await store.initialize();
      await store.listWorkspaces();
    },
  },
  {
    provider: "onedrive",
    Store: OneDriveGraphStore,
    options: { driveId: "synthetic-drive", folderPath: "Synthetic" },
    coordinates: { driveId: "synthetic-drive", folder: "Synthetic" },
    request: async (store) => store.initialize(),
  },
];

for (const item of credentialRotationCases) {
  await check(`${item.provider} token A approval cannot authorize token B`, async () => {
    const runId = `s0-${item.provider}-credential-binding`;
    const approvedIdentity = `${item.provider}:identity-a`;
    const targetHash = providerTargetHash({
      provider: item.provider,
      identity: approvedIdentity,
      coordinates: item.coordinates,
      namespace: `tippani-s0/${runId}`,
    });
    let issuance = 0;
    let providerCalls = 0;
    const store = new item.Store({
      dryRun: false,
      runId,
      ...item.options,
      getToken: async () => issuance++ === 0 ? "token-a" : "token-b",
      identityResolver: async ({ token }) => ({
        subject: `${item.provider}:${token === "token-a" ? "identity-a" : "identity-b"}`,
      }),
      effectiveTargetHash: targetHash,
      preflightApproval: {
        approver: "Synthetic Reviewer",
        approvedAt: "2026-09-03T20:00:00.000Z",
        reference: "syn-review-91",
        targetHash,
      },
      enforcePreflight: true,
      fetchImpl: async () => {
        providerCalls++;
        throw new Error("mismatched credential must not reach the provider");
      },
    });
    await assert.rejects(
      item.request(store),
      (error) => error.code === "credential_identity_mismatch",
    );
    assert.equal(providerCalls, 0);
  });
}

await check("a rotated credential is re-resolved and accepted only for the approved identity", async () => {
  const runId = "s0-github-approved-rotation";
  const approvedIdentity = "github:identity-a";
  const targetHash = providerTargetHash({
    provider: "github",
    identity: approvedIdentity,
    coordinates: { owner: "synthetic-owner", repository: "synthetic-repository" },
    namespace: `tippani-s0/${runId}`,
  });
  let issuance = 0;
  const resolvedTokens = [];
  let providerCalls = 0;
  const store = new GitHubRepoStore({
    dryRun: false,
    owner: "synthetic-owner",
    repo: "synthetic-repository",
    runId,
    getToken: async () => issuance++ === 0 ? "token-a" : "token-b",
    identityResolver: async ({ token }) => {
      resolvedTokens.push(token);
      return { subject: approvedIdentity };
    },
    effectiveTargetHash: targetHash,
    preflightApproval: {
      approver: "Synthetic Reviewer",
      approvedAt: "2026-09-03T20:00:00.000Z",
      reference: "syn-review-91",
      targetHash,
    },
    enforcePreflight: true,
    fetchImpl: async (url, options) => {
      providerCalls++;
      if (options.method === "GET" && /\/repos\/synthetic-owner\/synthetic-repository$/.test(new URL(url).pathname)) {
        return { ok: true, status: 200, json: async () => ({ default_branch: "main" }) };
      }
      if (options.method === "GET") {
        return { ok: true, status: 200, json: async () => ({ object: { sha: "base" } }) };
      }
      return { ok: true, status: 201, json: async () => ({ ref: "created" }) };
    },
  });
  await store.initialize();
  assert.deepEqual(resolvedTokens, ["token-a", "token-b"]);
  assert.equal(providerCalls, 3);
});

await check("all provider stores unblock FIFO replay only after explicit head resolution", async () => {
  const storeRoot = path.join(spikeRoot, ".test-state", "provider-queue-resolution");
  fs.rmSync(storeRoot, { recursive: true, force: true });
  fs.mkdirSync(storeRoot, { recursive: true });
  try {
    for (const item of credentialRotationCases) {
      const store = new item.Store({
        dryRun: true,
        runId: `s0-${item.provider}-queue-resolution`,
        storeRoot,
        ...item.options,
      });
      await store.initialize();
      const workspace = createSyntheticWorkspace({ seed: `${item.provider}-queue-resolution` });
      await store.createWorkspace(workspace);
      await store.compareAndSwap({
        workspaceId: workspace.workspaceId,
        expectedGeneration: 0,
        operation: { auditEvent: { actor: "Synthetic B", action: "authority-advance" } },
      });
      store.goOffline();
      await store.stageOffline({
        workspaceId: workspace.workspaceId,
        expectedGeneration: 0,
        operation: { auditEvent: { actor: "Synthetic A", action: "stale-head" } },
      });
      await store.stageOffline({
        workspaceId: workspace.workspaceId,
        expectedGeneration: 1,
        operation: { auditEvent: { actor: "Synthetic A", action: "later-edit" } },
      });
      const blocked = await store.reconnect();
      assert.equal(blocked.conflicts.length, 1, `${item.provider} must report the FIFO conflict`);
      assert.equal(blocked.pendingCount, 2);
      const inspected = await store.inspectHead();
      assert.equal(inspected.head.id, blocked.conflicts[0].headId);
      assert.equal(inspected.head.generation, blocked.conflicts[0].headGeneration);
      await store.resolveHead({
        headId: inspected.head.id,
        headGeneration: inspected.head.generation,
        action: "discard",
      });
      const replayed = await store.reconnect();
      assert.equal(replayed.applied.length, 1, `${item.provider} must replay the later entry`);
      assert.equal(replayed.pendingCount, 0);
      assert.equal((await store.readWorkspace(workspace.workspaceId)).generation, 2);
      await store.close();
    }
  } finally {
    fs.rmSync(storeRoot, { recursive: true, force: true });
  }
});

await check("caller-supplied identity labels cannot satisfy live approval", () => {
  const live = structuredClone(providerConfig);
  live.dryRun = false;
  live.effectiveIdentity = "github:caller-supplied";
  const errors = validatePreflight(live, {
    env: {
      S0_GITHUB_OWNER: "synthetic-owner",
      S0_GITHUB_REPO: "synthetic-repository",
      S0_PREFLIGHT_APPROVER: "Synthetic Reviewer",
      S0_PREFLIGHT_APPROVED_AT: "2026-09-03T20:00:00.000Z",
      S0_PREFLIGHT_APPROVAL_REFERENCE: "syn-review-91",
      S0_PREFLIGHT_TARGET_HASH: "sha256:caller",
    },
  });
  assert(errors.some((error) => /provider-derived/.test(error)));
});

await check("preflight sheet build rejects a config that embeds a credential", async () => {
  const withSecret = JSON.parse(JSON.stringify(providerConfig));
  withSecret.sandbox.coordinates.accessToken = "syn-should-not-be-here";
  await assert.rejects(buildPreflightSheet(withSecret), /Credential material/);
});

await check("preflight rejects an expired cleanup deadline", async () => {
  const expired = JSON.parse(JSON.stringify(providerConfig));
  delete expired.sandbox.cleanup.retentionHours;
  expired.sandbox.cleanup.expiresAt = "2000-01-02T00:00:00.000Z";
  await assert.rejects(buildPreflightSheet(expired), /cleanup manifest and expiry/);
});

await check("provider gates are published as Blocked with precise reasons", async () => {
  const { run } = await runHarness({ config: providerConfig, writeArtifacts: false });
  assert.equal(run.results.length, applicableScenarioIds(providerConfig).length);
  const providerResults = run.results.filter((result) => BLOCKED_REASONS[result.scenarioId]);
  for (const result of providerResults) {
    assert.equal(result.status, "Blocked", `${result.scenarioId} was ${result.status}`);
    assert.equal(result.reason, BLOCKED_REASONS[result.scenarioId]);
  }
  assert(run.results.filter((result) => result.scenarioId.startsWith("S0-SEC-")).every((result) => result.status === "Pass"));
  assert.equal(run.results.find((result) => result.scenarioId === "S0-PER-005")?.status, "Pass");
});

await check("every selected provider gate has a blocked reason", async () => {
  for (const id of applicableScenarioIds(providerConfig)) {
    if (id.startsWith("S0-SEC-") || id === "S0-PER-005") continue;
    assert.ok(BLOCKED_REASONS[id], `${id} lacks a blocked reason`);
  }
});

console.log(`s0-provider-dryrun: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
