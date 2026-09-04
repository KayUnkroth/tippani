import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { ReferenceMemoryWorkspaceStore } from "../src/adapters/reference-memory-store.mjs";
import { acquireLock } from "../src/adapters/fs-atomic.mjs";
import { LocalCasWorkspaceStore } from "../src/adapters/local-cas-store.mjs";
import { LocalSqliteWorkspaceStore } from "../src/adapters/local-sqlite-store.mjs";
import {
  APPLICABILITY_PROFILES,
  applicableScenarioIds,
  validateApplicability,
} from "../src/applicability.mjs";
import { CleanupManifest } from "../src/cleanup-manifest.mjs";
import { validatePreflight } from "../src/preflight.mjs";
import { COMPLEXITY_RUBRIC, complexityAssessment } from "../src/complexity-rubric.mjs";
import { runHarness } from "../src/runner.mjs";
import { runWorker } from "../src/process-runner.mjs";
import { renderOutcomeReport } from "../src/result-writer.mjs";
import { gateSummary } from "../src/eligibility.mjs";
import {
  canonicalSourceContent,
  sourceRevisionFromEntries,
} from "../src/evidence-identity.mjs";
import {
  SCENARIOS,
  validateScenarioCatalog,
} from "../src/scenario-catalog.mjs";
import {
  assertSyntheticOnly,
  createSyntheticWorkspace,
} from "../src/synthetic-fixtures.mjs";
import {
  WorkspaceConflictError,
  applyWorkspaceOperation,
  validateWorkspaceRecord,
} from "../src/workspace-contract.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const spikeRoot = path.dirname(here);
const config = JSON.parse(fs.readFileSync(
  path.join(spikeRoot, "config", "reference-memory.json"),
  "utf8",
));

let pass = 0;
let fail = 0;
async function check(name, action) {
  try {
    await action();
    pass++;
  } catch (error) {
    fail++;
    console.error(`  FAIL: ${name}`);
    console.error(`        ${error.stack || error}`);
  }
}

await check("scenario catalog is valid and unique", async () => {
  assert.equal(validateScenarioCatalog(), true);
  assert.equal(validateApplicability(SCENARIOS), true);
  assert.equal(new Set(SCENARIOS.map((item) => item.id)).size, SCENARIOS.length);
});

await check("source identity is stable across LF and CRLF checkouts", () => {
  assert.equal(canonicalSourceContent("a\r\nb\r\n"), "a\nb\n");
  assert.equal(
    sourceRevisionFromEntries([{ path: "src/example.mjs", content: "a\nb\n" }]),
    sourceRevisionFromEntries([{ path: "src/example.mjs", content: "a\r\nb\r\n" }]),
  );
});

await check("applicability profiles cover the catalog and separate provider-specific gates", () => {
  assert(APPLICABILITY_PROFILES.local.includes("S0-BCK-001"));
  assert(!APPLICABILITY_PROFILES.local.includes("S0-BCK-002"));
  assert(APPLICABILITY_PROFILES.onedrive.includes("S0-BCK-002"));
  assert(!APPLICABILITY_PROFILES.onedrive.includes("S0-BCK-003"));
  assert(APPLICABILITY_PROFILES.ado.includes("S0-BCK-003"));
  assert(APPLICABILITY_PROFILES.github.includes("S0-BCK-004"));
  assert.deepEqual(applicableScenarioIds(config), config.scenarioIds);
});

await check("all five candidates use the same bounded complexity rubric", () => {
  const candidates = [
    { adapter: "local-sqlite", backingPath: "local" },
    { adapter: "local-cas", backingPath: "local" },
    { adapter: "onedrive", backingPath: "onedrive" },
    { adapter: "ado", backingPath: "ado" },
    { adapter: "github", backingPath: "github" },
  ];
  for (const candidate of candidates) {
    const assessment = complexityAssessment(candidate);
    assert.deepEqual(Object.keys(assessment.scores), [...COMPLEXITY_RUBRIC.dimensions]);
    assert(Object.values(assessment.scores).every((score) => Number.isInteger(score) && score >= 1 && score <= 5));
    assert.equal(Object.keys(assessment.evidence).length, COMPLEXITY_RUBRIC.dimensions.length);
  }
});

await check("machine catalog matches every ID in the approved spec", async () => {
  const spec = fs.readFileSync(
    path.join(spikeRoot, "2026-08-14-s0-windows-persistence-spike.md"),
    "utf8",
  );
  const ids = [...spec.matchAll(/`(S0-[A-Z]{3}-\d{3})`/g)].map((match) => match[1]);
  assert.deepEqual([...new Set(ids)].sort(), SCENARIOS.map((item) => item.id).sort());
});

await check("synthetic fixtures are deterministic", async () => {
  const left = createSyntheticWorkspace({ seed: "deterministic", scale: "small" });
  const right = createSyntheticWorkspace({ seed: "deterministic", scale: "small" });
  assert.deepEqual(left, right);
  assert.equal(assertSyntheticOnly(left), true);
});

await check("scenario discriminator survives long run-id slug truncation", async () => {
  const longConfig = structuredClone(config);
  longConfig.runId = "s0-local-cross-platform-runner-with-a-long-identifier";
  longConfig.sandbox.ownershipMarker = `tippani-s0:${longConfig.runId}`;
  const { run } = await runHarness({
    config: longConfig,
    scenarioIds: ["S0-CON-003", "S0-COR-002", "S0-HYD-001"],
    writeArtifacts: false,
  });
  assert(run.results.every((result) => result.status === "Pass"));
});

await check("synthetic guard rejects actual-looking account data", async () => {
  const fixture = createSyntheticWorkspace({ seed: "guard" });
  fixture.private.activeContext.actor = "person@microsoft.com";
  assert.throws(() => assertSyntheticOnly(fixture), /Non-synthetic value/);
});

await check("preflight accepts the reference sandbox", async () => {
  assert.deepEqual(validatePreflight(config), []);
});

await check("preflight rejects credential variants and corporate fallback", async () => {
  for (const key of [
    "token",
    "authToken",
    "clientSecret",
    "apiKey",
    "sasToken",
    "connectionString",
    "pat",
    "privateKey",
  ]) {
    const unsafe = structuredClone(config);
    unsafe[key] = "not-allowed";
    const errors = validatePreflight(unsafe);
    assert(
      errors.some((error) => error.includes("Credential material")),
      `${key} bypassed credential detection`,
    );
  }
  const fallback = structuredClone(config);
  fallback.sandbox.corporateFallbackDisabled = false;
  assert(
    validatePreflight(fallback).some((error) =>
      error.includes("Corporate-account fallback")),
  );
});

await check("reference store enforces generation CAS", async () => {
  const store = new ReferenceMemoryWorkspaceStore();
  await store.initialize();
  try {
    const workspace = createSyntheticWorkspace({ seed: "cas" });
    await store.createWorkspace(workspace);
    const results = await Promise.allSettled([
      store.compareAndSwap({
        workspaceId: workspace.workspaceId,
        expectedGeneration: 0,
        operation: { auditEvent: { actor: "Synthetic A", action: "write" } },
      }),
      store.compareAndSwap({
        workspaceId: workspace.workspaceId,
        expectedGeneration: 0,
        operation: { auditEvent: { actor: "Synthetic B", action: "write" } },
      }),
    ]);
    assert.equal(results.filter((item) => item.status === "fulfilled").length, 1);
    const rejection = results.find((item) => item.status === "rejected");
    assert(rejection.reason instanceof WorkspaceConflictError);
  } finally {
    await store.close();
  }
});

await check("cleanup manifest authorizes only owned resources once", async () => {
  const manifest = new CleanupManifest({
    runId: config.runId,
    ownershipMarker: config.sandbox.ownershipMarker,
  });

  await check("workspace journal validation rejects foreign workspace and invalid generation references", () => {
    const workspace = createSyntheticWorkspace({ seed: "journal-validation" });
    const intent = workspace.pushable.remote.intentsById[
      workspace.pushable.remote.orderedIntentIds[0]
    ];
    const journal = {
      journalId: "syn-journal-validation",
      workspaceId: workspace.workspaceId,
      generation: 0,
      status: "planned",
      intentTuples: [{
        intentId: intent.intentId,
        intentRevision: intent.intentRevision,
        contentHash: intent.contentHash,
      }],
    };
    const planned = applyWorkspaceOperation(workspace, { planJournal: journal });
    assert.equal(validateWorkspaceRecord(planned), planned);

    assert.throws(
      () => applyWorkspaceOperation(workspace, {
        planJournal: { ...journal, workspaceId: "syn-ws-foreign" },
      }),
      (error) => error.code === "invalid_journal_workspace",
    );
    assert.throws(
      () => applyWorkspaceOperation(workspace, {
        planJournal: { ...journal, generation: workspace.generation + 1 },
      }),
      (error) => error.code === "invalid_journal_generation",
    );

    const reconciled = applyWorkspaceOperation(planned, {
      reconcileJournal: { journalId: journal.journalId, outcome: "committed" },
    });
    const cleaned = applyWorkspaceOperation(reconciled, {
      clearIntentTuple: journal.intentTuples[0],
    });
    assert.equal(cleaned.pushable.remote.intentsById[intent.intentId], undefined);
    assert.equal(cleaned.publication.journalsById[journal.journalId].status, "committed");
    assert.equal(validateWorkspaceRecord(cleaned), cleaned);
  });

  await check("a live PID lock is never reaped merely because its mtime is old", async () => {
    const directory = path.join(spikeRoot, ".test-state", "lock-live-owner");
    fs.rmSync(directory, { recursive: true, force: true });
    fs.mkdirSync(directory, { recursive: true });
    const lockPath = path.join(directory, "workspace.lock");
    const owner = await acquireLock(lockPath, { staleMs: 1, timeoutMs: 100 });
    const old = new Date(Date.now() - 60_000);
    fs.utimesSync(lockPath, old, old);
    try {
      await assert.rejects(
        acquireLock(lockPath, { staleMs: 1, timeoutMs: 20, pollMs: 1 }),
        (error) => error.code === "lock_timeout",
      );
    } finally {
      owner.release();
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  await check("lock release cannot unlink a replacement owner's claim", async () => {
    const directory = path.join(spikeRoot, ".test-state", "lock-owner-token");
    fs.rmSync(directory, { recursive: true, force: true });
    fs.mkdirSync(directory, { recursive: true });
    const lockPath = path.join(directory, "workspace.lock");
    const owner = await acquireLock(lockPath);
    fs.writeFileSync(lockPath, JSON.stringify({
      pid: process.pid,
      token: "replacement-owner-token",
      at: Date.now(),
    }));
    assert.equal(owner.release(), false);
    assert.equal(fs.existsSync(lockPath), true);
    fs.rmSync(directory, { recursive: true, force: true });
  });

  await check("stale-lock reaping preserves a replacement owner across the pathname race", async () => {
    const directory = path.join(spikeRoot, ".test-state", "lock-replacement-race");
    fs.rmSync(directory, { recursive: true, force: true });
    fs.mkdirSync(directory, { recursive: true });
    const lockPath = path.join(directory, "workspace.lock");
    fs.writeFileSync(lockPath, JSON.stringify({
      pid: 2147483647,
      token: "dead-owner-token",
      at: 0,
    }));
    let replaced = false;
    await assert.rejects(
      acquireLock(lockPath, {
        timeoutMs: 20,
        pollMs: 1,
        onBeforeReapDelete() {
          if (replaced) return;
          replaced = true;
          fs.unlinkSync(lockPath);
          fs.writeFileSync(lockPath, JSON.stringify({
            pid: process.pid,
            token: "replacement-owner-token",
            at: Date.now(),
          }));
        },
      }),
      (error) => error.code === "lock_timeout",
    );
    assert.equal(JSON.parse(fs.readFileSync(lockPath, "utf8")).token, "replacement-owner-token");
    fs.rmSync(directory, { recursive: true, force: true });
  });

  await check("SQLite persists checksums and fails closed on valid-JSON tamper after restart", async () => {
    const storeRoot = path.join(spikeRoot, ".test-state", "sqlite-checksum-restart");
    fs.rmSync(storeRoot, { recursive: true, force: true });
    const store = new LocalSqliteWorkspaceStore({ storeRoot });
    await store.initialize();
    const workspace = createSyntheticWorkspace({ seed: "sqlite-checksum-restart" });
    await store.createWorkspace(workspace);
    store.injectCorruption(workspace.workspaceId, "valid-json-tamper");
    await store.close();

    const restarted = new LocalSqliteWorkspaceStore({ storeRoot });
    await assert.rejects(
      restarted.initialize(),
      (error) => error.code === "store_corrupt" && /checksum/.test(error.message),
    );
    assert.equal(fs.existsSync(path.join(storeRoot, "workspace.db")), true);
    await restarted.close();
    fs.rmSync(storeRoot, { recursive: true, force: true });
  });

  await check("SQLite checksum backfill is transactional and resumes after a killed migration", async () => {
    const storeRoot = path.join(spikeRoot, ".test-state", "sqlite-checksum-backfill");
    fs.rmSync(storeRoot, { recursive: true, force: true });
    fs.mkdirSync(storeRoot, { recursive: true });
    const databasePath = path.join(storeRoot, "workspace.db");
    const database = new DatabaseSync(databasePath);
    database.exec(`
      CREATE TABLE workspaces (
        workspace_id TEXT PRIMARY KEY,
        schema_version INTEGER NOT NULL,
        generation INTEGER NOT NULL,
        payload TEXT NOT NULL
      )
    `);
    const insert = database.prepare(`
      INSERT INTO workspaces (workspace_id, schema_version, generation, payload)
      VALUES (?, 1, ?, ?)
    `);
    for (const seed of ["backfill-one", "backfill-two"]) {
      const workspace = createSyntheticWorkspace({ seed });
      insert.run(workspace.workspaceId, workspace.generation, JSON.stringify(workspace));
    }
    database.close();

    const crashed = await runWorker([
      "--mode=checksum-backfill-crash",
      "--adapter=local-sqlite",
      `--root=${storeRoot}`,
      "--crash-at=during-checksum-backfill",
    ]);
    assert.equal(crashed.code, 9);

    const afterCrash = new DatabaseSync(databasePath);
    const columns = afterCrash.prepare("PRAGMA table_info(workspaces)").all();
    if (columns.some((column) => column.name === "checksum")) {
      assert.equal(
        afterCrash.prepare("SELECT COUNT(*) AS n FROM workspaces WHERE checksum IS NOT NULL").get().n,
        0,
        "A killed backfill must not leave partially checksummed rows",
      );
    }
    afterCrash.close();

    const resumed = new LocalSqliteWorkspaceStore({ storeRoot });
    assert.equal((await resumed.initialize()).workspaceCount, 2);
    const verified = new DatabaseSync(databasePath);
    assert.equal(
      verified.prepare("SELECT COUNT(*) AS n FROM workspaces WHERE checksum IS NULL OR checksum = ''").get().n,
      0,
    );
    verified.close();
    await resumed.close();
    fs.rmSync(storeRoot, { recursive: true, force: true });
  });

  await check("durable record identity prevents CAS filename and SQLite row substitution", async () => {
    const casRoot = path.join(spikeRoot, ".test-state", "cas-identity-binding");
    fs.rmSync(casRoot, { recursive: true, force: true });
    const cas = new LocalCasWorkspaceStore({ storeRoot: casRoot });
    await cas.initialize();
    const casWorkspace = createSyntheticWorkspace({ seed: "cas-identity-source" });
    const replacementId = "syn-ws-cas-identity-replacement";
    await cas.createWorkspace(casWorkspace);
    cas.injectIdentitySubstitution(casWorkspace.workspaceId, replacementId);
    await assert.rejects(
      cas.readWorkspace(replacementId),
      (error) => error.code === "store_corrupt" && /filename/.test(error.message),
    );
    await cas.close();

    const sqliteRoot = path.join(spikeRoot, ".test-state", "sqlite-identity-binding");
    fs.rmSync(sqliteRoot, { recursive: true, force: true });
    const sqlite = new LocalSqliteWorkspaceStore({ storeRoot: sqliteRoot });
    await sqlite.initialize();
    const sqliteWorkspace = createSyntheticWorkspace({ seed: "sqlite-identity-source" });
    await sqlite.createWorkspace(sqliteWorkspace);
    sqlite.injectIdentitySubstitution(
      sqliteWorkspace.workspaceId,
      "syn-ws-sqlite-identity-replacement",
    );
    await assert.rejects(
      sqlite.readWorkspace(sqliteWorkspace.workspaceId),
      (error) => error.code === "store_corrupt" && /database key/.test(error.message),
    );
    await sqlite.close();
    fs.rmSync(casRoot, { recursive: true, force: true });
    fs.rmSync(sqliteRoot, { recursive: true, force: true });
  });
  const owned = {
    kind: "synthetic-ref",
    id: "syn-resource-1",
    runId: config.runId,
    ownershipMarker: config.sandbox.ownershipMarker,
  };
  manifest.record(owned);
  assert.equal(manifest.authorize(owned), true);
  manifest.markCleaned(owned);
  assert.equal(manifest.authorize(owned), false);
  assert.throws(() => manifest.markCleaned(owned), /Refusing cleanup/);
});

await check("reference self-test writes raw and Markdown outcomes", async () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "tippani-s0-"));
  try {
    const { run, artifacts } = await runHarness({ config, outputDir });
    assert(run.results.length > 0);
    assert(run.results.every((result) => result.status !== "Fail"));
    assert(
      run.results
        .filter((result) => result.status === "Incomplete")
        .every((result) => typeof result.reason === "string" && result.reason.length > 0),
    );
    assert.equal(run.syntheticData, true);
    assert(fs.existsSync(artifacts.rawPath));
    assert(fs.existsSync(artifacts.reportPath));
    assert(fs.readFileSync(artifacts.reportPath, "utf8").includes("Scenario results"));
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

await check("report discloses unexecuted catalog coverage", async () => {
  const { run } = await runHarness({
    config,
    scenarioIds: ["S0-ATM-001"],
    writeArtifacts: false,
  });
  const report = renderOutcomeReport(run);
  assert(report.includes("## Coverage"));
  assert(report.includes(`Executed 1 of ${SCENARIOS.length} catalog scenarios`));
  assert(report.includes("An unexecuted absolute gate is missing evidence, not a pass."));
  assert(report.includes("**Recommendation:** Incomplete"));
});

await check("eligibility is never Yes while an absolute gate is unexecuted", async () => {
  const { run } = await runHarness({
    config,
    scenarioIds: ["S0-ATM-001"],
    writeArtifacts: false,
  });
  const gates = gateSummary(run);
  assert.notEqual(gates.eligible, "Yes");
  assert.equal(gates.eligible, "Incomplete");
  assert(gates.missing.length > 0, "Unexecuted absolute gates must be counted as missing");
  assert.equal(gates.failed.length, 0);
});

await check("eligibility is No on a failed gate and Yes only when every gate passed", async () => {
  const catalog = [
    { id: "S0-ATM-001", criterionType: "absolute", title: "a" },
    { id: "S0-ATM-002", criterionType: "absolute", title: "b" },
  ];
  const allPass = {
    catalog,
    results: catalog.map((s) => ({ scenarioId: s.id, criterionType: "absolute", status: "Pass" })),
  };
  assert.equal(gateSummary(allPass).eligible, "Yes");

  const oneFailed = {
    catalog,
    results: [
      { scenarioId: "S0-ATM-001", criterionType: "absolute", status: "Fail" },
      { scenarioId: "S0-ATM-002", criterionType: "absolute", status: "Pass" },
    ],
  };
  assert.equal(gateSummary(oneFailed).eligible, "No");

  const oneIncomplete = {
    catalog,
    results: [
      { scenarioId: "S0-ATM-001", criterionType: "absolute", status: "Pass" },
      { scenarioId: "S0-ATM-002", criterionType: "absolute", status: "Incomplete" },
    ],
  };
  assert.equal(gateSummary(oneIncomplete).eligible, "Incomplete");
});

await check("a reviewer-approved N/A gate is not-applicable, not unresolved, and does not block eligibility", () => {
  const catalog = [
    { id: "S0-ATM-001", criterionType: "absolute", title: "a" },
    { id: "S0-REC-002", criterionType: "absolute", title: "stale lock recovery" },
  ];
  const withNa = {
    catalog,
    results: [
      { scenarioId: "S0-ATM-001", criterionType: "absolute", status: "Pass" },
      {
        scenarioId: "S0-REC-002",
        criterionType: "absolute",
        status: "N/A",
        reason: "contract",
        contractRationale: {
          scenarioId: "S0-REC-002",
          rationale: "This scenario form is replaced by an independently verified engine journal.",
        },
        approval: {
          approver: "Synthetic Independent Reviewer",
          approvedAt: "2026-09-03T20:00:00.000Z",
          reference: "syn-review-91",
        },
      },
    ],
  };
  const gates = gateSummary(withNa);
  assert.equal(gates.na.length, 1);
  assert.equal(gates.notApplicable.length, 0);
  assert.equal(gates.unresolved.length, 0);
  assert.equal(gates.eligible, "Yes");
});

await check("an unstructured N/A is incomplete and blocks eligibility", () => {
  const run = {
    catalog: [{ id: "S0-REC-002", criterionType: "absolute", title: "stale lock recovery" }],
    results: [{ scenarioId: "S0-REC-002", status: "N/A", reason: "unreviewed" }],
  };
  const gates = gateSummary(run);
  assert.equal(gates.na.length, 0);
  assert.equal(gates.invalidNa.length, 1);
  assert.equal(gates.unresolved[0].status, "Incomplete");
  assert.equal(gates.eligible, "Incomplete");
});

await check("an approved N/A without a scenario-specific rationale remains incomplete", () => {
  const run = {
    catalog: [{ id: "S0-REC-002", criterionType: "absolute", title: "stale lock recovery" }],
    results: [{
      scenarioId: "S0-REC-002",
      status: "N/A",
      reason: "generic exception",
      approval: {
        approver: "Synthetic Independent Reviewer",
        approvedAt: "2026-09-03T20:00:00.000Z",
        reference: "syn-review-91",
      },
    }],
  };
  const gates = gateSummary(run);
  assert.equal(gates.eligible, "Incomplete");
  assert.match(gates.unresolved[0].reason, /scenario-specific contract rationale/);
});

await check("corrected local SQLite gates report checksum coverage, real migration kill, and known limitations", async () => {
  const sqliteConfig = JSON.parse(fs.readFileSync(
    path.join(spikeRoot, "config", "local-sqlite.json"),
    "utf8",
  ));
  const { run } = await runHarness({
    config: sqliteConfig,
    scenarioIds: ["S0-CON-003", "S0-CRS-003", "S0-COR-001", "S0-PER-001", "S0-PER-003"],
    writeArtifacts: false,
  });
  const byId = new Map(run.results.map((result) => [result.scenarioId, result]));
  assert.equal(byId.get("S0-CON-003").status, "Fail");
  assert.equal(byId.get("S0-CON-003").error.code, "global_write_serialization");
  assert.equal(byId.get("S0-CRS-003").status, "Pass");
  assert.equal(byId.get("S0-CRS-003").evidence.operation, "migration");
  assert.equal(byId.get("S0-COR-001").status, "Pass");
  assert.equal(byId.get("S0-COR-001").evidence.validJsonChecksumTamperRejected, true);
  assert.equal(byId.get("S0-PER-001").status, "Incomplete");
  assert.equal(byId.get("S0-PER-003").status, "Incomplete");
});

await check("gates assigned to another configuration are Not applicable, not missing", () => {
  const catalog = [
    { id: "S0-ATM-001", criterionType: "absolute", title: "local" },
    { id: "S0-COL-002", criterionType: "absolute", title: "provider" },
  ];
  const run = {
    applicableScenarioIds: ["S0-ATM-001"],
    catalog,
    results: [{ scenarioId: "S0-ATM-001", criterionType: "absolute", status: "Pass" }],
  };
  const gates = gateSummary(run);
  assert.equal(gates.eligible, "Yes");
  assert.equal(gates.missing.length, 0);
  assert.deepEqual(gates.notApplicable.map((item) => item.id), ["S0-COL-002"]);
});

console.log(`s0-persistence-harness: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
