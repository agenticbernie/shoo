# Shoo PRD Overview and Global Requirements

- Version: 0.2
- Status: Accepted — Decision Gate 4
- Owner role: Principal Product Manager / Technical Program Manager
- Dependencies: Product Scope v0.2; Feature Inventory v0.2; MVP Release Boundaries v0.2
- Assumptions: Module PRDs share one domain truth and one traceability registry
- Unresolved questions: Numeric SLO/evaluation thresholds; beta packaging; legal retention requirements
- Last decision: Sponsor approved the PRD baseline without amendments
- Next action: Trace accepted requirements into Phase 5 architecture and contracts

## Executive summary

Shoo is a Commercial SaaS that preserves trustworthy project state across coding agents and sessions. The MVP proves one OpenCode-to-Codex continuation loop with policy-driven operational sync, mandatory MemWal/Walrus durable memory, minimal Web governance, cited retrieval, correction, and measurable resume outcomes.

Shoo is not a chatbot, transcript archive, vector database wrapper, employee-surveillance product, or autonomous project manager.

## Problem registry

| ID | Problem |
|---|---|
| PROB-01 | Coding agents maintain isolated context. |
| PROB-02 | Session boundaries, compaction, crashes, and client switches lose project state. |
| PROB-03 | Developers manually broker goals, progress, decisions, failures, and unfinished work. |
| PROB-04 | Team scale multiplies context, ownership, dependency, conflict, and continuity gaps. |

## Goal registry

| ID | Goal |
|---|---|
| GOAL-01 | Resume a work unit with sufficient context and no manual state re-explanation. |
| GOAL-02 | Capture and structure meaningful session outcomes automatically. |
| GOAL-03 | Preserve evidence, authority, correction, supersession, and current truth. |
| GOAL-04 | Sync operational and durable state according to explicit policy without blocking coding. |
| GOAL-05 | Let users inspect, ask, understand, and correct project memory. |

## Scenario registry

| ID | Scenario | MVP status |
|---|---|---|
| SCN-01 | Solo developer, multiple sessions and agents | Primary MVP |
| SCN-02 | Team, multiple agents per member | Schema-ready; product deferred |
| SCN-03 | Ask Shoo for project state and rationale | MVP Slice D |
| SCN-04 | Non-blocking team coordination | Future; not implementation-authorized |

## PRD module boundaries

| Module | Responsibility | MVP boundary |
|---|---|---|
| Shoo Core | Project, work-unit, session, checkpoint, resume workflow | Full MVP |
| Shoo Memory | Evidence, extraction, authority, provenance, correction, policy eligibility | Full MVP |
| Shoo Intelligence | Retrieval, ranking, context packs, citations, Ask Shoo | Full MVP, Ask in Slice D |
| Shoo Coordination | Blocker/dependency/handoff/team flow | Schema constraints only; product deferred |
| Shoo Platform | Adapters, MCP, sync, MemWal/Walrus, identity, observability, privacy operations | Full MVP platform subset |

## Global goals

- Deliver Slices A–D defined at Gate 3.
- Measure Sufficient Context Resume Rate rather than memory volume.
- Keep raw transcripts and source code local by default.
- Never represent a client stop or durable write as work completion.
- Ensure Web, Ask Shoo, and agent context use the same current-state and citation path.

## Global non-goals

- Full team administration, handoff, dependencies, critical path, Team Pace, notifications, or autonomous coordination.
- Additional agent clients beyond OpenCode and Codex.
- General assistant behavior.
- Component/API/technology selection before AICD.
- Automatic canonicalization of high-impact agent claims.
- Physical deletion guarantees that exceed verified Walrus retention semantics.

## Global functional requirements

Module-specific functional requirements are defined in the five PRDs. The following global rules apply to every module:

- A derived project-state claim must be traceable to evidence and the rule/policy version that produced it.
- Permission, visibility, authority, durability, and freshness must remain distinct dimensions.
- A correction must affect subsequent retrieval and preserve historical lineage.
- Degraded state must be surfaced; the product must not silently claim completeness.

## Global non-functional requirements

| ID | Requirement | Acceptance criteria | Trace |
|---|---|---|---|
| SHOO-NFR-001 | Coding work shall remain possible when Shoo Cloud, MemWal, or Walrus is unavailable. | Failure injection leaves the repository/client usable; Shoo shows degraded state and queues eligible work. | PROB-02; GOAL-04; SCN-01; TC-PLAT-006 |
| SHOO-NFR-002 | Every capture, retrieval, sync, durable job, correction, and answer path shall emit latency, outcome, and error telemetry. | Test environment exposes success/failure counters and latency distributions per stage without content leakage. | GOAL-01/04; TC-OPS-001 |
| SHOO-NFR-003 | Event ingestion and durable scheduling shall be idempotent. | Replaying the same event produces no duplicate checkpoint, memory, or durable job. | PROB-02; GOAL-02/04; TC-MEM-001 |
| SHOO-NFR-004 | Derived state shall tolerate out-of-order events. | Reordered fixture converges to the expected state while preserving arrival/source times. | PROB-02; GOAL-03; TC-MEM-002 |
| SHOO-NFR-005 | Local capture shall support temporary offline operation. | Permitted events/checkpoints queue locally and reconcile after reconnect without silent loss. | GOAL-02/04; TC-PLAT-005 |
| SHOO-NFR-006 | Web user flows shall meet WCAG 2.2 AA for keyboard, focus, contrast, labels, status, and error feedback. | Automated and manual accessibility checks pass for MVP screens and states. | GOAL-05; TC-UX-001 |
| SHOO-NFR-007 | Project and tenant data shall be isolated by default. | Cross-project and cross-tenant test identities cannot retrieve, infer, or mutate unauthorized data. | PROB-04; GOAL-03; TC-SEC-001 |
| SHOO-NFR-008 | Operational state and durable memory shall support reconciliation after partial failure. | Injected write/index failure reaches a visible retry/reconciled terminal state. | GOAL-04; TC-PLAT-007 |
| SHOO-NFR-009 | Client adapter, Shoo API, and MemWal compatibility shall be detectable before incompatible writes. | Unsupported version fixture blocks the affected operation with actionable status and preserves queued data. | GOAL-04; TC-PLAT-008 |
| SHOO-NFR-010 | All MVP state transitions shall be observable without storing secrets or raw source in telemetry. | Telemetry schema review and secret canary test pass. | GOAL-03/04; TC-SEC-004 |

## Global security and privacy requirements

| ID | Requirement | Acceptance criteria | Trace |
|---|---|---|---|
| SHOO-SEC-001 | Every read/write shall enforce authenticated project scope and least privilege. | Unauthorized and revoked identities fail closed across agent, Web, and API surfaces. | PROB-04; GOAL-03; TC-SEC-001 |
| SHOO-SEC-002 | Secret/path exclusion shall execute before data leaves the local trust boundary. | Canary secrets and excluded files never appear in cloud, durable jobs, logs, or citations. | GOAL-03/04; TC-SEC-002 |
| SHOO-SEC-003 | Sensitive durable content shall not be written until the effective encryption and retention policy permits it. | Unverified encryption mode denies/quarantines sensitive durable writes; no false E2E encryption claim is shown. | GOAL-04; TC-SEC-003 |
| SHOO-SEC-004 | Telemetry and logs shall exclude raw prompt, transcript, source, secret, and private-key content by default. | Canary scan finds no protected payloads in telemetry/log stores. | GOAL-03; TC-SEC-004 |
| SHOO-SEC-005 | Authentication/session actions and high-impact memory mutations shall be auditable. | Audit trail records actor, scope, action, time, result, and target without leaking protected content. | GOAL-03; TC-SEC-005 |
| SHOO-SEC-006 | Correction, restriction, export, and deletion shall require authorization appropriate to scope. | Personal user cannot mutate another scope; revoked actor cannot repeat mutation. | PROB-04; GOAL-03/05; TC-SEC-006 |
| SHOO-SEC-007 | Delegate/private credentials shall never be exposed to agent prompts, Web clients, or logs. | Credential canary and client-bundle inspection pass. | GOAL-04; TC-SEC-007 |
| SHOO-SEC-008 | Capture hooks/plugins shall expose trust state and source. | Untrusted/disabled adapter shows degraded state; no hidden capture execution. | GOAL-02/03; TC-PLAT-002 |
| SHOO-SEC-009 | Cached context packs shall be invalidated on permission, correction, or supersession changes. | Previously cached pack cannot be served after relevant invalidation event. | GOAL-03/05; TC-INT-006 |
| SHOO-SEC-010 | Security testing shall cover secret leakage, tenant isolation, authorization bypass, archive traversal, injection, and dependency compromise paths. | Required security suite passes before R2 and on release changes affecting trust boundaries. | GOAL-03/04; TC-SEC-008 |

## Global data requirements

| ID | Requirement | Acceptance criteria | Trace |
|---|---|---|---|
| SHOO-DATA-001 | Every normalized event/memory shall carry organization, team, project, developer, agent, session, work-unit, branch/worktree, source, and timestamp fields where applicable. | Schema validation accepts explicit null/not-supported states and rejects missing required scope identity. | GOAL-03; SCN-01/02; TC-DATA-001 |
| SHOO-DATA-002 | Source time, ingestion time, processing time, and policy version shall remain distinguishable. | Out-of-order fixture retains all time dimensions. | GOAL-03/04; TC-DATA-002 |
| SHOO-DATA-003 | Authority, verification, visibility, durability, and supersession shall be modeled separately. | State-transition tests prevent invalid implied transitions. | GOAL-03; TC-DATA-003 |
| SHOO-DATA-004 | Evidence references shall be immutable; derived claims may be superseded through lineage. | Correction creates a successor and leaves evidence/history addressable subject to policy. | GOAL-03; TC-MEM-006 |
| SHOO-DATA-005 | Raw evidence retention shall be minimized by default. | Default policy keeps raw prompts/transcripts/source local and shows effective routing. | GOAL-03/04; TC-PLAT-003 |
| SHOO-DATA-006 | Durable state shall retain Shoo identity, schema version, policy version, content integrity metadata, and MemWal/Walrus job/blob references. | Durable round-trip preserves required metadata and exposes pending/failed/persisted states. | GOAL-04; TC-PLAT-009 |
| SHOO-DATA-007 | Team-ready identifiers shall exist without granting team access or enabling team workflows. | Solo test data contains future scope fields; no team UI/API behavior becomes reachable. | PROB-04; SCN-02; TC-DATA-004 |
| SHOO-DATA-008 | Deletion state shall distinguish local removal, operational removal, recall/index removal, and underlying durable retention/expiry. | User-facing status and audit test report each completed/pending/unsupported layer truthfully. | GOAL-03/05; TC-PLAT-010 |

## Global UX requirements

| ID | Requirement | Acceptance criteria | Trace |
|---|---|---|---|
| SHOO-UX-001 | Capture health and completeness shall be visible at session start, checkpoint, and context consumption. | User can identify healthy, degraded, partial, and unavailable states in usability task. | GOAL-02/03; TC-UX-002 |
| SHOO-UX-002 | Fact, inference, suggestion, unverified, stale, conflict, canonical, and superseded states shall be distinguishable without color alone. | Accessibility/usability test correctly identifies each state. | GOAL-03/05; TC-UX-003 |
| SHOO-UX-003 | Every factual current-state answer or context item shall expose citations and freshness. | User opens source and identifies source type/time/scope. | GOAL-03/05; TC-INT-003 |
| SHOO-UX-004 | Work-unit ambiguity shall use a targeted choice rather than a broad setup form. | User resolves wrong/ambiguous work unit within the session-start task. | GOAL-01; TC-CORE-002 |
| SHOO-UX-005 | Correction shall preview affected scope and future consumers. | User completes correction and understands impact before confirmation. | GOAL-03/05; TC-MEM-006 |
| SHOO-UX-006 | Empty, partial, stale, conflict, permission-denied, offline, and durable-unavailable states shall have explicit recovery guidance. | Each state passes scenario-based usability test without fabricated success. | GOAL-03/04/05; TC-UX-004 |
| SHOO-UX-007 | Default onboarding shall not require the user to understand Walrus or blockchain terminology. | First-value task completes using product-language copy; infrastructure details remain optional. | GOAL-01/04; TC-UX-005 |
| SHOO-UX-008 | Policy configuration shall use safe defaults and progressive disclosure. | User can explain default raw/operational/durable routing without configuring every data class. | GOAL-03/04; TC-UX-006 |

## Telemetry and success framework

Required MVP telemetry:

- eligible session and resume attempt;
- work-unit match confidence and correction;
- capture completeness by client capability;
- checkpoint trigger and outcome;
- operational/durable sync status and latency;
- context items retrieved/used/corrected;
- citation coverage;
- manual project-state re-explanation signal;
- first useful action signal;
- stale/conflict exposure;
- export/deletion outcomes.

Telemetry shall never be used for individual productivity scoring.

## Rollout strategy

| Release | Requirement gate |
|---|---|
| R0 technical proof | P0 happy-path requirements for Core, Memory, Platform, and context delivery |
| R1 internal alpha | Global NFR/security failure paths and observability |
| R2 private alpha | Minimal Web, correction, policy comprehension, privacy/export workflows |
| R3 MVP beta | Complete P0/P1 MVP requirements and Phase 9 thresholds |

## Test registry convention

- `TC-CORE-*`: project/work/session/checkpoint/resume.
- `TC-MEM-*`: evidence/extraction/authority/correction/conflict.
- `TC-INT-*`: retrieval/context/Ask/citations.
- `TC-COORD-*`: future coordination behavior; not MVP execution.
- `TC-PLAT-*`: adapters/sync/MemWal/recovery/export.
- `TC-SEC-*`, `TC-DATA-*`, `TC-UX-*`, `TC-OPS-*`: cross-cutting verification.

## Risks

- Requirement count creates false completeness before end-to-end proof.
- Global requirements become unowned between modules.
- Coordination requirements silently re-enter MVP.
- Numeric thresholds are invented without baseline.
- PRD language overconstrains AICD prematurely.

Mitigation: module ownership, explicit MVP flags, traceability matrix, slice-based rollout, and Gate 5 authority for technology/contracts.

## Open questions

- Phase 9 numeric thresholds and baselines.
- Beta retention/legal policy.
- Pricing and entitlement enforcement depth.
- Exact authentication and deployment choices, deferred to AICD/implementation planning.
