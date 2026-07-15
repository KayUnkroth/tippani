// Spec source map: derive per-block source line ranges for a spec body FROM THE
// RENDER TREE ITSELF (not a parallel line parser). The captured ranges are in
// the same document order and granularity as the file view's commentable
// selector ('p, li, blockquote, table, pre'), so ranges[i] aligns 1:1 with
// commentableEls[i] on the client. That alignment is what anchors the diff
// overlay and comment bubbles to the correct rendered block.
//
// A hand-rolled line parser diverged from the renderer: it keyed on a
// paragraph-only index (so tables/lists/code shifted every anchor) and produced
// an empty map for table/list-only specs (so diffs stacked at the bottom).
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { normalizeMermaidContainers } from "./mermaid-normalize.js";

// The tags the client's commentable selector matches, in the same set.
export const COMMENTABLE_TAGS = new Set(["p", "li", "blockquote", "table", "pre"]);

// unified plugin: walk the hast tree and push {startLine,endLine} for each
// OUTERMOST commentable block, in document order. It does not descend into a
// matched block — the client marks the outermost matched block commentable and
// skips nested p/li/etc. via `.closest('.commentable')` — so the count and order
// mirror the DOM exactly.
export function rehypeCollectBlockRanges(ranges) {
  return () => (tree) => {
    const walk = (node) => {
      for (const child of node.children || []) {
        if (child.type === "element" && COMMENTABLE_TAGS.has(child.tagName)) {
          const p = child.position || {};
          ranges.push({
            startLine: p.start?.line ?? null,
            endLine: p.end?.line ?? null,
          });
          // Intentionally do NOT recurse into a matched block.
        } else {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}

// Collect block ranges for a markdown body without rendering to a string.
// Exposed for testing; renderSpecBody is the production path.
export async function collectBlockRanges(content) {
  const ranges = [];
  const proc = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeCollectBlockRanges(ranges));
  const tree = proc.parse(normalizeMermaidContainers(content));
  await proc.run(tree);
  return ranges;
}

// Render a spec body to sanitized HTML and return the aligned block ranges.
// The range collector runs before sanitize so hast positions are intact; the
// sanitize step preserves the allowed block elements in the same order.
export async function renderSpecBody(content, sanitizeSchema) {
  const ranges = [];
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeCollectBlockRanges(ranges))
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeStringify)
    .process(normalizeMermaidContainers(content));
  return { html: String(result), ranges };
}
