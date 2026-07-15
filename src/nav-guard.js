// Pure decision logic for the single-tab NAV_WATCHER steering script.
//
// The watcher polls /api/v1/state for a server-set navUrl/navSeq and steers the
// one open tab to that URL. It must NOT clobber a deliberate query deep-link
// (e.g. /file/0?edit=1) when the nav target is just the bare current path with
// no query of its own — otherwise a fresh browser (empty sessionStorage) sees a
// prior navSeq and strips the query before the page can act on it.
//
// These functions are injected verbatim into the client script (via toString)
// so the browser and the unit tests share one implementation.

export function navSkipsBarePathClobber(hereSearch, herePathname, navPathname, navSearch) {
  return navPathname === herePathname && !navSearch && !!hereSearch;
}

export function navShouldNavigate(here, navUrl, origin) {
  let u;
  try { u = new URL(navUrl, origin); } catch (e) { return false; }
  // Only ever steer the tab to a SAME-ORIGIN path. A foreign absolute URL or a
  // javascript: value resolves to a different (or opaque) origin and is ignored —
  // never navigate the user off-app or into a script URL.
  if (u.origin !== origin) return false;
  const target = u.pathname + u.search + u.hash;
  if (!target) return false;
  if (navSkipsBarePathClobber(here.search, here.pathname, u.pathname, u.search)) return false;
  return target !== (here.pathname + here.search + (here.hash || ""));
}
