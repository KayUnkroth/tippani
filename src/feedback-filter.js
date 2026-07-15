// Feedback-page thread filtering (item 5). Pure predicate + helpers so the
// filter logic is unit-testable without a browser. The same shapes drive the
// server-pushed filter (set_feedback_filter) and the manual filter bar.
//
// A row is the minimal projection of a feedback card:
//   { waiting, reviewers: string[], file: string|null, text: string }
// A filter is { states?: string[], reviewer?: string, file?: string, query?: string }
// (or null = match everything).

/** True when a row passes the filter. AND across facets, OR within states. */
export function threadMatchesFilter(row, filter) {
  if (!filter) return true;
  const { states, reviewer, file, query } = filter;
  if (Array.isArray(states) && states.length > 0 && !states.includes(row.waiting)) return false;
  if (reviewer && !(row.reviewers || []).some((r) => r === reviewer)) return false;
  if (file && row.file !== file) return false;
  if (query) {
    const q = String(query).toLowerCase();
    if (!String(row.text || "").toLowerCase().includes(q)) return false;
  }
  return true;
}

/** Sorted distinct comment authors across rows (for the Reviewer dropdown). */
export function distinctReviewers(rows) {
  const set = new Set();
  for (const r of rows || []) for (const a of (r.reviewers || [])) if (a) set.add(a);
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Sorted distinct file paths across rows (for the File dropdown). */
export function distinctFiles(rows) {
  const set = new Set();
  for (const r of rows || []) if (r.file) set.add(r.file);
  return [...set].sort((a, b) => a.localeCompare(b));
}
