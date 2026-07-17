// Work-item search helpers for Discovery. Pure — no ADO calls, so unit-tested
// in isolation. The portal route + the search_work_items MCP tool run a WIQL
// query against ADO and project each result into a compact row.

// WIQL is inherently a read-only query language, and ADO's queryByWiql is the
// authoritative read-only boundary — it has no mutation grammar and cannot write
// work items regardless of what is passed. This gate is DEFENSE-IN-DEPTH, not the
// security boundary: it rejects obvious non-queries early (empty input, non-
// strings, anything that isn't a single SELECT after stripping leading `//` line
// and `/* … */` block comments) and refuses trailing statements after a `;` so a
// hostile or malformed payload doesn't reach ADO in the first place.
export function isReadOnlyWiql(wiql) {
  if (typeof wiql !== "string") return false;
  // Strip leading line (`// …`) and block (`/* … */`) comments and whitespace.
  let s = wiql.replace(/\r\n/g, "\n");
  for (;;) {
    const t = s.replace(/^\s+/, "");
    if (t.startsWith("//")) { s = t.replace(/^\/\/[^\n]*\n?/, ""); continue; }
    if (t.startsWith("/*")) {
      const end = t.indexOf("*/");
      if (end === -1) return false; // unterminated block comment
      s = t.slice(end + 2);
      continue;
    }
    s = t;
    break;
  }
  if (!/^select\b/i.test(s)) return false;
  // Single statement only: reject a `;` that has anything non-trivial after it,
  // so a chained/injected trailing statement can't ride along.
  const semi = s.indexOf(";");
  if (semi !== -1 && s.slice(semi + 1).trim() !== "") return false;
  return true;
}

// The fields hydrated for each result row.
export const WORK_ITEM_FIELDS = [
  "System.Id",
  "System.Title",
  "System.WorkItemType",
  "System.State",
  "System.AssignedTo",
];

// Project a raw ADO work item (id + fields) into the row the UI + tool return.
// `url` is supplied by the caller (built from org/project/id) since a fielded
// getWorkItems response doesn't include the _links.html href.
export function summarizeWorkItem(wi, url = null) {
  const f = (wi && wi.fields) || {};
  const assigned = f["System.AssignedTo"];
  return {
    id: wi?.id ?? null,
    title: f["System.Title"] || "",
    type: f["System.WorkItemType"] || "",
    state: f["System.State"] || "",
    assignedTo: (assigned && (assigned.displayName || assigned.uniqueName)) || "",
    url: url || wi?._links?.html?.href || wi?.url || null,
  };
}

// Build the ADO web URL for a work item. `org` is the full org base
// (https://dev.azure.com/<org>); project may contain spaces.
export function buildWorkItemUrl(org, project, id) {
  if (!org || id == null) return null;
  const base = String(org).replace(/\/+$/, "");
  const proj = encodeURIComponent(String(project || "").trim());
  return `${base}/${proj}/_workitems/edit/${id}`;
}
