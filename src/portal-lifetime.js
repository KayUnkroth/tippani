// Portal lifetime controller.
//
// Maps the portal's lifecycle events (shim attach/disconnect, bootstrap mint,
// browser connect/keepalive/close, periodic tick) onto the ref-count core, and
// owns the single decision to exit when the count reaches zero. The portal
// process constructs one of these inside its server-listen callback and drives
// tick() from a real interval; the browser-tab hooks are exercised by the
// keepalive path.
//
// Pure except for the injected side effects (now/exit/log), so the event ->
// ref-op policy and the exit guard are unit-testable without a real portal.

import { createPortalRefCount, REF } from "./portal-refcount.js";

export function createPortalLifetime({
  now = () => Date.now(),
  exit,                              // () => void — cleanup + process.exit, called at most once
  log = () => {},
  pendingTtlMs = 90_000,             // mint -> first-connect grace
  browserIdleTtlMs = 30 * 60_000,    // a viewing tab holds a ref until its keepalive lapses
} = {}) {
  const rc = createPortalRefCount({ now });
  let started = false;
  let exited = false;

  const shimKey = (id) => String(id == null ? "default" : id);

  rc.onEmpty(() => {
    // Never exit during bring-up (before the launch holder is attached) and
    // never exit twice.
    if (!started || exited) return;
    exited = true;
    log("portal ref count reached 0; exiting");
    try { exit?.(); } catch { /* the exit path must not throw back into a ref op */ }
  });

  return {
    REF,

    // Arm the exit decision. Call once the portal is live and its launch holder
    // (a shim or the initial pending mint) has been attached.
    start() { started = true; },

    attachShim(shimId) { return rc.add(REF.SHIM, shimKey(shimId)); },
    releaseShim(shimId) { return rc.release(REF.SHIM, shimKey(shimId)); },

    // Bootstrap link minted; holds the portal across a shim recycle in the
    // mint -> first-connect window until the browser connects or the TTL lapses.
    mintPending(nonce, { ttlMs = pendingTtlMs } = {}) { return rc.add(REF.PENDING, nonce, { ttlMs }); },
    releasePending(nonce) { return rc.release(REF.PENDING, nonce); },

    // Browser connected. Add the tab ref BEFORE releasing the pending nonce so
    // the count never transiently dips to 0 during the conversion.
    connectBrowser(sessionId, { pendingNonce = null, ttlMs = browserIdleTtlMs } = {}) {
      rc.add(REF.TAB, sessionId, { ttlMs });
      if (pendingNonce != null) rc.release(REF.PENDING, pendingNonce);
      return rc.size();
    },
    // Keepalive: renew the tab's idle TTL.
    browserSeen(sessionId, { ttlMs = browserIdleTtlMs } = {}) { return rc.add(REF.TAB, sessionId, { ttlMs }); },
    closeBrowser(sessionId) { return rc.release(REF.TAB, sessionId); },

    // Reconcile the tab refs to the portal's live browser sessions. Live ids get
    // an added/renewed tab ref; tab refs whose session is gone are released.
    // Adds happen BEFORE releases so a session-id change never dips the count to
    // 0 mid-sync; when the live set is empty (browser truly closed) releasing the
    // last tab drops to 0 and exits, which is the intended outcome.
    syncBrowserTabs(sessionIds, { ttlMs = browserIdleTtlMs } = {}) {
      const live = new Set((sessionIds || []).map(String));
      for (const id of live) rc.add(REF.TAB, id, { ttlMs });
      for (const id of rc.keysOfKind(REF.TAB)) if (!live.has(id)) rc.release(REF.TAB, id);
      return rc.size();
    },

    // Periodic sweep so expired pending/idle refs are collected and the exit
    // fires even with no attach/release traffic.
    tick() { return rc.tick(); },

    count() { return rc.size(); },
    isEmpty() { return rc.isEmpty(); },
    snapshot() { return { count: rc.size(), started, exited, holders: rc.keys() }; },
  };
}
