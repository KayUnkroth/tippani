import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { writeFileAtomicSync } from "./adapters/fs-atomic.mjs";

const SCHEMA_VERSION = 2;

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, stable(value[key])]),
  );
}

export function cleanupCoordinatesHash(provider, coordinates) {
  const material = JSON.stringify(stable({ provider, coordinates }));
  return `sha256:${crypto.createHash("sha256").update(material).digest("hex")}`;
}

function manifestDigest(document) {
  return `sha256:${crypto.createHash("sha256")
    .update(JSON.stringify(stable(document)))
    .digest("hex")}`;
}

export class CleanupManifest {
  constructor({
    runId,
    ownershipMarker,
    manifestId = null,
    coordinatesHash = null,
    effectiveTargetHash = null,
    filePath = null,
    revision = 0,
  }) {
    if (ownershipMarker !== `tippani-s0:${runId}`) {
      throw new Error("Cleanup ownership marker does not match run ID");
    }
    this.runId = runId;
    this.ownershipMarker = ownershipMarker;
    this.manifestId = manifestId;
    this.coordinatesHash = coordinatesHash;
    this.effectiveTargetHash = effectiveTargetHash;
    this.filePath = filePath;
    this.revision = revision;
    this.resources = [];
  }

  static load(filePath) {
    let document;
    try {
      document = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      throw new Error("Cleanup manifest is not valid JSON");
    }
    const { manifestDigest: recordedDigest, ...payload } = document || {};
    if (payload.schemaVersion !== SCHEMA_VERSION ||
        payload.syntheticData !== true ||
        !Number.isInteger(payload.revision) ||
        payload.revision < 0 ||
        !Array.isArray(payload.resources) ||
        recordedDigest !== manifestDigest(payload)) {
      throw new Error("Cleanup manifest failed integrity validation");
    }
    const manifest = new CleanupManifest({
      runId: payload.runId,
      ownershipMarker: payload.ownershipMarker,
      manifestId: payload.manifestId,
      coordinatesHash: payload.coordinatesHash,
      effectiveTargetHash: payload.effectiveTargetHash,
      filePath,
      revision: payload.revision,
    });
    manifest.resources = payload.resources.map((resource) => structuredClone(resource));
    for (const resource of manifest.resources) {
      if (!resource?.id || !resource?.kind ||
          resource.runId !== manifest.runId ||
          resource.ownershipMarker !== manifest.ownershipMarker ||
          (resource.coordinatesHash ?? null) !== manifest.coordinatesHash ||
          (resource.effectiveTargetHash ?? null) !== manifest.effectiveTargetHash ||
          typeof resource.cleaned !== "boolean") {
        throw new Error("Cleanup manifest contains an invalid resource");
      }
    }
    return manifest;
  }

  persistIfConfigured() {
    if (this.filePath) this.persist();
  }

  record(resource) {
    if (!resource?.id || !resource?.kind) throw new TypeError("Cleanup resource id and kind are required");
    if (resource.runId !== this.runId || resource.ownershipMarker !== this.ownershipMarker) {
      throw new Error("Cleanup resource is not owned by this run");
    }
    if ((resource.coordinatesHash ?? null) !== this.coordinatesHash ||
        (resource.effectiveTargetHash ?? null) !== this.effectiveTargetHash) {
      throw new Error("Cleanup resource does not match the approved provider target");
    }
    if (this.resources.some((item) => item.id === resource.id && item.kind === resource.kind)) {
      throw new Error(`Cleanup resource already recorded: ${resource.kind}/${resource.id}`);
    }
    this.resources.push({ ...structuredClone(resource), cleaned: false });
    this.revision++;
    try {
      this.persistIfConfigured();
    } catch (error) {
      this.resources.pop();
      this.revision--;
      throw error;
    }
  }

  authorize(resource) {
    return this.resources.some((item) =>
      item.kind === resource.kind &&
      item.id === resource.id &&
      item.runId === resource.runId &&
      item.ownershipMarker === resource.ownershipMarker &&
      (item.coordinatesHash ?? null) === (resource.coordinatesHash ?? null) &&
      (item.effectiveTargetHash ?? null) === (resource.effectiveTargetHash ?? null) &&
      JSON.stringify(item.condition || null) === JSON.stringify(resource.condition || null) &&
      item.cleaned === false);
  }

  markCleaned(resource) {
    const item = this.resources.find((candidate) =>
      candidate.kind === resource.kind && candidate.id === resource.id);
    if (!item || !this.authorize(resource)) {
      throw new Error("Refusing cleanup for an unowned or already cleaned resource");
    }
    item.cleaned = true;
    this.revision++;
    try {
      this.persistIfConfigured();
    } catch (error) {
      item.cleaned = false;
      this.revision--;
      throw error;
    }
  }

  bindCondition(resource, condition) {
    const item = this.resources.find((candidate) =>
      candidate.kind === resource.kind && candidate.id === resource.id);
    if (!item || item.cleaned || item.condition || resource.condition) {
      throw new Error("Refusing to replace or duplicate a cleanup condition");
    }
    item.condition = structuredClone(condition);
    resource.condition = structuredClone(condition);
    this.revision++;
    try {
      this.persistIfConfigured();
    } catch (error) {
      delete item.condition;
      delete resource.condition;
      this.revision--;
      throw error;
    }
  }

  payload() {
    return {
      schemaVersion: SCHEMA_VERSION,
      syntheticData: true,
      revision: this.revision,
      runId: this.runId,
      ownershipMarker: this.ownershipMarker,
      manifestId: this.manifestId,
      coordinatesHash: this.coordinatesHash,
      effectiveTargetHash: this.effectiveTargetHash,
      resources: this.resources.map((item) => structuredClone(item)),
    };
  }

  toJSON() {
    const payload = this.payload();
    return {
      ...payload,
      manifestDigest: manifestDigest(payload),
    };
  }

  evidence() {
    const document = this.toJSON();
    return {
      artifact: this.filePath ? path.basename(this.filePath) : "cleanup-manifest.json",
      manifestId: this.manifestId,
      digest: document.manifestDigest,
      schemaVersion: document.schemaVersion,
      revision: document.revision,
      resourceCount: document.resources.length,
      cleanedCount: document.resources.filter((resource) => resource.cleaned).length,
    };
  }

  persist(filePath = this.filePath) {
    if (!filePath) throw new TypeError("Cleanup manifest path is required");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const document = this.toJSON();
    writeFileAtomicSync(filePath, JSON.stringify(document, null, 2) + "\n");
    this.filePath = filePath;
    return this.evidence();
  }

  write(filePath) {
    return this.persist(filePath);
  }
}

export function createCleanupAuthorization(config, store, { filePath = null } = {}) {
  if (typeof store?.cleanupResource !== "function") {
    throw new TypeError("Provider store must describe its cleanup resource");
  }
  const resource = store.cleanupResource();
  const coordinates = config.backingPath === "onedrive"
    ? {
      driveId: config.driveId || config.sandbox?.coordinates?.driveId,
      folder: config.folderPath || config.sandbox?.coordinates?.folder,
    }
    : config.backingPath === "ado"
      ? {
        organization: config.org || config.sandbox?.coordinates?.organization,
        project: config.project || config.sandbox?.coordinates?.project,
        repository: config.repo || config.sandbox?.coordinates?.repository,
      }
      : {
        owner: config.owner || config.sandbox?.coordinates?.owner,
        repository: config.repo || config.sandbox?.coordinates?.repository,
      };
  const coordinatesHash = cleanupCoordinatesHash(config.backingPath, coordinates);
  const effectiveTargetHash =
    config.sandbox?.effectiveTargetHash ||
    config.sandbox?.approval?.targetHash ||
    "dry-run-unapproved";
  if (resource.coordinatesHash !== coordinatesHash ||
      resource.effectiveTargetHash !== effectiveTargetHash) {
    throw new Error("Cleanup store does not match the approved provider coordinates");
  }
  const manifestId = config.sandbox?.cleanup?.manifestId || null;
  if (filePath && fs.existsSync(filePath)) {
    const manifest = CleanupManifest.load(filePath);
    const recorded = manifest.resources.find((candidate) =>
      candidate.kind === resource.kind && candidate.id === resource.id);
    if (manifest.runId !== config.runId ||
        manifest.ownershipMarker !== config.sandbox?.ownershipMarker ||
        manifest.manifestId !== manifestId ||
        manifest.coordinatesHash !== coordinatesHash ||
        manifest.effectiveTargetHash !== effectiveTargetHash ||
        !recorded ||
        recorded.cleaned === true ||
        recorded.runId !== resource.runId ||
        recorded.ownershipMarker !== resource.ownershipMarker ||
        recorded.coordinatesHash !== resource.coordinatesHash ||
        recorded.effectiveTargetHash !== resource.effectiveTargetHash) {
      throw new Error("Persisted cleanup manifest does not authorize this provider run");
    }
    const resumedResource = structuredClone(recorded);
    delete resumedResource.cleaned;
    return { manifest, resource: resumedResource };
  }
  const manifest = new CleanupManifest({
    runId: config.runId,
    ownershipMarker: config.sandbox?.ownershipMarker,
    manifestId,
    coordinatesHash,
    effectiveTargetHash,
    filePath,
  });
  manifest.record(resource);
  return { manifest, resource };
}

export function assertCleanupAuthorized(manifest, resource, expected) {
  if (!manifest?.authorize?.(resource) ||
      (expected?.manifestId && manifest.manifestId !== expected.manifestId) ||
      resource?.kind !== expected?.kind ||
      resource?.id !== expected?.id ||
      resource?.runId !== expected?.runId ||
      resource?.ownershipMarker !== expected?.ownershipMarker ||
      resource?.coordinatesHash !== expected?.coordinatesHash ||
      resource?.effectiveTargetHash !== expected?.effectiveTargetHash) {
    throw new Error("Refusing provider cleanup without exact manifest authorization");
  }
}
