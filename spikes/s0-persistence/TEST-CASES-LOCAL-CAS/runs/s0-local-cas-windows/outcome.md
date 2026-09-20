# S0 Outcome: CFG-LOCAL-CAS

**Report date:** 2026-09-20
**Harness revision:** s0-harness-v4
**Source revision:** sha256:193085e84b603e45f4d00c97b049412f3078a053d43ae8f1315fba149da89998
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
| OS | linux 6.8.0-1064-azure |
| Architecture | x64 |
| CPU | AMD EPYC 7763 64-Core Processor |
| Logical CPUs | 16 |
| Total memory | 67424985088 bytes |
| Runtime | Node 22.23.2 |
| Provider/API version | N/A |
| Configured platform/filesystem | windows-ntfs |
| Detected filesystem | Not recorded |
| Temporary store root | tippani-s0-s0-local-cas-windows-DuM74q |
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
| `S0-ATM-001` | absolute | Pass | 8.169 | generation=1; updatedPartitions=4 | [JSON](raw-results.json) |
| `S0-ATM-002` | absolute | Pass | 7.713 | aliasResolved=true; generation=1 | [JSON](raw-results.json) |
| `S0-ATM-003` | absolute | Pass | 6.304 | previousGenerationPreserved=true; danglingAlias=false | [JSON](raw-results.json) |
| `S0-CON-001` | absolute | Pass | 82.916 | processes=2; winners=1; staleConflicts=1; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-CON-002` | absolute | Pass | 102.354 | processes=4; winners=1; staleConflicts=3; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-CON-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CON-004` | absolute | Pass | 7.166 | frozenRevision=1; preservedRevision=2 | [JSON](raw-results.json) |
| `S0-CON-005` | absolute | Pass | 91.002 | processes=3; winners=1; staleConflicts=2; durableGeneration=1; boundedContention=true | [JSON](raw-results.json) |
| `S0-JRN-001` | absolute | Pass | 7.483 | journalStatus=planned; tupleCount=1 | [JSON](raw-results.json) |
| `S0-JRN-002` | absolute | Pass | 4.707 | rejectedBeforeCommit=true | [JSON](raw-results.json) |
| `S0-CRS-001` | absolute | Pass | 126.624 | killedBeforeCommitGeneration=0; killedAfterCommitGeneration=1; lostResponseRecovered=true | [JSON](raw-results.json) |
| `S0-CRS-002` | absolute | Pass | 65.297 | partialAliasVisible=false; killedProcess=true; mechanism=process-kill | [JSON](raw-results.json) |
| `S0-CRS-003` | absolute | Pass | 63.962 | operation=migration; killedProcess=true; killPoint=before-migration-commit; resumedUnambiguously=true; mechanism=process-kill | [JSON](raw-results.json) |
| `S0-COL-001` | absolute | Pass | 94.137 | processes=3; winners=1; staleConflicts=2; durableGeneration=1 | [JSON](raw-results.json) |
| `S0-COL-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Pass | 133.254 | commits=5; strayTempFiles=0; durableGeneration=5; tornReplaceKilled=true; previousGenerationIntact=true | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-006` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COR-001` | absolute | Pass | 7.843 | typedCorruptionFailure=true; truncatedJsonRejected=true; validJsonChecksumTamperRejected=true; damagedStatePreserved=true | [JSON](raw-results.json) |
| `S0-COR-002` | absolute | Pass | 11.015 | concurrentDistinctWorkspaces=2; aliasWinners=1; aliasConflicts=1; unambiguousResolution=true; partialRestoreVisible=false | [JSON](raw-results.json) |
| `S0-COR-003` | absolute | Pass | 2.149 | unsupportedVersionFailedClosed=true | [JSON](raw-results.json) |
| `S0-COR-004` | absolute | Pass | 3.984 | permissionErrorFailedClosed=true; treatedAsAbsent=false | [JSON](raw-results.json) |
| `S0-HYD-001` | absolute | Pass | 6.607 | enumeratedWorkspaces=3 | [JSON](raw-results.json) |
| `S0-HYD-002` | absolute | Pass | 9.369 | exactRehydration=true; generation=1 | [JSON](raw-results.json) |
| `S0-HYD-003` | absolute | Pass | 9.456 | surfacedBeforeMutation=true; reconciledThenAccepted=true | [JSON](raw-results.json) |
| `S0-MIG-001` | absolute | Pass | 6.981 | migrated=1; idempotentSecondRun=true; generationPreserved=2 | [JSON](raw-results.json) |
| `S0-MIG-002` | absolute | Pass | 5.120 | rolledBackOnInterrupt=true; resumedToComplete=true | [JSON](raw-results.json) |
| `S0-MIG-003` | absolute | Pass | 3.421 | failedClosedOnUnsupported=true; sourcePreserved=true | [JSON](raw-results.json) |
| `S0-MIG-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Pass | 3.697 | receiptIssued=true; generation=0 | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Pass | 4.072 | corruptRejected=true; incompleteRejected=true; duplicateRejected=true | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Pass | 3.408 | workspaceCount=1; knownGeneration=0 | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Pass | 7.371 | exactRestore=true; corruptBackupRejected=true | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Pass | 64.163 | restartedInSeparateProcess=true; generation=1; selectionRecovered=true | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Pass | 72.600 | orphanedLockObserved=true; recoveredGeneration=1 | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Pass | 6.605 | identifiesWorkspace=true; leaksBody=false; leaksSecret=false | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.315 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Incomplete | 0.020 | S0-PER-001 is incomplete: the current harness initializes an empty store inside the measuring process instead of reopening and fully enumerating a populated multi-workspace scale fixture in a fresh process. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Pass | 542.674 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; repetitions_small=40; repetitions_medium=20; repetitions_stress=8 | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Incomplete | 0.010 | S0-PER-003 is incomplete: memory was not measured and store-size divided by backup payload size is not write amplification. The gate requires storage-layer bytes written plus fresh-process memory, backup, restore, and footprint measurements. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.039 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=1; implementation=3; test=3; migration=2; deployment=1; maintenance=3; diagnostics=3; recovery=3; rationale={"dependencies":"Built-in filesystem and crypto APIs","implementation":"Envelope, alias index, lock ownership, fsync, and atomic replace","test":"Filesystem race, process-kill, torn-replace, corruption, and backup fixtures","migration":"Envelope migration with explicit original preservation","deployment":"No service, credential, or external package","maintenance":"Filesystem and platform-specific durability behavior","diagnostics":"Envelope, index, lock, and temp-file diagnostics","recovery":"Stale-lock, temp-file, index rebuild, and replace recovery"}; total=19; mean=2.375 | [JSON](raw-results.json) |

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
| `S0-CON-005` | contentionCompletionMs | 90.979 | ms |
| `S0-PER-002` | openByAliasMinMs_small | 0.865 | ms |
| `S0-PER-002` | openByAliasP50Ms_small | 0.949 | ms |
| `S0-PER-002` | openByAliasP95Ms_small | 1.191 | ms |
| `S0-PER-002` | openByAliasMaxMs_small | 1.223 | ms |
| `S0-PER-002` | openByAliasMeanMs_small | 0.974 | ms |
| `S0-PER-002` | openByAliasStdDevMs_small | 0.093 | ms |
| `S0-PER-002` | mutationMinMs_small | 1.502 | ms |
| `S0-PER-002` | mutationP50Ms_small | 1.680 | ms |
| `S0-PER-002` | mutationP95Ms_small | 2.112 | ms |
| `S0-PER-002` | mutationMaxMs_small | 4.036 | ms |
| `S0-PER-002` | mutationMeanMs_small | 1.818 | ms |
| `S0-PER-002` | mutationStdDevMs_small | 0.493 | ms |
| `S0-PER-002` | conflictMinMs_small | 0.754 | ms |
| `S0-PER-002` | conflictP50Ms_small | 0.835 | ms |
| `S0-PER-002` | conflictP95Ms_small | 1.034 | ms |
| `S0-PER-002` | conflictMaxMs_small | 1.099 | ms |
| `S0-PER-002` | conflictMeanMs_small | 0.869 | ms |
| `S0-PER-002` | conflictStdDevMs_small | 0.088 | ms |
| `S0-PER-002` | openByAliasMinMs_medium | 1.186 | ms |
| `S0-PER-002` | openByAliasP50Ms_medium | 1.248 | ms |
| `S0-PER-002` | openByAliasP95Ms_medium | 1.321 | ms |
| `S0-PER-002` | openByAliasMaxMs_medium | 1.450 | ms |
| `S0-PER-002` | openByAliasMeanMs_medium | 1.254 | ms |
| `S0-PER-002` | openByAliasStdDevMs_medium | 0.056 | ms |
| `S0-PER-002` | mutationMinMs_medium | 2.019 | ms |
| `S0-PER-002` | mutationP50Ms_medium | 2.071 | ms |
| `S0-PER-002` | mutationP95Ms_medium | 2.298 | ms |
| `S0-PER-002` | mutationMaxMs_medium | 2.415 | ms |
| `S0-PER-002` | mutationMeanMs_medium | 2.130 | ms |
| `S0-PER-002` | mutationStdDevMs_medium | 0.108 | ms |
| `S0-PER-002` | conflictMinMs_medium | 0.942 | ms |
| `S0-PER-002` | conflictP50Ms_medium | 0.983 | ms |
| `S0-PER-002` | conflictP95Ms_medium | 1.100 | ms |
| `S0-PER-002` | conflictMaxMs_medium | 1.228 | ms |
| `S0-PER-002` | conflictMeanMs_medium | 1.009 | ms |
| `S0-PER-002` | conflictStdDevMs_medium | 0.065 | ms |
| `S0-PER-002` | openByAliasMinMs_stress | 9.604 | ms |
| `S0-PER-002` | openByAliasP50Ms_stress | 10.495 | ms |
| `S0-PER-002` | openByAliasP95Ms_stress | 12.710 | ms |
| `S0-PER-002` | openByAliasMaxMs_stress | 12.710 | ms |
| `S0-PER-002` | openByAliasMeanMs_stress | 10.901 | ms |
| `S0-PER-002` | openByAliasStdDevMs_stress | 1.078 | ms |
| `S0-PER-002` | mutationMinMs_stress | 12.039 | ms |
| `S0-PER-002` | mutationP50Ms_stress | 12.543 | ms |
| `S0-PER-002` | mutationP95Ms_stress | 16.211 | ms |
| `S0-PER-002` | mutationMaxMs_stress | 16.211 | ms |
| `S0-PER-002` | mutationMeanMs_stress | 13.262 | ms |
| `S0-PER-002` | mutationStdDevMs_stress | 1.315 | ms |
| `S0-PER-002` | conflictMinMs_stress | 5.235 | ms |
| `S0-PER-002` | conflictP50Ms_stress | 5.297 | ms |
| `S0-PER-002` | conflictP95Ms_stress | 7.008 | ms |
| `S0-PER-002` | conflictMaxMs_stress | 7.008 | ms |
| `S0-PER-002` | conflictMeanMs_stress | 5.570 | ms |
| `S0-PER-002` | conflictStdDevMs_stress | 0.558 | ms |

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
