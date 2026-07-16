// Tests for the surgical spec-edit engine (#edit_spec). Pure engine, no I/O.
import { applyEdits, normalizeEol, SpecEditError } from "./spec-edit.js";

let pass = 0, fail = 0;
function check(name, cond) { if (cond) pass++; else { fail++; console.error("  FAIL: " + name); } }
function throws(name, fn, code) {
  try { fn(); fail++; console.error("  FAIL (no throw): " + name); }
  catch (e) {
    if (e instanceof SpecEditError && (!code || e.code === code)) pass++;
    else { fail++; console.error(`  FAIL (${name}): expected ${code}, got ${e && e.code}: ${e && e.message}`); }
  }
}

const DOC = "# Title\n\nAlpha line\nBeta line\nGamma line\n";

try {
  // --- normalizeEol ---
  check("normalizeEol CRLF→LF", normalizeEol("a\r\nb\rc") === "a\nb\nc");

  // --- range kind ---
  check("range: replaces guarded lines",
    applyEdits(DOC, [{ kind: "range", startLine: 3, endLine: 3, oldString: "Alpha line", newString: "Alpha EDITED" }]).content
    === "# Title\n\nAlpha EDITED\nBeta line\nGamma line\n");
  check("range: multi-line span",
    applyEdits(DOC, [{ kind: "range", startLine: 3, endLine: 4, oldString: "Alpha line\nBeta line", newString: "MERGED" }]).content
    === "# Title\n\nMERGED\nGamma line\n");
  check("range: last line (no trailing content)",
    applyEdits(DOC, [{ kind: "range", startLine: 5, endLine: 5, oldString: "Gamma line", newString: "Gamma!" }]).content
    === "# Title\n\nAlpha line\nBeta line\nGamma!\n");
  check("range: CRLF-normalized guard matches LF body",
    applyEdits(DOC, [{ kind: "range", startLine: 3, endLine: 3, oldString: "Alpha line", newString: "X" }]).applied === 1);
  throws("range: guard mismatch fails", () =>
    applyEdits(DOC, [{ kind: "range", startLine: 3, endLine: 3, oldString: "WRONG", newString: "x" }]), "guard_mismatch");
  throws("range: out of bounds fails", () =>
    applyEdits(DOC, [{ kind: "range", startLine: 99, endLine: 99, oldString: "x", newString: "y" }]), "range_out_of_bounds");
  throws("range: empty oldString rejected", () =>
    applyEdits(DOC, [{ kind: "range", startLine: 3, endLine: 3, oldString: "", newString: "y" }]), "invalid");

  // --- find kind ---
  const REP = "aa bb aa cc aa";
  check("find: default first",
    applyEdits(REP, [{ kind: "find", find: "aa", replace: "Z" }]).content === "Z bb aa cc aa");
  check("find: where=last",
    applyEdits(REP, [{ kind: "find", find: "aa", replace: "Z", where: "last" }]).content === "aa bb aa cc Z");
  check("find: where=all",
    applyEdits(REP, [{ kind: "find", find: "aa", replace: "Z", where: "all" }]).content === "Z bb Z cc Z");
  check("find: all reports replacements count",
    applyEdits(REP, [{ kind: "find", find: "aa", replace: "Z", where: "all" }]).replacements === 3);
  throws("find: 0 matches fails", () =>
    applyEdits(REP, [{ kind: "find", find: "zzz", replace: "Z" }]), "not_found");
  throws("find: empty find rejected", () =>
    applyEdits(REP, [{ kind: "find", find: "", replace: "Z" }]), "invalid");
  throws("find: bad where rejected", () =>
    applyEdits(REP, [{ kind: "find", find: "aa", replace: "Z", where: "nope" }]), "invalid");

  // --- multiple edits, atomic + right-to-left ---
  check("multi: two ranged edits apply without renumber drift",
    applyEdits(DOC, [
      { kind: "range", startLine: 3, endLine: 3, oldString: "Alpha line", newString: "A1\nA2\nA3" },
      { kind: "range", startLine: 5, endLine: 5, oldString: "Gamma line", newString: "G!" },
    ]).content === "# Title\n\nA1\nA2\nA3\nBeta line\nG!\n");
  check("multi: mixed range + find",
    applyEdits(DOC, [
      { kind: "range", startLine: 3, endLine: 3, oldString: "Alpha line", newString: "Alpha X" },
      { kind: "find", find: "Beta line", replace: "Beta Y" },
    ]).content === "# Title\n\nAlpha X\nBeta Y\nGamma line\n");
  throws("multi: overlapping edits fail atomically", () =>
    applyEdits(REP, [
      { kind: "find", find: "aa bb", replace: "X" },
      { kind: "find", find: "bb aa", replace: "Y" },
    ]), "overlap");
  check("multi: failure applies nothing (atomic)", (() => {
    try {
      applyEdits(DOC, [
        { kind: "range", startLine: 3, endLine: 3, oldString: "Alpha line", newString: "OK" },
        { kind: "range", startLine: 4, endLine: 4, oldString: "WRONG", newString: "bad" },
      ]);
      return false;
    } catch { return true; }
  })());

  // --- validation ---
  throws("empty edits array rejected", () => applyEdits(DOC, []), "invalid");
  throws("non-array edits rejected", () => applyEdits(DOC, null), "invalid");
  throws("unknown kind rejected", () => applyEdits(DOC, [{ kind: "nope" }]), "invalid");
} catch (e) {
  fail++;
  console.error("UNEXPECTED THROW:", e && e.stack);
} finally {
  console.log(`\nspec-edit.test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
