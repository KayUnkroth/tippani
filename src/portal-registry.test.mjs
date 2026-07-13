// Unit tests for the portal instance registry (portal-registry.js).
// Points HOME at a temp dir so no real ~/.tippani is touched.
import fs from "fs";
import os from "os";
import path from "path";

const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "tippani-reg-"));
process.env.HOME = tmpHome;
process.env.USERPROFILE = tmpHome;

const { writeInstance, removeInstance, listInstances, registryDir } =
  await import("./portal-registry.js");

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.error("  FAIL: " + name); }
}

try {
  check("registryDir under home", registryDir().startsWith(tmpHome));
  check("empty registry lists nothing", listInstances().length === 0);

  writeInstance({ port: 3847, prId: 111, token: "t1", pid: 1001 });
  writeInstance({ port: 3848, prId: 222, token: "t2", pid: 1002 });

  const all = listInstances();
  check("lists both instances", all.length === 2);
  const a = all.find((i) => i.port === 3847);
  check("entry has prId/token/url", a.prId === 111 && a.token === "t1" && a.url === "http://localhost:3847");

  // Overwrite same port → updates, not duplicates.
  writeInstance({ port: 3847, prId: 999, token: "t1b", pid: 1001 });
  const after = listInstances();
  check("overwrite same port keeps count", after.length === 2);
  check("overwrite updates fields", after.find((i) => i.port === 3847).prId === 999);

  removeInstance(3847);
  const left = listInstances();
  check("remove drops one", left.length === 1 && left[0].port === 3848);

  removeInstance(3847); // idempotent
  check("remove is idempotent", listInstances().length === 1);
} finally {
  try { fs.rmSync(tmpHome, { recursive: true, force: true }); } catch {}
  console.log(`\nportal-registry.test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
