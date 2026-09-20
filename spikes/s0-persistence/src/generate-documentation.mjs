#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  APPLICABILITY_PROFILES,
  CONFIGURATION_MATRIX,
} from "./applicability.mjs";
import { configurationDirectory } from "./paths.mjs";
import { SCENARIOS } from "./scenario-catalog.mjs";

const configurations = [
  ...CONFIGURATION_MATRIX,
  {
    configurationId: "CFG-ONEDRIVE-SYNC",
    label: "OneDrive synced-folder compatibility",
    engine: "Generation-CAS envelope",
    backingPath: "Windows OneDrive sync client",
    scenarioIds: ["S0-BCK-006"],
  },
];

const SCOPE_BY_CONFIGURATION = Object.freeze({
  "CFG-LOCAL-SQLITE": {
    inScope: [
      "Basic, non-collaborative operation with exactly one workspace in one SQLite database.",
      "Multiple local processes accessing that workspace with transactional conflict handling.",
      "Local durability, recovery, migration, backup, portability, and performance.",
    ],
    outOfScope: [
      "Multiple independent workspaces writing one shared SQLite database; that topology is ineligible because writes serialize database-wide.",
      "Shared-provider collaboration and provider-specific identity, throttling, or cleanup behavior.",
      "The `S0-SEC-005` ownership-manifest cleanup gate: provider runs need it to protect unrelated remote resources, while this local run deletes only its newly created isolated temporary directory.",
      "Any claim that this configuration proves concurrent progress across workspaces.",
    ],
  },
  "CFG-LOCAL-CAS": {
    inScope: [
      "A private local workspace stored as a generation-CAS envelope with per-workspace locking.",
      "Multiple local processes accessing that workspace with typed stale-writer conflicts.",
      "Local durability, recovery, migration, backup, portability, and performance.",
    ],
    outOfScope: [
      "Linking, synchronizing, replicating, or merging multiple local workspaces in any way.",
      "Shared-provider collaboration and provider-native concurrency behavior.",
      "Provider identity, authorization, throttling, and remote-resource cleanup.",
      "OneDrive sync-client compatibility.",
    ],
  },
  "CFG-ONEDRIVE-LIVE": {
    inScope: [
      "Shared workspaces accessed through OneDrive API version and ETag preconditions.",
      "Multi-client conflicts, offline reconciliation, recovery, history, restore authority, and rehome.",
      "Provider safety, cleanup, request budgets, and provider performance telemetry.",
    ],
    outOfScope: [
      "Cross-user permission behavior and multiple provider identities; concurrency uses one Microsoft identity across multiple concurrent processes.",
      "Local SQLite or local generation-CAS implementation behavior.",
      "Windows OneDrive sync-client filesystem behavior, which is evaluated separately.",
      "Azure DevOps and GitHub provider behavior.",
    ],
  },
  "CFG-ADO-LIVE": {
    inScope: [
      "Shared workspaces accessed through Azure DevOps object and ref preconditions.",
      "Multi-client conflicts, offline reconciliation, recovery, history, restore authority, and rehome.",
      "Provider safety, branch cleanup, request budgets, and provider performance telemetry.",
    ],
    outOfScope: [
      "Cross-user permission behavior and multiple provider identities; concurrency uses one Azure DevOps identity across multiple concurrent processes.",
      "Local SQLite or local generation-CAS implementation behavior.",
      "OneDrive API, OneDrive sync-client, and GitHub provider behavior.",
      "Writes to default, protected, or non-disposable branches.",
    ],
  },
  "CFG-GITHUB-LIVE": {
    inScope: [
      "Shared workspaces accessed through GitHub blob, contents, and ref preconditions.",
      "Multi-client conflicts, offline reconciliation, recovery, history, restore authority, and rehome.",
      "Provider safety, ref cleanup, request budgets, and provider performance telemetry.",
    ],
    outOfScope: [
      "Cross-user permission behavior and multiple provider identities; concurrency uses one GitHub identity across multiple concurrent processes.",
      "Local SQLite or local generation-CAS implementation behavior.",
      "OneDrive and Azure DevOps provider behavior.",
      "Writes to default, protected, or non-disposable branches and repositories.",
    ],
  },
  "CFG-ONEDRIVE-SYNC": {
    inScope: [
      "Compatibility of a generation-CAS envelope inside a Windows OneDrive synced folder.",
      "Cross-client conflict artifacts, ordering, recovery, and user-visible behavior.",
      "Signed evidence from independent sync clients bound to the approved sync target.",
    ],
    outOfScope: [
      "OneDrive API version or ETag concurrency behavior.",
      "Proof of provider-API multi-writer safety or architecture-mapping eligibility.",
      "Local-only, Azure DevOps, and GitHub behavior.",
    ],
  },
});

function applicableScenarios(configuration) {
  const ids = new Set(configuration.scenarioIds || APPLICABILITY_PROFILES[configuration.profile]);
  return SCENARIOS.filter((scenario) => ids.has(scenario.id));
}

function renderReadme(configuration) {
  const scope = SCOPE_BY_CONFIGURATION[configuration.configurationId];
  const bullets = (items) => items.map((item) => `- ${item}`).join("\n");
  return `# ${configuration.label}\n\n` +
    `**Configuration:** \`${configuration.configurationId}\`  \n` +
    `**Engine:** ${configuration.engine}  \n` +
    `**Backing path:** ${configuration.backingPath}\n\n` +
    "This package contains the test definition index, retained runs, and generated aggregate " +
    "outcome for this configuration. Requirements remain authoritative in " +
    "[the spike specification](../2026-08-14-s0-windows-persistence-spike.md).\n\n" +
    "## In Scope\n\n" + bullets(scope.inScope) + "\n\n" +
    "## Out of Scope\n\n" + bullets(scope.outOfScope) + "\n\n" +
    "## Evidence\n\n" +
    "- [Applicable test cases](cases/index.md)\n" +
    "- [Configuration outcome](outcome.md)\n" +
    "- [Architecture comparison](../comparison.md)\n" +
    "- [Architecture decision](../ADR-s0-persistence-architecture.md)\n\n" +
    "Each execution is retained under `runs/<run-id>/`. Run IDs, rather than ordinal folder " +
    "names, identify immutable evidence. The current checked-in runs are historical until the " +
    "comparison validator accepts their source, catalog, applicability, and configuration revisions.\n";
}

function renderCases(configuration) {
  const rows = applicableScenarios(configuration).map((scenario) =>
    `| \`${scenario.id}\` | ${scenario.criterionType} | ${scenario.title} | ${scenario.section} |`);
  return `# ${configuration.label} test cases\n\n` +
    "Generated from `src/scenario-catalog.mjs` and `src/applicability.mjs`. Do not duplicate " +
    "requirement text here; change the authoritative catalog or applicability profile and regenerate.\n\n" +
    "| ID | Criterion | Scenario | Specification section |\n" +
    "|---|---|---|---|\n" + rows.join("\n") + "\n";
}

function renderRunReadme(configuration, run) {
  return `# Run ${run.configuration.runId}\n\n` +
    `**Configuration:** \`${configuration.configurationId}\`  \n` +
    `**Started:** ${run.startedAt || "Not recorded"}  \n` +
    `**Completed:** ${run.completedAt || "Not recorded"}\n\n` +
    "- [Outcome](outcome.md)\n" +
    "- [Raw results](raw-results.json)\n" +
    "- [Preflight](preflight.json)\n" +
    "- [Run metadata](run-metadata.json)\n" +
    (run.preflight?.sandbox?.approval ? "- [Approval](approval.json)\n" : "") +
    "- [Auxiliary artifacts](artifacts/README.md)\n\n" +
    "This retained run is historical until the comparison validator accepts its evidence identity.\n";
}

function writeRunDocumentation(configuration, directory) {
  const runsPath = path.join(directory, "runs");
  for (const entry of fs.readdirSync(runsPath, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const runDirectory = path.join(runsPath, entry.name);
    const rawPath = path.join(runDirectory, "raw-results.json");
    if (!fs.existsSync(rawPath)) continue;
    const run = JSON.parse(fs.readFileSync(rawPath, "utf8"));
    const metadata = {
      schemaVersion: run.schemaVersion,
      configurationId: run.configuration?.configurationId,
      runId: run.configuration?.runId,
      startedAt: run.startedAt || null,
      completedAt: run.completedAt || null,
      evidenceIdentity: run.evidenceIdentity || null,
      environment: run.environment || null,
    };
    fs.writeFileSync(path.join(runDirectory, "README.md"), renderRunReadme(configuration, run), "utf8");
    fs.writeFileSync(path.join(runDirectory, "run-metadata.json"), JSON.stringify(metadata, null, 2) + "\n", "utf8");
    const approval = run.preflight?.sandbox?.approval;
    if (approval) {
      fs.writeFileSync(path.join(runDirectory, "approval.json"), JSON.stringify(approval, null, 2) + "\n", "utf8");
    }
    const artifactsDirectory = path.join(runDirectory, "artifacts");
    fs.mkdirSync(artifactsDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(artifactsDirectory, "README.md"),
      "# Auxiliary artifacts\n\nNo auxiliary artifacts were retained for this historical run.\n",
      "utf8",
    );
  }
}

for (const configuration of configurations) {
  const directory = configurationDirectory(configuration.configurationId);
  const casesDirectory = path.join(directory, "cases");
  fs.mkdirSync(casesDirectory, { recursive: true });
  fs.writeFileSync(path.join(directory, "README.md"), renderReadme(configuration), "utf8");
  fs.writeFileSync(path.join(casesDirectory, "index.md"), renderCases(configuration), "utf8");
  writeRunDocumentation(configuration, directory);
}

console.log(`Generated documentation for ${configurations.length} S0 configurations.`);