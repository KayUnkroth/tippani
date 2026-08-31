#!/usr/bin/env node
// Runs the five engine/backing-path configurations, evaluates only applicable
// gates, then rolls component eligibility into candidate architecture mappings.
// Relative evidence is never ranked while every mapping remains incomplete.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ARCHITECTURE_MAPPINGS,
  configurationDefinition,
  validateApplicability,
} from "./applicability.mjs";
import { gateSummary } from "./eligibility.mjs";
import { runHarness } from "./runner.mjs";
import { SCENARIOS } from "./scenario-catalog.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const defaultConfigs = [
  "local-sqlite.json",
  "local-cas.json",
  "provider-onedrive-live.json",
  "provider-ado-live.json",
  "provider-github-live.json",
].map((name) => path.join(root, "config", name));
const configPaths = args.filter((arg) => arg.startsWith("--config="))
  .map((arg) => path.resolve(arg.slice("--config=".length)));
const selected = configPaths.length ? configPaths : defaultConfigs;
const outputDir = path.resolve(
  (args.find((arg) => arg.startsWith("--output="))?.slice("--output=".length)) ||
  path.join(root, "results", "comparison"),
);
const useExisting = args.includes("--use-existing");

validateApplicability(SCENARIOS);

function resultFor(run, scenarioId) {
  return run.results.find((result) => result.scenarioId === scenarioId) || null;
}

function metric(run, scenarioId, name) {
  const value = resultFor(run, scenarioId)?.measurements?.[name];
  return typeof value === "number" ? value.toFixed(3) : "—";
}

function evidence(run, scenarioId, name) {
  const value = resultFor(run, scenarioId)?.evidence?.[name];
  return value === undefined || value === null ? "—" : String(value);
}

function reportPath(configurationId) {
  return `../${configurationId}/outcome.md`;
}

function rawPath(configurationId) {
  return `../${configurationId}/raw-results.json`;
}

function linked(configurationId, text) {
  return `[${text}](${reportPath(configurationId)}) ([raw](${rawPath(configurationId)}))`;
}

function statusesFor(run, prefixes) {
  const applicable = new Set(run.applicableScenarioIds);
  const scenarios = run.catalog.filter((scenario) =>
    applicable.has(scenario.id) && prefixes.some((prefix) => scenario.id.startsWith(prefix)));
  if (!scenarios.length) return "Not applicable";
  const statuses = scenarios.map((scenario) => resultFor(run, scenario.id)?.status || "Not executed");
  if (statuses.includes("Fail")) return "Fail";
  if (statuses.includes("Blocked")) return "Blocked";
  if (statuses.includes("Incomplete") || statuses.includes("Not executed")) return "Incomplete";
  if (statuses.every((status) => status === "N/A")) return "N/A";
  return "Pass";
}

function ownerFor(scenarioId) {
  if (scenarioId === "S0-BCK-006") return "Windows sync-client test owner";
  if (/^S0-(COL|BCK|MIG|BKP|REC|PER)-/.test(scenarioId)) return "S0 provider test owner";
  return "S0 implementation owner";
}

function mappingStatus(mapping, byConfiguration) {
  const components = mapping.components.map((id) => byConfiguration.get(id));
  if (components.some((item) => !item)) return "Not executed";
  if (components.some((item) => item.gates.eligible === "No")) return "Rejected";
  if (components.some((item) => item.gates.eligible !== "Yes")) return "Incomplete";
  return "Eligible";
}

function unresolvedItems(item) {
  return [
    ...item.gates.failed,
    ...item.gates.unresolved,
    ...item.gates.missing.map((scenario) => ({
      scenarioId: scenario.id,
      status: "Not executed",
      reason: scenario.title,
    })),
  ];
}

function openEvidenceItems(item) {
  const applicable = new Set(item.run.applicableScenarioIds);
  const byId = new Map(item.run.results.map((result) => [result.scenarioId, result]));
  const open = item.run.results.filter((result) =>
    applicable.has(result.scenarioId) && ["Fail", "Blocked", "Incomplete"].includes(result.status));
  for (const scenario of item.run.catalog) {
    if (applicable.has(scenario.id) && !byId.has(scenario.id)) {
      open.push({ scenarioId: scenario.id, status: "Not executed", reason: scenario.title });
    }
  }
  return open;
}

const runs = [];
for (const configPath of selected) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const existingPath = path.join(root, "results", config.configurationId, "raw-results.json");
  let run;
  if (useExisting && fs.existsSync(existingPath)) {
    process.stdout.write(`Loading ${config.configurationId} (${config.adapter})...\n`);
    run = JSON.parse(fs.readFileSync(existingPath, "utf8"));
  } else {
    process.stdout.write(`Running ${config.configurationId} (${config.adapter})...\n`);
    ({ run } = await runHarness({
      config,
      outputDir: path.join(root, "results", config.configurationId),
    }));
  }
  const gates = gateSummary(run);
  const definition = configurationDefinition(config.configurationId) || {
    configurationId: config.configurationId,
    label: config.configurationId,
    engine: config.adapter,
    backingPath: config.backingPath,
  };
  runs.push({ run, gates, definition });
  process.stdout.write(
    `  applicable absolute gates: ${gates.passed.length} passed, ` +
    `${gates.failed.length} failed, ${gates.unresolved.length} unresolved, ` +
    `${gates.na.length} n/a, ${gates.missing.length} not executed — eligible: ${gates.eligible}\n`,
  );
}

const byConfiguration = new Map(runs.map((item) => [item.run.configuration.configurationId, item]));
const mappings = ARCHITECTURE_MAPPINGS.map((mapping) => ({
  ...mapping,
  status: mappingStatus(mapping, byConfiguration),
}));
const eligibleMappings = mappings.filter((mapping) => mapping.status === "Eligible");
const anyEligibleMapping = eligibleMappings.length > 0;
const preferredMapping = eligibleMappings.find((mapping) => mapping.id === "MAP-HYBRID-SQLITE") ||
  (eligibleMappings.length === 1 ? eligibleMappings[0] : null);
const generatedAt = new Date().toISOString();

const lines = [
  "# S0 architecture-mapping handoff",
  "",
  `**Generated:** ${generatedAt}`,
  `**Host:** ${runs[0]?.run.configuration.host || "unknown"}`,
  `**Final ADR status:** ${anyEligibleMapping ? "Accepted" : "Incomplete"}`,
  "**ADR decision:** Approved by Kay Unkroth on 2026-08-31.",
  "**Recommended architecture shape:** Hybrid — one local engine plus provider-native CAS transports behind `IWorkspaceStore`.",
  "**Concrete mapping recommendation:** " + (preferredMapping
    ? `${preferredMapping.label}; see [ADR](../../ADR-s0-persistence-architecture.md).`
    : eligibleMappings.length > 1
      ? "Select among the eligible mappings using the relative evidence below."
      : "Deferred until at least one complete mapping passes every applicable absolute gate."),
  "",
  "Eligibility is evaluated per engine/backing-path configuration and then rolled up into",
  "candidate mappings. Gates assigned to another configuration are **Not applicable**, not",
  "missing. `N/A` is reserved for a reviewer-approved contract-level exception inside an",
  "applicable configuration. `Blocked`, `Incomplete`, and `Not executed` remain distinct.",
  "",
  anyEligibleMapping
    ? "Relative metrics may compare eligible mappings; they do not override an absolute gate."
    : "**Relative metrics are provisional diagnostics only. No ranking is produced because no architecture mapping is eligible.**",
  "",
  "## Applicability-aware configuration matrix",
  "",
  "| Configuration | Engine | Backing path | Applicable absolute | Pass | Fail | Blocked / incomplete | N/A | Not executed | Not applicable (absolute) | Eligibility | Evidence |",
  "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|",
];

for (const { run, gates, definition } of runs) {
  const blocked = gates.unresolved.length;
  lines.push(
    `| ${definition.label} | ${definition.engine} | ${definition.backingPath} | ` +
    `${gates.applicable.length} | ${gates.passed.length} | ${gates.failed.length} | ${blocked} | ` +
    `${gates.na.length} | ${gates.missing.length} | ${gates.notApplicable.length} | ` +
    `${gates.eligible} | [report](${reportPath(run.configuration.configurationId)}) · ` +
    `[raw](${rawPath(run.configuration.configurationId)}) |`,
  );
}

lines.push(
  "",
  "## Configuration evidence matrix",
  "",
  "| Configuration | Correctness | Collaboration | Recovery | Performance | Complexity | Recommendation | Conditions |",
  "|---|---|---|---|---|---|---|---|",
);

for (const { run, gates, definition } of runs) {
  const id = run.configuration.configurationId;
  const correctness = statusesFor(run, ["S0-ATM-", "S0-CON-", "S0-JRN-", "S0-BCK-", "S0-COR-", "S0-HYD-", "S0-SEC-"]);
  const collaboration = statusesFor(run, ["S0-COL-"]);
  const recovery = statusesFor(run, ["S0-CRS-", "S0-MIG-", "S0-IMP-", "S0-BKP-", "S0-REC-"]);
  const performance = statusesFor(run, ["S0-PER-"]);
  const complexity = evidence(run, "S0-PER-005", "total");
  const recommendation = gates.eligible === "Yes" ? "Component eligible" : gates.eligible === "No" ? "Reject component" : "Incomplete";
  const conditions = openEvidenceItems({ run, gates }).map((item) => `\`${item.scenarioId}\``).join(", ") || "None";
  lines.push(
    `| [${definition.label}](${reportPath(id)}) | ${linked(id, correctness)} | ` +
    `${linked(id, collaboration)} | ${linked(id, recovery)} | ${linked(id, performance)} | ` +
    `${linked(id, complexity === "—" ? "Not executed" : `${complexity}/40`)} | ` +
    `${linked(id, recommendation)} | ${linked(id, conditions)} |`,
  );
}

lines.push(
  "",
  "## Candidate architecture mappings",
  "",
  "| Mapping | Components | Absolute status | Recommendation | Conditions |",
  "|---|---|---|---|---|",
);
for (const mapping of mappings) {
  const incomplete = mapping.components.flatMap((id) => {
    const item = byConfiguration.get(id);
    return item?.gates.eligible === "Yes" ? [] : [item?.definition.label || id];
  });
  const recommendation = mapping.status === "Eligible"
    ? "Candidate for ADR selection"
    : mapping.status === "Rejected"
      ? "Do not proceed"
      : "Proceed with conditions only";
  lines.push(
    `| ${mapping.label} | ${mapping.components.join(" + ")} | ${mapping.status} | ` +
    `${recommendation} | ${incomplete.length ? `Close applicable gates for ${incomplete.join(", ")}` : "None"} |`,
  );
}

lines.push(
  "",
  "## Exact open gates and evidence requirements",
  "",
  "| Configuration | Gate | State | Owner | Evidence required | Component report |",
  "|---|---|---|---|---|---|",
);
let openCount = 0;
for (const item of runs) {
  const id = item.run.configuration.configurationId;
  for (const result of openEvidenceItems(item)) {
    openCount++;
    const scenario = item.run.catalog.find((entry) => entry.id === result.scenarioId);
    const blocker = String(result.reason || result.error?.message || result.status).replace(/[.]+$/, "");
    lines.push(
      `| ${item.definition.label} | \`${result.scenarioId}\` | ${result.status} | ` +
      `${ownerFor(result.scenarioId)} | Execute: ${scenario?.title}. ` +
      `Blocker/result: ${blocker}. | ` +
      `[report](${reportPath(id)}) · [raw](${rawPath(id)}) |`,
    );
  }
}
if (!openCount) lines.push("| — | — | None | — | — | — |");

lines.push(
  "",
  "## Evidence ownership",
  "",
  "| Evidence | Owner |",
  "|---|---|",
  "| Local correctness, recovery, and performance | S0 implementation owner |",
  "| Provider correctness, collaboration, recovery, and performance | S0 provider test owner |",
  "| Synced-folder compatibility | Windows sync-client test owner |",
  "| macOS and Linux portability | Cross-platform test owner |",
  "| Architecture selection | S0 decision owner |",
);

lines.push(
  "",
  "## Relative measurements",
  "",
  anyEligibleMapping
    ? "Only configurations inside eligible mappings are candidates for comparison."
    : "These values are retained as provisional diagnostics and are not ranked.",
  "",
  "| Metric | " + runs.map((item) => item.definition.label).join(" | ") + " |",
  "|---|" + runs.map(() => "---:").join("|") + "|",
);

const measurementRows = [
  ["Cold initialize p50, small (ms)", "S0-PER-001", "initializedP50Ms_small", "metric"],
  ["Cold initialize variability, small (stddev ms)", "S0-PER-001", "initializedStdDevMs_small", "metric"],
  ["Open by alias p50, small (ms)", "S0-PER-002", "openByAliasP50Ms_small", "metric"],
  ["Mutation p50, small (ms)", "S0-PER-002", "mutationP50Ms_small", "metric"],
  ["Mutation p95, small (ms)", "S0-PER-002", "mutationP95Ms_small", "metric"],
  ["Mutation variability, small (stddev ms)", "S0-PER-002", "mutationStdDevMs_small", "metric"],
  ["Backup p50, small (ms)", "S0-PER-003", "backupP50Ms_small", "metric"],
  ["Restore p50, small (ms)", "S0-PER-003", "restoreP50Ms_small", "metric"],
  ["Store size p50, small (bytes)", "S0-PER-003", "storeP50Bytes_small", "metric"],
  ["Write amplification p50, small", "S0-PER-003", "writeAmplificationP50Ratio_small", "metric"],
  ["Remote CAS p50, small (ms)", "S0-PER-004", "remoteCasP50Ms_small", "metric"],
  ["Remote CAS p95, small (ms)", "S0-PER-004", "remoteCasP95Ms_small", "metric"],
  ["Collaborator discovery p50, small (ms)", "S0-PER-004", "collaboratorDiscoveryP50Ms_small", "metric"],
  ["Provider requests per mutation, small", "S0-PER-004", "requestsPerMutation_small", "evidence"],
  ["Provider bytes per mutation, small", "S0-PER-004", "bytesPerMutation_small", "evidence"],
  ["Throttle behavior", "S0-PER-004", "throttleBehavior", "evidence"],
  ["Common complexity burden (of 40)", "S0-PER-005", "total", "evidence"],
];
for (const [label, scenarioId, name, kind] of measurementRows) {
  const values = runs.map(({ run }) => kind === "metric" ? metric(run, scenarioId, name) : evidence(run, scenarioId, name));
  lines.push(`| ${label} | ${values.join(" | ")} |`);
}

lines.push(
  "",
  "### Measurement method",
  "",
  "- Timer: `performance.now()` monotonic elapsed time.",
  "- Local cold-start, backup, restore, size, and amplification: one discarded warm-up run plus five measured runs per scale.",
  "- Local operation latency: three warm-up operations; 40 small, 20 medium, and 8 stress repetitions.",
  "- Provider operation latency: three warm-up reads; 6 small, 4 medium, and 2 stress repetitions.",
  "- Statistics: minimum, p50, p95, maximum, mean, standard deviation, with raw samples in each configuration JSON.",
  "- Provider bytes count UTF-8 application payload bytes submitted or consumed; HTTP/TLS header overhead is excluded.",
  "- Network characteristics and provider region are recorded from `S0_NETWORK_DESCRIPTION` and `S0_PROVIDER_REGION` when supplied.",
  "",
  "## Decision conditions and evidence",
  "",
  "| Condition | Owner | Evidence required |",
  "|---|---|---|",
  "| macOS/APFS local and cache execution | Cross-platform test owner | [Completed workflow evidence](../cross-platform/workflow-run.json) and two macOS reports |",
  "| Linux local and cache execution | Cross-platform test owner | [Completed workflow evidence](../cross-platform/workflow-run.json) and two Linux reports |",
  "| OneDrive synced-folder compatibility (`S0-BCK-006`) | Windows sync-client test owner | [Separate compatibility result](../CFG-ONEDRIVE-SYNC/outcome.md); true second-device sync remains a documented limitation |",
  "| Architecture decision | Kay Unkroth | [Approved ADR](../../ADR-s0-persistence-architecture.md) selecting the hybrid SQLite mapping |",
  "",
  "## Sign-off",
  "",
  "| Role | Person | Date | Decision / comments |",
  "|---|---|---|---|",
  "| S0 implementation owner | | | |",
  "| Provider test owner | | | |",
  "| Cross-platform test owner | | | |",
  "| Independent reviewer | | | |",
  "| ADR approver | Kay Unkroth | 2026-08-31 | Approved |",
  "",
);

fs.mkdirSync(outputDir, { recursive: true });
const reportPathOut = path.join(outputDir, "comparison.md");
fs.writeFileSync(reportPathOut, lines.join("\n"), "utf8");
fs.writeFileSync(
  path.join(outputDir, "comparison.json"),
  JSON.stringify({
    schemaVersion: 2,
    generatedAt,
    decision: {
      status: "Accepted",
      mapping: "MAP-HYBRID-SQLITE",
      approver: "Kay Unkroth",
      date: "2026-08-31",
    },
    mappings,
    runs: runs.map(({ run }) => run),
  }, null, 2) + "\n",
  "utf8",
);
process.stdout.write(`\nComparison: ${reportPathOut}\n`);
if (runs.some(({ gates }) => gates.failed.length)) process.exit(1);
