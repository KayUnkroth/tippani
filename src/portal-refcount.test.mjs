// Unit tests for the portal ref-count core (portal-refcount.js).
// Uses an injectable clock so TTL expiry is deterministic — no real timers.
import { createPortalRefCount, REF } from "./portal-refcount.js";

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.error("  FAIL: " + name); }
}

// Injectable clock the tests advance by hand.
let clock = 1000;
const now = () => clock;

try {
  // --- starts empty ---
  {
    const rc = createPortalRefCount({ now });
    check("starts empty", rc.isEmpty() && rc.size() === 0);
    check("unknown holder is absent", rc.has(REF.SHIM, "x") === false);
  }

  // --- add / has / size ---
  {
    const rc = createPortalRefCount({ now });
    check("add returns new count", rc.add(REF.SHIM, "s1") === 1);
    check("not empty after add", !rc.isEmpty());
    check("has the added ref", rc.has(REF.SHIM, "s1"));
    check("does not have a different id", !rc.has(REF.SHIM, "s2"));
    check("does not confuse kinds", !rc.has(REF.TAB, "s1"));
  }

  // --- idempotent add (same key counts once) ---
  {
    const rc = createPortalRefCount({ now });
    rc.add(REF.SHIM, "s1");
    check("double add of same key stays 1", rc.add(REF.SHIM, "s1") === 1);
    rc.add(REF.TAB, "t1");
    check("distinct keys accumulate", rc.size() === 2);
  }

  // --- release decrements; unknown release is a no-op ---
  {
    const rc = createPortalRefCount({ now });
    rc.add(REF.SHIM, "s1");
    rc.add(REF.TAB, "t1");
    check("release a live ref decrements", rc.release(REF.SHIM, "s1") === 1);
    check("release unknown is a no-op", rc.release(REF.SHIM, "nope") === 1);
    check("still has the remaining ref", rc.has(REF.TAB, "t1"));
  }

  // --- onEmpty fires exactly on the >=1 -> 0 transition ---
  {
    const rc = createPortalRefCount({ now });
    let emptied = 0;
    rc.onEmpty(() => emptied++);
    rc.add(REF.SHIM, "s1");
    check("no empty event on the way up", emptied === 0);
    rc.add(REF.TAB, "t1");
    rc.release(REF.SHIM, "s1");
    check("no empty event while refs remain", emptied === 0);
    rc.release(REF.TAB, "t1");
    check("empty event on last release", emptied === 1);
    rc.release(REF.TAB, "t1"); // already gone
    check("no re-fire when already empty", emptied === 1);
  }

  // --- pending -> tab conversion never dips to zero ---
  {
    const rc = createPortalRefCount({ now });
    let emptied = 0;
    rc.onEmpty(() => emptied++);
    rc.add(REF.PENDING, "p1", { ttlMs: 60_000 });
    rc.add(REF.TAB, "t1");          // browser connected: add tab BEFORE releasing pending
    rc.release(REF.PENDING, "p1");
    check("conversion keeps the portal alive", rc.size() === 1 && emptied === 0);
    rc.release(REF.TAB, "t1");
    check("empties only when the tab closes", emptied === 1);
  }

  // --- pending TTL: expired refs are not counted as live ---
  {
    const rc = createPortalRefCount({ now });
    clock = 1000;
    rc.add(REF.PENDING, "p1", { ttlMs: 100 }); // expires at 1100
    check("pending is live before TTL", rc.has(REF.PENDING, "p1") && rc.size() === 1);
    clock = 1099;
    check("pending still live just before TTL", rc.size() === 1);
    clock = 1100;
    check("pending is not live at TTL (read is pure)", rc.size() === 0 && !rc.has(REF.PENDING, "p1"));
  }

  // --- tick fires the empty edge when a pending ref expires ---
  {
    const rc = createPortalRefCount({ now });
    let emptied = 0;
    rc.onEmpty(() => emptied++);
    clock = 2000;
    rc.add(REF.PENDING, "p1", { ttlMs: 100 }); // expires at 2100
    check("no empty event before expiry", emptied === 0);
    clock = 2050;
    check("tick before expiry does not fire", rc.tick() === 1 && emptied === 0);
    clock = 2200;
    check("tick after expiry fires empty edge", rc.tick() === 0 && emptied === 1);
  }

  // --- a pure read does not steal the transition from tick ---
  {
    const rc = createPortalRefCount({ now });
    let emptied = 0;
    rc.onEmpty(() => emptied++);
    clock = 3000;
    rc.add(REF.PENDING, "p1", { ttlMs: 100 }); // expires at 3100
    clock = 3200;
    check("read reports empty without firing", rc.isEmpty() && emptied === 0);
    check("tick still fires the edge after the read", rc.tick() === 0 && emptied === 1);
  }

  // --- a live ref keeps the portal up past a pending expiry ---
  {
    const rc = createPortalRefCount({ now });
    let emptied = 0;
    rc.onEmpty(() => emptied++);
    clock = 4000;
    rc.add(REF.SHIM, "s1");                     // no TTL
    rc.add(REF.PENDING, "p1", { ttlMs: 100 });  // expires at 4100
    clock = 4200;
    check("shim survives pending expiry", rc.tick() === 1 && emptied === 0);
    check("live keys exclude the expired pending", rc.keys().length === 1);
    rc.release(REF.SHIM, "s1");
    check("empties when the last live ref releases", emptied === 1);
  }

  // --- unsubscribe stops delivery ---
  {
    const rc = createPortalRefCount({ now });
    let emptied = 0;
    const off = rc.onEmpty(() => emptied++);
    rc.add(REF.SHIM, "s1");
    off();
    rc.release(REF.SHIM, "s1");
    check("unsubscribed listener does not fire", emptied === 0);
  }

  // --- add validates its arguments ---
  {
    const rc = createPortalRefCount({ now });
    let threw = false;
    try { rc.add("", "id"); } catch { threw = true; }
    check("empty kind throws", threw);
    threw = false;
    try { rc.add(REF.SHIM, ""); } catch { threw = true; }
    check("empty id throws", threw);
  }
} finally {
  console.log(`portal-refcount: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
