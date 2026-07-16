// Tests for work-item search helpers: WIQL read-only guard, summarizer, url.
import { isReadOnlyWiql, summarizeWorkItem, buildWorkItemUrl, WORK_ITEM_FIELDS } from "./work-item.js";

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) pass++; else { fail++; console.error("  FAIL: " + name); } }
function eq(name, a, b) { ok(name + ` (got ${JSON.stringify(a)})`, JSON.stringify(a) === JSON.stringify(b)); }

// --- isReadOnlyWiql ----------------------------------------------------------
ok("plain SELECT", isReadOnlyWiql("SELECT [System.Id] FROM workitems"));
ok("lowercase select", isReadOnlyWiql("select [System.Id] from workitems"));
ok("leading whitespace", isReadOnlyWiql("   \n  SELECT [System.Id] FROM workitems"));
ok("leading // comment", isReadOnlyWiql("// my query\nSELECT [System.Id] FROM workitems"));
ok("multiple comments", isReadOnlyWiql("// one\n// two\n  SELECT [System.Id]"));
ok("CRLF handled", isReadOnlyWiql("// c\r\nSELECT [System.Id]"));
ok("reject empty", !isReadOnlyWiql(""));
ok("reject whitespace only", !isReadOnlyWiql("   \n  "));
ok("reject non-string", !isReadOnlyWiql(null));
ok("reject non-select", !isReadOnlyWiql("DROP TABLE x"));
ok("reject select-substring word", !isReadOnlyWiql("selection FROM workitems"));
ok("reject text before select", !isReadOnlyWiql("x SELECT [System.Id]"));

// --- summarizeWorkItem -------------------------------------------------------
{
  const wi = {
    id: 42,
    fields: {
      "System.Title": "Fix the thing",
      "System.WorkItemType": "Bug",
      "System.State": "Active",
      "System.AssignedTo": { displayName: "Kay Unkroth", uniqueName: "kay@x" },
    },
  };
  const s = summarizeWorkItem(wi, "https://dev.azure.com/o/p/_workitems/edit/42");
  eq("summarize id", s.id, 42);
  eq("summarize title", s.title, "Fix the thing");
  eq("summarize type", s.type, "Bug");
  eq("summarize state", s.state, "Active");
  eq("summarize assignedTo displayName", s.assignedTo, "Kay Unkroth");
  eq("summarize url", s.url, "https://dev.azure.com/o/p/_workitems/edit/42");
}
eq("summarize assignedTo falls back to uniqueName",
  summarizeWorkItem({ id: 1, fields: { "System.AssignedTo": { uniqueName: "a@b" } } }).assignedTo, "a@b");
eq("summarize unassigned -> empty",
  summarizeWorkItem({ id: 1, fields: {} }).assignedTo, "");
eq("summarize missing fields -> blanks",
  summarizeWorkItem({ id: 7 }), { id: 7, title: "", type: "", state: "", assignedTo: "", url: null });

// --- buildWorkItemUrl --------------------------------------------------------
eq("url basic", buildWorkItemUrl("https://dev.azure.com/powerbi", "Power BI", 2179829),
  "https://dev.azure.com/powerbi/Power%20BI/_workitems/edit/2179829");
eq("url trims trailing slash", buildWorkItemUrl("https://dev.azure.com/o/", "P", 5),
  "https://dev.azure.com/o/P/_workitems/edit/5");
eq("url null org -> null", buildWorkItemUrl(null, "P", 5), null);
eq("url null id -> null", buildWorkItemUrl("https://x", "P", null), null);

// --- WORK_ITEM_FIELDS --------------------------------------------------------
ok("fields include id + title + type + state + assignedTo",
  ["System.Id", "System.Title", "System.WorkItemType", "System.State", "System.AssignedTo"].every(f => WORK_ITEM_FIELDS.includes(f)));

console.log(`work-item: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
