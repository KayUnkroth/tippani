// Surgical spec edits (#edit_spec) — apply one or more anchored edits to a
// markdown body without resending the whole file. Pure: no I/O, no server deps,
// so the engine is unit-testable in isolation.
//
// Two edit kinds (discriminated by an explicit `kind`):
//   { kind: "range", startLine, endLine, oldString, newString }
//     The 1-based inclusive line range locates the target; `oldString` GUARDS it
//     (the current text of those lines must equal `oldString` or the edit fails).
//   { kind: "find", find, replace, where? }
//     where ∈ "first" (default) | "all" | "last": replace the first / every /
//     last occurrence of `find`. Multiple matches never fail; 0 matches fails.
//
// Matching is EOL-normalized (CRLF/CR → LF) but otherwise EXACT — no
// internal-whitespace collapsing. Output is LF (specs are LF in-repo).
//
// All edits resolve to character offsets against ONE snapshot, then apply
// right-to-left, so a ranged edit never renumbers a later one. Overlapping edits
// fail the whole call; any single edit that can't be located/guarded fails the
// whole call. On failure nothing is applied — the caller stages nothing.

/** Normalize any line endings to LF. */
export function normalizeEol(s) {
  return String(s ?? "").replace(/\r\n?/g, "\n");
}

/** Error carrying a machine-readable `code` + the offending edit index. */
export class SpecEditError extends Error {
  constructor(code, message, editIndex) {
    super(message);
    this.name = "SpecEditError";
    this.code = code;          // not_found | guard_mismatch | overlap | range_out_of_bounds | invalid
    this.editIndex = editIndex;
  }
}

// Char offset of the start of 1-based line `n`, and end (exclusive of newline)
// of line `m`, in an LF-normalized body. Returns null if out of range.
function lineSpan(body, startLine, endLine) {
  const lines = body.split("\n");
  if (
    !Number.isInteger(startLine) || !Number.isInteger(endLine) ||
    startLine < 1 || endLine < startLine || endLine > lines.length
  ) return null;
  let start = 0;
  for (let i = 0; i < startLine - 1; i++) start += lines[i].length + 1;
  let end = start;
  for (let i = startLine - 1; i < endLine; i++) {
    end += lines[i].length + (i < endLine - 1 ? 1 : 0);
  }
  return { start, end };
}

// Resolve one edit to an array of { start, end, insert } ranges against `body`.
function resolveEdit(body, edit, i) {
  if (!edit || typeof edit !== "object") {
    throw new SpecEditError("invalid", `edit ${i}: not an object`, i);
  }
  if (edit.kind === "range") {
    const { startLine, endLine, oldString, newString } = edit;
    if (typeof oldString !== "string" || oldString.length === 0) {
      throw new SpecEditError("invalid", `edit ${i}: range requires a non-empty oldString`, i);
    }
    if (typeof newString !== "string") {
      throw new SpecEditError("invalid", `edit ${i}: range requires a string newString`, i);
    }
    const span = lineSpan(body, startLine, endLine);
    if (!span) {
      throw new SpecEditError("range_out_of_bounds", `edit ${i}: lines ${startLine}..${endLine} out of range`, i);
    }
    const actual = body.slice(span.start, span.end);
    if (actual !== normalizeEol(oldString)) {
      throw new SpecEditError("guard_mismatch", `edit ${i}: oldString does not match lines ${startLine}..${endLine}`, i);
    }
    return [{ start: span.start, end: span.end, insert: normalizeEol(newString) }];
  }
  if (edit.kind === "find") {
    const find = normalizeEol(edit.find);
    if (typeof edit.find !== "string" || find.length === 0) {
      throw new SpecEditError("invalid", `edit ${i}: find requires a non-empty string`, i);
    }
    if (typeof edit.replace !== "string") {
      throw new SpecEditError("invalid", `edit ${i}: find requires a string replace`, i);
    }
    const where = edit.where === undefined ? "first" : edit.where;
    if (!["first", "all", "last"].includes(where)) {
      throw new SpecEditError("invalid", `edit ${i}: where must be first|all|last`, i);
    }
    const insert = normalizeEol(edit.replace);
    const positions = [];
    let from = 0;
    for (;;) {
      const idx = body.indexOf(find, from);
      if (idx === -1) break;
      positions.push(idx);
      from = idx + find.length;
    }
    if (positions.length === 0) {
      throw new SpecEditError("not_found", `edit ${i}: find text not found`, i);
    }
    const chosen =
      where === "all" ? positions :
      where === "last" ? [positions[positions.length - 1]] :
      [positions[0]];
    return chosen.map((idx) => ({ start: idx, end: idx + find.length, insert }));
  }
  throw new SpecEditError("invalid", `edit ${i}: kind must be "range" or "find"`, i);
}

/**
 * Apply anchored edits to a markdown body.
 * @param {string} body the current snapshot (draft or committed)
 * @param {Array} edits one or more edits (see module header)
 * @returns {{ content: string, applied: number, replacements: number }}
 * @throws {SpecEditError} on any invalid/unlocatable/overlapping edit (atomic)
 */
export function applyEdits(body, edits) {
  if (!Array.isArray(edits) || edits.length === 0) {
    throw new SpecEditError("invalid", "edits must be a non-empty array", -1);
  }
  const src = normalizeEol(body);
  const ranges = [];
  edits.forEach((edit, i) => {
    for (const r of resolveEdit(src, edit, i)) ranges.push({ ...r, i });
  });
  // Sort by start; detect overlaps (also catches duplicate zero-length anchors).
  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  for (let k = 1; k < ranges.length; k++) {
    if (ranges[k].start < ranges[k - 1].end) {
      throw new SpecEditError(
        "overlap",
        `edits ${ranges[k - 1].i} and ${ranges[k].i} overlap`,
        ranges[k].i
      );
    }
  }
  // Apply right-to-left so earlier offsets stay valid.
  let out = src;
  for (let k = ranges.length - 1; k >= 0; k--) {
    const r = ranges[k];
    out = out.slice(0, r.start) + r.insert + out.slice(r.end);
  }
  return { content: out, applied: edits.length, replacements: ranges.length };
}
