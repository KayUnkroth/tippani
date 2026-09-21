# S0 Outcome: CFG-ONEDRIVE-LIVE

**Report date:** 2026-09-21
**Harness revision:** s0-harness-v4
**Source revision:** sha256:eef1ed728c3c3078e27ef025e9b45076598359a50acd09196acb4636720b9167
**Catalog revision:** sha256:a2d4052f88cde758aff0bccf62bebd380907b935259f9571dd8f1646740723e7
**Applicability revision:** sha256:7d9b94e9ea7e7f38893230577d6b5aa26ab141e96e3d430244ec51f8c5849b4d
**Configuration revision:** sha256:a3d571e2a31bc58cba9aa371767bbeee0941efb66f69e1fb25104fed8d2fcff9
**Configuration ID:** CFG-ONEDRIVE-LIVE
**Adapter:** onedrive
**Authoritative backing path:** onedrive
**Dataset scale:** small
**Recommendation:** Do not proceed
**Applicable absolute gates:** 18
**Eligibility:** No

## Coverage

Executed 20 of 58 catalog scenarios. 20 apply to this configuration; 0 applicable absolute gates were not executed.

| Outcome class | Count | Meaning |
|---|---:|---|
| Pass | 18 | Executed and satisfied |
| Fail | 1 | Executed and violated |
| Blocked | 0 | Applicable, but a prerequisite is unavailable |
| Incomplete | 1 | Applicable implementation or evidence is incomplete |
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
| Provider/API version | Microsoft Graph v1.0 |
| Configured platform/filesystem | windows-ntfs |
| Detected filesystem | Not recorded |
| Temporary store root | tippani-s0-s0-onedrive-s0-20260920-215851-c3-wYibJe |
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
| Applicability profile | onedrive |
| Store namespace | tippani-s0/s0-onedrive-s0-20260920-215851-c3 |
| Authentication setup | Live delegated identity (supplied at runtime) |
| Cleanup manifest | syn-cleanup-s0-onedrive-live |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:f75d3e931f1d82c4668e0c54a99f0bd4ec1027756e0d672a64315a47f88b4066 |
| Cleanup expiry | 2026-09-22T15:44:04.917Z |
| Effective target hash | sha256:2b945752938a74871dcdd96aa60d4e691884966c2b527c68f913e9dc01da7026 |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `tippani-s0:s0-onedrive-s0-20260920-215851-c3` |
| Operation budget | 500 |
| Duration budget | 300000 ms |
| Object budget | 10000 |
| Storage/transfer budget | 104857600 bytes |
| Final metered operations | 447 |
| Final metered objects | 83 |
| Final metered bytes | 5756855 |
| Cleanup requests/retries/bytes | {"requests":15,"retries":0,"transferredBytes":5062} |
| Declared provider operations | ["ensure-folder","put-run-marker","put-content","get-content","list-children","delete-folder"] |
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
| `S0-COL-002` | absolute | Pass | 10009.370 | accounts=1; clientProcesses=2; clientProcessIds=[11224,8872]; executionMode=independent-os-processes; logicalActors=Synthetic Client 1,Synthetic Client 2; winners=1; staleConflicts=1; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Pass | 16591.923 | accounts=1; clientProcesses=2; clientProcessIds=[2352,12924]; executionMode=independent-os-processes; staleGeneration=0; reloadedGeneration=1; reconciledGeneration=2; deterministicReconnect=true | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Pass | 4871.405 | lostResponseDetected=true; noDuplicate=true; reconciledGeneration=1 | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Pass | 9542.438 | offlinePendingConflicted=true; processRestartRecoveredQueue=true; queueWriterProcessIds=[896,9980]; queueRestartInspectorProcessId=2000; fifoStoppedAtFirstConflict=true; staleEntryRetained=true; noSilentOverwrite=true; authorityGeneration=2 | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Pass | 10790.996 | accounts=1; clientProcesses=2; clientProcessIds=[9268,10316]; executionMode=independent-os-processes; changeMechanism=Graph drive-item polling; observedGeneration=1 | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Pass | 8228.767 | winners=1; staleConflicts=1; durableGeneration=2 | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Pass | 10413.007 | faultsRejected=4; faultsExercised=["auth-expiry","outage","quota","permission-loss","throttle"]; rejectedFaultGenerationUnchanged=true; throttleRecoveredByBoundedRetry=true; throttleResponses=1; retries=1; retryAfterSeconds=[1]; backoffMs=1000; transferredBytes=57644 | [JSON](raw-results.json) |
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
| `S0-MIG-004` | absolute | Pass | 2699.805 | workspaceIdPreserved=true; generation=1; receipt=true | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Pass | 6073.636 | recoveredGeneration=1 | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Incomplete | 0.268 | onedrive restore cannot establish one atomic authoritative head with the current spike transport. | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Pass | 21572.279 | faultsExercised=["outage","throttle","auth-expiry","quota","permission-loss","lost-response"]; recoveredFaults=["outage","throttle","auth-expiry","quota","permission-loss"]; throttleRecovery={"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000}; lostResponseReconciled=true; blindRetryRejected=true | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Pass | 11176.500 | discoveredNewerAuthority=true; transientFailureRetained=true; processRestartRecoveredQueue=true; queueWriterProcessId=9860; queueRestartInspectorProcessId=3148; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Pass | 0.624 | providerPreflightRejected=true; errorCount=8 | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Pass | 0.551 | corporateFallbackImpossible=true | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.566 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Pass | 0.568 | configSecretRejected=true; workspaceHasNoSecrets=true | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Fail | 0.613 | — | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Pass | 99.929 | nonPositiveBudgetsRejected=true; operationLimitEnforced=true; objectLimitEnforced=true; byteLimitEnforced=true; deadlineEnforced=true; abortSignalEnforced=true; providerChildBudget={"metered":true,"childPid":12244,"operationsBefore":280,"operationsAfter":281}; cleanupBudgeted=true; cleanupSharedDeadline=true | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Pass | 36627.706 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; byteMethod=UTF-8 application payload bytes submitted or consumed; repetitions_small=6; requestsPerMutation_small=5; bytesPerMutation_small=11329.167; throttleResponses_small=0; retries_small=0; retryAfterSeconds_small=[]; backoffMs_small=0; requestCount_small=30; requestBytes_small=16098; responseBytes_small=51877; repetitions_medium=4; requestsPerMutation_medium=5; bytesPerMutation_medium=78293.25; throttleResponses_medium=0; retries_medium=0; retryAfterSeconds_medium=[]; backoffMs_medium=0; requestCount_medium=20; requestBytes_medium=100016; responseBytes_medium=213157; repetitions_stress=2; requestsPerMutation_stress=5; bytesPerMutation_stress=1441950.5; throttleResponses_stress=0; retries_stress=0; retryAfterSeconds_stress=[]; backoffMs_stress=0; requestCount_stress=10; requestBytes_stress=959112; responseBytes_stress=1924789; throttleResponses=1; throttleRetries=1; throttleRetryAfterSeconds=[1]; throttleBackoffMs=1000; throttleBehavior=bounded retry honored Retry-After and committed once | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.299 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=2; implementation=3; test=4; migration=3; deployment=3; maintenance=3; diagnostics=3; recovery=3; rationale={"dependencies":"Microsoft Graph drive API and delegated authentication","implementation":"Graph drive-item envelope with ETag CAS and version history","test":"Live sandbox, concurrency, offline, failure, version, and cleanup coverage","migration":"Receipt-gated local-to-drive rehome","deployment":"Delegated credential, drive coordinates, and approved namespace","maintenance":"Graph API and OneDrive consistency behavior","diagnostics":"Provider responses, request telemetry, and authoritative generation state","recovery":"Version history plus offline conflict reconciliation"}; total=24; mean=3 | [JSON](raw-results.json) |

## Correctness summary

| Criterion | Outcome |
|---|---|
| Atomicity and concurrency | Not applicable |
| Collaboration | Pass |
| Crash and operational recovery | Pass |
| Corruption and rehydration | Not applicable |
| Migration and import | Pass |
| Backup and restore | Incomplete |
| Safety and security | Fail |

## Measurements

| Scenario ID | Metric | Value | Unit |
|---|---|---:|---|
| `S0-COL-006` | collaboratorDiscoveryMs | 1163.000 | ms |
| `S0-PER-004` | setupMs_small | 4061.992 | ms |
| `S0-PER-004` | warmupMs_small | 1670.578 | ms |
| `S0-PER-004` | remoteCasMinMs_small | 880.169 | ms |
| `S0-PER-004` | remoteCasP50Ms_small | 995.123 | ms |
| `S0-PER-004` | remoteCasP95Ms_small | 1162.443 | ms |
| `S0-PER-004` | remoteCasMaxMs_small | 1162.443 | ms |
| `S0-PER-004` | remoteCasMeanMs_small | 1024.224 | ms |
| `S0-PER-004` | remoteCasStdDevMs_small | 91.678 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_small | 417.357 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_small | 481.344 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_small | 559.318 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_small | 559.318 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_small | 481.913 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_small | 47.756 | ms |
| `S0-PER-004` | cleanupMs_small | 0.024 | ms |
| `S0-PER-004` | setupMs_medium | 4086.850 | ms |
| `S0-PER-004` | warmupMs_medium | 1463.201 | ms |
| `S0-PER-004` | remoteCasMinMs_medium | 934.401 | ms |
| `S0-PER-004` | remoteCasP50Ms_medium | 1045.852 | ms |
| `S0-PER-004` | remoteCasP95Ms_medium | 1151.853 | ms |
| `S0-PER-004` | remoteCasMaxMs_medium | 1151.853 | ms |
| `S0-PER-004` | remoteCasMeanMs_medium | 1049.974 | ms |
| `S0-PER-004` | remoteCasStdDevMs_medium | 77.574 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_medium | 471.471 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_medium | 518.230 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_medium | 841.629 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_medium | 841.629 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_medium | 594.606 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_medium | 145.149 | ms |
| `S0-PER-004` | cleanupMs_medium | 0.006 | ms |
| `S0-PER-004` | setupMs_stress | 5317.487 | ms |
| `S0-PER-004` | warmupMs_stress | 1665.081 | ms |
| `S0-PER-004` | remoteCasMinMs_stress | 1030.090 | ms |
| `S0-PER-004` | remoteCasP50Ms_stress | 1030.090 | ms |
| `S0-PER-004` | remoteCasP95Ms_stress | 1400.540 | ms |
| `S0-PER-004` | remoteCasMaxMs_stress | 1400.540 | ms |
| `S0-PER-004` | remoteCasMeanMs_stress | 1215.315 | ms |
| `S0-PER-004` | remoteCasStdDevMs_stress | 185.225 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_stress | 504.798 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_stress | 504.798 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_stress | 801.275 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_stress | 801.275 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_stress | 653.037 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_stress | 148.239 | ms |
| `S0-PER-004` | cleanupMs_stress | 0.006 | ms |
| `S0-PER-004` | throttleRecoveryLatencyMs | 2271.102 | ms |

## Failures and recovery

- **S0-SEC-005:** OneDrive cannot condition recursive folder deletion on the folder remaining empty

## Risks and required follow-up

| Gate | State | Owner | Evidence required |
|---|---|---|---|
| `S0-SEC-005` | Fail | S0 implementation owner | OneDrive cannot condition recursive folder deletion on the folder remaining empty |
| `S0-BKP-004` | Incomplete | S0 provider test owner | onedrive restore cannot establish one atomic authoritative head with the current spike transport. |

## Configuration recommendation

Do not treat this component as selected. Close every applicable failed, blocked, incomplete, or unexecuted absolute gate first.

## Evidence

- [Raw machine-readable results](raw-results.json)
- [Redacted preflight](preflight.json)
- [Cleanup manifest](cleanup-manifest.json) — `sha256:f75d3e931f1d82c4668e0c54a99f0bd4ec1027756e0d672a64315a47f88b4066`

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
