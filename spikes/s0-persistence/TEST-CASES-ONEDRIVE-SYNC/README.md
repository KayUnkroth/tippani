# OneDrive synced-folder compatibility

**Configuration:** `CFG-ONEDRIVE-SYNC`  
**Engine:** Generation-CAS envelope  
**Backing path:** Windows OneDrive sync client

This package contains the test definition index, retained runs, and generated aggregate outcome for this configuration. Requirements remain authoritative in [the spike specification](../2026-08-14-s0-windows-persistence-spike.md).

## In Scope

- Compatibility of a generation-CAS envelope inside a Windows OneDrive synced folder.
- Cross-client conflict artifacts, ordering, recovery, and user-visible behavior.
- Signed evidence from independent sync clients bound to the approved sync target.

## Out of Scope

- OneDrive API version or ETag concurrency behavior.
- Proof of provider-API multi-writer safety or architecture-mapping eligibility.
- Local-only, Azure DevOps, and GitHub behavior.

## Evidence

- [Applicable test cases](cases/index.md)
- [Configuration outcome](outcome.md)
- [Architecture comparison](../comparison.md)
- [Architecture decision](../ADR-s0-persistence-architecture.md)

Each execution is retained under `runs/<run-id>/`. Run IDs, rather than ordinal folder names, identify immutable evidence. The current checked-in runs are historical until the comparison validator accepts their source, catalog, applicability, and configuration revisions.
