import crypto from "node:crypto";
import { sha256, stableJson } from "./evidence-identity.mjs";

export const EVIDENCE_KIND = "onedrive-synced-folder-cross-client-evidence";

export const FUTURE_SYNC_PROBE = "Required future probe: two independent OneDrive sync clients on " +
  "separate devices producing a cross-client evidence artifact (distinct immutable client IDs, " +
  "observed timestamps/operations, conflict/recovery outcomes, and approval metadata) carrying a " +
  "detached signature from the trusted signer, bound to the approved syncTargetHash and config revision.";

// The signed payload is the canonical artifact body with the detached signature
// removed. An unkeyed SHA is forgeable, so trust comes from the signature alone.
export function evidenceSigningPayload(artifact) {
  const { signature, ...body } = artifact || {};
  return Buffer.from(stableJson(body), "utf8");
}

export function toPublicKey(publicKey) {
  if (!publicKey) return null;
  if (typeof publicKey === "object" && !Buffer.isBuffer(publicKey) &&
      typeof publicKey.export === "function") {
    return publicKey;
  }
  try {
    return crypto.createPublicKey(publicKey);
  } catch {
    return null;
  }
}

export function publicKeyFingerprint(publicKey) {
  const key = toPublicKey(publicKey);
  if (!key) return null;
  try {
    const der = key.export({ type: "spki", format: "der" });
    return `sha256:${sha256(der)}`;
  } catch {
    return null;
  }
}

export function verifyEvidenceSignature(artifact, publicKey) {
  const key = toPublicKey(publicKey);
  if (!key) return false;
  if (key.asymmetricKeyType !== "ed25519") return false;
  if (typeof artifact?.signature !== "string" || !artifact.signature) return false;
  try {
    return crypto.verify(
      null,
      evidenceSigningPayload(artifact),
      key,
      Buffer.from(artifact.signature, "base64"),
    );
  } catch {
    return false;
  }
}

// A retained cross-client artifact is the only credible synced-folder proof. It
// must be bound to the approved sync target hash and config revision, list at
// least two distinct immutable client IDs with non-future observed
// timestamps/operations, record a conflict or recovery outcome, and carry a
// detached signature from the configured trusted signer. Environment counts,
// unbound self-reports, and forged SHA digests fail.
export function validateCrossClientEvidence(artifact, {
  approvedTargetHash = null,
  boundTargetHash = null,
  configRevision = null,
  trustedPublicKey = null,
  trustedFingerprint = null,
  now = Date.now(),
} = {}) {
  if (!artifact || typeof artifact !== "object") {
    return ["no structured retained cross-client evidence artifact was supplied"];
  }
  const errors = [];
  if (artifact.schemaVersion !== 1) errors.push("unsupported cross-client evidence schemaVersion");
  if (artifact.kind !== EVIDENCE_KIND) errors.push("unexpected cross-client evidence kind");
  if (!boundTargetHash || artifact.syncTargetHash !== boundTargetHash ||
      !approvedTargetHash || artifact.syncTargetHash !== approvedTargetHash) {
    errors.push("evidence is not bound to the approved sync target hash");
  }
  if (!configRevision || artifact.configRevision !== configRevision) {
    errors.push("evidence config revision is stale or unbound");
  }
  const clients = Array.isArray(artifact.clients) ? artifact.clients : [];
  if (clients.length < 2) errors.push("at least two independent sync clients are required");
  const ids = clients.map((client) => client?.clientId);
  if (ids.some((id) => typeof id !== "string" || !id.trim()) ||
      new Set(ids).size !== ids.length) {
    errors.push("client IDs must be distinct, immutable, non-empty identifiers");
  }
  for (const client of clients) {
    const label = client?.clientId || "<unknown>";
    const observed = Date.parse(client?.observedAt);
    if (typeof client?.observedAt !== "string" || !Number.isFinite(observed)) {
      errors.push(`client ${label} lacks a valid observed timestamp`);
    } else if (observed > now) {
      errors.push(`client ${label} has an observed timestamp in the future`);
    }
    if (!Array.isArray(client?.operations) || client.operations.length === 0) {
      errors.push(`client ${label} lacks observed operations`);
    }
  }
  const outcomes = artifact.outcomes || {};
  if (outcomes.conflict !== true && outcomes.recovery !== true) {
    errors.push("evidence must record an observed conflict or recovery outcome");
  }
  const approval = artifact.approval || {};
  const approvedAt = Date.parse(approval.approvedAt);
  if (typeof approval.approver !== "string" || !approval.approver.trim() ||
      typeof approval.approvedAt !== "string" || !Number.isFinite(approvedAt) ||
      typeof approval.reference !== "string" || !approval.reference.trim()) {
    errors.push("evidence approval requires approver, approvedAt, and reference");
  } else if (approvedAt > now) {
    errors.push("evidence approval date is in the future");
  }
  if (!trustedFingerprint) {
    errors.push("no trusted signer fingerprint is configured; a signed cross-client artifact cannot be verified");
  }
  const trustedKey = toPublicKey(trustedPublicKey);
  if (!trustedKey) {
    errors.push("no trusted signer public key is available; Pass is unreachable");
  } else if (trustedKey.asymmetricKeyType !== "ed25519") {
    errors.push("trusted signer key must be an Ed25519 key; RSA/EC keys are not accepted");
  } else {
    const actualFingerprint = publicKeyFingerprint(trustedKey);
    if (trustedFingerprint && (!actualFingerprint || actualFingerprint !== trustedFingerprint)) {
      errors.push("the supplied signer key does not match the configured trusted fingerprint");
    }
    if (!artifact.signerFingerprint || artifact.signerFingerprint !== trustedFingerprint) {
      errors.push("evidence signer fingerprint is not bound to the trusted signer");
    }
    if (typeof artifact.signature !== "string" || !artifact.signature) {
      errors.push("evidence detached signature is required");
    } else if (!verifyEvidenceSignature(artifact, trustedKey)) {
      errors.push("evidence detached signature is invalid");
    }
  }
  return errors;
}

// The synced-folder approval is a distinct record from the provider-API target
// approval. It binds the computed sync target hash, namespace (inside the hash),
// approver/date/reference, and must never reuse the provider approval hash. These
// checks run BEFORE any probe or write.
export function assessSyncPreconditions({
  boundTargetHash = null,
  approvedTargetHash = null,
  providerApprovalTargetHash = null,
  requiredClientState = null,
  observedClientState = null,
  observedClientIdentity = null,
  syncApproval = null,
  now = Date.now(),
} = {}) {
  if (!boundTargetHash) {
    return {
      blocked: "Blocked — the synced-folder run has no approved sync-root/client-identity binding; " +
        "an arbitrary directory or unverified client cannot satisfy S0-BCK-006.",
    };
  }
  if (typeof observedClientIdentity !== "string" || !observedClientIdentity.trim()) {
    return { blocked: "Blocked — an approved OneDrive sync-client identity is required; none was observed." };
  }
  if (!requiredClientState || observedClientState !== requiredClientState) {
    return {
      blocked: `Blocked — synced-folder evidence requires the verified sync-client state ` +
        `'${requiredClientState || "<approved>"}'; observed '${observedClientState || "unset"}'. ` +
        "A default 'running' or unverified sync-client state cannot pass.",
    };
  }
  if (!syncApproval || typeof syncApproval !== "object" || !syncApproval.targetHash) {
    return {
      blocked: "Blocked — a distinct synced-folder approval record (separate from the provider-API " +
        "approval) is required before the sync probe runs.",
    };
  }
  if (providerApprovalTargetHash && syncApproval.targetHash === providerApprovalTargetHash) {
    return { blocked: "Blocked — the synced-folder approval must not reuse the provider-API target hash." };
  }
  if (!approvedTargetHash || approvedTargetHash !== boundTargetHash) {
    return {
      blocked: "Blocked — the approved sync target hash does not match the bound sync target; " +
        "an arbitrary directory cannot pass S0-BCK-006.",
    };
  }
  const approvedAt = Date.parse(syncApproval.approvedAt);
  if (typeof syncApproval.approver !== "string" || !syncApproval.approver.trim() ||
      typeof syncApproval.approvedAt !== "string" || !Number.isFinite(approvedAt) ||
      typeof syncApproval.reference !== "string" || !syncApproval.reference.trim()) {
    return { blocked: "Blocked — the synced-folder approval requires approver, approval date, and reference." };
  }
  if (approvedAt > now) {
    return { blocked: "Blocked — the synced-folder approval date is in the future." };
  }
  return null;
}

// Pure evidence gate: preconditions (approval + binding) then signed-artifact
// validation. Only a validated, signed retained cross-client artifact is a Pass;
// everything else is Blocked/Incomplete.
export function assessSyncedFolderEvidence({
  boundTargetHash = null,
  syncApproval = null,
  providerApprovalTargetHash = null,
  requiredClientState = null,
  observedClientState = null,
  observedClientIdentity = null,
  configRevision = null,
  retainedEvidence = null,
  trustedPublicKey = null,
  trustedFingerprint = null,
  now = Date.now(),
  validatedAt = new Date(now).toISOString(),
  probe = {},
} = {}) {
  const approvedTargetHash = syncApproval?.targetHash || null;
  const precondition = assessSyncPreconditions({
    boundTargetHash,
    approvedTargetHash,
    providerApprovalTargetHash,
    requiredClientState,
    observedClientState,
    observedClientIdentity,
    syncApproval,
    now,
  });
  if (precondition) return precondition;
  const evidenceErrors = validateCrossClientEvidence(retainedEvidence, {
    approvedTargetHash,
    boundTargetHash,
    configRevision,
    trustedPublicKey,
    trustedFingerprint,
    now,
  });
  if (evidenceErrors.length) {
    return {
      skip: "Incomplete — credible cross-client synced-folder evidence is unavailable: " +
        `${evidenceErrors.join("; ")}. A same-device probe and self-reported client counts cannot ` +
        `pass. ${FUTURE_SYNC_PROBE} Reporting Incomplete rather than Pass.`,
    };
  }
  const signerPublicKey = toPublicKey(trustedPublicKey);
  // The independent pre-write authorization context is retained alongside the
  // proof so comparison revalidates against these values (not the proof's own
  // fields) and reuses the original validation time.
  const authorization = {
    syncTargetHash: boundTargetHash,
    syncApproval: { ...syncApproval },
    configRevision,
    signerFingerprint: trustedFingerprint,
    signerPublicKey: signerPublicKey
      ? signerPublicKey.export({ type: "spki", format: "pem" })
      : null,
    validatedAt,
  };
  return {
    evidence: {
      syncClientState: observedClientState,
      syncClientIdentity: observedClientIdentity,
      probe: "two independent OneDrive sync clients (retained signed cross-client evidence)",
      clients: retainedEvidence.clients.map((client) => client.clientId),
      conflictOutcome: retainedEvidence.outcomes?.conflict === true,
      recoveryOutcome: retainedEvidence.outcomes?.recovery === true,
      signerFingerprint: retainedEvidence.signerFingerprint,
      evidenceSignature: retainedEvidence.signature,
      approvalReference: retainedEvidence.approval.reference,
      syncApprovalReference: syncApproval.reference,
      crossClientEvidence: retainedEvidence,
      syncAuthorization: authorization,
      signerPublicKey: authorization.signerPublicKey,
      providerApiCasUsed: false,
      ...(Number.isFinite(probe.conflictFilesCreated)
        ? { sameDeviceConflictFiles: probe.conflictFilesCreated }
        : {}),
      limitation: "Closure relies on a retained, signed cross-device conflict/recovery artifact; " +
        "provider-API CAS is measured separately.",
    },
    measurements: Number.isFinite(probe.createMs) ? { syncedFolderCreateMs: probe.createMs } : {},
  };
}

// Comparison-side revalidation of a retained synced-folder proof. It uses the
// independent retained authorization (its own syncTargetHash, full syncApproval,
// config revision, signer fingerprint) and the original validation time — never
// the proof's own fields — so waiting cannot make future evidence valid.
export function verifyRetainedSyncProof({
  proof = null,
  authorization = null,
  expectedConfigRevision = null,
  expectedSignerFingerprint = null,
  providerApprovalTargetHash = null,
} = {}) {
  const errors = [];
  if (!authorization || typeof authorization !== "object") {
    errors.push("retained sync authorization context is missing");
    return errors;
  }
  const {
    syncTargetHash = null,
    syncApproval = null,
    configRevision = null,
    signerFingerprint = null,
    signerPublicKey = null,
    validatedAt = null,
  } = authorization;
  if (!syncTargetHash) errors.push("retained sync authorization has no independent sync target hash");
  if (expectedConfigRevision && configRevision !== expectedConfigRevision) {
    errors.push("retained sync authorization config revision is stale");
  }
  if (expectedSignerFingerprint && signerFingerprint !== expectedSignerFingerprint) {
    errors.push("retained sync authorization signer fingerprint does not match the trusted signer");
  }
  const validationTime = Date.parse(validatedAt);
  if (typeof validatedAt !== "string" || !Number.isFinite(validationTime)) {
    errors.push("retained sync authorization has no valid validation time");
  }
  // Approval-record checks, independent of the (non-retained) client state.
  if (!syncApproval || typeof syncApproval !== "object" || !syncApproval.targetHash) {
    errors.push("retained sync approval record is missing an approval target hash");
  } else {
    if (providerApprovalTargetHash && syncApproval.targetHash === providerApprovalTargetHash) {
      errors.push("retained sync approval reuses the provider-API target hash");
    }
    if (syncTargetHash && syncApproval.targetHash !== syncTargetHash) {
      errors.push("retained sync approval target hash does not match the retained sync target");
    }
    const approvedAt = Date.parse(syncApproval.approvedAt);
    if (typeof syncApproval.approver !== "string" || !syncApproval.approver.trim() ||
        typeof syncApproval.approvedAt !== "string" || !Number.isFinite(approvedAt) ||
        typeof syncApproval.reference !== "string" || !syncApproval.reference.trim()) {
      errors.push("retained sync approval requires approver, approval date, and reference");
    } else if (Number.isFinite(validationTime) && approvedAt > validationTime) {
      errors.push("retained sync approval date is after the validation time");
    }
  }
  const trustedKey = toPublicKey(signerPublicKey);
  const evidenceErrors = validateCrossClientEvidence(proof, {
    approvedTargetHash: syncTargetHash,
    boundTargetHash: syncTargetHash,
    configRevision,
    trustedPublicKey: trustedKey,
    trustedFingerprint: signerFingerprint,
    now: Number.isFinite(validationTime) ? validationTime : Date.now(),
  });
  errors.push(...evidenceErrors);
  return errors;
}
