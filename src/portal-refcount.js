// Reference-counted portal lifetime.
//
// The portal process owns one counter. Holders — attached shims, live browser
// tabs, and pending-browser mints — each hold a ref; the portal exits only when
// the count reaches zero ("last man standing"). A pending-browser ref carries a
// TTL so a bootstrap link that is minted but never opened self-releases and
// cannot pin the portal forever, closing the mint -> first-connect gap.
//
// Pure and fully clock-injectable so it is unit-testable without processes,
// sockets, or real timers. index.js runs a server on import (so it is not
// importable); this logic lives here and is wired in there.
//
// The zero-transition edge is fired only by the mutating ops (add/release/tick).
// Reads (has/size/isEmpty/keys) are pure — they report the live count without
// deleting expired refs — so a read can never "steal" the transition from the
// portal's periodic tick.

export const REF = Object.freeze({
  SHIM: "shim",
  TAB: "tab",
  PENDING: "pending",
});

export function createPortalRefCount({ now = () => Date.now() } = {}) {
  // key -> expiresAt (null = no expiry). Keyed by kind+id so add/release are
  // idempotent: a double-add is one ref, releasing an unknown holder is a no-op.
  const refs = new Map();
  const emptyListeners = new Set();
  let lastEmpty = true; // starts empty; the first add makes it non-empty

  const keyOf = (kind, id) => `${kind}\u0000${id}`;

  function liveCount() {
    const t = now();
    let n = 0;
    for (const expiresAt of refs.values()) {
      if (expiresAt == null || expiresAt > t) n++;
    }
    return n;
  }

  // Drop expired entries and fire the empty listeners on a non-empty -> empty
  // edge. Called only by mutating ops.
  function settle() {
    const t = now();
    for (const [k, expiresAt] of refs) {
      if (expiresAt != null && expiresAt <= t) refs.delete(k);
    }
    const empty = refs.size === 0;
    if (!lastEmpty && empty) {
      for (const fn of [...emptyListeners]) {
        try { fn(); } catch { /* a listener must never block a teardown decision */ }
      }
    }
    lastEmpty = empty;
    return refs.size;
  }

  // Add (or renew) a ref. ttlMs applies to pending refs; omit for shims/tabs.
  function add(kind, id, { ttlMs = null } = {}) {
    if (!kind || id == null || id === "") {
      throw new Error("portal ref requires a kind and id");
    }
    refs.set(keyOf(kind, id), ttlMs == null ? null : now() + Number(ttlMs));
    return settle();
  }

  // Release a ref. No-op for an unknown holder.
  function release(kind, id) {
    refs.delete(keyOf(kind, id));
    return settle();
  }

  // Periodic sweep the portal drives (e.g. every few seconds) so expired pending
  // refs are collected and the empty edge fires even with no add/release traffic.
  function tick() { return settle(); }

  function has(kind, id) {
    const expiresAt = refs.get(keyOf(kind, id));
    if (expiresAt === undefined) return false;
    return expiresAt == null || expiresAt > now();
  }
  function size() { return liveCount(); }
  function isEmpty() { return liveCount() === 0; }

  // Register a callback fired once each time the count transitions to zero.
  function onEmpty(fn) { emptyListeners.add(fn); return () => emptyListeners.delete(fn); }

  function keys() {
    const t = now();
    return [...refs.entries()]
      .filter(([, expiresAt]) => expiresAt == null || expiresAt > t)
      .map(([k]) => k);
  }

  // Live ids currently held for one kind (e.g. all live "tab" refs). Used to
  // reconcile a ref set against an external source of truth (live browser tabs).
  function keysOfKind(kind) {
    const prefix = `${kind}\u0000`;
    const t = now();
    const out = [];
    for (const [k, expiresAt] of refs) {
      if (k.startsWith(prefix) && (expiresAt == null || expiresAt > t)) out.push(k.slice(prefix.length));
    }
    return out;
  }

  return { add, release, has, size, isEmpty, tick, onEmpty, keys, keysOfKind, REF };
}
