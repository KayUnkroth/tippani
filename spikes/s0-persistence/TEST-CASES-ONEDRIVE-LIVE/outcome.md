# S0 Outcome: CFG-ONEDRIVE-LIVE

**Report date:** 2026-09-21
**Harness revision:** s0-harness-v4-run-aggregate
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
| Temporary store root | tippani-s0-s0-onedrive-s0-20260920-215851-c1-57NMfO |
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
| Store namespace | redacted-per-run |
| Authentication setup | Live delegated identity (supplied at runtime) |
| Cleanup manifest | see-run-preflights |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:083e2f9c7509612328f8026471115231da9f85dccfa9b43f561e9b1216ff326c |
| Cleanup expiry | see-run-preflights |
| Effective target hash | see-run-preflights |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `redacted-per-run` |
| Operation budget | 500 |
| Duration budget | 300000 ms |
| Object budget | 10000 |
| Storage/transfer budget | 104857600 bytes |
| Final metered operations | 450 |
| Final metered objects | 83 |
| Final metered bytes | 5762159 |
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
| `S0-COL-002` | absolute | Pass | 10639.069 | accounts=1; clientProcesses=2; clientProcessIds=[7620,7584]; executionMode=independent-os-processes; logicalActors=Synthetic Client 1,Synthetic Client 2; winners=1; staleConflicts=1; noSilentOverwrite=true; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[7620,7584],"executionMode":"independent-os-processes","logicalActors":"Synthetic Client 1,Synthetic Client 2","winners":1,"staleConflicts":1,"noSilentOverwrite":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[13520,11780],"executionMode":"independent-os-processes","logicalActors":"Synthetic Client 1,Synthetic Client 2","winners":1,"staleConflicts":1,"noSilentOverwrite":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[11224,8872],"executionMode":"independent-os-processes","logicalActors":"Synthetic Client 1,Synthetic Client 2","winners":1,"staleConflicts":1,"noSilentOverwrite":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Pass | 16664.634 | accounts=1; clientProcesses=2; clientProcessIds=[6164,9808]; executionMode=independent-os-processes; staleGeneration=0; reloadedGeneration=1; reconciledGeneration=2; deterministicReconnect=true; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[6164,9808],"executionMode":"independent-os-processes","staleGeneration":0,"reloadedGeneration":1,"reconciledGeneration":2,"deterministicReconnect":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[13640,10004],"executionMode":"independent-os-processes","staleGeneration":0,"reloadedGeneration":1,"reconciledGeneration":2,"deterministicReconnect":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[2352,12924],"executionMode":"independent-os-processes","staleGeneration":0,"reloadedGeneration":1,"reconciledGeneration":2,"deterministicReconnect":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Pass | 7028.010 | lostResponseDetected=true; noDuplicate=true; reconciledGeneration=1; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"lostResponseDetected":true,"noDuplicate":true,"reconciledGeneration":1},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"lostResponseDetected":true,"noDuplicate":true,"reconciledGeneration":1},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"lostResponseDetected":true,"noDuplicate":true,"reconciledGeneration":1},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Pass | 11471.603 | offlinePendingConflicted=true; processRestartRecoveredQueue=true; queueWriterProcessIds=[11900,9980]; queueRestartInspectorProcessId=1108; fifoStoppedAtFirstConflict=true; staleEntryRetained=true; noSilentOverwrite=true; authorityGeneration=2; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"offlinePendingConflicted":true,"processRestartRecoveredQueue":true,"queueWriterProcessIds":[11900,9980],"queueRestartInspectorProcessId":1108,"fifoStoppedAtFirstConflict":true,"staleEntryRetained":true,"noSilentOverwrite":true,"authorityGeneration":2},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"offlinePendingConflicted":true,"processRestartRecoveredQueue":true,"queueWriterProcessIds":[5628,9816],"queueRestartInspectorProcessId":13740,"fifoStoppedAtFirstConflict":true,"staleEntryRetained":true,"noSilentOverwrite":true,"authorityGeneration":2},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"offlinePendingConflicted":true,"processRestartRecoveredQueue":true,"queueWriterProcessIds":[896,9980],"queueRestartInspectorProcessId":2000,"fifoStoppedAtFirstConflict":true,"staleEntryRetained":true,"noSilentOverwrite":true,"authorityGeneration":2},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Pass | 10460.288 | accounts=1; clientProcesses=2; clientProcessIds=[10004,2480]; executionMode=independent-os-processes; changeMechanism=Graph drive-item polling; observedGeneration=1; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[10004,2480],"executionMode":"independent-os-processes","changeMechanism":"Graph drive-item polling","observedGeneration":1},"measurements":{"collaboratorDiscoveryMs":1163}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[12184,10212],"executionMode":"independent-os-processes","changeMechanism":"Graph drive-item polling","observedGeneration":1},"measurements":{"collaboratorDiscoveryMs":906}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[9268,10316],"executionMode":"independent-os-processes","changeMechanism":"Graph drive-item polling","observedGeneration":1},"measurements":{"collaboratorDiscoveryMs":1163}}} | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Pass | 12088.833 | winners=1; staleConflicts=1; durableGeneration=2; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"winners":1,"staleConflicts":1,"durableGeneration":2},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"winners":1,"staleConflicts":1,"durableGeneration":2},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"winners":1,"staleConflicts":1,"durableGeneration":2},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Pass | 15992.368 | faultsRejected=4; faultsExercised=["auth-expiry","outage","quota","permission-loss","throttle"]; rejectedFaultGenerationUnchanged=true; throttleRecoveredByBoundedRetry=true; throttleResponses=3; retries=1; retryAfterSeconds=[1]; backoffMs=1000; transferredBytes=57644; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"faultsRejected":4,"faultsExercised":["auth-expiry","outage","quota","permission-loss","throttle"],"rejectedFaultGenerationUnchanged":true,"throttleRecoveredByBoundedRetry":true,"throttleResponses":1,"retries":1,"retryAfterSeconds":[1],"backoffMs":1000,"transferredBytes":57644},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"faultsRejected":4,"faultsExercised":["auth-expiry","outage","quota","permission-loss","throttle"],"rejectedFaultGenerationUnchanged":true,"throttleRecoveredByBoundedRetry":true,"throttleResponses":1,"retries":1,"retryAfterSeconds":[1],"backoffMs":1000,"transferredBytes":57644},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"faultsRejected":4,"faultsExercised":["auth-expiry","outage","quota","permission-loss","throttle"],"rejectedFaultGenerationUnchanged":true,"throttleRecoveredByBoundedRetry":true,"throttleResponses":1,"retries":1,"retryAfterSeconds":[1],"backoffMs":1000,"transferredBytes":57644},"measurements":{}}} | [JSON](raw-results.json) |
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
| `S0-MIG-004` | absolute | Pass | 3616.880 | workspaceIdPreserved=true; generation=1; receipt=true; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"workspaceIdPreserved":true,"generation":1,"receipt":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"workspaceIdPreserved":true,"generation":1,"receipt":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"workspaceIdPreserved":true,"generation":1,"receipt":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Pass | 7825.264 | recoveredGeneration=1; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"recoveredGeneration":1},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"recoveredGeneration":1},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"recoveredGeneration":1},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Incomplete | 0.284 | runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Incomplete","evidence":{},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Incomplete","evidence":{},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Incomplete","evidence":{},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Pass | 32265.647 | faultsExercised=["outage","throttle","auth-expiry","quota","permission-loss","lost-response"]; recoveredFaults=["outage","throttle","auth-expiry","quota","permission-loss"]; throttleRecovery={"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000}; lostResponseReconciled=true; blindRetryRejected=true; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"faultsExercised":["outage","throttle","auth-expiry","quota","permission-loss","lost-response"],"recoveredFaults":["outage","throttle","auth-expiry","quota","permission-loss"],"throttleRecovery":{"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000},"lostResponseReconciled":true,"blindRetryRejected":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"faultsExercised":["outage","throttle","auth-expiry","quota","permission-loss","lost-response"],"recoveredFaults":["outage","throttle","auth-expiry","quota","permission-loss"],"throttleRecovery":{"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000},"lostResponseReconciled":true,"blindRetryRejected":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"faultsExercised":["outage","throttle","auth-expiry","quota","permission-loss","lost-response"],"recoveredFaults":["outage","throttle","auth-expiry","quota","permission-loss"],"throttleRecovery":{"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000},"lostResponseReconciled":true,"blindRetryRejected":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Pass | 14021.378 | discoveredNewerAuthority=true; transientFailureRetained=true; processRestartRecoveredQueue=true; queueWriterProcessId=10792; queueRestartInspectorProcessId=10916; noSilentOverwrite=true; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"discoveredNewerAuthority":true,"transientFailureRetained":true,"processRestartRecoveredQueue":true,"queueWriterProcessId":10792,"queueRestartInspectorProcessId":10916,"noSilentOverwrite":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"discoveredNewerAuthority":true,"transientFailureRetained":true,"processRestartRecoveredQueue":true,"queueWriterProcessId":10164,"queueRestartInspectorProcessId":12340,"noSilentOverwrite":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"discoveredNewerAuthority":true,"transientFailureRetained":true,"processRestartRecoveredQueue":true,"queueWriterProcessId":9860,"queueRestartInspectorProcessId":3148,"noSilentOverwrite":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Pass | 0.622 | providerPreflightRejected=true; errorCount=8; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"providerPreflightRejected":true,"errorCount":8},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"providerPreflightRejected":true,"errorCount":8},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"providerPreflightRejected":true,"errorCount":8},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Pass | 0.661 | corporateFallbackImpossible=true; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"corporateFallbackImpossible":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"corporateFallbackImpossible":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"corporateFallbackImpossible":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.576 | syntheticFixtureAccepted=true; actualDataRejected=true; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"syntheticFixtureAccepted":true,"actualDataRejected":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"syntheticFixtureAccepted":true,"actualDataRejected":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"syntheticFixtureAccepted":true,"actualDataRejected":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Pass | 0.619 | configSecretRejected=true; workspaceHasNoSecrets=true; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"configSecretRejected":true,"workspaceHasNoSecrets":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"configSecretRejected":true,"workspaceHasNoSecrets":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"configSecretRejected":true,"workspaceHasNoSecrets":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Fail | 0.596 | runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Fail","evidence":{},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Fail","evidence":{},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Fail","evidence":{},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Pass | 102.681 | nonPositiveBudgetsRejected=true; operationLimitEnforced=true; objectLimitEnforced=true; byteLimitEnforced=true; deadlineEnforced=true; abortSignalEnforced=true; providerChildBudget={"metered":true,"childPid":4656,"operationsBefore":283,"operationsAfter":284}; cleanupBudgeted=true; cleanupSharedDeadline=true; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"nonPositiveBudgetsRejected":true,"operationLimitEnforced":true,"objectLimitEnforced":true,"byteLimitEnforced":true,"deadlineEnforced":true,"abortSignalEnforced":true,"providerChildBudget":{"metered":true,"childPid":4656,"operationsBefore":283,"operationsAfter":284},"cleanupBudgeted":true,"cleanupSharedDeadline":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"nonPositiveBudgetsRejected":true,"operationLimitEnforced":true,"objectLimitEnforced":true,"byteLimitEnforced":true,"deadlineEnforced":true,"abortSignalEnforced":true,"providerChildBudget":{"metered":true,"childPid":4460,"operationsBefore":280,"operationsAfter":281},"cleanupBudgeted":true,"cleanupSharedDeadline":true},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"nonPositiveBudgetsRejected":true,"operationLimitEnforced":true,"objectLimitEnforced":true,"byteLimitEnforced":true,"deadlineEnforced":true,"abortSignalEnforced":true,"providerChildBudget":{"metered":true,"childPid":12244,"operationsBefore":280,"operationsAfter":281},"cleanupBudgeted":true,"cleanupSharedDeadline":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Pass | 56092.087 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; byteMethod=UTF-8 application payload bytes submitted or consumed; repetitions_small=18; requestsPerMutation_small=5; bytesPerMutation_small=11329.166666666666; throttleResponses_small=0; retries_small=0; retryAfterSeconds_small=[]; backoffMs_small=0; requestCount_small=90; requestBytes_small=48294; responseBytes_small=155631; repetitions_medium=12; requestsPerMutation_medium=5; bytesPerMutation_medium=78293.25; throttleResponses_medium=0; retries_medium=0; retryAfterSeconds_medium=[]; backoffMs_medium=0; requestCount_medium=60; requestBytes_medium=300048; responseBytes_medium=639471; repetitions_stress=6; requestsPerMutation_stress=5; bytesPerMutation_stress=1441950.5; throttleResponses_stress=0; retries_stress=0; retryAfterSeconds_stress=[]; backoffMs_stress=0; requestCount_stress=30; requestBytes_stress=2877336; responseBytes_stress=5774367; throttleResponses=3; throttleRetries=3; throttleRetryAfterSeconds=[1,1,1]; throttleBackoffMs=3000; throttleBehavior=bounded retry honored Retry-After and committed once; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"scales":"small,medium,stress","warmupIterations":3,"timingMethod":"performance.now monotonic elapsed time","reportedStatistics":"min,p50,p95,max,mean,stddev","byteMethod":"UTF-8 application payload bytes submitted or consumed","rawSamples":{"small":{"remoteCasMs":[2166.447700000019,1659.5411000000022,1560.9472999999998,1665.1669999999867,1971.7705000000133,1751.4281000000192],"collaboratorDiscoveryMs":[1079.5049,962.3332999999984,1245.6246999999858,1028.1729999999807,1408.7342000000062,928.21179999999],"requestsPerMutation":[5,5,5,5,5,5],"transferredBytesPerMutation":[10895,11068,11242,11416,11590,11764],"requestBytesPerMutation":[2538,2596,2654,2712,2770,2828],"responseBytesPerMutation":[8357,8472,8588,8704,8820,8936],"retriesPerMutation":[0,0,0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0,0,0]},"medium":{"remoteCasMs":[1619.664300000004,1677.7335999999777,2103.8225000000093,1660.4709999999905],"collaboratorDiscoveryMs":[946.4514999999956,833.0660999999964,1135.3198000000266,905.6506999999983],"requestsPerMutation":[5,5,5,5],"transferredBytesPerMutation":[78033,78206,78380,78554],"requestBytesPerMutation":[24917,24975,25033,25091],"responseBytesPerMutation":[53116,53231,53347,53463],"retriesPerMutation":[0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0]},"stress":{"remoteCasMs":[2243.402700000006,2467.934899999993],"collaboratorDiscoveryMs":[916.8589999999967,875.5749000000069],"requestsPerMutation":[5,5],"transferredBytesPerMutation":[1441864,1442037],"requestBytesPerMutation":[479527,479585],"responseBytesPerMutation":[962337,962452],"retriesPerMutation":[0,0],"throttleResponsesPerMutation":[0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0]}},"repetitions_small":6,"requestsPerMutation_small":5,"bytesPerMutation_small":11329.167,"throttleResponses_small":0,"retries_small":0,"retryAfterSeconds_small":[],"backoffMs_small":0,"requestCount_small":30,"requestBytes_small":16098,"responseBytes_small":51877,"repetitions_medium":4,"requestsPerMutation_medium":5,"bytesPerMutation_medium":78293.25,"throttleResponses_medium":0,"retries_medium":0,"retryAfterSeconds_medium":[],"backoffMs_medium":0,"requestCount_medium":20,"requestBytes_medium":100016,"responseBytes_medium":213157,"repetitions_stress":2,"requestsPerMutation_stress":5,"bytesPerMutation_stress":1441950.5,"throttleResponses_stress":0,"retries_stress":0,"retryAfterSeconds_stress":[],"backoffMs_stress":0,"requestCount_stress":10,"requestBytes_stress":959112,"responseBytes_stress":1924789,"throttleResponses":1,"throttleRetries":1,"throttleRetryAfterSeconds":[1],"throttleBackoffMs":1000,"throttleBehavior":"bounded retry honored Retry-After and committed once"},"measurements":{"setupMs_small":8357.577300000004,"warmupMs_small":3376.4022000000114,"remoteCasMinMs_small":1560.9472999999998,"remoteCasP50Ms_small":1665.1669999999867,"remoteCasP95Ms_small":2166.447700000019,"remoteCasMaxMs_small":2166.447700000019,"remoteCasMeanMs_small":1795.8836166666733,"remoteCasStdDevMs_small":208.60705371590714,"collaboratorDiscoveryMinMs_small":928.21179999999,"collaboratorDiscoveryP50Ms_small":1028.1729999999807,"collaboratorDiscoveryP95Ms_small":1408.7342000000062,"collaboratorDiscoveryMaxMs_small":1408.7342000000062,"collaboratorDiscoveryMeanMs_small":1108.7636499999935,"collaboratorDiscoveryStdDevMs_small":168.37706847674855,"cleanupMs_small":0.024999999994179234,"setupMs_medium":8281.309299999994,"warmupMs_medium":2737.247100000008,"remoteCasMinMs_medium":1619.664300000004,"remoteCasP50Ms_medium":1660.4709999999905,"remoteCasP95Ms_medium":2103.8225000000093,"remoteCasMaxMs_medium":2103.8225000000093,"remoteCasMeanMs_medium":1765.4228499999954,"remoteCasStdDevMs_medium":196.50965205443538,"collaboratorDiscoveryMinMs_medium":833.0660999999964,"collaboratorDiscoveryP50Ms_medium":905.6506999999983,"collaboratorDiscoveryP95Ms_medium":1135.3198000000266,"collaboratorDiscoveryMaxMs_medium":1135.3198000000266,"collaboratorDiscoveryMeanMs_medium":955.1220250000042,"collaboratorDiscoveryStdDevMs_medium":111.68200050097398,"cleanupMs_medium":0.0044000000052619725,"setupMs_stress":8170.046800000011,"warmupMs_stress":3079.853999999992,"remoteCasMinMs_stress":2243.402700000006,"remoteCasP50Ms_stress":2243.402700000006,"remoteCasP95Ms_stress":2467.934899999993,"remoteCasMaxMs_stress":2467.934899999993,"remoteCasMeanMs_stress":2355.6687999999995,"remoteCasStdDevMs_stress":112.26609999999346,"collaboratorDiscoveryMinMs_stress":875.5749000000069,"collaboratorDiscoveryP50Ms_stress":875.5749000000069,"collaboratorDiscoveryP95Ms_stress":916.8589999999967,"collaboratorDiscoveryMaxMs_stress":916.8589999999967,"collaboratorDiscoveryMeanMs_stress":896.2169500000018,"collaboratorDiscoveryStdDevMs_stress":20.642049999994924,"cleanupMs_stress":0.00810000000637956,"throttleRecoveryLatencyMs":3191.366299999994}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"scales":"small,medium,stress","warmupIterations":3,"timingMethod":"performance.now monotonic elapsed time","reportedStatistics":"min,p50,p95,max,mean,stddev","byteMethod":"UTF-8 application payload bytes submitted or consumed","rawSamples":{"small":{"remoteCasMs":[1669.365300000005,2021.3013999999966,1646.1079000000027,1556.5797999999777,1564.1576999999816,1517.1155000000144],"collaboratorDiscoveryMs":[1251.5037999999768,838.7588999999862,861.164700000023,1316.7715000000026,867.2946000000229,1239.2416000000085],"requestsPerMutation":[5,5,5,5,5,5],"transferredBytesPerMutation":[10895,11068,11242,11416,11590,11764],"requestBytesPerMutation":[2538,2596,2654,2712,2770,2828],"responseBytesPerMutation":[8357,8472,8588,8704,8820,8936],"retriesPerMutation":[0,0,0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0,0,0]},"medium":{"remoteCasMs":[1529.6918999999762,1849.2470999999787,1721.428900000028,2296.818200000009],"collaboratorDiscoveryMs":[1127.9047000000137,1196.0583999999799,996.1281000000017,868.9508999999962],"requestsPerMutation":[5,5,5,5],"transferredBytesPerMutation":[78033,78206,78380,78554],"requestBytesPerMutation":[24917,24975,25033,25091],"responseBytesPerMutation":[53116,53231,53347,53463],"retriesPerMutation":[0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0]},"stress":{"remoteCasMs":[2877.589800000016,2917.0313000000024],"collaboratorDiscoveryMs":[1251.6618000000017,1340.9108000000124],"requestsPerMutation":[5,5],"transferredBytesPerMutation":[1441864,1442037],"requestBytesPerMutation":[479527,479585],"responseBytesPerMutation":[962337,962452],"retriesPerMutation":[0,0],"throttleResponsesPerMutation":[0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0]}},"repetitions_small":6,"requestsPerMutation_small":5,"bytesPerMutation_small":11329.167,"throttleResponses_small":0,"retries_small":0,"retryAfterSeconds_small":[],"backoffMs_small":0,"requestCount_small":30,"requestBytes_small":16098,"responseBytes_small":51877,"repetitions_medium":4,"requestsPerMutation_medium":5,"bytesPerMutation_medium":78293.25,"throttleResponses_medium":0,"retries_medium":0,"retryAfterSeconds_medium":[],"backoffMs_medium":0,"requestCount_medium":20,"requestBytes_medium":100016,"responseBytes_medium":213157,"repetitions_stress":2,"requestsPerMutation_stress":5,"bytesPerMutation_stress":1441950.5,"throttleResponses_stress":0,"retries_stress":0,"retryAfterSeconds_stress":[],"backoffMs_stress":0,"requestCount_stress":10,"requestBytes_stress":959112,"responseBytes_stress":1924789,"throttleResponses":1,"throttleRetries":1,"throttleRetryAfterSeconds":[1],"throttleBackoffMs":1000,"throttleBehavior":"bounded retry honored Retry-After and committed once"},"measurements":{"setupMs_small":7863.779600000009,"warmupMs_small":2993.561699999991,"remoteCasMinMs_small":1517.1155000000144,"remoteCasP50Ms_small":1564.1576999999816,"remoteCasP95Ms_small":2021.3013999999966,"remoteCasMaxMs_small":2021.3013999999966,"remoteCasMeanMs_small":1662.4379333333297,"remoteCasStdDevMs_small":168.85950984591454,"collaboratorDiscoveryMinMs_small":838.7588999999862,"collaboratorDiscoveryP50Ms_small":867.2946000000229,"collaboratorDiscoveryP95Ms_small":1316.7715000000026,"collaboratorDiscoveryMaxMs_small":1316.7715000000026,"collaboratorDiscoveryMeanMs_small":1062.4558500000032,"collaboratorDiscoveryStdDevMs_small":208.2927205666577,"cleanupMs_small":0.024000000004889444,"setupMs_medium":8020.466600000014,"warmupMs_medium":2995.613100000017,"remoteCasMinMs_medium":1529.6918999999762,"remoteCasP50Ms_medium":1721.428900000028,"remoteCasP95Ms_medium":2296.818200000009,"remoteCasMaxMs_medium":2296.818200000009,"remoteCasMeanMs_medium":1849.296524999998,"remoteCasStdDevMs_medium":282.2998839364725,"collaboratorDiscoveryMinMs_medium":868.9508999999962,"collaboratorDiscoveryP50Ms_medium":996.1281000000017,"collaboratorDiscoveryP95Ms_medium":1196.0583999999799,"collaboratorDiscoveryMaxMs_medium":1196.0583999999799,"collaboratorDiscoveryMeanMs_medium":1047.2605249999979,"collaboratorDiscoveryStdDevMs_medium":125.55191936004493,"cleanupMs_medium":0.0046999999904073775,"setupMs_stress":8878.89440000002,"warmupMs_stress":3130.0339000000095,"remoteCasMinMs_stress":2877.589800000016,"remoteCasP50Ms_stress":2877.589800000016,"remoteCasP95Ms_stress":2917.0313000000024,"remoteCasMaxMs_stress":2917.0313000000024,"remoteCasMeanMs_stress":2897.3105500000092,"remoteCasStdDevMs_stress":19.72074999999313,"collaboratorDiscoveryMinMs_stress":1251.6618000000017,"collaboratorDiscoveryP50Ms_stress":1251.6618000000017,"collaboratorDiscoveryP95Ms_stress":1340.9108000000124,"collaboratorDiscoveryMaxMs_stress":1340.9108000000124,"collaboratorDiscoveryMeanMs_stress":1296.286300000007,"collaboratorDiscoveryStdDevMs_stress":44.624500000005355,"cleanupMs_stress":0.005699999979697168,"throttleRecoveryLatencyMs":2615.354800000001}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"scales":"small,medium,stress","warmupIterations":3,"timingMethod":"performance.now monotonic elapsed time","reportedStatistics":"min,p50,p95,max,mean,stddev","byteMethod":"UTF-8 application payload bytes submitted or consumed","rawSamples":{"small":{"remoteCasMs":[1162.4427999999898,995.1230999999971,1011.4097000000038,983.2098999999871,880.1693999999989,1112.9903999999951],"collaboratorDiscoveryMs":[481.34449999999197,431.8652000000002,488.41240000000107,513.1812999999966,417.35729999998875,559.3178999999946],"requestsPerMutation":[5,5,5,5,5,5],"transferredBytesPerMutation":[10895,11068,11242,11416,11590,11764],"requestBytesPerMutation":[2538,2596,2654,2712,2770,2828],"responseBytesPerMutation":[8357,8472,8588,8704,8820,8936],"retriesPerMutation":[0,0,0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0,0,0]},"medium":{"remoteCasMs":[1067.7908000000025,1045.8515999999945,934.4005999999936,1151.8533000000025],"collaboratorDiscoveryMs":[841.629099999991,547.095599999986,518.2299000000057,471.4710999999952],"requestsPerMutation":[5,5,5,5],"transferredBytesPerMutation":[78033,78206,78380,78554],"requestBytesPerMutation":[24917,24975,25033,25091],"responseBytesPerMutation":[53116,53231,53347,53463],"retriesPerMutation":[0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0]},"stress":{"remoteCasMs":[1030.0895999999775,1400.539999999979],"collaboratorDiscoveryMs":[504.79790000000503,801.2750999999989],"requestsPerMutation":[5,5],"transferredBytesPerMutation":[1441864,1442037],"requestBytesPerMutation":[479527,479585],"responseBytesPerMutation":[962337,962452],"retriesPerMutation":[0,0],"throttleResponsesPerMutation":[0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0]}},"repetitions_small":6,"requestsPerMutation_small":5,"bytesPerMutation_small":11329.167,"throttleResponses_small":0,"retries_small":0,"retryAfterSeconds_small":[],"backoffMs_small":0,"requestCount_small":30,"requestBytes_small":16098,"responseBytes_small":51877,"repetitions_medium":4,"requestsPerMutation_medium":5,"bytesPerMutation_medium":78293.25,"throttleResponses_medium":0,"retries_medium":0,"retryAfterSeconds_medium":[],"backoffMs_medium":0,"requestCount_medium":20,"requestBytes_medium":100016,"responseBytes_medium":213157,"repetitions_stress":2,"requestsPerMutation_stress":5,"bytesPerMutation_stress":1441950.5,"throttleResponses_stress":0,"retries_stress":0,"retryAfterSeconds_stress":[],"backoffMs_stress":0,"requestCount_stress":10,"requestBytes_stress":959112,"responseBytes_stress":1924789,"throttleResponses":1,"throttleRetries":1,"throttleRetryAfterSeconds":[1],"throttleBackoffMs":1000,"throttleBehavior":"bounded retry honored Retry-After and committed once"},"measurements":{"setupMs_small":4061.991599999994,"warmupMs_small":1670.5782999999938,"remoteCasMinMs_small":880.1693999999989,"remoteCasP50Ms_small":995.1230999999971,"remoteCasP95Ms_small":1162.4427999999898,"remoteCasMaxMs_small":1162.4427999999898,"remoteCasMeanMs_small":1024.224216666662,"remoteCasStdDevMs_small":91.67775383318292,"collaboratorDiscoveryMinMs_small":417.35729999998875,"collaboratorDiscoveryP50Ms_small":481.34449999999197,"collaboratorDiscoveryP95Ms_small":559.3178999999946,"collaboratorDiscoveryMaxMs_small":559.3178999999946,"collaboratorDiscoveryMeanMs_small":481.9130999999955,"collaboratorDiscoveryStdDevMs_small":47.756345492476,"cleanupMs_small":0.0239000000001397,"setupMs_medium":4086.850099999996,"warmupMs_medium":1463.2013000000006,"remoteCasMinMs_medium":934.4005999999936,"remoteCasP50Ms_medium":1045.8515999999945,"remoteCasP95Ms_medium":1151.8533000000025,"remoteCasMaxMs_medium":1151.8533000000025,"remoteCasMeanMs_medium":1049.9740749999983,"remoteCasStdDevMs_medium":77.57421462707443,"collaboratorDiscoveryMinMs_medium":471.4710999999952,"collaboratorDiscoveryP50Ms_medium":518.2299000000057,"collaboratorDiscoveryP95Ms_medium":841.629099999991,"collaboratorDiscoveryMaxMs_medium":841.629099999991,"collaboratorDiscoveryMeanMs_medium":594.6064249999945,"collaboratorDiscoveryStdDevMs_medium":145.1492010745019,"cleanupMs_medium":0.006099999998696148,"setupMs_stress":5317.486600000004,"warmupMs_stress":1665.0809000000008,"remoteCasMinMs_stress":1030.0895999999775,"remoteCasP50Ms_stress":1030.0895999999775,"remoteCasP95Ms_stress":1400.539999999979,"remoteCasMaxMs_stress":1400.539999999979,"remoteCasMeanMs_stress":1215.3147999999783,"remoteCasStdDevMs_stress":185.22520000000077,"collaboratorDiscoveryMinMs_stress":504.79790000000503,"collaboratorDiscoveryP50Ms_stress":504.79790000000503,"collaboratorDiscoveryP95Ms_stress":801.2750999999989,"collaboratorDiscoveryMaxMs_stress":801.2750999999989,"collaboratorDiscoveryMeanMs_stress":653.036500000002,"collaboratorDiscoveryStdDevMs_stress":148.23859999999695,"cleanupMs_stress":0.005700000008800998,"throttleRecoveryLatencyMs":2271.1021000000183}}} | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.303 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=2; implementation=3; test=4; migration=3; deployment=3; maintenance=3; diagnostics=3; recovery=3; rationale={"dependencies":"Microsoft Graph drive API and delegated authentication","implementation":"Graph drive-item envelope with ETag CAS and version history","test":"Live sandbox, concurrency, offline, failure, version, and cleanup coverage","migration":"Receipt-gated local-to-drive rehome","deployment":"Delegated credential, drive coordinates, and approved namespace","maintenance":"Graph API and OneDrive consistency behavior","diagnostics":"Provider responses, request telemetry, and authoritative generation state","recovery":"Version history plus offline conflict reconciliation"}; total=24; mean=3; runs={"s0-onedrive-s0-20260920-215851-c1":{"status":"Pass","evidence":{"scale":"1=trivial, 2=low, 3=moderate, 4=high, 5=very high","dependencies":2,"implementation":3,"test":4,"migration":3,"deployment":3,"maintenance":3,"diagnostics":3,"recovery":3,"rationale":{"dependencies":"Microsoft Graph drive API and delegated authentication","implementation":"Graph drive-item envelope with ETag CAS and version history","test":"Live sandbox, concurrency, offline, failure, version, and cleanup coverage","migration":"Receipt-gated local-to-drive rehome","deployment":"Delegated credential, drive coordinates, and approved namespace","maintenance":"Graph API and OneDrive consistency behavior","diagnostics":"Provider responses, request telemetry, and authoritative generation state","recovery":"Version history plus offline conflict reconciliation"},"total":24,"mean":3},"measurements":{}},"s0-onedrive-s0-20260920-215851-c2":{"status":"Pass","evidence":{"scale":"1=trivial, 2=low, 3=moderate, 4=high, 5=very high","dependencies":2,"implementation":3,"test":4,"migration":3,"deployment":3,"maintenance":3,"diagnostics":3,"recovery":3,"rationale":{"dependencies":"Microsoft Graph drive API and delegated authentication","implementation":"Graph drive-item envelope with ETag CAS and version history","test":"Live sandbox, concurrency, offline, failure, version, and cleanup coverage","migration":"Receipt-gated local-to-drive rehome","deployment":"Delegated credential, drive coordinates, and approved namespace","maintenance":"Graph API and OneDrive consistency behavior","diagnostics":"Provider responses, request telemetry, and authoritative generation state","recovery":"Version history plus offline conflict reconciliation"},"total":24,"mean":3},"measurements":{}},"s0-onedrive-s0-20260920-215851-c3":{"status":"Pass","evidence":{"scale":"1=trivial, 2=low, 3=moderate, 4=high, 5=very high","dependencies":2,"implementation":3,"test":4,"migration":3,"deployment":3,"maintenance":3,"diagnostics":3,"recovery":3,"rationale":{"dependencies":"Microsoft Graph drive API and delegated authentication","implementation":"Graph drive-item envelope with ETag CAS and version history","test":"Live sandbox, concurrency, offline, failure, version, and cleanup coverage","migration":"Receipt-gated local-to-drive rehome","deployment":"Delegated credential, drive coordinates, and approved namespace","maintenance":"Graph API and OneDrive consistency behavior","diagnostics":"Provider responses, request telemetry, and authoritative generation state","recovery":"Version history plus offline conflict reconciliation"},"total":24,"mean":3},"measurements":{}}} | [JSON](raw-results.json) |

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
| `S0-COL-006` | collaboratorDiscoveryMs | 1077.333 | ms |
| `S0-PER-004` | setupMs_small | 6761.116 | ms |
| `S0-PER-004` | warmupMs_small | 2680.181 | ms |
| `S0-PER-004` | remoteCasMinMs_small | 880.169 | ms |
| `S0-PER-004` | remoteCasP50Ms_small | 1560.947 | ms |
| `S0-PER-004` | remoteCasP95Ms_small | 2166.448 | ms |
| `S0-PER-004` | remoteCasMaxMs_small | 2166.448 | ms |
| `S0-PER-004` | remoteCasMeanMs_small | 1494.182 | ms |
| `S0-PER-004` | remoteCasStdDevMs_small | 385.302 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_small | 417.357 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_small | 867.295 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_small | 1408.734 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_small | 1408.734 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_small | 884.378 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_small | 335.045 | ms |
| `S0-PER-004` | cleanupMs_small | 0.024 | ms |
| `S0-PER-004` | setupMs_medium | 6796.209 | ms |
| `S0-PER-004` | warmupMs_medium | 2398.687 | ms |
| `S0-PER-004` | remoteCasMinMs_medium | 934.401 | ms |
| `S0-PER-004` | remoteCasP50Ms_medium | 1619.664 | ms |
| `S0-PER-004` | remoteCasP95Ms_medium | 2296.818 | ms |
| `S0-PER-004` | remoteCasMaxMs_medium | 2296.818 | ms |
| `S0-PER-004` | remoteCasMeanMs_medium | 1554.898 | ms |
| `S0-PER-004` | remoteCasStdDevMs_medium | 430.757 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_medium | 471.471 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_medium | 868.951 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_medium | 1196.058 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_medium | 1196.058 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_medium | 865.663 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_medium | 244.024 | ms |
| `S0-PER-004` | cleanupMs_medium | 0.005 | ms |
| `S0-PER-004` | setupMs_stress | 7455.476 | ms |
| `S0-PER-004` | warmupMs_stress | 2624.990 | ms |
| `S0-PER-004` | remoteCasMinMs_stress | 1030.090 | ms |
| `S0-PER-004` | remoteCasP50Ms_stress | 2243.403 | ms |
| `S0-PER-004` | remoteCasP95Ms_stress | 2917.031 | ms |
| `S0-PER-004` | remoteCasMaxMs_stress | 2917.031 | ms |
| `S0-PER-004` | remoteCasMeanMs_stress | 2156.098 | ms |
| `S0-PER-004` | remoteCasStdDevMs_stress | 780.153 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_stress | 504.798 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_stress | 875.575 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_stress | 1340.911 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_stress | 1340.911 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_stress | 948.513 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_stress | 306.842 | ms |
| `S0-PER-004` | cleanupMs_stress | 0.006 | ms |
| `S0-PER-004` | throttleRecoveryLatencyMs | 2692.608 | ms |

## Repeated live runs

| Run | Report | Raw evidence |
|---|---|---|
| s0-onedrive-s0-20260920-215851-c1 | [report](runs/s0-onedrive-s0-20260920-215851-c1/outcome.md) | [JSON](runs/s0-onedrive-s0-20260920-215851-c1/raw-results.json) |
| s0-onedrive-s0-20260920-215851-c2 | [report](runs/s0-onedrive-s0-20260920-215851-c2/outcome.md) | [JSON](runs/s0-onedrive-s0-20260920-215851-c2/raw-results.json) |
| s0-onedrive-s0-20260920-215851-c3 | [report](runs/s0-onedrive-s0-20260920-215851-c3/outcome.md) | [JSON](runs/s0-onedrive-s0-20260920-215851-c3/raw-results.json) |

### Between-run variability

| Metric | Samples | Minimum | p50 | p95 | Maximum | Mean | Std. dev. |
|---|---:|---:|---:|---:|---:|---:|---:|
| setupMs_small | 3 | 4061.992 | 7863.780 | 8357.577 | 8357.577 | 6761.116 | 2350.514 |
| warmupMs_small | 3 | 1670.578 | 2993.562 | 3376.402 | 3376.402 | 2680.181 | 895.050 |
| remoteCasMinMs_small | 3 | 880.169 | 1517.116 | 1560.947 | 1560.947 | 1319.411 | 381.025 |
| remoteCasP50Ms_small | 3 | 995.123 | 1564.158 | 1665.167 | 1665.167 | 1408.149 | 361.239 |
| remoteCasP95Ms_small | 3 | 1162.443 | 2021.301 | 2166.448 | 2166.448 | 1783.397 | 542.637 |
| remoteCasMaxMs_small | 3 | 1162.443 | 2021.301 | 2166.448 | 2166.448 | 1783.397 | 542.637 |
| remoteCasMeanMs_small | 3 | 1024.224 | 1662.438 | 1795.884 | 1795.884 | 1494.182 | 412.428 |
| remoteCasStdDevMs_small | 3 | 91.678 | 168.860 | 208.607 | 208.607 | 156.381 | 59.455 |
| collaboratorDiscoveryMinMs_small | 3 | 417.357 | 838.759 | 928.212 | 928.212 | 728.109 | 272.811 |
| collaboratorDiscoveryP50Ms_small | 3 | 481.344 | 867.295 | 1028.173 | 1028.173 | 792.271 | 281.028 |
| collaboratorDiscoveryP95Ms_small | 3 | 559.318 | 1316.772 | 1408.734 | 1408.734 | 1094.941 | 466.137 |
| collaboratorDiscoveryMaxMs_small | 3 | 559.318 | 1316.772 | 1408.734 | 1408.734 | 1094.941 | 466.137 |
| collaboratorDiscoveryMeanMs_small | 3 | 481.913 | 1062.456 | 1108.764 | 1108.764 | 884.378 | 349.313 |
| collaboratorDiscoveryStdDevMs_small | 3 | 47.756 | 168.377 | 208.293 | 208.293 | 141.475 | 83.581 |
| cleanupMs_small | 3 | 0.024 | 0.024 | 0.025 | 0.025 | 0.024 | 0.001 |
| setupMs_medium | 3 | 4086.850 | 8020.467 | 8281.309 | 8281.309 | 6796.209 | 2349.995 |
| warmupMs_medium | 3 | 1463.201 | 2737.247 | 2995.613 | 2995.613 | 2398.687 | 820.389 |
| remoteCasMinMs_medium | 3 | 934.401 | 1529.692 | 1619.664 | 1619.664 | 1361.252 | 372.392 |
| remoteCasP50Ms_medium | 3 | 1045.852 | 1660.471 | 1721.429 | 1721.429 | 1475.917 | 373.693 |
| remoteCasP95Ms_medium | 3 | 1151.853 | 2103.823 | 2296.818 | 2296.818 | 1850.831 | 612.976 |
| remoteCasMaxMs_medium | 3 | 1151.853 | 2103.823 | 2296.818 | 2296.818 | 1850.831 | 612.976 |
| remoteCasMeanMs_medium | 3 | 1049.974 | 1765.423 | 1849.297 | 1849.297 | 1554.898 | 439.283 |
| remoteCasStdDevMs_medium | 3 | 77.574 | 196.510 | 282.300 | 282.300 | 185.461 | 102.809 |
| collaboratorDiscoveryMinMs_medium | 3 | 471.471 | 833.066 | 868.951 | 868.951 | 724.496 | 219.859 |
| collaboratorDiscoveryP50Ms_medium | 3 | 518.230 | 905.651 | 996.128 | 996.128 | 806.670 | 253.859 |
| collaboratorDiscoveryP95Ms_medium | 3 | 841.629 | 1135.320 | 1196.058 | 1196.058 | 1057.669 | 189.545 |
| collaboratorDiscoveryMaxMs_medium | 3 | 841.629 | 1135.320 | 1196.058 | 1196.058 | 1057.669 | 189.545 |
| collaboratorDiscoveryMeanMs_medium | 3 | 594.606 | 955.122 | 1047.261 | 1047.261 | 865.663 | 239.220 |
| collaboratorDiscoveryStdDevMs_medium | 3 | 111.682 | 125.552 | 145.149 | 145.149 | 127.461 | 16.815 |
| cleanupMs_medium | 3 | 0.004 | 0.005 | 0.006 | 0.006 | 0.005 | 0.001 |
| setupMs_stress | 3 | 5317.487 | 8170.047 | 8878.894 | 8878.894 | 7455.476 | 1885.170 |
| warmupMs_stress | 3 | 1665.081 | 3079.854 | 3130.034 | 3130.034 | 2624.990 | 831.684 |
| remoteCasMinMs_stress | 3 | 1030.090 | 2243.403 | 2877.590 | 2877.590 | 2050.361 | 938.756 |
| remoteCasP50Ms_stress | 3 | 1030.090 | 2243.403 | 2877.590 | 2877.590 | 2050.361 | 938.756 |
| remoteCasP95Ms_stress | 3 | 1400.540 | 2467.935 | 2917.031 | 2917.031 | 2261.835 | 778.970 |
| remoteCasMaxMs_stress | 3 | 1400.540 | 2467.935 | 2917.031 | 2917.031 | 2261.835 | 778.970 |
| remoteCasMeanMs_stress | 3 | 1215.315 | 2355.669 | 2897.311 | 2897.311 | 2156.098 | 858.574 |
| remoteCasStdDevMs_stress | 3 | 19.721 | 112.266 | 185.225 | 185.225 | 105.737 | 82.945 |
| collaboratorDiscoveryMinMs_stress | 3 | 504.798 | 875.575 | 1251.662 | 1251.662 | 877.345 | 373.435 |
| collaboratorDiscoveryP50Ms_stress | 3 | 504.798 | 875.575 | 1251.662 | 1251.662 | 877.345 | 373.435 |
| collaboratorDiscoveryP95Ms_stress | 3 | 801.275 | 916.859 | 1340.911 | 1340.911 | 1019.682 | 284.132 |
| collaboratorDiscoveryMaxMs_stress | 3 | 801.275 | 916.859 | 1340.911 | 1340.911 | 1019.682 | 284.132 |
| collaboratorDiscoveryMeanMs_stress | 3 | 653.037 | 896.217 | 1296.286 | 1296.286 | 948.513 | 324.798 |
| collaboratorDiscoveryStdDevMs_stress | 3 | 20.642 | 44.625 | 148.239 | 148.239 | 71.168 | 67.813 |
| cleanupMs_stress | 3 | 0.006 | 0.006 | 0.008 | 0.008 | 0.006 | 0.001 |
| throttleRecoveryLatencyMs | 3 | 2271.102 | 2615.355 | 3191.366 | 3191.366 | 2692.608 | 464.970 |

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
- [Cleanup manifest](cleanup-manifest.json) — `sha256:083e2f9c7509612328f8026471115231da9f85dccfa9b43f561e9b1216ff326c`

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
