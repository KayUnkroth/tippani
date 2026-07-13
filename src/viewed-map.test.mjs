// Unit tests for durable viewed-state read-modify-write safety.
import { parseViewedMap, updateViewed } from "./viewed-map.js";

let pass = 0;
let fail = 0;
function ok(name, cond) {
  if (cond) pass++;
  else { fail++; console.error(`FAIL: ${name}`); }
}

// parseViewedMap distinguishes absent from present-and-valid.
ok("absent property => {}", JSON.stringify(parseViewedMap(null)) === "{}");
ok("undefined property => {}", JSON.stringify(parseViewedMap(undefined)) === "{}");
ok("valid map parsed", JSON.stringify(parseViewedMap('{"7":42}')) === '{"7":42}');
ok("array payload => {}", JSON.stringify(parseViewedMap("[1,2,3]")) === "{}");

// Corrupt payload throws (so a caller won't overwrite good state with {}).
let threw = false;
try { parseViewedMap("{not json"); } catch { threw = true; }
ok("corrupt payload throws", threw);

// The core invariant: a FAILED read must NOT write.
await (async () => {
  let wrote = false;
  let rejected = false;
  try {
    await updateViewed({
      read: async () => { throw new Error("429 transient"); },
      write: async () => { wrote = true; },
      threadId: 7,
      commentId: 99,
    });
  } catch { rejected = true; }
  ok("failed read rejects", rejected);
  ok("failed read never writes (markers preserved)", wrote === false);
})();

// A successful read preserves OTHER threads' markers when setting one.
await (async () => {
  let written = null;
  const next = await updateViewed({
    read: async () => ({ "1": 10, "2": 20 }),
    write: async (m) => { written = m; },
    threadId: 3,
    commentId: 30,
  });
  ok("existing markers preserved", written["1"] === 10 && written["2"] === 20);
  ok("new marker added", written["3"] === 30);
  ok("returns merged map", next["3"] === 30 && next["1"] === 10);
})();

// commentId == null clears just that thread's marker.
await (async () => {
  let written = null;
  await updateViewed({
    read: async () => ({ "1": 10, "2": 20 }),
    write: async (m) => { written = m; },
    threadId: 2,
    commentId: null,
  });
  ok("clearing removes only the target", written["1"] === 10 && !("2" in written));
})();

console.log(`\nviewed-map.test: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
