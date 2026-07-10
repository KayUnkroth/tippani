// Unit tests for ADO config resolution helpers (run: npm run test:config).
import {
  decodeConfigValue,
  extOf,
  deriveRepoContext,
  summarizeNonMarkdown,
} from "./config-util.js";

let pass = 0;
let fail = 0;
function ok(name, cond) {
  if (cond) pass++;
  else {
    fail++;
    console.error(`FAIL: ${name}`);
  }
}
function eq(name, a, b) {
  ok(name, JSON.stringify(a) === JSON.stringify(b));
}

// --- decodeConfigValue ---
eq("decodes %20 to space", decodeConfigValue("Power%20BI"), "Power BI");
eq("leaves plain value untouched", decodeConfigValue("Power BI"), "Power BI");
eq("passes through null", decodeConfigValue(null), null);
eq("passes through undefined", decodeConfigValue(undefined), undefined);
eq("malformed percent left as-is", decodeConfigValue("100%done"), "100%done");
eq("decodes encoded slash", decodeConfigValue("a%2Fb"), "a/b");

// --- extOf ---
eq("extOf markdown", extOf("/docs/spec.md"), ".md");
eq("extOf uppercase normalized", extOf("SPEC.MD"), ".md");
eq("extOf docx", extOf("/a/b/design.docx"), ".docx");
eq("extOf none", extOf("/a/b/Makefile"), "");
eq("extOf dotfile has no ext", extOf("/a/.gitignore"), "");
eq("extOf non-string", extOf(null), "");

// --- deriveRepoContext ---
const prFull = {
  repository: { id: "repo-guid", name: "powerbi-specs", project: { id: "proj-guid", name: "Power BI" } },
};
const dFull = deriveRepoContext(prFull, { repo: "Power BI", project: "Power BI" });
ok("derive prefers repo GUID", dFull.repo === "repo-guid");
ok("derive prefers project GUID", dFull.project === "proj-guid");
ok("derive keeps repo display name", dFull.repoName === "powerbi-specs");
ok("derive source is pr", dFull.source === "pr");

// This is Kay's exact failure: no --repo, so repo defaulted to the project name
// "Power BI", but the PR really lives in "powerbi-specs". Derivation must correct it.
ok("derive overrides wrong defaulted repo name", dFull.repo !== "Power BI");

const dNameOnly = deriveRepoContext(
  { repository: { name: "powerbi-specs", project: { name: "Power BI" } } },
  { repo: "x", project: "y" }
);
ok("derive falls back to name when no id", dNameOnly.repo === "powerbi-specs");
ok("derive project falls back to name", dNameOnly.project === "Power BI");

const dNone = deriveRepoContext(null, { repo: "Power BI", project: "Power BI" });
ok("derive fallback when no PR", dNone.repo === "Power BI" && dNone.source === "fallback");
const dNoRepo = deriveRepoContext({ title: "x" }, { repo: "r", project: "p" });
ok("derive fallback when PR has no repository", dNoRepo.source === "fallback" && dNoRepo.repo === "r");

// --- summarizeNonMarkdown ---
eq(
  "summarize counts per ext, most common first",
  summarizeNonMarkdown([
    { path: "a.docx", ext: ".docx" },
    { path: "b.docx", ext: ".docx" },
    { path: "c.pdf", ext: ".pdf" },
  ]),
  ["2 .docx", "1 .pdf"]
);
eq("summarize handles missing ext", summarizeNonMarkdown([{ path: "Makefile" }]), ["1 (no ext)"]);
eq("summarize empty", summarizeNonMarkdown([]), []);

console.log(`\nconfig-util.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
