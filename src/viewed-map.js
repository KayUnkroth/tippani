// Durable "viewed" state helpers, kept render-free and side-effect-free so the
// read-modify-write invariant can be unit-tested.
//
// The map is a single PR property (tippani.viewed = JSON { threadId: commentId }).
// The hazard: a transient read failure (429/500/network) must NOT be treated as
// "no markers", because the write replaces the WHOLE blob — so writing after a
// failed read would erase every other thread's marker. parseViewedMap therefore
// distinguishes "property absent" (safe empty) from a thrown/corrupt read, and
// updateViewed refuses to write when the read fails.

// Parse the raw property value. Returns {} when the property is genuinely
// absent (raw == null). Throws on a corrupt payload so the caller does NOT
// overwrite good state with an empty map.
export function parseViewedMap(raw) {
  if (raw == null) return {};
  const m = JSON.parse(raw); // throws on corrupt JSON → caller must not overwrite
  return m && typeof m === "object" && !Array.isArray(m) ? m : {};
}

// Read-modify-write orchestration. `read` may throw (transient/corrupt) — in
// that case we propagate WITHOUT calling `write`, preserving existing markers.
// Only a successful read leads to a write of the merged map.
export async function updateViewed({ read, write, threadId, commentId }) {
  const map = await read(); // throws on failure → no write happens
  const next = { ...(map || {}) };
  const key = String(threadId);
  if (commentId == null) delete next[key];
  else next[key] = Number(commentId);
  await write(next);
  return next;
}
