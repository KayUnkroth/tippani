// Unit tests for the offline ADO token inspector (ado-token-check.js).
import { inspectAdoToken, tokenRejectionMessage } from "./ado-token-check.js";

// A host-supplied expected audience (the Azure DevOps git/REST resource app id
// is host config, not hardcoded in tippani). Any value works for the test.
const AUD = "ado-git-resource-audience";

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) pass++;
  else { fail++; console.error("  FAIL: " + name); }
}

// Build a fake JWT with a given audience (header.payload.signature, base64url).
function jwt(aud, extra = {}) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "none", typ: "JWT" })}.${b64({ aud, ...extra })}.sig`;
}

try {
  {
    const r = inspectAdoToken(jwt(AUD), AUD);
    check("ADO git-audience JWT (matching expected) → ok", r.ok === true && r.reason === "ado-git");
  }
  {
    // No expected audience configured → any well-formed JWT passes (unverified).
    const r = inspectAdoToken(jwt(AUD));
    check("JWT with no expected audience → ok (unverified)", r.ok === true && r.reason === "ado-jwt-unverified");
  }
  {
    // A JWT minted for a different resource is the wrong audience for tippani.
    const r = inspectAdoToken(jwt("2a72489c-1111-2222-3333-444455556666"), AUD);
    check("wrong-audience JWT → not ok", r.ok === false && r.reason === "wrong-audience");
    check("wrong-audience → message names Azure DevOps", /Azure DevOps/.test(tokenRejectionMessage(r)));
  }
  {
    // A GitHub OAuth token is opaque, not a JWT.
    const r = inspectAdoToken("gho_ABCDEF0123456789");
    check("GitHub token → not a jwt", r.ok === false && r.reason === "not-a-jwt");
    check("not-a-jwt → message says not an ADO account", /not a GitHub or other account/.test(tokenRejectionMessage(r)));
  }
  {
    const r = inspectAdoToken("");
    check("empty → no-token", r.ok === false && r.reason === "no-token");
  }
  {
    const r = inspectAdoToken(undefined);
    check("undefined → no-token", r.ok === false && r.reason === "no-token");
  }
  {
    // JWT-shaped but unparseable payload → allow (don't false-fail a valid-but-odd token).
    const r = inspectAdoToken("aaa.@@@notbase64json@@@.sig");
    check("unparseable JWT payload → allow", r.ok === true);
  }
} finally {
  console.log(`\nado-token-check.test: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}
