import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { applicableScenarioIds, applicabilityProfile } from "./applicability.mjs";
import { createStore as createAdapterStore, isDurable } from "./adapters/registry.mjs";
import { assertPreflight } from "./preflight.mjs";
import { SCENARIO_IMPLEMENTATIONS, PENDING_REASONS } from "./scenario-implementations.mjs";
import { BLOCKED_REASONS } from "./provider-gates.mjs";
import {
  SCENARIOS,
  scenarioById,
  validateScenarioCatalog,
} from "./scenario-catalog.mjs";
import { assertWorkspaceStore } from "./workspace-contract.mjs";
import { writeRunArtifacts } from "./result-writer.mjs";

function errorSummary(error) {
  return {
    name: error?.name || "Error",
    code: error?.code || "scenario_failed",
    message: String(error?.message || error),
  };
}

const LIVE_PROVIDER_ENV = Object.freeze({
  onedrive: ["S0_ONEDRIVE_TOKEN", "S0_ONEDRIVE_DRIVE_ID", "S0_ONEDRIVE_FOLDER"],
  ado: ["S0_ADO_TOKEN", "S0_ADO_ORG", "S0_ADO_PROJECT", "S0_ADO_REPO"],
  github: ["S0_GITHUB_TOKEN", "S0_GITHUB_OWNER", "S0_GITHUB_REPO"],
});

function missingProviderEnvironment(config) {
  if (config.dryRun !== false) return [];
  return (LIVE_PROVIDER_ENV[config.backingPath] || [])
    .filter((name) => !process.env[name]);
}

function requiresLiveProvider(scenarioId) {
  return !scenarioId.startsWith("S0-SEC-") &&
    !["S0-PER-005", "S0-BCK-006"].includes(scenarioId);
}

function environmentDetails(config, runRoot) {
  const cpu = os.cpus()[0];
  const providerApiVersion = {
    onedrive: "Microsoft Graph v1.0",
    ado: "Azure DevOps Git REST 7.1",
    github: "GitHub REST 2022-11-28",
    local: "N/A",
  }[config.backingPath] || "Not recorded";
  return {
    os: `${os.platform()} ${os.release()}`,
    architecture: os.arch(),
    cpuModel: cpu?.model || "unknown",
    logicalCpuCount: os.cpus().length,
    totalMemoryBytes: os.totalmem(),
    nodeVersion: process.versions.node,
    providerApiVersion,
    configuredPlatform: process.env.S0_PLATFORM_DESCRIPTION || config.platform,
    filesystem: process.env.S0_FILESYSTEM_DESCRIPTION || "Not recorded",
    temporaryStoreRoot: path.basename(runRoot),
    networkCharacteristics: process.env.S0_NETWORK_DESCRIPTION || "Not recorded",
    providerRegion: process.env.S0_PROVIDER_REGION || "Not recorded",
    storageCharacteristics: process.env.S0_STORAGE_DESCRIPTION || "Not recorded",
    syncClientState: process.env.S0_SYNC_CLIENT_STATE || "Not applicable",
    repositoryProtections: process.env.S0_REPOSITORY_PROTECTIONS || "Not recorded",
    dependencyVersions: `node=${process.versions.node}; sqlite=${process.versions.sqlite || "built-in"}`,
    workloadMix: "scenario-defined deterministic small/medium/stress fixtures",
    knownLimitations: process.env.S0_ENVIRONMENT_LIMITATIONS || "None recorded",
    processTopology: config.backingPath === "local"
      ? "Independent OS child processes for concurrency and kill tests"
      : "Independent OS child processes sharing one provider account for collaboration gates",
  };
}

/**
 * Each scenario gets isolated store roots. Repeat calls to createStore() reopen
 * the SAME root - that is what makes restart evidence meaningful for a durable
 * adapter - while createStore({ fresh: true }) allocates a separate root for
 * source/target comparisons.
 */
function createScenarioContext({ config, scenarioId, adapterFactory, runRoot }) {
  const roots = [];
  const openStores = [];
  let index = 0;

  const allocateRoot = () => {
    const root = path.join(runRoot, `${scenarioId}-${index++}`);
    fs.mkdirSync(root, { recursive: true });
    roots.push(root);
    return root;
  };

  const primaryRoot = allocateRoot();
  const createStore = ({ fresh = false } = {}) => {
    const storeRoot = fresh ? allocateRoot() : primaryRoot;
    const store = assertWorkspaceStore(adapterFactory({ ...config, storeRoot }));
    openStores.push(store);
    return store;
  };

  return {
    config,
    scenario: scenarioById(scenarioId),
    durable: isDurable(config.adapter),
    adapter: config.adapter,
    primaryRoot,
    createStore,
    // Kept so negative-control tests can inject their own factory.
    adapterFactory: () => createStore(),
    async cleanup() {
      for (const store of openStores) {
        try { await store.close(); } catch { /* best effort */ }
      }
      if (config.keepStoreArtifacts) return;
      for (const root of roots) {
        try { fs.rmSync(root, { recursive: true, force: true }); } catch { /* best effort */ }
      }
    },
  };
}

export async function runHarness({
  config,
  outputDir,
  scenarioIds = config.scenarioIds,
  adapterFactory = null,
  writeArtifacts = true,
  harnessRevision = "s0-harness-v3",
} = {}) {
  validateScenarioCatalog();
  const preflightTime = new Date();
  const preflight = assertPreflight(config, preflightTime);
  const applicableIds = applicableScenarioIds(config);
  const missingProviderEnv = adapterFactory ? [] : missingProviderEnvironment(config);
  const factory = adapterFactory ||
    ((options) => createAdapterStore(config.adapter, options));

  const selected = scenarioIds || config.scenarioIds || applicableIds;
  const unknown = selected.filter((id) => !scenarioById(id));
  if (unknown.length) throw new Error(`Unknown scenario IDs: ${unknown.join(", ")}`);
  if (selected.length > config.budgets.maxOperations) {
    throw new Error("Selected scenarios exceed the operation budget");
  }

  const runRoot = fs.mkdtempSync(path.join(os.tmpdir(), `tippani-s0-${config.runId}-`));
  const startedAt = preflightTime.toISOString();
  const deadline = performance.now() + config.budgets.maxDurationMs;
  const results = [];

  try {
    for (const scenarioId of selected) {
      const scenario = scenarioById(scenarioId);
      const implementation = SCENARIO_IMPLEMENTATIONS[scenarioId];
      const base = {
        scenarioId,
        title: scenario.title,
        criterionType: scenario.criterionType,
      };

      if (performance.now() > deadline) {
        results.push({
          ...base,
          status: "Blocked",
          durationMs: 0,
          reason: "Run duration budget exhausted",
        });
        continue;
      }
      if (!implementation) {
        const blockedReason = BLOCKED_REASONS[scenarioId];
        results.push({
          ...base,
          status: blockedReason ? "Blocked" : "Incomplete",
          durationMs: 0,
          reason: blockedReason ||
            PENDING_REASONS[scenarioId] ||
            "Scenario implementation is not available for this harness stage",
        });
        continue;
      }
      if (missingProviderEnv.length && requiresLiveProvider(scenarioId)) {
        results.push({
          ...base,
          status: "Blocked",
          durationMs: 0,
          reason: `Live provider runtime variables not supplied: ${missingProviderEnv.join(", ")}`,
        });
        continue;
      }

      const context = createScenarioContext({
        config,
        scenarioId,
        adapterFactory: factory,
        runRoot,
      });
      const scenarioStarted = performance.now();
      try {
        const detail = await implementation(context);
        if (detail?.blocked) {
          results.push({
            ...base,
            status: "Blocked",
            durationMs: performance.now() - scenarioStarted,
            reason: detail.blocked,
          });
        } else if (detail?.na) {
          // Reviewer-approved not-applicable: the invariant is real but does not
          // apply to this adapter's contract. Distinct from Incomplete, which is
          // missing evidence and must never read as a pass.
          results.push({
            ...base,
            status: "N/A",
            durationMs: performance.now() - scenarioStarted,
            reason: detail.na,
          });
        } else if (detail?.skip) {
          results.push({
            ...base,
            status: "Incomplete",
            durationMs: performance.now() - scenarioStarted,
            reason: detail.skip,
          });
        } else {
          results.push({
            ...base,
            status: "Pass",
            durationMs: performance.now() - scenarioStarted,
            evidence: detail?.evidence || {},
            measurements: detail?.measurements || {},
          });
        }
      } catch (error) {
        results.push({
          ...base,
          status: "Fail",
          durationMs: performance.now() - scenarioStarted,
          evidence: {},
          measurements: {},
          error: errorSummary(error),
        });
      } finally {
        await context.cleanup();
      }
    }
  } finally {
    // Tear down a live provider run's per-run namespace (best effort).
    if (config.dryRun === false && ["onedrive", "ado", "github"].includes(config.backingPath)) {
      try {
        const teardown = createAdapterStore(config.adapter, { ...config });
        if (typeof teardown.cleanup === "function") await teardown.cleanup();
      } catch { /* best effort */ }
    }
    if (!config.keepStoreArtifacts) {
      try { fs.rmSync(runRoot, { recursive: true, force: true }); } catch { /* best effort */ }
    }
  }

  const run = {
    schemaVersion: 1,
    syntheticData: true,
    harnessRevision,
    startedAt,
    completedAt: new Date().toISOString(),
    configuration: {
      configurationId: config.configurationId,
      adapter: config.adapter,
      backingPath: config.backingPath,
      platform: config.platform,
      scale: config.scale,
      runId: config.runId,
      durable: isDurable(config.adapter),
      host: `${process.platform} ${process.arch} node ${process.versions.node}`,
      applicabilityProfile: applicabilityProfile(config),
    },
    preflight,
    environment: environmentDetails(config, runRoot),
    applicableScenarioIds: applicableIds,
    catalogSize: SCENARIOS.length,
    catalog: SCENARIOS.map((scenario) => ({
      id: scenario.id,
      criterionType: scenario.criterionType,
      title: scenario.title,
    })),
    results,
  };
  const artifacts = writeArtifacts ? writeRunArtifacts(run, outputDir) : null;
  return { run, artifacts };
}
