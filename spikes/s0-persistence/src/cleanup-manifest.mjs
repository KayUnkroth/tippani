import fs from "node:fs";
import crypto from "node:crypto";

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

export class CleanupManifest {
  constructor({
    runId,
    ownershipMarker,
    manifestId = null,
    coordinatesHash = null,
    effectiveTargetHash = null,
  }) {
    if (ownershipMarker !== `tippani-s0:${runId}`) {
      throw new Error("Cleanup ownership marker does not match run ID");
    }
    this.runId = runId;
    this.ownershipMarker = ownershipMarker;
    this.manifestId = manifestId;
    this.coordinatesHash = coordinatesHash;
    this.effectiveTargetHash = effectiveTargetHash;
    this.resources = [];
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
    this.resources.push({ ...resource, cleaned: false });
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
  }

  bindCondition(resource, condition) {
    const item = this.resources.find((candidate) =>
      candidate.kind === resource.kind && candidate.id === resource.id);
    if (!item || item.cleaned || item.condition || resource.condition) {
      throw new Error("Refusing to replace or duplicate a cleanup condition");
    }
    item.condition = structuredClone(condition);
    resource.condition = structuredClone(condition);
  }

  toJSON() {
    return {
      schemaVersion: 1,
      syntheticData: true,
      runId: this.runId,
      ownershipMarker: this.ownershipMarker,
      manifestId: this.manifestId,
      coordinatesHash: this.coordinatesHash,
      effectiveTargetHash: this.effectiveTargetHash,
      resources: this.resources.map((item) => ({ ...item })),
    };
  }

  write(filePath) {
    fs.writeFileSync(filePath, JSON.stringify(this.toJSON(), null, 2) + "\n", "utf8");
  }
}

export function createCleanupAuthorization(config, store) {
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
  const manifest = new CleanupManifest({
    runId: config.runId,
    ownershipMarker: config.sandbox?.ownershipMarker,
    manifestId: config.sandbox?.cleanup?.manifestId || null,
    coordinatesHash,
    effectiveTargetHash,
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
