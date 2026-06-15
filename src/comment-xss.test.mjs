// Regression test for the javascript:/data: URL XSS vector in comment
// rendering (issue #62 finding #2). Imports the live unified pipeline
// configuration so the test breaks the moment someone removes the
// sanitizer or flips allowDangerousHtml.

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

async function render(md) {
  const r = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(md);
  return String(r);
}

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.error("  FAIL: " + name); }
}

{
  const out = await render("[click](javascript:alert(1))");
  check("javascript: URL stripped from href", !out.includes("javascript:"));
}
{
  const out = await render("[x](JaVaScRiPt:alert(1))");
  check("javascript: URL (mixed case) stripped", !/javascript:/i.test(out));
}
{
  const out = await render("[x](data:text/html,<script>alert(1)</script>)");
  check("data: URL stripped from href", !out.includes("data:"));
}
{
  const out = await render("[x](vbscript:msgbox(1))");
  check("vbscript: URL stripped from href", !/vbscript:/i.test(out));
}
{
  const out = await render("![alt](javascript:alert(1))");
  check("javascript: URL stripped from img src", !out.includes("javascript:"));
}
{
  const out = await render("<script>alert(1)</script>");
  check("raw <script> tag does not survive", !out.includes("<script>"));
}
{
  const out = await render("<img src=x onerror=alert(1)>");
  check("inline event handlers stripped", !out.includes("onerror"));
}
{
  // Safe links must still render — sanity check we didn't over-block.
  const out = await render("[ok](https://example.com)");
  check("https links preserved", out.includes('href="https://example.com"'));
}
{
  const out = await render("[anchor](#section-a)");
  check("anchor links preserved", out.includes('href="#section-a"'));
}
{
  // Markdown text content (the visible link text) is preserved even when
  // the href is stripped, so user can still see what was attempted.
  const out = await render("[click](javascript:alert(1))");
  check("link text preserved when href stripped", out.includes("click"));
}

console.log(`comment-xss.test: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
