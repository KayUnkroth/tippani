// Embedded-image support for the spec view. Specs reference screenshots and
// exported diagrams with repo-relative paths (e.g. `![](Images/foo.png)`).
// Tippani never served those bytes, so the `<img>` resolved against the page
// URL and 404'd. This module (1) rewrites a relative `<img src>` in the render
// tree to a Tippani proxy route and (2) resolves/validates the requested image
// path server-side so the route can fetch the blob from ADO authenticated.
//
// The rewrite and the fetch are two halves of one mechanism: the rewrite routes
// the browser to Tippani (a bare relative src 404s against the page, and can't
// point at dev.azure.com because that request can't authenticate); the proxy
// route then fetches the blob with the server-side ADO token and streams it.
import path from "path";

// Content types for the image extensions specs actually embed. The proxy is
// deliberately limited to these so it can't be used as a general file-read
// proxy for non-image repo content (.md, .json, source, …).
const IMAGE_CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".apng": "image/apng",
  ".avif": "image/avif",
};

// The MIME type for a path's extension, or null if it isn't a supported image.
export function imageContentType(p) {
  if (typeof p !== "string") return null;
  const base = p.split("/").pop() || "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return null;
  const ext = base.slice(dot).toLowerCase();
  return IMAGE_CONTENT_TYPES[ext] || null;
}

// A src is "external" (leave it alone) when it's an absolute URL, a
// protocol-relative URL, a data: URI, a fragment, or already a Tippani proxy
// path. Everything else is a repo-relative reference that must be proxied.
export function isExternalSrc(src) {
  if (typeof src !== "string" || src === "") return true;
  const s = src.trim();
  if (s.startsWith("//")) return true;            // protocol-relative
  if (s.startsWith("#")) return true;             // pure fragment
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return true; // has a scheme (http:, https:, data:, mailto:, …)
  if (/\/file\/\d+\/media\?/.test(s)) return true; // already proxied
  return false;
}

// Build the proxy URL for a spec file index + the original relative src. The
// original src is carried verbatim (encoded) so the route resolves it against
// the same spec file's directory the browser saw it under.
export function buildImageProxyUrl(fileIndex, originalSrc) {
  return `/file/${fileIndex}/media?src=${encodeURIComponent(String(originalSrc))}`;
}

// Resolve a repo-relative image src against the spec file's directory to a
// repo-absolute path, for the proxy route's ADO fetch. Returns null when the
// src is external/empty or the target isn't a supported image type. Traversal
// above the repo root is clamped by posix join (can't escape the repo, and the
// token is already repo-scoped), and the image-extension gate keeps the proxy
// from reading non-image files.
export function resolveImagePath(specPath, src) {
  if (isExternalSrc(src)) return null;
  let clean = String(src).split("#")[0].split("?")[0];
  try { clean = decodeURIComponent(clean); } catch { /* keep raw on bad encoding */ }
  if (!clean) return null;
  const specDir = path.posix.dirname(normalizeRepoPath(specPath));
  const base = clean.startsWith("/")
    ? clean
    : path.posix.join(specDir, clean);
  const norm = path.posix.normalize(base);
  const abs = norm.startsWith("/") ? norm : "/" + norm;
  if (abs === "/" || abs.includes("/../") || abs.endsWith("/..")) return null;
  if (!imageContentType(abs)) return null;
  return abs;
}

// ADO item paths are repo-absolute ("/dir/spec.md"); tolerate a missing leading
// slash and back-slashes so dirname math is stable.
function normalizeRepoPath(p) {
  let s = String(p || "/").replace(/\\/g, "/");
  if (!s.startsWith("/")) s = "/" + s;
  return s;
}

// rehype plugin: rewrite every relative `<img src>` in the tree to the Tippani
// proxy route for `fileIndex`. External srcs (absolute/data/already-proxied)
// are left untouched. Runs BEFORE sanitize so the rewritten root-relative src
// survives the sanitize protocol filter.
export function rehypeRewriteImageSrc(fileIndex) {
  return () => (tree) => {
    const walk = (node) => {
      if (node.type === "element" && node.tagName === "img" && node.properties) {
        const src = node.properties.src;
        if (typeof src === "string" && !isExternalSrc(src)) {
          node.properties.src = buildImageProxyUrl(fileIndex, src);
        }
      }
      for (const child of node.children || []) walk(child);
    };
    walk(tree);
  };
}
