// Normalize Azure DevOps' `::: mermaid` container syntax to a CommonMark
// ` ```mermaid ` fence, so one client transform renders both forms. The specs
// author mermaid in two ways (`:::mermaid … :::` — the ADO-native majority — and
// ` ```mermaid `); remark understands only the fenced form, so the container form
// is rewritten here before parse.
//
// LINE-COUNT PRESERVING: each rewritten line maps 1:1 to the original line, so
// the spec source map (comment anchors / diff overlay, keyed on file line
// numbers) stays aligned. Only a well-formed `::: mermaid … :::` pair is
// rewritten; other `:::` directives and unclosed blocks are left untouched.

const OPEN = /^:::\s*mermaid\s*$/i;
const CLOSE = /^:::\s*$/;

/** Rewrite `::: mermaid … :::` blocks to ` ```mermaid … ``` ` in place. */
export function normalizeMermaidContainers(md) {
  const src = String(md ?? "");
  if (!src.includes(":::")) return src;
  const lines = src.split("\n");
  const out = lines.slice();
  for (let i = 0; i < lines.length; i++) {
    if (!OPEN.test(lines[i])) continue;
    let close = -1;
    for (let k = i + 1; k < lines.length; k++) {
      if (OPEN.test(lines[k])) break;      // another open before a close → malformed; skip
      if (CLOSE.test(lines[k])) { close = k; break; }
    }
    if (close === -1) continue;            // unclosed → leave as-is
    // Pick a fence longer than any backtick run in the body so an embedded ```
    // line can't close the injected block early and let following lines escape
    // as raw markup (defense-in-depth; rehypeSanitize is the backstop).
    let maxTicks = 2;
    for (let k = i + 1; k < close; k++) {
      const runs = lines[k].match(/`+/g);
      if (runs) for (const run of runs) if (run.length > maxTicks) maxTicks = run.length;
    }
    const fence = "`".repeat(maxTicks + 1);
    out[i] = fence + "mermaid";
    out[close] = fence;
    i = close;                             // resume after the close
  }
  return out.join("\n");
}
