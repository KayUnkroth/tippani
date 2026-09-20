# Local SQLite

**Configuration:** `CFG-LOCAL-SQLITE`  
**Engine:** SQLite  
**Backing path:** Local filesystem

This package contains the test definition index, retained runs, and generated aggregate outcome for this configuration. Requirements remain authoritative in [the spike specification](../2026-08-14-s0-windows-persistence-spike.md).

## In Scope

- Basic, non-collaborative operation with exactly one workspace in one SQLite database.
- Multiple local processes accessing that workspace with transactional conflict handling.
- Local durability, recovery, migration, backup, portability, and performance.

## Out of Scope

- Multiple independent workspaces writing one shared SQLite database; that topology is ineligible because writes serialize database-wide.
- Shared-provider collaboration and provider-specific identity, throttling, or cleanup behavior.
- The `S0-SEC-005` ownership-manifest cleanup gate: provider runs need it to protect unrelated remote resources, while this local run deletes only its newly created isolated temporary directory.
- Any claim that this configuration proves concurrent progress across workspaces.

## Evidence

- [Applicable test cases](cases/index.md)
- [Configuration outcome](outcome.md)
- [Architecture comparison](../comparison.md)
- [Architecture decision](../ADR-s0-persistence-architecture.md)

Each execution is retained under `runs/<run-id>/`. Run IDs, rather than ordinal folder names, identify immutable evidence. The current checked-in runs are historical until the comparison validator accepts their source, catalog, applicability, and configuration revisions.
