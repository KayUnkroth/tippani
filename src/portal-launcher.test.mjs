// Unit tests for the MCP portal launcher (portal-launcher.js).
// Uses a fake spawn + in-memory instance registry + fake fetch so no real
// portal or network is touched. Verifies: adopt an existing same-PR portal,
// launch a new one when none exists, launch on the NEXT free port when the
// base port is held by a different PR, reuse the bound portal, and reject bad
// input.

import { EventEmitter } from "events";
import { createPortalSession } from "./portal-launcher.js";

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.error("  FAIL: " + name); }
}

// In-memory instance registry the fake portal writes into on boot.
let registry = [];
// Ports that are "held" (a launch attempt there fails with EADDRINUSE).
let busyPorts = new Set();
let spawnCalls = [];
let openedUrls = [];

const listInstancesFn = () => registry.map((r) => ({ ...r }));

// healthy iff the base URL matches a live registry entry.
const fetchImpl = async (url) => {
  const base = url.replace("/api/v1/threads", "");
  const ok = registry.some((i) => (i.url || `http://localhost:${i.port}`) === base);
  return { ok, json: async () => ({ threads: [] }) };
};

function fakeSpawn(bin, args, opts) {
  spawnCalls.push({ bin, args, opts });
  const port = Number(args.find((a) => a.startsWith("--port=")).split("=")[1]);
  const prId = Number(args[1]);
  const child = new EventEmitter();
  child.killed = false;
  child.kill = () => { child.killed = true; child.emit("exit", 0); };
  setTimeout(() => {
    if (busyPorts.has(port)) { child.emit("exit", 1); return; } // EADDRINUSE
    registry.push({ port, prId, token: `tok-${port}`, url: `http://localhost:${port}` });
  }, 15);
  return child;
}

function newSession(overrides = {}) {
  return createPortalSession({
    basePort: 3847,
    portSpan: 5,
    adoToken: "ado-test-token",
    clientName: "tippani-mcp-test",
    nodeBin: "node",
    portalEntry: "/fake/index.js",
    spawnFn: fakeSpawn,
    fetchImpl,
    listInstancesFn,
    openBrowserFn: (url) => { openedUrls.push(url); },
    readyTimeoutMs: 3000,
    ...overrides,
  });
}

function reset() { registry = []; busyPorts = new Set(); spawnCalls = []; openedUrls = []; }

try {
  // --- adopt an existing portal already open for this PR ---
  {
    reset();
    registry.push({ port: 3847, prId: 952607, token: "existing", url: "http://localhost:3847" });
    const s = newSession();
    const r = await s.ensurePortal({ prId: 952607 });
    check("adopt: reused + adopted", r.reused === true && r.adopted === true);
    check("adopt: no spawn", spawnCalls.length === 0);
    check("adopt: bound to existing url", s.getBaseUrl() === "http://localhost:3847");
    check("adopt: uses existing token", s.getToken() === "existing");
    check("adopt: opened browser to adopted portal", openedUrls.includes("http://localhost:3847"));
    s.stop();
  }

  // --- launch a new portal when none exists ---
  {
    reset();
    const s = newSession();
    const r = await s.ensurePortal({ prId: 111, org: "https://dev.azure.com/o", project: "P", repo: "R" });
    check("launch: not reused", r.reused === false && r.prId === 111);
    check("launch: spawned once", spawnCalls.length === 1);
    check("launch: on base port 3847", s.getBaseUrl() === "http://localhost:3847");
    check("launch: passes --port", spawnCalls[0].args.includes("--port=3847"));
    check("launch: forwards --org/--project/--repo",
      spawnCalls[0].args.includes("--org=https://dev.azure.com/o") &&
      spawnCalls[0].args.includes("--project=P") &&
      spawnCalls[0].args.includes("--repo=R"));
    check("launch: injects ADO token env", spawnCalls[0].opts.env.TIPPANI_ADO_TOKEN === "ado-test-token");
    check("launch: portal headless (shim owns browser)", spawnCalls[0].args.includes("--headless"));
    check("launch: opened browser once to portal", openedUrls.length === 1 && openedUrls[0] === "http://localhost:3847");
    s.stop();
  }

  // --- different PR launches on the NEXT free port (base port held) ---
  {
    reset();
    // PR 111 is live on 3847, and 3847 is held (a new launch there fails).
    registry.push({ port: 3847, prId: 111, token: "t111", url: "http://localhost:3847" });
    busyPorts.add(3847);
    const s = newSession();
    const r = await s.ensurePortal({ prId: 222 });
    check("parallel: launched (not adopted)", r.reused === false && r.prId === 222);
    check("parallel: on next port 3848", s.getBaseUrl() === "http://localhost:3848");
    check("parallel: tried 3847 then 3848", spawnCalls.length === 2 &&
      spawnCalls[0].args.includes("--port=3847") && spawnCalls[1].args.includes("--port=3848"));
    check("parallel: left PR 111 portal alone", registry.some((i) => i.port === 3847 && i.prId === 111));
    s.stop();
  }

  // --- reuse the already-bound portal on a repeat open_pr ---
  {
    reset();
    const s = newSession();
    await s.ensurePortal({ prId: 333 });
    const spawnBefore = spawnCalls.length;
    const openBefore = openedUrls.length;
    const r2 = await s.ensurePortal({ prId: 333 });
    check("reuse: same PR reused", r2.reused === true);
    check("reuse: no extra spawn", spawnCalls.length === spawnBefore);
    check("reuse: no extra browser open", openedUrls.length === openBefore);
    s.stop();
  }

  // --- adopt takes precedence over launching (another process opened it) ---
  {
    reset();
    const s = newSession();
    registry.push({ port: 3850, prId: 444, token: "other", url: "http://localhost:3850" });
    const r = await s.ensurePortal({ prId: 444 });
    check("adopt-precedence: adopted, no spawn", r.adopted === true && spawnCalls.length === 0);
    check("adopt-precedence: bound to other's port", s.getBaseUrl() === "http://localhost:3850");
    s.stop();
  }

  // --- bad input ---
  {
    reset();
    const s = newSession();
    let threw = false;
    try { await s.ensurePortal({ prId: 0 }); } catch { threw = true; }
    check("input: rejects missing prId", threw);
    s.stop();
  }
} finally {
  console.log(`\nportal-launcher.test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
