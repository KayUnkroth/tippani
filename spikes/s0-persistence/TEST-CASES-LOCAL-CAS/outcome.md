# S0 Outcome: CFG-LOCAL-CAS

**Report date:** 2026-09-21
**Harness revision:** s0-harness-v4
**Source revision:** sha256:eef1ed728c3c3078e27ef025e9b45076598359a50acd09196acb4636720b9167
**Catalog revision:** sha256:a2d4052f88cde758aff0bccf62bebd380907b935259f9571dd8f1646740723e7
**Applicability revision:** sha256:7d9b94e9ea7e7f38893230577d6b5aa26ab141e96e3d430244ec51f8c5849b4d
**Configuration revision:** sha256:e6ba61cd91868ba2e15149aedcfdc26ab3c9e06c630bd75c404d76495899582b
**Configuration ID:** CFG-LOCAL-CAS
**Adapter:** local-cas
**Authoritative backing path:** local
**Dataset scale:** small
**Recommendation:** Proceed to architecture-mapping evaluation
**Applicable absolute gates:** 32
**Eligibility:** Yes

## Coverage

Executed 36 of 58 catalog scenarios. 36 apply to this configuration; 0 applicable absolute gates were not executed.

| Outcome class | Count | Meaning |
|---|---:|---|
| Pass | 34 | Executed and satisfied |
| Fail | 0 | Executed and violated |
| Blocked | 0 | Applicable, but a prerequisite is unavailable |
| Incomplete | 2 | Applicable implementation or evidence is incomplete |
| N/A | 0 | Scenario-specific contract rationale plus approver identity, approval date, and reference |
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
| Temporary store root | tippani-s0-s0-local-cas-windows-IdpprY |
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
| Applicability profile | local-cas |
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
| Ownership marker | `tippani-s0:s0-local-cas-windows` |
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
| `S0-ATM-001` | absolute | Pass | 71.524 | generation=1; updatedPartitions=4 | [JSON](raw-results.json) |
| `S0-ATM-002` | absolute | Pass | 77.548 | aliasResolved=true; generation=1 | [JSON](raw-results.json) |
| `S0-ATM-003` | absolute | Pass | 70.440 | previousGenerationPreserved=true; danglingAlias=false | [JSON](raw-results.json) |
| `S0-CON-001` | absolute | Pass | 287.098 | processes=2; winners=1; staleConflicts=1; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-CON-002` | absolute | Pass | 371.716 | processes=4; winners=1; staleConflicts=3; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-CON-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CON-004` | absolute | Pass | 69.935 | frozenRevision=1; preservedRevision=2 | [JSON](raw-results.json) |
| `S0-CON-005` | absolute | Pass | 388.519 | processes=3; winners=1; staleConflicts=2; durableGeneration=1; boundedContention=true | [JSON](raw-results.json) |
| `S0-JRN-001` | absolute | Pass | 51.450 | journalStatus=planned; tupleCount=1 | [JSON](raw-results.json) |
| `S0-JRN-002` | absolute | Pass | 46.405 | rejectedBeforeCommit=true | [JSON](raw-results.json) |
| `S0-CRS-001` | absolute | Pass | 407.249 | killedBeforeCommitGeneration=0; killedAfterCommitGeneration=1; lostResponseRecovered=true | [JSON](raw-results.json) |
| `S0-CRS-002` | absolute | Pass | 238.286 | partialAliasVisible=false; killedProcess=true; mechanism=process-kill | [JSON](raw-results.json) |
| `S0-CRS-003` | absolute | Pass | 210.421 | operation=migration; killedProcess=true; killPoint=before-migration-commit; resumedUnambiguously=true; mechanism=process-kill | [JSON](raw-results.json) |
| `S0-COL-001` | absolute | Pass | 357.109 | processes=3; winners=1; staleConflicts=2; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-COL-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Pass | 481.879 | commits=5; strayTempFiles=0; durableGeneration=5; tornReplaceKilled=true; previousGenerationIntact=true | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-006` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COR-001` | absolute | Pass | 84.350 | typedCorruptionFailure=true; truncatedJsonRejected=true; validJsonChecksumTamperRejected=true; damagedStatePreserved=true | [JSON](raw-results.json) |
| `S0-COR-002` | absolute | Pass | 89.674 | concurrentDistinctWorkspaces=2; aliasWinners=1; aliasConflicts=1; unambiguousResolution=true; partialRestoreVisible=false | [JSON](raw-results.json) |
| `S0-COR-003` | absolute | Pass | 24.232 | unsupportedVersionFailedClosed=true | [JSON](raw-results.json) |
| `S0-COR-004` | absolute | Pass | 45.160 | permissionErrorFailedClosed=true; treatedAsAbsent=false | [JSON](raw-results.json) |
| `S0-HYD-001` | absolute | Pass | 81.995 | enumeratedWorkspaces=3 | [JSON](raw-results.json) |
| `S0-HYD-002` | absolute | Pass | 95.813 | exactRehydration=true; generation=1 | [JSON](raw-results.json) |
| `S0-HYD-003` | absolute | Pass | 127.212 | surfacedBeforeMutation=true; reconciledThenAccepted=true | [JSON](raw-results.json) |
| `S0-MIG-001` | absolute | Pass | 58.899 | migrated=1; idempotentSecondRun=true; generationPreserved=2 | [JSON](raw-results.json) |
| `S0-MIG-002` | absolute | Pass | 69.014 | rolledBackOnInterrupt=true; resumedToComplete=true | [JSON](raw-results.json) |
| `S0-MIG-003` | absolute | Pass | 34.556 | failedClosedOnUnsupported=true; sourcePreserved=true | [JSON](raw-results.json) |
| `S0-MIG-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Pass | 43.471 | receiptIssued=true; generation=0 | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Pass | 54.842 | corruptRejected=true; incompleteRejected=true; duplicateRejected=true | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Pass | 45.569 | workspaceCount=1; knownGeneration=0 | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Pass | 80.859 | exactRestore=true; corruptBackupRejected=true | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Pass | 193.576 | restartedInSeparateProcess=true; generation=1; selectionRecovered=true | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Pass | 261.670 | orphanedLockObserved=true; recoveredGeneration=1 | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Pass | 49.772 | identifiesWorkspace=true; leaksBody=false; leaksSecret=false | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.380 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Incomplete | 0.057 | S0-PER-001 is incomplete: the current harness initializes an empty store inside the measuring process instead of reopening and fully enumerating a populated multi-workspace scale fixture in a fresh process. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Pass | 3830.753 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; repetitions_small=40; repetitions_medium=20; repetitions_stress=8 | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Incomplete | 0.134 | S0-PER-003 is incomplete: memory was not measured and store-size divided by backup payload size is not write amplification. The gate requires storage-layer bytes written plus fresh-process memory, backup, restore, and footprint measurements. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.253 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=1; implementation=3; test=3; migration=2; deployment=1; maintenance=3; diagnostics=3; recovery=3; rationale={"dependencies":"Built-in filesystem and crypto APIs","implementation":"Envelope, alias index, lock ownership, fsync, and atomic replace","test":"Filesystem race, process-kill, torn-replace, corruption, and backup fixtures","migration":"Envelope migration with explicit original preservation","deployment":"No service, credential, or external package","maintenance":"Filesystem and platform-specific durability behavior","diagnostics":"Envelope, index, lock, and temp-file diagnostics","recovery":"Stale-lock, temp-file, index rebuild, and replace recovery"}; total=19; mean=2.375 | [JSON](raw-results.json) |

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
| `S0-CON-005` | contentionCompletionMs | 388.235 | ms |
| `S0-PER-002` | openByAliasMinMs_small | 10.173 | ms |
| `S0-PER-002` | openByAliasP50Ms_small | 14.701 | ms |
| `S0-PER-002` | openByAliasP95Ms_small | 18.914 | ms |
| `S0-PER-002` | openByAliasMaxMs_small | 20.687 | ms |
| `S0-PER-002` | openByAliasMeanMs_small | 14.946 | ms |
| `S0-PER-002` | openByAliasStdDevMs_small | 2.459 | ms |
| `S0-PER-002` | mutationMinMs_small | 12.166 | ms |
| `S0-PER-002` | mutationP50Ms_small | 16.828 | ms |
| `S0-PER-002` | mutationP95Ms_small | 21.614 | ms |
| `S0-PER-002` | mutationMaxMs_small | 42.487 | ms |
| `S0-PER-002` | mutationMeanMs_small | 17.545 | ms |
| `S0-PER-002` | mutationStdDevMs_small | 4.781 | ms |
| `S0-PER-002` | conflictMinMs_small | 7.968 | ms |
| `S0-PER-002` | conflictP50Ms_small | 12.324 | ms |
| `S0-PER-002` | conflictP95Ms_small | 16.457 | ms |
| `S0-PER-002` | conflictMaxMs_small | 17.836 | ms |
| `S0-PER-002` | conflictMeanMs_small | 12.860 | ms |
| `S0-PER-002` | conflictStdDevMs_small | 2.367 | ms |
| `S0-PER-002` | openByAliasMinMs_medium | 12.684 | ms |
| `S0-PER-002` | openByAliasP50Ms_medium | 17.019 | ms |
| `S0-PER-002` | openByAliasP95Ms_medium | 20.217 | ms |
| `S0-PER-002` | openByAliasMaxMs_medium | 21.508 | ms |
| `S0-PER-002` | openByAliasMeanMs_medium | 17.009 | ms |
| `S0-PER-002` | openByAliasStdDevMs_medium | 2.228 | ms |
| `S0-PER-002` | mutationMinMs_medium | 12.084 | ms |
| `S0-PER-002` | mutationP50Ms_medium | 18.186 | ms |
| `S0-PER-002` | mutationP95Ms_medium | 22.350 | ms |
| `S0-PER-002` | mutationMaxMs_medium | 22.376 | ms |
| `S0-PER-002` | mutationMeanMs_medium | 17.982 | ms |
| `S0-PER-002` | mutationStdDevMs_medium | 3.027 | ms |
| `S0-PER-002` | conflictMinMs_medium | 9.600 | ms |
| `S0-PER-002` | conflictP50Ms_medium | 14.245 | ms |
| `S0-PER-002` | conflictP95Ms_medium | 16.657 | ms |
| `S0-PER-002` | conflictMaxMs_medium | 17.903 | ms |
| `S0-PER-002` | conflictMeanMs_medium | 13.920 | ms |
| `S0-PER-002` | conflictStdDevMs_medium | 2.351 | ms |
| `S0-PER-002` | openByAliasMinMs_stress | 25.122 | ms |
| `S0-PER-002` | openByAliasP50Ms_stress | 28.460 | ms |
| `S0-PER-002` | openByAliasP95Ms_stress | 38.301 | ms |
| `S0-PER-002` | openByAliasMaxMs_stress | 38.301 | ms |
| `S0-PER-002` | openByAliasMeanMs_stress | 30.478 | ms |
| `S0-PER-002` | openByAliasStdDevMs_stress | 4.276 | ms |
| `S0-PER-002` | mutationMinMs_stress | 28.551 | ms |
| `S0-PER-002` | mutationP50Ms_stress | 32.735 | ms |
| `S0-PER-002` | mutationP95Ms_stress | 38.727 | ms |
| `S0-PER-002` | mutationMaxMs_stress | 38.727 | ms |
| `S0-PER-002` | mutationMeanMs_stress | 32.905 | ms |
| `S0-PER-002` | mutationStdDevMs_stress | 3.118 | ms |
| `S0-PER-002` | conflictMinMs_stress | 17.425 | ms |
| `S0-PER-002` | conflictP50Ms_stress | 19.967 | ms |
| `S0-PER-002` | conflictP95Ms_stress | 27.088 | ms |
| `S0-PER-002` | conflictMaxMs_stress | 27.088 | ms |
| `S0-PER-002` | conflictMeanMs_stress | 21.345 | ms |
| `S0-PER-002` | conflictStdDevMs_stress | 2.819 | ms |

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
