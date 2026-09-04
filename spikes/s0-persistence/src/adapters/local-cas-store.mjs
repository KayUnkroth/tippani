// Candidate A: one atomic generation-CAS envelope per workspace plus a
// rebuildable alias index.
//
// The envelope file is the only authority. The alias index is a derived cache
// rebuilt from envelopes at initialize(), so a crash between an envelope write
// and an index update cannot strand an alias pointing at state that never
// committed.

import fs from "node:fs";
import path from "node:path";
import {
  CorruptWorkspaceStoreError,
  WorkspaceConflictError,
  WorkspaceNotFoundError,
  WorkspaceStoreError,
  DURABLE_IDENTITY_CHECKSUM_VERSION,
  LEGACY_WORKSPACE_CHECKSUM_VERSION,
  applyWorkspaceOperation,
  assertReconcilable,
  checksumWorkspace,
  checksumWorkspaceV1,
  deepClone,
  needsReconciliation,
  validateWorkspaceRecord,
} from "../workspace-contract.mjs";
import { migrateWorkspaceV0ToV1 } from "../synthetic-fixtures.mjs";
import { acquireLock, listTempArtifacts, writeFileAtomicSync } from "./fs-atomic.mjs";

const SCHEMA_VERSION = 1;

function checksumOf(workspace, durableWorkspaceId = workspace.workspaceId) {
  return checksumWorkspace(workspace, durableWorkspaceId);
}

function canonicalEnvelope(workspace) {
  return {
    schemaVersion: SCHEMA_VERSION,
    checksumVersion: DURABLE_IDENTITY_CHECKSUM_VERSION,
    durableWorkspaceId: workspace.workspaceId,
    checksum: checksumOf(workspace),
    workspace,
  };
}

function checksumFormat(envelope, workspaceId) {
  const declaredVersion = envelope.checksumVersion;
  const identityChecksum = checksumOf(envelope.workspace, workspaceId);
  const legacyChecksum = checksumWorkspaceV1(envelope.workspace);
  if (declaredVersion === DURABLE_IDENTITY_CHECKSUM_VERSION) {
    if (envelope.durableWorkspaceId !== workspaceId || envelope.checksum !== identityChecksum) {
      throw new CorruptWorkspaceStoreError(
        `Workspace ${workspaceId} failed durable-identity checksum validation`,
      );
    }
    return { version: declaredVersion, canonical: true };
  }
  if (declaredVersion === LEGACY_WORKSPACE_CHECKSUM_VERSION) {
    if (envelope.checksum !== legacyChecksum) {
      throw new CorruptWorkspaceStoreError(
        `Workspace ${workspaceId} failed legacy checksum validation`,
      );
    }
    return { version: declaredVersion, canonical: false };
  }
  if (declaredVersion === undefined || declaredVersion === null) {
    if (envelope.checksum === legacyChecksum) {
      return { version: LEGACY_WORKSPACE_CHECKSUM_VERSION, canonical: false };
    }
    // Canonicalize the short-lived unversioned identity-bound format too.
    if (envelope.checksum === identityChecksum) {
      return { version: DURABLE_IDENTITY_CHECKSUM_VERSION, canonical: false };
    }
  }
  throw new CorruptWorkspaceStoreError(
    `Workspace ${workspaceId} has an unsupported or invalid checksum format`,
  );
}

export class LocalCasWorkspaceStore {
  constructor({ storeRoot, configurationId = "CFG-LOCAL-CAS", lockTimeoutMs = 10_000 } = {}) {
    if (!storeRoot) throw new TypeError("storeRoot is required");
    this.configurationId = configurationId;
    this.root = storeRoot;
    this.workspaceDir = path.join(storeRoot, "workspaces");
    this.lockDir = path.join(storeRoot, "locks");
    this.legacyDir = path.join(storeRoot, "legacy");
    this.migratedDir = path.join(storeRoot, "migrated");
    this.lockTimeoutMs = lockTimeoutMs;
    this.aliasIndex = new Map();
    this.readFaults = new Set();
    this.initialized = false;
  }

  envelopePath(workspaceId) {
    return path.join(this.workspaceDir, `${workspaceId}.json`);
  }

  lockPath(workspaceId) {
    return path.join(this.lockDir, `${workspaceId}.lock`);
  }

  ensureInitialized() {
    if (!this.initialized) {
      throw new WorkspaceStoreError("Store is not initialized", "store_not_initialized");
    }
  }

  decodeEnvelope(workspaceId) {
    const file = this.envelopePath(workspaceId);
    let raw;
    try {
      if (this.readFaults.has(workspaceId)) {
        this.readFaults.delete(workspaceId);
        const denied = new Error("permission denied (injected)");
        denied.code = "EACCES";
        throw denied;
      }
      raw = fs.readFileSync(file, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") throw new WorkspaceNotFoundError(workspaceId);
      // A present-but-unreadable store is never treated as absent.
      throw new CorruptWorkspaceStoreError(`Cannot read workspace ${workspaceId}: ${error.code}`);
    }
    let envelope;
    try {
      envelope = JSON.parse(raw);
    } catch {
      throw new CorruptWorkspaceStoreError(`Workspace ${workspaceId} is not valid JSON`);
    }
    if (envelope?.schemaVersion !== SCHEMA_VERSION || !envelope.workspace) {
      throw new CorruptWorkspaceStoreError(`Workspace ${workspaceId} envelope is unusable`);
    }
    if (envelope.workspace.workspaceId !== workspaceId) {
      throw new CorruptWorkspaceStoreError(
        `Workspace ${workspaceId} envelope identity does not match its filename`,
      );
    }
    const format = checksumFormat(envelope, workspaceId);
    return {
      workspace: validateWorkspaceRecord(envelope.workspace),
      checksumVersion: format.version,
      requiresUpgrade: !format.canonical,
    };
  }

  readEnvelope(workspaceId) {
    return this.decodeEnvelope(workspaceId).workspace;
  }

  writeEnvelope(workspace, faultInjector = null, faultPoint = "during-atomic-replace") {
    writeFileAtomicSync(
      this.envelopePath(workspace.workspaceId),
      JSON.stringify(canonicalEnvelope(workspace)),
      { onBeforeRename: () => faultInjector?.hit(faultPoint) },
    );
  }

  workspaceIdsOnDisk() {
    try {
      return fs.readdirSync(this.workspaceDir)
        .filter((name) => name.endsWith(".json"))
        .map((name) => name.slice(0, -".json".length))
        .sort();
    } catch {
      return [];
    }
  }

  rebuildAliasIndex() {
    const index = new Map();
    for (const workspaceId of this.workspaceIdsOnDisk()) {
      const workspace = this.readEnvelope(workspaceId);
      for (const alias of workspace.aliases) {
        const owner = index.get(alias);
        if (owner && owner !== workspaceId) {
          throw new WorkspaceStoreError(`Alias collision: ${alias}`, "alias_conflict");
        }
        index.set(alias, workspaceId);
      }
    }
    this.aliasIndex = index;
  }

  async initialize({ faultInjector = null } = {}) {
    fs.mkdirSync(this.workspaceDir, { recursive: true });
    fs.mkdirSync(this.lockDir, { recursive: true });
    fs.mkdirSync(this.legacyDir, { recursive: true });
    fs.mkdirSync(this.migratedDir, { recursive: true });
    for (const workspaceId of this.workspaceIdsOnDisk()) {
      const lock = await acquireLock(this.lockPath(workspaceId), {
        timeoutMs: this.lockTimeoutMs,
      });
      try {
        const decoded = this.decodeEnvelope(workspaceId);
        if (decoded.requiresUpgrade) {
          this.writeEnvelope(
            decoded.workspace,
            faultInjector,
            "during-checksum-upgrade",
          );
        }
      } finally {
        lock.release();
      }
    }
    this.rebuildAliasIndex();
    this.initialized = true;
    return { workspaceCount: this.workspaceIdsOnDisk().length };
  }

  async createWorkspace(workspace) {
    this.ensureInitialized();
    validateWorkspaceRecord(workspace);
    if (fs.existsSync(this.envelopePath(workspace.workspaceId))) {
      throw new WorkspaceStoreError("Workspace already exists", "workspace_exists");
    }
    this.rebuildAliasIndex();
    for (const alias of workspace.aliases) {
      const owner = this.aliasIndex.get(alias);
      if (owner && owner !== workspace.workspaceId) {
        throw new WorkspaceStoreError(`Alias collision: ${alias}`, "alias_conflict");
      }
    }
    this.writeEnvelope(workspace);
    for (const alias of workspace.aliases) {
      this.aliasIndex.set(alias, workspace.workspaceId);
    }
    return deepClone(workspace);
  }

  async readWorkspace(workspaceId) {
    this.ensureInitialized();
    return this.readEnvelope(workspaceId);
  }

  async resolveAlias(alias) {
    this.ensureInitialized();
    // Another process may have committed since the cache was built.
    this.rebuildAliasIndex();
    const workspaceId = this.aliasIndex.get(alias);
    return workspaceId ? this.readEnvelope(workspaceId) : null;
  }

  async listWorkspaces() {
    this.ensureInitialized();
    return this.workspaceIdsOnDisk();
  }

  async compareAndSwap({ workspaceId, expectedGeneration, operation, faultInjector = null }) {
    this.ensureInitialized();
    const lock = await acquireLock(this.lockPath(workspaceId), {
      timeoutMs: this.lockTimeoutMs,
    });
    try {
      const current = this.readEnvelope(workspaceId);
      if (current.generation !== expectedGeneration) {
        throw new WorkspaceConflictError(workspaceId, expectedGeneration, current.generation);
      }
      assertReconcilable(current, operation);
      const next = applyWorkspaceOperation(current, operation);
      for (const alias of next.aliases) {
        const owner = this.aliasIndex.get(alias);
        if (owner && owner !== workspaceId) {
          throw new WorkspaceStoreError(`Alias collision: ${alias}`, "alias_conflict");
        }
      }
      faultInjector?.hit("before-commit");
      this.writeEnvelope(next, faultInjector);
      faultInjector?.hit("after-commit");
      for (const alias of next.aliases) this.aliasIndex.set(alias, workspaceId);
      return deepClone(next);
    } finally {
      lock.release();
    }
  }

  async backup() {
    this.ensureInitialized();
    return {
      schemaVersion: SCHEMA_VERSION,
      syntheticData: true,
      configurationId: this.configurationId,
      workspaces: this.workspaceIdsOnDisk().map((id) => this.readEnvelope(id)),
    };
  }

  async restore(snapshot, { faultInjector = null } = {}) {
    this.ensureInitialized();
    if (snapshot?.schemaVersion !== SCHEMA_VERSION || snapshot?.syntheticData !== true ||
        !Array.isArray(snapshot?.workspaces)) {
      throw new CorruptWorkspaceStoreError("Backup is invalid");
    }
    // Validate the entire snapshot before touching durable state.
    const aliases = new Map();
    const seen = new Set();
    for (const workspace of snapshot.workspaces) {
      validateWorkspaceRecord(workspace);
      if (seen.has(workspace.workspaceId)) {
        throw new CorruptWorkspaceStoreError("Backup contains duplicate workspace IDs");
      }
      seen.add(workspace.workspaceId);
      for (const alias of workspace.aliases) {
        const owner = aliases.get(alias);
        if (owner && owner !== workspace.workspaceId) {
          throw new WorkspaceStoreError(`Alias collision: ${alias}`, "alias_conflict");
        }
        aliases.set(alias, workspace.workspaceId);
      }
    }
    faultInjector?.hit("before-restore-commit");
    for (const workspaceId of this.workspaceIdsOnDisk()) {
      if (!seen.has(workspaceId)) fs.rmSync(this.envelopePath(workspaceId), { force: true });
    }
    for (const workspace of snapshot.workspaces) this.writeEnvelope(workspace);
    this.rebuildAliasIndex();
    faultInjector?.hit("after-restore-commit");
    return { workspaceCount: snapshot.workspaces.length };
  }

  injectCorruption(workspaceId, mode = "truncated") {
    const file = this.envelopePath(workspaceId);
    if (!fs.existsSync(file)) throw new WorkspaceNotFoundError(workspaceId);
    if (mode === "valid-json-tamper") {
      const envelope = JSON.parse(fs.readFileSync(file, "utf8"));
      envelope.workspace.private.audit.push({
        actor: "Synthetic Tamper",
        action: "checksum-bypass-attempt",
      });
      fs.writeFileSync(file, JSON.stringify(envelope));
      return;
    }
    fs.writeFileSync(file, '{"schemaVersion":1,"workspace":{"trunc');
  }

  injectIdentitySubstitution(workspaceId, replacementWorkspaceId) {
    const source = this.envelopePath(workspaceId);
    const replacement = this.envelopePath(replacementWorkspaceId);
    if (!fs.existsSync(source)) throw new WorkspaceNotFoundError(workspaceId);
    fs.renameSync(source, replacement);
  }

  /** Force the next raw read of this workspace to fail as permission-denied. */
  injectReadFault(workspaceId) {
    this.readFaults.add(workspaceId);
  }

  legacyPath(workspaceId) {
    return path.join(this.legacyDir, `${workspaceId}.json`);
  }

  legacyIdsOnDisk() {
    try {
      return fs.readdirSync(this.legacyDir)
        .filter((name) => name.endsWith(".json"))
        .map((name) => name.slice(0, -".json".length))
        .sort();
    } catch {
      return [];
    }
  }

  /** Seed a prior-schema record to be migrated. Not part of the v1 read path. */
  seedLegacy(legacyRecord) {
    this.ensureInitialized();
    if (!legacyRecord?.workspaceId) throw new TypeError("Legacy record needs a workspaceId");
    writeFileAtomicSync(this.legacyPath(legacyRecord.workspaceId), JSON.stringify(legacyRecord));
  }

  async migrate({ faultInjector = null } = {}) {
    this.ensureInitialized();
    let migrated = 0;
    for (const workspaceId of this.legacyIdsOnDisk()) {
      const legacyFile = this.legacyPath(workspaceId);
      let legacy;
      try {
        legacy = JSON.parse(fs.readFileSync(legacyFile, "utf8"));
      } catch {
        throw new CorruptWorkspaceStoreError(`Legacy record ${workspaceId} is not valid JSON`);
      }
      // Fails closed on any unsupported source version; the legacy file is left intact.
      const migratedWorkspace = migrateWorkspaceV0ToV1(legacy);
      if (!fs.existsSync(this.envelopePath(workspaceId))) {
        faultInjector?.hit("before-migration-commit");
        this.writeEnvelope(migratedWorkspace);
        faultInjector?.hit("after-migration-commit");
      }
      // Preserve the original by archiving rather than deleting.
      fs.renameSync(legacyFile, path.join(this.migratedDir, `${workspaceId}.json`));
      migrated++;
    }
    this.rebuildAliasIndex();
    return { migrated, pending: this.legacyIdsOnDisk().length };
  }

  async importEnvelope(envelope, { faultInjector = null } = {}) {
    this.ensureInitialized();
    if (envelope?.schemaVersion !== SCHEMA_VERSION || envelope?.syntheticData !== true ||
        !envelope.workspace) {
      throw new CorruptWorkspaceStoreError("Import envelope is malformed");
    }
    checksumFormat(envelope, envelope.workspace.workspaceId);
    validateWorkspaceRecord(envelope.workspace);
    const workspaceId = envelope.workspace.workspaceId;
    if (fs.existsSync(this.envelopePath(workspaceId))) {
      throw new WorkspaceStoreError("Workspace already exists", "workspace_exists");
    }
    faultInjector?.hit("before-import-commit");
    this.writeEnvelope(envelope.workspace);
    for (const alias of envelope.workspace.aliases) this.aliasIndex.set(alias, workspaceId);
    faultInjector?.hit("after-import-commit");
    return {
      receiptId: `syn-receipt-${workspaceId}-${envelope.workspace.generation}`,
      workspaceId,
      generation: envelope.workspace.generation,
      importedAt: "2000-01-01T00:00:00.000Z",
    };
  }

  /** Redacted structural diagnostics: identity and health, never content. */
  diagnostics() {
    this.ensureInitialized();
    return {
      schemaVersion: SCHEMA_VERSION,
      syntheticData: true,
      configurationId: this.configurationId,
      adapter: "local-cas",
      pendingMigrations: this.legacyIdsOnDisk().length,
      workspaces: this.workspaceIdsOnDisk().map((id) => {
        try {
          const workspace = this.readEnvelope(id);
          return {
            workspaceId: id,
            generation: workspace.generation,
            aliasCount: workspace.aliases.length,
            documentCount: Object.keys(workspace.documentsByPath).length,
            intentCount: workspace.pushable.remote.orderedIntentIds.length,
            activeJournalId: workspace.publication.activeJournalId,
            needsReconciliation: needsReconciliation(workspace),
            health: "ok",
          };
        } catch (error) {
          return {
            workspaceId: id,
            health: error?.code === "workspace_not_found" ? "absent" : "corrupt",
          };
        }
      }),
    };
  }

  /** Diagnostics used by the atomic-replace scenario. */
  strayTempFiles() {
    return listTempArtifacts(this.workspaceDir);
  }

  async close() {
    this.initialized = false;
  }
}
