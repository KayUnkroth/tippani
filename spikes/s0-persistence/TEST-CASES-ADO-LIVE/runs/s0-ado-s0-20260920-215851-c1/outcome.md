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
| Temporary store root | tippani-s0-s0-ado-s0-20260920-215851-c1-X7UiKj |
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
| Store namespace | tippani-s0/s0-ado-s0-20260920-215851-c1 |
| Authentication setup | One Azure DevOps identity (supplied at runtime) |
| Cleanup manifest | syn-cleanup-s0-ado-live |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:9038276896a0ce66c13619962884e2ad5e54de9256031c7a86892ef739c56e33 |
| Cleanup expiry | 2026-09-22T15:12:42.060Z |
| Effective target hash | sha256:dc9e03fbefec70bc937ef91f98f24029608d5f4fc9abc7781fd0c90c7f6554dd |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `tippani-s0:s0-ado-s0-20260920-215851-c1` |
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
| `S0-COL-002` | absolute | Pass | 4470.058 | accounts=1; clientProcesses=2; clientProcessIds=[2848,5940]; executionMode=independent-os-processes; logicalActors=Synthetic Client 1,Synthetic Client 2; winners=1; staleConflicts=1; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Pass | 4439.946 | accounts=1; clientProcesses=2; clientProcessIds=[4896,13168]; executionMode=independent-os-processes; staleGeneration=0; reloadedGeneration=1; reconciledGeneration=2; deterministicReconnect=true | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Pass | 2124.513 | lostResponseDetected=true; noDuplicate=true; reconciledGeneration=1 | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Pass | 3546.871 | offlinePendingConflicted=true; processRestartRecoveredQueue=true; queueWriterProcessIds=[11280,11384]; queueRestartInspectorProcessId=7516; fifoStoppedAtFirstConflict=true; staleEntryRetained=true; noSilentOverwrite=true; authorityGeneration=2 | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Pass | 3198.552 | accounts=1; clientProcesses=2; clientProcessIds=[10008,3408]; executionMode=independent-os-processes; changeMechanism=ADO branch/ref and item polling; observedGeneration=1 | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Pass | 4701.416 | winners=1; staleConflicts=1; durableGeneration=2 | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Pass | 9545.220 | faultsRejected=4; faultsExercised=["auth-expiry","outage","quota","permission-loss","throttle"]; rejectedFaultGenerationUnchanged=true; throttleRecoveredByBoundedRetry=true; throttleResponses=1; retries=1; retryAfterSeconds=[1]; backoffMs=1000; transferredBytes=92487 | [JSON](raw-results.json) |
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
| `S0-MIG-004` | absolute | Pass | 1356.242 | workspaceIdPreserved=true; generation=1; receipt=true | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Pass | 2647.370 | recoveredGeneration=1 | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Pass | 4445.325 | restoredGeneration=2; oneHead=true | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Pass | 17668.239 | faultsExercised=["outage","throttle","auth-expiry","quota","permission-loss","lost-response"]; recoveredFaults=["outage","throttle","auth-expiry","quota","permission-loss"]; throttleRecovery={"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000}; lostResponseReconciled=true; blindRetryRejected=true | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Pass | 3713.424 | discoveredNewerAuthority=true; transientFailureRetained=true; processRestartRecoveredQueue=true; queueWriterProcessId=2020; queueRestartInspectorProcessId=11156; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Pass | 0.662 | providerPreflightRejected=true; errorCount=8 | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Pass | 0.595 | corporateFallbackImpossible=true | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.606 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Pass | 0.599 | configSecretRejected=true; workspaceHasNoSecrets=true | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Pass | 0.609 | ownedAuthorized=true; foreignRefused=true | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Pass | 101.217 | nonPositiveBudgetsRejected=true; operationLimitEnforced=true; objectLimitEnforced=true; byteLimitEnforced=true; deadlineEnforced=true; abortSignalEnforced=true; providerChildBudget={"metered":true,"childPid":11060,"operationsBefore":385,"operationsAfter":386}; cleanupBudgeted=true; cleanupSharedDeadline=true | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Pass | 15988.791 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; byteMethod=UTF-8 application payload bytes submitted or consumed; repetitions_small=6; requestsPerMutation_small=5; bytesPerMutation_small=10761.167; throttleResponses_small=0; retries_small=0; retryAfterSeconds_small=[]; backoffMs_small=0; requestCount_small=30; requestBytes_small=19680; responseBytes_small=44887; repetitions_medium=4; requestsPerMutation_medium=6; bytesPerMutation_medium=82618.25; throttleResponses_medium=0; retries_medium=0; retryAfterSeconds_medium=[]; backoffMs_medium=0; requestCount_medium=24; requestBytes_medium=108896; responseBytes_medium=221577; repetitions_stress=2; requestsPerMutation_stress=7; bytesPerMutation_stress=1504575.5; throttleResponses_stress=0; retries_stress=0; retryAfterSeconds_stress=[]; backoffMs_stress=0; requestCount_stress=14; requestBytes_stress=1029086; responseBytes_stress=1980065; throttleResponses=1; throttleRetries=1; throttleRetryAfterSeconds=[1]; throttleBackoffMs=1000; throttleBehavior=bounded retry honored Retry-After and committed once | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.313 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=2; implementation=3; test=4; migration=3; deployment=3; maintenance=3; diagnostics=3; recovery=3; rationale={"dependencies":"Azure DevOps Git REST API and scoped authentication","implementation":"Repository envelope with branch-tip oldObjectId CAS","test":"Live repository, ref race, offline, failure, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Scoped credential, repository coordinates, and per-run branch","maintenance":"ADO Git REST API and ref semantics","diagnostics":"Provider responses, request telemetry, branch, commit, and generation state","recovery":"Auditable commit history plus offline conflict reconciliation"}; total=24; mean=3 | [JSON](raw-results.json) |

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
| `S0-COL-006` | collaboratorDiscoveryMs | 95.000 | ms |
| `S0-PER-004` | setupMs_small | 1242.554 | ms |
| `S0-PER-004` | warmupMs_small | 229.981 | ms |
| `S0-PER-004` | remoteCasMinMs_small | 528.160 | ms |
| `S0-PER-004` | remoteCasP50Ms_small | 586.015 | ms |
| `S0-PER-004` | remoteCasP95Ms_small | 1220.829 | ms |
| `S0-PER-004` | remoteCasMaxMs_small | 1220.829 | ms |
| `S0-PER-004` | remoteCasMeanMs_small | 678.106 | ms |
| `S0-PER-004` | remoteCasStdDevMs_small | 244.009 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_small | 79.959 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_small | 80.715 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_small | 122.173 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_small | 122.173 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_small | 87.896 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_small | 15.363 | ms |
| `S0-PER-004` | cleanupMs_small | 0.024 | ms |
| `S0-PER-004` | setupMs_medium | 1270.760 | ms |
| `S0-PER-004` | warmupMs_medium | 230.477 | ms |
| `S0-PER-004` | remoteCasMinMs_medium | 526.408 | ms |
| `S0-PER-004` | remoteCasP50Ms_medium | 554.656 | ms |
| `S0-PER-004` | remoteCasP95Ms_medium | 639.983 | ms |
| `S0-PER-004` | remoteCasMaxMs_medium | 639.983 | ms |
| `S0-PER-004` | remoteCasMeanMs_medium | 582.261 | ms |
| `S0-PER-004` | remoteCasStdDevMs_medium | 44.373 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_medium | 58.351 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_medium | 84.428 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_medium | 109.337 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_medium | 109.337 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_medium | 86.720 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_medium | 18.617 | ms |
| `S0-PER-004` | cleanupMs_medium | 0.007 | ms |
| `S0-PER-004` | setupMs_stress | 1542.127 | ms |
| `S0-PER-004` | warmupMs_stress | 392.015 | ms |
| `S0-PER-004` | remoteCasMinMs_stress | 783.924 | ms |
| `S0-PER-004` | remoteCasP50Ms_stress | 783.924 | ms |
| `S0-PER-004` | remoteCasP95Ms_stress | 826.499 | ms |
| `S0-PER-004` | remoteCasMaxMs_stress | 826.499 | ms |
| `S0-PER-004` | remoteCasMeanMs_stress | 805.212 | ms |
| `S0-PER-004` | remoteCasStdDevMs_stress | 21.287 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_stress | 69.625 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_stress | 69.625 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_stress | 127.195 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_stress | 127.195 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_stress | 98.410 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_stress | 28.785 | ms |
| `S0-PER-004` | cleanupMs_stress | 0.005 | ms |
| `S0-PER-004` | throttleRecoveryLatencyMs | 1825.877 | ms |

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
- [Cleanup manifest](cleanup-manifest.json) — `sha256:9038276896a0ce66c13619962884e2ad5e54de9256031c7a86892ef739c56e33`

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
