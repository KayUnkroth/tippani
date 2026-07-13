// Registry of running tippani portals so multiple portals (one per PR) can
// coexist and be discovered across processes.
//
// Each running portal writes ~/.tippani/instances/<port>.json describing the
// PR it has open, its port/url, and the session token an MCP client needs to
// talk to it. The MCP shim scans this directory to decide whether to ADOPT a
// portal already open for the requested PR (possibly launched by another
// panel) or LAUNCH a new one on a free port — leaving other PRs' portals
// untouched. Entries are best-effort: a crashed portal may leave a stale file,
// so consumers must health-check before trusting an entry.

import fs from "fs";
import path from "path";
import os from "os";

const REG_DIR = path.join(os.homedir(), ".tippani", "instances");

export function registryDir() {
  return REG_DIR;
}

/** Write (or overwrite) this portal's registry entry, keyed by port. */
export function writeInstance({ port, prId, token, pid, url }) {
  try {
    fs.mkdirSync(REG_DIR, { recursive: true, mode: 0o700 });
    const entry = {
      port: Number(port),
      prId: Number(prId),
      token,
      pid: pid ?? process.pid,
      url: url || `http://localhost:${port}`,
      startedAt: Date.now(),
    };
    fs.writeFileSync(path.join(REG_DIR, `${Number(port)}.json`), JSON.stringify(entry), { mode: 0o600 });
  } catch {
    /* best effort */
  }
}

/** Remove this portal's registry entry. Idempotent. */
export function removeInstance(port) {
  try {
    fs.unlinkSync(path.join(REG_DIR, `${Number(port)}.json`));
  } catch {
    /* already gone */
  }
}

/** All registry entries (unvalidated — callers should health-check). */
export function listInstances() {
  try {
    return fs
      .readdirSync(REG_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          return JSON.parse(fs.readFileSync(path.join(REG_DIR, f), "utf8"));
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}
