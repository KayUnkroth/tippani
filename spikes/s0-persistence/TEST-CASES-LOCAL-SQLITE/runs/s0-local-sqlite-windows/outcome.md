# S0 Outcome: CFG-LOCAL-SQLITE

**Report date:** 2026-09-20
**Harness revision:** s0-harness-v4
**Source revision:** sha256:193085e84b603e45f4d00c97b049412f3078a053d43ae8f1315fba149da89998
**Catalog revision:** sha256:a2d4052f88cde758aff0bccf62bebd380907b935259f9571dd8f1646740723e7
**Applicability revision:** sha256:7d9b94e9ea7e7f38893230577d6b5aa26ab141e96e3d430244ec51f8c5849b4d
**Configuration revision:** sha256:3be7a9aaca94ba375c0faaea685f136fe2a73d6621f2c42f75ae51adebe8b508
**Configuration ID:** CFG-LOCAL-SQLITE
**Adapter:** local-sqlite
**Authoritative backing path:** local
**Dataset scale:** small
**Recommendation:** Proceed to architecture-mapping evaluation
**Applicable absolute gates:** 32
**Eligibility:** Yes

## Coverage

Executed 36 of 58 catalog scenarios. 36 apply to this configuration; 0 applicable absolute gates were not executed.

| Outcome class | Count | Meaning |
|---|---:|---|
| Pass | 33 | Executed and satisfied |
| Fail | 0 | Executed and violated |
| Blocked | 0 | Applicable, but a prerequisite is unavailable |
| Incomplete | 2 | Applicable implementation or evidence is incomplete |
| N/A | 1 | Scenario-specific contract rationale plus approver identity, approval date, and reference |
| Not applicable | 22 | Assigned to another configuration by design |
| Not executed | 0 | Applicable, but no result exists |

## Configuration and environment

| Dimension | Value |
|---|---|
| OS | linux 6.8.0-1064-azure |
| Architecture | x64 |
| CPU | AMD EPYC 7763 64-Core Processor |
| Logical CPUs | 16 |
| Total memory | 67424985088 bytes |
| Runtime | Node 22.23.2 |
| Provider/API version | N/A |
| Configured platform/filesystem | windows-ntfs |
| Detected filesystem | Not recorded |
| Temporary store root | tippani-s0-s0-local-sqlite-windows-dJPN7m |
| Network characteristics | Not recorded |
| Provider region | Not recorded |
| Storage characteristics | Not recorded |
| Sync-client state | Not applicable |
| Repository protections | Not recorded |
| Dependency versions | node=22.23.2; sqlite=3.51.3 |
| Workload mix | scenario-defined deterministic small/medium/stress fixtures |
| Known limitations | None recorded |
| Process topology | Independent OS child processes for concurrency and kill tests |
| Dataset scale | small |
| Applicability profile | local-sqlite |
| Store namespace | — |
| Authentication setup | Synthetic Local Harness |
| Cleanup manifest | — |
| Cleanup manifest artifact | — |
| Cleanup manifest digest | — |
| Cleanup expiry | — |
| Effective target hash | — |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `tippani-s0:s0-local-sqlite-windows` |
| Operation budget | 100 |
| Duration budget | 300000 ms |
| Object budget | 10000 |
| Storage/transfer budget | 104857600 bytes |
| Final metered operations | 0 |
| Final metered objects | 0 |
| Final metered bytes | 0 |
| Cleanup requests/retries/bytes | {} |
| Declared provider operations | [] |
| Timer | `performance.now()` monotonic elapsed time |
| Performance statistics | Minimum, p50, p95, maximum, mean, sample variability |
| Raw evidence | [raw-results.json](raw-results.json) |
| Redacted preflight | [preflight.json](preflight.json) |

## Scenario results

| Scenario ID | Type | Applicability/result | Duration (ms) | Evidence / reason | Raw |
|---|---|---|---:|---|---|
| `S0-ATM-001` | absolute | Pass | 10.702 | generation=1; updatedPartitions=4 | [JSON](raw-results.json) |
| `S0-ATM-002` | absolute | Pass | 6.080 | aliasResolved=true; generation=1 | [JSON](raw-results.json) |
| `S0-ATM-003` | absolute | Pass | 6.304 | previousGenerationPreserved=true; danglingAlias=false | [JSON](raw-results.json) |
| `S0-CON-001` | absolute | Pass | 71.146 | processes=2; winners=1; staleConflicts=1; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-CON-002` | absolute | Pass | 90.429 | processes=4; winners=1; staleConflicts=3; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-CON-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CON-004` | absolute | Pass | 6.689 | frozenRevision=1; preservedRevision=2 | [JSON](raw-results.json) |
| `S0-CON-005` | absolute | Pass | 77.348 | processes=3; winners=1; staleConflicts=2; durableGeneration=1; boundedContention=true | [JSON](raw-results.json) |
| `S0-JRN-001` | absolute | Pass | 6.012 | journalStatus=planned; tupleCount=1 | [JSON](raw-results.json) |
| `S0-JRN-002` | absolute | Pass | 8.228 | rejectedBeforeCommit=true | [JSON](raw-results.json) |
| `S0-CRS-001` | absolute | Pass | 116.463 | killedBeforeCommitGeneration=0; killedAfterCommitGeneration=1; lostResponseRecovered=true | [JSON](raw-results.json) |
| `S0-CRS-002` | absolute | Pass | 59.006 | partialAliasVisible=false; killedProcess=true; mechanism=process-kill | [JSON](raw-results.json) |
| `S0-CRS-003` | absolute | Pass | 64.460 | operation=migration; killedProcess=true; killPoint=before-migration-commit; resumedUnambiguously=true; mechanism=process-kill | [JSON](raw-results.json) |
| `S0-COL-001` | absolute | Pass | 77.423 | processes=3; winners=1; staleConflicts=2; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-COL-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Pass | 61.506 | commits=5; strayTempFiles=0; durableGeneration=5 | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-006` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COR-001` | absolute | Pass | 11.411 | typedCorruptionFailure=true; truncatedJsonRejected=true; validJsonChecksumTamperRejected=true; damagedStatePreserved=true | [JSON](raw-results.json) |
| `S0-COR-002` | absolute | Pass | 6.249 | concurrentDistinctWorkspaces=2; aliasWinners=1; aliasConflicts=1; unambiguousResolution=true; partialRestoreVisible=false | [JSON](raw-results.json) |
| `S0-COR-003` | absolute | Pass | 4.177 | unsupportedVersionFailedClosed=true | [JSON](raw-results.json) |
| `S0-COR-004` | absolute | Pass | 4.643 | permissionErrorFailedClosed=true; treatedAsAbsent=false | [JSON](raw-results.json) |
| `S0-HYD-001` | absolute | Pass | 6.255 | enumeratedWorkspaces=3 | [JSON](raw-results.json) |
| `S0-HYD-002` | absolute | Pass | 10.889 | exactRehydration=true; generation=1 | [JSON](raw-results.json) |
| `S0-HYD-003` | absolute | Pass | 7.292 | surfacedBeforeMutation=true; reconciledThenAccepted=true | [JSON](raw-results.json) |
| `S0-MIG-001` | absolute | Pass | 5.669 | migrated=1; idempotentSecondRun=true; generationPreserved=2 | [JSON](raw-results.json) |
| `S0-MIG-002` | absolute | Pass | 6.315 | rolledBackOnInterrupt=true; resumedToComplete=true | [JSON](raw-results.json) |
| `S0-MIG-003` | absolute | Pass | 5.078 | failedClosedOnUnsupported=true; sourcePreserved=true | [JSON](raw-results.json) |
| `S0-MIG-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Pass | 5.428 | receiptIssued=true; generation=0 | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Pass | 5.899 | corruptRejected=true; incompleteRejected=true; duplicateRejected=true | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Pass | 5.262 | workspaceCount=1; knownGeneration=0 | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Pass | 10.376 | exactRestore=true; corruptBackupRejected=true | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Pass | 60.928 | restartedInSeparateProcess=true; generation=1; selectionRecovered=true | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | N/A | 0.221 | contractRationale={"scenarioId":"S0-REC-002","rationale":"SQLite owns locking internally and recovers interrupted writers through its transaction journal and WAL on open, so the external stale-lock-file scenario form does not apply."}; approval={"approver":"S0 decision owner","approvedAt":"2026-09-20T00:00:00.000Z","reference":"REVISION-PLAN.md#local-sqlite-applicability-decision"} | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Pass | 6.582 | identifiesWorkspace=true; leaksBody=false; leaksSecret=false | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.389 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Incomplete | 0.047 | S0-PER-001 is incomplete: the current harness initializes an empty store inside the measuring process instead of reopening and fully enumerating a populated multi-workspace scale fixture in a fresh process. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Pass | 274.301 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; repetitions_small=40; repetitions_medium=20; repetitions_stress=8 | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Incomplete | 0.077 | S0-PER-003 is incomplete: memory was not measured and store-size divided by backup payload size is not write amplification. The gate requires storage-layer bytes written plus fresh-process memory, backup, restore, and footprint measurements. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.166 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=1; implementation=2; test=2; migration=2; deployment=1; maintenance=2; diagnostics=2; recovery=2; rationale={"dependencies":"Built-in node:sqlite API","implementation":"One built-in node:sqlite database with transactional rows and WAL","test":"Transaction, process-kill, corruption, migration, and backup fixtures","migration":"Schema migration inside database transactions","deployment":"No service, credential, or native package","maintenance":"One built-in database API","diagnostics":"Database health, schema, and workspace diagnostics","recovery":"SQLite transaction journal and WAL recovery"}; total=14; mean=1.75 | [JSON](raw-results.json) |

## Correctness summary

| Criterion | Outcome |
|---|---|
| Atomicity and concurrency | Pass |
| Collaboration | Pass |
| Crash and operational recovery | Pass |
| Corruption and rehydration | Pass |
| Migration and import | Pass |
| Backup and restore | Pass |
| Safety and security | Pass |

## Measurements

| Scenario ID | Metric | Value | Unit |
|---|---|---:|---|
| `S0-CON-005` | contentionCompletionMs | 77.178 | ms |
| `S0-PER-002` | openByAliasMinMs_small | 0.082 | ms |
| `S0-PER-002` | openByAliasP50Ms_small | 0.093 | ms |
| `S0-PER-002` | openByAliasP95Ms_small | 0.115 | ms |
| `S0-PER-002` | openByAliasMaxMs_small | 0.149 | ms |
| `S0-PER-002` | openByAliasMeanMs_small | 0.095 | ms |
| `S0-PER-002` | openByAliasStdDevMs_small | 0.013 | ms |
| `S0-PER-002` | mutationMinMs_small | 0.575 | ms |
| `S0-PER-002` | mutationP50Ms_small | 0.652 | ms |
| `S0-PER-002` | mutationP95Ms_small | 0.877 | ms |
| `S0-PER-002` | mutationMaxMs_small | 1.364 | ms |
| `S0-PER-002` | mutationMeanMs_small | 0.703 | ms |
| `S0-PER-002` | mutationStdDevMs_small | 0.137 | ms |
| `S0-PER-002` | conflictMinMs_small | 0.120 | ms |
| `S0-PER-002` | conflictP50Ms_small | 0.136 | ms |
| `S0-PER-002` | conflictP95Ms_small | 0.158 | ms |
| `S0-PER-002` | conflictMaxMs_small | 0.233 | ms |
| `S0-PER-002` | conflictMeanMs_small | 0.138 | ms |
| `S0-PER-002` | conflictStdDevMs_small | 0.018 | ms |
| `S0-PER-002` | openByAliasMinMs_medium | 0.185 | ms |
| `S0-PER-002` | openByAliasP50Ms_medium | 0.189 | ms |
| `S0-PER-002` | openByAliasP95Ms_medium | 0.237 | ms |
| `S0-PER-002` | openByAliasMaxMs_medium | 0.249 | ms |
| `S0-PER-002` | openByAliasMeanMs_medium | 0.200 | ms |
| `S0-PER-002` | openByAliasStdDevMs_medium | 0.020 | ms |
| `S0-PER-002` | mutationMinMs_medium | 0.981 | ms |
| `S0-PER-002` | mutationP50Ms_medium | 1.117 | ms |
| `S0-PER-002` | mutationP95Ms_medium | 1.545 | ms |
| `S0-PER-002` | mutationMaxMs_medium | 1.854 | ms |
| `S0-PER-002` | mutationMeanMs_medium | 1.198 | ms |
| `S0-PER-002` | mutationStdDevMs_medium | 0.203 | ms |
| `S0-PER-002` | conflictMinMs_medium | 0.226 | ms |
| `S0-PER-002` | conflictP50Ms_medium | 0.239 | ms |
| `S0-PER-002` | conflictP95Ms_medium | 0.342 | ms |
| `S0-PER-002` | conflictMaxMs_medium | 0.638 | ms |
| `S0-PER-002` | conflictMeanMs_medium | 0.271 | ms |
| `S0-PER-002` | conflictStdDevMs_medium | 0.090 | ms |
| `S0-PER-002` | openByAliasMinMs_stress | 3.089 | ms |
| `S0-PER-002` | openByAliasP50Ms_stress | 3.280 | ms |
| `S0-PER-002` | openByAliasP95Ms_stress | 4.316 | ms |
| `S0-PER-002` | openByAliasMaxMs_stress | 4.316 | ms |
| `S0-PER-002` | openByAliasMeanMs_stress | 3.509 | ms |
| `S0-PER-002` | openByAliasStdDevMs_stress | 0.455 | ms |
| `S0-PER-002` | mutationMinMs_stress | 10.430 | ms |
| `S0-PER-002` | mutationP50Ms_stress | 11.732 | ms |
| `S0-PER-002` | mutationP95Ms_stress | 14.778 | ms |
| `S0-PER-002` | mutationMaxMs_stress | 14.778 | ms |
| `S0-PER-002` | mutationMeanMs_stress | 11.878 | ms |
| `S0-PER-002` | mutationStdDevMs_stress | 1.213 | ms |
| `S0-PER-002` | conflictMinMs_stress | 3.152 | ms |
| `S0-PER-002` | conflictP50Ms_stress | 3.405 | ms |
| `S0-PER-002` | conflictP95Ms_stress | 3.805 | ms |
| `S0-PER-002` | conflictMaxMs_stress | 3.805 | ms |
| `S0-PER-002` | conflictMeanMs_stress | 3.422 | ms |
| `S0-PER-002` | conflictStdDevMs_stress | 0.198 | ms |

## Failures and recovery

No scenario failures.

## Risks and required follow-up

| Gate | State | Owner | Evidence required |
|---|---|---|---|
| — | None | — | — |

## Configuration recommendation

This component may proceed into an architecture mapping. Relative evidence remains non-decisional until an entire mapping is eligible.

## Evidence

- [Raw machine-readable results](raw-results.json)
- [Redacted preflight](preflight.json)

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
