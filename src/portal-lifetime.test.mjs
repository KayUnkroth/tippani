// Unit tests for the portal lifetime controller (portal-lifetime.js).
// Injectable clock + exit spy so exit-at-zero and TTL behaviour are deterministic.
import { createPortalLifetime } from "./portal-lifetime.js";

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.error("  FAIL: " + name); }
}

let clock = 1000;
const now = () => clock;
// Fresh controller with an exit spy; returns { lt, exits: () => count }.
function make(opts = {}) {
  let exits = 0;
  const lt = createPortalLifetime({ now, exit: () => exits++, ...opts });
  return { lt, exitCount: () => exits };
}

try {
  // --- launch + two shims + a browser; releasing both shims keeps it alive ---
  {
    clock = 1000;
    const { lt, exitCount } = make();
    lt.start();
    lt.attachShim(101);
    lt.attachShim(102);
    lt.connectBrowser("tab-a");
    check("three holders", lt.count() === 3);
    lt.releaseShim(101);
    lt.releaseShim(102);
    check("browser keeps portal alive after shims leave", lt.count() === 1 && exitCount() === 0);
    lt.closeBrowser("tab-a");
    check("exits when the last browser closes", lt.count() === 0 && exitCount() === 1);
  }

  // --- shim recycle with a browser attached: survives; re-attach adopts ---
  {
    clock = 2000;
    const { lt, exitCount } = make();
    lt.start();
    lt.attachShim(201);
    lt.connectBrowser("tab-b");
    lt.releaseShim(201);                 // IPC disconnect
    check("survives shim disconnect while browser attached", lt.count() === 1 && exitCount() === 0);
    lt.attachShim(202);                  // recycled shim adopts
    check("adopting shim re-attaches", lt.count() === 2 && exitCount() === 0);
  }

  // --- mint gap: pending holds across a shim recycle before first connect ---
  {
    clock = 3000;
    const { lt, exitCount } = make({ pendingTtlMs: 90_000 });
    lt.start();
    lt.attachShim(301);
    lt.mintPending("nonce-1");
    lt.releaseShim(301);                 // recycle before the browser connects
    check("pending ref survives the recycle", lt.count() === 1 && exitCount() === 0);
    lt.connectBrowser("tab-c", { pendingNonce: "nonce-1" });
    check("connect converts pending to tab without dipping to 0", lt.count() === 1 && exitCount() === 0);
    lt.closeBrowser("tab-c");
    check("closing the converted tab exits", lt.count() === 0 && exitCount() === 1);
  }

  // --- no browser, no shim, pending expired -> exits on tick ---
  {
    clock = 4000;
    const { lt, exitCount } = make({ pendingTtlMs: 100 });
    lt.start();
    lt.attachShim(401);
    lt.mintPending("nonce-2");           // expires at 4100
    lt.releaseShim(401);
    check("still alive on the pending ref", lt.count() === 1 && exitCount() === 0);
    clock = 4200;
    check("tick after TTL exits", lt.tick() === 0 && exitCount() === 1);
  }

  // --- browser keepalive lapse releases the tab ref ---
  {
    clock = 5000;
    const { lt, exitCount } = make({ browserIdleTtlMs: 1000 });
    lt.start();
    lt.attachShim(501);
    lt.connectBrowser("tab-d");          // idle expiry at 6000
    lt.releaseShim(501);
    clock = 5500;
    lt.browserSeen("tab-d");             // keepalive renews to 6500
    clock = 6200;
    check("renewed tab survives past original TTL", lt.tick() === 1 && exitCount() === 0);
    clock = 6600;
    check("tab lapses after keepalive stops", lt.tick() === 0 && exitCount() === 1);
  }

  // --- exit fires at most once ---
  {
    clock = 7000;
    const { lt, exitCount } = make();
    lt.start();
    lt.attachShim(701);
    lt.releaseShim(701);
    lt.releaseShim(701);                 // already gone
    lt.tick();
    check("exit fires exactly once", exitCount() === 1);
  }

  // --- exit does not fire before start() ---
  {
    clock = 8000;
    const { lt, exitCount } = make();
    lt.attachShim(801);
    lt.releaseShim(801);                 // count hits 0 but portal is not armed
    check("no exit before start()", exitCount() === 0);
    lt.start();
    lt.attachShim(802);
    lt.releaseShim(802);
    check("exit works once armed", exitCount() === 1);
  }

  // --- snapshot reports live holders ---
  {
    clock = 9000;
    const { lt } = make();
    lt.start();
    lt.attachShim(901);
    lt.connectBrowser("tab-e");
    const snap = lt.snapshot();
    check("snapshot count and started", snap.count === 2 && snap.started === true && snap.exited === false);
    check("snapshot lists two holders", snap.holders.length === 2);
  }
} finally {
  console.log(`portal-lifetime: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
