// Build an ADO GitPullRequestSearchCriteria from list_prs filter args (item 6).
// Defaults to the authenticated user's ACTIVE pull requests; the agent (or the
// /prs filter bar) can widen it to any creator / status. Pure — no ADO calls.
//
// ADO PullRequestStatus enum: active=1, abandoned=2, completed=3, all=4.

export const PR_STATUS = { active: 1, abandoned: 2, completed: 3, all: 4 };

export function buildPrCriteria(args = {}, { currentUserId = null } = {}) {
  const { status = "active", creator, reviewer, target } = args || {};
  const crit = {};
  const st = PR_STATUS[String(status).toLowerCase()];
  crit.status = st === undefined ? PR_STATUS.active : st;
  // creator defaults to "me" (current user); "any"/"all"/null clears it; any
  // other truthy value is treated as an explicit ADO identity id.
  const c = creator === undefined ? "me" : creator;
  if (c === "me") { if (currentUserId) crit.creatorId = currentUserId; }
  else if (c === "any" || c === "all" || c === null) { /* no creator constraint */ }
  else if (c) { crit.creatorId = c; }
  if (reviewer) crit.reviewerId = reviewer;
  if (target) crit.targetRefName = String(target).startsWith("refs/") ? target : `refs/heads/${target}`;
  return crit;
}

// Project a raw ADO pull request into the summary the /prs page + list_prs tool
// return. Keeps the wire shape stable and small.
export function summarizePr(pr) {
  const repo = pr.repository || {};
  return {
    id: pr.pullRequestId,
    title: pr.title || "",
    author: pr.createdBy?.displayName || "",
    status: pr.status,
    isDraft: !!pr.isDraft,
    source: (pr.sourceRefName || "").replace("refs/heads/", ""),
    target: (pr.targetRefName || "").replace("refs/heads/", ""),
    repo: repo.name || null,
    created: pr.creationDate || null,
    webUrl: pr._links?.web?.href || repo.webUrl || null,
  };
}
