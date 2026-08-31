# S0 architecture-mapping handoff

**Generated:** 2026-08-31T23:47:29.669Z
**Host:** win32 x64 node 24.14.0
**Final ADR status:** Accepted
**ADR decision:** Approved by Kay Unkroth on 2026-08-31.
**Recommended architecture shape:** Hybrid — one local engine plus provider-native CAS transports behind `IWorkspaceStore`.
**Concrete mapping recommendation:** Hybrid SQLite + provider-native CAS; see [ADR](../../ADR-s0-persistence-architecture.md).

Eligibility is evaluated per engine/backing-path configuration and then rolled up into
candidate mappings. Gates assigned to another configuration are **Not applicable**, not
missing. `N/A` is reserved for a reviewer-approved contract-level exception inside an
applicable configuration. `Blocked`, `Incomplete`, and `Not executed` remain distinct.

Relative metrics may compare eligible mappings; they do not override an absolute gate.

## Applicability-aware configuration matrix

| Configuration | Engine | Backing path | Applicable absolute | Pass | Fail | Blocked / incomplete | N/A | Not executed | Not applicable (absolute) | Eligibility | Evidence |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| Local SQLite | SQLite | Local filesystem | 38 | 37 | 0 | 0 | 1 | 0 | 14 | Yes | [report](../CFG-LOCAL-SQLITE/outcome.md) · [raw](../CFG-LOCAL-SQLITE/raw-results.json) |
| Local generation-CAS envelope | Generation-CAS envelope | Local filesystem | 38 | 38 | 0 | 0 | 0 | 0 | 14 | Yes | [report](../CFG-LOCAL-CAS/outcome.md) · [raw](../CFG-LOCAL-CAS/raw-results.json) |
| OneDrive generation-CAS envelope | Generation-CAS envelope | OneDrive | 18 | 18 | 0 | 0 | 0 | 0 | 34 | Yes | [report](../CFG-ONEDRIVE-LIVE/outcome.md) · [raw](../CFG-ONEDRIVE-LIVE/raw-results.json) |
| ADO generation-CAS envelope | Generation-CAS envelope | Azure DevOps repository | 18 | 18 | 0 | 0 | 0 | 0 | 34 | Yes | [report](../CFG-ADO-LIVE/outcome.md) · [raw](../CFG-ADO-LIVE/raw-results.json) |
| GitHub generation-CAS envelope | Generation-CAS envelope | GitHub repository | 18 | 18 | 0 | 0 | 0 | 0 | 34 | Yes | [report](../CFG-GITHUB-LIVE/outcome.md) · [raw](../CFG-GITHUB-LIVE/raw-results.json) |

## Configuration evidence matrix

| Configuration | Correctness | Collaboration | Recovery | Performance | Complexity | Recommendation | Conditions |
|---|---|---|---|---|---|---|---|
| [Local SQLite](../CFG-LOCAL-SQLITE/outcome.md) | [Pass](../CFG-LOCAL-SQLITE/outcome.md) ([raw](../CFG-LOCAL-SQLITE/raw-results.json)) | [Pass](../CFG-LOCAL-SQLITE/outcome.md) ([raw](../CFG-LOCAL-SQLITE/raw-results.json)) | [Pass](../CFG-LOCAL-SQLITE/outcome.md) ([raw](../CFG-LOCAL-SQLITE/raw-results.json)) | [Pass](../CFG-LOCAL-SQLITE/outcome.md) ([raw](../CFG-LOCAL-SQLITE/raw-results.json)) | [14/40](../CFG-LOCAL-SQLITE/outcome.md) ([raw](../CFG-LOCAL-SQLITE/raw-results.json)) | [Component eligible](../CFG-LOCAL-SQLITE/outcome.md) ([raw](../CFG-LOCAL-SQLITE/raw-results.json)) | [None](../CFG-LOCAL-SQLITE/outcome.md) ([raw](../CFG-LOCAL-SQLITE/raw-results.json)) |
| [Local generation-CAS envelope](../CFG-LOCAL-CAS/outcome.md) | [Pass](../CFG-LOCAL-CAS/outcome.md) ([raw](../CFG-LOCAL-CAS/raw-results.json)) | [Pass](../CFG-LOCAL-CAS/outcome.md) ([raw](../CFG-LOCAL-CAS/raw-results.json)) | [Pass](../CFG-LOCAL-CAS/outcome.md) ([raw](../CFG-LOCAL-CAS/raw-results.json)) | [Pass](../CFG-LOCAL-CAS/outcome.md) ([raw](../CFG-LOCAL-CAS/raw-results.json)) | [19/40](../CFG-LOCAL-CAS/outcome.md) ([raw](../CFG-LOCAL-CAS/raw-results.json)) | [Component eligible](../CFG-LOCAL-CAS/outcome.md) ([raw](../CFG-LOCAL-CAS/raw-results.json)) | [None](../CFG-LOCAL-CAS/outcome.md) ([raw](../CFG-LOCAL-CAS/raw-results.json)) |
| [OneDrive generation-CAS envelope](../CFG-ONEDRIVE-LIVE/outcome.md) | [Pass](../CFG-ONEDRIVE-LIVE/outcome.md) ([raw](../CFG-ONEDRIVE-LIVE/raw-results.json)) | [Pass](../CFG-ONEDRIVE-LIVE/outcome.md) ([raw](../CFG-ONEDRIVE-LIVE/raw-results.json)) | [Pass](../CFG-ONEDRIVE-LIVE/outcome.md) ([raw](../CFG-ONEDRIVE-LIVE/raw-results.json)) | [Pass](../CFG-ONEDRIVE-LIVE/outcome.md) ([raw](../CFG-ONEDRIVE-LIVE/raw-results.json)) | [24/40](../CFG-ONEDRIVE-LIVE/outcome.md) ([raw](../CFG-ONEDRIVE-LIVE/raw-results.json)) | [Component eligible](../CFG-ONEDRIVE-LIVE/outcome.md) ([raw](../CFG-ONEDRIVE-LIVE/raw-results.json)) | [None](../CFG-ONEDRIVE-LIVE/outcome.md) ([raw](../CFG-ONEDRIVE-LIVE/raw-results.json)) |
| [ADO generation-CAS envelope](../CFG-ADO-LIVE/outcome.md) | [Pass](../CFG-ADO-LIVE/outcome.md) ([raw](../CFG-ADO-LIVE/raw-results.json)) | [Pass](../CFG-ADO-LIVE/outcome.md) ([raw](../CFG-ADO-LIVE/raw-results.json)) | [Pass](../CFG-ADO-LIVE/outcome.md) ([raw](../CFG-ADO-LIVE/raw-results.json)) | [Pass](../CFG-ADO-LIVE/outcome.md) ([raw](../CFG-ADO-LIVE/raw-results.json)) | [24/40](../CFG-ADO-LIVE/outcome.md) ([raw](../CFG-ADO-LIVE/raw-results.json)) | [Component eligible](../CFG-ADO-LIVE/outcome.md) ([raw](../CFG-ADO-LIVE/raw-results.json)) | [None](../CFG-ADO-LIVE/outcome.md) ([raw](../CFG-ADO-LIVE/raw-results.json)) |
| [GitHub generation-CAS envelope](../CFG-GITHUB-LIVE/outcome.md) | [Pass](../CFG-GITHUB-LIVE/outcome.md) ([raw](../CFG-GITHUB-LIVE/raw-results.json)) | [Pass](../CFG-GITHUB-LIVE/outcome.md) ([raw](../CFG-GITHUB-LIVE/raw-results.json)) | [Pass](../CFG-GITHUB-LIVE/outcome.md) ([raw](../CFG-GITHUB-LIVE/raw-results.json)) | [Pass](../CFG-GITHUB-LIVE/outcome.md) ([raw](../CFG-GITHUB-LIVE/raw-results.json)) | [26/40](../CFG-GITHUB-LIVE/outcome.md) ([raw](../CFG-GITHUB-LIVE/raw-results.json)) | [Component eligible](../CFG-GITHUB-LIVE/outcome.md) ([raw](../CFG-GITHUB-LIVE/raw-results.json)) | [None](../CFG-GITHUB-LIVE/outcome.md) ([raw](../CFG-GITHUB-LIVE/raw-results.json)) |

## Candidate architecture mappings

| Mapping | Components | Absolute status | Recommendation | Conditions |
|---|---|---|---|---|
| Hybrid SQLite + provider-native CAS | CFG-LOCAL-SQLITE + CFG-ONEDRIVE-LIVE + CFG-ADO-LIVE + CFG-GITHUB-LIVE | Eligible | Candidate for ADR selection | None |
| Generation-CAS envelope on every backing path | CFG-LOCAL-CAS + CFG-ONEDRIVE-LIVE + CFG-ADO-LIVE + CFG-GITHUB-LIVE | Eligible | Candidate for ADR selection | None |

## Exact open gates and evidence requirements

| Configuration | Gate | State | Owner | Evidence required | Component report |
|---|---|---|---|---|---|
| — | — | None | — | — | — |

## Evidence ownership

| Evidence | Owner |
|---|---|
| Local correctness, recovery, and performance | S0 implementation owner |
| Provider correctness, collaboration, recovery, and performance | S0 provider test owner |
| Synced-folder compatibility | Windows sync-client test owner |
| macOS and Linux portability | Cross-platform test owner |
| Architecture selection | S0 decision owner |

## Relative measurements

Only configurations inside eligible mappings are candidates for comparison.

| Metric | Local SQLite | Local generation-CAS envelope | OneDrive generation-CAS envelope | ADO generation-CAS envelope | GitHub generation-CAS envelope |
|---|---:|---:|---:|---:|---:|
| Cold initialize p50, small (ms) | 16.891 | 2.890 | — | — | — |
| Cold initialize variability, small (stddev ms) | 1.175 | 0.646 | — | — | — |
| Open by alias p50, small (ms) | 0.099 | 4.669 | — | — | — |
| Mutation p50, small (ms) | 1.103 | 17.134 | — | — | — |
| Mutation p95, small (ms) | 2.017 | 22.198 | — | — | — |
| Mutation variability, small (stddev ms) | 0.375 | 2.342 | — | — | — |
| Backup p50, small (ms) | 0.298 | 2.541 | — | — | — |
| Restore p50, small (ms) | 1.587 | 8.261 | — | — | — |
| Store size p50, small (bytes) | 411816.000 | 3863.000 | — | — | — |
| Write amplification p50, small | 106.578 | 1.005 | — | — | — |
| Remote CAS p50, small (ms) | — | — | 1465.663 | 533.956 | 1046.468 |
| Remote CAS p95, small (ms) | — | — | 1641.563 | 618.869 | 1207.750 |
| Collaborator discovery p50, small (ms) | — | — | 919.082 | 100.197 | 451.888 |
| Provider requests per mutation, small | — | — | 5 | 4 | 5 |
| Provider bytes per mutation, small | — | — | 11546.167 | 9513.167 | 17269.333 |
| Throttle behavior | — | — | typed failure; no success-shaped state | typed failure; no success-shaped state | typed failure; no success-shaped state |
| Common complexity burden (of 40) | 14 | 19 | 24 | 24 | 26 |

### Measurement method

- Timer: `performance.now()` monotonic elapsed time.
- Local cold-start, backup, restore, size, and amplification: one discarded warm-up run plus five measured runs per scale.
- Local operation latency: three warm-up operations; 40 small, 20 medium, and 8 stress repetitions.
- Provider operation latency: three warm-up reads; 6 small, 4 medium, and 2 stress repetitions.
- Statistics: minimum, p50, p95, maximum, mean, standard deviation, with raw samples in each configuration JSON.
- Provider bytes count UTF-8 application payload bytes submitted or consumed; HTTP/TLS header overhead is excluded.
- Network characteristics and provider region are recorded from `S0_NETWORK_DESCRIPTION` and `S0_PROVIDER_REGION` when supplied.

## Decision conditions and evidence

| Condition | Owner | Evidence required |
|---|---|---|
| macOS/APFS local and cache execution | Cross-platform test owner | [Completed workflow evidence](../cross-platform/workflow-run.json) and two macOS reports |
| Linux local and cache execution | Cross-platform test owner | [Completed workflow evidence](../cross-platform/workflow-run.json) and two Linux reports |
| OneDrive synced-folder compatibility (`S0-BCK-006`) | Windows sync-client test owner | [Separate compatibility result](../CFG-ONEDRIVE-SYNC/outcome.md); true second-device sync remains a documented limitation |
| Architecture decision | Kay Unkroth | [Approved ADR](../../ADR-s0-persistence-architecture.md) selecting the hybrid SQLite mapping |

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| S0 implementation owner | | | |
| Provider test owner | | | |
| Cross-platform test owner | | | |
| Independent reviewer | | | |
| ADR approver | Kay Unkroth | 2026-08-31 | Approved |
