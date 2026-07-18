// Tests for embedded-image support: content-type mapping, external-src
// detection, proxy-URL building, repo-relative path resolution, and the
// end-to-end rehype rewrite (relative img → proxy route; absolute untouched).
import {
  imageContentType,
  isExternalSrc,
  buildImageProxyUrl,
  resolveImagePath,
  rehypeRewriteImageSrc,
  isLfsPointer,
  secureImageHeaders,
  isValidRepoId,
} from "./image-src.js";
import { renderSpecBody } from "./spec-source-map.js";
import { defaultSchema } from "rehype-sanitize";

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) pass++; else { fail++; console.error("  FAIL: " + name); } }
function eq(name, a, b) { ok(name + ` (got ${JSON.stringify(a)})`, JSON.stringify(a) === JSON.stringify(b)); }

// --- imageContentType --------------------------------------------------------
eq("png type", imageContentType("Images/foo.png"), "image/png");
eq("jpg type", imageContentType("a/b/c.jpg"), "image/jpeg");
eq("jpeg type", imageContentType("x.JPEG"), "image/jpeg");
eq("gif type", imageContentType("g.gif"), "image/gif");
eq("svg type", imageContentType("d.svg"), "image/svg+xml");
eq("webp type", imageContentType("w.webp"), "image/webp");
eq("uppercase ext", imageContentType("SHOT.PNG"), "image/png");
eq("non-image null", imageContentType("notes.md"), null);
eq("no ext null", imageContentType("Makefile"), null);
eq("dotfile null", imageContentType(".gitignore"), null);
eq("non-string null", imageContentType(42), null);

// --- isExternalSrc -----------------------------------------------------------
ok("http external", isExternalSrc("http://x/y.png"));
ok("https external", isExternalSrc("https://x/y.png"));
ok("data external", isExternalSrc("data:image/png;base64,AAAA"));
ok("protocol-relative external", isExternalSrc("//cdn/y.png"));
ok("fragment external", isExternalSrc("#anchor"));
ok("empty external", isExternalSrc(""));
ok("non-string external", isExternalSrc(null));
ok("already-proxied external", isExternalSrc("/file/0/media?src=Images%2Ff.png"));
ok("relative not external", !isExternalSrc("Images/foo.png"));
ok("dotted relative not external", !isExternalSrc("./Images/foo.png"));
ok("parent relative not external", !isExternalSrc("../shared/foo.png"));
ok("repo-absolute not external", !isExternalSrc("/Specs/Images/foo.png"));

// --- buildImageProxyUrl ------------------------------------------------------
eq("proxy url basic", buildImageProxyUrl(0, "Images/foo.png"), "/file/0/media?src=Images%2Ffoo.png");
eq("proxy url encodes spaces", buildImageProxyUrl(3, "Images/my shot.png"), "/file/3/media?src=Images%2Fmy%20shot.png");

// --- resolveImagePath --------------------------------------------------------
eq("resolve sibling Images",
  resolveImagePath("/Specs/area/spec.md", "Images/foo.png"),
  "/Specs/area/Images/foo.png");
eq("resolve dot-slash",
  resolveImagePath("/Specs/area/spec.md", "./Images/foo.png"),
  "/Specs/area/Images/foo.png");
eq("resolve parent ref",
  resolveImagePath("/Specs/area/spec.md", "../shared/foo.png"),
  "/Specs/shared/foo.png");
eq("resolve repo-absolute src → null (no arbitrary-path reads)",
  resolveImagePath("/Specs/area/spec.md", "/assets/foo.png"),
  null);
eq("resolve decodes percent",
  resolveImagePath("/Specs/spec.md", "Images/my%20shot.png"),
  "/Specs/Images/my shot.png");
eq("resolve strips query",
  resolveImagePath("/Specs/spec.md", "Images/foo.png?v=2"),
  "/Specs/Images/foo.png");
eq("resolve strips hash",
  resolveImagePath("/Specs/spec.md", "Images/foo.png#x"),
  "/Specs/Images/foo.png");
eq("resolve tolerates missing leading slash on spec",
  resolveImagePath("Specs/area/spec.md", "Images/foo.png"),
  "/Specs/area/Images/foo.png");
eq("resolve external → null", resolveImagePath("/Specs/spec.md", "https://x/y.png"), null);
eq("resolve non-image → null", resolveImagePath("/Specs/spec.md", "notes.md"), null);
eq("resolve data → null", resolveImagePath("/Specs/spec.md", "data:image/png;base64,AA"), null);
eq("resolve empty → null", resolveImagePath("/Specs/spec.md", ""), null);
// Traversal above the repo root is clamped by posix join; still lands inside
// the repo and only ever on an image extension, never above root.
ok("resolve deep traversal stays image-only",
  (() => { const r = resolveImagePath("/a/b/spec.md", "../../../../../../etc/x.png"); return r === "/etc/x.png"; })());
eq("resolve traversal to non-image → null",
  resolveImagePath("/a/b/spec.md", "../../../../etc/passwd"), null);

// --- isLfsPointer ------------------------------------------------------------
{
  const pointer = "version https://git-lfs.github.com/spec/v1\noid sha256:8fec7622f1b6452e76ec97846c31b3246410b89e85b6f66fb2a2cd850d4b5e1a\nsize 42299\n";
  ok("detects real LFS pointer text", isLfsPointer(pointer));
  ok("detects LFS pointer as Buffer", isLfsPointer(Buffer.from(pointer, "utf8")));
  // A real PNG header must not be mistaken for a pointer.
  ok("PNG bytes are not a pointer", !isLfsPointer(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])));
  ok("JPEG bytes are not a pointer", !isLfsPointer(Buffer.from([0xff, 0xd8, 0xff, 0xe0])));
  ok("empty string not a pointer", !isLfsPointer(""));
  ok("null not a pointer", !isLfsPointer(null));
  ok("unrelated text not a pointer", !isLfsPointer("version 1.2.3 of something"));
}

// --- rehypeRewriteImageSrc (via full render pipeline) ------------------------
(async () => {
  const md = [
    "# Spec",
    "",
    "![shot](Images/foo.png)",
    "",
    "![ext](https://example.com/pic.png)",
    "",
    "![abs](/assets/bar.gif)",
    "",
  ].join("\n");
  const { html } = await renderSpecBody(md, defaultSchema, { rewriteImagesForFileIndex: 2 });
  ok("relative img rewritten to proxy",
    html.includes('src="/file/2/media?src=Images%2Ffoo.png"'));
  ok("absolute http img untouched",
    html.includes('src="https://example.com/pic.png"'));
  ok("repo-absolute img rewritten to proxy",
    html.includes('src="/file/2/media?src=%2Fassets%2Fbar.gif"'));

  // Without the option, no rewriting happens.
  const { html: plain } = await renderSpecBody("![s](Images/foo.png)", defaultSchema);
  ok("no rewrite without option", plain.includes('src="Images/foo.png"'));

  // The rewritten src survives sanitize (root-relative, no scheme stripped).
  ok("proxied src survives sanitize", html.includes("/file/2/media?src="));

  // Linked image (the real PR-920770 shape: [![alt](Images/x.jpg)](url)) — the
  // <img> is nested inside an <a>; the walker must still rewrite it, and the
  // outer link must be left as an ordinary absolute href.
  const linked = "[![cap](Images/Picture1.jpg)](https://youtu.be/abc)";
  const { html: lh } = await renderSpecBody(linked, defaultSchema, { rewriteImagesForFileIndex: 0 });
  ok("nested linked img rewritten to proxy",
    lh.includes('src="/file/0/media?src=Images%2FPicture1.jpg"'));
  ok("outer link href untouched", lh.includes('href="https://youtu.be/abc"'));

  // --- secureImageHeaders (H1: SVG-as-document XSS hardening) ---------------
  const H = secureImageHeaders();
  ok("secureImageHeaders sets nosniff", H["X-Content-Type-Options"] === "nosniff");
  ok("secureImageHeaders CSP sandboxes", /(^|;)\s*sandbox\b/.test(H["Content-Security-Policy"]));
  ok("secureImageHeaders CSP is deny-by-default", H["Content-Security-Policy"].includes("default-src 'none'"));
  ok("secureImageHeaders keeps private cache", H["Cache-Control"] === "private, max-age=300");

  // --- isValidRepoId (M1: repo GUID validation on /spec routes) ------------
  ok("valid GUID accepted", isValidRepoId("00000000-1111-2222-3333-444455556666"));
  ok("valid mixed-case GUID accepted", isValidRepoId("AbCdEf01-1234-5678-9abc-DEF012345678"));
  ok("reject non-GUID string", !isValidRepoId("not-a-guid"));
  ok("reject GUID with path traversal", !isValidRepoId("../../etc/passwd"));
  ok("reject empty / null", !isValidRepoId("") && !isValidRepoId(null) && !isValidRepoId(undefined));
  ok("reject over-long", !isValidRepoId("00000000-1111-2222-3333-444455556666-extra"));

  console.log(`image-src: ${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
})();
