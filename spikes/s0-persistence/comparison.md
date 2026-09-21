# S0 architecture-mapping handoff

**Generated:** 2026-09-21T16:57:35.124Z
**Host:** win32 x64 node 24.14.0
**Final ADR readiness:** Incomplete
**ADR approval:** Pending; this generated comparison does not record human acceptance.
**Concrete mapping recommendation:** Deferred until a selected mapping passes every applicable absolute gate.

Eligibility is evaluated per engine/backing-path configuration and then rolled up into
candidate mappings. `N/A` requires approver identity, approval date, and a reference.
Stale, identity-mismatched, or incomplete artifacts are rejected as incomplete evidence.

**Local SQLite applicability:** this configuration covers exactly one workspace in one
database, so `S0-CON-003` is `Not applicable`. Multiple independent workspaces writing
one shared SQLite database are out of scope and ineligible because `BEGIN IMMEDIATE`
serializes writes database-wide. This applicability decision requires no waiver.

**Local generation-CAS applicability:** this configuration covers a private local
workspace and same-workspace process conflicts. Linking, synchronizing, replicating,
or merging multiple local workspaces is out of scope. `S0-CON-003` and provider-only
security gates are `Not applicable`; `S0-REC-002` remains applicable.

**Relative metrics are provisional diagnostics only. No ranking or architecture decision is produced.**

## Applicability-aware configuration matrix

| Configuration | Engine | Backing path | Applicable absolute | Pass | Fail | Blocked / incomplete | N/A | Not executed | Not applicable (absolute) | Eligibility | Evidence |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| Local SQLite | SQLite | Local filesystem | 32 | 31 | 0 | 0 | 1 | 0 | 20 | Yes | [report](TEST-CASES-LOCAL-SQLITE/outcome.md) · [raw](TEST-CASES-LOCAL-SQLITE/raw-results.json) |
| Local generation-CAS envelope | Generation-CAS envelope | Local filesystem | 32 | 32 | 0 | 0 | 0 | 0 | 20 | Yes | [report](TEST-CASES-LOCAL-CAS/outcome.md) · [raw](TEST-CASES-LOCAL-CAS/raw-results.json) |
| OneDrive generation-CAS envelope | Generation-CAS envelope | OneDrive | 18 | 16 | 1 | 1 | 0 | 0 | 34 | No | [report](TEST-CASES-ONEDRIVE-LIVE/outcome.md) · [raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json) |
| ADO generation-CAS envelope | Generation-CAS envelope | Azure DevOps repository | 18 | 18 | 0 | 0 | 0 | 0 | 34 | Yes | [report](TEST-CASES-ADO-LIVE/outcome.md) · [raw](TEST-CASES-ADO-LIVE/raw-results.json) |
| GitHub generation-CAS envelope | Generation-CAS envelope | GitHub repository | 18 | 17 | 0 | 1 | 0 | 0 | 34 | Incomplete | [report](TEST-CASES-GITHUB-LIVE/outcome.md) · [raw](TEST-CASES-GITHUB-LIVE/raw-results.json) |

## Configuration evidence matrix

| Configuration | Correctness | Collaboration | Recovery | Performance | Complexity | Recommendation | Conditions |
|---|---|---|---|---|---|---|---|
| [Local SQLite](TEST-CASES-LOCAL-SQLITE/outcome.md) | [Pass](TEST-CASES-LOCAL-SQLITE/outcome.md) ([raw](TEST-CASES-LOCAL-SQLITE/raw-results.json)) | [Pass](TEST-CASES-LOCAL-SQLITE/outcome.md) ([raw](TEST-CASES-LOCAL-SQLITE/raw-results.json)) | [Pass](TEST-CASES-LOCAL-SQLITE/outcome.md) ([raw](TEST-CASES-LOCAL-SQLITE/raw-results.json)) | [Incomplete](TEST-CASES-LOCAL-SQLITE/outcome.md) ([raw](TEST-CASES-LOCAL-SQLITE/raw-results.json)) | [14/40](TEST-CASES-LOCAL-SQLITE/outcome.md) ([raw](TEST-CASES-LOCAL-SQLITE/raw-results.json)) | [Component eligible](TEST-CASES-LOCAL-SQLITE/outcome.md) ([raw](TEST-CASES-LOCAL-SQLITE/raw-results.json)) | [None](TEST-CASES-LOCAL-SQLITE/outcome.md) ([raw](TEST-CASES-LOCAL-SQLITE/raw-results.json)) |
| [Local generation-CAS envelope](TEST-CASES-LOCAL-CAS/outcome.md) | [Pass](TEST-CASES-LOCAL-CAS/outcome.md) ([raw](TEST-CASES-LOCAL-CAS/raw-results.json)) | [Pass](TEST-CASES-LOCAL-CAS/outcome.md) ([raw](TEST-CASES-LOCAL-CAS/raw-results.json)) | [Pass](TEST-CASES-LOCAL-CAS/outcome.md) ([raw](TEST-CASES-LOCAL-CAS/raw-results.json)) | [Incomplete](TEST-CASES-LOCAL-CAS/outcome.md) ([raw](TEST-CASES-LOCAL-CAS/raw-results.json)) | [19/40](TEST-CASES-LOCAL-CAS/outcome.md) ([raw](TEST-CASES-LOCAL-CAS/raw-results.json)) | [Component eligible](TEST-CASES-LOCAL-CAS/outcome.md) ([raw](TEST-CASES-LOCAL-CAS/raw-results.json)) | [None](TEST-CASES-LOCAL-CAS/outcome.md) ([raw](TEST-CASES-LOCAL-CAS/raw-results.json)) |
| [OneDrive generation-CAS envelope](TEST-CASES-ONEDRIVE-LIVE/outcome.md) | [Fail](TEST-CASES-ONEDRIVE-LIVE/outcome.md) ([raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json)) | [Pass](TEST-CASES-ONEDRIVE-LIVE/outcome.md) ([raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json)) | [Incomplete](TEST-CASES-ONEDRIVE-LIVE/outcome.md) ([raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json)) | [Pass](TEST-CASES-ONEDRIVE-LIVE/outcome.md) ([raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json)) | [24/40](TEST-CASES-ONEDRIVE-LIVE/outcome.md) ([raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json)) | [Reject component](TEST-CASES-ONEDRIVE-LIVE/outcome.md) ([raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json)) | [`S0-SEC-005`, `S0-BKP-004`](TEST-CASES-ONEDRIVE-LIVE/outcome.md) ([raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json)) |
| [ADO generation-CAS envelope](TEST-CASES-ADO-LIVE/outcome.md) | [Pass](TEST-CASES-ADO-LIVE/outcome.md) ([raw](TEST-CASES-ADO-LIVE/raw-results.json)) | [Pass](TEST-CASES-ADO-LIVE/outcome.md) ([raw](TEST-CASES-ADO-LIVE/raw-results.json)) | [Pass](TEST-CASES-ADO-LIVE/outcome.md) ([raw](TEST-CASES-ADO-LIVE/raw-results.json)) | [Pass](TEST-CASES-ADO-LIVE/outcome.md) ([raw](TEST-CASES-ADO-LIVE/raw-results.json)) | [24/40](TEST-CASES-ADO-LIVE/outcome.md) ([raw](TEST-CASES-ADO-LIVE/raw-results.json)) | [Component eligible](TEST-CASES-ADO-LIVE/outcome.md) ([raw](TEST-CASES-ADO-LIVE/raw-results.json)) | [None](TEST-CASES-ADO-LIVE/outcome.md) ([raw](TEST-CASES-ADO-LIVE/raw-results.json)) |
| [GitHub generation-CAS envelope](TEST-CASES-GITHUB-LIVE/outcome.md) | [Pass](TEST-CASES-GITHUB-LIVE/outcome.md) ([raw](TEST-CASES-GITHUB-LIVE/raw-results.json)) | [Pass](TEST-CASES-GITHUB-LIVE/outcome.md) ([raw](TEST-CASES-GITHUB-LIVE/raw-results.json)) | [Incomplete](TEST-CASES-GITHUB-LIVE/outcome.md) ([raw](TEST-CASES-GITHUB-LIVE/raw-results.json)) | [Pass](TEST-CASES-GITHUB-LIVE/outcome.md) ([raw](TEST-CASES-GITHUB-LIVE/raw-results.json)) | [26/40](TEST-CASES-GITHUB-LIVE/outcome.md) ([raw](TEST-CASES-GITHUB-LIVE/raw-results.json)) | [Incomplete](TEST-CASES-GITHUB-LIVE/outcome.md) ([raw](TEST-CASES-GITHUB-LIVE/raw-results.json)) | [`S0-BKP-004`](TEST-CASES-GITHUB-LIVE/outcome.md) ([raw](TEST-CASES-GITHUB-LIVE/raw-results.json)) |

## Candidate architecture mappings

| Mapping | Components | Absolute status | Recommendation | Conditions |
|---|---|---|---|---|
| Hybrid SQLite + provider-native CAS | CFG-LOCAL-SQLITE + CFG-ONEDRIVE-LIVE + CFG-ADO-LIVE + CFG-GITHUB-LIVE | Rejected | Do not select | Close applicable gates for OneDrive generation-CAS envelope, GitHub generation-CAS envelope |
| Generation-CAS envelope on every backing path | CFG-LOCAL-CAS + CFG-ONEDRIVE-LIVE + CFG-ADO-LIVE + CFG-GITHUB-LIVE | Rejected | Do not select | Close applicable gates for OneDrive generation-CAS envelope, GitHub generation-CAS envelope |

## GitHub restore limitation

GitHub passed normal generation commits, stale-writer rejection, object/ref
preconditions, auditable history, known-generation recovery, offline
reconciliation, and provider-failure recovery. The remaining GitHub gap is
`S0-BKP-004`, not `S0-BCK-004`.

The current GitHub adapter writes through the Contents API, where each file
write creates an independent commit. Restoring a backup containing multiple
workspace files with that transport would expose intermediate mixtures of
restored and pre-restore state. The adapter therefore fails closed rather than
reporting a partial restore as success.

Closing `S0-BKP-004` requires a commit-level restore transaction:

1. Retain the expected authoritative branch-head SHA.
2. Create all required blobs and one complete tree, including deletions.
3. Create one restore commit.
4. Advance the branch only if its head still equals the expected SHA.
5. Reject and reconcile if another writer moved the head.

GitHub GraphQL `createCommitOnBranch` with `expectedHeadOid` is a candidate
transport, subject to validating its file-count and payload limits against the
maximum supported Tippani workspace. Until such a path is implemented and
tested, GitHub cannot establish one atomic authoritative restore head.

## OneDrive cleanup and restore limitations

OneDrive passed ETag stale-writer rejection, item version-history recovery,
multi-client conflict handling, offline reconciliation, provider outage and
lost-response recovery, synthetic-data and credential controls, request
budgets, performance measurement, and the separate signed two-client
synced-folder gate. Its rejection is caused by two specific absolute gates.

### `S0-SEC-005`: conditionally safe cleanup

The OneDrive cleanup path enumerates every run-owned child, records each item
ID and ETag in the cleanup manifest, deletes each child with its recorded ETag,
and lists the folder again to verify that it is empty. Microsoft Graph does not
provide a condition meaning "delete this folder only if it is still empty and
no child has appeared since the last check."

Graph folder deletion is recursive. A child created after the final empty check
but before the folder delete could therefore be removed even though it was not
recorded in the cleanup manifest. The adapter fails closed with
`cleanup_precondition_unavailable` rather than risk deleting an unrecorded
concurrent child. This behavior is safe, but it does not satisfy the gate that
the automated reaper completely deletes the run-owned namespace.

The final campaign teardown does not convert this result to a pass. That
cleanup occurred only after execution stopped, the exact campaign root was
inventoried, and ownership of every remaining item was confirmed. It does not
prove that the normal reaper can delete a live namespace safely under
concurrent writes.

Closing this gate requires a namespace lifecycle that prevents new writes
before final deletion, or a cleanup contract that treats an empty, permanently
retired tombstone folder as the completed safe state instead of requiring
recursive folder deletion.

### `S0-BKP-004`: atomic authoritative restore

Each workspace is a separate OneDrive item. Restoring a multi-workspace
snapshot with individual Graph writes would expose intermediate mixtures of
restored and pre-restore state. Graph does not provide a transaction that
atomically replaces all items in a folder, so the adapter fails closed rather
than report a partial restore as successful.

A candidate design is to upload and validate the complete snapshot under a new
immutable generation directory, then switch one small authoritative `HEAD`
item to that generation using an ETag `If-Match` update. Readers would resolve
the active generation only through `HEAD`; a concurrent head change would
reject the restore and require reconciliation. Until that design is
implemented and tested, OneDrive cannot establish one atomic authoritative
restore head.

## Exact open gates and evidence requirements

| Configuration | Gate | State | Owner | Evidence required | Component report |
|---|---|---|---|---|---|
| OneDrive generation-CAS envelope | `S0-SEC-005` | Fail | S0 implementation owner | Execute: Cleanup/reaper deletes only run-owned resources recorded in the manifest. Blocker/result: OneDrive cannot condition recursive folder deletion on the folder remaining empty. | [report](TEST-CASES-ONEDRIVE-LIVE/outcome.md) · [raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json) |
| OneDrive generation-CAS envelope | `S0-BKP-004` | Incomplete | S0 provider test owner | Execute: Restored shared workspace establishes one explicit authoritative head. Blocker/result: onedrive restore cannot establish one atomic authoritative head with the current spike transport. | [report](TEST-CASES-ONEDRIVE-LIVE/outcome.md) · [raw](TEST-CASES-ONEDRIVE-LIVE/raw-results.json) |
| GitHub generation-CAS envelope | `S0-BKP-004` | Incomplete | S0 provider test owner | Execute: Restored shared workspace establishes one explicit authoritative head. Blocker/result: github restore cannot establish one atomic authoritative head with the current spike transport. | [report](TEST-CASES-GITHUB-LIVE/outcome.md) · [raw](TEST-CASES-GITHUB-LIVE/raw-results.json) |

## Relative measurements

These values are provisional and are not used for architecture selection.

| Metric | Local SQLite | Local generation-CAS envelope | OneDrive generation-CAS envelope | ADO generation-CAS envelope | GitHub generation-CAS envelope |
|---|---:|---:|---:|---:|---:|
| Open by alias p50, small (ms) | 0.089 | 14.701 | — | — | — |
| Mutation p50, small (ms) | 0.810 | 16.828 | — | — | — |
| Remote CAS p50, small (ms) | — | — | 1560.947 | 579.535 | 1131.664 |
| Collaborator discovery p50, small (ms) | — | — | 867.295 | 82.287 | 438.954 |
| Provider requests per mutation, small | — | — | 5 | 5 | 5 |
| Common complexity burden (of 40) | 14 | 19 | 24 | 24 | 26 |

## Decision conditions and evidence

| Condition | Owner | Evidence required |
|---|---|---|
| Current local evidence | S0 implementation owner | Regenerate Local CAS and Local SQLite against their dedicated applicability profiles. For both, exclude `S0-CON-003` and provider-only security gates through applicability metadata. |
| Current provider evidence | S0 provider test owner | Three complete live runs per provider with approved target hash, persistent offline queue, full fault coverage, authorized conditional cleanup, and enforced budgets. |
| Performance evidence | Performance investigator | Fresh-process populated-store startup/enumeration, memory, and storage-layer write-amplification measurements. |
| Architecture decision | Independent reviewer / ADR approver | Select an eligible mapping, review conditions, and record dated approval separately from generated evidence. |

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| S0 implementation owner | | | |
| Provider test owner | | | |
| Cross-platform test owner | | | |
| Independent reviewer | | | |
| ADR approver | | | Pending |
