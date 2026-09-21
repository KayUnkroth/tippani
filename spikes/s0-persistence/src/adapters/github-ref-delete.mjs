import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const MAX_OUTPUT_BYTES = 64 * 1024;
const SHA_PATTERN = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i;
const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+$/;
const REF_PATTERN = /^refs\/heads\/[A-Za-z0-9][A-Za-z0-9._/-]*$/;

const ASKPASS_SOURCE = `#!/usr/bin/env node
const prompt = process.argv[2] || "";
if (/username/i.test(prompt)) process.stdout.write("x-access-token\\n");
else if (/password/i.test(prompt)) process.stdout.write((process.env.TIPPANI_GITHUB_TOKEN || "") + "\\n");
else process.exitCode = 1;
`;

function validateInput({ owner, repository, ref, expectedSha, token }) {
  if (!OWNER_PATTERN.test(owner || "") || !REPOSITORY_PATTERN.test(repository || "")) {
    throw new TypeError("GitHub owner and repository must be safe path components");
  }
    const refSegments = String(ref || "").split("/");
    if (!REF_PATTERN.test(ref || "") || ref.includes("..") || ref.includes("@{") ||
      ref.includes("//") || ref.endsWith("/") || ref.endsWith(".lock") ||
      refSegments.some((segment) => segment.startsWith(".") || segment.endsWith("."))) {
    throw new TypeError("GitHub cleanup ref is invalid");
  }
  if (!SHA_PATTERN.test(expectedSha || "")) {
    throw new TypeError("GitHub cleanup expected SHA is invalid");
  }
  if (typeof token !== "string" || !token || /[\r\n\0]/.test(token)) {
    throw new TypeError("GitHub cleanup token is invalid");
  }
}

function executeGit(args, { cwd, env, signal }) {
  return new Promise((resolve) => {
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    let settled = false;
    const child = spawn("git", args, { cwd, env, signal, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    const append = (current, chunk) => Buffer.concat([current, chunk]).subarray(0, MAX_OUTPUT_BYTES);
    child.stdout.on("data", (chunk) => { stdout = append(stdout, chunk); });
    child.stderr.on("data", (chunk) => { stderr = append(stderr, chunk); });
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve({ ...result, stdout: stdout.toString("utf8"), stderr: stderr.toString("utf8") });
    };
    child.once("error", (error) => finish({ code: null, error }));
    child.once("close", (code, childSignal) => finish({ code, signal: childSignal, error: null }));
  });
}

export function writeAskPassFiles(temporaryRoot, platform = process.platform) {
  const scriptPath = path.join(temporaryRoot, "askpass.cjs");
  fs.writeFileSync(scriptPath, ASKPASS_SOURCE, { encoding: "utf8", mode: 0o700 });
  if (platform !== "win32") return scriptPath;
  const commandPath = path.join(temporaryRoot, "askpass.cmd");
  fs.writeFileSync(
    commandPath,
    `@echo off\r\n"${process.execPath}" "%~dp0askpass.cjs" %*\r\n`,
    "utf8",
  );
  return commandPath;
}

export async function conditionalDeleteGitHubRef({
  owner,
  repository,
  ref,
  expectedSha,
  token,
  signal = null,
}) {
  validateInput({ owner, repository, ref, expectedSha, token });
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tippani-s0-github-cleanup-"));
  const bareRepository = path.join(temporaryRoot, "repo.git");
  try {
    const askpassPath = writeAskPassFiles(temporaryRoot);
    const isolatedEnvironment = {
      ...process.env,
      GIT_ASKPASS: askpassPath,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_TERMINAL_PROMPT: "0",
      HOME: temporaryRoot,
      TIPPANI_GITHUB_TOKEN: token,
    };
    const initialized = await executeGit(["init", "--bare", bareRepository], {
      cwd: temporaryRoot,
      env: isolatedEnvironment,
      signal,
    });
    if (initialized.code !== 0) {
      return { ok: false, reason: signal?.aborted ? "aborted" : "transport_failure" };
    }
    const result = await executeGit([
      "-C", bareRepository,
      "-c", "credential.helper=",
      "push", "--porcelain",
      `--force-with-lease=${ref}:${expectedSha}`,
      `https://github.com/${owner}/${repository}.git`,
      `:${ref}`,
    ], { cwd: temporaryRoot, env: isolatedEnvironment, signal });
    if (result.code === 0) return { ok: true };
    if (signal?.aborted || result.error?.name === "AbortError") return { ok: false, reason: "aborted" };
    if (/stale info/i.test(result.stderr)) return { ok: false, reason: "lease_rejected" };
    if (/authentication failed|could not read username|access denied|403/i.test(result.stderr)) {
      return { ok: false, reason: "authentication_failed" };
    }
    return { ok: false, reason: "transport_failure" };
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}