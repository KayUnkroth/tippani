// Tests for the feedback-filter predicate (item 5).
import { threadMatchesFilter, distinctReviewers, distinctFiles } from "./feedback-filter.js";

let pass = 0, fail = 0;
function check(name, cond) { if (cond) pass++; else { fail++; console.error("  FAIL: " + name); } }

const rows = [
  { waiting: "you", reviewers: ["Alice"], file: "/a.md", text: "latency budget" },
  { waiting: "reviewer", reviewers: ["Bob", "Alice"], file: "/a.md", text: "clarify scope" },
  { waiting: "viewed", reviewers: ["Carol"], file: "/b.md", text: "noted the change" },
  { waiting: "resolved", reviewers: ["Bob"], file: "/b.md", text: "done" },
];

try {
  check("null filter matches all", rows.every((r) => threadMatchesFilter(r, null)));
  check("empty filter object matches all", rows.every((r) => threadMatchesFilter(r, {})));

  // states (OR within)
  check("states: single", rows.filter((r) => threadMatchesFilter(r, { states: ["you"] })).length === 1);
  check("states: multiple OR", rows.filter((r) => threadMatchesFilter(r, { states: ["you", "reviewer"] })).length === 2);
  check("states: empty array matches all", rows.filter((r) => threadMatchesFilter(r, { states: [] })).length === 4);

  // reviewer (any comment author)
  check("reviewer: Alice appears in 2", rows.filter((r) => threadMatchesFilter(r, { reviewer: "Alice" })).length === 2);
  check("reviewer: Carol appears in 1", rows.filter((r) => threadMatchesFilter(r, { reviewer: "Carol" })).length === 1);
  check("reviewer: unknown -> 0", rows.filter((r) => threadMatchesFilter(r, { reviewer: "Zoe" })).length === 0);

  // file
  check("file: /a.md -> 2", rows.filter((r) => threadMatchesFilter(r, { file: "/a.md" })).length === 2);

  // query (case-insensitive substring)
  check("query: 'scope' -> 1", rows.filter((r) => threadMatchesFilter(r, { query: "SCOPE" })).length === 1);

  // AND across facets
  check("AND: file + state", rows.filter((r) => threadMatchesFilter(r, { file: "/b.md", states: ["viewed"] })).length === 1);
  check("AND: reviewer + query no match", rows.filter((r) => threadMatchesFilter(r, { reviewer: "Alice", query: "done" })).length === 0);

  // helpers
  check("distinctReviewers sorted unique", JSON.stringify(distinctReviewers(rows)) === JSON.stringify(["Alice", "Bob", "Carol"]));
  check("distinctFiles sorted unique", JSON.stringify(distinctFiles(rows)) === JSON.stringify(["/a.md", "/b.md"]));
} catch (e) {
  fail++;
  console.error("UNEXPECTED THROW:", e && e.stack);
} finally {
  console.log(`\nfeedback-filter.test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
