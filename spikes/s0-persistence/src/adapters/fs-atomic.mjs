// Filesystem primitives shared by the durable local candidates.
//
// Windows notes:
// - fs.renameSync maps to MoveFileExW with MOVEFILE_REPLACE_EXISTING, so a
//   same-directory rename over an existing file is an atomic replace.
// - There is no portable directory fsync on Windows, so file-content fsync is
//   the strongest durability barrier available here. S0 records that limit
//   rather than pretending the guarantee is stronger than it is.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

let tempCounter = 0;

export function writeFileAtomicSync(filePath, data, { onBeforeRename } = {}) {
  const directory = path.dirname(filePath);
  const temp = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.${tempCounter++}.tmp`,
  );
  const handle = fs.openSync(temp, "w");
  try {
    fs.writeFileSync(handle, data);
    fs.fsyncSync(handle);
  } finally {
    fs.closeSync(handle);
  }
  // The rename is the atomic commit point. A crash here leaves the fully written
  // temp file behind and the previous target untouched.
  onBeforeRename?.();
  fs.renameSync(temp, filePath);
}

export function listTempArtifacts(directory) {
  try {
    return fs.readdirSync(directory).filter((name) => name.endsWith(".tmp"));
  } catch {
    return [];
  }
}

export function isPidAlive(pid) {
  const value = Number(pid);
  if (!Number.isInteger(value) || value <= 0) return false;
  try {
    process.kill(value, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readOwner(lockPath) {
  try {
    return JSON.parse(fs.readFileSync(lockPath, "utf8"));
  } catch {
    return null;
  }
}

export function reapStaleLock(lockPath, { onBeforeDelete = null } = {}) {
  const owner = readOwner(lockPath);
  if (!owner?.token || !Number.isInteger(owner.pid) || owner.pid <= 0 || isPidAlive(owner.pid)) {
    return false;
  }
  return removeOwnedLock(lockPath, owner, { onBeforeDelete });
}

function removeOwnedLock(lockPath, expectedOwner, { onBeforeDelete = null } = {}) {
  const reclaimPath = `${lockPath}.reclaim`;
  let reclaimHandle;
  try {
    reclaimHandle = fs.openSync(reclaimPath, "wx");
  } catch (error) {
    if (error?.code === "EEXIST") return false;
    throw error;
  }
  const snapshotPath = `${reclaimPath}.${process.pid}.${crypto.randomUUID()}.snapshot`;
  try {
    const owner = readOwner(lockPath);
    if (owner?.token !== expectedOwner.token || owner?.pid !== expectedOwner.pid) {
      return false;
    }
    try {
      fs.linkSync(lockPath, snapshotPath);
    } catch (error) {
      return error?.code === "ENOENT";
    }
    const snapshotOwner = readOwner(snapshotPath);
    const snapshotStat = fs.statSync(snapshotPath);
    if (snapshotOwner?.token !== expectedOwner.token ||
        snapshotOwner?.pid !== expectedOwner.pid) return false;
    onBeforeDelete?.({ owner: { ...owner }, lockPath });
    const currentOwner = readOwner(lockPath);
    if (currentOwner?.token !== expectedOwner.token ||
        currentOwner?.pid !== expectedOwner.pid) return false;
    const currentStat = fs.statSync(lockPath);
    if (currentStat.dev !== snapshotStat.dev || currentStat.ino !== snapshotStat.ino) return false;
    fs.unlinkSync(lockPath);
    return true;
  } catch {
    return false;
  } finally {
    try { fs.closeSync(reclaimHandle); } catch { /* already closed */ }
    try { fs.unlinkSync(reclaimPath); } catch { /* already removed */ }
    try { fs.unlinkSync(snapshotPath); } catch { /* no snapshot */ }
  }
}

/**
 * Exclusive cross-process lock. The owner record is written to a private
 * temporary file first and published with an atomic link, so the lock path is
 * never observable in a half-written state. A crashed owner leaves the file
 * behind, and it is only stolen when its recorded owner and owner token are
 * still the exact same dead claim at deletion time. Malformed claims fail
 * closed rather than being age-reaped.
 */
export async function acquireLock(lockPath, {
  timeoutMs = 10_000,
  pollMs = 5,
  onBeforeReapDelete = null,
} = {}) {
  const deadline = Date.now() + timeoutMs;
  let stolenStaleLock = false;
  for (;;) {
    const token = crypto.randomUUID();
    const staging = `${lockPath}.${process.pid}.${tempCounter++}.claim`;
    const handle = fs.openSync(staging, "w");
    try {
      fs.writeFileSync(handle, JSON.stringify({ pid: process.pid, token, at: Date.now() }));
      fs.fsyncSync(handle);
    } finally {
      fs.closeSync(handle);
    }
    try {
      // linkSync fails with EEXIST if the destination exists, so publication of
      // an already-complete record is the atomic acquisition step.
      fs.linkSync(staging, lockPath);
      return {
        path: lockPath,
        token,
        stolenStaleLock,
        release() {
          return removeOwnedLock(lockPath, { pid: process.pid, token });
        },
      };
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      if (reapStaleLock(lockPath, { onBeforeDelete: onBeforeReapDelete })) {
        stolenStaleLock = true;
        continue;
      }
      if (Date.now() > deadline) {
        const timeout = new Error(`Timed out acquiring lock: ${lockPath}`);
        timeout.code = "lock_timeout";
        throw timeout;
      }
      await sleep(pollMs);
    } finally {
      try { fs.unlinkSync(staging); } catch { /* already cleaned */ }
    }
  }
}
