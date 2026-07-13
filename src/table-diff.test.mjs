// Unit tests for the merged-table diff structure (run: npm run test:tablediff).
import { computeTableDiff, isTableBlock } from "./table-diff.js";

let pass = 0;
let fail = 0;
function ok(name, cond) {
  if (cond) pass++;
  else { fail++; console.error(`FAIL: ${name}`); }
}

// isTableBlock recognizes a GFM table with a separator row.
ok("isTableBlock true for a table", isTableBlock("| A | B |\n|---|---|\n| 1 | 2 |"));
ok("isTableBlock false for prose", !isTableBlock("just a paragraph\nof text"));

// --- Bug 1: removed trailing column must NOT collapse del/add to identical rows.
{
  const oldT = "| A | B | C |\n|---|---|---|\n| 1 | 2 | 3 |";
  const newT = "| A | B |\n|---|---|\n| 1 | 2 |";
  const d = computeTableDiff(oldT, newT);
  // Column count is the widest side (3), so no cell is dropped.
  ok("cols = widest side (3)", d.cols === 3);
  const body = d.rows.filter((r) => r.kind === "body");
  const del = body.find((r) => r.cls === "row-del");
  const add = body.find((r) => r.cls === "row-add");
  ok("removed-column del row keeps its 3rd cell", del && del.cells[2] === "3");
  ok("removed-column add row has empty 3rd cell", add && add.cells[2] === "");
  ok("del and add rows are NOT identical", JSON.stringify(del.cells) !== JSON.stringify(add.cells));
}

// --- Bug 2: a column rename (header change) must be marked, not hidden.
{
  const oldT = "| Name | Age |\n|---|---|\n| Kay | 1 |";
  const newT = "| Name | Years |\n|---|---|\n| Kay | 1 |";
  const d = computeTableDiff(oldT, newT);
  ok("header change detected", d.headerChanged === true);
  const headers = d.rows.filter((r) => r.kind === "header");
  ok("changed header emits two rows", headers.length === 2);
  ok("old header marked row-del", headers[0].cls === "row-del" && headers[0].cells[1] === "Age");
  ok("new header marked row-add", headers[1].cls === "row-add" && headers[1].cells[1] === "Years");
  // Body row unchanged → same (no marker).
  const body = d.rows.filter((r) => r.kind === "body");
  ok("unchanged body row has no marker", body.length === 1 && body[0].cls === "");
}

// --- Unchanged header renders once with no marker.
{
  const oldT = "| A | B |\n|---|---|\n| 1 | 2 |";
  const newT = "| A | B |\n|---|---|\n| 1 | 9 |";
  const d = computeTableDiff(oldT, newT);
  ok("unchanged header not flagged", d.headerChanged === false);
  const headers = d.rows.filter((r) => r.kind === "header");
  ok("single header row", headers.length === 1 && headers[0].cls === "");
  const body = d.rows.filter((r) => r.kind === "body");
  ok("changed value → one del + one add", body.filter((r) => r.cls === "row-del").length === 1 && body.filter((r) => r.cls === "row-add").length === 1);
}

// --- Added trailing column: new side is wider; old rows pad, new rows keep cell.
{
  const oldT = "| A | B |\n|---|---|\n| 1 | 2 |";
  const newT = "| A | B | C |\n|---|---|---|\n| 1 | 2 | 3 |";
  const d = computeTableDiff(oldT, newT);
  ok("cols = widest side (3) for added column", d.cols === 3);
  ok("added column marks the header changed", d.headerChanged === true);
}

console.log(`\ntable-diff.test: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
