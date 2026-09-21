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
| Temporary store root | tippani-s0-s0-onedrive-s0-20260920-215851-c2-2Gb2C5 |
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
| Store namespace | tippani-s0/s0-onedrive-s0-20260920-215851-c2 |
| Authentication setup | Live delegated identity (supplied at runtime) |
| Cleanup manifest | syn-cleanup-s0-onedrive-live |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:605246be65388a3c31f6239e30d9f88fdb1e395c860922317fa85f4ddc369a2b |
| Cleanup expiry | 2026-09-22T15:38:57.997Z |
| Effective target hash | sha256:8552ff4e1d51b8517cba2b64cf6c4f62e3921f605f0a36968bcb073e44d192be |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `tippani-s0:s0-onedrive-s0-20260920-215851-c2` |
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
| `S0-COL-002` | absolute | Pass | 10361.827 | accounts=1; clientProcesses=2; clientProcessIds=[13520,11780]; executionMode=independent-os-processes; logicalActors=Synthetic Client 1,Synthetic Client 2; winners=1; staleConflicts=1; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Pass | 17892.490 | accounts=1; clientProcesses=2; clientProcessIds=[13640,10004]; executionMode=independent-os-processes; staleGeneration=0; reloadedGeneration=1; reconciledGeneration=2; deterministicReconnect=true | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Pass | 11435.148 | lostResponseDetected=true; noDuplicate=true; reconciledGeneration=1 | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Pass | 12376.485 | offlinePendingConflicted=true; processRestartRecoveredQueue=true; queueWriterProcessIds=[5628,9816]; queueRestartInspectorProcessId=13740; fifoStoppedAtFirstConflict=true; staleEntryRetained=true; noSilentOverwrite=true; authorityGeneration=2 | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Pass | 9217.596 | accounts=1; clientProcesses=2; clientProcessIds=[12184,10212]; executionMode=independent-os-processes; changeMechanism=Graph drive-item polling; observedGeneration=1 | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Pass | 14247.797 | winners=1; staleConflicts=1; durableGeneration=2 | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Pass | 18686.280 | faultsRejected=4; faultsExercised=["auth-expiry","outage","quota","permission-loss","throttle"]; rejectedFaultGenerationUnchanged=true; throttleRecoveredByBoundedRetry=true; throttleResponses=1; retries=1; retryAfterSeconds=[1]; backoffMs=1000; transferredBytes=57644 | [JSON](raw-results.json) |
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
| `S0-MIG-004` | absolute | Pass | 3788.944 | workspaceIdPreserved=true; generation=1; receipt=true | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Pass | 8530.641 | recoveredGeneration=1 | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Incomplete | 0.304 | onedrive restore cannot establish one atomic authoritative head with the current spike transport. | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Pass | 36831.132 | faultsExercised=["outage","throttle","auth-expiry","quota","permission-loss","lost-response"]; recoveredFaults=["outage","throttle","auth-expiry","quota","permission-loss"]; throttleRecovery={"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000}; lostResponseReconciled=true; blindRetryRejected=true | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Pass | 15726.630 | discoveredNewerAuthority=true; transientFailureRetained=true; processRestartRecoveredQueue=true; queueWriterProcessId=10164; queueRestartInspectorProcessId=12340; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Pass | 0.618 | providerPreflightRejected=true; errorCount=8 | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Pass | 0.872 | corporateFallbackImpossible=true | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.564 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Pass | 0.703 | configSecretRejected=true; workspaceHasNoSecrets=true | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Fail | 0.589 | — | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Pass | 109.831 | nonPositiveBudgetsRejected=true; operationLimitEnforced=true; objectLimitEnforced=true; byteLimitEnforced=true; deadlineEnforced=true; abortSignalEnforced=true; providerChildBudget={"metered":true,"childPid":4460,"operationsBefore":280,"operationsAfter":281}; cleanupBudgeted=true; cleanupSharedDeadline=true | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Pass | 66081.530 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; byteMethod=UTF-8 application payload bytes submitted or consumed; repetitions_small=6; requestsPerMutation_small=5; bytesPerMutation_small=11329.167; throttleResponses_small=0; retries_small=0; retryAfterSeconds_small=[]; backoffMs_small=0; requestCount_small=30; requestBytes_small=16098; responseBytes_small=51877; repetitions_medium=4; requestsPerMutation_medium=5; bytesPerMutation_medium=78293.25; throttleResponses_medium=0; retries_medium=0; retryAfterSeconds_medium=[]; backoffMs_medium=0; requestCount_medium=20; requestBytes_medium=100016; responseBytes_medium=213157; repetitions_stress=2; requestsPerMutation_stress=5; bytesPerMutation_stress=1441950.5; throttleResponses_stress=0; retries_stress=0; retryAfterSeconds_stress=[]; backoffMs_stress=0; requestCount_stress=10; requestBytes_stress=959112; responseBytes_stress=1924789; throttleResponses=1; throttleRetries=1; throttleRetryAfterSeconds=[1]; throttleBackoffMs=1000; throttleBehavior=bounded retry honored Retry-After and committed once | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.303 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=2; implementation=3; test=4; migration=3; deployment=3; maintenance=3; diagnostics=3; recovery=3; rationale={"dependencies":"Microsoft Graph drive API and delegated authentication","implementation":"Graph drive-item envelope with ETag CAS and version history","test":"Live sandbox, concurrency, offline, failure, version, and cleanup coverage","migration":"Receipt-gated local-to-drive rehome","deployment":"Delegated credential, drive coordinates, and approved namespace","maintenance":"Graph API and OneDrive consistency behavior","diagnostics":"Provider responses, request telemetry, and authoritative generation state","recovery":"Version history plus offline conflict reconciliation"}; total=24; mean=3 | [JSON](raw-results.json) |

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
| `S0-COL-006` | collaboratorDiscoveryMs | 906.000 | ms |
| `S0-PER-004` | setupMs_small | 7863.780 | ms |
| `S0-PER-004` | warmupMs_small | 2993.562 | ms |
| `S0-PER-004` | remoteCasMinMs_small | 1517.116 | ms |
| `S0-PER-004` | remoteCasP50Ms_small | 1564.158 | ms |
| `S0-PER-004` | remoteCasP95Ms_small | 2021.301 | ms |
| `S0-PER-004` | remoteCasMaxMs_small | 2021.301 | ms |
| `S0-PER-004` | remoteCasMeanMs_small | 1662.438 | ms |
| `S0-PER-004` | remoteCasStdDevMs_small | 168.860 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_small | 838.759 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_small | 867.295 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_small | 1316.772 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_small | 1316.772 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_small | 1062.456 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_small | 208.293 | ms |
| `S0-PER-004` | cleanupMs_small | 0.024 | ms |
| `S0-PER-004` | setupMs_medium | 8020.467 | ms |
| `S0-PER-004` | warmupMs_medium | 2995.613 | ms |
| `S0-PER-004` | remoteCasMinMs_medium | 1529.692 | ms |
| `S0-PER-004` | remoteCasP50Ms_medium | 1721.429 | ms |
| `S0-PER-004` | remoteCasP95Ms_medium | 2296.818 | ms |
| `S0-PER-004` | remoteCasMaxMs_medium | 2296.818 | ms |
| `S0-PER-004` | remoteCasMeanMs_medium | 1849.297 | ms |
| `S0-PER-004` | remoteCasStdDevMs_medium | 282.300 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_medium | 868.951 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_medium | 996.128 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_medium | 1196.058 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_medium | 1196.058 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_medium | 1047.261 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_medium | 125.552 | ms |
| `S0-PER-004` | cleanupMs_medium | 0.005 | ms |
| `S0-PER-004` | setupMs_stress | 8878.894 | ms |
| `S0-PER-004` | warmupMs_stress | 3130.034 | ms |
| `S0-PER-004` | remoteCasMinMs_stress | 2877.590 | ms |
| `S0-PER-004` | remoteCasP50Ms_stress | 2877.590 | ms |
| `S0-PER-004` | remoteCasP95Ms_stress | 2917.031 | ms |
| `S0-PER-004` | remoteCasMaxMs_stress | 2917.031 | ms |
| `S0-PER-004` | remoteCasMeanMs_stress | 2897.311 | ms |
| `S0-PER-004` | remoteCasStdDevMs_stress | 19.721 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_stress | 1251.662 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_stress | 1251.662 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_stress | 1340.911 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_stress | 1340.911 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_stress | 1296.286 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_stress | 44.625 | ms |
| `S0-PER-004` | cleanupMs_stress | 0.006 | ms |
| `S0-PER-004` | throttleRecoveryLatencyMs | 2615.355 | ms |

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
- [Cleanup manifest](cleanup-manifest.json) — `sha256:605246be65388a3c31f6239e30d9f88fdb1e395c860922317fa85f4ddc369a2b`

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
