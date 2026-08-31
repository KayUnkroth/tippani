#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderOutcomeReport } from "./result-writer.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const configurations = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["CFG-ONEDRIVE-LIVE", "CFG-ADO-LIVE", "CFG-GITHUB-LIVE"];

function loadCampaigns(configurationId) {
  const directory = path.join(root, "results", configurationId);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^campaign-\d+$/.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }))
    .map((entry) => {
      const rawPath = path.join(directory, entry.name, "raw-results.json");
      return fs.existsSync(rawPath)
        ? { name: entry.name, run: JSON.parse(fs.readFileSync(rawPath, "utf8")) }
        : null;
    })
    .filter(Boolean);
}

function combineResults(campaigns) {
  const scenarioIds = campaigns[0].run.catalog.map((scenario) => scenario.id);
  return scenarioIds.flatMap((scenarioId) => {
    const results = campaigns
      .map((campaign) => campaign.run.results.find((result) => result.scenarioId === scenarioId))
      .filter(Boolean);
    if (!results.length) return [];
    const statuses = results.map((result) => result.status);
    const status = statuses.includes("Fail") ? "Fail"
      : statuses.includes("Blocked") ? "Blocked"
        : statuses.includes("Incomplete") ? "Incomplete"
          : statuses.every((item) => item === "N/A") ? "N/A"
            : "Pass";
    const representative = results.find((result) => result.status === status) || results[0];
    const measurements = {};
    const measurementNames = new Set(results.flatMap((result) => Object.keys(result.measurements || {})));
    for (const name of measurementNames) {
      const values = results.map((result) => result.measurements?.[name]).filter(Number.isFinite);
      if (values.length) measurements[name] = values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    return [{
      ...representative,
      status,
      durationMs: results.reduce((sum, result) => sum + (result.durationMs || 0), 0) / results.length,
      evidence: {
        ...(representative.evidence || {}),
        campaigns: Object.fromEntries(campaigns.map((campaign, index) => [
          campaign.name,
          {
            status: results[index]?.status || "Not executed",
            evidence: results[index]?.evidence || {},
            measurements: results[index]?.measurements || {},
          },
        ])),
      },
      measurements,
    }];
  });
}

function distribution(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.length > 1
    ? values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / (values.length - 1)
    : 0;
  const percentile = (fraction) => sorted[Math.min(sorted.length - 1, Math.ceil(fraction * sorted.length) - 1)];
  return {
    count: values.length,
    min: sorted[0],
    p50: percentile(0.5),
    p95: percentile(0.95),
    max: sorted.at(-1),
    mean,
    stddev: Math.sqrt(variance),
  };
}

function campaignVariability(campaigns) {
  const names = new Set(campaigns.flatMap((campaign) => {
    const performance = campaign.run.results.find((result) => result.scenarioId === "S0-PER-004");
    return Object.keys(performance?.measurements || {});
  }));
  const result = {};
  for (const name of names) {
    const values = campaigns.map((campaign) => {
      const performance = campaign.run.results.find((item) => item.scenarioId === "S0-PER-004");
      return performance?.measurements?.[name];
    }).filter(Number.isFinite);
    if (values.length) result[name] = distribution(values);
  }
  return result;
}

for (const configurationId of configurations) {
  const campaigns = loadCampaigns(configurationId);
  if (!campaigns.length) continue;
  const first = campaigns[0].run;
  const aggregate = {
    ...first,
    schemaVersion: 2,
    harnessRevision: `${first.harnessRevision}-campaign-aggregate`,
    startedAt: campaigns[0].run.startedAt,
    completedAt: campaigns.at(-1).run.completedAt,
    configuration: {
      ...first.configuration,
      runId: `${configurationId.toLowerCase()}-aggregate`,
      campaignCount: campaigns.length,
      campaignRunIds: campaigns.map((campaign) => campaign.run.configuration.runId),
    },
    preflight: {
      ...first.preflight,
      runId: `${configurationId.toLowerCase()}-aggregate`,
      sandbox: {
        ...first.preflight.sandbox,
        ownershipMarker: "redacted-per-campaign",
        namespace: "redacted-per-campaign",
        cleanup: { manifestId: "see-campaign-preflights", expiresAt: "see-campaign-preflights" },
      },
    },
    environment: {
      ...first.environment,
      campaignCount: campaigns.length,
    },
    results: combineResults(campaigns),
    campaigns: campaigns.map((campaign) => ({
      name: campaign.name,
      runId: campaign.run.configuration.runId,
      raw: `${campaign.name}/raw-results.json`,
      report: `${campaign.name}/outcome.md`,
    })),
    campaignVariability: campaignVariability(campaigns),
  };
  if (configurationId === "CFG-ONEDRIVE-LIVE") {
    const syncRawPath = path.join(root, "results", "CFG-ONEDRIVE-SYNC", "raw-results.json");
    if (fs.existsSync(syncRawPath)) {
      const syncRun = JSON.parse(fs.readFileSync(syncRawPath, "utf8"));
      const syncResult = syncRun.results.find((result) => result.scenarioId === "S0-BCK-006");
      const index = aggregate.results.findIndex((result) => result.scenarioId === "S0-BCK-006");
      if (syncResult && index >= 0) {
        aggregate.results[index] = {
          ...syncResult,
          evidence: {
            ...(syncResult.evidence || {}),
            separateCompatibilityReport: "../CFG-ONEDRIVE-SYNC/outcome.md",
            providerCampaigns: "Not part of provider-API CAS campaigns",
          },
        };
      }
    }
  }
  const directory = path.join(root, "results", configurationId);
  fs.writeFileSync(path.join(directory, "raw-results.json"), JSON.stringify(aggregate, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(directory, "outcome.md"), renderOutcomeReport(aggregate), "utf8");
  fs.writeFileSync(path.join(directory, "preflight.json"), JSON.stringify(aggregate.preflight, null, 2) + "\n", "utf8");
  console.log(`${configurationId}: aggregated ${campaigns.length} campaigns`);
}
