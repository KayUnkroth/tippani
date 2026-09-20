# S0 Persistence Spike Revision Plan

**Status:** Harness merge-ready; corrected evidence and ADR decision pending
**Purpose:** Record the hardened S0 harness delivered by PR #91 and the evidence work that remains before any persistence decision.

## Current state

PR #91 delivers only the repaired, provider-neutral S0 evaluation harness. It
does not integrate persistence into the production runtime or select a local,
provider, hybrid, or all-envelope mapping.

The review fixes are implemented in source and deterministic tests. The
[architecture-mapping handoff](comparison.md) now rejects the
retained local and provider artifacts because they predate the corrected result
schema, source/catalog/applicability/config identity, structured `N/A`,
provider-safety, queue, teardown, fault, and performance semantics.

No mapping is currently eligible or selected. The persistence ADR is reopened.
Local, provider, performance, and cross-platform runs must be regenerated
before the plan can return to completed status.

## Problem

Before this revision, the comparison evaluated adapters as if every catalog gate applied independently to every adapter. Local candidates were therefore penalized for provider-only gates, while provider transports were penalized for local-engine gates. This prevented any configuration from becoming eligible even though S0 explicitly permits an architecture mapping composed of one local engine and provider-native CAS transports behind `IWorkspaceStore`.

The prior comparison also omitted live outcomes, presented single-run local measurements before an eligible mapping existed, and lacked the recommendation, conditions, owners, evidence links, and sign-off required for an ADR input.

## Follow-up outcome

After this harness merges, separate evidence work must produce:

1. An applicability model for every scenario and each of the five engine/backing-path configurations.
2. Five regenerated configuration outcomes using distinct evidence states.
3. Two candidate architecture mapping rollups.
4. Repeated, comparable local and provider performance evidence.
5. Complete multi-user evidence for every provider backing path.
6. A condition-and-owner table for every remaining blocked gate.
7. A decision handoff with a recommendation, evidence links, and sign-off.

## Branch isolation and evidence safety

The S0 branch and every committed artifact must contain only Tippani-specific, synthetic evidence. Secrets and non-Tippani details must not leak into the branch, commit metadata, reports, fixtures, screenshots, logs, or raw results.

The branch must not contain:

- Tokens, credentials, cookies, authorization headers, recovery data, private keys, connection strings, or environment-variable values.
- Real account names, email addresses, tenant details, organization/project/repository/drive identifiers, provider resource names, ownership coordinates, or private URLs.
- Actual documents, comments, metadata, screenshots, logs, or production-derived fixtures.
- Absolute local paths, machine names, shell history, unrelated repository details, or details about the client, host, role, panel, pipe, or other mechanism used to run Tippani.
- Unredacted request or response bodies, headers, query strings, provider error payloads, or diagnostic dumps.

Credentials remain runtime-supplied and brokered. Committed evidence uses synthetic labels, opaque run IDs, and redacted coordinates. Provider instrumentation may retain aggregate counts, byte sizes, status classes, retry counts, and timings, but not sensitive request content.

Before every push, scan the complete staged diff, generated artifacts, and commit message for credential patterns, real coordinates, absolute paths, and non-Tippani terms. A detected leak invalidates the artifact. Quarantine it, clean any run-owned provider resources through the ownership manifest, correct the generator, and rerun. Redacting an artifact only after it has been committed does not make that artifact valid evidence.

## Required configurations

The decision surface contains exactly these five authoritative engine/backing-path configurations:

| Configuration | Engine / transport | Authority |
|---|---|---|
| Local SQLite | SQLite transaction engine | Private local workspace |
| Local envelope | Generation-CAS envelope with atomic local replace | Private local workspace |
| OneDrive envelope | Generation-CAS envelope using item version/ETag preconditions | Shared OneDrive workspace |
| ADO envelope | Generation-CAS envelope using object/ref preconditions | Shared Azure DevOps repository |
| GitHub envelope | Generation-CAS envelope using blob/ref preconditions | Shared GitHub repository |

Reference-memory and provider dry-run configurations remain harness-validation evidence. They do not appear as decision candidates.

## Applicability model

Add explicit applicability metadata to the machine-readable scenario catalog. Applicability must be declared, not inferred from which scenario IDs a configuration happened to execute.

The model must distinguish:

- Common `IWorkspaceStore` behavior required of every selected implementation.
- Local-engine behavior required only of local SQLite and local envelope.
- Shared-provider behavior required of OneDrive, ADO, and GitHub.
- Provider-specific behavior required only of the named provider.
- OneDrive synced-folder compatibility, which is separate from OneDrive API CAS.
- Platform-relative and performance-relative evidence.

Each configuration report must distinguish these states:

| State | Meaning | Eligibility effect |
|---|---|---|
| Pass | The applicable scenario executed and satisfied its invariant. | Satisfies the gate. |
| Fail | The applicable scenario executed and violated its invariant. | Rejects the configuration. |
| Blocked | The scenario applies, but an external prerequisite prevents execution. | Blocks eligibility. |
| N/A | The invariant is satisfied through an independently reviewed equivalent mechanism, so the specific scenario form does not apply. | Does not block eligibility. |
| Not applicable | The scenario belongs to a different engine, backing path, provider, or compatibility surface. | Excluded from eligibility. |
| Not executed | The scenario applies, but no result exists. | Blocks eligibility. |

`N/A` requires a recorded rationale and independent-review approval. `Not applicable` follows catalog metadata and must not require a waiver.

### Local SQLite applicability decision

Approved on 2026-09-20 by the S0 decision owner as part of the canonical Local
SQLite plan: `S0-REC-002` is `N/A` because SQLite owns locking internally and
recovers interrupted writers through its transaction journal and WAL on open;
the external stale-lock-file scenario form does not apply. This section is the
stable approval reference consumed by Local SQLite run evidence and does not
require a second approval decision.

### Local generation-CAS applicability decision

The Local generation-CAS configuration covers a private local workspace,
including multiple local processes and typed stale-writer conflicts within that
workspace. Linking, synchronizing, replicating, or merging multiple local
workspaces is out of scope. `S0-CON-003` and provider-only security gates are
therefore `Not applicable`; `S0-REC-002` remains applicable because this engine
directly owns and recovers its local lock files.

### GitHub configuration and cleanup boundary

The GitHub configuration uses one GitHub identity across multiple concurrent
processes. Cross-user permission behavior and multiple GitHub identities are
out of scope. Every run owns one disposable `tippani-s0/<runId>` branch; the
default, protected, and non-disposable branches remain excluded.

Cleanup records the branch tip SHA in the authorized manifest, verifies the
run ownership marker, and deletes the ref with native Git using
`--force-with-lease=<ref>:<expected-sha>`. Credentials are supplied through an
isolated askpass environment and never placed in command arguments or retained
output. A moved ref produces `cleanup_conflict` and remains authorized for
reconciliation. Cleanup is marked complete only after the GitHub API confirms
that the ref is absent.

## Eligibility and architecture mappings

Evaluate eligibility in two stages.

### Configuration eligibility

A configuration is eligible only when every applicable absolute gate is `Pass` or approved `N/A`. Any `Fail`, `Blocked`, or `Not executed` applicable absolute gate prevents eligibility. `Not applicable` gates are excluded.

### Mapping eligibility

Roll configuration evidence into these candidate mappings:

| Mapping | Constituent configurations |
|---|---|
| Hybrid SQLite | Local SQLite + OneDrive envelope + ADO envelope + GitHub envelope |
| Envelope throughout | Local envelope + OneDrive envelope + ADO envelope + GitHub envelope |

A mapping is eligible only when every constituent configuration is eligible. Shared provider results may be referenced by both mappings, but must not be copied or counted as local-engine evidence.

The report must not recommend a mapping while no mapping is eligible. Once eligibility exists, relative criteria may select among eligible mappings. If only one mapping is eligible, the recommendation follows the absolute gates rather than provisional performance differences.

## Superseded evidence

The following pre-revision results are historical inputs only. No current
decision may use these counts; all affected configurations require newly
generated applicability-aware runs.

Historical reports claimed the following counts, but none is a current pass or
decision input:

- Local envelope: 38 reported absolute passes in the superseded Windows run. Its historical `S0-CON-003` and provider-only security results are not current evidence because those gates are now `Not applicable` to this configuration.
- Local SQLite: 37 reported absolute passes plus an unstructured `N/A` for the external stale-lock-file form of `S0-REC-002`. The historical `S0-CON-003` pass is not current evidence: Local SQLite is evaluated only as exactly one workspace in one database, making independent-workspace concurrency `Not applicable`. Multiple independent workspaces writing one shared SQLite database are out of scope and ineligible because `BEGIN IMMEDIATE` serializes writes database-wide. No waiver applies to that excluded topology.
- OneDrive: nine provider gates passed.
- Azure DevOps: nine provider gates passed.
- GitHub: nine provider gates passed.

For each provider, the nine live results comprise its provider-specific backing gate (`S0-BCK-002`, `S0-BCK-003`, or `S0-BCK-004`) plus `S0-BCK-005`, `S0-COL-004`, `S0-COL-005`, `S0-REC-003`, `S0-REC-004`, `S0-MIG-004`, `S0-BKP-003`, and `S0-BKP-004`.

The regenerated reports must verify compatible catalog and harness revisions before combining evidence. A stale or incompatible outcome is `Not executed` for the current comparison until regenerated.

## Entire surface requirements

### Common workspace contract

Every selected configuration must:

- Implement the same `IWorkspaceStore` operation model.
- Preserve stable workspace identity, aliases, generation, documents, intents, private state, journals, and audit metadata.
- Apply expected-generation or provider-native CAS to every mutation.
- Return typed stale-writer conflicts with enough information to reload or reconcile.
- Fail closed for corrupt, unreadable, unsupported, inconsistent, or permission-denied state.
- Expose intentional differences as typed capabilities or policies rather than hidden adapter behavior.
- Keep credentials out of workspace state and retained evidence.

### Atomicity, concurrency, and journals

The applicable configurations must prove:

- Multi-field workspace mutation commits completely or not at all.
- Alias transitions, indexes, state, intent revisions, and journal records cannot become partially visible.
- Concurrent staging preserves newer intent revisions.
- Publication intent tuples and planned journals become durable before provider publication begins.
- No journal references a missing workspace, generation, or intent revision.

### Crash, corruption, migration, and recovery

The applicable configurations must prove:

- Kill points recover only the complete previous or complete committed generation.
- Alias/index updates, backups, restores, and migrations do not expose torn state.
- Damaged, truncated, checksum-failing, duplicate, unreadable, or unsupported state is preserved or quarantined and fails closed.
- Startup validates all workspace and alias state before mutation APIs open.
- Forward migration is transactional or resumable, idempotent, and auditable.
- Interrupted migration resumes or rolls back unambiguously.
- Legacy import validates before commit and leaves no partial destination on failure.
- Backup and restore reproduce one internally consistent known generation.
- Recovery diagnostics identify affected state without exposing document content or credentials.

### Local-engine requirements

Both local engines must be exercised with independent OS processes and prove:

- One winner and typed stale conflicts for competing expected-generation writes.
- Durable restart and exact rehydration in a separate process.
- Supported-filesystem atomicity and durability behavior.
- Permission, path, temporary-unavailability, quota, and contention behavior.
- Lock or journal recovery according to the engine's actual ownership model.
- No unreviewed provider-only gate is used to disqualify a local engine.

Historical Windows/NTFS, macOS/APFS, and Linux artifacts exist for both local
candidates, but the shared contract and harness revisions changed. They require
rerun and are not current eligibility evidence.

### Provider requirements

OneDrive, ADO, and GitHub must each prove, independently:

- Provider-native preconditions reject stale updates and preserve one auditable generation.
- A provider outage, throttle, authentication expiry, quota failure, or permission loss never creates success-shaped state.
- A remotely committed write with a lost response is reconciled without duplicate generation or false failure.
- Offline work remains pending until authoritative CAS confirmation.
- Reconnect discovers newer authority before another write is accepted.
- History/export recovers a known generation without overwriting newer valid history.
- Restore establishes one explicit authoritative head.
- Local-to-provider rehome preserves `WorkspaceId` and switches authority only after a durable receipt.
- Branch, namespace, ownership, cleanup, request, object, time, and byte budgets remain enforced.

### Shared Azure provider campaign environment

Provisioning and configuration of the provider test clients are part of the
evidence plan. One approved campaign provisions two independently isolated
Azure Windows VMs before any live provider run. The same VM pair may then run
the OneDrive API, Azure DevOps, GitHub, and OneDrive synced-folder evaluations
sequentially for efficiency, but every provider retains its own approval,
namespace, operation budget, cleanup manifest, and evidence package.

Each VM must have its own Windows installation, filesystem, client process
state, and OneDrive sync database. The VMs must not share a VHD or host-mounted
OneDrive directory. Separate physical machines are not required; availability
zones or fault domains should be used when the selected region supports them,
and shared-host limitations must be recorded. A sanitized, immutable deployment
receipt binds the VM image, region class, VM size, bootstrap revision, opaque VM
identities, network policy, creation time, expiry, and run ownership marker.
Every provider result references that receipt.

The Azure infrastructure identity and provider storage identities are separate.
The infrastructure identity may only provision and remove the approved campaign
resources. Provider credentials remain runtime-supplied and are never placed in
deployment parameters, VM extensions, command arguments, logs, or retained
evidence. The VMs use ordinary Azure networking and public provider endpoints;
joining a corporate network is out of scope. Optional Entra join or Intune
enrollment is permitted only through a separately approved tenant process when
Conditional Access requires it.

Provisioning must fail closed without an approved subscription, region, image,
SKU, network policy, cost ceiling, expiry, and target hash. The campaign first
deploys and validates one VM, then creates the second only after provider login
and client compatibility succeed. After all provider runs, provider-owned
resources are cleaned before the VM resource group is deleted. Final evidence
must confirm that no run-owned provider or Azure resources remain.

### Concurrent-client testing

Run the concurrent-client suite separately on OneDrive, ADO, and GitHub from the
two campaign VMs. Passing one provider does not satisfy another provider's
collaboration gates. Each provider uses one provider identity across the two
clients; cross-user permission behavior and multiple provider identities are out
of scope.

Each provider run must:

- Use one independent client process on each VM. Both authenticate with the same
  externally supplied sandbox account for that provider.
- Use independent process state and logical client actors. Reconnect coverage
	starts the clients from distinct observed generations.
- Have both clients open the same `WorkspaceId` at the same authoritative generation.
- Release simultaneous writes from a common barrier and observe exactly one committed next generation and one typed stale conflict.
- Verify that the stale client reloads or reconciles without silent overwrite.
- Create divergent offline work, advance authority from the other client, reconnect, and observe deterministic pending/conflict behavior.
- Verify `S0-COL-002`, `S0-COL-003`, and `S0-COL-006` with raw per-client and authoritative final-state evidence.
- Measure acknowledgement-to-discovery latency when the second collaborator observes the committed generation through the provider's change mechanism.
- Exercise delayed notification and lost-response behavior without duplicating a generation or fabricating success or failure.
- Exercise permission removal or loss and prove inaccessible state is not treated as absent.
- Preserve only synthetic actor labels and opaque identity IDs in retained evidence.
- Clean all run-owned resources and verify that no branches, items, folders, or refs remain outside the cleanup manifest.

### OneDrive synced-folder compatibility

Test a locally synced OneDrive folder separately from the OneDrive API-CAS
configuration. OneDrive Personal, including an approved personal Microsoft
account, is sufficient; OneDrive for Business is not required. The Azure
subscription identity may differ from the OneDrive identity. The Graph
application used for API testing must accept personal Microsoft accounts and
must receive delegated `Files.ReadWrite` consent from the approved identity.

Both VMs sign in to the OneDrive desktop client with the same approved Microsoft
identity and sync the same synthetic run-owned folder. Establish one baseline
generation and content hash on both clients, disconnect or pause both clients,
write distinct next-generation payloads, reconnect them in a recorded order,
and wait for both clients to settle. Record ordered operations, UTC and monotonic
timestamps, opaque client and VM IDs, OneDrive versions and states, generation
and content hashes, conflict artifacts, final files, recovery actions, and
convergence. A pass requires both observed conflict handling and successful
recovery; a same-device probe, arbitrary operation strings, or an unsigned
self-report cannot close the gate.

Each VM signs its client receipt and the trusted campaign coordinator signs the
combined artifact. The artifact binds both receipts, the deployment receipt,
sync target, config revision, approval, operation sequence, hashes, conflict
artifacts, final state, and cleanup result. Delete the run-owned synced folder
from one client and verify absence from both before campaign teardown.
`S0-BCK-006` remains compatibility evidence and must not be used as proof of
provider-API multi-writer safety.

### Azure DevOps configuration boundary

The Azure DevOps configuration uses one Azure DevOps identity across multiple
concurrent client processes and one approved disposable repository target. Each
run writes only to its owned disposable branch and uses Git object/ref
preconditions for authoritative CAS. Cross-user permission behavior, multiple
provider identities, and writes to default, protected, production, or
non-disposable branches are out of scope.

### Security and operational safety

Every local and provider run must prove:

- Synthetic-only inputs and outputs.
- No embedded or retained credentials.
- No corporate or unintended identity fallback.
- Approved, non-production provider coordinates.
- Ownership-checked cleanup.
- Enforced operation, request, object, time, and storage budgets.
- Sanitized diagnostics and reports.

## Performance and operability investigation

Relative measurements may not currently select an architecture because no
mapping is eligible. `PER-001` and `PER-003` are explicitly incomplete until
fresh-process populated-store startup/enumeration, memory, and storage-layer
bytes-written measurements exist.

Use one common documented method across every applicable configuration:

- Cold startup, backup/restore, footprint, and write amplification: one
	discarded complete warm-up plus five measured runs per scale.
- Local operation latency: three discarded warm-ups followed by 40 small, 20
	medium, and 8 stress samples.
- Provider operation latency: three discarded warm-up reads followed by 6
	small, 4 medium, and 2 stress samples, repeated in at least three complete runs
	per provider.
- Identical small, medium, and stress fixtures and workload ordering.
- Monotonic timing around fully awaited operations.
- Fresh-process measurement for cold startup and complete enumeration.
- Explicit timing boundaries for create, alias open, mutation, conflict detection, journal update, backup, restore, remote CAS, and collaborator discovery.
- Report sample count, p50, p95, mean, standard deviation, minimum, and maximum.
- Record OS/build, CPU, memory, storage/filesystem, Node version, power mode, temporary-store location, network path/region, and provider environment without retaining sensitive coordinates.

Provider instrumentation must report:

- Request count by operation and status class.
- Request and response byte counts.
- Remote CAS latency.
- Retry and backoff count.
- Throttling count and honored `Retry-After` behavior.
- Lost-response reconciliation cost.
- Collaborator discovery latency.

Apply one anchored complexity and operability rubric to all five configurations. Score and explain dependency burden, implementation surface, testing burden, migration, deployment, diagnostics, recovery effort, ongoing maintenance, provider limits, and support burden.

Until a mapping is eligible, render all measurements under `Provisional diagnostics`. Do not emit a winner, rank, score-based recommendation, or language that treats SQLite speed versus envelope footprint as decisive.

## Report and generator changes

### Scenario catalog

Add applicability metadata and validation that every catalog entry declares its scope. Tests must reject missing, contradictory, or unknown applicability values.

### Eligibility

Update `gateSummary()` to iterate only applicable absolute gates for the current configuration. Preserve separate collections for pass, fail, blocked, N/A, not applicable, and not executed.

### Outcome reports

Regenerate all five outcome reports with:

- Environment and method.
- Applicability-aware scenario coverage.
- Correctness summary.
- Measurements and method metadata.
- Failures and recovery.
- Operational assessment.
- Contract deviations.
- Risks, owners, and required follow-up.
- Configuration recommendation and conditions.
- Implementer and independent-review sign-off.

Every summary row must link to sanitized raw evidence.

### Comparison

Change the default comparison input from two newly executed local configs to the five reviewed outcome/raw-result pairs. Keep execution and aggregation as separate commands so a comparison cannot silently overwrite reviewed live evidence.

The comparison must contain:

1. A five-row applicability-aware configuration matrix.
2. The two mapping rollups and mapping eligibility.
3. Exact blocked or missing applicable gates.
4. A provisional-diagnostics section while no mapping is eligible.
5. A conditions table with owner and closure evidence.
6. One recommendation only after eligibility permits it.
7. Links from every summary cell to the configuration outcome and raw evidence.

## Conditions, owners, and closure evidence

| Condition | Owner | Evidence required to close |
|---|---|---|
| Shared Azure provider campaign | Provider test operator | Approved deployment receipt, two isolated configured Windows VM receipts, cost/expiry controls, and verified resource-group teardown |
| Applicability and report-generator correction | Spike implementer | Unit tests plus regenerated five-row matrix with all six states represented correctly |
| `S0-COL-002` on OneDrive, ADO, and GitHub | Provider test operator | Two-client-process simultaneous-write runs showing one winner, one typed conflict, and one authoritative generation per provider |
| `S0-COL-003` on OneDrive, ADO, and GitHub | Provider test operator | Two-client-process divergent-generation reconnect runs with deterministic reload or conflict per provider |
| `S0-COL-006` on OneDrive, ADO, and GitHub | Provider test operator | Second-collaborator change discovery evidence and latency distribution per provider |
| `S0-BCK-006` | Windows OneDrive test operator | Separate synced-folder compatibility outcome and raw evidence |
| `S0-PER-001` through `S0-PER-004` | Performance investigator | Repeated samples, statistics, environment record, and provider request/byte/throttle/discovery telemetry |
| `S0-PER-005` | Spike implementer | Completed common complexity and operability rubric with explanations |
| macOS and Linux portability | Runner owner | Completed unchanged harness runs on native hosted runners with detected filesystem evidence |
| Evidence isolation | Spike implementer | Clean staged-diff and artifact scan with no secrets, real coordinates, local paths, or non-Tippani details |
| Applicability waivers and final recommendation | Independent reviewer | Recorded approval of every `N/A`, mapping decision, conditions, and sign-off |

## Automated coverage

Add tests that prove:

- Every scenario has valid applicability metadata.
- The expected applicable gate set is stable for each of the five configurations.
- Provider-only gates do not block local configurations.
- Local-only gates do not block provider configurations.
- Provider-specific gates apply only to their provider.
- `Pass`, `Fail`, `Blocked`, `N/A`, `Not applicable`, and `Not executed` remain distinct in JSON and Markdown.
- Approved `N/A` and catalog-driven `Not applicable` do not block eligibility.
- `Blocked` and `Not executed` applicable absolute gates block eligibility.
- Mapping eligibility is the conjunction of constituent configuration eligibility.
- Relative ranking is absent while no mapping is eligible.
- All five reviewed reports are consumed and stale catalog/harness revisions are rejected.
- Provider instrumentation never persists authorization data, URLs, request bodies, response bodies, or real coordinates.
- Generated and staged artifacts fail the isolation scan when seeded with credential patterns, absolute paths, or non-Tippani markers.
- Multi-user gate implementations fail against deliberately broken conflict, reconnect, and discovery behavior.

## Validation sequence

1. Run catalog, eligibility, result-writer, comparison, and isolation unit tests.
2. Run the full credential-free harness and detection-power suites.
3. Regenerate local outcomes; keep `PER-001` and `PER-003` incomplete until the
   corrected fresh-process/memory/bytes-written method exists.
4. Provision and validate the shared two-VM Azure provider campaign.
5. Run at least three new live provider runs per provider; do not import the
   superseded outcomes as current evidence.
6. Run the new provider performance suite.
7. Run the two-VM collaboration suite on OneDrive, ADO, and GitHub.
8. Run the separate two-VM OneDrive synced-folder compatibility probe.
9. Clean provider resources, then deprovision and verify the Azure campaign.
10. Regenerate all five outcomes and the mapping comparison from reviewed raw evidence.
11. Scan every staged artifact and commit message for prohibited material.
12. Obtain implementer and independent-review sign-off.

## Done when

S0 is decision-ready when:

- The comparison includes all five configurations and both candidate mappings.
- Every absolute gate is correctly classified by applicability.
- Every applicable absolute gate is `Pass` or an `N/A` with approver identity,
  approval date, and reference for at least one complete mapping.
- Multi-user collaboration evidence exists independently for OneDrive, ADO, and GitHub.
- Every provider result references an approved two-VM deployment receipt, and
	final teardown evidence shows no campaign resources remain.
- Performance and operability evidence follows one repeated, documented method.
- Relative evidence is used only after mapping eligibility exists.
- Every condition has an owner and linked closure evidence.
- Every retained artifact is synthetic, sanitized, Tippani-specific, and free of secrets or environment leakage.
- The comparison records one recommendation, conditions, implementer sign-off, and independent-review sign-off suitable for the persistence ADR before R1.
