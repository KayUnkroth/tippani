# S0 Outcome: CFG-ONEDRIVE-SYNC

**Report date:** 2026-09-21
**Harness revision:** s0-harness-v4
**Source revision:** sha256:eef1ed728c3c3078e27ef025e9b45076598359a50acd09196acb4636720b9167
**Catalog revision:** sha256:a2d4052f88cde758aff0bccf62bebd380907b935259f9571dd8f1646740723e7
**Applicability revision:** sha256:7d9b94e9ea7e7f38893230577d6b5aa26ab141e96e3d430244ec51f8c5849b4d
**Configuration revision:** sha256:8d8fe024b40b8818b44b8cfe0710dfb9edb770409d6e8964b3567206e2d37bcd
**Configuration ID:** CFG-ONEDRIVE-SYNC
**Adapter:** onedrive
**Authoritative backing path:** onedrive
**Dataset scale:** small
**Recommendation:** Incomplete
**Applicable absolute gates:** 18
**Eligibility:** Incomplete

## Coverage

Executed 1 of 58 catalog scenarios. 20 apply to this configuration; 18 applicable absolute gates were not executed.

| Outcome class | Count | Meaning |
|---|---:|---|
| Pass | 0 | Executed and satisfied |
| Fail | 0 | Executed and violated |
| Blocked | 0 | Applicable, but a prerequisite is unavailable |
| Incomplete | 0 | Applicable implementation or evidence is incomplete |
| N/A | 0 | Scenario-specific contract rationale plus approver identity, approval date, and reference |
| Not applicable | 38 | Assigned to another configuration by design |
| Not executed | 20 | Applicable, but no result exists |

Applicable absolute gates not executed:

- `S0-COL-002` — Two concurrent clients on a shared backing path cannot silently overwrite each other
- `S0-COL-003` — Two clients reconnecting from different generations receive deterministic conflict/reload behavior
- `S0-COL-004` — Remote success with a lost response is reconciled without duplicate generation or false failure
- `S0-COL-005` — Offline work remains pending until authoritative CAS confirmation and reconciles without silent overwrite
- `S0-COL-006` — A second client discovers a committed generation through the backing path change mechanism
- `S0-BCK-002` — OneDrive ETag/version preconditions reject stale updates and support version recovery
- `S0-BCK-005` — Provider outage, throttling, auth expiry, quota, or permission loss never produces success-shaped state
- `S0-MIG-004` — Local-to-OneDrive/ADO/GitHub rehome preserves WorkspaceId and establishes one authority only after receipt
- `S0-BKP-003` — Shared-backing history/export recovers a known generation without rewriting newer valid history
- `S0-BKP-004` — Restored shared workspace establishes one explicit authoritative head
- `S0-REC-003` — Provider outage/auth/throttle/lost-response recovery reconciles authoritative state
- `S0-REC-004` — Local offline cache reconciles against newer authority without silent overwrite
- `S0-SEC-001` — Preflight rejects non-allow-listed, unmarked, default/protected, or production coordinates before provider calls
- `S0-SEC-002` — Effective sandbox identity is verified and corporate-account fallback is impossible
- `S0-SEC-003` — Only synthetic data appears in stores, fixtures, logs, backups, screenshots, dumps, and reports
- `S0-SEC-004` — Credentials remain brokered/redacted and absent from workspace state and evidence
- `S0-SEC-005` — Cleanup/reaper deletes only run-owned resources recorded in the manifest
- `S0-SEC-006` — Provider request/object/time/storage budgets stop unsafe or abusive runs

An unexecuted absolute gate is missing evidence, not a pass.

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
| Temporary store root | tippani-s0-s0-onedrive-sync-s0-20260920-215851-MrZWa0 |
| Network characteristics | Not recorded |
| Provider region | Not recorded |
| Storage characteristics | Not recorded |
| Sync-client state | verified-signed-in |
| Repository protections | Not recorded |
| Dependency versions | node=24.21.0; sqlite=3.53.4 |
| Workload mix | scenario-defined deterministic small/medium/stress fixtures |
| Known limitations | None recorded |
| Process topology | Scenario-dependent: distinct child PIDs are required and recorded for collaboration gates |
| Dataset scale | small |
| Applicability profile | onedrive |
| Store namespace | tippani-s0/s0-onedrive-sync-s0-20260920-215851 |
| Authentication setup | Personal OneDrive sync identity |
| Cleanup manifest | sync-cleanup-s0-onedrive-sync-s0-20260920-215851 |
| Cleanup manifest artifact | cleanup-manifest.json |
| Cleanup manifest digest | sha256:4d291dc14262e53272c973369726fab3d1701066ee84657a1f1c838f7d46d81f |
| Cleanup expiry | 2026-09-22T15:50:03.980Z |
| Effective target hash | — |

## Method and preflight

| Check | Result |
|---|---|
| Synthetic data only | Pass |
| Corporate-account fallback disabled | Pass |
| Ownership marker | `tippani-s0:s0-onedrive-sync-s0-20260920-215851` |
| Operation budget | 100 |
| Duration budget | 300000 ms |
| Object budget | 10000 |
| Storage/transfer budget | 104857600 bytes |
| Final metered operations | 0 |
| Final metered objects | 0 |
| Final metered bytes | 0 |
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
| `S0-COL-002` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-COL-003` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-COL-004` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-COL-005` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-COL-006` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-BCK-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-002` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-BCK-003` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-004` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BCK-005` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
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
| `S0-MIG-004` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-IMP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-IMP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-BKP-003` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-BKP-004` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-REC-001` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-002` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-REC-003` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-REC-004` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-REC-005` | absolute | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-SEC-001` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-SEC-002` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-SEC-003` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-SEC-004` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-SEC-005` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-SEC-006` | absolute | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-PER-001` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-002` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-003` | relative | Not applicable |  | Assigned to another engine/backing-path configuration by the applicability matrix. | [JSON](raw-results.json) |
| `S0-PER-004` | relative | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |
| `S0-PER-005` | relative | Not executed |  | Applicable scenario has no result. | [JSON](raw-results.json) |

## Correctness summary

| Criterion | Outcome |
|---|---|
| Atomicity and concurrency | Not applicable |
| Collaboration | Incomplete |
| Crash and operational recovery | Incomplete |
| Corruption and rehydration | Not applicable |
| Migration and import | Incomplete |
| Backup and restore | Incomplete |
| Safety and security | Incomplete |

## Measurements

| Scenario ID | Metric | Value | Unit |
|---|---|---:|---|
| `S0-BCK-006` | syncedFolderCreateMs | 7.531 | ms |

## Failures and recovery

No scenario failures.

## Risks and required follow-up

| Gate | State | Owner | Evidence required |
|---|---|---|---|
| `S0-COL-002` | Not executed | S0 provider test owner | Two concurrent clients on a shared backing path cannot silently overwrite each other |
| `S0-COL-003` | Not executed | S0 provider test owner | Two clients reconnecting from different generations receive deterministic conflict/reload behavior |
| `S0-COL-004` | Not executed | S0 provider test owner | Remote success with a lost response is reconciled without duplicate generation or false failure |
| `S0-COL-005` | Not executed | S0 provider test owner | Offline work remains pending until authoritative CAS confirmation and reconciles without silent overwrite |
| `S0-COL-006` | Not executed | S0 provider test owner | A second client discovers a committed generation through the backing path change mechanism |
| `S0-BCK-002` | Not executed | S0 provider test owner | OneDrive ETag/version preconditions reject stale updates and support version recovery |
| `S0-BCK-005` | Not executed | S0 provider test owner | Provider outage, throttling, auth expiry, quota, or permission loss never produces success-shaped state |
| `S0-MIG-004` | Not executed | S0 provider test owner | Local-to-OneDrive/ADO/GitHub rehome preserves WorkspaceId and establishes one authority only after receipt |
| `S0-BKP-003` | Not executed | S0 provider test owner | Shared-backing history/export recovers a known generation without rewriting newer valid history |
| `S0-BKP-004` | Not executed | S0 provider test owner | Restored shared workspace establishes one explicit authoritative head |
| `S0-REC-003` | Not executed | S0 provider test owner | Provider outage/auth/throttle/lost-response recovery reconciles authoritative state |
| `S0-REC-004` | Not executed | S0 provider test owner | Local offline cache reconciles against newer authority without silent overwrite |
| `S0-SEC-001` | Not executed | S0 implementation owner | Preflight rejects non-allow-listed, unmarked, default/protected, or production coordinates before provider calls |
| `S0-SEC-002` | Not executed | S0 implementation owner | Effective sandbox identity is verified and corporate-account fallback is impossible |
| `S0-SEC-003` | Not executed | S0 implementation owner | Only synthetic data appears in stores, fixtures, logs, backups, screenshots, dumps, and reports |
| `S0-SEC-004` | Not executed | S0 implementation owner | Credentials remain brokered/redacted and absent from workspace state and evidence |
| `S0-SEC-005` | Not executed | S0 implementation owner | Cleanup/reaper deletes only run-owned resources recorded in the manifest |
| `S0-SEC-006` | Not executed | S0 implementation owner | Provider request/object/time/storage budgets stop unsafe or abusive runs |

## Configuration recommendation

Do not treat this component as selected. Close every applicable failed, blocked, incomplete, or unexecuted absolute gate first.

## Evidence

- [Raw machine-readable results](raw-results.json)
- [Redacted preflight](preflight.json)
- [Cleanup manifest](cleanup-manifest.json) — `sha256:4d291dc14262e53272c973369726fab3d1701066ee84657a1f1c838f7d46d81f`

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| Implementer | | | |
| Independent reviewer | | | |
