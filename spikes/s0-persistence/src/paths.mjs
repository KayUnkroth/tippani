import path from "node:path";
import { fileURLToPath } from "node:url";

export const spikeRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const DIRECTORY_BY_CONFIGURATION = Object.freeze({
  "CFG-LOCAL-SQLITE": "TEST-CASES-LOCAL-SQLITE",
  "CFG-LOCAL-CAS": "TEST-CASES-LOCAL-CAS",
  "CFG-ONEDRIVE-LIVE": "TEST-CASES-ONEDRIVE-LIVE",
  "CFG-ADO-LIVE": "TEST-CASES-ADO-LIVE",
  "CFG-GITHUB-LIVE": "TEST-CASES-GITHUB-LIVE",
  "CFG-ONEDRIVE-SYNC": "TEST-CASES-ONEDRIVE-SYNC",
});

export function configurationDirectory(configurationId) {
  const directory = DIRECTORY_BY_CONFIGURATION[configurationId];
  if (!directory) throw new Error(`Unknown S0 configuration: ${configurationId}`);
  return path.join(spikeRoot, directory);
}

export function runsDirectory(configurationId) {
  return path.join(configurationDirectory(configurationId), "runs");
}

export function runDirectory(configurationId, runId) {
  if (!runId) throw new Error(`Run ID is required for ${configurationId}`);
  return path.join(runsDirectory(configurationId), runId);
}

export function comparisonMarkdownPath() {
  return path.join(spikeRoot, "comparison.md");
}

export function comparisonJsonPath() {
  return path.join(spikeRoot, "comparison.json");
}