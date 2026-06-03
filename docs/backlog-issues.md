# Issues to File on mavaali/tippani

Create these after pushing to GitHub. All from Hope (Wasp) design review.

---

## Issue 1: Code blocks use hardcoded colors, break in dark mode
**Label:** `P1` `polish` `dark-mode`

The `pre` block in `.spec pre` uses hardcoded `#1e1e1e` background and `#d4d4d4` text instead of CSS variables. In dark mode, this creates a dark block on dark background with no visual boundary.

**Fix:** Replace with `background: var(--cp-surface-soft); color: var(--cp-text); border: 1px solid var(--cp-border);` — or add dedicated `--cp-code-bg` / `--cp-code-fg` variables.

---

## Issue 2: Long comment threads push other threads off-screen
**Label:** `P1` `density`

A single PR Assistant comment with a long code suggestion can dominate the sidebar. No max-height on `.comment-body`.

**Fix:** Add `.comment-body { max-height: 200px; overflow-y: auto; }` and consider a "Show more" toggle for comments > 200px.

---

## Issue 3: No loading state when navigating between files
**Label:** `P1` `states`

When clicking a file in the picker or switching files via sidebar, there's a blank wait while the server fetches content. No visual feedback.

**Fix:** Add a CSS spinner or "Loading..." text as initial content, replaced on load. At minimum, `cursor: wait` on file card click.

---

## Issue 4: Error state shows raw text
**Label:** `P1` `states`

If `/file/:index` returns 500, the user sees unstyled "Error rendering spec: ..." text.

**Fix:** Return a styled error page using the design system — heading, error message, "Back to file list" link.

---

## Issue 5: TOC sidebar has no scroll indicator
**Label:** `P1` `density`

With 15+ sections, it's not obvious the TOC scrolls. No visual hint.

**Fix:** Add a fade gradient at the bottom of `.sidebar-left-scroll`: `mask-image: linear-gradient(to bottom, black 90%, transparent 100%);`

---

## Issue 6: PR title in header too quiet
**Label:** `P1` `hierarchy`

`.pr-info h1` at 14px has similar visual weight to sidebar labels. It's the most important element in the header.

**Fix:** Bump to 15px. Add explicit `color: var(--cp-text)`.

---

## Issue 7: File picker description runs into metadata
**Label:** `P1` `hierarchy`

`.pr-desc` (13px) blends into the meta line above it.

**Fix:** Change `margin-top: 12px` to `16px`, add `border-top: 1px solid var(--cp-border); padding-top: 14px`.

---

## Issue 8: File icon uses emoji (📄) — renders inconsistently cross-platform
**Label:** `P2` `polish`

The 📄 emoji renders differently on Windows, macOS, and Linux.

**Fix:** Replace with an inline SVG document icon using `var(--cp-text-muted)` as stroke color.

---

## Issue 9: No responsive breakpoint for narrow viewports
**Label:** `P2` `responsiveness`

At viewport < 1100px, the 3-column layout (260 + flex + 320) starts cramping. No `@media` breakpoint.

**Fix:** At `@media (max-width: 1100px)`, collapse comments sidebar to a toggle panel.

---

## Issue 10: "Files in PR" sidebar section same weight as "Contents"
**Label:** `P2` `hierarchy`

Both use `.sidebar-section-label` but Contents is always the primary nav.

**Fix:** Make "Files in PR" slightly recessed — `font-size: 10px` or add a thin top border separator.

---

## Issue 11: "Request Changes" button uses danger-red for a routine action
**Label:** `P2` `color`

Red implies destructive. "Request Changes" is routine in a review workflow.

**Fix:** Use `var(--cp-warning)` or accent color instead. Reserve red for destructive actions.

---

## Issue 12: File picker cards are generous at 10+ files
**Label:** `P2` `density`

Cards at 14px + 18px padding work for 3 files but require scrolling at 10+.

**Fix:** Reduce padding to `10px 14px` when file count > 6, or add a compact view toggle.
