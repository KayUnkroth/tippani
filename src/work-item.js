// Work-item search helpers for Discovery. Pure — no ADO calls, so unit-tested
// in isolation. The portal route + the search_work_items MCP tool run a WIQL
// query against ADO and project each result into a compact row.

// WIQL is a read-only query language (SELECT … FROM workitems); it has no
// mutation syntax. Still, gate the proxy so only a SELECT runs — reject empty
// input, non-strings, and anything that isn't a SELECT after leading `//`
// comments / whitespace. Belt-and-suspenders against a malformed or hostile
// query reaching ADO.
export function isReadOnlyWiql(wiql) {
  if (typeof wiql !== "string") return false;
  // Drop leading line comments (WIQL allows `// …`) and whitespace.
  let s = wiql.replace(/\r\n/g, "\n");
  while (true) {
    const t = s.replace(/^\s+/, "");
    if (t.startsWith("//")) { s = t.replace(/^\/\/[^\n]*\n?/, ""); continue; }
    s = t; break;
  }
  return /^select\b/i.test(s);
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
