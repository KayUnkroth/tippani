// Tests for the Discovery ADO read helpers. buildSpecWebUrl is pure and fully
// checked; the async fetchers are exercised for shape/importability (they were
// unreachable to tests while buried in index.js, which runs main() on import).
import { getSpecContentAt, getSpecBlobAt, buildSpecWebUrl, getLastCommitAuthor } from "./ado-read.js";

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) pass++; else { fail++; console.error("  FAIL: " + name); } }
function eq(name, a, b) { ok(name + ` (got ${JSON.stringify(a)})`, JSON.stringify(a) === JSON.stringify(b)); }

// --- buildSpecWebUrl ---------------------------------------------------------
eq("basic url",
  buildSpecWebUrl("https://dev.azure.com/powerbi", "Power BI", "Trident", "/docs/spec.md"),
  "https://dev.azure.com/powerbi/Power%20BI/_git/Trident?path=%2Fdocs%2Fspec.md");
eq("adds leading slash to path",
  buildSpecWebUrl("https://x", "P", "R", "docs/a.md"),
  "https://x/P/_git/R?path=%2Fdocs%2Fa.md");
eq("trims trailing slash on org",
  buildSpecWebUrl("https://x/", "P", "R", "/a.md"),
  "https://x/P/_git/R?path=%2Fa.md");
ok("encodes spaces in repo name",
  buildSpecWebUrl("https://x", "P", "My Repo", "/a.md").includes("_git/My%20Repo"));

// --- importability (Fury #4: these were untestable inside index.js) ----------
ok("getSpecContentAt is an async function",
  typeof getSpecContentAt === "function" && getSpecContentAt.constructor.name === "AsyncFunction");
ok("getSpecBlobAt is an async function",
  typeof getSpecBlobAt === "function" && getSpecBlobAt.constructor.name === "AsyncFunction");
ok("getLastCommitAuthor is an async function",
  typeof getLastCommitAuthor === "function" && getLastCommitAuthor.constructor.name === "AsyncFunction");

// getLastCommitAuthor is best-effort: a failing conn yields "" not a throw.
const badConn = { getGitApi: async () => { throw new Error("no ado"); } };
const author = await getLastCommitAuthor(badConn, "repo", "/a.md");
eq("getLastCommitAuthor swallows errors -> ''", author, "");

console.log(`ado-read: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
