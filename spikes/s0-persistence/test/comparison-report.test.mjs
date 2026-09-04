import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONFIGURATION_MATRIX,
  applicableScenarioIds,
  applicabilityProfile,
} from "../src/applicability.mjs";
import {
  buildComparison,
  deriveDecision,
  validateExistingRun,
} from "../src/compare.mjs";
import { buildEvidenceIdentity, sha256 } from "../src/evidence-identity.mjs";
import { SCENARIOS } from "../src/scenario-catalog.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const comparisonPath = path.join(root, "results", "comparison", "comparison.md");
const comparisonJsonPath = path.join(root, "results", "comparison", "comparison.json");
const comparison = fs.readFileSync(comparisonPath, "utf8");
const comparisonJson = JSON.parse(fs.readFileSync(comparisonJsonPath, "utf8"));
const configPaths = [
  "local-sqlite.json",
  "local-cas.json",
  "provider-onedrive-live.json",
  "provider-ado-live.json",
  "provider-github-live.json",
].map((name) => path.join(root, "config", name));

let pass = 0;
let fail = 0;
async function check(name, action) {
  try { await action(); pass++; }
  catch (error) { fail++; console.error(`  FAIL: ${name}`); console.error(`        ${error.stack || error}`); }
}

await check("generated comparison rejects the checked-in stale campaigns", () => {
  assert(comparison.includes("## Rejected existing evidence"));
  assert(comparison.includes("**Final ADR readiness:** Incomplete"));
  assert(comparison.includes("**ADR approval:** Pending"));
  assert(!comparison.includes("**Final ADR status:** Accepted"));
  assert.equal(comparisonJson.decision.status, "Incomplete");
  assert.equal(comparisonJson.decision.mapping, null);
  assert.equal(comparisonJson.validationFailures.length, 5);
});

await check("comparison contains all configurations and both mappings without a fabricated selection", () => {
  for (const configuration of CONFIGURATION_MATRIX) {
    assert(comparison.includes(configuration.label), `Missing ${configuration.label}`);
  }
  assert(comparison.includes("Hybrid SQLite + provider-native CAS"));
  assert(comparison.includes("Generation-CAS envelope on every backing path"));
  assert(comparison.includes("Deferred until a selected mapping passes every applicable absolute gate"));
  assert(!comparison.includes("Approved by Kay Unkroth"));
});

await check("comparison links still resolve to retained historical artifacts", () => {
  const links = [...comparison.matchAll(/\]\((\.\.\/[^)]+)\)/g)].map((match) => match[1]);
  assert(links.length > 0);
  for (const link of new Set(links)) {
    assert(fs.existsSync(path.resolve(path.dirname(comparisonPath), link)), `Broken evidence link: ${link}`);
  }
});

await check("existing-run validation binds source, catalog, applicability, config, and complete results", () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, "config", "local-cas.json"), "utf8"));
  const valid = {
    schemaVersion: 2,
    evidenceIdentity: buildEvidenceIdentity(config),
    configuration: {
      configurationId: config.configurationId,
      adapter: config.adapter,
      backingPath: config.backingPath,
      applicabilityProfile: applicabilityProfile(config),
    },
    catalog: SCENARIOS.map((scenario) => ({ ...scenario })),
    applicableScenarioIds: applicableScenarioIds(config),
    results: applicableScenarioIds(config).map((scenarioId) => ({
      scenarioId,
      status: "Pass",
    })),
  };
  assert.deepEqual(validateExistingRun(valid, config), []);

  const stale = structuredClone(valid);
  stale.evidenceIdentity.sourceRevision = "sha256:stale";
  assert(validateExistingRun(stale, config).some((error) => /sourceRevision/.test(error)));

  const missing = structuredClone(valid);
  missing.results.pop();
  assert(validateExistingRun(missing, config).some((error) => /missing expected results/.test(error)));

  const wrongConfig = structuredClone(valid);
  wrongConfig.configuration.adapter = "local-sqlite";
  assert(validateExistingRun(wrongConfig, config).some((error) => /identity does not match/.test(error)));
});

await check("comparison resolves and verifies retained campaign artifact digests", () => {
  const config = JSON.parse(fs.readFileSync(
    path.join(root, "config", "provider-github-live.json"),
    "utf8",
  ));
  const directory = path.join(root, ".test-state", "comparison-artifacts", config.configurationId);
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
  const campaigns = [];
  const approvals = [];
  for (let index = 1; index <= 3; index++) {
    const name = `campaign-${index}`;
    const campaignDirectory = path.join(directory, name);
    fs.mkdirSync(campaignDirectory, { recursive: true });
    const raw = `${name}/raw-results.json`;
    const report = `${name}/outcome.md`;
    const rawBytes = Buffer.from(JSON.stringify({ runId: `s0-run-${index}` }));
    const reportBytes = Buffer.from(`# ${name}\n`);
    fs.writeFileSync(path.join(directory, raw), rawBytes);
    fs.writeFileSync(path.join(directory, report), reportBytes);
    campaigns.push({
      name,
      runId: `s0-run-${index}`,
      raw,
      rawSha256: `sha256:${sha256(rawBytes)}`,
      report,
      reportSha256: `sha256:${sha256(reportBytes)}`,
    });
    const targetHash = `sha256:target-${index}`;
    approvals.push({
      name,
      effectiveTargetHash: targetHash,
      approval: {
        approver: "Synthetic Reviewer",
        approvedAt: "2026-09-03T20:00:00.000Z",
        reference: `syn-${index}`,
        targetHash,
      },
    });
  }
  const run = {
    schemaVersion: 2,
    evidenceIdentity: buildEvidenceIdentity(config),
    configuration: {
      configurationId: config.configurationId,
      adapter: config.adapter,
      backingPath: config.backingPath,
      applicabilityProfile: applicabilityProfile(config),
      campaignCount: 3,
    },
    catalog: SCENARIOS.map((scenario) => ({ ...scenario })),
    applicableScenarioIds: applicableScenarioIds(config),
    results: applicableScenarioIds(config).map((scenarioId) => ({
      scenarioId,
      status: "Pass",
      evidence: {
        campaigns: Object.fromEntries(campaigns.map((campaign) => [
          campaign.name,
          { status: "Pass" },
        ])),
      },
    })),
    campaigns,
    campaignApprovals: approvals,
  };
  const aggregatePath = path.join(directory, "raw-results.json");
  assert.deepEqual(validateExistingRun(run, config, { artifactPath: aggregatePath }), []);
  fs.appendFileSync(path.join(directory, campaigns[0].raw), "\n");
  assert(
    validateExistingRun(run, config, { artifactPath: aggregatePath })
      .some((error) => /digest mismatch/.test(error)),
  );
  fs.rmSync(path.join(root, ".test-state"), { recursive: true, force: true });
});

await check("decision selection is derived from eligibility and explicit mapping choice", () => {
  const mappings = [
    { id: "MAP-HYBRID-SQLITE", status: "Eligible" },
    { id: "MAP-ENVELOPE", status: "Eligible" },
  ];
  assert.deepEqual(deriveDecision(mappings), {
    status: "Selection required",
    mapping: null,
    eligibleMappings: ["MAP-HYBRID-SQLITE", "MAP-ENVELOPE"],
    approval: "Pending",
  });
  assert.equal(deriveDecision(mappings, "MAP-ENVELOPE").mapping, "MAP-ENVELOPE");
  assert.equal(deriveDecision(mappings.map((mapping) => ({ ...mapping, status: "Incomplete" }))).status, "Incomplete");
});

await check("--use-existing produces incomplete comparison data without rerunning providers", async () => {
  const built = await buildComparison({ selectedConfigs: configPaths, useExisting: true });
  assert.equal(built.decision.status, "Incomplete");
  assert.equal(built.decision.mapping, null);
  assert.equal(built.validationFailures.length, 5);
  assert(built.runs.every(({ gates }) => gates.eligible === "Incomplete"));
});

await check("invalid performance evidence is excluded from architecture rationale", () => {
  assert(comparison.includes("No current decision-grade performance measurement is eligible"));
  assert(!comparison.includes("lower measured mutation/open/backup/restore latency"));
});

await check("comparison and ADR identify SQLite serialization as structural", () => {
  const adr = fs.readFileSync(
    path.join(root, "ADR-s0-persistence-architecture.md"),
    "utf8",
  );
  assert(comparison.includes("Known structural finding"));
  assert(comparison.includes("A rerun alone cannot close"));
  assert(adr.includes("structural failure"));
  assert(adr.includes("rerun alone cannot close"));
});

console.log(`s0-comparison-report: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
