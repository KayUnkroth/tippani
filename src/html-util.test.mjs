// Tests for the shared server-side HTML/render helpers.
import { cssVariables, changeTypeBadge, escHtml, stripMarkdown } from "./html-util.js";

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) pass++; else { fail++; console.error("  FAIL: " + name); } }
function eq(name, a, b) { ok(name + ` (got ${JSON.stringify(a)})`, JSON.stringify(a) === JSON.stringify(b)); }

// --- escHtml -----------------------------------------------------------------
eq("escapes & < > \"", escHtml(`<a href="x">&`), "&lt;a href=&quot;x&quot;&gt;&amp;");
eq("plain text untouched", escHtml("hello world"), "hello world");
eq("coerces non-string", escHtml(42), "42");
ok("no XSS tag survives", !escHtml("<script>alert(1)</script>").includes("<script>"));

// --- stripMarkdown -----------------------------------------------------------
eq("strips heading", stripMarkdown("# Title"), "Title");
eq("strips bold + italic", stripMarkdown("**bold** and *italic*"), "bold and italic");
eq("strips inline code", stripMarkdown("use `code` here"), "use code here");
eq("strips link to text", stripMarkdown("see [docs](http://x)"), "see docs");
eq("bullets become dots", stripMarkdown("- one"), "• one");
eq("collapses newlines", stripMarkdown("a\n\nb"), "a b");

// --- changeTypeBadge ---------------------------------------------------------
eq("add -> Added/success", changeTypeBadge(1), { label: "Added", color: "success" });
eq("edit -> Modified/accent", changeTypeBadge(2), { label: "Modified", color: "accent" });
eq("unknown -> Modified/accent", changeTypeBadge(99), { label: "Modified", color: "accent" });

// --- cssVariables ------------------------------------------------------------
const css = cssVariables();
ok("cssVariables returns a string", typeof css === "string");
ok("cssVariables includes :root", css.includes(":root"));
ok("cssVariables defines the accent token", css.includes("--cp-accent"));

console.log(`html-util: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
