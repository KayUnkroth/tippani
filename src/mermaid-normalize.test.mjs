// Tests for the ::: mermaid → ```mermaid normalizer.
import { normalizeMermaidContainers } from "./mermaid-normalize.js";

let pass = 0, fail = 0;
function check(name, cond) { if (cond) pass++; else { fail++; console.error("  FAIL: " + name); } }

const nl = (s) => s.split("\n").length;

try {
  // basic container → fence
  {
    const src = ":::mermaid\ngraph LR\n  A --> B\n:::";
    const out = normalizeMermaidContainers(src);
    check("open rewritten to ```mermaid", out.split("\n")[0] === "```mermaid");
    check("close rewritten to ```", out.split("\n")[3] === "```");
    check("body preserved verbatim", out.split("\n")[1] === "graph LR" && out.split("\n")[2] === "  A --> B");
    check("line count preserved", nl(out) === nl(src));
  }

  // `::: mermaid` with a space
  {
    const out = normalizeMermaidContainers("::: mermaid\nsequenceDiagram\n:::");
    check("space variant handled", out.split("\n")[0] === "```mermaid" && out.split("\n")[2] === "```");
  }

  // existing fenced ```mermaid is untouched
  {
    const src = "```mermaid\ngraph TD\n```";
    check("fenced form untouched", normalizeMermaidContainers(src) === src);
  }

  // multiple blocks
  {
    const src = ":::mermaid\nA\n:::\n\ntext\n\n:::mermaid\nB\n:::";
    const out = normalizeMermaidContainers(src);
    const lines = out.split("\n");
    check("first block rewritten", lines[0] === "```mermaid" && lines[2] === "```");
    check("second block rewritten", lines[6] === "```mermaid" && lines[8] === "```");
    check("intervening text preserved", lines[4] === "text");
    check("multi line count preserved", nl(out) === nl(src));
  }

  // unclosed block left as-is
  {
    const src = ":::mermaid\ngraph LR\nA --> B";
    check("unclosed left untouched", normalizeMermaidContainers(src) === src);
  }

  // non-mermaid ::: directive untouched
  {
    const src = "::: moniker range=\"x\"\nstuff\n:::";
    check("non-mermaid directive untouched", normalizeMermaidContainers(src) === src);
  }

  // no ::: at all → identical
  {
    const src = "# Title\n\nJust prose.\n";
    check("no directive → unchanged", normalizeMermaidContainers(src) === src);
  }

  // indented mermaid body preserved (ADO specs indent node lines)
  {
    const src = ":::mermaid\ngraph LR\n    A[X] --> B[Y]\n:::";
    const out = normalizeMermaidContainers(src);
    check("indented body preserved", out.split("\n")[2] === "    A[X] --> B[Y]");
  }

  // null/empty input
  {
    check("empty string safe", normalizeMermaidContainers("") === "");
    check("null safe", normalizeMermaidContainers(null) === "");
  }

  // breakout guard: a body containing a ``` line must NOT close the injected
  // fence early (which would let following lines escape as raw markup). The
  // wrapper fence grows longer than any backtick run in the body.
  {
    const src = ":::mermaid\ngraph LR\n```\n<img src=x onerror=alert(1)>\n:::";
    const out = normalizeMermaidContainers(src);
    const lines = out.split("\n");
    check("breakout: wrapper fence outgrows body backticks", lines[0] === "````mermaid" && lines[4] === "````");
    check("breakout: body ``` preserved, does not close the fence", lines[2] === "```");
    check("breakout: injected line stays inside the block body", lines[3] === "<img src=x onerror=alert(1)>");
    check("breakout: line count preserved", nl(out) === nl(src));
  }
  // no backticks in body → still the plain 3-tick fence (back-compat)
  {
    const out = normalizeMermaidContainers(":::mermaid\ngraph TD\n:::");
    check("plain body keeps ```mermaid fence", out.split("\n")[0] === "```mermaid" && out.split("\n")[2] === "```");
  }
} catch (e) {
  fail++;
  console.error("UNEXPECTED THROW:", e && e.stack);
} finally {
  console.log(`\nmermaid-normalize.test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
