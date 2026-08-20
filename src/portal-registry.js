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
import net from "net";

const REG_DIR = path.join(os.homedir(), ".tippani", "instances");

export function registryDir() {
  return REG_DIR;
}

/** Write (or overwrite) this portal's registry entry, keyed by port. */
export function writeInstance({
  port, prId, token, tokenExpiresAt = null, clientName = null, pid, url, shimPid,
  provider = "ado", owner = null, repo = null, buildId = null,
}) {
  let temporary = null;
  try {
    fs.mkdirSync(REG_DIR, { recursive: true, mode: 0o700 });
    const entry = {
      port: Number(port),
      prId: Number(prId),
      provider,
      owner,
      repo,
      token,
      tokenExpiresAt: tokenExpiresAt == null ? null : Number(tokenExpiresAt),
      clientName,
      pid: pid ?? process.pid,
      // The shim process that spawned this portal, if any. Under the
      // reference-counted model the portal survives this shim's exit while any
      // ref remains, so reaping consults the live ref count (see reapInstances).
      shimPid: shimPid == null ? null : Number(shimPid),
      // Same-build identity (version@installPath). An adopting or refreshing
      // instance compares this without probing the running process, and a token
      // handoff is refused across a build mismatch.
      buildId: buildId == null ? null : String(buildId),
      url: url || `http://localhost:${port}`,
      startedAt: Date.now(),
    };
    const target = path.join(REG_DIR, `${Number(port)}.json`);
    temporary = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(entry), { mode: 0o600 });
    fs.renameSync(temporary, target);
    return true;
  } catch {
    // A half-written entry must not linger in the registry directory.
    if (temporary) { try { fs.unlinkSync(temporary); } catch {} }
    return false;
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

/**
 * Is a process alive? Uses signal 0 (existence probe, sends nothing).
 * EPERM means the process exists but isn't ours — still alive.
 */
export function isPidAlive(pid) {
  const n = Number(pid);
  if (!n || !Number.isFinite(n)) return false;
  try {
    process.kill(n, 0);
    return true;
  } catch (e) {
    return e && e.code === "EPERM";
  }
}

/**
 * Does something accept a TCP connection on this port (localhost)? Used as an
 * IDENTITY proxy before killing an orphan: a live portal owns its port, so a
 * connectable port confirms the entry's pid is really that portal and not an
 * unrelated process that inherited a recycled PID. Best-effort, short timeout.
 */
function defaultConfirmPort(port, timeoutMs = 250) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; try { sock.destroy(); } catch {} resolve(v); } };
    const sock = net.connect({ port: Number(port), host: "127.0.0.1" });
    sock.once("connect", () => finish(true));
    sock.once("error", () => finish(false));
    sock.setTimeout(timeoutMs, () => finish(false));
  });
}

/**
 * Ask a portal how many refs it holds via its authenticated /portal/state
 * endpoint, presenting the registry entry's own bearer + client name. Returns
 * the ref count, or null if the port holder is not this registered tippani
 * portal (wrong/expired token, non-tippani stranger, hung, or an older build
 * without the endpoint). null is treated as "do not kill" by the reaper — a
 * count of 0 is the only signal that authorizes reaping a live-pid orphan.
 */
async function defaultPortalRefCount(inst, timeoutMs = 500) {
  if (!inst || !inst.token) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`http://127.0.0.1:${Number(inst.port)}/api/v1/portal/state`, {
      headers: {
        "X-Tippani-Client": String(inst.clientName || ""),
        Authorization: `Bearer ${inst.token}`,
      },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const body = await res.json();
    return typeof body?.count === "number" ? body.count : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Startup backstop for orphaned portals. For every registry entry:
 *   - portal pid dead                     → drop the stale file.
 *   - portal alive, spawning shim gone    → under the reference-counted model
 *       this is normal: the portal outlives its shim while a browser or pending
 *       ref remains. A PID can be recycled, so first confirm the port still
 *       serves (identity proxy); a dead port means a recycled stranger → drop
 *       the entry, never kill. If the port serves, ask the portal its ref count:
 *       exactly 0 authorizes reaping an idle orphan (kill + drop); a positive
 *       count, or an unconfirmed holder (null: wrong token / non-tippani / hung
 *       / older build), is LEFT untouched.
 *   - portal alive with a live (or unknown) shim → leave it.
 * Async and fully injectable so unit tests never touch real processes, sockets,
 * HTTP, or the real registry dir.
 *
 * Residual: if a dead shim's PID was itself recycled to a live process, the
 * entry looks non-orphaned and is left — the IPC-disconnect ref release covers
 * the common recycle case; this reaper only guarantees it never SIGTERMs a
 * stranger and never kills a portal that still holds refs.
 */
export async function reapInstances({
  listInstancesFn = listInstances,
  isPidAliveFn = isPidAlive,
  killPidFn = (pid) => { try { process.kill(Number(pid)); return true; } catch { return false; } },
  removeInstanceFn = removeInstance,
  confirmPortFn = defaultConfirmPort,
  portalRefCountFn = defaultPortalRefCount,
} = {}) {
  const reaped = [];
  for (const inst of listInstancesFn()) {
    if (!isPidAliveFn(inst.pid)) {
      removeInstanceFn(inst.port);
      reaped.push({ port: inst.port, reason: "dead-portal" });
      continue;
    }
    if (inst.shimPid != null && !isPidAliveFn(inst.shimPid)) {
      const serving = await confirmPortFn(inst.port);
      if (!serving) {
        // Alive pid but dead port → not our portal (recycled PID). Drop the
        // unreachable entry without killing a stranger.
        removeInstanceFn(inst.port);
        reaped.push({ port: inst.port, reason: "orphaned-stale-nokill" });
        continue;
      }
      // Port serving: a shim-gone portal is normally still alive on a browser or
      // pending ref. Only reap it if it confirms zero refs; a ref-held or
      // unconfirmable holder is never killed.
      const refs = await portalRefCountFn(inst);
      if (refs === 0) {
        killPidFn(inst.pid);
        removeInstanceFn(inst.port);
        reaped.push({ port: inst.port, reason: "orphaned-idle" });
      }
      // refs > 0 (ref-held) or refs == null (unconfirmed) → leave untouched.
    }
  }
  return reaped;
}
