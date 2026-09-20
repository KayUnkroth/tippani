# Local generation-CAS envelope test cases

Generated from `src/scenario-catalog.mjs` and `src/applicability.mjs`. Do not duplicate requirement text here; change the authoritative catalog or applicability profile and regenerate.

| ID | Criterion | Scenario | Specification section |
|---|---|---|---|
| `S0-ATM-001` | absolute | A multi-field workspace mutation commits completely or not at all | 1 |
| `S0-ATM-002` | absolute | Branch-to-PR alias transition preserves one workspace and commits alias/index/state atomically | 1 |
| `S0-ATM-003` | absolute | Failed mutation exposes no empty-body intent, mixed generation, or dangling alias | 1 |
| `S0-CON-001` | absolute | Portal/user and Copilot/MCP writers from generation g produce one winner and one typed stale conflict | 2 |
| `S0-CON-002` | absolute | Multiple headless/automation clients cannot overwrite a newer generation | 2 |
| `S0-CON-004` | absolute | Concurrent staging during publication preserves the newer intent revision | 2 |
| `S0-CON-005` | absolute | Lock/CAS contention is bounded, observable, and retryable | 2 |
| `S0-JRN-001` | absolute | Frozen intent tuples and planned journal become durable atomically before any provider operation | 3 |
| `S0-JRN-002` | absolute | No journal references a missing workspace, generation, or intent revision | 3 |
| `S0-CRS-001` | absolute | Kill before/during/after commit recovers only the complete previous or committed generation | 4 |
| `S0-CRS-002` | absolute | Kill during alias/index update never exposes a partially updated index | 4 |
| `S0-CRS-003` | absolute | Kill during backup or migration leaves an unambiguous recoverable state | 4 |
| `S0-COL-001` | absolute | Independent local actors observe one stable workspace/generation and equal concurrency rules | 5 |
| `S0-BCK-001` | absolute | Local flush and atomic replace preserve file and index durability under supported filesystems | 6 |
| `S0-COR-001` | absolute | Truncated, invalid, checksum-failing, or damaged primary state is detected and preserved/quarantined | 7 |
| `S0-COR-002` | absolute | Missing/dangling aliases and duplicate identities fail closed | 7 |
| `S0-COR-003` | absolute | Unsupported schema/provider-operation version fails closed with a typed state | 7 |
| `S0-COR-004` | absolute | Permission-denied or unreadable existing state is never treated as an absent/new store | 7 |
| `S0-HYD-001` | absolute | Startup enumerates and validates all workspaces/aliases before APIs open | 8 |
| `S0-HYD-002` | absolute | Rehydration restores exact generation, intent order, private state, journal state, and last selection | 8 |
| `S0-HYD-003` | absolute | Incomplete/indeterminate journals are surfaced for reconciliation before mutation is accepted | 8 |
| `S0-MIG-001` | absolute | Forward migration is transactional or resumable, idempotent, and preserves originals/audit | 9 |
| `S0-MIG-002` | absolute | Interrupted migration resumes or rolls back without ambiguity | 9 |
| `S0-MIG-003` | absolute | Unsupported source version and downgrade policy are explicit and fail closed | 9 |
| `S0-IMP-001` | absolute | Complete checksummed legacy envelope validates before atomic import | 10 |
| `S0-IMP-002` | absolute | Failed/corrupt/duplicate legacy import preserves source and creates no partial destination | 10 |
| `S0-BKP-001` | absolute | Active-store backup is internally consistent at one logical generation | 11 |
| `S0-BKP-002` | absolute | Restore reproduces exact workspace/journal state and rejects incomplete/corrupt backup | 11 |
| `S0-REC-001` | absolute | Clean and forced shutdown restart recover exact durable state | 12 |
| `S0-REC-002` | absolute | Stale lock recovery removes only provably owned stale state | 12 |
| `S0-REC-005` | absolute | Diagnostics identify recovery state without exposing content or credentials | 12 |
| `S0-SEC-003` | absolute | Only synthetic data appears in stores, fixtures, logs, backups, screenshots, dumps, and reports | Prerequisites |
| `S0-PER-001` | relative | Cold startup and enumeration are measured at small, medium, and stress scale | 13 |
| `S0-PER-002` | relative | Alias-open, mutation, conflict, and journal p50/p95 are measured comparably | 13 |
| `S0-PER-003` | relative | Backup/restore time, store size, memory, and write amplification are measured comparably | 13 |
| `S0-PER-005` | relative | Operational and implementation complexity is recorded using the same rubric | Decision criteria |
