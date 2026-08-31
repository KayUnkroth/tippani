const PROVIDERS = new Set(["onedrive", "ado", "github"]);
const ALLOWED_CREDENTIAL_METADATA = new Set([
  "credentialbrokerref",
  "credentialsource",
  "identitylabel",
]);

function isCredentialKey(key) {
  const normalized = String(key).replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (ALLOWED_CREDENTIAL_METADATA.has(normalized)) return false;
  return normalized === "pat" ||
    normalized === "apikey" ||
    normalized === "connectionstring" ||
    normalized.endsWith("token") ||
    normalized.endsWith("secret") ||
    normalized.endsWith("password") ||
    normalized.endsWith("credential") ||
    normalized.endsWith("credentials") ||
    normalized.endsWith("credentialvalue") ||
    normalized.endsWith("privatekey") ||
    normalized.endsWith("sas");
}

export class PreflightError extends Error {
  constructor(errors) {
    super(`S0 preflight failed:\n- ${errors.join("\n- ")}`);
    this.name = "PreflightError";
    this.code = "preflight_failed";
    this.errors = errors;
  }
}

function positiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

export function normalizedCleanup(sandbox, now = new Date()) {
  const cleanup = sandbox?.cleanup;
  if (!cleanup) return null;
  const retentionHours = Number(cleanup.retentionHours);
  const expiresAt = positiveNumber(retentionHours)
    ? new Date(now.getTime() + (retentionHours * 60 * 60 * 1000)).toISOString()
    : cleanup.expiresAt;
  return { ...cleanup, expiresAt };
}

function findEmbeddedSecrets(value, path = "$", errors = []) {
  if (!value || typeof value !== "object") return errors;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = `${path}.${key}`;
    if (isCredentialKey(key) && item !== null && item !== "" && item !== false) {
      errors.push(`Credential material is forbidden in config at ${itemPath}`);
    } else if (item && typeof item === "object") {
      findEmbeddedSecrets(item, itemPath, errors);
    }
  }
  return errors;
}

export { findEmbeddedSecrets };

export function validatePreflight(config) {
  const errors = findEmbeddedSecrets(config);
  const runId = String(config?.runId || "");
  const sandbox = config?.sandbox || {};
  const budgets = config?.budgets || {};

  if (!/^CFG-[A-Z0-9-]+$/.test(config?.configurationId || "")) {
    errors.push("configurationId must match CFG-<ID>");
  }
  if (!/^s0-[a-z0-9-]+$/.test(runId)) {
    errors.push("runId must match s0-<lowercase-id>");
  }
  if (config?.syntheticDataOnly !== true) {
    errors.push("syntheticDataOnly must be true");
  }
  for (const name of ["maxOperations", "maxDurationMs", "maxObjects", "maxBytes"]) {
    if (!positiveNumber(budgets[name])) errors.push(`budgets.${name} must be positive`);
  }
  if (sandbox.approved !== true) errors.push("sandbox.approved must be true");
  if (sandbox.corporateFallbackDisabled !== true) {
    errors.push("Corporate-account fallback must be disabled");
  }
  if (sandbox.ownershipMarker !== `tippani-s0:${runId}`) {
    errors.push("Sandbox ownership marker must match the run ID");
  }

  if (PROVIDERS.has(config?.backingPath)) {
    if (sandbox.allowListed !== true) errors.push("Provider sandbox must be allow-listed");
    if (!sandbox.identityLabel) errors.push("Provider sandbox identityLabel is required");
    if (sandbox.identityVerified !== true) errors.push("Provider sandbox identity must be verified");
    if (sandbox.defaultBranchExcluded !== true) {
      errors.push("Default/protected branch exclusion must be verified");
    }
    if (sandbox.namespace !== `tippani-s0/${runId}`) {
      errors.push("Provider namespace must be scoped to the run ID");
    }
    if (!Array.isArray(sandbox.dryRunOperations) || sandbox.dryRunOperations.length === 0) {
      errors.push("Provider dry-run operation manifest is required");
    }
    const cleanup = normalizedCleanup(sandbox);
    if (!cleanup?.manifestId || !cleanup?.expiresAt ||
      !Number.isFinite(Date.parse(cleanup.expiresAt)) ||
      (!positiveNumber(Number(sandbox.cleanup?.retentionHours)) && Date.parse(cleanup.expiresAt) <= Date.now())) {
      errors.push("Provider cleanup manifest and expiry are required");
    }
    if (!sandbox.coordinates || typeof sandbox.coordinates !== "object") {
      errors.push("Provider sandbox coordinates are required");
    }
  }

  return errors;
}

export function assertPreflight(config, now = new Date()) {
  const errors = validatePreflight(config);
  if (errors.length) throw new PreflightError(errors);
  return {
    configurationId: config.configurationId,
    runId: config.runId,
    adapter: config.adapter,
    backingPath: config.backingPath,
    syntheticDataOnly: true,
    sandbox: {
      approved: true,
      kind: config.sandbox.kind,
      identityLabel: config.sandbox.identityLabel || "Synthetic Local Harness",
      identityVerified: config.sandbox.identityVerified === true,
      ownershipMarker: config.sandbox.ownershipMarker,
      namespace: config.sandbox.namespace || null,
      defaultBranchExcluded: config.sandbox.defaultBranchExcluded === true,
      corporateFallbackDisabled: true,
      dryRunOperations: [...(config.sandbox.dryRunOperations || [])],
      cleanup: normalizedCleanup(config.sandbox, now),
    },
    budgets: { ...config.budgets },
  };
}
