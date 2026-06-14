// HTTP integration test for the Phase 1 control API (#42).
// Mounts the routes via registerControlApi() against an Express app with
// in-memory fakes, listens on an ephemeral port, and exercises each
// endpoint via global fetch. No ADO, no real cache.

import express from "express";
import {
  createFocusStore,
  createDraftStore,
  createLockStore,
} from "./api-state.js";
import { registerControlApi } from "./control-api.js";

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.error("  FAIL: " + name); }
}

const SESSION_TOKEN = "test-token-abc";
const PORT_FOR_PREFIXES = 65535;  // doesn't matter; tests use 127.0.0.1:<ephemeral>

// Fixture threads — minimal ADO shape.
const threads = [
  {
    id: 101, status: 1, lastUpdatedDate: "2026-06-13T00:00:00Z",
    threadContext: { filePath: "/docs/spec.md", rightFileStart: { line: 12 } },
    comments: [
      { id: 1, author: { displayName: "Reviewer" }, publishedDate: "2026-06-13T00:00:00Z", content: "Latency budget?" },
    ],
  },
  {
    id: 102, status: 2, lastUpdatedDate: "2026-06-12T00:00:00Z",
    threadContext: { filePath: "/docs/spec.md", rightFileStart: { line: 40 } },
    comments: [
      { id: 2, author: { displayName: "Reviewer" }, publishedDate: "2026-06-12T00:00:00Z", content: "Resolved." },
    ],
  },
  {
    // No comments — must be filtered out of GET /api/v1/threads.
    id: 103, status: 1, comments: [],
  },
];

const changedFiles = [
  { path: "/docs/spec.md", changeType: "edit" },
];

const SPEC_MD = "# Title\n\nIntro paragraph.\n\n## Section A\n\nBody.\n\n### Sub\n\nMore.\n";

const focus = createFocusStore();
const drafts = createDraftStore({ onChange: () => focus.bumpVersion() });
const locks = createLockStore({ ttlMs: 60_000 });

const app = express();
app.use(express.json());
registerControlApi(app, {
  port: PORT_FOR_PREFIXES,
  sessionToken: SESSION_TOKEN,
  focus, drafts, locks,
  getThreads: () => threads,
  getChangedFiles: () => changedFiles,
  readFileMarkdown: async (p) => (p === "/docs/spec.md" ? SPEC_MD : ""),
});

const server = await new Promise((resolve) => {
  const s = app.listen(0, "127.0.0.1", () => resolve(s));
});
const { port } = server.address();
const BASE = `http://127.0.0.1:${port}`;

async function call(path, opts = {}) {
  const headers = { "X-Tippani-Client": "test", ...(opts.headers || {}) };
  if (opts.body && typeof opts.body !== "string") {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }
  const r = await fetch(BASE + path, { ...opts, headers });
  let body = null;
  try { body = await r.json(); } catch {}
  return { status: r.status, body };
}
const authHeaders = { Authorization: `Bearer ${SESSION_TOKEN}` };

try {
  // --- Auth guards ---
  {
    const r = await fetch(BASE + "/api/v1/threads");
    check("auth: missing X-Tippani-Client -> 403", r.status === 403);
  }
  {
    const r = await fetch(BASE + "/api/v1/commands/focus", {
      method: "POST",
      headers: { "X-Tippani-Client": "test", "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: 101 }),
    });
    check("auth: mutation without bearer -> 401", r.status === 401);
  }
  {
    const r = await fetch(BASE + "/api/v1/commands/focus", {
      method: "POST",
      headers: { "X-Tippani-Client": "test", "Content-Type": "application/json", Authorization: "Bearer wrong" },
      body: JSON.stringify({ threadId: 101 }),
    });
    check("auth: wrong bearer -> 401", r.status === 401);
  }
  // Same-origin bypass: include Origin header that matches LOCAL_PREFIXES for `port`
  // configured at registration time (PORT_FOR_PREFIXES). It's not 127.0.0.1:<this server>,
  // but per the auth design, same-origin means matching the configured base. We just
  // need to verify that the bypass *exists* — sending matching Origin omits both guards.
  {
    const r = await fetch(BASE + "/api/v1/threads", {
      headers: { Origin: `http://localhost:${PORT_FOR_PREFIXES}` },
    });
    check("auth: same-origin bypass (no X-Tippani-Client needed)", r.status === 200);
  }

  // --- GET /api/v1/threads ---
  {
    const r = await call("/api/v1/threads");
    check("threads: 200", r.status === 200);
    check("threads: filters empty-comment threads", r.body.threads.length === 2);
    const ids = r.body.threads.map(t => t.id).sort();
    check("threads: includes 101 and 102", ids[0] === 101 && ids[1] === 102);
    const active = r.body.threads.find(t => t.id === 101);
    check("threads: 101 resolved=false", active.resolved === false);
    const resolved = r.body.threads.find(t => t.id === 102);
    check("threads: 102 resolved=true (status=2)", resolved.resolved === true);
    check("threads: includes focus.version=0 initially", r.body.focus.version === 0);
    check("threads: hasDraft=false initially", active.hasDraft === false);
  }

  // --- GET /api/v1/threads/:id ---
  {
    const r = await call("/api/v1/threads/101");
    check("thread/:id: 200", r.status === 200);
    check("thread/:id: includes comments", r.body.comments.length === 1);
    check("thread/:id: comment content present", r.body.comments[0].content === "Latency budget?");
    check("thread/:id: draft is null initially", r.body.draft === null);
  }
  {
    const r = await call("/api/v1/threads/999");
    check("thread/:id: unknown id -> 404", r.status === 404);
  }

  // --- POST /api/v1/commands/focus ---
  {
    const r = await call("/api/v1/commands/focus", { method: "POST", headers: authHeaders, body: { threadId: 101 } });
    check("focus: 200", r.status === 200);
    check("focus: focusedThreadId set", r.body.focus.focusedThreadId === 101);
    check("focus: version bumped to 1", r.body.focus.version === 1);
  }
  {
    const r = await call("/api/v1/commands/focus", { method: "POST", headers: authHeaders, body: { threadId: 999 } });
    check("focus: unknown thread -> 404", r.status === 404);
  }
  {
    const r = await call("/api/v1/commands/focus", { method: "POST", headers: authHeaders, body: { threadId: "nope" } });
    check("focus: bad threadId -> 400", r.status === 400);
  }
  {
    const r = await call("/api/v1/commands/focus", { method: "POST", headers: authHeaders, body: { threadId: null } });
    check("focus: null clears", r.status === 200 && r.body.focus.focusedThreadId === null);
  }

  // --- PUT /api/v1/threads/:id/draft ---
  {
    const r = await call("/api/v1/threads/101/draft", { method: "PUT", headers: authHeaders, body: { content: "Drafted reply" } });
    check("draft put: 200", r.status === 200);
    check("draft put: returns draft content", r.body.draft.content === "Drafted reply");
    check("draft put: default source=external", r.body.draft.source === "external");
  }
  {
    const r = await call("/api/v1/threads/101");
    check("thread/:id: now shows hasDraft=true via comments fetch", r.body.hasDraft === true);
    check("thread/:id: now exposes draft.content", r.body.draft.content === "Drafted reply");
  }
  {
    const r = await call("/api/v1/threads/101/draft", { method: "PUT", headers: authHeaders, body: { content: 123 } });
    check("draft put: non-string content -> 400", r.status === 400);
  }
  {
    const r = await call("/api/v1/threads/999/draft", { method: "PUT", headers: authHeaders, body: { content: "x" } });
    check("draft put: unknown thread -> 404", r.status === 404);
  }

  // --- POST /api/v1/threads/:id/lock then PUT draft -> 409 ---
  {
    const r = await call("/api/v1/threads/101/lock", { method: "POST", headers: authHeaders });
    check("lock touch: 200", r.status === 200);
    check("lock touch: returns expiresAt", typeof r.body.expiresAt === "number");
  }
  {
    const r = await call("/api/v1/threads/101/draft", { method: "PUT", headers: authHeaders, body: { content: "blocked" } });
    check("draft put while locked: 409", r.status === 409);
  }

  // --- DELETE /api/v1/threads/:id/draft ---
  // Manually release the lock so delete works without lock interference (delete
  // doesn't check the lock by design — only PUT does).
  locks.release(101);
  {
    const r = await call("/api/v1/threads/101/draft", { method: "DELETE", headers: authHeaders });
    check("draft delete: 200", r.status === 200);
    check("draft delete: removed=true", r.body.removed === true);
  }
  {
    const r = await call("/api/v1/threads/101/draft", { method: "DELETE", headers: authHeaders });
    check("draft delete (second): removed=false", r.body.removed === false);
  }

  // --- GET /api/v1/state ---
  {
    const r = await call("/api/v1/state");
    check("state: 200", r.status === 200);
    check("state: focusedThreadId reflects last focus", r.body.focusedThreadId === null);
    check("state: drafts empty after delete", Object.keys(r.body.drafts).length === 0);
    check("state: version is a number", typeof r.body.version === "number");
  }

  // --- GET /api/v1/specs/:fileIndex ---
  {
    const r = await call("/api/v1/specs/0");
    check("specs: 200", r.status === 200);
    check("specs: returns markdown", r.body.markdown === SPEC_MD);
    check("specs: extracts headings", r.body.sections.length === 3);
    check("specs: level 1 first", r.body.sections[0].level === 1 && r.body.sections[0].text === "Title");
    check("specs: level 2 second", r.body.sections[1].level === 2 && r.body.sections[1].text === "Section A");
    check("specs: line numbers 1-based", r.body.sections[0].line === 1);
  }
  {
    const r = await call("/api/v1/specs/99");
    check("specs: out of range -> 404", r.status === 404);
  }

  // --- Version bumps cover focus + drafts ---
  {
    const v0 = (await call("/api/v1/state")).body.version;
    await call("/api/v1/threads/101/draft", { method: "PUT", headers: authHeaders, body: { content: "new" } });
    const v1 = (await call("/api/v1/state")).body.version;
    check("state: version bumps on draft put", v1 > v0);
    await call("/api/v1/commands/focus", { method: "POST", headers: authHeaders, body: { threadId: 102 } });
    const v2 = (await call("/api/v1/state")).body.version;
    check("state: version bumps on focus change", v2 > v1);
  }

} finally {
  server.close();
}

console.log(`control-api.test: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
