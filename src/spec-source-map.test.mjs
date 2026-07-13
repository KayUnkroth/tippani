// Unit tests for spec source-map block-range extraction.
// Verifies ranges are derived from the render tree in the same order/granularity
// as the client's commentable selector, so ranges[i] aligns with commentableEls[i].
import { collectBlockRanges, renderSpecBody } from "./spec-source-map.js";
import { defaultSchema } from "rehype-sanitize";

let pass = 0;
let fail = 0;
function ok(name, cond) {
  if (cond) pass++;
  else { fail++; console.error(`FAIL: ${name}`); }
}
function eq(name, a, b) {
  const ja = JSON.stringify(a), jb = JSON.stringify(b);
  ok(name + ` (got ${ja})`, ja === jb);
}

const md = [
  "# Heading",              // 1  -> no block (heading not commentable)
  "",                       // 2
  "First paragraph line",   // 3
  "wrapped to two lines.",  // 4  -> p 3..4
  "",                       // 5
  "| A | B |",              // 6
  "|---|---|",              // 7
  "| 1 | 2 |",              // 8  -> table 6..8
  "",                       // 9
  "- item one",             // 10 -> li 10
  "- item two",             // 11 -> li 11
  "",                       // 12
  "> a quote",              // 13 -> blockquote 13
  "",                       // 14
  "```js",                  // 15
  "const x = 1;",           // 16
  "",                       // 17 (blank line INSIDE the fence)
  "const y = 2;",           // 18
  "```",                    // 19 -> pre 15..19
  "",                       // 20
  "Closing paragraph.",     // 21 -> p 21
].join("\n");

const ranges = await collectBlockRanges(md);

// Order + granularity must mirror the DOM: p, table, li, li, blockquote, pre, p.
eq("block ranges align to render tree", ranges, [
  { startLine: 3, endLine: 4 },
  { startLine: 6, endLine: 8 },
  { startLine: 10, endLine: 10 },
  { startLine: 11, endLine: 11 },
  { startLine: 13, endLine: 13 },
  { startLine: 15, endLine: 19 },
  { startLine: 21, endLine: 21 },
]);

// A code fence with an internal blank line stays ONE block (a blank-line parser
// would have split it — the mis-anchoring bug).
ok("fenced code with blank line is one block 15..19",
  ranges.some((r) => r.startLine === 15 && r.endLine === 19));

// Two list items are two separate blocks (one <li> each).
ok("list items are separate blocks",
  ranges.filter((r) => r.startLine === 10 || r.startLine === 11).length === 2);

// Table-only spec: previously produced an EMPTY map (diffs stacked at bottom).
const tableOnly = ["| A | B |", "|---|---|", "| 1 | 2 |"].join("\n");
const tRanges = await collectBlockRanges(tableOnly);
eq("table-only spec yields a non-empty aligned map", tRanges, [{ startLine: 1, endLine: 3 }]);

// A list before a paragraph: the paragraph must map to its own line, not be
// shifted by the preceding list items (the index-space mismatch).
const listThenPara = ["- a", "- b", "- c", "", "Para here."].join("\n");
const lpRanges = await collectBlockRanges(listThenPara);
eq("list-then-paragraph keeps paragraph anchored", lpRanges, [
  { startLine: 1, endLine: 1 },
  { startLine: 2, endLine: 2 },
  { startLine: 3, endLine: 3 },
  { startLine: 5, endLine: 5 },
]);

// renderSpecBody returns HTML plus the same ranges.
const rendered = await renderSpecBody(md, undefined);
ok("renderSpecBody returns html", typeof rendered.html === "string" && rendered.html.includes("<table"));
eq("renderSpecBody ranges match collectBlockRanges", rendered.ranges, ranges);

// Sanitize schema does not change block count/order.
const sanitized = await renderSpecBody(md, defaultSchema);
ok("sanitized render keeps block count", sanitized.ranges.length === ranges.length);

console.log(`\nspec-source-map.test: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
