// Frontmatter round-trip helpers.
//
// The spec editor mounts on the frontmatter-STRIPPED body (index.js strips the
// leading `---\n…\n---\n` block before handing the markdown to CodeMirror), and
// both /api/save and commit_spec push whatever the editor holds. Without care
// that means a commit drops the YAML frontmatter — harmless for ADO specs, but
// data loss for Learn/DocFX docs where title/description/ms.date/author are
// mandatory. These helpers re-attach the ORIGINAL raw frontmatter block on
// commit, preserving its exact text (comments, ordering, quoting) rather than a
// lossy re-serialization of a parsed object.

// Leading YAML frontmatter block, fences included. Non-greedy so it stops at the
// first closing fence. Tolerant of CRLF.
const FRONTMATTER = /^(---\r?\n[\s\S]*?\r?\n---\r?\n)/;

/** The raw frontmatter block (fences + trailing newline) of a document, or "". */
export function extractFrontmatter(raw) {
  if (typeof raw !== "string") return "";
  const m = raw.match(FRONTMATTER);
  return m ? m[1] : "";
}

/**
 * Re-attach the original document's frontmatter to an edited body so a commit
 * never drops it. No-op when the original had no frontmatter, or when `body`
 * already carries a frontmatter block (idempotent — a caller may pass full
 * content). Preserves the original frontmatter text verbatim.
 * @param {string} rawOriginal the file's original content (with frontmatter)
 * @param {string} body the edited, frontmatter-stripped body
 * @returns {string}
 */
export function reattachFrontmatter(rawOriginal, body) {
  if (typeof body !== "string") return body;
  if (FRONTMATTER.test(body)) return body; // body already carries frontmatter
  const fm = extractFrontmatter(rawOriginal);
  return fm ? fm + body : body;
}
