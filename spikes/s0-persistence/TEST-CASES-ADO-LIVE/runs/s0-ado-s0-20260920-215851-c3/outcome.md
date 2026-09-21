# S0 Outcome: CFG-ADO-LIVE

**Report date:** 2026-09-21
**Harness revision:** s0-harness-v4
**Source revision:** sha256:eef1ed728c3c3078e27ef025e9b45076598359a50acd09196acb4636720b9167
**Catalog revision:** sha256:a2d4052f88cde758aff0bccf62bebd380907b935259f9571dd8f1646740723e7
**Applicability revision:** sha256:7d9b94e9ea7e7f38893230577d6b5aa26ab141e96e3d430244ec51f8c5849b4d
**Configuration revision:** sha256:b6000e8c3b8373833109eeba1ed087f5f8fa0a8b76591498618a8a8d7ed34e35
**Configuration ID:** CFG-ADO-LIVE
**Adapter:** ado
**Authoritative backing path:** ado
**Dataset scale:** small
**Recommendation:** Proceed to architecture-mapping evaluation
**Applicable absolute gates:** 18
**Eligibility:** Yes

## Coverage

Executed 20 of 58 catalog scenarios. 20 apply to this configuration; 0 applicable absolute gates were not executed.

| Outcome class | Count | Meaning |
|---|---:|---|
| Pass | 20 | Executed and satisfied |
| Fail | 0 | Executed and violated |
| Blocked | 0 | Applicable, but a prerequisite is unavailable |
| Incomplete | 0 | Applicable implementation or evidence is incomplete |
| N/A | 0 | Scenario-specific contract rationale plus approver identity, approval date, and reference |
| Not applicable | 38 | Assigned to another configuration by design |
| Not executed | 0 | Applicable, but no result exists |

## Configuration and environment

| Dimension | Value |
|---|---|
| OS | win32 10.0.22631 |
| Architecture | x64 |
| CPU | INTEL(R) XEON(R) PLATINUM 8573C |
| Logical CPUs | 2 |
| Total memory | 8584384512 bytes |
| Runtime | Node 24.21.0 |
| Provider/API version | Azure DevOps Git REST 7.1 |
| Configured platform/filesystem | windows-ntfs |
| Detected filesystem | Not recorded |
| Temporary store root | tippani-s0-s0-ado-s0-20260920-215851-c3-0LEaR9 |
| Network characteristics | Not recorded |
| Provider region | Not recorded |
| Storage characteristics | Not recorded |
| Sync-client state | Not applicable |
| Repository protections | Not recorded |
| Dependency versions | node=24.21.0; sqlite=3.53.4 |
| Workload mix | scenario-defined deterministic small/medium/stress fixtures |
| Known limitations | None recorded |
| Process topology | Scenario-dependent: distinct child PIDs are required and recorded for collaboration gates |
| Dataset scale | small |
| Applicability profile | ado |
| Store namespace | tippani-s0/s0-ado-s0-20260920-215851-c3 |
| Authentication setup | One Azure DevOps identity (supplied at runtime) |
| Cleanup manifest | syn-cleanup-s0-ado-live |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:73fd60121a7d218d7168a943c86f57e19d2c130e88395ad8416e8b3a42c1ed5a |
| Cleanup expiry | 2026-09-22T15:17:28.644Z |
| Effective target hash | sha256:1cbef6a775719433fdeebdb73f8f95258af9c9f41823037e50077ce7882763ce |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `tippani-s0:s0-ado-s0-20260920-215851-c3` |
| Operation budget | 600 |
| Duration budget | 300000 ms |
| Object budget | 10000 |
| Storage/transfer budget | 104857600 bytes |
| Final metered operations | 567 |
| Final metered objects | 23 |
| Final metered bytes | 9688904 |
| Cleanup requests/retries/bytes | {"requests":6,"retries":0,"transferredBytes":3504} |
| Declared provider operations | ["connect","push-run-marker","read-item","push","list-items","list-commits","delete-ref"] |
| Timer | `performance.now()` monotonic elapsed time |
| Performance statistics | Minimum, p50, p95, maximum, mean, sample variability |
| Raw evidence | [raw-results.json](raw-results.json) |
| Redacted preflight | [preflight.json](preflight.json) |

## Scenario results

| Scenario ID | Type | Applicability/result | Duration (ms) | Evidence / reason | Raw |
|---|---|---|---:|---|---|
| `S0-ATM-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-ATM-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-ATM-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CON-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CON-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CON-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CON-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CON-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-JRN-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-JRN-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CRS-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CRS-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-CRS-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COL-002` | absolute | Pass | 3278.718 | accounts=1; clientProcesses=2; clientProcessIds=[9968,13272]; executionMode=independent-os-processes; logicalActors=Synthetic Client 1,Synthetic Client 2; winners=1; staleConflicts=1; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Pass | 4467.383 | accounts=1; clientProcesses=2; clientProcessIds=[6864,11832]; executionMode=independent-os-processes; staleGeneration=0; reloadedGeneration=1; reconciledGeneration=2; deterministicReconnect=true | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Pass | 2163.647 | lostResponseDetected=true; noDuplicate=true; reconciledGeneration=1 | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Pass | 3904.569 | offlinePendingConflicted=true; processRestartRecoveredQueue=true; queueWriterProcessIds=[1652,11364]; queueRestartInspectorProcessId=5160; fifoStoppedAtFirstConflict=true; staleEntryRetained=true; noSilentOverwrite=true; authorityGeneration=2 | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Pass | 2874.370 | accounts=1; clientProcesses=2; clientProcessIds=[5172,12488]; executionMode=independent-os-processes; changeMechanism=ADO branch/ref and item polling; observedGeneration=1 | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Pass | 4830.581 | winners=1; staleConflicts=1; durableGeneration=2 | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Pass | 8737.416 | faultsRejected=4; faultsExercised=["auth-expiry","outage","quota","permission-loss","throttle"]; rejectedFaultGenerationUnchanged=true; throttleRecoveredByBoundedRetry=true; throttleResponses=1; retries=1; retryAfterSeconds=[1]; backoffMs=1000; transferredBytes=92487 | [JSON](raw-results.json) |
| `S0-BCK-006` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COR-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COR-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COR-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-COR-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-HYD-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-HYD-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-HYD-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-MIG-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-MIG-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-MIG-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-MIG-004` | absolute | Pass | 1454.289 | workspaceIdPreserved=true; generation=1; receipt=true | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Pass | 2953.398 | recoveredGeneration=1 | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Pass | 4165.908 | restoredGeneration=2; oneHead=true | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Pass | 17250.001 | faultsExercised=["outage","throttle","auth-expiry","quota","permission-loss","lost-response"]; recoveredFaults=["outage","throttle","auth-expiry","quota","permission-loss"]; throttleRecovery={"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000}; lostResponseReconciled=true; blindRetryRejected=true | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Pass | 3913.767 | discoveredNewerAuthority=true; transientFailureRetained=true; processRestartRecoveredQueue=true; queueWriterProcessId=10792; queueRestartInspectorProcessId=6152; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Pass | 0.723 | providerPreflightRejected=true; errorCount=8 | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Pass | 0.577 | corporateFallbackImpossible=true | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.593 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Pass | 0.613 | configSecretRejected=true; workspaceHasNoSecrets=true | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Pass | 0.580 | ownedAuthorized=true; foreignRefused=true | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Pass | 101.216 | nonPositiveBudgetsRejected=true; operationLimitEnforced=true; objectLimitEnforced=true; byteLimitEnforced=true; deadlineEnforced=true; abortSignalEnforced=true; providerChildBudget={"metered":true,"childPid":11536,"operationsBefore":385,"operationsAfter":386}; cleanupBudgeted=true; cleanupSharedDeadline=true | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Pass | 17939.098 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; byteMethod=UTF-8 application payload bytes submitted or consumed; repetitions_small=6; requestsPerMutation_small=5; bytesPerMutation_small=10761.167; throttleResponses_small=0; retries_small=0; retryAfterSeconds_small=[]; backoffMs_small=0; requestCount_small=30; requestBytes_small=19680; responseBytes_small=44887; repetitions_medium=4; requestsPerMutation_medium=6; bytesPerMutation_medium=82618.25; throttleResponses_medium=0; retries_medium=0; retryAfterSeconds_medium=[]; backoffMs_medium=0; requestCount_medium=24; requestBytes_medium=108896; responseBytes_medium=221577; repetitions_stress=2; requestsPerMutation_stress=7; bytesPerMutation_stress=1504575.5; throttleResponses_stress=0; retries_stress=0; retryAfterSeconds_stress=[]; backoffMs_stress=0; requestCount_stress=14; requestBytes_stress=1029086; responseBytes_stress=1980065; throttleResponses=1; throttleRetries=1; throttleRetryAfterSeconds=[1]; throttleBackoffMs=1000; throttleBehavior=bounded retry honored Retry-After and committed once | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.319 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=2; implementation=3; test=4; migration=3; deployment=3; maintenance=3; diagnostics=3; recovery=3; rationale={"dependencies":"Azure DevOps Git REST API and scoped authentication","implementation":"Repository envelope with branch-tip oldObjectId CAS","test":"Live repository, ref race, offline, failure, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Scoped credential, repository coordinates, and per-run branch","maintenance":"ADO Git REST API and ref semantics","diagnostics":"Provider responses, request telemetry, branch, commit, and generation state","recovery":"Auditable commit history plus offline conflict reconciliation"}; total=24; mean=3 | [JSON](raw-results.json) |

## Correctness summary

| Criterion | Outcome |
|---|---|
| Atomicity and concurrency | Not applicable |
| Collaboration | Pass |
| Crash and operational recovery | Pass |
| Corruption and rehydration | Not applicable |
| Migration and import | Pass |
| Backup and restore | Pass |
| Safety and security | Pass |

## Measurements

| Scenario ID | Metric | Value | Unit |
|---|---|---:|---|
| `S0-COL-006` | collaboratorDiscoveryMs | 58.000 | ms |
| `S0-PER-004` | setupMs_small | 1284.441 | ms |
| `S0-PER-004` | warmupMs_small | 219.437 | ms |
| `S0-PER-004` | remoteCasMinMs_small | 564.563 | ms |
| `S0-PER-004` | remoteCasP50Ms_small | 578.332 | ms |
| `S0-PER-004` | remoteCasP95Ms_small | 720.819 | ms |
| `S0-PER-004` | remoteCasMaxMs_small | 720.819 | ms |
| `S0-PER-004` | remoteCasMeanMs_small | 626.209 | ms |
| `S0-PER-004` | remoteCasStdDevMs_small | 57.686 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_small | 82.710 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_small | 84.856 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_small | 122.123 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_small | 122.123 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_small | 90.623 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_small | 14.137 | ms |
| `S0-PER-004` | cleanupMs_small | 0.025 | ms |
| `S0-PER-004` | setupMs_medium | 1565.870 | ms |
| `S0-PER-004` | warmupMs_medium | 276.490 | ms |
| `S0-PER-004` | remoteCasMinMs_medium | 598.683 | ms |
| `S0-PER-004` | remoteCasP50Ms_medium | 609.093 | ms |
| `S0-PER-004` | remoteCasP95Ms_medium | 884.218 | ms |
| `S0-PER-004` | remoteCasMaxMs_medium | 884.218 | ms |
| `S0-PER-004` | remoteCasMeanMs_medium | 691.016 | ms |
| `S0-PER-004` | remoteCasStdDevMs_medium | 115.025 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_medium | 88.831 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_medium | 92.579 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_medium | 188.379 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_medium | 188.379 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_medium | 124.494 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_medium | 39.954 | ms |
| `S0-PER-004` | cleanupMs_medium | 0.006 | ms |
| `S0-PER-004` | setupMs_stress | 2038.487 | ms |
| `S0-PER-004` | warmupMs_stress | 617.502 | ms |
| `S0-PER-004` | remoteCasMinMs_stress | 891.419 | ms |
| `S0-PER-004` | remoteCasP50Ms_stress | 891.419 | ms |
| `S0-PER-004` | remoteCasP95Ms_stress | 1085.572 | ms |
| `S0-PER-004` | remoteCasMaxMs_stress | 1085.572 | ms |
| `S0-PER-004` | remoteCasMeanMs_stress | 988.495 | ms |
| `S0-PER-004` | remoteCasStdDevMs_stress | 97.077 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_stress | 132.148 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_stress | 132.148 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_stress | 358.553 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_stress | 358.553 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_stress | 245.350 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_stress | 113.202 | ms |
| `S0-PER-004` | cleanupMs_stress | 0.008 | ms |
| `S0-PER-004` | throttleRecoveryLatencyMs | 1890.457 | ms |

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
- [Cleanup manifest](cleanup-manifest.json) — `sha256:73fd60121a7d218d7168a943c86f57e19d2c130e88395ad8416e8b3a42c1ed5a`

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
