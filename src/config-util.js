// Pure, dependency-free helpers for ADO config resolution.
// Kept separate from index.js so they can be unit-tested without booting the server.

// Decode a config value that may have been saved or typed URL-encoded
// (e.g. "Power%20BI" from a copied dev.azure.com URL). Leaves plain values and
// non-strings untouched, and returns the original on a malformed % sequence.
export function decodeConfigValue(v) {
  if (typeof v !== "string") return v;
  if (!v.includes("%")) return v;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// Lowercase file extension including the dot (".md"), or "" when none.
export function extOf(p) {
  if (typeof p !== "string") return "";
  const base = p.split("/").pop() || "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "";
  return base.slice(dot).toLowerCase();
}

// Resolve the authoritative repo/project from a loaded PR object.
// getPullRequestById is a global lookup, so the returned PR always carries the
// real repository — we prefer its stable GUIDs so downstream calls target the
// correct repo regardless of what the user passed for --repo/--project (or what
// got defaulted/URL-encoded in config). Falls back to the provided values when
// the PR does not carry repository info.
export function deriveRepoContext(pr, fallback = {}) {
  const repo = pr && pr.repository;
  if (!repo || (!repo.id && !repo.name)) {
    return {
      repo: fallback.repo,
      project: fallback.project,
      repoName: fallback.repo,
      projectName: fallback.project,
      source: "fallback",
    };
  }
  const project = repo.project || {};
  return {
    repo: repo.id || repo.name,
    project: project.id || project.name || fallback.project,
    repoName: repo.name || fallback.repo,
    projectName: project.name || fallback.project,
    source: "pr",
  };
}

// Summarize non-markdown changed files as counts per extension, most common
// first, e.g. ["3 .docx", "1 .pdf", "1 (no ext)"].
export function summarizeNonMarkdown(otherFiles) {
  const byExt = {};
  for (const f of otherFiles || []) {
    const ext = f && f.ext ? f.ext : "(no ext)";
    byExt[ext] = (byExt[ext] || 0) + 1;
  }
  return Object.entries(byExt)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([ext, n]) => `${n} ${ext}`);
}
