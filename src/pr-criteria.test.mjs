// Tests for the PR search-criteria builder + summarizer (item 6).
import { buildPrCriteria, summarizePr, PR_STATUS, mergeRolePrs } from "./pr-criteria.js";

let pass = 0, fail = 0;
function check(name, cond) { if (cond) pass++; else { fail++; console.error("  FAIL: " + name); } }

try {
  // default = my active PRs
  const d = buildPrCriteria({}, { currentUserId: "u-1" });
  check("default: status active", d.status === PR_STATUS.active);
  check("default: creator = current user", d.creatorId === "u-1");

  // no current user known → no creatorId (but still active)
  const d2 = buildPrCriteria({}, {});
  check("no user: omits creatorId", !("creatorId" in d2) && d2.status === PR_STATUS.active);

  // widen to anyone
  check("creator any: clears creatorId", !("creatorId" in buildPrCriteria({ creator: "any" }, { currentUserId: "u-1" })));
  check("creator all: clears creatorId", !("creatorId" in buildPrCriteria({ creator: "all" }, { currentUserId: "u-1" })));
  check("creator null: clears creatorId", !("creatorId" in buildPrCriteria({ creator: null }, { currentUserId: "u-1" })));
  check("creator explicit id", buildPrCriteria({ creator: "u-9" }, { currentUserId: "u-1" }).creatorId === "u-9");

  // status
  check("status all -> 4", buildPrCriteria({ status: "all" }).status === PR_STATUS.all);
  check("status completed -> 3", buildPrCriteria({ status: "completed" }).status === PR_STATUS.completed);
  check("status unknown -> active", buildPrCriteria({ status: "weird" }).status === PR_STATUS.active);

  // reviewer + target
  check("reviewer passes through", buildPrCriteria({ reviewer: "r-1" }).reviewerId === "r-1");
  check("target: bare branch normalized", buildPrCriteria({ target: "main" }).targetRefName === "refs/heads/main");
  check("target: full ref preserved", buildPrCriteria({ target: "refs/heads/dev" }).targetRefName === "refs/heads/dev");

  // summarizePr
  const s = summarizePr({
    pullRequestId: 42, title: "Fix", createdBy: { displayName: "Kay" }, status: 1, isDraft: false,
    sourceRefName: "refs/heads/feature/x", targetRefName: "refs/heads/main",
    repository: { name: "specs", webUrl: "https://dev.azure.com/o/p/_git/specs" },
    creationDate: "2026-07-10T00:00:00Z",
    _links: { web: { href: "https://dev.azure.com/o/p/_git/specs/pullrequest/42" } },
  });
  check("summarize: id/title/author", s.id === 42 && s.title === "Fix" && s.author === "Kay");
  check("summarize: source/target stripped", s.source === "feature/x" && s.target === "main");
  check("summarize: web url from _links", s.webUrl === "https://dev.azure.com/o/p/_git/specs/pullrequest/42");
  check("summarize: repo name", s.repo === "specs");

  // mergeRolePrs — role-scoped review queue (authoring + reviewing, de-duped)
  {
    const authored = [{ id: 1, title: "A" }, { id: 2, title: "B" }];
    const reviewing = [{ id: 2, title: "B" }, { id: 3, title: "C" }];
    const merged = mergeRolePrs(authored, reviewing);
    check("merge: de-dupes by id", merged.length === 3);
    check("merge: authored first, reviewing-only appended", merged.map((p) => p.id).join(",") === "1,2,3");
    check("merge: author-only tagged author", merged.find((p) => p.id === 1).roles.join() === "author");
    check("merge: reviewer-only tagged reviewer", merged.find((p) => p.id === 3).roles.join() === "reviewer");
    check("merge: both roles on the shared PR", merged.find((p) => p.id === 2).roles.join() === "author,reviewer");
    check("merge: empty inputs -> empty", mergeRolePrs().length === 0);
    check("merge: reviewing only", mergeRolePrs([], [{ id: 9 }]).length === 1);
    // original objects are not mutated (roles added on a copy)
    check("merge: does not mutate inputs", !("roles" in authored[0]));
  }
} catch (e) {
  fail++;
  console.error("UNEXPECTED THROW:", e && e.stack);
} finally {
  console.log(`\npr-criteria.test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
