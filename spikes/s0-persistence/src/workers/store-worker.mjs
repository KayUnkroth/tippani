// Child process used for genuine cross-process evidence. In-process promises
// share one event loop and one store instance, which cannot demonstrate that a
// durable store is safe when independent OS processes (portal, MCP/Copilot,
// automation) write concurrently.
//
// Modes:
//   write         - wait for the release signal, then attempt one compare-and-swap
//   write-now     - attempt one compare-and-swap immediately
//   stale-reconcile - reject a stale write, reload, then commit on the new generation
//   observe       - poll until a target generation is visible
//   crash         - hard-exit at a named commit boundary during a mutation
//   migration-crash - hard-exit at a named boundary during a migration
//   read          - reopen the store and report durable state

import { createStore } from "../adapters/registry.mjs";
import { IpcOperationBudget, OperationBudget } from "../operation-budget.mjs";

function argOf(name, fallback = null) {
  const prefixed = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return prefixed ? prefixed.slice(name.length + 3) : fallback;
}

const mode = argOf("mode", "write");
const adapter = argOf("adapter");
const storeRoot = argOf("root");
const workspaceId = argOf("workspace");
const runId = argOf("run-id");
const providerLive = argOf("provider-live", "false") === "true";
const actor = argOf("actor", `Synthetic Worker ${process.pid}`);
const expectedGeneration = Number(argOf("expected", "0"));
const targetGeneration = Number(argOf("target", "1"));
const pollIntervalMs = Number(argOf("poll-ms", "100"));
const observationTimeoutMs = Number(argOf("observe-timeout-ms", "30000"));
const crashAt = argOf("crash-at", "before-commit");
const op = argOf("op", "audit");
const alias = argOf("alias", `syn-alias-crash-${process.pid}`);
const deadlineMs = Number(argOf("deadline-ms", "30000"));
const abortController = new AbortController();
const deadlineTimer = providerLive
  ? setTimeout(() => abortController.abort(), deadlineMs)
  : null;
deadlineTimer?.unref?.();
const safetyBudget = providerLive
  ? (process.send ? new IpcOperationBudget({
    signal: abortController.signal,
  }) : new OperationBudget({
    limits: {
      maxOperations: Number(argOf("max-operations", "100")),
      maxObjects: Number(argOf("max-objects", "10000")),
      maxBytes: Number(argOf("max-bytes", "104857600")),
      maxDurationMs: deadlineMs,
    },
    signal: abortController.signal,
  }))
  : null;

function report(payload) {
  process.stdout.write(`${JSON.stringify({ pid: process.pid, ...payload })}\n`);
}

function crashInjector() {
  // Exit without unwinding: no finally blocks, no lock release, no flush.
  return {
    hit(point) {
      if (point === crashAt) {
        report({ status: "crashing", at: point });
        process.exit(9);
      }
    },
  };
}

function crashOperation() {
  if (op === "add-alias") return { addAliases: [alias] };
  return { auditEvent: { actor, action: "crash-write" } };
}

async function waitForRelease() {
  if (!process.send) return;
  process.send({ ready: true });
  await new Promise((resolve) => {
    process.on("message", (message) => {
      if (message === "go") resolve();
    });
  });
}

if (mode === "budget-probe") {
  try {
    await waitForRelease();
    await safetyBudget.recordRequest("syn-budget-probe");
    report({ status: "budget-consumed" });
    process.exit(0);
  } catch (error) {
    report({ status: "error", code: error?.code, message: error?.message });
    process.exit(1);
  }
}

const store = createStore(adapter, {
  storeRoot,
  runId,
  ...(providerLive ? {
    dryRun: false,
    enforcePreflight: true,
    safetyBudget,
    signal: abortController.signal,
  } : {}),
});

if (mode === "checksum-backfill-crash") {
  await store.initialize({ faultInjector: crashInjector() });
  report({ status: "backfilled-unexpectedly" });
  process.exit(0);
}

await store.initialize();

try {
  if (mode === "read") {
    report({ status: "read", workspace: await store.readWorkspace(workspaceId) });
  } else if (mode === "crash") {
    await store.compareAndSwap({
      workspaceId,
      expectedGeneration,
      operation: crashOperation(),
      faultInjector: crashInjector(),
    });
    report({ status: "committed-unexpectedly" });
  } else if (mode === "migration-crash") {
    await store.migrate({ faultInjector: crashInjector() });
    report({ status: "migrated-unexpectedly" });
  } else if (mode === "stale-reconcile") {
    let conflict;
    try {
      await store.compareAndSwap({
        workspaceId,
        expectedGeneration,
        operation: { auditEvent: { actor, action: "stale-write" } },
      });
      throw new Error("Expected the stale provider write to conflict");
    } catch (error) {
      if (error?.code !== "generation_conflict") throw error;
      conflict = { expected: error.expectedGeneration, actual: error.actualGeneration };
    }
    const current = await store.readWorkspace(workspaceId);
    const next = await store.compareAndSwap({
      workspaceId,
      expectedGeneration: current.generation,
      operation: { auditEvent: { actor, action: "reconciled-write" } },
    });
    report({
      status: "reconciled",
      conflict,
      reloadedGeneration: current.generation,
      generation: next.generation,
      actor,
      telemetry: store.providerTelemetry?.(),
    });
  } else if (mode === "observe") {
    const startedAt = Date.now();
    let current;
    while (Date.now() - startedAt <= observationTimeoutMs) {
      current = await store.readWorkspace(workspaceId);
      if (current.generation >= targetGeneration) break;
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
    if (!current || current.generation < targetGeneration) {
      throw new Error(`Timed out waiting for generation ${targetGeneration}`);
    }
    report({
      status: "observed",
      generation: current.generation,
      discoveryMs: Date.now() - startedAt,
      actor,
      telemetry: store.providerTelemetry?.(),
    });
  } else {
    if (mode !== "write-now") await waitForRelease();
    const next = await store.compareAndSwap({
      workspaceId,
      expectedGeneration,
      operation: { auditEvent: { actor, action: "concurrent-write" } },
    });
    report({
      status: "committed",
      generation: next.generation,
      actor,
      telemetry: store.providerTelemetry?.(),
    });
  }
  await store.close();
  if (deadlineTimer) clearTimeout(deadlineTimer);
  process.exit(0);
} catch (error) {
  const conflict = error?.code === "generation_conflict";
  report({
    status: conflict ? "conflict" : "error",
    code: error?.code,
    message: error?.message,
  });
  try { await store.close(); } catch { /* best effort */ }
  if (deadlineTimer) clearTimeout(deadlineTimer);
  process.exit(conflict ? 0 : 1);
}
