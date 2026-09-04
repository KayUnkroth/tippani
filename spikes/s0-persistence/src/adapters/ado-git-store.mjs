// Azure DevOps (Git) backing path via the ADO REST API, behind the common
// IWorkspaceStore contract. Each workspace is one file `<workspaceId>.json` on a
// per-run branch `tippani-s0/<runId>`; the branch's tip commit is the CAS token.
//
// CAS is provider-native: a push carries `oldObjectId` = the branch tip we read.
// If a competing writer advanced the ref, the push is rejected and we surface a
// typed stale-writer conflict. The default branch is never touched.
//
// Two modes on one code path, mirroring the OneDrive transport:
//   dryRun (default) - records the intended ADO operations against a coherent
//                      in-memory model; zero network calls.
//   live             - issues ADO REST calls with a runtime-supplied bearer token.
//
// Host-agnostic: org, project, repo, and token come from the environment.

import {
  CorruptWorkspaceStoreError,
  WorkspaceConflictError,
  WorkspaceNotFoundError,
  WorkspaceStoreError,
  applyWorkspaceOperation,
  assertReconcilable,
  deepClone,
  validateWorkspaceRecord,
} from "../workspace-contract.mjs";
import { assertCleanupAuthorized, cleanupCoordinatesHash } from "../cleanup-manifest.mjs";
import { providerTargetHash } from "../preflight.mjs";
import { ProviderCredentialBinding } from "../provider-identity.mjs";
import { ReferenceMemoryWorkspaceStore } from "./reference-memory-store.mjs";
import { PersistentPendingQueue } from "./persistent-pending-queue.mjs";
import { ProviderTelemetry } from "./provider-telemetry.mjs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ZERO_OID = "0000000000000000000000000000000000000000";
const API = "api-version=7.1";

export class AdoGitStore {
  constructor({
    dryRun = true,
    org,
    project,
    repo,
    runId,
    adoToken,
    getToken,
    configurationId = "CFG-ADO",
    fetchImpl,
    storeRoot,
    safetyBudget = null,
    signal = null,
    identityResolver = null,
    preflightApproval = null,
    effectiveTargetHash = null,
    enforcePreflight = false,
    ownershipMarker,
    cleanupManifestId = null,
  } = {}) {
    this.dryRun = dryRun !== false;
    this.org = org || process.env.S0_ADO_ORG || null;
    this.project = project || process.env.S0_ADO_PROJECT || null;
    this.repo = repo || process.env.S0_ADO_REPO || null;
    this.runId = runId || "s0-ado";
    this.branch = `tippani-s0/${this.runId}`;
    this._getToken = getToken
      || (adoToken ? async () => adoToken : null)
      || (process.env.S0_ADO_TOKEN ? async () => process.env.S0_ADO_TOKEN : null);
    this.configurationId = configurationId;
    this.fetchImpl = fetchImpl || globalThis.fetch;
    this.safetyBudget = safetyBudget;
    this.signal = signal;
    this.identityResolver = identityResolver;
    this.resolvedIdentity = null;
    this.preflightApproval = preflightApproval;
    this.effectiveTargetHash = effectiveTargetHash;
    this.enforcePreflight = enforcePreflight === true;
    this.ownershipMarker = ownershipMarker || `tippani-s0:${this.runId}`;
    this.cleanupManifestId = cleanupManifestId;
    this.operations = [];
    this.liveProviderCalls = 0;
    this.telemetry = new ProviderTelemetry({ safetyBudget });
    this.credentialBinding = new ProviderCredentialBinding({
      provider: "ado",
      getToken: this._getToken,
      fetchImpl: this.fetchImpl,
      signal: this.signal,
      identityResolver: this.identityResolver,
      beforeAttempt: async () => {
        await this.telemetry.recordRequest();
        this.liveProviderCalls++;
      },
      wrapResponse: (response, context) => this.telemetry.wrapResponse(response, context),
    });
    this.model = new ReferenceMemoryWorkspaceStore({ configurationId });
    this._fault = null;
    this.offline = false;
    this.pendingQueue = new PersistentPendingQueue({
      storeRoot,
      provider: "ado",
      runId: this.runId,
    });
    this.initialized = false;
  }

  injectFault(kind) {
    this._fault = { kind };
  }

  async resolveCredentialIdentity() {
    if (this.resolvedIdentity) return this.resolvedIdentity;
    this.resolvedIdentity = await this.credentialBinding.resolveIdentity();
    return this.resolvedIdentity;
  }

  async credentialToken() {
    if (!this.enforcePreflight) {
      return (await this.credentialBinding.issuePinned()).token;
    }
    return (await this.credentialBinding.issueApproved()).token;
  }

  async assertEffectiveTargetApproved() {
    if (this.dryRun || !this.enforcePreflight) return;
    const identity = await this.resolveCredentialIdentity();
    const targetHash = providerTargetHash({
      provider: "ado",
      identity,
      coordinates: {
        organization: this.org,
        project: this.project,
        repository: this.repo,
      },
      namespace: `tippani-s0/${this.runId}`,
    });
    const approval = this.preflightApproval || {};
    if (!targetHash ||
        targetHash !== this.effectiveTargetHash ||
        approval.targetHash !== targetHash ||
        typeof approval.approver !== "string" || !approval.approver.trim() ||
        typeof approval.approvedAt !== "string" || !Number.isFinite(Date.parse(approval.approvedAt)) ||
        typeof approval.reference !== "string" || !approval.reference.trim()) {
      throw new WorkspaceStoreError(
        "Effective ADO target is not covered by a structured preflight approval",
        "preflight_required",
      );
    }
    this.credentialBinding.approveIdentity(identity);
  }

  record(op, detail = {}) {
    this.operations.push({ op, backingPath: "ado", namespace: `tippani-s0/${this.runId}`, ...detail });
  }

  base() {
    return `https://dev.azure.com/${this.org}/${encodeURIComponent(this.project)}/_apis/git/repositories/${encodeURIComponent(this.repo)}`;
  }

  refName() {
    return `refs/heads/${this.branch}`;
  }

  async ado(method, url, { headers = {}, body, accept = "application/json" } = {}) {
    if (this.dryRun) throw new Error("ado() must not be called in dry-run");
    if (!this._getToken) throw new WorkspaceStoreError("No ADO token supplied", "no_token");
    if (!this.org || !this.project || !this.repo) throw new WorkspaceStoreError("org/project/repo required for a live run", "no_coordinates");
    const fault = this._fault;
    if (fault && method !== "GET") {
      await this.telemetry.recordRequest(body);
      this.liveProviderCalls++;
      this._fault = null;
      if (fault.kind === "throttle") return this.telemetry.wrapResponse({ ok: false, status: 429, headers: new Headers({ "Retry-After": "1" }), text: async () => "throttled", json: async () => ({}) }, { method, sent: false });
      if (fault.kind === "auth-expiry") return this.telemetry.wrapResponse({ ok: false, status: 401, text: async () => "unauthorized", json: async () => ({}) }, { method, sent: false });
      if (fault.kind === "permission-loss") return this.telemetry.wrapResponse({ ok: false, status: 403, text: async () => "forbidden", json: async () => ({}) }, { method, sent: false });
      if (fault.kind === "quota") return this.telemetry.wrapResponse({ ok: false, status: 507, text: async () => "quota exceeded", json: async () => ({}) }, { method, sent: false });
      if (fault.kind === "outage") {
        this.telemetry.recordFailure("outage");
        throw new WorkspaceStoreError("network outage (injected)", "provider_unreachable");
      }
      if (fault.kind === "lost-response") {
        const token0 = await this.credentialToken();
        try {
          await this.fetchImpl(url, {
            method,
            headers: { Authorization: `Bearer ${token0}`, ...headers },
            body,
            signal: this.signal,
          });
        } catch (error) {
          throw this.telemetry.indeterminateWrite(error, "transport_failure");
        }
        throw this.telemetry.indeterminateWrite(
          new Error("response lost (injected)"),
          "response_lost",
        );
      }
    }
    const token = await this.credentialToken();
    for (let attempt = 0; ; attempt++) {
      let transportStarted = false;
      try {
        await this.telemetry.recordRequest(body);
        this.liveProviderCalls++;
        transportStarted = true;
        return await this.telemetry.wrapResponse(await this.fetchImpl(url, {
          method,
          headers: { Authorization: `Bearer ${token}`, Accept: accept, ...headers },
          body,
          signal: this.signal,
        }), { method });
      } catch (error) {
        if (error?.code === "indeterminate_write") throw error;
        if (method !== "GET" && transportStarted) {
          throw this.telemetry.indeterminateWrite(error, "transport_failure");
        }
        if (method !== "GET" || attempt >= 2 || !(error instanceof TypeError)) throw error;
        const delayMs = 250 * (attempt + 1);
        this.telemetry.recordRetry();
        this.telemetry.recordBackoff(delayMs);
        await sleep(delayMs);
      }
    }
  }

  async getTip() {
    const resp = await this.ado("GET", `${this.base()}/refs?filter=heads/${this.branch}&${API}`);
    if (!resp.ok) throw new CorruptWorkspaceStoreError(`refs failed: ${resp.status}`);
    const body = await resp.json();
    return body.value?.[0]?.objectId ?? null;
  }

  async readAt(workspaceId, version, versionType) {
    const url = `${this.base()}/items?path=/${encodeURIComponent(`${workspaceId}.json`)}` +
      `&versionDescriptor.version=${version}&versionDescriptor.versionType=${versionType}&${API}`;
    const resp = await this.ado("GET", url, { accept: "text/plain" });
    if (resp.status === 404) throw new WorkspaceNotFoundError(workspaceId);
    if (!resp.ok) throw new CorruptWorkspaceStoreError(`read failed: ${resp.status}`);
    try {
      return validateWorkspaceRecord(JSON.parse(await resp.text()));
    } catch (error) {
      if (error instanceof WorkspaceStoreError) throw error;
      throw new CorruptWorkspaceStoreError(`workspace ${workspaceId} is not valid JSON`);
    }
  }

  async pushChange(workspaceId, workspace, changeType, oldObjectId) {
    const body = JSON.stringify({
      refUpdates: [{ name: this.refName(), oldObjectId: oldObjectId ?? ZERO_OID }],
      commits: [{
        comment: `s0 ${changeType} ${workspaceId}`,
        changes: [{
          changeType,
          item: { path: `/${workspaceId}.json` },
          ...(changeType === "delete" ? {} : { newContent: { content: JSON.stringify(workspace), contentType: "rawtext" } }),
        }],
      }],
    });
    return this.ado("POST", `${this.base()}/pushes?${API}`, {
      headers: { "Content-Type": "application/json" },
      body,
    });
  }

  async initialize() {
    await this.assertEffectiveTargetApproved();
    this.record("connect");
    if (this.dryRun) { await this.model.initialize(); this.initialized = true; return { backingPath: "ado", dryRun: true, branch: this.branch }; }
    this.initialized = true;
    return { backingPath: "ado", dryRun: false, branch: this.branch };
  }

  ensureInitialized() {
    if (!this.initialized) throw new WorkspaceStoreError("Store is not initialized", "store_not_initialized");
  }

  async createWorkspace(workspace) {
    this.ensureInitialized();
    validateWorkspaceRecord(workspace);
    await this.safetyBudget?.recordObjects(1);
    this.record("push", { changeType: "add", item: `${workspace.workspaceId}.json`, precondition: "oldObjectId=tip" });
    if (this.dryRun) return this.model.createWorkspace(workspace);
    const tip = await this.getTip();
    const resp = await this.pushChange(workspace.workspaceId, workspace, "add", tip);
    if (!resp.ok) {
      const text = await resp.text();
      if (/exists|TF401019|already/i.test(text)) throw new WorkspaceStoreError("Workspace already exists", "workspace_exists");
      throw new WorkspaceStoreError(`create failed: ${resp.status}`, "provider_error");
    }
    return deepClone(workspace);
  }

  async readWorkspace(workspaceId) {
    this.ensureInitialized();
    this.record("read-item", { item: `${workspaceId}.json` });
    if (this.dryRun) return this.model.readWorkspace(workspaceId);
    return this.readAt(workspaceId, this.branch, "branch");
  }

  async resolveAlias(alias) {
    this.ensureInitialized();
    this.record("list-items");
    if (this.dryRun) return this.model.resolveAlias(alias);
    for (const id of await this.listWorkspaces()) {
      const ws = await this.readAt(id, this.branch, "branch");
      if (ws.aliases.includes(alias)) return ws;
    }
    return null;
  }

  async listWorkspaces() {
    this.ensureInitialized();
    this.record("list-items");
    if (this.dryRun) return this.model.listWorkspaces();
    const url = `${this.base()}/items?scopePath=/&recursionLevel=OneLevel` +
      `&versionDescriptor.version=${this.branch}&versionDescriptor.versionType=branch&${API}`;
    const resp = await this.ado("GET", url);
    if (resp.status === 404) return [];
    if (!resp.ok) throw new CorruptWorkspaceStoreError(`list failed: ${resp.status}`);
    const body = await resp.json();
    return (body.value || [])
      .filter((i) => !i.isFolder && typeof i.path === "string" && i.path.endsWith(".json"))
      .map((i) => i.path.replace(/^\//, "").replace(/\.json$/, ""))
      .sort();
  }

  async compareAndSwap({ workspaceId, expectedGeneration, operation }) {
    this.ensureInitialized();
    if (this.dryRun) {
      this.record("push", { changeType: "edit", item: `${workspaceId}.json`, precondition: "oldObjectId=<tip>" });
      return this.model.compareAndSwap({ workspaceId, expectedGeneration, operation });
    }
    const tip = await this.getTip();
    const current = await this.readAt(workspaceId, this.branch, "branch");
    if (current.generation !== expectedGeneration) {
      throw new WorkspaceConflictError(workspaceId, expectedGeneration, current.generation);
    }
    assertReconcilable(current, operation);
    const next = applyWorkspaceOperation(current, operation);
    this.record("push", { changeType: "edit", item: `${workspaceId}.json`, precondition: `oldObjectId=${tip}` });
    const resp = await this.pushChange(workspaceId, next, "edit", tip);
    if (!resp.ok) {
      // A non-fast-forward push (the ref moved) is the stale-writer signal.
      let latest = null;
      try { latest = await this.readAt(workspaceId, this.branch, "branch"); } catch { /* fall through */ }
      if (latest && latest.generation !== expectedGeneration) {
        throw new WorkspaceConflictError(workspaceId, expectedGeneration, latest.generation);
      }
      throw new WorkspaceStoreError(`update failed: ${resp.status}`, "provider_error");
    }
    return deepClone(next);
  }

  async backup() {
    this.ensureInitialized();
    this.record("list-items");
    if (this.dryRun) return this.model.backup();
    const ids = await this.listWorkspaces();
    const workspaces = [];
    for (const id of ids) workspaces.push(await this.readAt(id, this.branch, "branch"));
    return { schemaVersion: 1, syntheticData: true, configurationId: this.configurationId, workspaces };
  }

  async restore(snapshot) {
    this.ensureInitialized();
    this.record("push", { changeType: "edit" });
    if (this.dryRun) return this.model.restore(snapshot);
    if (snapshot?.schemaVersion !== 1 || snapshot?.syntheticData !== true || !Array.isArray(snapshot?.workspaces)) {
      throw new CorruptWorkspaceStoreError("Backup is invalid");
    }
    const tip = await this.getTip();
    const existing = new Set(await this.listWorkspaces());
    const changes = snapshot.workspaces.map((workspace) => {
      validateWorkspaceRecord(workspace);
      return {
        changeType: existing.has(workspace.workspaceId) ? "edit" : "add",
        item: { path: `/${workspace.workspaceId}.json` },
        newContent: { content: JSON.stringify(workspace), contentType: "rawtext" },
      };
    });
    await this.safetyBudget?.recordObjects(snapshot.workspaces.length);
    const body = JSON.stringify({
      refUpdates: [{ name: this.refName(), oldObjectId: tip ?? ZERO_OID }],
      commits: [{ comment: "s0 restore", changes }],
    });
    const resp = await this.ado("POST", `${this.base()}/pushes?${API}`, { headers: { "Content-Type": "application/json" }, body });
    if (!resp.ok) throw new WorkspaceStoreError(`restore failed: ${resp.status}`, "provider_error");
    return { workspaceCount: snapshot.workspaces.length };
  }

  async readGeneration(workspaceId, targetGeneration) {
    this.ensureInitialized();
    this.record("list-commits", { item: `${workspaceId}.json` });
    if (this.dryRun) throw new WorkspaceStoreError("history requires a live repo", "dryrun_no_history");
    const url = `${this.base()}/commits?searchCriteria.itemPath=/${encodeURIComponent(`${workspaceId}.json`)}` +
      `&searchCriteria.itemVersion.version=${this.branch}&searchCriteria.itemVersion.versionType=branch&${API}`;
    const resp = await this.ado("GET", url);
    if (!resp.ok) throw new CorruptWorkspaceStoreError(`commits failed: ${resp.status}`);
    const commits = (await resp.json()).value || [];
    for (const commit of commits) {
      try {
        const ws = await this.readAt(workspaceId, commit.commitId, "commit");
        if (ws.generation === targetGeneration) return ws;
      } catch { /* keep scanning */ }
    }
    throw new WorkspaceStoreError(`generation ${targetGeneration} not found in history`, "generation_not_in_history");
  }

  goOffline() { this.offline = true; }

  async stageOffline(request) {
    if (!this.offline) throw new WorkspaceStoreError("stageOffline requires offline mode", "not_offline");
    await this.pendingQueue.append(request);
    return { status: "pending", pendingCount: await this.pendingQueue.count() };
  }

  async reconnect() {
    this.offline = false;
    const applied = [];
    const conflicts = [];
    const retained = [];
    for (;;) {
      const outcome = await this.pendingQueue.processHead(async (entry) => {
        const request = entry.request;
        try {
          const next = await this.compareAndSwap(request);
          return {
            remove: true,
            kind: "applied",
            value: { workspaceId: request.workspaceId, generation: next.generation },
          };
        } catch (error) {
          if (error instanceof WorkspaceConflictError) {
            return {
              remove: false,
              kind: "conflict",
              value: {
                headId: entry.id,
                headGeneration: entry.generation,
                workspaceId: request.workspaceId,
                expected: error.expectedGeneration,
                actual: error.actualGeneration,
              },
            };
          }
          return {
            remove: false,
            kind: "retained",
            value: { workspaceId: request.workspaceId, code: error?.code || "provider_error" },
          };
        }
      });
      if (outcome.empty) break;
      if (outcome.kind === "applied") applied.push(outcome.value);
      if (outcome.kind === "conflict") conflicts.push(outcome.value);
      if (outcome.kind === "retained") retained.push(outcome.value);
      if (outcome.remove !== true) break;
    }
    return { applied, conflicts, retained, pendingCount: await this.pendingQueue.count() };
  }

  async pendingCount() {
    return this.pendingQueue.count();
  }

  async inspectHead() {
    return this.pendingQueue.inspectHead();
  }

  async resolveHead(resolution) {
    return this.pendingQueue.resolveHead(resolution);
  }

  async deleteWorkspace(workspaceId) {
    if (this.dryRun) return { deleted: workspaceId, dryRun: true };
    const tip = await this.getTip();
    if (!tip) return { deleted: workspaceId };
    const resp = await this.pushChange(workspaceId, null, "delete", tip);
    if (!resp.ok && resp.status !== 404) {
      // A missing file is fine; anything else is best-effort during teardown.
      return { deleted: workspaceId, status: resp.status };
    }
    return { deleted: workspaceId };
  }

  // Delete the per-run branch; never touches the default branch.
  cleanupResource() {
    return {
      kind: "ado-ref",
      id: this.refName(),
      runId: this.runId,
      ownershipMarker: this.ownershipMarker,
      coordinatesHash: cleanupCoordinatesHash("ado", {
        organization: this.org,
        project: this.project,
        repository: this.repo,
      }),
      effectiveTargetHash: this.effectiveTargetHash || "dry-run-unapproved",
    };
  }

  async prepareCleanup({ manifest, resource } = {}) {
    await this.assertEffectiveTargetApproved();
    const expected = { ...this.cleanupResource(), manifestId: this.cleanupManifestId };
    assertCleanupAuthorized(manifest, resource, expected);
    if (this.dryRun) {
      manifest.bindCondition(resource, { expectedObjectId: "<tip>" });
      return resource.condition;
    }
    const tip = await this.getTip();
    manifest.bindCondition(resource, tip ? { expectedObjectId: tip } : { absent: true });
    return resource.condition;
  }

  async cleanup({ manifest, resource } = {}) {
    await this.assertEffectiveTargetApproved();
    const expected = { ...this.cleanupResource(), manifestId: this.cleanupManifestId };
    assertCleanupAuthorized(manifest, resource, expected);
    if (!resource.condition) {
      throw new WorkspaceStoreError("cleanup condition was not prepared", "cleanup_precondition_unavailable");
    }
    if (this.dryRun) {
      this.record("delete-ref", { ref: this.refName(), precondition: "oldObjectId=<tip>" });
      manifest.markCleaned(resource);
      return { deleted: this.branch, dryRun: true };
    }
    if (resource.condition.absent === true) {
      manifest.markCleaned(resource);
      return { deleted: this.branch, absent: true };
    }
    const tip = await this.getTip();
    if (tip !== resource.condition.expectedObjectId) {
      throw new WorkspaceStoreError("cleanup target changed concurrently", "cleanup_conflict");
    }
    const body = JSON.stringify([{
      name: this.refName(),
      oldObjectId: resource.condition.expectedObjectId,
      newObjectId: ZERO_OID,
    }]);
    const resp = await this.ado("POST", `${this.base()}/refs?${API}`, { headers: { "Content-Type": "application/json" }, body });
    if (!resp.ok) throw new WorkspaceStoreError(`cleanup failed: ${resp.status}`, "provider_error");
    const outcome = await resp.json();
    const update = Array.isArray(outcome) ? outcome[0] : outcome.value?.[0];
    if (update?.success !== true) {
      throw new WorkspaceStoreError("cleanup target changed concurrently", "cleanup_conflict");
    }
    manifest.markCleaned(resource);
    return { deleted: this.branch };
  }

  providerOperationManifest() {
    return this.operations.map((op) => ({ ...op }));
  }

  liveProviderCallCount() {
    return this.liveProviderCalls;
  }

  providerTelemetry() {
    return this.telemetry.snapshot();
  }

  async close() {
    this.initialized = false;
    if (this.dryRun) try { await this.model.close(); } catch { /* best effort */ }
  }
}
