# S0 Outcome: CFG-GITHUB-LIVE

**Report date:** 2026-09-21
**Harness revision:** s0-harness-v4-run-aggregate
**Source revision:** sha256:eef1ed728c3c3078e27ef025e9b45076598359a50acd09196acb4636720b9167
**Catalog revision:** sha256:a2d4052f88cde758aff0bccf62bebd380907b935259f9571dd8f1646740723e7
**Applicability revision:** sha256:7d9b94e9ea7e7f38893230577d6b5aa26ab141e96e3d430244ec51f8c5849b4d
**Configuration revision:** sha256:a0b5a4a04d9688d6a5f6092cefc76fe2cb050e837bb8a58fb07e2e44a2911606
**Configuration ID:** CFG-GITHUB-LIVE
**Adapter:** github
**Authoritative backing path:** github
**Dataset scale:** small
**Recommendation:** Incomplete
**Applicable absolute gates:** 18
**Eligibility:** Incomplete

## Coverage

Executed 20 of 58 catalog scenarios. 20 apply to this configuration; 0 applicable absolute gates were not executed.

| Outcome class | Count | Meaning |
|---|---:|---|
| Pass | 19 | Executed and satisfied |
| Fail | 0 | Executed and violated |
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
| Provider/API version | GitHub REST 2022-11-28 |
| Configured platform/filesystem | windows-ntfs |
| Detected filesystem | Not recorded |
| Temporary store root | tippani-s0-s0-github-s0-20260920-215851-c1-LlOaVt |
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
| Applicability profile | github |
| Store namespace | redacted-per-run |
| Authentication setup | One GitHub identity (supplied at runtime) |
| Cleanup manifest | see-run-preflights |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:9d3156572d1a10c8bce4357a5aca01de44a87efb2ab6d052ecbb1ce0b58491fb |
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
| Final metered operations | 471 |
| Final metered objects | 52 |
| Final metered bytes | 8219921 |
| Cleanup requests/retries/bytes | {"requests":6,"retries":0,"transferredBytes":4269} |
| Declared provider operations | ["connect","put-run-marker","get-contents","put-contents","list-contents","list-commits","delete-ref-with-lease"] |
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
| `S0-COL-002` | absolute | Pass | 8238.015 | accounts=1; clientProcesses=2; clientProcessIds=[11152,10900]; executionMode=independent-os-processes; logicalActors=Synthetic Client 1,Synthetic Client 2; winners=1; staleConflicts=1; noSilentOverwrite=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[11152,10900],"executionMode":"independent-os-processes","logicalActors":"Synthetic Client 1,Synthetic Client 2","winners":1,"staleConflicts":1,"noSilentOverwrite":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[5724,5992],"executionMode":"independent-os-processes","logicalActors":"Synthetic Client 1,Synthetic Client 2","winners":1,"staleConflicts":1,"noSilentOverwrite":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[12348,2452],"executionMode":"independent-os-processes","logicalActors":"Synthetic Client 1,Synthetic Client 2","winners":1,"staleConflicts":1,"noSilentOverwrite":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Pass | 11345.253 | accounts=1; clientProcesses=2; clientProcessIds=[472,9020]; executionMode=independent-os-processes; staleGeneration=0; reloadedGeneration=1; reconciledGeneration=2; deterministicReconnect=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[472,9020],"executionMode":"independent-os-processes","staleGeneration":0,"reloadedGeneration":1,"reconciledGeneration":2,"deterministicReconnect":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[11112,10588],"executionMode":"independent-os-processes","staleGeneration":0,"reloadedGeneration":1,"reconciledGeneration":2,"deterministicReconnect":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[7452,11676],"executionMode":"independent-os-processes","staleGeneration":0,"reloadedGeneration":1,"reconciledGeneration":2,"deterministicReconnect":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Pass | 5381.875 | lostResponseDetected=true; noDuplicate=true; reconciledGeneration=1; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"lostResponseDetected":true,"noDuplicate":true,"reconciledGeneration":1},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"lostResponseDetected":true,"noDuplicate":true,"reconciledGeneration":1},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"lostResponseDetected":true,"noDuplicate":true,"reconciledGeneration":1},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Pass | 9764.649 | offlinePendingConflicted=true; processRestartRecoveredQueue=true; queueWriterProcessIds=[10640,2772]; queueRestartInspectorProcessId=10208; fifoStoppedAtFirstConflict=true; staleEntryRetained=true; noSilentOverwrite=true; authorityGeneration=2; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"offlinePendingConflicted":true,"processRestartRecoveredQueue":true,"queueWriterProcessIds":[10640,2772],"queueRestartInspectorProcessId":10208,"fifoStoppedAtFirstConflict":true,"staleEntryRetained":true,"noSilentOverwrite":true,"authorityGeneration":2},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"offlinePendingConflicted":true,"processRestartRecoveredQueue":true,"queueWriterProcessIds":[12920,10004],"queueRestartInspectorProcessId":6036,"fifoStoppedAtFirstConflict":true,"staleEntryRetained":true,"noSilentOverwrite":true,"authorityGeneration":2},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"offlinePendingConflicted":true,"processRestartRecoveredQueue":true,"queueWriterProcessIds":[4208,5008],"queueRestartInspectorProcessId":11212,"fifoStoppedAtFirstConflict":true,"staleEntryRetained":true,"noSilentOverwrite":true,"authorityGeneration":2},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Pass | 7637.785 | accounts=1; clientProcesses=2; clientProcessIds=[7652,7792]; executionMode=independent-os-processes; changeMechanism=GitHub ref and contents polling; observedGeneration=1; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[7652,7792],"executionMode":"independent-os-processes","changeMechanism":"GitHub ref and contents polling","observedGeneration":1},"measurements":{"collaboratorDiscoveryMs":279}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[11184,8816],"executionMode":"independent-os-processes","changeMechanism":"GitHub ref and contents polling","observedGeneration":1},"measurements":{"collaboratorDiscoveryMs":433}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"accounts":1,"clientProcesses":2,"clientProcessIds":[7264,11936],"executionMode":"independent-os-processes","changeMechanism":"GitHub ref and contents polling","observedGeneration":1},"measurements":{"collaboratorDiscoveryMs":279}}} | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Pass | 9058.059 | winners=1; staleConflicts=1; durableGeneration=2; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"winners":1,"staleConflicts":1,"durableGeneration":2},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"winners":1,"staleConflicts":1,"durableGeneration":2},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"winners":1,"staleConflicts":1,"durableGeneration":2},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Pass | 8948.281 | faultsRejected=4; faultsExercised=["auth-expiry","outage","quota","permission-loss","throttle"]; rejectedFaultGenerationUnchanged=true; throttleRecoveredByBoundedRetry=true; throttleResponses=3; retries=1; retryAfterSeconds=[1]; backoffMs=1000; transferredBytes=102905; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"faultsRejected":4,"faultsExercised":["auth-expiry","outage","quota","permission-loss","throttle"],"rejectedFaultGenerationUnchanged":true,"throttleRecoveredByBoundedRetry":true,"throttleResponses":1,"retries":1,"retryAfterSeconds":[1],"backoffMs":1000,"transferredBytes":102905},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"faultsRejected":4,"faultsExercised":["auth-expiry","outage","quota","permission-loss","throttle"],"rejectedFaultGenerationUnchanged":true,"throttleRecoveredByBoundedRetry":true,"throttleResponses":1,"retries":1,"retryAfterSeconds":[1],"backoffMs":1000,"transferredBytes":102905},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"faultsRejected":4,"faultsExercised":["auth-expiry","outage","quota","permission-loss","throttle"],"rejectedFaultGenerationUnchanged":true,"throttleRecoveredByBoundedRetry":true,"throttleResponses":1,"retries":1,"retryAfterSeconds":[1],"backoffMs":1000,"transferredBytes":102905},"measurements":{}}} | [JSON](raw-results.json) |
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
| `S0-MIG-004` | absolute | Pass | 3289.165 | workspaceIdPreserved=true; generation=1; receipt=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"workspaceIdPreserved":true,"generation":1,"receipt":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"workspaceIdPreserved":true,"generation":1,"receipt":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"workspaceIdPreserved":true,"generation":1,"receipt":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Pass | 5287.256 | recoveredGeneration=1; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"recoveredGeneration":1},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"recoveredGeneration":1},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"recoveredGeneration":1},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Incomplete | 0.279 | runs={"s0-github-s0-20260920-215851-c1":{"status":"Incomplete","evidence":{},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Incomplete","evidence":{},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Incomplete","evidence":{},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Pass | 23763.160 | faultsExercised=["outage","throttle","auth-expiry","quota","permission-loss","lost-response"]; recoveredFaults=["outage","throttle","auth-expiry","quota","permission-loss"]; throttleRecovery={"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000}; lostResponseReconciled=true; blindRetryRejected=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"faultsExercised":["outage","throttle","auth-expiry","quota","permission-loss","lost-response"],"recoveredFaults":["outage","throttle","auth-expiry","quota","permission-loss"],"throttleRecovery":{"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000},"lostResponseReconciled":true,"blindRetryRejected":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"faultsExercised":["outage","throttle","auth-expiry","quota","permission-loss","lost-response"],"recoveredFaults":["outage","throttle","auth-expiry","quota","permission-loss"],"throttleRecovery":{"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000},"lostResponseReconciled":true,"blindRetryRejected":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"faultsExercised":["outage","throttle","auth-expiry","quota","permission-loss","lost-response"],"recoveredFaults":["outage","throttle","auth-expiry","quota","permission-loss"],"throttleRecovery":{"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000},"lostResponseReconciled":true,"blindRetryRejected":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Pass | 12122.393 | discoveredNewerAuthority=true; transientFailureRetained=true; processRestartRecoveredQueue=true; queueWriterProcessId=6876; queueRestartInspectorProcessId=11172; noSilentOverwrite=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"discoveredNewerAuthority":true,"transientFailureRetained":true,"processRestartRecoveredQueue":true,"queueWriterProcessId":6876,"queueRestartInspectorProcessId":11172,"noSilentOverwrite":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"discoveredNewerAuthority":true,"transientFailureRetained":true,"processRestartRecoveredQueue":true,"queueWriterProcessId":5800,"queueRestartInspectorProcessId":8044,"noSilentOverwrite":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"discoveredNewerAuthority":true,"transientFailureRetained":true,"processRestartRecoveredQueue":true,"queueWriterProcessId":8736,"queueRestartInspectorProcessId":4916,"noSilentOverwrite":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Pass | 0.645 | providerPreflightRejected=true; errorCount=8; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"providerPreflightRejected":true,"errorCount":8},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"providerPreflightRejected":true,"errorCount":8},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"providerPreflightRejected":true,"errorCount":8},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Pass | 0.558 | corporateFallbackImpossible=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"corporateFallbackImpossible":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"corporateFallbackImpossible":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"corporateFallbackImpossible":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.959 | syntheticFixtureAccepted=true; actualDataRejected=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"syntheticFixtureAccepted":true,"actualDataRejected":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"syntheticFixtureAccepted":true,"actualDataRejected":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"syntheticFixtureAccepted":true,"actualDataRejected":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Pass | 0.573 | configSecretRejected=true; workspaceHasNoSecrets=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"configSecretRejected":true,"workspaceHasNoSecrets":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"configSecretRejected":true,"workspaceHasNoSecrets":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"configSecretRejected":true,"workspaceHasNoSecrets":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Pass | 0.593 | ownedAuthorized=true; foreignRefused=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"ownedAuthorized":true,"foreignRefused":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"ownedAuthorized":true,"foreignRefused":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"ownedAuthorized":true,"foreignRefused":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Pass | 100.602 | nonPositiveBudgetsRejected=true; operationLimitEnforced=true; objectLimitEnforced=true; byteLimitEnforced=true; deadlineEnforced=true; abortSignalEnforced=true; providerChildBudget={"metered":true,"childPid":7124,"operationsBefore":303,"operationsAfter":304}; cleanupBudgeted=true; cleanupSharedDeadline=true; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"nonPositiveBudgetsRejected":true,"operationLimitEnforced":true,"objectLimitEnforced":true,"byteLimitEnforced":true,"deadlineEnforced":true,"abortSignalEnforced":true,"providerChildBudget":{"metered":true,"childPid":7124,"operationsBefore":303,"operationsAfter":304},"cleanupBudgeted":true,"cleanupSharedDeadline":true},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"nonPositiveBudgetsRejected":true,"operationLimitEnforced":true,"objectLimitEnforced":true,"byteLimitEnforced":true,"deadlineEnforced":true,"abortSignalEnforced":true,"providerChildBudget":{"metered":true,"childPid":2604,"operationsBefore":303,"operationsAfter":304},"cleanupBudgeted":true,"cleanupSharedDeadline":true},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"nonPositiveBudgetsRejected":true,"operationLimitEnforced":true,"objectLimitEnforced":true,"byteLimitEnforced":true,"deadlineEnforced":true,"abortSignalEnforced":true,"providerChildBudget":{"metered":true,"childPid":7056,"operationsBefore":303,"operationsAfter":304},"cleanupBudgeted":true,"cleanupSharedDeadline":true},"measurements":{}}} | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Pass | 41408.847 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; byteMethod=UTF-8 application payload bytes submitted or consumed; repetitions_small=18; requestsPerMutation_small=5; bytesPerMutation_small=17205.333333333332; throttleResponses_small=0; retries_small=0; retryAfterSeconds_small=[]; backoffMs_small=0; requestCount_small=90; requestBytes_small=67638; responseBytes_small=242058; repetitions_medium=12; requestsPerMutation_medium=5; bytesPerMutation_medium=108476.5; throttleResponses_medium=0; retries_medium=0; retryAfterSeconds_medium=[]; backoffMs_medium=0; requestCount_medium=60; requestBytes_medium=402228; responseBytes_medium=899490; repetitions_stress=6; requestsPerMutation_stress=5; bytesPerMutation_stress=1967096; throttleResponses_stress=0; retries_stress=0; retryAfterSeconds_stress=[]; backoffMs_stress=0; requestCount_stress=30; requestBytes_stress=3837534; responseBytes_stress=7965042; throttleResponses=3; throttleRetries=3; throttleRetryAfterSeconds=[1,1,1]; throttleBackoffMs=3000; throttleBehavior=bounded retry honored Retry-After and committed once; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"scales":"small,medium,stress","warmupIterations":3,"timingMethod":"performance.now monotonic elapsed time","reportedStatistics":"min,p50,p95,max,mean,stddev","byteMethod":"UTF-8 application payload bytes submitted or consumed","rawSamples":{"small":{"remoteCasMs":[957.6880999999994,957.7161999999953,1008.6630000000005,1010.1253999999899,1131.664499999999,1010.2290000000066],"collaboratorDiscoveryMs":[314.4563000000053,336.61179999999877,326.0486000000092,341.8180999999895,391.7189000000071,312.7167000000045],"requestsPerMutation":[5,5,5,5,5,5],"transferredBytesPerMutation":[16611,16851,17087,17321,17563,17799],"requestBytesPerMutation":[3563,3643,3719,3795,3875,3951],"responseBytesPerMutation":[13048,13208,13368,13526,13688,13848],"retriesPerMutation":[0,0,0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0,0,0]},"medium":{"remoteCasMs":[1042.3583000000071,1056.9163999999873,1497.3645000000106,1034.8304999999964],"collaboratorDiscoveryMs":[317.66089999998803,303.23459999999614,339.91659999999683,390.00070000000414],"requestsPerMutation":[5,5,5,5],"transferredBytesPerMutation":[108122,108354,108596,108834],"requestBytesPerMutation":[33403,33479,33559,33635],"responseBytesPerMutation":[74719,74875,75037,75199],"retriesPerMutation":[0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0]},"stress":{"remoteCasMs":[1570.8845000000001,1488.4135999999999],"collaboratorDiscoveryMs":[391.5997999999963,436.71140000000014],"requestsPerMutation":[5,5],"transferredBytesPerMutation":[1966979,1967213],"requestBytesPerMutation":[639551,639627],"responseBytesPerMutation":[1327428,1327586],"retriesPerMutation":[0,0],"throttleResponsesPerMutation":[0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0]}},"repetitions_small":6,"requestsPerMutation_small":5,"bytesPerMutation_small":17205.333,"throttleResponses_small":0,"retries_small":0,"retryAfterSeconds_small":[],"backoffMs_small":0,"requestCount_small":30,"requestBytes_small":22546,"responseBytes_small":80686,"repetitions_medium":4,"requestsPerMutation_medium":5,"bytesPerMutation_medium":108476.5,"throttleResponses_medium":0,"retries_medium":0,"retryAfterSeconds_medium":[],"backoffMs_medium":0,"requestCount_medium":20,"requestBytes_medium":134076,"responseBytes_medium":299830,"repetitions_stress":2,"requestsPerMutation_stress":5,"bytesPerMutation_stress":1967096,"throttleResponses_stress":0,"retries_stress":0,"retryAfterSeconds_stress":[],"backoffMs_stress":0,"requestCount_stress":10,"requestBytes_stress":1279178,"responseBytes_stress":2655014,"throttleResponses":1,"throttleRetries":1,"throttleRetryAfterSeconds":[1],"throttleBackoffMs":1000,"throttleBehavior":"bounded retry honored Retry-After and committed once"},"measurements":{"setupMs_small":4336.301500000001,"warmupMs_small":1013.119200000001,"remoteCasMinMs_small":957.6880999999994,"remoteCasP50Ms_small":1008.6630000000005,"remoteCasP95Ms_small":1131.664499999999,"remoteCasMaxMs_small":1131.664499999999,"remoteCasMeanMs_small":1012.6810333333318,"remoteCasStdDevMs_small":58.06764630017546,"collaboratorDiscoveryMinMs_small":312.7167000000045,"collaboratorDiscoveryP50Ms_small":326.0486000000092,"collaboratorDiscoveryP95Ms_small":391.7189000000071,"collaboratorDiscoveryMaxMs_small":391.7189000000071,"collaboratorDiscoveryMeanMs_small":337.2284000000024,"collaboratorDiscoveryStdDevMs_small":26.567649611385196,"cleanupMs_small":0.025200000003678724,"setupMs_medium":4590.626199999999,"warmupMs_medium":903.2223999999987,"remoteCasMinMs_medium":1034.8304999999964,"remoteCasP50Ms_medium":1042.3583000000071,"remoteCasP95Ms_medium":1497.3645000000106,"remoteCasMaxMs_medium":1497.3645000000106,"remoteCasMeanMs_medium":1157.8674250000004,"remoteCasStdDevMs_medium":196.1694524217752,"collaboratorDiscoveryMinMs_medium":303.23459999999614,"collaboratorDiscoveryP50Ms_medium":317.66089999998803,"collaboratorDiscoveryP95Ms_medium":390.00070000000414,"collaboratorDiscoveryMaxMs_medium":390.00070000000414,"collaboratorDiscoveryMeanMs_medium":337.7031999999963,"collaboratorDiscoveryStdDevMs_medium":32.90025007906918,"cleanupMs_medium":0.007400000002235174,"setupMs_stress":4971.193100000004,"warmupMs_stress":1273.4205999999976,"remoteCasMinMs_stress":1488.4135999999999,"remoteCasP50Ms_stress":1488.4135999999999,"remoteCasP95Ms_stress":1570.8845000000001,"remoteCasMaxMs_stress":1570.8845000000001,"remoteCasMeanMs_stress":1529.64905,"remoteCasStdDevMs_stress":41.23545000000013,"collaboratorDiscoveryMinMs_stress":391.5997999999963,"collaboratorDiscoveryP50Ms_stress":391.5997999999963,"collaboratorDiscoveryP95Ms_stress":436.71140000000014,"collaboratorDiscoveryMaxMs_stress":436.71140000000014,"collaboratorDiscoveryMeanMs_stress":414.15559999999823,"collaboratorDiscoveryStdDevMs_stress":22.55580000000191,"cleanupMs_stress":0.005699999994249083,"throttleRecoveryLatencyMs":2043.2795999999944}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"scales":"small,medium,stress","warmupIterations":3,"timingMethod":"performance.now monotonic elapsed time","reportedStatistics":"min,p50,p95,max,mean,stddev","byteMethod":"UTF-8 application payload bytes submitted or consumed","rawSamples":{"small":{"remoteCasMs":[1163.8445000000065,1134.7102000000014,1560.1506999999983,1013.8499000000011,1084.0688999999984,1024.7313999999897],"collaboratorDiscoveryMs":[577.2402999999904,427.6264000000083,464.14860000000044,451.14429999999993,499.34500000000116,438.9542999999976],"requestsPerMutation":[5,5,5,5,5,5],"transferredBytesPerMutation":[16611,16851,17087,17321,17563,17799],"requestBytesPerMutation":[3563,3643,3719,3795,3875,3951],"responseBytesPerMutation":[13048,13208,13368,13526,13688,13848],"retriesPerMutation":[0,0,0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0,0,0]},"medium":{"remoteCasMs":[1189.525999999998,1076.2463000000134,1362.2523999999976,2187.8552000000054],"collaboratorDiscoveryMs":[606.0789999999979,457.3874999999971,498.3483000000124,506.8665000000037],"requestsPerMutation":[5,5,5,5],"transferredBytesPerMutation":[108122,108354,108596,108834],"requestBytesPerMutation":[33403,33479,33559,33635],"responseBytesPerMutation":[74719,74875,75037,75199],"retriesPerMutation":[0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0]},"stress":{"remoteCasMs":[1727.5451999999932,1629.6545000000042],"collaboratorDiscoveryMs":[607.9027999999817,662.2829999999958],"requestsPerMutation":[5,5],"transferredBytesPerMutation":[1966979,1967213],"requestBytesPerMutation":[639551,639627],"responseBytesPerMutation":[1327428,1327586],"retriesPerMutation":[0,0],"throttleResponsesPerMutation":[0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0]}},"repetitions_small":6,"requestsPerMutation_small":5,"bytesPerMutation_small":17205.333,"throttleResponses_small":0,"retries_small":0,"retryAfterSeconds_small":[],"backoffMs_small":0,"requestCount_small":30,"requestBytes_small":22546,"responseBytes_small":80686,"repetitions_medium":4,"requestsPerMutation_medium":5,"bytesPerMutation_medium":108476.5,"throttleResponses_medium":0,"retries_medium":0,"retryAfterSeconds_medium":[],"backoffMs_medium":0,"requestCount_medium":20,"requestBytes_medium":134076,"responseBytes_medium":299830,"repetitions_stress":2,"requestsPerMutation_stress":5,"bytesPerMutation_stress":1967096,"throttleResponses_stress":0,"retries_stress":0,"retryAfterSeconds_stress":[],"backoffMs_stress":0,"requestCount_stress":10,"requestBytes_stress":1279178,"responseBytes_stress":2655014,"throttleResponses":1,"throttleRetries":1,"throttleRetryAfterSeconds":[1],"throttleBackoffMs":1000,"throttleBehavior":"bounded retry honored Retry-After and committed once"},"measurements":{"setupMs_small":5205.0218999999925,"warmupMs_small":1145.2112000000052,"remoteCasMinMs_small":1013.8499000000011,"remoteCasP50Ms_small":1084.0688999999984,"remoteCasP95Ms_small":1560.1506999999983,"remoteCasMaxMs_small":1560.1506999999983,"remoteCasMeanMs_small":1163.559266666666,"remoteCasStdDevMs_small":185.34737855476257,"collaboratorDiscoveryMinMs_small":427.6264000000083,"collaboratorDiscoveryP50Ms_small":451.14429999999993,"collaboratorDiscoveryP95Ms_small":577.2402999999904,"collaboratorDiscoveryMaxMs_small":577.2402999999904,"collaboratorDiscoveryMeanMs_small":476.4098166666663,"collaboratorDiscoveryStdDevMs_small":50.43846125194842,"cleanupMs_small":0.02479999999923166,"setupMs_medium":5101.323300000004,"warmupMs_medium":1191.1437000000005,"remoteCasMinMs_medium":1076.2463000000134,"remoteCasP50Ms_medium":1189.525999999998,"remoteCasP95Ms_medium":2187.8552000000054,"remoteCasMaxMs_medium":2187.8552000000054,"remoteCasMeanMs_medium":1453.9699750000036,"remoteCasStdDevMs_medium":435.77672826990397,"collaboratorDiscoveryMinMs_medium":457.3874999999971,"collaboratorDiscoveryP50Ms_medium":498.3483000000124,"collaboratorDiscoveryP95Ms_medium":606.0789999999979,"collaboratorDiscoveryMaxMs_medium":606.0789999999979,"collaboratorDiscoveryMeanMs_medium":517.1703250000028,"collaboratorDiscoveryStdDevMs_medium":54.63326845880387,"cleanupMs_medium":0.0063999999983934686,"setupMs_stress":5562.320800000001,"warmupMs_stress":1351.9077999999863,"remoteCasMinMs_stress":1629.6545000000042,"remoteCasP50Ms_stress":1629.6545000000042,"remoteCasP95Ms_stress":1727.5451999999932,"remoteCasMaxMs_stress":1727.5451999999932,"remoteCasMeanMs_stress":1678.5998499999987,"remoteCasStdDevMs_stress":48.945349999994505,"collaboratorDiscoveryMinMs_stress":607.9027999999817,"collaboratorDiscoveryP50Ms_stress":607.9027999999817,"collaboratorDiscoveryP95Ms_stress":662.2829999999958,"collaboratorDiscoveryMaxMs_stress":662.2829999999958,"collaboratorDiscoveryMeanMs_stress":635.0928999999887,"collaboratorDiscoveryStdDevMs_stress":27.190100000007078,"cleanupMs_stress":0.005999999993946403,"throttleRecoveryLatencyMs":2542.6902999999875}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"scales":"small,medium,stress","warmupIterations":3,"timingMethod":"performance.now monotonic elapsed time","reportedStatistics":"min,p50,p95,max,mean,stddev","byteMethod":"UTF-8 application payload bytes submitted or consumed","rawSamples":{"small":{"remoteCasMs":[1343.3274999999994,1234.487100000013,1145.3692999999912,1171.4101999999984,1193.1781000000046,1136.1638999999996],"collaboratorDiscoveryMs":[574.2472000000125,424.0304999999935,499.2792999999947,442.89109999999346,489.72000000000116,487.62510000000475],"requestsPerMutation":[5,5,5,5,5,5],"transferredBytesPerMutation":[16611,16851,17087,17321,17563,17799],"requestBytesPerMutation":[3563,3643,3719,3795,3875,3951],"responseBytesPerMutation":[13048,13208,13368,13526,13688,13848],"retriesPerMutation":[0,0,0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0,0,0]},"medium":{"remoteCasMs":[1461.2799999999988,1198.328800000003,1420.8557,1417.9465000000055],"collaboratorDiscoveryMs":[463.43299999999,561.7299999999959,485.7259999999951,469.70130000000063],"requestsPerMutation":[5,5,5,5],"transferredBytesPerMutation":[108122,108354,108596,108834],"requestBytesPerMutation":[33403,33479,33559,33635],"responseBytesPerMutation":[74719,74875,75037,75199],"retriesPerMutation":[0,0,0,0],"throttleResponsesPerMutation":[0,0,0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0,0,0]},"stress":{"remoteCasMs":[1716.373099999997,1927.6913000000059],"collaboratorDiscoveryMs":[520.2453999999998,509.117900000012],"requestsPerMutation":[5,5],"transferredBytesPerMutation":[1966979,1967213],"requestBytesPerMutation":[639551,639627],"responseBytesPerMutation":[1327428,1327586],"retriesPerMutation":[0,0],"throttleResponsesPerMutation":[0,0],"retryAfterSeconds":[],"backoffMsPerMutation":[0,0]}},"repetitions_small":6,"requestsPerMutation_small":5,"bytesPerMutation_small":17205.333,"throttleResponses_small":0,"retries_small":0,"retryAfterSeconds_small":[],"backoffMs_small":0,"requestCount_small":30,"requestBytes_small":22546,"responseBytes_small":80686,"repetitions_medium":4,"requestsPerMutation_medium":5,"bytesPerMutation_medium":108476.5,"throttleResponses_medium":0,"retries_medium":0,"retryAfterSeconds_medium":[],"backoffMs_medium":0,"requestCount_medium":20,"requestBytes_medium":134076,"responseBytes_medium":299830,"repetitions_stress":2,"requestsPerMutation_stress":5,"bytesPerMutation_stress":1967096,"throttleResponses_stress":0,"retries_stress":0,"retryAfterSeconds_stress":[],"backoffMs_stress":0,"requestCount_stress":10,"requestBytes_stress":1279178,"responseBytes_stress":2655014,"throttleResponses":1,"throttleRetries":1,"throttleRetryAfterSeconds":[1],"throttleBackoffMs":1000,"throttleBehavior":"bounded retry honored Retry-After and committed once"},"measurements":{"setupMs_small":5226.299200000009,"warmupMs_small":1292.023000000001,"remoteCasMinMs_small":1136.1638999999996,"remoteCasP50Ms_small":1171.4101999999984,"remoteCasP95Ms_small":1343.3274999999994,"remoteCasMaxMs_small":1343.3274999999994,"remoteCasMeanMs_small":1203.989350000001,"remoteCasStdDevMs_small":70.19035887199504,"collaboratorDiscoveryMinMs_small":424.0304999999935,"collaboratorDiscoveryP50Ms_small":487.62510000000475,"collaboratorDiscoveryP95Ms_small":574.2472000000125,"collaboratorDiscoveryMaxMs_small":574.2472000000125,"collaboratorDiscoveryMeanMs_small":486.2988666666667,"collaboratorDiscoveryStdDevMs_small":47.746636405260354,"cleanupMs_small":0.02440000000933651,"setupMs_medium":5934.511100000003,"warmupMs_medium":1390.169900000008,"remoteCasMinMs_medium":1198.328800000003,"remoteCasP50Ms_medium":1417.9465000000055,"remoteCasP95Ms_medium":1461.2799999999988,"remoteCasMaxMs_medium":1461.2799999999988,"remoteCasMeanMs_medium":1374.6027500000018,"remoteCasStdDevMs_medium":103.20303673333605,"collaboratorDiscoveryMinMs_medium":463.43299999999,"collaboratorDiscoveryP50Ms_medium":469.70130000000063,"collaboratorDiscoveryP95Ms_medium":561.7299999999959,"collaboratorDiscoveryMaxMs_medium":561.7299999999959,"collaboratorDiscoveryMeanMs_medium":495.1475749999954,"collaboratorDiscoveryStdDevMs_medium":39.291578528889794,"cleanupMs_medium":0.005999999993946403,"setupMs_stress":6412.782899999991,"warmupMs_stress":1617.3126000000047,"remoteCasMinMs_stress":1716.373099999997,"remoteCasP50Ms_stress":1716.373099999997,"remoteCasP95Ms_stress":1927.6913000000059,"remoteCasMaxMs_stress":1927.6913000000059,"remoteCasMeanMs_stress":1822.0322000000015,"remoteCasStdDevMs_stress":105.6591000000044,"collaboratorDiscoveryMinMs_stress":509.117900000012,"collaboratorDiscoveryP50Ms_stress":509.117900000012,"collaboratorDiscoveryP95Ms_stress":520.2453999999998,"collaboratorDiscoveryMaxMs_stress":520.2453999999998,"collaboratorDiscoveryMeanMs_stress":514.6816500000059,"collaboratorDiscoveryStdDevMs_stress":5.563749999993888,"cleanupMs_stress":0.0062000000034458935,"throttleRecoveryLatencyMs":2175.4800000000105}}} | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.323 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=2; implementation=4; test=4; migration=3; deployment=3; maintenance=4; diagnostics=3; recovery=3; rationale={"dependencies":"GitHub REST API and repository-scoped authentication","implementation":"Contents blob-SHA CAS, branch lifecycle, and bounded consistency reads","test":"Live repository, blob race, consistency, offline, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Repository-scoped credential, coordinates, and per-run branch","maintenance":"GitHub REST API, blob/ref semantics, and read-after-write consistency handling","diagnostics":"Provider responses, request telemetry, branch, blob, and generation state","recovery":"Commit history plus offline conflict reconciliation"}; total=26; mean=3.25; runs={"s0-github-s0-20260920-215851-c1":{"status":"Pass","evidence":{"scale":"1=trivial, 2=low, 3=moderate, 4=high, 5=very high","dependencies":2,"implementation":4,"test":4,"migration":3,"deployment":3,"maintenance":4,"diagnostics":3,"recovery":3,"rationale":{"dependencies":"GitHub REST API and repository-scoped authentication","implementation":"Contents blob-SHA CAS, branch lifecycle, and bounded consistency reads","test":"Live repository, blob race, consistency, offline, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Repository-scoped credential, coordinates, and per-run branch","maintenance":"GitHub REST API, blob/ref semantics, and read-after-write consistency handling","diagnostics":"Provider responses, request telemetry, branch, blob, and generation state","recovery":"Commit history plus offline conflict reconciliation"},"total":26,"mean":3.25},"measurements":{}},"s0-github-s0-20260920-215851-c2":{"status":"Pass","evidence":{"scale":"1=trivial, 2=low, 3=moderate, 4=high, 5=very high","dependencies":2,"implementation":4,"test":4,"migration":3,"deployment":3,"maintenance":4,"diagnostics":3,"recovery":3,"rationale":{"dependencies":"GitHub REST API and repository-scoped authentication","implementation":"Contents blob-SHA CAS, branch lifecycle, and bounded consistency reads","test":"Live repository, blob race, consistency, offline, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Repository-scoped credential, coordinates, and per-run branch","maintenance":"GitHub REST API, blob/ref semantics, and read-after-write consistency handling","diagnostics":"Provider responses, request telemetry, branch, blob, and generation state","recovery":"Commit history plus offline conflict reconciliation"},"total":26,"mean":3.25},"measurements":{}},"s0-github-s0-20260920-215851-c3":{"status":"Pass","evidence":{"scale":"1=trivial, 2=low, 3=moderate, 4=high, 5=very high","dependencies":2,"implementation":4,"test":4,"migration":3,"deployment":3,"maintenance":4,"diagnostics":3,"recovery":3,"rationale":{"dependencies":"GitHub REST API and repository-scoped authentication","implementation":"Contents blob-SHA CAS, branch lifecycle, and bounded consistency reads","test":"Live repository, blob race, consistency, offline, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Repository-scoped credential, coordinates, and per-run branch","maintenance":"GitHub REST API, blob/ref semantics, and read-after-write consistency handling","diagnostics":"Provider responses, request telemetry, branch, blob, and generation state","recovery":"Commit history plus offline conflict reconciliation"},"total":26,"mean":3.25},"measurements":{}}} | [JSON](raw-results.json) |

## Correctness summary

| Criterion | Outcome |
|---|---|
| Atomicity and concurrency | Not applicable |
| Collaboration | Pass |
| Crash and operational recovery | Pass |
| Corruption and rehydration | Not applicable |
| Migration and import | Pass |
| Backup and restore | Incomplete |
| Safety and security | Pass |

## Measurements

| Scenario ID | Metric | Value | Unit |
|---|---|---:|---|
| `S0-COL-006` | collaboratorDiscoveryMs | 330.333 | ms |
| `S0-PER-004` | setupMs_small | 4922.541 | ms |
| `S0-PER-004` | warmupMs_small | 1150.118 | ms |
| `S0-PER-004` | remoteCasMinMs_small | 957.688 | ms |
| `S0-PER-004` | remoteCasP50Ms_small | 1131.664 | ms |
| `S0-PER-004` | remoteCasP95Ms_small | 1560.151 | ms |
| `S0-PER-004` | remoteCasMaxMs_small | 1560.151 | ms |
| `S0-PER-004` | remoteCasMeanMs_small | 1126.743 | ms |
| `S0-PER-004` | remoteCasStdDevMs_small | 149.097 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_small | 312.717 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_small | 438.954 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_small | 577.240 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_small | 577.240 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_small | 433.312 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_small | 82.804 | ms |
| `S0-PER-004` | cleanupMs_small | 0.025 | ms |
| `S0-PER-004` | setupMs_medium | 5208.820 | ms |
| `S0-PER-004` | warmupMs_medium | 1161.512 | ms |
| `S0-PER-004` | remoteCasMinMs_medium | 1034.830 | ms |
| `S0-PER-004` | remoteCasP50Ms_medium | 1198.329 | ms |
| `S0-PER-004` | remoteCasP95Ms_medium | 2187.855 | ms |
| `S0-PER-004` | remoteCasMaxMs_medium | 2187.855 | ms |
| `S0-PER-004` | remoteCasMeanMs_medium | 1328.813 | ms |
| `S0-PER-004` | remoteCasStdDevMs_medium | 322.500 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_medium | 303.235 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_medium | 463.433 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_medium | 606.079 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_medium | 606.079 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_medium | 450.007 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_medium | 94.910 | ms |
| `S0-PER-004` | cleanupMs_medium | 0.007 | ms |
| `S0-PER-004` | setupMs_stress | 5648.766 | ms |
| `S0-PER-004` | warmupMs_stress | 1414.214 | ms |
| `S0-PER-004` | remoteCasMinMs_stress | 1488.414 | ms |
| `S0-PER-004` | remoteCasP50Ms_stress | 1629.655 | ms |
| `S0-PER-004` | remoteCasP95Ms_stress | 1927.691 | ms |
| `S0-PER-004` | remoteCasMaxMs_stress | 1927.691 | ms |
| `S0-PER-004` | remoteCasMeanMs_stress | 1676.760 | ms |
| `S0-PER-004` | remoteCasStdDevMs_stress | 152.327 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_stress | 391.600 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_stress | 509.118 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_stress | 662.283 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_stress | 662.283 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_stress | 521.310 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_stress | 101.492 | ms |
| `S0-PER-004` | cleanupMs_stress | 0.006 | ms |
| `S0-PER-004` | throttleRecoveryLatencyMs | 2253.817 | ms |

## Repeated live runs

| Run | Report | Raw evidence |
|---|---|---|
| s0-github-s0-20260920-215851-c1 | [report](runs/s0-github-s0-20260920-215851-c1/outcome.md) | [JSON](runs/s0-github-s0-20260920-215851-c1/raw-results.json) |
| s0-github-s0-20260920-215851-c2 | [report](runs/s0-github-s0-20260920-215851-c2/outcome.md) | [JSON](runs/s0-github-s0-20260920-215851-c2/raw-results.json) |
| s0-github-s0-20260920-215851-c3 | [report](runs/s0-github-s0-20260920-215851-c3/outcome.md) | [JSON](runs/s0-github-s0-20260920-215851-c3/raw-results.json) |

### Between-run variability

| Metric | Samples | Minimum | p50 | p95 | Maximum | Mean | Std. dev. |
|---|---:|---:|---:|---:|---:|---:|---:|
| setupMs_small | 3 | 4336.302 | 5205.022 | 5226.299 | 5226.299 | 4922.541 | 507.810 |
| warmupMs_small | 3 | 1013.119 | 1145.211 | 1292.023 | 1292.023 | 1150.118 | 139.517 |
| remoteCasMinMs_small | 3 | 957.688 | 1013.850 | 1136.164 | 1136.164 | 1035.901 | 91.258 |
| remoteCasP50Ms_small | 3 | 1008.663 | 1084.069 | 1171.410 | 1171.410 | 1088.047 | 81.447 |
| remoteCasP95Ms_small | 3 | 1131.664 | 1343.327 | 1560.151 | 1560.151 | 1345.048 | 214.248 |
| remoteCasMaxMs_small | 3 | 1131.664 | 1343.327 | 1560.151 | 1560.151 | 1345.048 | 214.248 |
| remoteCasMeanMs_small | 3 | 1012.681 | 1163.559 | 1203.989 | 1203.989 | 1126.743 | 100.828 |
| remoteCasStdDevMs_small | 3 | 58.068 | 70.190 | 185.347 | 185.347 | 104.535 | 70.247 |
| collaboratorDiscoveryMinMs_small | 3 | 312.717 | 424.030 | 427.626 | 427.626 | 388.125 | 65.330 |
| collaboratorDiscoveryP50Ms_small | 3 | 326.049 | 451.144 | 487.625 | 487.625 | 421.606 | 84.742 |
| collaboratorDiscoveryP95Ms_small | 3 | 391.719 | 574.247 | 577.240 | 577.240 | 514.402 | 106.257 |
| collaboratorDiscoveryMaxMs_small | 3 | 391.719 | 574.247 | 577.240 | 577.240 | 514.402 | 106.257 |
| collaboratorDiscoveryMeanMs_small | 3 | 337.228 | 476.410 | 486.299 | 486.299 | 433.312 | 83.358 |
| collaboratorDiscoveryStdDevMs_small | 3 | 26.568 | 47.747 | 50.438 | 50.438 | 41.584 | 13.074 |
| cleanupMs_small | 3 | 0.024 | 0.025 | 0.025 | 0.025 | 0.025 | 0.000 |
| setupMs_medium | 3 | 4590.626 | 5101.323 | 5934.511 | 5934.511 | 5208.820 | 678.361 |
| warmupMs_medium | 3 | 903.222 | 1191.144 | 1390.170 | 1390.170 | 1161.512 | 244.822 |
| remoteCasMinMs_medium | 3 | 1034.830 | 1076.246 | 1198.329 | 1198.329 | 1103.135 | 85.001 |
| remoteCasP50Ms_medium | 3 | 1042.358 | 1189.526 | 1417.947 | 1417.947 | 1216.610 | 189.253 |
| remoteCasP95Ms_medium | 3 | 1461.280 | 1497.365 | 2187.855 | 2187.855 | 1715.500 | 409.469 |
| remoteCasMaxMs_medium | 3 | 1461.280 | 1497.365 | 2187.855 | 2187.855 | 1715.500 | 409.469 |
| remoteCasMeanMs_medium | 3 | 1157.867 | 1374.603 | 1453.970 | 1453.970 | 1328.813 | 153.270 |
| remoteCasStdDevMs_medium | 3 | 103.203 | 196.169 | 435.777 | 435.777 | 245.050 | 171.590 |
| collaboratorDiscoveryMinMs_medium | 3 | 303.235 | 457.387 | 463.433 | 463.433 | 408.018 | 90.796 |
| collaboratorDiscoveryP50Ms_medium | 3 | 317.661 | 469.701 | 498.348 | 498.348 | 428.570 | 97.112 |
| collaboratorDiscoveryP95Ms_medium | 3 | 390.001 | 561.730 | 606.079 | 606.079 | 519.270 | 114.125 |
| collaboratorDiscoveryMaxMs_medium | 3 | 390.001 | 561.730 | 606.079 | 606.079 | 519.270 | 114.125 |
| collaboratorDiscoveryMeanMs_medium | 3 | 337.703 | 495.148 | 517.170 | 517.170 | 450.007 | 97.879 |
| collaboratorDiscoveryStdDevMs_medium | 3 | 32.900 | 39.292 | 54.633 | 54.633 | 42.275 | 11.169 |
| cleanupMs_medium | 3 | 0.006 | 0.006 | 0.007 | 0.007 | 0.007 | 0.001 |
| setupMs_stress | 3 | 4971.193 | 5562.321 | 6412.783 | 6412.783 | 5648.766 | 724.672 |
| warmupMs_stress | 3 | 1273.421 | 1351.908 | 1617.313 | 1617.313 | 1414.214 | 180.214 |
| remoteCasMinMs_stress | 3 | 1488.414 | 1629.655 | 1716.373 | 1716.373 | 1611.480 | 115.061 |
| remoteCasP50Ms_stress | 3 | 1488.414 | 1629.655 | 1716.373 | 1716.373 | 1611.480 | 115.061 |
| remoteCasP95Ms_stress | 3 | 1570.885 | 1727.545 | 1927.691 | 1927.691 | 1742.040 | 178.844 |
| remoteCasMaxMs_stress | 3 | 1570.885 | 1727.545 | 1927.691 | 1927.691 | 1742.040 | 178.844 |
| remoteCasMeanMs_stress | 3 | 1529.649 | 1678.600 | 1822.032 | 1822.032 | 1676.760 | 146.200 |
| remoteCasStdDevMs_stress | 3 | 41.235 | 48.945 | 105.659 | 105.659 | 65.280 | 35.181 |
| collaboratorDiscoveryMinMs_stress | 3 | 391.600 | 509.118 | 607.903 | 607.903 | 502.873 | 108.287 |
| collaboratorDiscoveryP50Ms_stress | 3 | 391.600 | 509.118 | 607.903 | 607.903 | 502.873 | 108.287 |
| collaboratorDiscoveryP95Ms_stress | 3 | 436.711 | 520.245 | 662.283 | 662.283 | 539.747 | 114.043 |
| collaboratorDiscoveryMaxMs_stress | 3 | 436.711 | 520.245 | 662.283 | 662.283 | 539.747 | 114.043 |
| collaboratorDiscoveryMeanMs_stress | 3 | 414.156 | 514.682 | 635.093 | 635.093 | 521.310 | 110.618 |
| collaboratorDiscoveryStdDevMs_stress | 3 | 5.564 | 22.556 | 27.190 | 27.190 | 18.437 | 11.386 |
| cleanupMs_stress | 3 | 0.006 | 0.006 | 0.006 | 0.006 | 0.006 | 0.000 |
| throttleRecoveryLatencyMs | 3 | 2043.280 | 2175.480 | 2542.690 | 2542.690 | 2253.817 | 258.757 |

## Failures and recovery

No scenario failures.

## Risks and required follow-up

| Gate | State | Owner | Evidence required |
|---|---|---|---|
| `S0-BKP-004` | Incomplete | S0 provider test owner | github restore cannot establish one atomic authoritative head with the current spike transport. |

## Configuration recommendation

Do not treat this component as selected. Close every applicable failed, blocked, incomplete, or unexecuted absolute gate first.

## Evidence

- [Raw machine-readable results](raw-results.json)
- [Redacted preflight](preflight.json)
- [Cleanup manifest](cleanup-manifest.json) — `sha256:9d3156572d1a10c8bce4357a5aca01de44a87efb2ab6d052ecbb1ce0b58491fb`

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
