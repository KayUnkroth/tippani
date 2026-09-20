# OneDrive generation-CAS envelope test cases

Generated from `src/scenario-catalog.mjs` and `src/applicability.mjs`. Do not duplicate requirement text here; change the authoritative catalog or applicability profile and regenerate.

| ID | Criterion | Scenario | Specification section |
|---|---|---|---|
| `S0-COL-002` | absolute | Two concurrent clients on a shared backing path cannot silently overwrite each other | 5 |
| `S0-COL-003` | absolute | Two clients reconnecting from different generations receive deterministic conflict/reload behavior | 5 |
| `S0-COL-004` | absolute | Remote success with a lost response is reconciled without duplicate generation or false failure | 5 |
| `S0-COL-005` | absolute | Offline work remains pending until authoritative CAS confirmation and reconciles without silent overwrite | 5 |
| `S0-COL-006` | absolute | A second client discovers a committed generation through the backing path change mechanism | 5 |
| `S0-BCK-002` | absolute | OneDrive ETag/version preconditions reject stale updates and support version recovery | 6 |
| `S0-BCK-005` | absolute | Provider outage, throttling, auth expiry, quota, or permission loss never produces success-shaped state | 6 |
| `S0-MIG-004` | absolute | Local-to-OneDrive/ADO/GitHub rehome preserves WorkspaceId and establishes one authority only after receipt | 9 |
| `S0-BKP-003` | absolute | Shared-backing history/export recovers a known generation without rewriting newer valid history | 11 |
| `S0-BKP-004` | absolute | Restored shared workspace establishes one explicit authoritative head | 11 |
| `S0-REC-003` | absolute | Provider outage/auth/throttle/lost-response recovery reconciles authoritative state | 12 |
| `S0-REC-004` | absolute | Local offline cache reconciles against newer authority without silent overwrite | 12 |
| `S0-SEC-001` | absolute | Preflight rejects non-allow-listed, unmarked, default/protected, or production coordinates before provider calls | Safety contract |
| `S0-SEC-002` | absolute | Effective sandbox identity is verified and corporate-account fallback is impossible | Prerequisites |
| `S0-SEC-003` | absolute | Only synthetic data appears in stores, fixtures, logs, backups, screenshots, dumps, and reports | Prerequisites |
| `S0-SEC-004` | absolute | Credentials remain brokered/redacted and absent from workspace state and evidence | Safety contract |
| `S0-SEC-005` | absolute | Cleanup/reaper deletes only run-owned resources recorded in the manifest | Safety contract |
| `S0-SEC-006` | absolute | Provider request/object/time/storage budgets stop unsafe or abusive runs | Safety contract |
| `S0-PER-004` | relative | Provider requests, bytes, throttling, CAS latency, and collaborator discovery are measured comparably | 13 |
| `S0-PER-005` | relative | Operational and implementation complexity is recorded using the same rubric | Decision criteria |
