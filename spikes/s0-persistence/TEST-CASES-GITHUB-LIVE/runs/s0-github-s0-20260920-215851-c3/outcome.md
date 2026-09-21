# S0 Outcome: CFG-GITHUB-LIVE

**Report date:** 2026-09-21
**Harness revision:** s0-harness-v4
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
| Temporary store root | tippani-s0-s0-github-s0-20260920-215851-c3-GPA8Tw |
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
| Store namespace | tippani-s0/s0-github-s0-20260920-215851-c3 |
| Authentication setup | One GitHub identity (supplied at runtime) |
| Cleanup manifest | syn-cleanup-s0-github-live |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:0b18685db652bc0522813d7a2799340723c7751f1e1492ca57c8ba2fdf9e3efc |
| Cleanup expiry | 2026-09-22T15:26:14.566Z |
| Effective target hash | sha256:cf7befceb187dfe95962ed5689afef5d3475eb8ce5aaf9e386f06d0216048ee4 |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `tippani-s0:s0-github-s0-20260920-215851-c3` |
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
| `S0-COL-002` | absolute | Pass | 7828.730 | accounts=1; clientProcesses=2; clientProcessIds=[12348,2452]; executionMode=independent-os-processes; logicalActors=Synthetic Client 1,Synthetic Client 2; winners=1; staleConflicts=1; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Pass | 11008.308 | accounts=1; clientProcesses=2; clientProcessIds=[7452,11676]; executionMode=independent-os-processes; staleGeneration=0; reloadedGeneration=1; reconciledGeneration=2; deterministicReconnect=true | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Pass | 5519.136 | lostResponseDetected=true; noDuplicate=true; reconciledGeneration=1 | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Pass | 9189.842 | offlinePendingConflicted=true; processRestartRecoveredQueue=true; queueWriterProcessIds=[4208,5008]; queueRestartInspectorProcessId=11212; fifoStoppedAtFirstConflict=true; staleEntryRetained=true; noSilentOverwrite=true; authorityGeneration=2 | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Pass | 7220.337 | accounts=1; clientProcesses=2; clientProcessIds=[7264,11936]; executionMode=independent-os-processes; changeMechanism=GitHub ref and contents polling; observedGeneration=1 | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Pass | 9871.325 | winners=1; staleConflicts=1; durableGeneration=2 | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Pass | 7675.385 | faultsRejected=4; faultsExercised=["auth-expiry","outage","quota","permission-loss","throttle"]; rejectedFaultGenerationUnchanged=true; throttleRecoveredByBoundedRetry=true; throttleResponses=1; retries=1; retryAfterSeconds=[1]; backoffMs=1000; transferredBytes=102905 | [JSON](raw-results.json) |
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
| `S0-MIG-004` | absolute | Pass | 3262.188 | workspaceIdPreserved=true; generation=1; receipt=true | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Pass | 4776.193 | recoveredGeneration=1 | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Incomplete | 0.258 | github restore cannot establish one atomic authoritative head with the current spike transport. | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Pass | 24311.518 | faultsExercised=["outage","throttle","auth-expiry","quota","permission-loss","lost-response"]; recoveredFaults=["outage","throttle","auth-expiry","quota","permission-loss"]; throttleRecovery={"boundedRetries":1,"retryAfterSeconds":1,"minimumBackoffMs":1000}; lostResponseReconciled=true; blindRetryRejected=true | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Pass | 11743.496 | discoveredNewerAuthority=true; transientFailureRetained=true; processRestartRecoveredQueue=true; queueWriterProcessId=8736; queueRestartInspectorProcessId=4916; noSilentOverwrite=true | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Pass | 0.662 | providerPreflightRejected=true; errorCount=8 | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Pass | 0.564 | corporateFallbackImpossible=true | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 1.158 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Pass | 0.576 | configSecretRejected=true; workspaceHasNoSecrets=true | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Pass | 0.600 | ownedAuthorized=true; foreignRefused=true | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Pass | 99.705 | nonPositiveBudgetsRejected=true; operationLimitEnforced=true; objectLimitEnforced=true; byteLimitEnforced=true; deadlineEnforced=true; abortSignalEnforced=true; providerChildBudget={"metered":true,"childPid":7056,"operationsBefore":303,"operationsAfter":304}; cleanupBudgeted=true; cleanupSharedDeadline=true | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Pass | 44590.543 | scales=small,medium,stress; warmupIterations=3; timingMethod=performance.now monotonic elapsed time; reportedStatistics=min,p50,p95,max,mean,stddev; byteMethod=UTF-8 application payload bytes submitted or consumed; repetitions_small=6; requestsPerMutation_small=5; bytesPerMutation_small=17205.333; throttleResponses_small=0; retries_small=0; retryAfterSeconds_small=[]; backoffMs_small=0; requestCount_small=30; requestBytes_small=22546; responseBytes_small=80686; repetitions_medium=4; requestsPerMutation_medium=5; bytesPerMutation_medium=108476.5; throttleResponses_medium=0; retries_medium=0; retryAfterSeconds_medium=[]; backoffMs_medium=0; requestCount_medium=20; requestBytes_medium=134076; responseBytes_medium=299830; repetitions_stress=2; requestsPerMutation_stress=5; bytesPerMutation_stress=1967096; throttleResponses_stress=0; retries_stress=0; retryAfterSeconds_stress=[]; backoffMs_stress=0; requestCount_stress=10; requestBytes_stress=1279178; responseBytes_stress=2655014; throttleResponses=1; throttleRetries=1; throttleRetryAfterSeconds=[1]; throttleBackoffMs=1000; throttleBehavior=bounded retry honored Retry-After and committed once | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.319 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=2; implementation=4; test=4; migration=3; deployment=3; maintenance=4; diagnostics=3; recovery=3; rationale={"dependencies":"GitHub REST API and repository-scoped authentication","implementation":"Contents blob-SHA CAS, branch lifecycle, and bounded consistency reads","test":"Live repository, blob race, consistency, offline, history, and cleanup coverage","migration":"Receipt-gated local-to-repository rehome","deployment":"Repository-scoped credential, coordinates, and per-run branch","maintenance":"GitHub REST API, blob/ref semantics, and read-after-write consistency handling","diagnostics":"Provider responses, request telemetry, branch, blob, and generation state","recovery":"Commit history plus offline conflict reconciliation"}; total=26; mean=3.25 | [JSON](raw-results.json) |

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
| `S0-COL-006` | collaboratorDiscoveryMs | 279.000 | ms |
| `S0-PER-004` | setupMs_small | 5226.299 | ms |
| `S0-PER-004` | warmupMs_small | 1292.023 | ms |
| `S0-PER-004` | remoteCasMinMs_small | 1136.164 | ms |
| `S0-PER-004` | remoteCasP50Ms_small | 1171.410 | ms |
| `S0-PER-004` | remoteCasP95Ms_small | 1343.327 | ms |
| `S0-PER-004` | remoteCasMaxMs_small | 1343.327 | ms |
| `S0-PER-004` | remoteCasMeanMs_small | 1203.989 | ms |
| `S0-PER-004` | remoteCasStdDevMs_small | 70.190 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_small | 424.030 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_small | 487.625 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_small | 574.247 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_small | 574.247 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_small | 486.299 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_small | 47.747 | ms |
| `S0-PER-004` | cleanupMs_small | 0.024 | ms |
| `S0-PER-004` | setupMs_medium | 5934.511 | ms |
| `S0-PER-004` | warmupMs_medium | 1390.170 | ms |
| `S0-PER-004` | remoteCasMinMs_medium | 1198.329 | ms |
| `S0-PER-004` | remoteCasP50Ms_medium | 1417.947 | ms |
| `S0-PER-004` | remoteCasP95Ms_medium | 1461.280 | ms |
| `S0-PER-004` | remoteCasMaxMs_medium | 1461.280 | ms |
| `S0-PER-004` | remoteCasMeanMs_medium | 1374.603 | ms |
| `S0-PER-004` | remoteCasStdDevMs_medium | 103.203 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_medium | 463.433 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_medium | 469.701 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_medium | 561.730 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_medium | 561.730 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_medium | 495.148 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_medium | 39.292 | ms |
| `S0-PER-004` | cleanupMs_medium | 0.006 | ms |
| `S0-PER-004` | setupMs_stress | 6412.783 | ms |
| `S0-PER-004` | warmupMs_stress | 1617.313 | ms |
| `S0-PER-004` | remoteCasMinMs_stress | 1716.373 | ms |
| `S0-PER-004` | remoteCasP50Ms_stress | 1716.373 | ms |
| `S0-PER-004` | remoteCasP95Ms_stress | 1927.691 | ms |
| `S0-PER-004` | remoteCasMaxMs_stress | 1927.691 | ms |
| `S0-PER-004` | remoteCasMeanMs_stress | 1822.032 | ms |
| `S0-PER-004` | remoteCasStdDevMs_stress | 105.659 | ms |
| `S0-PER-004` | collaboratorDiscoveryMinMs_stress | 509.118 | ms |
| `S0-PER-004` | collaboratorDiscoveryP50Ms_stress | 509.118 | ms |
| `S0-PER-004` | collaboratorDiscoveryP95Ms_stress | 520.245 | ms |
| `S0-PER-004` | collaboratorDiscoveryMaxMs_stress | 520.245 | ms |
| `S0-PER-004` | collaboratorDiscoveryMeanMs_stress | 514.682 | ms |
| `S0-PER-004` | collaboratorDiscoveryStdDevMs_stress | 5.564 | ms |
| `S0-PER-004` | cleanupMs_stress | 0.006 | ms |
| `S0-PER-004` | throttleRecoveryLatencyMs | 2175.480 | ms |

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
- [Cleanup manifest](cleanup-manifest.json) — `sha256:0b18685db652bc0522813d7a2799340723c7751f1e1492ca57c8ba2fdf9e3efc`

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
