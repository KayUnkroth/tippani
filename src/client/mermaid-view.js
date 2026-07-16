// Phase 119: client-side Mermaid rendering for the spec page.
//
// The server emits mermaid fenced blocks as <code class="language-mermaid">
// (":::mermaid" containers are normalized to fenced blocks server-side). This
// module lazy-loads the vendored Mermaid runtime from /vendor/mermaid.min.js on
// the first diagram, renders each block into a container, and re-renders on OS
// theme change. On a render error we fall back to the raw fenced text plus a
// note, so one bad diagram never blanks the page.
//
// Pure helpers (mermaidThemeName, claimMermaidBlocks) are exported for unit
// tests; initMermaidView wires the live page. This module is bundled to an IIFE
// (src/client/mermaid-view.bundle.js, MERMAID_VIEW_JS) and inlined into the spec
// page, so it ships inside the SEA binary and works offline. It does NOT
// self-init on import — the bundle appends the initMermaidView() call.

export function mermaidThemeName(doc) {
  doc = doc || (typeof document !== "undefined" ? document : null);
  const t = doc && doc.documentElement && doc.documentElement.dataset
    ? doc.documentElement.dataset.theme
    : null;
  return t === "dark" ? "dark" : "default";
}

// Replace each `pre > code.language-mermaid` under `root` with an empty
// `div.mermaid-block` carrying the diagram source in data-mermaid-src. Returns
// the created host elements (the not-yet-rendered blocks).
export function claimMermaidBlocks(root, doc) {
  doc = doc || (typeof document !== "undefined" ? document : null);
  const scope = root || doc;
  if (!scope || !doc) return [];
  const hosts = [];
  const codes = scope.querySelectorAll("pre > code.language-mermaid");
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const pre = code.parentElement;
    if (!pre || !pre.parentNode) continue;
    const host = doc.createElement("div");
    host.className = "mermaid-block";
    host.setAttribute("data-mermaid-src", code.textContent || "");
    pre.parentNode.replaceChild(host, pre);
    hosts.push(host);
  }
  return hosts;
}

export function initMermaidView(win) {
  win = win || (typeof window !== "undefined" ? window : null);
  if (!win || !win.document) return;
  const doc = win.document;
  let loading = null;

  function loadMermaid() {
    if (win.mermaid) return Promise.resolve(win.mermaid);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      const s = doc.createElement("script");
      s.src = "/vendor/mermaid.min.js";
      s.onload = function () { resolve(win.mermaid); };
      s.onerror = function () { loading = null; reject(new Error("mermaid runtime failed to load")); };
      doc.head.appendChild(s);
    });
    return loading;
  }

  let seq = 0;
  function renderHost(host, mermaid) {
    const src = host.getAttribute("data-mermaid-src") || "";
    const id = "mmd-" + (++seq);
    return mermaid.render(id, src).then(function (out) {
      host.innerHTML = out.svg;
      if (out.bindFunctions) { try { out.bindFunctions(host); } catch (e) {} }
      host.classList.remove("mermaid-error");
    }).catch(function (err) {
      host.classList.add("mermaid-error");
      host.textContent = "";
      const note = doc.createElement("div");
      note.className = "mermaid-error-note";
      note.textContent = "Diagram could not be rendered: " + ((err && err.message) || "error");
      const pre = doc.createElement("pre");
      const code = doc.createElement("code");
      code.className = "language-mermaid";
      code.textContent = src;
      pre.appendChild(code);
      host.appendChild(note);
      host.appendChild(pre);
    });
  }

  function renderNew(root) {
    const hosts = claimMermaidBlocks(root, doc);
    if (!hosts.length) return Promise.resolve();
    return loadMermaid().then(function (mermaid) {
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: mermaidThemeName(doc) });
      return Promise.all(hosts.map(function (h) { return renderHost(h, mermaid); }));
    }).catch(function () { /* fenced source stays put; nothing to render */ });
  }

  function rerenderAll() {
    if (!win.mermaid) return;
    const hosts = doc.querySelectorAll(".mermaid-block");
    if (!hosts.length) return;
    win.mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: mermaidThemeName(doc) });
    for (let i = 0; i < hosts.length; i++) renderHost(hosts[i], win.mermaid);
  }

  win.tippaniRenderMermaid = renderNew;
  win.tippaniRerenderMermaid = rerenderAll;

  let initial = Promise.resolve();
  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () { renderNew(doc); });
  } else {
    initial = renderNew(doc);
  }

  try {
    const mq = win.matchMedia("(prefers-color-scheme: dark)");
    const onThemeChange = function () { rerenderAll(); };
    if (mq.addEventListener) mq.addEventListener("change", onThemeChange);
    else if (mq.addListener) mq.addListener(onThemeChange);
  } catch (e) { /* matchMedia unavailable */ }

  return initial;
}
