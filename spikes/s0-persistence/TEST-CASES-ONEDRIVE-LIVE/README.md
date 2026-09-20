# OneDrive generation-CAS envelope

**Configuration:** `CFG-ONEDRIVE-LIVE`  
**Engine:** Generation-CAS envelope  
**Backing path:** OneDrive

This package contains the test definition index, retained runs, and generated aggregate outcome for this configuration. Requirements remain authoritative in [the spike specification](../2026-08-14-s0-windows-persistence-spike.md).

## In Scope

- Shared workspaces accessed through OneDrive API version and ETag preconditions.
- Multi-client conflicts, offline reconciliation, recovery, history, restore authority, and rehome.
- Provider safety, cleanup, request budgets, and provider performance telemetry.

## Out of Scope

- Cross-user permission behavior and multiple provider identities; concurrency uses one Microsoft identity across multiple concurrent processes.
- Local SQLite or local generation-CAS implementation behavior.
- Windows OneDrive sync-client filesystem behavior, which is evaluated separately.
- Azure DevOps and GitHub provider behavior.

## Evidence

- [Applicable test cases](cases/index.md)
- [Configuration outcome](outcome.md)
- [Architecture comparison](../comparison.md)
- [Architecture decision](../ADR-s0-persistence-architecture.md)

Each execution is retained under `runs/<run-id>/`. Run IDs, rather than ordinal folder names, identify immutable evidence. The current checked-in runs are historical until the comparison validator accepts their source, catalog, applicability, and configuration revisions.
