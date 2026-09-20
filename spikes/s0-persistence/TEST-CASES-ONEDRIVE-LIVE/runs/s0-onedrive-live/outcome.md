# S0 Outcome: CFG-ONEDRIVE-LIVE

**Report date:** 2026-09-20
**Harness revision:** s0-harness-v4
**Source revision:** sha256:193085e84b603e45f4d00c97b049412f3078a053d43ae8f1315fba149da89998
**Catalog revision:** sha256:a2d4052f88cde758aff0bccf62bebd380907b935259f9571dd8f1646740723e7
**Applicability revision:** sha256:7d9b94e9ea7e7f38893230577d6b5aa26ab141e96e3d430244ec51f8c5849b4d
**Configuration revision:** sha256:883a4ea8e2aa3529546de0531763b9e8242216b2335e955ef57ddf9e5cffa70a
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
| Pass | 5 | Executed and satisfied |
| Fail | 2 | Executed and violated |
| Blocked | 13 | Applicable, but a prerequisite is unavailable |
| Incomplete | 0 | Applicable implementation or evidence is incomplete |
| N/A | 0 | Scenario-specific contract rationale plus approver identity, approval date, and reference |
| Not applicable | 38 | Assigned to another configuration by design |
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
| Provider/API version | Microsoft Graph v1.0 |
| Configured platform/filesystem | windows-ntfs |
| Detected filesystem | Not recorded |
| Temporary store root | tippani-s0-s0-onedrive-live-I5fdTt |
| Network characteristics | Not recorded |
| Provider region | Not recorded |
| Storage characteristics | Not recorded |
| Sync-client state | Not applicable |
| Repository protections | Not recorded |
| Dependency versions | node=22.23.2; sqlite=3.51.3 |
| Workload mix | scenario-defined deterministic small/medium/stress fixtures |
| Known limitations | None recorded |
| Process topology | Scenario-dependent: distinct child PIDs are required and recorded for collaboration gates |
| Dataset scale | small |
| Applicability profile | onedrive |
| Store namespace | tippani-s0/s0-onedrive-live |
| Authentication setup | Live delegated identity (supplied at runtime) |
| Cleanup manifest | syn-cleanup-s0-onedrive-live |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:dd390954fbaff2a6eff172d83942dbe1feda181f43799e63237f550f6e690670 |
| Cleanup expiry | 2026-09-21T18:01:54.668Z |
| Effective target hash | — |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `tippani-s0:s0-onedrive-live` |
| Operation budget | 100 |
| Duration budget | 300000 ms |
| Object budget | 10000 |
| Storage/transfer budget | 104857600 bytes |
| Final metered operations | 1 |
| Final metered objects | 0 |
| Final metered bytes | 16 |
| Cleanup requests/retries/bytes | {"requests":0,"retries":0,"transferredBytes":0} |
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
| `S0-COL-002` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
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
| `S0-MIG-004` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Pass | 0.417 | providerPreflightRejected=true; errorCount=8 | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Fail | 1.374 | — | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Pass | 0.170 | syntheticFixtureAccepted=true; actualDataRejected=true | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Pass | 0.395 | configSecretRejected=true; workspaceHasNoSecrets=true | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Fail | 0.662 | — | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Pass | 55.067 | nonPositiveBudgetsRejected=true; operationLimitEnforced=true; objectLimitEnforced=true; byteLimitEnforced=true; deadlineEnforced=true; abortSignalEnforced=true; providerChildBudget={"metered":true,"childPid":112669,"operationsBefore":0,"operationsAfter":1}; cleanupBudgeted=true; cleanupSharedDeadline=true | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Blocked | 0.000 | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Pass | 0.033 | scale=1=trivial, 2=low, 3=moderate, 4=high, 5=very high; dependencies=2; implementation=3; test=4; migration=3; deployment=3; maintenance=3; diagnostics=3; recovery=3; rationale={"dependencies":"Microsoft Graph drive API and delegated authentication","implementation":"Graph drive-item envelope with ETag CAS and version history","test":"Live sandbox, concurrency, offline, failure, version, and cleanup coverage","migration":"Receipt-gated local-to-drive rehome","deployment":"Delegated credential, drive coordinates, and approved namespace","maintenance":"Graph API and OneDrive consistency behavior","diagnostics":"Provider responses, request telemetry, and authoritative generation state","recovery":"Version history plus offline conflict reconciliation"}; total=24; mean=3 | [JSON](raw-results.json) |

## Correctness summary

| Criterion | Outcome |
|---|---|
| Atomicity and concurrency | Not applicable |
| Collaboration | Blocked |
| Crash and operational recovery | Blocked |
| Corruption and rehydration | Not applicable |
| Migration and import | Blocked |
| Backup and restore | Blocked |
| Safety and security | Fail |

## Measurements

| Scenario ID | Metric | Value | Unit |
|---|---|---:|---|
| - | No measurements emitted | - | - |

## Failures and recovery

- **S0-SEC-002:** The sandbox config must pass its own preflight
[32m+ actual[39m [31m- expected[39m

[32m+[39m [
[32m+[39m   'Live provider identity must be provider-derived and coordinates resolved before provider calls',
[32m+[39m   'Structured preflight approval requires approver, approval date, and reference',
[32m+[39m   'Preflight approval target hash does not match the effective provider target'
[32m+[39m ]
[31m-[39m []

- **S0-SEC-005:** No onedrive credential supplied

## Risks and required follow-up

| Gate | State | Owner | Evidence required |
|---|---|---|---|
| `S0-SEC-002` | Fail | S0 implementation owner | The sandbox config must pass its own preflight [32m+ actual[39m [31m- expected[39m  [32m+[39m [ [32m+[39m   'Live provider identity must be provider-derived and coordinates resolved before provider calls', [32m+[39m   'Structured preflight approval requires approver, approval date, and reference', [32m+[39m   'Preflight approval target hash does not match the effective provider target' [32m+[39m ] [31m-[39m []  |
| `S0-SEC-005` | Fail | S0 implementation owner | No onedrive credential supplied |
| `S0-COL-002` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-COL-003` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-COL-004` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-COL-005` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-COL-006` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-BCK-002` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-BCK-005` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-MIG-004` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-BKP-003` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-BKP-004` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-REC-003` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |
| `S0-REC-004` | Blocked | S0 provider test owner | Live provider runtime variables not supplied: S0_ONEDRIVE_TOKEN, S0_ONEDRIVE_DRIVE_ID, S0_ONEDRIVE_FOLDER, S0_PREFLIGHT_APPROVER, S0_PREFLIGHT_APPROVED_AT, S0_PREFLIGHT_APPROVAL_REFERENCE, S0_PREFLIGHT_TARGET_HASH |

## Configuration recommendation

Do not treat this component as selected. Close every applicable failed, blocked, incomplete, or unexecuted absolute gate first.

## Evidence

- [Raw machine-readable results](raw-results.json)
- [Redacted preflight](preflight.json)
- [Cleanup manifest](cleanup-manifest.json) — `sha256:dd390954fbaff2a6eff172d83942dbe1feda181f43799e63237f550f6e690670`

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
