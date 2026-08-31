import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONFIGURATION_MATRIX } from "../src/applicability.mjs";
import { gateSummary } from "../src/eligibility.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const comparisonPath = path.join(root, "results", "comparison", "comparison.md");
const comparison = fs.readFileSync(comparisonPath, "utf8");

let pass = 0;
let fail = 0;
async function check(name, action) {
  try { await action(); pass++; }
  catch (error) { fail++; console.error(`  FAIL: ${name}`); console.error(`        ${error.stack || error}`); }
}

await check("comparison contains all five engine/backing-path configurations", () => {
  for (const configuration of CONFIGURATION_MATRIX) {
    assert(comparison.includes(configuration.label), `Missing ${configuration.label}`);
  }
});

await check("comparison rolls components into both candidate mappings", () => {
  assert(comparison.includes("## Candidate architecture mappings"));
  assert(comparison.includes("Hybrid SQLite + provider-native CAS"));
  assert(comparison.includes("Generation-CAS envelope on every backing path"));
});

await check("comparison preserves applicability and outcome distinctions", () => {
  assert(comparison.includes("Not applicable (absolute)"));
  assert(comparison.includes("N/A"));
  assert(comparison.includes("Not executed"));
  assert(comparison.includes("Blocked / incomplete"));
  assert(!comparison.includes("OneDrive, ADO, and GitHub remain unexecuted"));
});

await check("comparison does not rank metrics without an eligible mapping", () => {
  const hasEligibleMapping = comparison.includes("**Final ADR status:** Accepted") ||
    comparison.includes("**Final ADR readiness:** Eligible mappings available");
  if (!hasEligibleMapping) {
    assert(comparison.includes("Relative metrics are provisional diagnostics only"));
    assert(comparison.includes("No ranking is produced"));
  }
});

await check("comparison contains owners, evidence requirements, and sign-off", () => {
  assert(comparison.includes("## Exact open gates and evidence requirements"));
  assert(comparison.includes("S0 provider test owner"));
  assert(comparison.includes("## Sign-off"));
  assert(comparison.includes("ADR approver"));
});

await check("every report and raw-evidence link target exists", () => {
  const links = [...comparison.matchAll(/\]\((\.\.\/[^)]+)\)/g)].map((match) => match[1]);
  assert(links.length > 0);
  for (const link of new Set(links)) {
    assert(fs.existsSync(path.resolve(path.dirname(comparisonPath), link)), `Broken evidence link: ${link}`);
  }
});

await check("local reports contain repeated raw samples and variability", () => {
  for (const id of ["CFG-LOCAL-SQLITE", "CFG-LOCAL-CAS"]) {
    const run = JSON.parse(fs.readFileSync(path.join(root, "results", id, "raw-results.json"), "utf8"));
    const startup = run.results.find((result) => result.scenarioId === "S0-PER-001");
    const latency = run.results.find((result) => result.scenarioId === "S0-PER-002");
    const footprint = run.results.find((result) => result.scenarioId === "S0-PER-003");
    const complexity = run.results.find((result) => result.scenarioId === "S0-PER-005");
    assert.equal(startup.evidence.rawSamples.small.initializedMs.length, 5);
    assert.equal(footprint.evidence.rawSamples.small.storeBytes.length, 5);
    assert.equal(typeof latency.measurements.mutationStdDevMs_small, "number");
    assert.equal(complexity.status, "Pass");
    assert.equal(gateSummary(run).eligible, "Yes");
  }
});

await check("provider reports execute or explicitly block every applicable scenario", () => {
  for (const id of ["CFG-ONEDRIVE-LIVE", "CFG-ADO-LIVE", "CFG-GITHUB-LIVE"]) {
    const run = JSON.parse(fs.readFileSync(path.join(root, "results", id, "raw-results.json"), "utf8"));
    const byId = new Map(run.results.map((result) => [result.scenarioId, result]));
    for (const scenarioId of run.applicableScenarioIds) {
      assert(byId.has(scenarioId), `${id} omitted ${scenarioId}`);
    }
    const providerPerformance = byId.get("S0-PER-004");
    assert(["Pass", "Blocked"].includes(providerPerformance.status));
    if (providerPerformance.status === "Pass") {
      assert.equal(typeof providerPerformance.evidence.requestsPerMutation_small, "number");
      assert.equal(typeof providerPerformance.measurements.collaboratorDiscoveryP50Ms_small, "number");
    }
  }
});

await check("provider aggregates retain three standardized campaigns and variability", () => {
  for (const id of ["CFG-ONEDRIVE-LIVE", "CFG-ADO-LIVE", "CFG-GITHUB-LIVE"]) {
    const run = JSON.parse(fs.readFileSync(path.join(root, "results", id, "raw-results.json"), "utf8"));
    assert.equal(run.configuration.campaignCount, 3);
    assert.equal(run.campaigns.length, 3);
    const performance = run.results.find((result) => result.scenarioId === "S0-PER-004");
    for (const campaign of Object.values(performance.evidence.campaigns)) {
      assert.equal(campaign.status, "Pass");
      assert.equal(campaign.evidence.repetitions_small, 6);
      assert.equal(campaign.evidence.repetitions_medium, 4);
      assert.equal(campaign.evidence.repetitions_stress, 2);
      assert.equal(campaign.evidence.throttleResponses, 1);
      assert.deepEqual(campaign.evidence.throttleRetryAfterSeconds, [1]);
    }
    assert.equal(run.campaignVariability.remoteCasP50Ms_small.count, 3);
    assert.equal(run.campaignVariability.collaboratorDiscoveryP50Ms_small.count, 3);
  }
});

await check("OneDrive sync compatibility stays separate from provider API CAS", () => {
  const run = JSON.parse(fs.readFileSync(path.join(root, "results", "CFG-ONEDRIVE-LIVE", "raw-results.json"), "utf8"));
  const result = run.results.find((item) => item.scenarioId === "S0-BCK-006");
  assert.equal(result.status, "Pass");
  assert.equal(result.evidence.providerApiCasUsed, false);
  assert.match(result.evidence.limitation, /second synced device/i);
  assert.equal(result.evidence.separateCompatibilityReport, "../CFG-ONEDRIVE-SYNC/outcome.md");
});

console.log(`s0-comparison-report: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
