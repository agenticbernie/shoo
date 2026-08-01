# Shoo Requirement Traceability Matrix

- Version: 1.0
- Status: Accepted — Gate 4; updated through Gate 9
- Owner role: Technical Program Manager / QA Architect
- Dependencies: PRD Overview; module PRDs; accepted Phase 2 workflows; accepted Phase 3 scope
- Assumptions: Detailed requirement rows in artifacts 20–25 remain the canonical acceptance source; this matrix is the coverage index
- Unresolved questions: Named evaluation owners and observed calibration evidence
- Last decision: Gate 9 accepted ART-73–80 as the requirement validation contract
- Next action: Freeze the R0 dataset/protocol and instrument only the approved Slice A minimum events

## Traceability policy

1. Requirement IDs are stable. A materially changed behavior receives a new ID; the old requirement is marked superseded.
2. The module PRD row owns exact wording, priority, acceptance criteria, and individual trace.
3. This matrix proves coverage and release authorization; it does not replace the module row.
4. `Future` means documented but not authorized for design backlog or implementation.
5. No requirement enters an engineering backlog without at least one test ID and one owning module.

## Design artifact registry

| ID | Artifact | Trace role |
|---|---|---|
| ART-08 | User, Persona & JTBD Map | Actor and job justification |
| ART-09 | Core Scenario Workflows | Trigger, workflow, responsibilities, and failure behavior |
| ART-10 | User Journeys | End-to-end user experience and trust recovery |
| ART-11 | Service Blueprint & Agent Map | Frontstage/backstage ownership and evidence flow |
| ART-12 | Session, Memory & Coordination Lifecycles | State and transition semantics |
| ART-13 | Edge Cases & Acceptance Outcomes | Non-happy-path acceptance baseline |
| ART-14 | Product Scope | MVP inclusion and guardrails |
| ART-15 | Feature Inventory | Capability lineage IDs used by PRDs |
| ART-17 | MVP Definition & Release Boundaries | Slice and release authorization |
| ART-18 | Feature Dependency Map | Required sequencing and invariants |
| ART-19 | Deferred & Rejected Features | Scope exclusion and re-entry conditions |

## Master requirement coverage

| Requirement set | Owning module | Problems | Goals | Scenarios | Primary design artifacts | Test families | Authorization |
|---|---|---|---|---|---|---|---|
| SHOO-FR-001–014 | Core | PROB-01/02/03 | GOAL-01/02/03/05 | SCN-01/03 | ART-08/09/10/11/12/13/14/15/17/18 | TC-CORE-001–014 | MVP Slices A–D |
| SHOO-FR-101–112 | Memory | PROB-01/02/03 | GOAL-02/03/04/05 | SCN-01/03 | ART-09/11/12/13/14/15/17/18 | TC-MEM-001–012 | MVP Slices A–D |
| SHOO-FR-201–212 | Intelligence | PROB-01/02/03 | GOAL-01/03/05 | SCN-01/03 | ART-08/09/10/11/13/14/15/17/18 | TC-INT-001–012 | Context in Slice C; Ask in Slice D |
| SHOO-PLATFORM-001–017 | Platform | PROB-01/02/03/04 | GOAL-01/02/03/04/05 | SCN-01/02/03 | ART-09/11/12/13/14/15/17/18 | TC-PLAT-001–017 | MVP platform subset |
| SHOO-NFR-001–010 | Global | PROB-02/04 | GOAL-01/02/03/04/05 | SCN-01/02/03 | ART-11/12/13/14/17/18 | TC-PLAT, TC-MEM, TC-OPS, TC-UX, TC-SEC | MVP cross-cutting |
| SHOO-SEC-001–010 | Global | PROB-04 | GOAL-02/03/04/05 | SCN-01/02/03 | ART-10/11/13/14/17/18 | TC-SEC-001–008; TC-INT-006; TC-PLAT-002 | MVP cross-cutting |
| SHOO-DATA-001–008 | Global | PROB-04 | GOAL-03/04/05 | SCN-01/02 | ART-11/12/13/14/18 | TC-DATA-001–004; TC-MEM-006; TC-PLAT-003/009/010 | MVP cross-cutting |
| SHOO-UX-001–008 | Global | PROB-02/03 | GOAL-01/02/03/04/05 | SCN-01/03 | ART-08/09/10/13/14/17 | TC-UX-001–006; TC-CORE-002; TC-MEM-006; TC-INT-003 | MVP cross-cutting |
| SHOO-DATA-301; SHOO-SEC-301; SHOO-NFR-301 | Coordination | PROB-04 | GOAL-03 | SCN-02/04 | ART-09/11/12/13/14/18/19 | TC-COORD-001–003 | MVP invariant/schema only |
| SHOO-FR-301–307 | Coordination | PROB-04 | GOAL-03 | SCN-02/04 | ART-08/09/10/11/12/13/19 | TC-COORD-101–107 | Future; not implementation-authorized |

## Test catalogue

| Family | Test intent | Release use |
|---|---|---|
| TC-CORE-001–014 | Project link, work-unit identity, session state, checkpoint, recovery, cross-agent resume, and correction | R0–R3 |
| TC-MEM-001–012 | Idempotency, ordering, extraction, provenance, authority, supersession, contradiction, routing, and durability state | R0–R3 |
| TC-INT-001–012 | Filtering, ranking, context budget, manifest, invalidation, resume suggestions, Ask Shoo, citations, and unsupported-answer behavior | R0–R3 |
| TC-PLAT-001–017 | OpenCode/Codex adapters, local policy, offline/outage recovery, MemWal/Walrus lifecycle, auth, audit, export, rollout | R0–R3 |
| TC-SEC-001–008 | Tenant isolation, leakage prevention, encryption-policy enforcement, audit, authorization, credentials, and adversarial security paths | Required before R2/R3 |
| TC-DATA-001–004 | Scope identity, time dimensions, orthogonal states, and team-ready/solo-only constraints | R1–R3 |
| TC-UX-001–006 | Accessibility, status comprehension, state recovery, infrastructure-neutral onboarding, and policy comprehension | R2–R3 |
| TC-OPS-001 | Content-safe stage telemetry and operational diagnosis | R1–R3 |
| TC-COORD-001–003 | Schema and anti-surveillance invariants only | MVP review; no team feature execution |
| TC-COORD-101–107 | Future blocker, dependency, impact, suggestion, handoff, flow, and critical-path behavior | Dormant until new scope gate |

## Release evidence matrix

| Release | User outcome | Mandatory requirement evidence | Exit decision |
|---|---|---|---|
| R0 technical proof | OpenCode evidence can produce a safe checkpoint and reach Codex as scoped context | P0 Core/Memory/Platform happy path; source citations; MemWal durable round-trip or explicit failed/pending state | Continue only if cross-client loop is technically credible |
| R1 internal alpha | Continuation survives duplicate, reordered, offline, cloud, and durable failures | Global NFRs; idempotency; reconciliation; observability; security canaries | Continue only if coding remains non-blocking and state is truthful |
| R2 private alpha | User can understand, inspect, correct, and control capture/sync | Web governance; correction; policy comprehension; auth/isolation; export/deletion truth | Continue only if trust and correction burden are acceptable |
| R3 MVP beta | Eligible sessions resume with sufficient context and cited current truth | All MVP P0/P1 requirements plus approved Phase 9 thresholds | Gate beta on SCRR improvement and risk exits, not feature count |

## Coverage gaps intentionally deferred

- Numeric SCRR, retrieval, accuracy, latency, and reliability thresholds require measured baselines; instrumentation is mandatory now, values are Gate 9 work.
- Exact API, MCP schema, consistency mechanism, database, and deployment choices are Gate 5 AICD work.
- Billing/pricing behavior requires commercial discovery and does not define the continuation loop.
- Team coordination tests beyond invariants remain dormant until a new scope gate supersedes Gate 3.

## Change control

At every later gate, the Technical Program Manager must verify:

- no orphan requirement without owner, acceptance criterion, trace, or test;
- no test that asserts behavior absent from an authorized requirement;
- no future Coordination ID in an MVP backlog;
- no implementation decision silently changing product semantics;
- every supersession updates the Decision Log, registry, and affected tests.

## Phase 5 architecture trace

| Requirement set | Architecture artifacts | Contract/control evidence |
|---|---|---|
| SHOO-FR-001–014 | ART-28, ART-29, ART-33, ART-34, ART-39 | Physical continuity schema; HTTP work/session endpoints; MCP session/context tools; start/checkpoint/resume sequences |
| SHOO-FR-101–112 | ART-29, ART-30, ART-36, ART-40 | Memory/revision/evidence/supersession schemas; authority resolver; correction/conflict contract |
| SHOO-FR-201–212 | ART-30, ART-36, ART-37, ART-38, ART-39 | Retrieval pipeline; context/Ask API; MCP context/recall; pack/citation schemas and sequences |
| SHOO-PLATFORM-001–017 | ART-28, ART-29, ART-31, ART-32, ART-34, ART-35, ART-39 | Adapter/local spool; Manual durability; HTTP/MCP gateway; offline/durable/deletion sequences |
| SHOO-NFR-001–010 | ART-29, ART-35, ART-39, ART-41 | Consistency/retry; scale triggers; failure sequences; security gates and failure injection |
| SHOO-SEC-001–010 | ART-33, ART-34, ART-37, ART-38, ART-41 | RLS/authorization; OS vault; API/MCP security; STRIDE controls and release gates |
| SHOO-DATA-001–008 | ART-29, ART-32, ART-35, ART-36 | Physical schemas; durable envelope/mapping; retention/deletion states; migration contract |
| SHOO-UX-001–008 | ART-34, ART-37, ART-38, ART-40 | Onboarding/recovery; degraded/error envelopes; source/citation resources; conflict resolution states |
| Coordination invariants | ART-33, ART-36, ART-41 | Optional team IDs, independent visibility/authority, anti-surveillance telemetry constraints; no future endpoints/tools |

## Phase 5C validation trace

| Requirement set | Phase 5C artifacts | Validation evidence |
|---|---|---|
| SHOO-FR-001–014 | ART-42, ART-43, ART-45, ART-46 | Capture/context SLOs; degraded modes; vertical migration; FIT-002–005/020–024 |
| SHOO-FR-101–112 | ART-42, ART-44, ART-46 | Correctness telemetry; memory/durable cost meters; FIT-007–012/017 |
| SHOO-FR-201–212 | ART-42, ART-44, ART-46 | Retrieval stage/citation metrics; token/cost budgets; FIT-008–010/016/021–023 |
| SHOO-PLATFORM-001–017 | ART-42–46 | Environment/update/recovery; unit cost; migration; resilience and portability tests |
| SHOO-NFR-001–010 | ART-42–44, ART-46 | SLO/error budget, RPO/RTO hypotheses, capacity and load gates |
| SHOO-SEC-001–010 | ART-42, ART-43, ART-45, ART-46 | Content-safe telemetry, signed supply chain, migration quarantine, zero-budget safety tests |
| SHOO-DATA-001–008 | ART-43, ART-45, ART-46 | Expand/contract, restore/tombstone, deterministic migration and rollback |
| SHOO-UX-001–008 | ART-42, ART-43, ART-47 | Truthful degraded states, update consent and Gate 5 implementation conditions |

## Phase 6 UX trace

| Requirement | Phase 6 artifacts | UX evidence |
|---|---|---|
| SHOO-UX-001 | ART-49, ART-50, ART-52 | Capture health at start/checkpoint/consumption; UX-FT-01/02/07 |
| SHOO-UX-002 | ART-48, ART-52, ART-54 | Independent state grammar and accessible copy; UX-FT-04 |
| SHOO-UX-003 | ART-51–54 | Inline citations, manifest and Source Drawer; UX-FT-05 |
| SHOO-UX-004 | ART-49, ART-50 | Targeted work-unit choice during start/resume; UX-FT-03 |
| SHOO-UX-005 | ART-49, ART-51–53 | Correction preview, impact and expected-version recovery; UX-FT-06 |
| SHOO-UX-006 | ART-49, ART-52, ART-54 | Explicit empty/partial/stale/conflict/denied/offline/durable recovery; UX-FT-07 |
| SHOO-UX-007 | ART-49, ART-50, ART-54 | Outcome-first Durable Memory onboarding with technical disclosure; UX-FT-01/02 |
| SHOO-UX-008 | ART-48–52 | Safe defaults, progressive policy disclosure and effect preview; UX-FT-01 |

Additional Phase 6 aliases:

- ART-48 UX Architecture & Information Architecture;
- ART-49 End-to-End User Flows;
- ART-50 Developer Tool UX Specification;
- ART-51 Web Screen Inventory & Specifications;
- ART-52 Interaction, State & Feedback Rules;
- ART-53 Wireframe & Component Architecture;
- ART-54 UX Copy & Accessibility Specification;
- ART-55 Decision Gate 6 Review Package.

## Phase 7 UI trace

| Requirement | Phase 7 artifacts | UI evidence |
|---|---|---|
| SHOO-UX-001 | ART-57, ART-58, ART-60 | Capture-health components and screen states; UI-FT-02/03/07 |
| SHOO-UX-002 | ART-56–58, ART-61 | Redundant state color/icon/text system; UI-FT-01–04 |
| SHOO-UX-003 | ART-58, ART-60 | Memory Source Chip, Source Drawer and cited response layout |
| SHOO-UX-004 | ART-60 | Targeted ambiguity and resume hierarchy preserved visually |
| SHOO-UX-005 | ART-58, ART-60 | Correction/Conflict Panel with equal evidence and impact preview |
| SHOO-UX-006 | ART-58, ART-60, ART-61 | Empty/partial/stale/denied/offline/unavailable state regression |
| SHOO-UX-007 | ART-56, ART-60 | Calm outcome-first onboarding without blockchain/AI gimmicks |
| SHOO-UX-008 | ART-58, ART-60 | Policy Route Preview and restrained progressive disclosure |

Additional Phase 7 aliases:

- ART-56 Visual Direction & Brand System;
- ART-57 Design Tokens & Foundations;
- ART-58 Component System Specifications;
- ART-59 Data Visualization, Timeline & Graph System;
- ART-60 Screen-Level UI Specifications;
- ART-61 Responsive, Accessibility & UI Quality Strategy;
- ART-62 Decision Gate 7 Review Package.

## Phase 8 implementation trace

| Requirement set | Phase 8 artifacts | Execution evidence |
|---|---|---|
| SHOO-FR-001–014 | ART-63, ART-66, ART-67, ART-69 | EPIC-01/03/04; Journey A/C/D; Slice A/C/D exits |
| SHOO-FR-101–112 | ART-63, ART-66, ART-67, ART-69 | EPIC-02/04; Journey B/D; memory/current-truth invariants |
| SHOO-FR-201–212 | ART-63, ART-66, ART-67, ART-69 | EPIC-03/04; retrieval corpus, context/Ask and citation tests |
| SHOO-PLATFORM-001–017 | ART-63–70 | Local/CI/durable/export/update/recovery stories and fitness gates |
| SHOO-NFR-001–010 | ART-64–70 | Contract/migration standards, SLO/load/recovery tests and release DoD |
| SHOO-SEC-001–010 | ART-64, ART-65, ART-68–70 | RLS/secrets/supply chain/restore/incident gates |
| SHOO-DATA-001–008 | ART-63, ART-64, ART-67–69 | Package/table ownership, authored migrations, migration ledger, recovery |
| SHOO-UX-001–008 | ART-65–70 | UI component/accessibility/state journeys integrated in Slice D and DoD |
| Coordination invariants | ART-63–71 | No package/route/backlog; scope audit required in CI and Gate 8 |

Additional Phase 8 aliases:

- ART-63 Repository, Service & Package Architecture;
- ART-64 Engineering Standards & Contract Governance;
- ART-65 Local Development, CI/CD & Environment Plan;
- ART-66 Vertical Slice Roadmap & Release Plan;
- ART-67 Implementation Backlog;
- ART-68 Migration, Release, Rollout & Recovery Plan;
- ART-69 Implementation Testing Strategy;
- ART-70 Program Governance, Definition of Done & Ownership;
- ART-71 Decision Gate 8 Review Package.
- ART-72 Phase 8 Team, Platform & Security Decision Addendum.

## Phase 9 validation trace

| Requirement set | Phase 9 artifacts | Validation evidence |
|---|---|---|
| SHOO-FR-001–014 | ART-73, ART-76–79 | SCRR, recovery time, repeated-context, continuation studies and thresholds |
| SHOO-FR-101–112 | ART-74, ART-75, ART-78 | Typed extraction, authority/canonical precision, stale/conflict and correction rubric |
| SHOO-FR-201–212 | ART-73–75, ART-78 | Retrieval/context rubric, citation coverage/correctness, Ask labeling and token efficiency |
| SHOO-PLATFORM-001–017 | ART-74, ART-77, ART-78 | Capture completeness, duplicate/order recovery, Manual durability and cohort stops |
| SHOO-NFR-001–010 | ART-74, ART-77, ART-78 | Latency/availability, resilience, failure severity and staged advancement |
| SHOO-SEC-001–010 | ART-73–78 | Privacy-safe telemetry, zero-tolerance disclosure/secret gates, consent and access controls |
| SHOO-DATA-001–008 | ART-74, ART-75, ART-78 | Dataset provenance/versioning, loss/restore, deletion and durable correctness |
| SHOO-UX-001–008 | ART-73, ART-76, ART-79 | Onboarding, source, correction, failure-state, policy and deletion comprehension |
| Commercial hypotheses | ART-77, ART-79 | WTP only after successful continuation; buyer, alternative and support evidence |
| Coordination invariants | ART-73, ART-76, ART-80 | Anti-surveillance metrics; team study is exploratory and cannot authorize features |

Additional Phase 9 aliases:

- ART-73 Product Metrics & Measurement Model;
- ART-74 Technical Evaluation Framework;
- ART-75 Gold Dataset & Evaluation Rubrics;
- ART-76 User Research & Usability Test Plan;
- ART-77 Beta Cohort & Experiment Roadmap;
- ART-78 Success Thresholds & Calibration Plan;
- ART-79 Interview Guide & Study Protocols;
- ART-80 Decision Gate 9 Review Package.

Architecture artifact aliases:

- ART-28 System Context & Container Architecture;
- ART-29 Domain/Data/Consistency Architecture;
- ART-30 Memory/Retrieval/Canonical Resolution;
- ART-31 MCP & Client Integration Architecture;
- ART-32 MemWal/Walrus Integration & Trust Model;
- ART-33 Identity/Permission/User-Owned Memory;
- ART-34 Local Security/Key Management/Onboarding;
- ART-35 Deployment/Scale/Retention;
- ART-36 Physical Data & Event Schemas;
- ART-37 HTTP API Contracts;
- ART-38 MCP Contracts;
- ART-39 Component Specifications & Sequences;
- ART-40 Conflict Resolution Design;
- ART-41 Security & Privacy Threat Model;
- ART-42 Observability, SLO & Error Budget Design;
- ART-43 Deployment & Environment Strategy;
- ART-44 Cost Model & Capacity Envelope;
- ART-45 Kage/Sensei to Shoo Migration Plan;
- ART-46 Architecture Fitness Test Catalogue;
- ART-47 Decision Gate 5 Review Package.
