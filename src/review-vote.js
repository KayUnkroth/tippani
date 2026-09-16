// Review vote mapping + preconditions for the Approve / Request changes bar.
// Pure — no ADO calls, so the mapping and the guards are testable without a
// connection. The transport lives in index.js (`submitReviewVote`).
//
// ADO vote scale (GitInterfaces.IdentityRefWithVote.vote):
//   10 approved | 5 approved with suggestions | 0 no vote
//   -5 waiting for author | -10 rejected
// "Request changes" maps to -5 (waiting for author), not -10 (rejected):
// tippani's bottom bar is a routine spec-review action, and -10 in ADO is the
// hard block. Matches the button's own wording.

export const VOTE = {
  approve: 10,
  approveWithSuggestions: 5,
  reset: 0,
  requestChanges: -5,
  reject: -10,
};

const BY_TYPE = {
  approve: VOTE.approve,
  "approve-with-suggestions": VOTE.approveWithSuggestions,
  "request-changes": VOTE.requestChanges,
  reject: VOTE.reject,
  reset: VOTE.reset,
};

// Map a review button type to an ADO vote. Returns null for an unknown type so
// the caller can 400 instead of silently voting.
export function voteForReviewType(type) {
  if (type === null || type === undefined) return null;
  const key = String(type).trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(BY_TYPE, key) ? BY_TYPE[key] : null;
}

export function voteLabel(vote) {
  switch (vote) {
    case VOTE.approve: return "Approved";
    case VOTE.approveWithSuggestions: return "Approved with suggestions";
    case VOTE.reset: return "Vote cleared";
    case VOTE.requestChanges: return "Changes requested";
    case VOTE.reject: return "Rejected";
    default: return "";
  }
}

// Guard the preconditions a vote needs. Voting is a WRITE to ADO, so unlike a
// comment it is never queued offline — a stale vote posted later could approve
// a PR whose content has since changed.
export function reviewPrecheck({ isOffline = false, hasConn = false, prId = 0 } = {}) {
  if (isOffline) return { ok: false, code: "offline", error: "Can't submit a review offline — votes are not queued. Reconnect and try again." };
  if (!hasConn) return { ok: false, code: "no-connection", error: "Not connected to Azure DevOps." };
  if (!prId) return { ok: false, code: "no-pr", error: "No pull request is open." };
  return { ok: true };
}

// Orchestrates the /api/review request end to end: validate the type, guard
// the preconditions, and — only if both pass — actually invoke the vote.
//
// This exists as its own function (not left inline in the Express handler)
// specifically because the shipped bug in this route was structural: the old
// handler computed a vote and returned {ok:true} WITHOUT ever calling ADO.
// A test against voteForReviewType/reviewPrecheck alone cannot catch that
// class of bug — both would still report correctly while the handler quietly
// skips the call. Testing this function with a spy `submitVote` proves the
// call actually happens, with the right (conn, prId, vote) arguments, and
// only on the success path.
//
// `submitVote(conn, prId, vote)` and `formatError(err, context)` are injected
// rather than imported so this stays ADO-agnostic and unit-testable without a
// real connection; index.js passes the real `submitReviewVote` /
// `friendlyAdoError`, tests pass fakes.
export async function handleReviewRequest({ type, isOffline, hasConn, prId, conn, submitVote, formatError } = {}) {
  const vote = voteForReviewType(type);
  if (vote === null) {
    return { status: 400, body: { ok: false, code: "bad-type", error: "Unknown review type." } };
  }
  const pre = reviewPrecheck({ isOffline, hasConn, prId });
  if (!pre.ok) {
    return { status: 409, body: { ok: false, code: pre.code, error: pre.error } };
  }
  try {
    await submitVote(conn, prId, vote);
    return { status: 200, body: { ok: true, vote, message: voteLabel(vote) } };
  } catch (e) {
    return { status: 502, body: { ok: false, code: "ado-error", error: formatError(e, "submit review") } };
  }
}

function sameIdentity(author, currentUser) {
  if (!author || !currentUser) return false;
  for (const key of ["id", "uniqueName", "displayName"]) {
    const left = String(author[key] || "").trim();
    const right = String(currentUser[key] || "").trim();
    if (left && right && left.localeCompare(right, undefined, { sensitivity: "accent" }) === 0) {
      return true;
    }
  }
  return false;
}

function waitingThreadSummary(thread, lastComment) {
  return {
    id: thread.id,
    file: thread.threadContext?.filePath || null,
    line: thread.threadContext?.rightFileStart?.line || null,
    lastCommentId: lastComment?.id || null,
    lastBy: lastComment?.author?.displayName || null,
  };
}

// One operation owns both the fresh thread read and the approval write. This
// prevents an MCP caller from approving against a separate, stale precheck.
export async function approveIfNoThreadsWaiting({
  listThreads,
  getCurrentUser,
  submitApproval,
} = {}) {
  if (typeof listThreads !== "function"
      || typeof getCurrentUser !== "function"
      || typeof submitApproval !== "function") {
    throw new TypeError("Approval requires thread, identity, and vote providers.");
  }
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return {
      approved: false,
      code: "identity-unavailable",
      error: "Could not resolve the current reviewer's identity, so the PR was not approved.",
    };
  }
  const threads = await listThreads() || [];
  const waitingThreads = [];
  let openThreadCount = 0;
  for (const thread of threads) {
    if (thread.status === 2 || thread.status === 4) continue;
    const comments = (thread.comments || []).filter(
      (comment) => comment.commentType !== 3 && !comment.isDeleted);
    if (comments.length === 0) continue;
    openThreadCount++;
    const lastComment = comments[comments.length - 1];
    if (!sameIdentity(lastComment.author, currentUser)) {
      waitingThreads.push(waitingThreadSummary(thread, lastComment));
    }
  }
  if (waitingThreads.length > 0) {
    return {
      approved: false,
      code: "threads-waiting-on-you",
      error: "The PR was not approved because unresolved threads are waiting on you.",
      currentUser: {
        id: currentUser.id,
        displayName: currentUser.displayName || "",
      },
      openThreadCount,
      waitingThreadCount: waitingThreads.length,
      waitingThreads,
    };
  }
  await submitApproval(VOTE.approve);
  return {
    approved: true,
    vote: VOTE.approve,
    message: voteLabel(VOTE.approve),
    currentUser: {
      id: currentUser.id,
      displayName: currentUser.displayName || "",
    },
    openThreadCount,
    waitingThreadCount: 0,
    waitingThreads: [],
  };
}
