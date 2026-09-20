# Local generation-CAS envelope

**Configuration:** `CFG-LOCAL-CAS`  
**Engine:** Generation-CAS envelope  
**Backing path:** Local filesystem

This package contains the test definition index, retained runs, and generated aggregate outcome for this configuration. Requirements remain authoritative in [the spike specification](../2026-08-14-s0-windows-persistence-spike.md).

## In Scope

- A private local workspace stored as a generation-CAS envelope with per-workspace locking.
- Multiple local processes accessing that workspace with typed stale-writer conflicts.
- Local durability, recovery, migration, backup, portability, and performance.

## Out of Scope

- Linking, synchronizing, replicating, or merging multiple local workspaces in any way.
- Shared-provider collaboration and provider-native concurrency behavior.
- Provider identity, authorization, throttling, and remote-resource cleanup.
- OneDrive sync-client compatibility.

## Evidence

- [Applicable test cases](cases/index.md)
- [Configuration outcome](outcome.md)
- [Architecture comparison](../comparison.md)
- [Architecture decision](../ADR-s0-persistence-architecture.md)

Each execution is retained under `runs/<run-id>/`. Run IDs, rather than ordinal folder names, identify immutable evidence. The current checked-in runs are historical until the comparison validator accepts their source, catalog, applicability, and configuration revisions.
