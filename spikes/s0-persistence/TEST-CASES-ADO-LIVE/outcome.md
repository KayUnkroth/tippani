# S0 Outcome: CFG-ADO-LIVE

**Report date:** 2026-09-21
**Harness revision:** s0-harness-v4-run-aggregate
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
| Store namespace | redacted-per-run |
| Authentication setup | One Azure DevOps identity (supplied at runtime) |
| Cleanup manifest | see-run-preflights |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:9038276896a0ce66c13619962884e2ad5e54de9256031c7a86892ef739c56e33 |
| Cleanup expiry | see-run-preflights |
| Effective target hash | see-run-preflights |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `redacted-per-run` |
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
| `S0-COL-002` | absolute | Pass | 3702.119 | accounts=1; clientProcesses=2; clientProcessIds=[2848,5940]; executionMode=independent-os-processes; logicalActors=Synthetic Client 1,Synthetic Client 2; winners=1; staleConflicts=1; noSilentOverwrite=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[2848,5940],"executionMode":"independent-os-processes","logicalActors":"Synthetic Client 1,Synthetic Client 2","winners":1,"staleConflicts":1,"noSilentOverwrite":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[10860,12496],"executionMode":"independent-os-processes","logicalActors":"Synthetic Client 1,Synthetic Client 2","winners":1,"staleConflicts":1,"noSilentOverwrite":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[9968,13272],"executionMode":"independent-os-processes","logicalActors":"Synthetic Client 1,Synthetic Client 2","winners":1,"staleConflicts":1,"noSilentOverwrite":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Pass | 4202.150 | accounts=1; clientProcesses=2; clientProcessIds=[4896,13168]; executionMode=independent-os-processes; staleGeneration=0; reloadedGeneration=1; reconciledGeneration=2; deterministicReconnect=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[4896,13168],"executionMode":"independent-os-processes","staleGeneration":0,"reloadedGeneration":1,"reconciledGeneration":2,"deterministicReconnect":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[5600,11336],"executionMode":"independent-os-processes","staleGeneration":0,"reloadedGeneration":1,"reconciledGeneration":2,"deterministicReconnect":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[6864,11832],"executionMode":"independent-os-processes","staleGeneration":0,"reloadedGeneration":1,"reconciledGeneration":2,"deterministicReconnect":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Pass | 2108.920 | lostResponseDetected=true; noDuplicate=true; reconciledGeneration=1; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"lostResponseDetected":true,"noDuplicate":true,"reconciledGeneration":1},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"lostResponseDetected":true,"noDuplicate":true,"reconciledGeneration":1},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"lostResponseDetected":true,"noDuplicate":true,"reconciledGeneration":1},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Pass | 3803.759 | offlinePendingConflicted=true; processRestartRecoveredQueue=true; queueWriterProcessIds=[11280,11384]; queueRestartInspectorProcessId=7516; fifoStoppedAtFirstConflict=true; staleEntryRetained=true; noSilentOverwrite=true; authorityGeneration=2; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"offlinePendingConflicted":true,"processRestartRecoveredQueue":true,"queueWriterProcessIds":[11280,11384],"queueRestartInspectorProcessId":7516,"fifoStoppedAtFirstConflict":true,"staleEntryRetained":true,"noSilentOverwrite":true,"authorityGeneration":2},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"offlinePendingConflicted":true,"processRestartRecoveredQueue":true,"queueWriterProcessIds":[2096,4832],"queueRestartInspectorProcessId":10084,"fifoStoppedAtFirstConflict":true,"staleEntryRetained":true,"noSilentOverwrite":true,"authorityGeneration":2},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"offlinePendingConflicted":true,"processRestartRecoveredQueue":true,"queueWriterProcessIds":[1652,11364],"queueRestartInspectorProcessId":5160,"fifoStoppedAtFirstConflict":true,"staleEntryRetained":true,"noSilentOverwrite":true,"authorityGeneration":2},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Pass | 3067.058 | accounts=1; clientProcesses=2; clientProcessIds=[10008,3408]; executionMode=independent-os-processes; changeMechanism=ADO branch/ref and item polling; observedGeneration=1; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[10008,3408],"executionMode":"independent-os-processes","changeMechanism":"ADO branch/ref and item polling","observedGeneration":1},"measurements":{"collaboratorDiscoveryMs":95}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[8916,10124],"executionMode":"independent-os-processes","changeMechanism":"ADO branch/ref and item polling","observedGeneration":1},"measurements":{"collaboratorDiscoveryMs":60}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[5172,12488],"executionMode":"independent-os-processes","changeMechanism":"ADO branch/ref and item polling","observedGeneration":1},"measurements":{"collaboratorDiscoveryMs":58}}} | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Pass | 4915.164 | winners=1; staleConflicts=1; durableGeneration=2; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"winners":1,"staleConflicts":1,"durableGeneration":2},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"winners":1,"staleConflicts":1,"durableGeneration":2},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"winners":1,"staleConflicts":1,"durableGeneration":2},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Pass | 9147.580 | faultsRejected=4; faultsExercised=["auth-expiry","outage","quota","permission-loss","throttle"]; rejectedFaultGenerationUnchanged=true; throttleRecoveredByBoundedRetry=true; throttleResponses=3; retries=1; retryAfterSeconds=[1]; backoffMs=1000; transferredBytes=92487; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"faultsRejected":4,"faultsExercised":["auth-expiry","outage","quota","permission-loss","throttle"],"rejectedFaultGenerationUnchanged":true,"throttleRecoveredByBoundedRetry":true,"throttleResponses":1,"retries":1,"retryAfterSeconds":[1],"backoffMs":1000,"transferredBytes":92487},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"faultsRejected":4,"faultsExercised":["auth-expiry","outage","quota","permission-loss","throttle"],"rejectedFaultGenerationUnchanged":true,"throttleRecoveredByBoundedRetry":true,"throttleResponses":1,"retries":1,"retryAfterSeconds":[1],"backoffMs":1000,"transferredBytes":92487},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"faultsRejected":4,"faultsExercised":["auth-expiry","outage","quota","permission-loss","throttle"],"rejectedFaultGenerationUnchanged":true,"throttleRecoveredByBoundedRetry":true,"throttleResponses":1,"retries":1,"retryAfterSeconds":[1],"backoffMs":1000,"transferredBytes":92487},"measurements":{}}} | [JSON](raw-results.json) |
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
| `S0-MIG-004` | absolute | Pass | 1434.747 | workspaceIdPreserved=true; generation=1; receipt=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"workspaceIdPreserved":true,"generation":1,"receipt":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"workspaceIdPreserved":true,"generation":1,"receipt":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"workspaceIdPreserved":true,"generation":1,"receipt":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Pass | 2890.180 | recoveredGeneration=1; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"recoveredGeneration":1},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"recoveredGeneration":1},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"recoveredGeneration":1},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Pass | 4194.301 | restoredGeneration=2; oneHead=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"restoredGeneration":2,"oneHead":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"restoredGeneration":2,"oneHead":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"restoredGeneration":2,"oneHead":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Pass | 17528.300 | faultsExercised=["outage","throttle","auth-expiry","quota","permission-loss","lost-response"]; recoveredFaults=["outage","throttle","auth-expiry","quota","permission-loss"]; throttleRecovery={"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000}; lostResponseReconciled=true; blindRetryRejected=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"faultsExercised":["outage","throttle","auth-expiry","quota","permission-loss","lost-response"],"recoveredFaults":["outage","throttle","auth-expiry","quota","permission-loss"],"throttleRecovery":{"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000},"lostResponseReconciled":true,"blindRetryRejected":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"faultsExercised":["outage","throttle","auth-expiry","quota","permission-loss","lost-response"],"recoveredFaults":["outage","throttle","auth-expiry","quota","permission-loss"],"throttleRecovery":{"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000},"lostResponseReconciled":true,"blindRetryRejected":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"faultsExercised":["outage","throttle","auth-expiry","quota","permission-loss","lost-response"],"recoveredFaults":["outage","throttle","auth-expiry","quota","permission-loss"],"throttleRecovery":{"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000},"lostResponseReconciled":true,"blindRetryRejected":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Pass | 3981.823 | discoveredNewerAuthority=true; transientFailureRetained=true; processRestartRecoveredQueue=true; queueWriterProcessId=2020; queueRestartInspectorProcessId=11156; noSilentOverwrite=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"discoveredNewerAuthority":true,"transientFailureRetained":true,"processRestartRecoveredQueue":true,"queueWriterProcessId":2020,"queueRestartInspectorProcessId":11156,"noSilentOverwrite":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"discoveredNewerAuthority":true,"transientFailureRetained":true,"processRestartRecoveredQueue":true,"queueWriterProcessId":13724,"queueRestartInspectorProcessId":8048,"noSilentOverwrite":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"discoveredNewerAuthority":true,"transientFailureRetained":true,"processRestartRecoveredQueue":true,"queueWriterProcessId":10792,"queueRestartInspectorProcessId":6152,"noSilentOverwrite":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Pass | 0.705 | providerPreflightRejected=true; errorCount=8; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"providerPreflightRejected":true,"errorCount":8},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"providerPreflightRejected":true,"errorCount":8},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"providerPreflightRejected":true,"errorCount":8},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Pass | 0.584 | corporateFallbackImpossible=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"corporateFallbackImpossible":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"corporateFallbackImpossible":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"corporateFallbackImpossible":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.809 | syntheticFixtureAccepted=true; actualDataRejected=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"syntheticFixtureAccepted":true,"actualDataRejected":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"syntheticFixtureAccepted":true,"actualDataRejected":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"syntheticFixtureAccepted":true,"actualDataRejected":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Pass | 0.618 | configSecretRejected=true; workspaceHasNoSecrets=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"configSecretRejected":true,"workspaceHasNoSecrets":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"configSecretRejected":true,"workspaceHasNoSecrets":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"configSecretRejected":true,"workspaceHasNoSecrets":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Pass | 0.595 | ownedAuthorized=true; foreignRefused=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"ownedAuthorized":true,"foreignRefused":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"ownedAuthorized":true,"foreignRefused":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"ownedAuthorized":true,"foreignRefused":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Pass | 101.930 | nonPositiveBudgetsRejected=true; operationLimitEnforced=true; objectLimitEnforced=true; byteLimitEnforced=true; deadlineEnforced=true; abortSignalEnforced=true; providerChildBudget={"metered":true,"childPid":11060,"operationsBefore":385,"operationsAfter":386}; cleanupBudgeted=true; cleanupSharedDeadline=true; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"nonPositiveBudgetsRejected":true,"operationLimitEnforced":true,"objectLimitEnforced":true,"byteLimitEnforced":true,"deadlineEnforced":true,"abortSignalEnforced":true,"providerChildBudget":{"metered":true,"childPid":11060,"operationsBefore":385,"operationsAfter":386},"cleanupBudgeted":true,"cleanupSharedDeadline":true},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"nonPositiveBudgetsRejected":true,"operationLimitEnforced":true,"objectLimitEnforced":true,"byteLimitEnforced":true,"deadlineEnforced":true,"abortSignalEnforced":true,"providerChildBudget":{"metered":true,"childPid":13816,"operationsBefore":385,"operationsAfter":386},"cleanupBudgeted":true,"cleanupSharedDeadline":true},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"nonPositiveBudgetsRejected":true,"operationLimitEnforced":true,"objectLimitEnforced":true,"byteLimitEnforced":true,"deadlineEnforced":true,"abortSignalEnforced":true,"providerChildBudget":{"metered":true,"childPid":11536,"operationsBefore":385,"operationsAfter":386},"cleanupBudgeted":true,"cleanupSharedDeadline":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Pass | 17198.001 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; byteMethod=UTF-8 application payload bytes submitted or consumed; repetitions_small=18; requestsPerMutation_small=5; bytesPerMutation_small=10761.166666666666; throttleResponses_small=0; retries_small=0; retryAfterSeconds_small=[]; backoffMs_small=0; requestCount_small=90; requestBytes_small=59040; responseBytes_small=134661; repetitions_medium=12; requestsPerMutation_medium=6; bytesPerMutation_medium=82618.25; throttleResponses_medium=0; retries_medium=0; retryAfterSeconds_medium=[]; backoffMs_medium=0; requestCount_medium=72; requestBytes_medium=326688; responseBytes_medium=664731; repetitions_stress=6; requestsPerMutation_stress=7; bytesPerMutation_stress=1504575.5; throttleResponses_stress=0; retries_stress=0; retryAfterSeconds_stress=[]; backoffMs_stress=0; requestCount_stress=42; requestBytes_stress=3087258; responseBytes_stress=5940195; throttleResponses=3; throttleRetries=3; throttleRetryAfterSeconds=[1,1,1]; throttleBackoffMs=3000; throttleBehavior=bounded retry honored Retry-After and committed once; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"scales":"small,medium,stress","warmupIterations":3,"timingMethod":"performance.now monotonic elapsed time","reportedStatistics":"min,p50,p95,max,mean,stddev","byteMethod":"UTF-8 application payload bytes submitted or consumed","rawSamples":{"small":{"remoteCasMs":[545.9795999999988,599.6376000000018,586.0146999999997,588.0150999999969,1220.8289000000004,528.1604000000007],"collaboratorDiscoveryMs":[81.27270000000135,122.17269999999553,80.71499999999651,79.95870000000286,80.16289999999572,83.09519999999611],"requestsPerMutation":[5,5,5,5,5,5],"transferredBytesPerMutation":[10307,10488,10670,10852,11034,11216],"requestBytesPerMutation":[3115,3181,3247,3313,3379,3445],"responseBytesPerMutation":[7192,7307,7423,7539,7655,7771],"retriesPerMutation":[0,0,0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0,0,0]},"medium":{"remoteCasMs":[526.4081000000006,554.6557999999932,639.9833000000071,607.9956999999995],"collaboratorDiscoveryMs":[84.42820000000211,58.35100000000966,109.33740000000398,94.76420000000508],"requestsPerMutation":[6,6,6,6],"transferredBytesPerMutation":[82346,82527,82709,82891],"requestBytesPerMutation":[27125,27191,27257,27323],"responseBytesPerMutation":[55221,55336,55452,55568],"retriesPerMutation":[0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0]},"stress":{"remoteCasMs":[826.4994000000006,783.9244000000035],"collaboratorDiscoveryMs":[127.19509999999718,69.62549999999464],"requestsPerMutation":[7,7],"transferredBytesPerMutation":[1504485,1504666],"requestBytesPerMutation":[514510,514576],"responseBytesPerMutation":[989975,990090],"retriesPerMutation":[0,0],"throttleResponsesPerMutation":[0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0]}},"repetitions_small":6,"requestsPerMutation_small":5,"bytesPerMutation_small":10761.167,"throttleResponses_small":0,"retries_small":0,"retryAfterSeconds_small":[],"backoffMs_small":0,"requestCount_small":30,"requestBytes_small":19680,"responseBytes_small":44887,"repetitions_medium":4,"requestsPerMutation_medium":6,"bytesPerMutation_medium":82618.25,"throttleResponses_medium":0,"retries_medium":0,"retryAfterSeconds_medium":[],"backoffMs_medium":0,"requestCount_medium":24,"requestBytes_medium":108896,"responseBytes_medium":221577,"repetitions_stress":2,"requestsPerMutation_stress":7,"bytesPerMutation_stress":1504575.5,"throttleResponses_stress":0,"retries_stress":0,"retryAfterSeconds_stress":[],"backoffMs_stress":0,"requestCount_stress":14,"requestBytes_stress":1029086,"responseBytes_stress":1980065,"throttleResponses":1,"throttleRetries":1,"throttleRetryAfterSeconds":[1],"throttleBackoffMs":1000,"throttleBehavior":"bounded retry honored Retry-After and committed once"},"measurements":{"setupMs_small":1242.5538000000015,"warmupMs_small":229.98129999999946,"remoteCasMinMs_small":528.1604000000007,"remoteCasP50Ms_small":586.0146999999997,"remoteCasP95Ms_small":1220.8289000000004,"remoteCasMaxMs_small":1220.8289000000004,"remoteCasMeanMs_small":678.1060499999998,"remoteCasStdDevMs_small":244.0094541603446,"collaboratorDiscoveryMinMs_small":79.95870000000286,"collaboratorDiscoveryP50Ms_small":80.71499999999651,"collaboratorDiscoveryP95Ms_small":122.17269999999553,"collaboratorDiscoveryMaxMs_small":122.17269999999553,"collaboratorDiscoveryMeanMs_small":87.89619999999802,"collaboratorDiscoveryStdDevMs_small":15.363247671416918,"cleanupMs_small":0.0239000000001397,"setupMs_medium":1270.7595999999976,"warmupMs_medium":230.47699999999895,"remoteCasMinMs_medium":526.4081000000006,"remoteCasP50Ms_medium":554.6557999999932,"remoteCasP95Ms_medium":639.9833000000071,"remoteCasMaxMs_medium":639.9833000000071,"remoteCasMeanMs_medium":582.2607250000001,"remoteCasStdDevMs_medium":44.37266108351124,"collaboratorDiscoveryMinMs_medium":58.35100000000966,"collaboratorDiscoveryP50Ms_medium":84.42820000000211,"collaboratorDiscoveryP95Ms_medium":109.33740000000398,"collaboratorDiscoveryMaxMs_medium":109.33740000000398,"collaboratorDiscoveryMeanMs_medium":86.7202000000052,"collaboratorDiscoveryStdDevMs_medium":18.616581617470107,"cleanupMs_medium":0.006699999998090789,"setupMs_stress":1542.1270000000077,"warmupMs_stress":392.01549999999406,"remoteCasMinMs_stress":783.9244000000035,"remoteCasP50Ms_stress":783.9244000000035,"remoteCasP95Ms_stress":826.4994000000006,"remoteCasMaxMs_stress":826.4994000000006,"remoteCasMeanMs_stress":805.2119000000021,"remoteCasStdDevMs_stress":21.287499999998545,"collaboratorDiscoveryMinMs_stress":69.62549999999464,"collaboratorDiscoveryP50Ms_stress":69.62549999999464,"collaboratorDiscoveryP95Ms_stress":127.19509999999718,"collaboratorDiscoveryMaxMs_stress":127.19509999999718,"collaboratorDiscoveryMeanMs_stress":98.41029999999591,"collaboratorDiscoveryStdDevMs_stress":28.78480000000127,"cleanupMs_stress":0.005000000004656613,"throttleRecoveryLatencyMs":1825.8770999999979}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"scales":"small,medium,stress","warmupIterations":3,"timingMethod":"performance.now monotonic elapsed time","reportedStatistics":"min,p50,p95,max,mean,stddev","byteMethod":"UTF-8 application payload bytes submitted or consumed","rawSamples":{"small":{"remoteCasMs":[486.66539999999804,524.0920000000042,579.5346999999965,487.0230999999985,895.2657000000036,678.4660999999978],"collaboratorDiscoveryMs":[54.96520000000601,82.12069999999949,54.207900000001246,78.77530000000115,94.90150000000722,82.28740000000107],"requestsPerMutation":[5,5,5,5,5,5],"transferredBytesPerMutation":[10307,10488,10670,10852,11034,11216],"requestBytesPerMutation":[3115,3181,3247,3313,3379,3445],"responseBytesPerMutation":[7192,7307,7423,7539,7655,7771],"retriesPerMutation":[0,0,0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0,0,0]},"medium":{"remoteCasMs":[706.3701999999976,818.2019999999975,721.9842999999964,582.602899999998],"collaboratorDiscoveryMs":[142.69659999999567,191.13009999999485,113.26450000000477,94.23020000000542],"requestsPerMutation":[6,6,6,6],"transferredBytesPerMutation":[82346,82527,82709,82891],"requestBytesPerMutation":[27125,27191,27257,27323],"responseBytesPerMutation":[55221,55336,55452,55568],"retriesPerMutation":[0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0]},"stress":{"remoteCasMs":[972.8751000000047,1013.4308000000019],"collaboratorDiscoveryMs":[125.90189999999711,95.44810000000871],"requestsPerMutation":[7,7],"transferredBytesPerMutation":[1504485,1504666],"requestBytesPerMutation":[514510,514576],"responseBytesPerMutation":[989975,990090],"retriesPerMutation":[0,0],"throttleResponsesPerMutation":[0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0]}},"repetitions_small":6,"requestsPerMutation_small":5,"bytesPerMutation_small":10761.167,"throttleResponses_small":0,"retries_small":0,"retryAfterSeconds_small":[],"backoffMs_small":0,"requestCount_small":30,"requestBytes_small":19680,"responseBytes_small":44887,"repetitions_medium":4,"requestsPerMutation_medium":6,"bytesPerMutation_medium":82618.25,"throttleResponses_medium":0,"retries_medium":0,"retryAfterSeconds_medium":[],"backoffMs_medium":0,"requestCount_medium":24,"requestBytes_medium":108896,"responseBytes_medium":221577,"repetitions_stress":2,"requestsPerMutation_stress":7,"bytesPerMutation_stress":1504575.5,"throttleResponses_stress":0,"retries_stress":0,"retryAfterSeconds_stress":[],"backoffMs_stress":0,"requestCount_stress":14,"requestBytes_stress":1029086,"responseBytes_stress":1980065,"throttleResponses":1,"throttleRetries":1,"throttleRetryAfterSeconds":[1],"throttleBackoffMs":1000,"throttleBehavior":"bounded retry honored Retry-After and committed once"},"measurements":{"setupMs_small":1307.2230999999956,"warmupMs_small":258.13239999999496,"remoteCasMinMs_small":486.66539999999804,"remoteCasP50Ms_small":524.0920000000042,"remoteCasP95Ms_small":895.2657000000036,"remoteCasMaxMs_small":895.2657000000036,"remoteCasMeanMs_small":608.5078333333331,"remoteCasStdDevMs_small":144.16069016690795,"collaboratorDiscoveryMinMs_small":54.207900000001246,"collaboratorDiscoveryP50Ms_small":78.77530000000115,"collaboratorDiscoveryP95Ms_small":94.90150000000722,"collaboratorDiscoveryMaxMs_small":94.90150000000722,"collaboratorDiscoveryMeanMs_small":74.54300000000269,"collaboratorDiscoveryStdDevMs_small":14.981014090285669,"cleanupMs_small":0.025199999996402767,"setupMs_medium":1611.589399999997,"warmupMs_medium":289.5167999999976,"remoteCasMinMs_medium":582.602899999998,"remoteCasP50Ms_medium":706.3701999999976,"remoteCasP95Ms_medium":818.2019999999975,"remoteCasMaxMs_medium":818.2019999999975,"remoteCasMeanMs_medium":707.2898499999974,"remoteCasStdDevMs_medium":83.76322751489735,"collaboratorDiscoveryMinMs_medium":94.23020000000542,"collaboratorDiscoveryP50Ms_medium":113.26450000000477,"collaboratorDiscoveryP95Ms_medium":191.13009999999485,"collaboratorDiscoveryMaxMs_medium":191.13009999999485,"collaboratorDiscoveryMeanMs_medium":135.33035000000018,"collaboratorDiscoveryStdDevMs_medium":36.55132625968825,"cleanupMs_medium":0.005299999989802018,"setupMs_stress":1788.7048000000068,"warmupMs_stress":564.0050000000047,"remoteCasMinMs_stress":972.8751000000047,"remoteCasP50Ms_stress":972.8751000000047,"remoteCasP95Ms_stress":1013.4308000000019,"remoteCasMaxMs_stress":1013.4308000000019,"remoteCasMeanMs_stress":993.1529500000033,"remoteCasStdDevMs_stress":20.27784999999858,"collaboratorDiscoveryMinMs_stress":95.44810000000871,"collaboratorDiscoveryP50Ms_stress":95.44810000000871,"collaboratorDiscoveryP95Ms_stress":125.90189999999711,"collaboratorDiscoveryMaxMs_stress":125.90189999999711,"collaboratorDiscoveryMeanMs_stress":110.67500000000291,"collaboratorDiscoveryStdDevMs_stress":15.226899999994203,"cleanupMs_stress":0.005699999994249083,"throttleRecoveryLatencyMs":1999.6015000000043}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"scales":"small,medium,stress","warmupIterations":3,"timingMethod":"performance.now monotonic elapsed time","reportedStatistics":"min,p50,p95,max,mean,stddev","byteMethod":"UTF-8 application payload bytes submitted or consumed","rawSamples":{"small":{"remoteCasMs":[575.4137000000046,668.6538999999975,720.8188000000009,649.4714000000022,578.3321999999971,564.5633000000016],"collaboratorDiscoveryMs":[84.8559000000023,85.4198999999935,82.8556000000026,122.12320000000182,85.77030000000377,82.71010000000388],"requestsPerMutation":[5,5,5,5,5,5],"transferredBytesPerMutation":[10307,10488,10670,10852,11034,11216],"requestBytesPerMutation":[3115,3181,3247,3313,3379,3445],"responseBytesPerMutation":[7192,7307,7423,7539,7655,7771],"retriesPerMutation":[0,0,0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0,0,0]},"medium":{"remoteCasMs":[609.092899999996,598.683299999997,672.0694999999978,884.2179999999935],"collaboratorDiscoveryMs":[188.37870000000112,88.83080000000336,128.18710000000283,92.57859999999346],"requestsPerMutation":[6,6,6,6],"transferredBytesPerMutation":[82346,82527,82709,82891],"requestBytesPerMutation":[27125,27191,27257,27323],"responseBytesPerMutation":[55221,55336,55452,55568],"retriesPerMutation":[0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0]},"stress":{"remoteCasMs":[1085.5718000000052,891.4186999999947],"collaboratorDiscoveryMs":[132.1478000000061,358.55280000000494],"requestsPerMutation":[7,7],"transferredBytesPerMutation":[1504485,1504666],"requestBytesPerMutation":[514510,514576],"responseBytesPerMutation":[989975,990090],"retriesPerMutation":[0,0],"throttleResponsesPerMutation":[0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0]}},"repetitions_small":6,"requestsPerMutation_small":5,"bytesPerMutation_small":10761.167,"throttleResponses_small":0,"retries_small":0,"retryAfterSeconds_small":[],"backoffMs_small":0,"requestCount_small":30,"requestBytes_small":19680,"responseBytes_small":44887,"repetitions_medium":4,"requestsPerMutation_medium":6,"bytesPerMutation_medium":82618.25,"throttleResponses_medium":0,"retries_medium":0,"retryAfterSeconds_medium":[],"backoffMs_medium":0,"requestCount_medium":24,"requestBytes_medium":108896,"responseBytes_medium":221577,"repetitions_stress":2,"requestsPerMutation_stress":7,"bytesPerMutation_stress":1504575.5,"throttleResponses_stress":0,"retries_stress":0,"retryAfterSeconds_stress":[],"backoffMs_stress":0,"requestCount_stress":14,"requestBytes_stress":1029086,"responseBytes_stress":1980065,"throttleResponses":1,"throttleRetries":1,"throttleRetryAfterSeconds":[1],"throttleBackoffMs":1000,"throttleBehavior":"bounded retry honored Retry-After and committed once"},"measurements":{"setupMs_small":1284.4406000000017,"warmupMs_small":219.43650000000343,"remoteCasMinMs_small":564.5633000000016,"remoteCasP50Ms_small":578.3321999999971,"remoteCasP95Ms_small":720.8188000000009,"remoteCasMaxMs_small":720.8188000000009,"remoteCasMeanMs_small":626.208883333334,"remoteCasStdDevMs_small":57.68631532484981,"collaboratorDiscoveryMinMs_small":82.71010000000388,"collaboratorDiscoveryP50Ms_small":84.8559000000023,"collaboratorDiscoveryP95Ms_small":122.12320000000182,"collaboratorDiscoveryMaxMs_small":122.12320000000182,"collaboratorDiscoveryMeanMs_small":90.62250000000131,"collaboratorDiscoveryStdDevMs_small":14.136769297473977,"cleanupMs_small":0.025199999996402767,"setupMs_medium":1565.8698000000004,"warmupMs_medium":276.4904999999999,"remoteCasMinMs_medium":598.683299999997,"remoteCasP50Ms_medium":609.092899999996,"remoteCasP95Ms_medium":884.2179999999935,"remoteCasMaxMs_medium":884.2179999999935,"remoteCasMeanMs_medium":691.0159249999961,"remoteCasStdDevMs_medium":115.02467612335003,"collaboratorDiscoveryMinMs_medium":88.83080000000336,"collaboratorDiscoveryP50Ms_medium":92.57859999999346,"collaboratorDiscoveryP95Ms_medium":188.37870000000112,"collaboratorDiscoveryMaxMs_medium":188.37870000000112,"collaboratorDiscoveryMeanMs_medium":124.49380000000019,"collaboratorDiscoveryStdDevMs_medium":39.95419400056877,"cleanupMs_medium":0.0062000000034458935,"setupMs_stress":2038.486699999994,"warmupMs_stress":617.5023999999976,"remoteCasMinMs_stress":891.4186999999947,"remoteCasP50Ms_stress":891.4186999999947,"remoteCasP95Ms_stress":1085.5718000000052,"remoteCasMaxMs_stress":1085.5718000000052,"remoteCasMeanMs_stress":988.4952499999999,"remoteCasStdDevMs_stress":97.07655000000523,"collaboratorDiscoveryMinMs_stress":132.1478000000061,"collaboratorDiscoveryP50Ms_stress":132.1478000000061,"collaboratorDiscoveryP95Ms_stress":358.55280000000494,"collaboratorDiscoveryMaxMs_stress":358.55280000000494,"collaboratorDiscoveryMeanMs_stress":245.35030000000552,"collaboratorDiscoveryStdDevMs_stress":113.20249999999942,"cleanupMs_stress":0.007599999997182749,"throttleRecoveryLatencyMs":1890.4573999999993}}} | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.314 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=2; implementation=3; test=4; migration=3; deployment=3; maintenance=3; diagnostics=3; recovery=3; rationale={"dependencies":"Azure DevOps Git REST API and scoped authentication","implementation":"Repository envelope with branch-tip oldObjectId CAS","test":"Live repository, ref race, offline, failure, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Scoped credential, repository coordinates, and per-run branch","maintenance":"ADO Git REST API and ref semantics","diagnostics":"Provider responses, request telemetry, branch, commit, and generation state","recovery":"Auditable commit history plus offline conflict reconciliation"}; total=24; mean=3; runs={"s0-ado-s0-20260920-215851-c1":{"status":"Pass","evidence":{"scale":"1=trivial, 2=low, 3=moderate, 4=high, 5=very high","dependencies":2,"implementation":3,"test":4,"migration":3,"deployment":3,"maintenance":3,"diagnostics":3,"recovery":3,"rationale":{"dependencies":"Azure DevOps Git REST API and scoped authentication","implementation":"Repository envelope with branch-tip oldObjectId CAS","test":"Live repository, ref race, offline, failure, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Scoped credential, repository coordinates, and per-run branch","maintenance":"ADO Git REST API and ref semantics","diagnostics":"Provider responses, request telemetry, branch, commit, and generation state","recovery":"Auditable commit history plus offline conflict reconciliation"},"total":24,"mean":3},"measurements":{}},"s0-ado-s0-20260920-215851-c2":{"status":"Pass","evidence":{"scale":"1=trivial, 2=low, 3=moderate, 4=high, 5=very high","dependencies":2,"implementation":3,"test":4,"migration":3,"deployment":3,"maintenance":3,"diagnostics":3,"recovery":3,"rationale":{"dependencies":"Azure DevOps Git REST API and scoped authentication","implementation":"Repository envelope with branch-tip oldObjectId CAS","test":"Live repository, ref race, offline, failure, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Scoped credential, repository coordinates, and per-run branch","maintenance":"ADO Git REST API and ref semantics","diagnostics":"Provider responses, request telemetry, branch, commit, and generation state","recovery":"Auditable commit history plus offline conflict reconciliation"},"total":24,"mean":3},"measurements":{}},"s0-ado-s0-20260920-215851-c3":{"status":"Pass","evidence":{"scale":"1=trivial, 2=low, 3=moderate, 4=high, 5=very high","dependencies":2,"implementation":3,"test":4,"migration":3,"deployment":3,"maintenance":3,"diagnostics":3,"recovery":3,"rationale":{"dependencies":"Azure DevOps Git REST API and scoped authentication","implementation":"Repository envelope with branch-tip oldObjectId CAS","test":"Live repository, ref race, offline, failure, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Scoped credential, repository coordinates, and per-run branch","maintenance":"ADO Git REST API and ref semantics","diagnostics":"Provider responses, request telemetry, branch, commit, and generation state","recovery":"Auditable commit history plus offline conflict reconciliation"},"total":24,"mean":3},"measurements":{}}} | [JSON](raw-results.json) |

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
| `S0-COL-006` | collaboratorDiscoveryMs | 71.000 | ms |
| `S0-PER-004` | setupMs_small | 1278.072 | ms |
| `S0-PER-004` | warmupMs_small | 235.850 | ms |
| `S0-PER-004` | remoteCasMinMs_small | 486.665 | ms |
| `S0-PER-004` | remoteCasP50Ms_small | 579.535 | ms |
| `S0-PER-004` | remoteCasP95Ms_small | 1220.829 | ms |
| `S0-PER-004` | remoteCasMaxMs_small | 1220.829 | ms |
| `S0-PER-004` | remoteCasMeanMs_small | 637.608 | ms |
| `S0-PER-004` | remoteCasStdDevMs_small | 174.492 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_small | 54.208 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_small | 82.287 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_small | 122.173 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_small | 122.173 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_small | 84.354 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_small | 16.891 | ms |
| `S0-PER-004` | cleanupMs_small | 0.025 | ms |
| `S0-PER-004` | setupMs_medium | 1482.740 | ms |
| `S0-PER-004` | warmupMs_medium | 265.495 | ms |
| `S0-PER-004` | remoteCasMinMs_medium | 526.408 | ms |
| `S0-PER-004` | remoteCasP50Ms_medium | 609.093 | ms |
| `S0-PER-004` | remoteCasP95Ms_medium | 884.218 | ms |
| `S0-PER-004` | remoteCasMaxMs_medium | 884.218 | ms |
| `S0-PER-004` | remoteCasMeanMs_medium | 660.189 | ms |
| `S0-PER-004` | remoteCasStdDevMs_medium | 106.954 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_medium | 58.351 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_medium | 94.764 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_medium | 191.130 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_medium | 191.130 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_medium | 115.515 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_medium | 40.816 | ms |
| `S0-PER-004` | cleanupMs_medium | 0.006 | ms |
| `S0-PER-004` | setupMs_stress | 1789.773 | ms |
| `S0-PER-004` | warmupMs_stress | 524.508 | ms |
| `S0-PER-004` | remoteCasMinMs_stress | 783.924 | ms |
| `S0-PER-004` | remoteCasP50Ms_stress | 891.419 | ms |
| `S0-PER-004` | remoteCasP95Ms_stress | 1085.572 | ms |
| `S0-PER-004` | remoteCasMaxMs_stress | 1085.572 | ms |
| `S0-PER-004` | remoteCasMeanMs_stress | 928.953 | ms |
| `S0-PER-004` | remoteCasStdDevMs_stress | 115.355 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_stress | 69.625 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_stress | 125.902 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_stress | 358.553 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_stress | 358.553 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_stress | 151.479 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_stress | 104.246 | ms |
| `S0-PER-004` | cleanupMs_stress | 0.006 | ms |
| `S0-PER-004` | throttleRecoveryLatencyMs | 1905.312 | ms |

## Repeated live runs

| Run | Report | Raw evidence |
|---|---|---|
| s0-ado-s0-20260920-215851-c1 | [report](runs/s0-ado-s0-20260920-215851-c1/outcome.md) | [JSON](runs/s0-ado-s0-20260920-215851-c1/raw-results.json) |
| s0-ado-s0-20260920-215851-c2 | [report](runs/s0-ado-s0-20260920-215851-c2/outcome.md) | [JSON](runs/s0-ado-s0-20260920-215851-c2/raw-results.json) |
| s0-ado-s0-20260920-215851-c3 | [report](runs/s0-ado-s0-20260920-215851-c3/outcome.md) | [JSON](runs/s0-ado-s0-20260920-215851-c3/raw-results.json) |

### Between-run variability

| Metric | Samples | Minimum | p50 | p95 | Maximum | Mean | Std. dev. |
|---|---:|---:|---:|---:|---:|---:|---:|
| setupMs_small | 3 | 1242.554 | 1284.441 | 1307.223 | 1307.223 | 1278.072 | 32.802 |
| warmupMs_small | 3 | 219.437 | 229.981 | 258.132 | 258.132 | 235.850 | 20.004 |
| remoteCasMinMs_small | 3 | 486.665 | 528.160 | 564.563 | 564.563 | 526.463 | 38.977 |
| remoteCasP50Ms_small | 3 | 524.092 | 578.332 | 586.015 | 586.015 | 562.813 | 33.753 |
| remoteCasP95Ms_small | 3 | 720.819 | 895.266 | 1220.829 | 1220.829 | 945.638 | 253.782 |
| remoteCasMaxMs_small | 3 | 720.819 | 895.266 | 1220.829 | 1220.829 | 945.638 | 253.782 |
| remoteCasMeanMs_small | 3 | 608.508 | 626.209 | 678.106 | 678.106 | 637.608 | 36.172 |
| remoteCasStdDevMs_small | 3 | 57.686 | 144.161 | 244.009 | 244.009 | 148.619 | 93.242 |
| collaboratorDiscoveryMinMs_small | 3 | 54.208 | 79.959 | 82.710 | 82.710 | 72.292 | 15.722 |
| collaboratorDiscoveryP50Ms_small | 3 | 78.775 | 80.715 | 84.856 | 84.856 | 81.449 | 3.106 |
| collaboratorDiscoveryP95Ms_small | 3 | 94.902 | 122.123 | 122.173 | 122.173 | 113.066 | 15.731 |
| collaboratorDiscoveryMaxMs_small | 3 | 94.902 | 122.123 | 122.173 | 122.173 | 113.066 | 15.731 |
| collaboratorDiscoveryMeanMs_small | 3 | 74.543 | 87.896 | 90.623 | 90.623 | 84.354 | 8.605 |
| collaboratorDiscoveryStdDevMs_small | 3 | 14.137 | 14.981 | 15.363 | 15.363 | 14.827 | 0.628 |
| cleanupMs_small | 3 | 0.024 | 0.025 | 0.025 | 0.025 | 0.025 | 0.001 |
| setupMs_medium | 3 | 1270.760 | 1565.870 | 1611.589 | 1611.589 | 1482.740 | 184.998 |
| warmupMs_medium | 3 | 230.477 | 276.490 | 289.517 | 289.517 | 265.495 | 31.018 |
| remoteCasMinMs_medium | 3 | 526.408 | 582.603 | 598.683 | 598.683 | 569.231 | 37.948 |
| remoteCasP50Ms_medium | 3 | 554.656 | 609.093 | 706.370 | 706.370 | 623.373 | 76.859 |
| remoteCasP95Ms_medium | 3 | 639.983 | 818.202 | 884.218 | 884.218 | 780.801 | 126.340 |
| remoteCasMaxMs_medium | 3 | 639.983 | 818.202 | 884.218 | 884.218 | 780.801 | 126.340 |
| remoteCasMeanMs_medium | 3 | 582.261 | 691.016 | 707.290 | 707.290 | 660.189 | 67.976 |
| remoteCasStdDevMs_medium | 3 | 44.373 | 83.763 | 115.025 | 115.025 | 81.054 | 35.404 |
| collaboratorDiscoveryMinMs_medium | 3 | 58.351 | 88.831 | 94.230 | 94.230 | 80.471 | 19.345 |
| collaboratorDiscoveryP50Ms_medium | 3 | 84.428 | 92.579 | 113.265 | 113.265 | 96.757 | 14.865 |
| collaboratorDiscoveryP95Ms_medium | 3 | 109.337 | 188.379 | 191.130 | 191.130 | 162.949 | 46.449 |
| collaboratorDiscoveryMaxMs_medium | 3 | 109.337 | 188.379 | 191.130 | 191.130 | 162.949 | 46.449 |
| collaboratorDiscoveryMeanMs_medium | 3 | 86.720 | 124.494 | 135.330 | 135.330 | 115.515 | 25.519 |
| collaboratorDiscoveryStdDevMs_medium | 3 | 18.617 | 36.551 | 39.954 | 39.954 | 31.707 | 11.464 |
| cleanupMs_medium | 3 | 0.005 | 0.006 | 0.007 | 0.007 | 0.006 | 0.001 |
| setupMs_stress | 3 | 1542.127 | 1788.705 | 2038.487 | 2038.487 | 1789.773 | 248.182 |
| warmupMs_stress | 3 | 392.015 | 564.005 | 617.502 | 617.502 | 524.508 | 117.818 |
| remoteCasMinMs_stress | 3 | 783.924 | 891.419 | 972.875 | 972.875 | 882.739 | 94.774 |
| remoteCasP50Ms_stress | 3 | 783.924 | 891.419 | 972.875 | 972.875 | 882.739 | 94.774 |
| remoteCasP95Ms_stress | 3 | 826.499 | 1013.431 | 1085.572 | 1085.572 | 975.167 | 133.708 |
| remoteCasMaxMs_stress | 3 | 826.499 | 1013.431 | 1085.572 | 1085.572 | 975.167 | 133.708 |
| remoteCasMeanMs_stress | 3 | 805.212 | 988.495 | 993.153 | 993.153 | 928.953 | 107.189 |
| remoteCasStdDevMs_stress | 3 | 20.278 | 21.287 | 97.077 | 97.077 | 46.214 | 44.051 |
| collaboratorDiscoveryMinMs_stress | 3 | 69.625 | 95.448 | 132.148 | 132.148 | 99.074 | 31.418 |
| collaboratorDiscoveryP50Ms_stress | 3 | 69.625 | 95.448 | 132.148 | 132.148 | 99.074 | 31.418 |
| collaboratorDiscoveryP95Ms_stress | 3 | 125.902 | 127.195 | 358.553 | 358.553 | 203.883 | 133.949 |
| collaboratorDiscoveryMaxMs_stress | 3 | 125.902 | 127.195 | 358.553 | 358.553 | 203.883 | 133.949 |
| collaboratorDiscoveryMeanMs_stress | 3 | 98.410 | 110.675 | 245.350 | 245.350 | 151.479 | 81.526 |
| collaboratorDiscoveryStdDevMs_stress | 3 | 15.227 | 28.785 | 113.202 | 113.202 | 52.405 | 53.087 |
| cleanupMs_stress | 3 | 0.005 | 0.006 | 0.008 | 0.008 | 0.006 | 0.001 |
| throttleRecoveryLatencyMs | 3 | 1825.877 | 1890.457 | 1999.602 | 1999.602 | 1905.312 | 87.810 |

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
