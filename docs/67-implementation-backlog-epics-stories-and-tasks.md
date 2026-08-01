# Shoo Implementation Backlog — Epics, Stories and Engineering Tasks

- Version: 0.2
- Status: Accepted baseline — Gate 8; only foundation/spikes/Slice A authorized
- Owner role: Technical Program Manager / Engineering Leads / Product Manager
- Dependencies: Vertical Slice Roadmap; Requirement Traceability; Architecture Fitness Tests
- Assumptions: Backlog is sequenced by outcome and risk; estimates are assigned by the delivery team after decomposition
- Unresolved questions: Contributor FTE allocation, named story owners, spike results and external provider lead time
- Last decision: Confirm GitHub Actions/Docker/local-encryption work and narrow EPIC-06 to code-lineage extraction
- Next action: Import only foundation, approved spikes and Slice A; keep later slices dormant

## Backlog hierarchy and ID policy

- Epic: `SHOO-EPIC-nn` — user outcome/release slice.
- Feature: `SHOO-FEAT-nn` — independently demonstrable capability.
- Story: `SHOO-STORY-nnn` — user/system behavior with acceptance evidence.
- Engineering Task: `SHOO-TASK-nnn` — implementation work supporting a story.
- Spike: `SHOO-SPIKE-nn` — timeboxed uncertainty reduction with decision output.
- Defect/Risk: links requirement, fitness test and risk IDs.

No task enters active work without owning story, acceptance criteria, dependency and test reference.

## SHOO-EPIC-01 — Trusted Project Start and Capture

| ID | Item | Acceptance outcome | Dependencies |
|---|---|---|---|
| FEAT-01 | Repository initialization | User links trusted repository with previewed config and safe defaults | None |
| STORY-001 | Sign in and create/link project | Correct project/tenant identity; no project capture before trust | Clerk adapter skeleton |
| STORY-002 | Detect OpenCode/Codex capability | Health reports supported/degraded features independently | Client manifests |
| STORY-003 | Apply local capture policy | Canary secret/raw data remains local/denied as configured | Local policy engine |
| STORY-004 | Start scoped session | Project/developer/agent/session/work identity is explicit | Domain baseline |
| STORY-005 | Capture and spool offline | Eligible events survive crash/restart and reconcile idempotently | Encrypted SQLite |
| STORY-006 | Create first checkpoint candidate | Objective/progress/files/tests/uncertainty/source are structured | Normalizer skeleton |

Key tasks:

- TASK-001 repository/workspace/composition skeleton;
- TASK-002 contract schemas and compatibility fixtures;
- TASK-003 PostgreSQL identity/continuity migrations + FORCE RLS;
- TASK-004 local-store encryption/vault interface;
- TASK-005 OpenCode adapter and normalized envelope;
- TASK-006 Codex capability/connectivity adapter;
- TASK-007 CLI init/connect/status preview;
- TASK-008 local/cloud content-safe trace propagation;
- TASK-009 secret/path exclusion adversarial fixtures;
- TASK-010 architecture/Coordination-leakage checks.

Spikes: SPIKE-01 cross-platform encrypted SQLite/package; SPIKE-02 OpenCode/Codex lifecycle coverage; SPIKE-03 Shoo Local signed package approach.

## SHOO-EPIC-02 — Structured Memory and Manual Durability

| ID | Item | Acceptance outcome | Dependencies |
|---|---|---|---|
| FEAT-02 | Event normalization/extraction | Duplicate/reordered evidence converges to one traceable candidate | EPIC-01 |
| STORY-020 | Commit checkpoint operationally | Aggregate/event/outbox atomic; truthful sync state | DB/outbox |
| STORY-021 | Extract typed memory | Candidate carries type/scope/provenance/confidence/authority | Model adapter |
| STORY-022 | Set up user-owned Durable Memory | Owner/account/namespace/device delegate verified | MemWal adapter |
| STORY-023 | Persist eligible memory manually | Local embedding/encryption and verified durable mapping | STORY-022 |
| STORY-024 | Recover durable failure | Work remains available; retry/reconcile visible | Outbox worker |
| STORY-025 | Restore missing index mapping | Restore does not auto-canonicalize | Durable reconciliation |

Key tasks:

- TASK-020 memory/evidence/revision/durable schemas;
- TASK-021 transactional outbox lease/retry/dead-letter;
- TASK-022 provider-neutral embedding port and R0 adapter;
- TASK-023 extraction schema/prompt plus gold fixtures;
- TASK-024 MemWal version pin/compatibility suite;
- TASK-025 wallet signer/account/namespace/delegate flow;
- TASK-026 OS-vault secret handling per platform;
- TASK-027 remember/recall/restore job state;
- TASK-028 durable SLO/cost meters;
- TASK-029 key-loss/trust-boundary UX and tests.

Spikes: SPIKE-04 cloud-vs-local embedding quality/privacy; SPIKE-05 MemWal Manual round-trip/latency/cost; SPIKE-06 wallet accessibility/recovery.

## SHOO-EPIC-03 — Cross-Agent Context and Resume

| ID | Item | Acceptance outcome | Dependencies |
|---|---|---|---|
| FEAT-03 | Current-truth resolver | Unauthorized/superseded/conflicted state never becomes singular truth | EPIC-02 |
| STORY-040 | Resolve resume target | Confident match or targeted ambiguity choice | Work/session model |
| STORY-041 | Retrieve eligible candidates | Structured filters precede semantic/FTS ranking | pgvector/FTS |
| STORY-042 | Build token-bounded context | Mandatory sections, limitations and citation manifest fit budget | Resolver/retrieval |
| STORY-043 | Deliver context to Codex | Supported interface receives current cited pack | MCP/client adapter |
| STORY-044 | Resume during durable outage | Operational truth works with visible pending durable state | Degraded mode |
| STORY-045 | Invalidate stale packs | Permission/correction/supersession prevents old delivery | Event invalidation |

Key tasks:

- TASK-040 canonical/supersession/conflict resolver;
- TASK-041 FTS/pgvector filtered candidate queries;
- TASK-042 ranking features and versioned configuration;
- TASK-043 context pack/manifest builder;
- TASK-044 MCP start/resume/get_context resources/tools;
- TASK-045 Codex delivery and capability fallback;
- TASK-046 source permission at delivery time;
- TASK-047 token budget/omission policy;
- TASK-048 retrieval gold corpus/evaluator;
- TASK-049 SCRR/repeated-context instrumentation.

## SHOO-EPIC-04 — Web Governance, Correction and Ask

| ID | Item | Acceptance outcome | Dependencies |
|---|---|---|---|
| FEAT-04 | Project Pulse and Work | User sees resume target/current changes/trust health | EPIC-03 |
| STORY-060 | Inspect timeline/session/source | Provenance visible without raw transcript default | Web/API |
| STORY-061 | Inspect decisions/memory | Authority/freshness/scope/durability are independent | Read models |
| STORY-062 | Correct or supersede memory | Preview, expected version, audit and invalidation | Resolver |
| STORY-063 | Resolve conflict | Equal sides, permitted evidence, explicit action/no default winner | Conflict engine |
| STORY-064 | Ask Shoo | Facts/inferences/suggestions/limits with citations | Shared retrieval |
| STORY-065 | Configure policy/access | Safe defaults and impact preview | Auth/policy |

Key tasks:

- TASK-060 design tokens/component foundation;
- TASK-061 Web shell/navigation/project scope;
- TASK-062 Pulse/Work/Activity/Agents pages;
- TASK-063 Decisions/Memory/Source Drawer;
- TASK-064 correction/conflict preview commands;
- TASK-065 Ask report and scoped follow-up;
- TASK-066 Clerk production adapter + identity mapping;
- TASK-067 accessibility/responsive state matrix;
- TASK-068 cross-surface current-truth conformance;
- TASK-069 correction/citation/Ask telemetry.

## SHOO-EPIC-05 — Privacy, Recovery and Beta Operations

| ID | Item | Acceptance outcome | Dependencies |
|---|---|---|---|
| STORY-080 | Export scoped Shoo data | Authorized async export with expiry and no entitlement lockout | Prior epics |
| STORY-081 | Delete/restrict by layer | Local/operational/index/backup/durable truth shown independently | Retention model |
| STORY-082 | Safe uninstall | Preview, client disconnect, delegate revoke and no implicit cloud delete | Local UX |
| STORY-083 | Signed update/rollback | Tamper rejected; spool and compatible version preserved | Release chain |
| STORY-084 | Backup/restore/tombstone | Restore meets provisional RPO/RTO and deleted data stays inaccessible | Platform |
| STORY-085 | Incident/support diagnostics | Content-safe report and tested runbooks | Observability |
| STORY-086 | Cost/entitlement controls | Optional load limited; core privacy/correction/export retained | Cost meters |

Key tasks:

- TASK-080 operation resources and progress UI;
- TASK-081 deletion journal/tombstone replay;
- TASK-082 export encryption/expiry;
- TASK-083 local updater signing/channel/rollback;
- TASK-084 backup restore rehearsal automation;
- TASK-085 SLO/error budget dashboards/alerts;
- TASK-086 support diagnostics and incident templates;
- TASK-087 invoice usage reconciliation;
- TASK-088 beta flags/cohort/entitlement adapter;
- TASK-089 penetration/accessibility review remediation.

## SHOO-EPIC-06 — Predecessor Code-Lineage Extraction

| ID | Item | Acceptance outcome | Dependencies |
|---|---|---|---|
| STORY-100 | Inventory and mapping ledger | Every in-scope source capability/data has disposition | Gate 8 |
| STORY-101 | Contract adapters | Reused Kage/Sensei code cannot leak predecessor public semantics | EPIC-01/02 |
| STORY-102 | Fixture-only transformation | Prototype records transform deterministically without canonical promotion | Target schemas |
| STORY-103 | Contract comparison | Reused capability matches Shoo contracts on fixtures | Target slices |
| STORY-104 | Capability replacement | Selected predecessor implementation is wrapped or rewritten behind port | Contract tests |
| STORY-105 | Archive lineage | Prototype packages/data are archived after useful capability extraction | Accepted replacement |

No production dual-write, user migration UI or predecessor-data cutover is authorized.

## Backlog admission rules

- `SHOO-FR-301–307` cannot enter this backlog.
- A dedicated vector store/broker needs accepted trigger evidence and ADR.
- “Improve AI,” “make seamless,” or “enhance dashboard” is not an admissible story.
- Each story identifies one user/system outcome, failure behavior, test IDs, observability and rollout flag.
