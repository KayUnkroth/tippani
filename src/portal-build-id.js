// Same-build identity for a portal.
//
// buildId = package version + the resolved path of the installed portal source.
// Two portals launched from the same install produce the same id; a different
// version or a different install location produces a different one. Used to gate
// an in-place token handoff (a token is never pushed into a different build) and
// recorded in the portal registry so an adopting/refreshing instance can compare
// without probing the running process's internals.

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

export function computeBuildId({ version, entryPath } = {}) {
  const v = version == null ? "" : String(version);
  const p = entryPath == null || entryPath === "" ? "" : path.resolve(String(entryPath));
  return `${v}@${p}`;
}

export function portalBuildId() {
  let version = "0.0.0";
  try {
    const require = createRequire(import.meta.url);
    version = require("../package.json").version || version;
  } catch { /* fall back to the sentinel version */ }
  return computeBuildId({ version, entryPath: fileURLToPath(import.meta.url) });
}
