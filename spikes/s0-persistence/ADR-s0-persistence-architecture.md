# ADR: Draft Workspace persistence architecture

**Status:** Accepted
**Date:** 2026-08-31
**Decision owner:** Kay Unkroth

## Context

S0 evaluated five applicable engine/backing-path configurations behind one
`IWorkspaceStore` contract: local SQLite, local generation-CAS envelope,
OneDrive generation-CAS envelope, Azure DevOps generation-CAS envelope, and
GitHub generation-CAS envelope. The applicability-aware comparison reports no
failed, blocked, incomplete, or unexecuted absolute gate for any component.

The three provider configurations each have three separately retained live
campaigns. The collaboration tests use two independent client processes and do
not depend on multiple provider accounts. The OneDrive synced-folder result is
reported separately from provider-API CAS and is not used as shared-authority
evidence.

## Decision

Adopt the **hybrid SQLite + provider-native generation-CAS mapping**:

- Use SQLite for private local Draft Workspace authority.
- Use provider-native generation-CAS envelopes for shared OneDrive, Azure
  DevOps, and GitHub authority.
- Keep all backing paths behind `IWorkspaceStore`; expose provider-specific
  differences as typed capabilities or policy, never hidden behavior.
- Require optimistic generation checks, typed stale-writer conflicts,
  fail-closed reads, receipt-gated rehome, explicit authoritative-head restore,
  offline pending state, and ownership-checked cleanup.

## Rationale

Both candidate mappings pass every applicable absolute gate. The hybrid mapping
is preferred because its local component has the lower common complexity burden
(14/40 versus 19/40), lower measured mutation/open/backup/restore latency on the
current Windows host, and already supplies transactional multi-record updates,
while provider-native transports preserve the concurrency primitive of each
shared backing path. The local generation-CAS envelope remains a viable fallback
if a later platform result invalidates SQLite for a supported environment.

Performance does not override correctness. Provider latency, request/byte cost,
throttling, discovery, and between-campaign variability are retained as support
evidence rather than absolute disqualifiers.

## Evidence

- [Architecture-mapping handoff](results/comparison/comparison.md)
- [Local SQLite outcome](results/CFG-LOCAL-SQLITE/outcome.md)
- [Local generation-CAS outcome](results/CFG-LOCAL-CAS/outcome.md)
- [OneDrive outcome](results/CFG-ONEDRIVE-LIVE/outcome.md)
- [Azure DevOps outcome](results/CFG-ADO-LIVE/outcome.md)
- [GitHub outcome](results/CFG-GITHUB-LIVE/outcome.md)
- [OneDrive synced-folder compatibility](results/CFG-ONEDRIVE-SYNC/outcome.md)
- [Cross-platform workflow evidence](results/cross-platform/workflow-run.json)
- [macOS/APFS local CAS](results/cross-platform/s0-macos-latest-local-cas/outcome.md)
- [macOS/APFS local SQLite](results/cross-platform/s0-macos-latest-local-sqlite/outcome.md)
- [Linux local CAS](results/cross-platform/s0-ubuntu-latest-local-cas/outcome.md)
- [Linux local SQLite](results/cross-platform/s0-ubuntu-latest-local-sqlite/outcome.md)

Each provider outcome links to raw aggregate evidence; each aggregate lists its
three campaign reports and machine-readable results.

## Conditions and owners

| Condition | Owner | Required evidence | Status |
|---|---|---|---|
| Windows local and provider behavior | S0 implementation owner | Current five-configuration handoff | Complete |
| Provider collaboration and recovery | S0 provider test owner | Three live campaigns per provider | Complete |
| OneDrive sync-folder compatibility | Windows sync-client test owner | Separate compatibility report; no provider-API substitution | Complete with documented single-device limitation |
| macOS/APFS local/cache behavior | Cross-platform test owner | Unchanged harness output from macOS runner | Complete |
| Linux local/cache behavior | Cross-platform test owner | Unchanged harness output with actual filesystem | Complete |
| Architecture approval | Kay Unkroth | Review this decision and evidence | Complete |

The unchanged local harness passed on Windows/NTFS, macOS/APFS, and the Linux
runner's detected ext-family filesystem. The cross-platform workflow metadata
and six raw artifacts are retained with the spike evidence.

## Consequences

- R1 implements one contract with a SQLite local engine and provider-native
  shared transports.
- Local-to-shared rehome crosses engine boundaries and therefore requires the
  tested receipt/authority transition.
- Provider request cost, throttling, consistency, and recovery remain explicit
  operational concerns.
- A future cross-platform failure may replace the local engine without changing
  the shared transports or the workspace contract.

## Sign-off

| Role | Person | Date | Decision / comments |
|---|---|---|---|
| S0 implementation owner | | | |
| Provider test owner | | | |
| Cross-platform test owner | | | Portability evidence complete; sign-off pending |
| Independent reviewer | | | |
| ADR approver | Kay Unkroth | 2026-08-31 | Approved |