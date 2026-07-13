// Pure (render-free) diff of two GFM markdown tables into an ordered list of
// row descriptors, so the file view can render ONE merged table with per-row
// del/add markers. Kept free of the markdown renderer so it is unit-testable.
//
// Two bugs this guards against:
//   1. Column count taken from the header only, with each row clamped to it, so
//      when old/new column counts differ the extra cells were silently dropped
//      (a removed trailing column made the del and add rows render identically).
//   2. Header + separator rows never diffed (a straight slice(2)), so a column
//      rename produced a merged table with zero change markers.

export function isTableBlock(text) {
  const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.length >= 2 && lines[0].startsWith("|") && /^\|?[\s:|-]+\|?$/.test(lines[1]) && lines[1].includes("-");
}

export function tableRows(text) {
  return (text || "").split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|"));
}

export function tableCells(rowLine) {
  let s = (rowLine || "").trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

// LCS diff over an array of strings → ordered ops {type:'same'|'del'|'add', val}.
export function lcsStringDiff(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ type: "same", val: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: "del", val: a[i] }); i++; }
    else { ops.push({ type: "add", val: b[j] }); j++; }
  }
  while (i < n) { ops.push({ type: "del", val: a[i] }); i++; }
  while (j < m) { ops.push({ type: "add", val: b[j] }); j++; }
  return ops;
}

function padCells(cells, cols) {
  const out = cells.slice(0, cols);
  while (out.length < cols) out.push("");
  return out;
}

// Compute the merged-table diff structure. Returns:
//   { cols, headerChanged, rows: [{ kind:'header'|'body', cls:'row-del'|'row-add'|'', cells:[...] }] }
// - `cols` is the WIDEST row on either side, so no cells are ever dropped.
// - a changed header is emitted as an old (row-del) + new (row-add) pair so the
//   rename is visibly marked; an unchanged header is emitted once (cls '').
export function computeTableDiff(oldText, newText) {
  const oldRows = tableRows(oldText);
  const newRows = tableRows(newText);
  const oldHeader = oldRows[0] || "";
  const newHeader = newRows[0] || "";
  const cols = [...oldRows, ...newRows].reduce((mx, r) => Math.max(mx, tableCells(r).length), 0);

  const rows = [];
  const headerChanged = !!oldHeader && !!newHeader && oldHeader !== newHeader;
  if (headerChanged) {
    rows.push({ kind: "header", cls: "row-del", cells: padCells(tableCells(oldHeader), cols) });
    rows.push({ kind: "header", cls: "row-add", cells: padCells(tableCells(newHeader), cols) });
  } else {
    rows.push({ kind: "header", cls: "", cells: padCells(tableCells(newHeader || oldHeader), cols) });
  }

  // Body rows: skip header (0) + separator (1) on each side and LCS-diff the rest.
  const bodyOps = lcsStringDiff(oldRows.slice(2), newRows.slice(2));
  for (const op of bodyOps) {
    const cls = op.type === "del" ? "row-del" : op.type === "add" ? "row-add" : "";
    rows.push({ kind: "body", cls, cells: padCells(tableCells(op.val), cols) });
  }
  return { cols, headerChanged, rows };
}
