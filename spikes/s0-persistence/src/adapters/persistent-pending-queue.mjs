import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  CorruptWorkspaceStoreError,
  WorkspaceStoreError,
  deepClone,
} from "../workspace-contract.mjs";
import { acquireLock, writeFileAtomicSync } from "./fs-atomic.mjs";

const SCHEMA_VERSION = 1;

function checksum(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export class PersistentPendingQueue {
  constructor({ storeRoot, provider, runId, lockTimeoutMs = 10_000 }) {
    this.provider = provider;
    this.runId = runId;
    this.filePath = storeRoot
      ? path.join(storeRoot, "pending", `${provider}-${runId}.json`)
      : null;
    this.lockPath = this.filePath ? `${this.filePath}.lock` : null;
    this.lockTimeoutMs = lockTimeoutMs;
  }

  ensureAvailable() {
    if (!this.filePath) {
      throw new WorkspaceStoreError(
        "Offline pending work requires a local queue root",
        "pending_queue_unavailable",
      );
    }
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
  }

  readUnlocked() {
    if (!fs.existsSync(this.filePath)) return [];
    let envelope;
    try {
      envelope = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
    } catch {
      throw new CorruptWorkspaceStoreError("Pending queue is not valid JSON");
    }
    const payload = envelope?.payload;
    if (envelope?.schemaVersion !== SCHEMA_VERSION ||
        envelope?.checksum !== checksum(payload) ||
        payload?.syntheticData !== true ||
        payload?.provider !== this.provider ||
        payload?.runId !== this.runId ||
        !Array.isArray(payload?.entries)) {
      throw new CorruptWorkspaceStoreError("Pending queue failed integrity validation");
    }
    return payload.entries.map((entry) => deepClone(entry));
  }

  writeUnlocked(entries) {
    const payload = {
      syntheticData: true,
      provider: this.provider,
      runId: this.runId,
      entries,
    };
    writeFileAtomicSync(this.filePath, JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      checksum: checksum(payload),
      payload,
    }));
  }

  async withLock(action) {
    this.ensureAvailable();
    const lock = await acquireLock(this.lockPath, { timeoutMs: this.lockTimeoutMs });
    try {
      return await action(this.readUnlocked());
    } finally {
      lock.release();
    }
  }

  async append(request) {
    return this.withLock(async (entries) => {
      const entry = {
        id: `syn-pending-${crypto.randomUUID()}`,
        request: deepClone(request),
      };
      entries.push(entry);
      this.writeUnlocked(entries);
      return deepClone(entry);
    });
  }

  async list() {
    return this.withLock((entries) => entries.map((entry) => deepClone(entry)));
  }

  async count() {
    return this.withLock((entries) => entries.length);
  }

  async processHead(handler) {
    return this.withLock(async (entries) => {
      if (!entries.length) return { empty: true };
      const entry = deepClone(entries[0]);
      const outcome = await handler(entry);
      if (outcome?.remove === true) {
        entries.shift();
        this.writeUnlocked(entries);
      }
      return {
        empty: false,
        entry,
        pendingCount: entries.length,
        ...outcome,
      };
    });
  }
}
