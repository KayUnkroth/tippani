// Unit tests for the in-place token refresh core (portal-token-refresh.js).
import {
  parseRefreshArgs,
  planTokenRefresh,
  refreshMessage,
  performTokenHandoff,
  runTokenRefresh,
} from "./portal-token-refresh.js";

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.error("  FAIL: " + name); }
}

const BUILD = "1.9.0@/opt/tippani/src/portal-build-id.js";

try {
  // --- parseRefreshArgs ---
  {
    const a = parseRefreshArgs(["--refreshToken", "--port", "3850"], { TIPPANI_ADO_TOKEN: "envtok" });
    check("parse: flag detected", a.isRefresh === true);
    check("parse: port from --port", a.port === 3850);
    check("parse: token falls back to env", a.token === "envtok");
  }
  {
    const a = parseRefreshArgs(["--refreshToken=inline-tok", "--port=3860"], {});
    check("parse: inline token wins", a.token === "inline-tok" && a.port === 3860);
  }
  {
    const a = parseRefreshArgs(["--refresh-token"], { TIPPANI_PORT: "3870" });
    check("parse: hyphen alias + env port", a.isRefresh && a.port === 3870);
  }
  {
    const a = parseRefreshArgs([], {});
    check("parse: no flag -> not a refresh, default port", a.isRefresh === false && a.port === 3847);
  }

  // --- planTokenRefresh ---
  {
    const p = planTokenRefresh({ instance: { buildId: BUILD }, myBuildId: BUILD, pidAlive: true, portOccupied: true });
    check("plan: same build -> handoff", p.action === "handoff");
  }
  {
    const p = planTokenRefresh({ instance: { buildId: "0.0.0@/x" }, myBuildId: BUILD, pidAlive: true, portOccupied: true });
    check("plan: different build -> refuse build-mismatch", p.action === "refuse" && p.reason === "build-mismatch" && p.running === "0.0.0@/x" && p.mine === BUILD);
  }
  {
    const p = planTokenRefresh({ instance: { buildId: null }, myBuildId: BUILD, pidAlive: true, portOccupied: true });
    check("plan: missing build id -> refuse unknown-build", p.action === "refuse" && p.reason === "unknown-build");
  }
  {
    const p = planTokenRefresh({ instance: null, myBuildId: BUILD, pidAlive: false, portOccupied: true });
    check("plan: no entry + occupied -> refuse foreign-holder", p.action === "refuse" && p.reason === "foreign-holder");
  }
  {
    const p = planTokenRefresh({ instance: null, myBuildId: BUILD, pidAlive: false, portOccupied: false });
    check("plan: no entry + free -> free", p.action === "free");
  }
  {
    // Registry entry whose pid is dead is treated as no live portal.
    const p = planTokenRefresh({ instance: { buildId: BUILD }, myBuildId: BUILD, pidAlive: false, portOccupied: false });
    check("plan: stale entry + free port -> free", p.action === "free");
  }

  // --- refreshMessage ---
  {
    check("msg: handoff", refreshMessage(3847, { action: "handoff" }) === "Token updated successfully");
    check("msg: build-mismatch names both builds", /different build/.test(refreshMessage(3847, { action: "refuse", reason: "build-mismatch", running: "a", mine: "b" })));
    check("msg: foreign-holder", /non-tippani/.test(refreshMessage(3847, { action: "refuse", reason: "foreign-holder" })));
    check("msg: free", /No running portal/.test(refreshMessage(3847, { action: "free" })));
  }

  // --- performTokenHandoff ---
  {
    let captured = null;
    const fetchImpl = async (url, opts) => { captured = { url, opts }; return { ok: true }; };
    const r = await performTokenHandoff({ port: 3847, token: "bearer-abc", clientName: "mcp" }, "new-tok", { fetchImpl });
    check("handoff: ok on 2xx", r.ok === true);
    check("handoff: posts to ado-token route", captured.url === "http://127.0.0.1:3847/api/v1/ado-token" && captured.opts.method === "POST");
    check("handoff: presents the portal's bearer + client", captured.opts.headers.Authorization === "Bearer bearer-abc" && captured.opts.headers["X-Tippani-Client"] === "mcp");
    check("handoff: sends the new token in the body", JSON.parse(captured.opts.body).token === "new-tok");
  }
  {
    const fetchImpl = async () => ({ ok: false, status: 401, json: async () => ({ error: "token rejected" }) });
    const r = await performTokenHandoff({ port: 3847, token: "b", clientName: "mcp" }, "new-tok", { fetchImpl });
    check("handoff: maps non-2xx to failure with server error", r.ok === false && r.status === 401 && r.error === "token rejected");
  }
  {
    const r = await performTokenHandoff({ port: 3847 }, "", { fetchImpl: async () => ({ ok: true }) });
    check("handoff: refuses an empty token", r.ok === false);
  }

  // --- runTokenRefresh (orchestration) ---
  {
    let handedOff = null;
    const r = await runTokenRefresh({
      port: 3847, token: "fresh", myBuildId: BUILD,
      listInstancesFn: () => [{ port: 3847, pid: 111, buildId: BUILD, token: "b", clientName: "mcp" }],
      isPidAliveFn: () => true,
      confirmPortFn: async () => true,
      handoffFn: async (inst, tok) => { handedOff = { inst, tok }; return { ok: true }; },
    });
    check("run: same-build live portal -> handoff success", r.ok === true && r.action === "handoff" && r.message === "Token updated successfully");
    check("run: passes the fresh token to the handoff", handedOff.tok === "fresh" && handedOff.inst.port === 3847);
  }
  {
    const r = await runTokenRefresh({
      port: 3847, token: "fresh", myBuildId: BUILD,
      listInstancesFn: () => [{ port: 3847, pid: 111, buildId: "9.9.9@/other", token: "b", clientName: "mcp" }],
      isPidAliveFn: () => true,
      confirmPortFn: async () => true,
      handoffFn: async () => { throw new Error("must not hand off to a different build"); },
    });
    check("run: build mismatch -> refuse, no handoff", r.ok === false && r.action === "refuse" && r.reason === "build-mismatch");
  }
  {
    const r = await runTokenRefresh({
      port: 3847, token: "fresh", myBuildId: BUILD,
      listInstancesFn: () => [],
      isPidAliveFn: () => false,
      confirmPortFn: async () => false,
      handoffFn: async () => ({ ok: true }),
    });
    check("run: free port -> action free, ok true (fall through to normal start)", r.action === "free" && r.ok === true);
  }
  {
    const r = await runTokenRefresh({
      port: 3847, token: "fresh", myBuildId: BUILD,
      listInstancesFn: () => [],
      isPidAliveFn: () => false,
      confirmPortFn: async () => true, // occupied but no matching entry
      handoffFn: async () => ({ ok: true }),
    });
    check("run: foreign holder -> refuse", r.ok === false && r.reason === "foreign-holder");
  }
  {
    const r = await runTokenRefresh({
      port: 3847, token: "fresh", myBuildId: BUILD,
      listInstancesFn: () => [{ port: 3847, pid: 111, buildId: BUILD, token: "b", clientName: "mcp" }],
      isPidAliveFn: () => true,
      confirmPortFn: async () => true,
      handoffFn: async () => ({ ok: false, status: 500, error: "boom" }),
    });
    check("run: handoff HTTP failure -> ok false, message carries error", r.ok === false && r.action === "handoff" && /boom/.test(r.message));
  }
} finally {
  console.log(`portal-token-refresh: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
