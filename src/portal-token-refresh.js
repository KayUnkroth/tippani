// In-place ADO token refresh for a running portal (`--refreshToken`).
//
// The host launches a throwaway MCP shim with `--refreshToken`, the new
// host-provided token, and a target port. If a *same-build* tippani portal
// holds that port, the token is pushed to it in place over the authenticated
// control API and the shim exits — no restart, no new port, no lost browser
// session. Any build mismatch, a foreign port holder, or a missing build id is
// refused; a free port falls through to a normal cold start.
//
// The decision (planTokenRefresh) and messaging are pure; the orchestrator
// (runTokenRefresh) is fully injectable so tests never touch real registries,
// sockets, or HTTP.

import net from "net";
import { listInstances, isPidAlive } from "./portal-registry.js";

const DEFAULT_PORT = 3847;

export function parseRefreshArgs(argv = [], env = {}) {
  const args = Array.isArray(argv) ? argv : [];
  let isRefresh = false;
  let token = null;
  let port = null;
  for (let i = 0; i < args.length; i++) {
    const a = String(args[i]);
    if (a === "--refreshToken" || a === "--refresh-token") { isRefresh = true; continue; }
    if (a.startsWith("--refreshToken=")) { isRefresh = true; token = a.slice("--refreshToken=".length) || null; continue; }
    if (a.startsWith("--refresh-token=")) { isRefresh = true; token = a.slice("--refresh-token=".length) || null; continue; }
    if (a === "--port") { const n = Number(args[i + 1]); if (Number.isFinite(n)) port = n; i++; continue; }
    if (a.startsWith("--port=")) { const n = Number(a.slice("--port=".length)); if (Number.isFinite(n)) port = n; continue; }
  }
  if (token == null) token = env.TIPPANI_ADO_TOKEN || null;
  if (port == null || !Number.isFinite(port) || port <= 0) {
    const envPort = Number(env.TIPPANI_PORT);
    port = Number.isFinite(envPort) && envPort > 0 ? envPort : DEFAULT_PORT;
  }
  return { isRefresh, token, port };
}

// Decide what to do given the registry entry (or null), this shim's build id,
// whether that entry's pid is alive, and whether the port is occupied at all.
export function planTokenRefresh({ instance, myBuildId, pidAlive, portOccupied }) {
  const mine = String(myBuildId || "");
  if (instance && pidAlive) {
    const running = instance.buildId == null ? "" : String(instance.buildId);
    if (!running) return { action: "refuse", reason: "unknown-build", running: null, mine };
    if (running !== mine) return { action: "refuse", reason: "build-mismatch", running, mine };
    return { action: "handoff", reason: "same-build" };
  }
  // No live registered portal for this port. Occupancy without a matching live
  // entry means a foreign process holds the port.
  if (portOccupied) return { action: "refuse", reason: "foreign-holder" };
  return { action: "free", reason: "no-portal" };
}

export function refreshMessage(port, plan) {
  switch (plan.action) {
    case "handoff": return "Token updated successfully";
    case "free": return `No running portal on port ${port} to refresh.`;
    case "refuse":
      if (plan.reason === "build-mismatch") {
        return `Refusing token handoff: the portal on port ${port} is a different build ` +
          `(running ${plan.running}, this ${plan.mine}). Restart the portal to change builds.`;
      }
      if (plan.reason === "unknown-build") {
        return `Refusing token handoff: the portal on port ${port} did not report a build id.`;
      }
      if (plan.reason === "foreign-holder") {
        return `Refusing token handoff: port ${port} is held by a non-tippani process.`;
      }
      return `Refusing token handoff on port ${port}.`;
    default: return `Unrecognized refresh outcome on port ${port}.`;
  }
}

function probePort(port, timeoutMs = 300) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; try { sock.destroy(); } catch {} resolve(v); } };
    const sock = net.connect({ port: Number(port), host: "127.0.0.1" });
    sock.once("connect", () => finish(true));
    sock.once("error", () => finish(false));
    sock.setTimeout(timeoutMs, () => finish(false));
  });
}

// Push the token to the portal via the authenticated ado-token control route,
// presenting the registry entry's own bearer + client name.
export async function performTokenHandoff(instance, token, { fetchImpl = fetch } = {}) {
  if (!token) return { ok: false, error: "no token to hand off" };
  const res = await fetchImpl(`http://127.0.0.1:${Number(instance.port)}/api/v1/ado-token`, {
    method: "POST",
    headers: {
      "X-Tippani-Client": String(instance.clientName || ""),
      Authorization: `Bearer ${instance.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    let error = `HTTP ${res.status}`;
    try { const b = await res.json(); if (b?.error) error = b.error; } catch {}
    return { ok: false, status: res.status, error };
  }
  return { ok: true };
}

export async function runTokenRefresh({
  port, token, myBuildId,
  listInstancesFn = listInstances,
  isPidAliveFn = isPidAlive,
  confirmPortFn = probePort,
  handoffFn = performTokenHandoff,
} = {}) {
  const instance = (listInstancesFn() || []).find((i) => Number(i.port) === Number(port)) || null;
  const pidAlive = instance ? isPidAliveFn(instance.pid) : false;
  const portOccupied = (instance && pidAlive) ? true : await confirmPortFn(port);
  const plan = planTokenRefresh({ instance, myBuildId, pidAlive, portOccupied });

  if (plan.action === "handoff") {
    const res = await handoffFn(instance, token, {});
    if (res.ok) return { ok: true, action: "handoff", reason: "same-build", message: refreshMessage(port, plan) };
    return {
      ok: false,
      action: "handoff",
      reason: res.error || "handoff-failed",
      message: `Token handoff failed on port ${port}: ${res.error || "unknown error"}`,
    };
  }
  return {
    ok: plan.action !== "refuse",
    action: plan.action,
    reason: plan.reason,
    message: refreshMessage(port, plan),
  };
}
