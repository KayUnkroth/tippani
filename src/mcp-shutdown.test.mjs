// Integration test: the MCP shim shuts down cleanly when its stdin closes.
//
// MCP hosts typically stop a stdio server by CLOSING its stdin (not by sending a
// signal). The shim wires `process.stdin.on("end"/"close")` to shutdown(true),
// which runs session.stop() once (tearing down any owned portals) and exits 0.
// This spawns the REAL shim with a fake but well-formed 3-part JWT — adoCheck
// allows any well-formed JWT when no audience is configured — then closes stdin
// and asserts a clean exit.
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHIM = path.join(HERE, "mcp.js");

let pass = 0, fail = 0;
function check(name, cond) { if (cond) pass++; else { fail++; console.error("  FAIL: " + name); } }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const child = spawn(process.execPath, [SHIM], {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      TIPPANI_ADO_TOKEN: "aaa.bbb.ccc", // well-formed 3-part JWT shape (unverified)
      TIPPANI_ADO_AUDIENCE: "",         // no audience check → any JWT passes
    },
  });

  let exited = false;
  let exitCode = null;
  child.on("exit", (code) => { exited = true; exitCode = code; });

  // Let it pass adoCheck and connect the stdio transport.
  await wait(1500);
  check("shim is running before stdin close", !exited);

  // Closing stdin is how a host stops a stdio server → shutdown(true) → exit 0.
  child.stdin.end();

  const deadline = Date.now() + 6000;
  while (!exited && Date.now() < deadline) await wait(50);

  check("shim exited on stdin close", exited);
  check("shim exited cleanly (code 0)", exitCode === 0);

  if (!exited) { try { child.kill(); } catch {} }
} catch (e) {
  fail++;
  console.error("UNEXPECTED THROW:", e && e.stack);
} finally {
  console.log(`\nmcp-shutdown.test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
