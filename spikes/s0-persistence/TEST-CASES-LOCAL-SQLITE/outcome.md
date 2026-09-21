# S0 Outcome: CFG-LOCAL-SQLITE

**Report date:** 2026-09-21
**Harness revision:** s0-harness-v4
**Source revision:** sha256:eef1ed728c3c3078e27ef025e9b45076598359a50acd09196acb4636720b9167
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
| OS | win32 10.0.26200 |
| Architecture | x64 |
| CPU | Intel(R) Core(TM) Ultra 7 165H |
| Logical CPUs | 22 |
| Total memory | 33983225856 bytes |
| Runtime | Node 24.14.0 |
| Provider/API version | N/A |
| Configured platform/filesystem | windows-ntfs |
| Detected filesystem | Not recorded |
| Temporary store root | tippani-s0-s0-local-sqlite-windows-uTSWfd |
| Network characteristics | Not recorded |
| Provider region | Not recorded |
| Storage characteristics | Not recorded |
| Sync-client state | Not applicable |
| Repository protections | Not recorded |
| Dependency versions | node=24.14.0; sqlite=3.51.2 |
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
| `S0-ATM-001` | absolute | Pass | 25.848 | generation=1; updatedPartitions=4 | [JSON](raw-results.json) |
| `S0-ATM-002` | absolute | Pass | 16.108 | aliasResolved=true; generation=1 | [JSON](raw-results.json) |
| `S0-ATM-003` | absolute | Pass | 14.667 | previousGenerationPreserved=true; danglingAlias=false | [JSON](raw-results.json) |
| `S0-CON-001` | absolute | Pass | 180.934 | processes=2; winners=1; staleConflicts=1; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-CON-002` | absolute | Pass | 245.036 | processes=4; winners=1; staleConflicts=3; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-CON-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CON-004` | absolute | Pass | 11.396 | frozenRevision=1; preservedRevision=2 | [JSON](raw-results.json) |
| `S0-CON-005` | absolute | Pass | 201.129 | processes=3; winners=1; staleConflicts=2; durableGeneration=1; boundedContention=true | [JSON](raw-results.json) |
| `S0-JRN-001` | absolute | Pass | 14.260 | journalStatus=planned; tupleCount=1 | [JSON](raw-results.json) |
| `S0-JRN-002` | absolute | Pass | 11.030 | rejectedBeforeCommit=true | [JSON](raw-results.json) |
| `S0-CRS-001` | absolute | Pass | 274.666 | killedBeforeCommitGeneration=0; killedAfterCommitGeneration=1; lostResponseRecovered=true | [JSON](raw-results.json) |
| `S0-CRS-002` | absolute | Pass | 136.718 | partialAliasVisible=false; killedProcess=true; mechanism=process-kill | [JSON](raw-results.json) |
| `S0-CRS-003` | absolute | Pass | 144.761 | operation=migration; killedProcess=true; killPoint=before-migration-commit; resumedUnambiguously=true; mechanism=process-kill | [JSON](raw-results.json) |
| `S0-COL-001` | absolute | Pass | 204.117 | processes=3; winners=1; staleConflicts=2; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-COL-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Pass | 135.064 | commits=5; strayTempFiles=0; durableGeneration=5 | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-006` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COR-001` | absolute | Pass | 24.869 | typedCorruptionFailure=true; truncatedJsonRejected=true; validJsonChecksumTamperRejected=true; damagedStatePreserved=true | [JSON](raw-results.json) |
| `S0-COR-002` | absolute | Pass | 13.917 | concurrentDistinctWorkspaces=2; aliasWinners=1; aliasConflicts=1; unambiguousResolution=true; partialRestoreVisible=false | [JSON](raw-results.json) |
| `S0-COR-003` | absolute | Pass | 8.542 | unsupportedVersionFailedClosed=true | [JSON](raw-results.json) |
| `S0-COR-004` | absolute | Pass | 9.401 | permissionErrorFailedClosed=true; treatedAsAbsent=false | [JSON](raw-results.json) |
| `S0-HYD-001` | absolute | Pass | 9.882 | enumeratedWorkspaces=3 | [JSON](raw-results.json) |
| `S0-HYD-002` | absolute | Pass | 21.548 | exactRehydration=true; generation=1 | [JSON](raw-results.json) |
| `S0-HYD-003` | absolute | Pass | 13.162 | surfacedBeforeMutation=true; reconciledThenAccepted=true | [JSON](raw-results.json) |
| `S0-MIG-001` | absolute | Pass | 14.099 | migrated=1; idempotentSecondRun=true; generationPreserved=2 | [JSON](raw-results.json) |
| `S0-MIG-002` | absolute | Pass | 11.820 | rolledBackOnInterrupt=true; resumedToComplete=true | [JSON](raw-results.json) |
| `S0-MIG-003` | absolute | Pass | 11.020 | failedClosedOnUnsupported=true; sourcePreserved=true | [JSON](raw-results.json) |
| `S0-MIG-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Pass | 10.890 | receiptIssued=true; generation=0 | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Pass | 9.136 | corruptRejected=true; incompleteRejected=true; duplicateRejected=true | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Pass | 12.096 | workspaceCount=1; knownGeneration=0 | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Pass | 21.157 | exactRestore=true; corruptBackupRejected=true | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Pass | 126.796 | restartedInSeparateProcess=true; generation=1; selectionRecovered=true | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | N/A | 0.189 | contractRationale={"scenarioId":"S0-REC-002","rationale":"SQLite owns locking internally and recovers interrupted writers through its transaction journal and WAL on open, so the external stale-lock-file scenario form does not apply."}; approval={"approver":"S0 decision owner","approvedAt":"2026-09-20T00:00:00.000Z","reference":"REVISION-PLAN.md#local-sqlite-applicability-decision"} | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Pass | 13.244 | identifiesWorkspace=true; leaksBody=false; leaksSecret=false | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.396 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Incomplete | 0.043 | S0-PER-001 is incomplete: the current harness initializes an empty store inside the measuring process instead of reopening and fully enumerating a populated multi-workspace scale fixture in a fresh process. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Pass | 335.573 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; repetitions_small=40; repetitions_medium=20; repetitions_stress=8 | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Incomplete | 0.106 | S0-PER-003 is incomplete: memory was not measured and store-size divided by backup payload size is not write amplification. The gate requires storage-layer bytes written plus fresh-process memory, backup, restore, and footprint measurements. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.189 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=1; implementation=2; test=2; migration=2; deployment=1; maintenance=2; diagnostics=2; recovery=2; rationale={"dependencies":"Built-in node:sqlite API","implementation":"One built-in node:sqlite database with transactional rows and WAL","test":"Transaction, process-kill, corruption, migration, and backup fixtures","migration":"Schema migration inside database transactions","deployment":"No service, credential, or native package","maintenance":"One built-in database API","diagnostics":"Database health, schema, and workspace diagnostics","recovery":"SQLite transaction journal and WAL recovery"}; total=14; mean=1.75 | [JSON](raw-results.json) |

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
| `S0-CON-005` | contentionCompletionMs | 200.902 | ms |
| `S0-PER-002` | openByAliasMinMs_small | 0.066 | ms |
| `S0-PER-002` | openByAliasP50Ms_small | 0.089 | ms |
| `S0-PER-002` | openByAliasP95Ms_small | 0.407 | ms |
| `S0-PER-002` | openByAliasMaxMs_small | 1.094 | ms |
| `S0-PER-002` | openByAliasMeanMs_small | 0.146 | ms |
| `S0-PER-002` | openByAliasStdDevMs_small | 0.181 | ms |
| `S0-PER-002` | mutationMinMs_small | 0.643 | ms |
| `S0-PER-002` | mutationP50Ms_small | 0.810 | ms |
| `S0-PER-002` | mutationP95Ms_small | 1.092 | ms |
| `S0-PER-002` | mutationMaxMs_small | 1.289 | ms |
| `S0-PER-002` | mutationMeanMs_small | 0.831 | ms |
| `S0-PER-002` | mutationStdDevMs_small | 0.154 | ms |
| `S0-PER-002` | conflictMinMs_small | 0.126 | ms |
| `S0-PER-002` | conflictP50Ms_small | 0.162 | ms |
| `S0-PER-002` | conflictP95Ms_small | 0.274 | ms |
| `S0-PER-002` | conflictMaxMs_small | 0.330 | ms |
| `S0-PER-002` | conflictMeanMs_small | 0.185 | ms |
| `S0-PER-002` | conflictStdDevMs_small | 0.053 | ms |
| `S0-PER-002` | openByAliasMinMs_medium | 0.117 | ms |
| `S0-PER-002` | openByAliasP50Ms_medium | 0.169 | ms |
| `S0-PER-002` | openByAliasP95Ms_medium | 0.632 | ms |
| `S0-PER-002` | openByAliasMaxMs_medium | 0.835 | ms |
| `S0-PER-002` | openByAliasMeanMs_medium | 0.234 | ms |
| `S0-PER-002` | openByAliasStdDevMs_medium | 0.175 | ms |
| `S0-PER-002` | mutationMinMs_medium | 0.889 | ms |
| `S0-PER-002` | mutationP50Ms_medium | 1.173 | ms |
| `S0-PER-002` | mutationP95Ms_medium | 1.496 | ms |
| `S0-PER-002` | mutationMaxMs_medium | 1.573 | ms |
| `S0-PER-002` | mutationMeanMs_medium | 1.200 | ms |
| `S0-PER-002` | mutationStdDevMs_medium | 0.162 | ms |
| `S0-PER-002` | conflictMinMs_medium | 0.200 | ms |
| `S0-PER-002` | conflictP50Ms_medium | 0.247 | ms |
| `S0-PER-002` | conflictP95Ms_medium | 0.347 | ms |
| `S0-PER-002` | conflictMaxMs_medium | 0.443 | ms |
| `S0-PER-002` | conflictMeanMs_medium | 0.269 | ms |
| `S0-PER-002` | conflictStdDevMs_medium | 0.060 | ms |
| `S0-PER-002` | openByAliasMinMs_stress | 2.515 | ms |
| `S0-PER-002` | openByAliasP50Ms_stress | 3.656 | ms |
| `S0-PER-002` | openByAliasP95Ms_stress | 6.369 | ms |
| `S0-PER-002` | openByAliasMaxMs_stress | 6.369 | ms |
| `S0-PER-002` | openByAliasMeanMs_stress | 4.037 | ms |
| `S0-PER-002` | openByAliasStdDevMs_stress | 1.182 | ms |
| `S0-PER-002` | mutationMinMs_stress | 12.446 | ms |
| `S0-PER-002` | mutationP50Ms_stress | 13.881 | ms |
| `S0-PER-002` | mutationP95Ms_stress | 16.557 | ms |
| `S0-PER-002` | mutationMaxMs_stress | 16.557 | ms |
| `S0-PER-002` | mutationMeanMs_stress | 14.312 | ms |
| `S0-PER-002` | mutationStdDevMs_stress | 1.302 | ms |
| `S0-PER-002` | conflictMinMs_stress | 3.064 | ms |
| `S0-PER-002` | conflictP50Ms_stress | 4.150 | ms |
| `S0-PER-002` | conflictP95Ms_stress | 5.632 | ms |
| `S0-PER-002` | conflictMaxMs_stress | 5.632 | ms |
| `S0-PER-002` | conflictMeanMs_stress | 4.413 | ms |
| `S0-PER-002` | conflictStdDevMs_stress | 0.844 | ms |

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
