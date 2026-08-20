// Unit tests for the portal build-id helper (portal-build-id.js).
import { computeBuildId, portalBuildId } from "./portal-build-id.js";
import path from "path";

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.error("  FAIL: " + name); }
}

try {
  // --- deterministic: same inputs -> same id ---
  {
    const a = computeBuildId({ version: "1.2.3", entryPath: "/opt/tippani/src/index.js" });
    const b = computeBuildId({ version: "1.2.3", entryPath: "/opt/tippani/src/index.js" });
    check("same version + path -> same id", a === b);
    check("id embeds version and path", a.startsWith("1.2.3@") && a.includes("index.js"));
  }

  // --- version differences change the id ---
  {
    const a = computeBuildId({ version: "1.2.3", entryPath: "/opt/tippani/src/index.js" });
    const b = computeBuildId({ version: "1.2.4", entryPath: "/opt/tippani/src/index.js" });
    check("different version -> different id", a !== b);
  }

  // --- install-location differences change the id ---
  {
    const a = computeBuildId({ version: "1.2.3", entryPath: "/opt/a/src/index.js" });
    const b = computeBuildId({ version: "1.2.3", entryPath: "/opt/b/src/index.js" });
    check("different install path -> different id", a !== b);
  }

  // --- paths are normalized before comparison ---
  {
    const a = computeBuildId({ version: "1.2.3", entryPath: "/opt/tippani/src/index.js" });
    const b = computeBuildId({ version: "1.2.3", entryPath: "/opt/tippani/src/../src/index.js" });
    check("equivalent paths normalize to the same id", a === b);
  }

  // --- missing inputs do not throw ---
  {
    const id = computeBuildId({});
    check("empty inputs yield a stable sentinel", id === "@");
  }

  // --- portalBuildId resolves this install's real version + path ---
  {
    const id = portalBuildId();
    check("portalBuildId is a non-empty version@path", typeof id === "string" && id.includes("@") && id.indexOf("@") > 0);
    check("portalBuildId points at an absolute src path", path.isAbsolute(id.slice(id.indexOf("@") + 1)));
    check("portalBuildId is stable across calls", id === portalBuildId());
  }
} finally {
  console.log(`portal-build-id: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
