# Shoo Blueprint — Artifact Registry

- Version: 2.3
- Status: Decision Gates 0–10 accepted; Implementation Readiness Week authorized
- Owner role: Principal Product Manager / Technical Program Manager
- Dependencies: User-provided Shoo restructuring brief
- Assumptions: Repository evidence is sufficient for product-level lineage audit but not a production-readiness certification
- Unresolved questions: Actual contributor allocation, named-person consent, security capability assessment, readiness rehearsal evidence and evidence-based Slice A forecast
- Last decision: Approve ART-83 as the five-working-day implementation-readiness operating plan
- Next action: Schedule Day 1, confirm named allocation/ownership and execute the ART-83 evidence plan

## Active artifact set

| Artifact | Version | Status | Purpose |
|---|---:|---|---|
| Current-State Audit | 0.2 | Accepted | Separate verified implementation, proposals, unknowns, and lineage |
| Repository Evidence Review | 0.1 | Accepted | Record inspected evidence and implementation gaps |
| Product DNA | 0.2 | Accepted | Define why Shoo exists and its boundaries |
| Assumption Ledger | 0.9 | Open | Make remaining high-impact hypotheses testable |
| Decision Log | 1.2 | Gate 5 decision-ready | Record decisions and reversal conditions |
| Risk Register | 0.9 | Open | Prioritize product and technical risks |
| MVP Boundary & Open Questions | 0.2 | Accepted | Define the first validation boundary and next-phase questions |
| User, Persona & JTBD Map | 0.2 | Accepted | Define actors and outcome-driven jobs |
| Core Scenario Workflows | 0.2 | Accepted | Define current/proposed workflows for four scenarios |
| User Journeys | 0.2 | Accepted | Model end-to-end experience and trust recovery |
| Service Blueprint & Agent Map | 0.2 | Accepted | Align frontstage, backstage, evidence, and recovery |
| Session, Memory & Coordination Lifecycles | 0.2 | Accepted | Separate session, work, memory, sync, and blocker states |
| Edge Cases & Acceptance Outcomes | 0.2 | Accepted | Define non-happy paths and evaluable outcomes |
| Product Scope | 0.2 | Accepted | Define hypotheses, in/out boundaries, and scope rules |
| Feature Inventory | 0.2 | Accepted | Classify traceable product capabilities |
| Feature Prioritization | 0.2 | Accepted | Rank capability groups by value, evidence, risk, and leverage |
| MVP Definition & Release Boundaries | 0.2 | Accepted | Cut MVP into vertical outcome slices and release gates |
| Feature Dependency Map | 0.2 | Accepted | Identify product dependency order and invariants |
| Deferred & Rejected Features | 0.2 | Accepted | Prevent scope creep and preserve reversal conditions |
| PRD Overview & Global Requirements | 0.2 | Accepted | Define registries and cross-cutting requirements |
| PRD — Shoo Core | 0.2 | Accepted | Define continuity workflow requirements |
| PRD — Shoo Memory | 0.2 | Accepted | Define structured memory and authority requirements |
| PRD — Shoo Intelligence | 0.2 | Accepted | Define retrieval, context, citations, and Ask requirements |
| PRD — Shoo Coordination | 0.2 | Accepted / Deferred | Preserve future intent and MVP invariants without authorizing features |
| PRD — Shoo Platform | 0.2 | Accepted | Define adapters, sync, durability, operations, and privacy requirements |
| Requirement Traceability Matrix | 0.5 | Accepted | Map requirements to problems, goals, scenarios, artifacts, tests, and releases |
| AICD Plan & Architecture Evidence | 0.4 | Accepted — Gate 5 | Define Phase 5 checkpoints and refreshed implementation evidence |
| System Context & Container Architecture | 0.1 | Accepted — Gate 5 | Define runtime boundaries, containers, ownership, and failure isolation |
| Domain, Data & Consistency Architecture | 0.1 | Accepted — Gate 5 | Define aggregates, stores, events, ordering, idempotency, and reconciliation |
| Memory, Retrieval & Canonical Resolution | 0.1 | Accepted — Gate 5 | Define memory lifecycle, ranking pipeline, and contradiction handling |
| MCP & Client Integration Architecture | 0.1 | Accepted — Gate 5 | Define MCP primitives, adapter boundaries, and client capability behavior |
| MemWal/Walrus Integration & Trust Model | 0.1 | Accepted — Gate 5 | Define durable payloads, job lifecycle, namespaces, encryption modes, and fallback |
| Identity, Permission & User-Owned Memory | 0.1 | Accepted — Gate 5 | Define tenant isolation, wallet/account/delegate ownership, roles, and authorization |
| Local Security, Key Management & Onboarding | 0.2 | Accepted — Gate 5 | Define cross-platform secrets, encrypted spool, recovery, and MemWal onboarding UX |
| Deployment, Scale Triggers & Retention | 0.2 | Accepted — Gate 5 | Define regional deployment, migration triggers, data retention, and physical deletion truth |
| Physical Data & Event Schemas | 0.1 | Accepted — Gate 5 | Define relational entities, constraints, indexes, event envelopes, and migration rules |
| HTTP API Contracts | 0.1 | Accepted — Gate 5 | Define resource/command/query/operation contracts and error behavior |
| MCP Contracts | 0.1 | Accepted — Gate 5 | Define MVP tools, resources, prompts, schemas, permissions, and async behavior |
| Component Specifications & Sequences | 0.1 | Accepted — Gate 5 | Define component I/O, failure, scaling, persistence, and end-to-end sequences |
| Conflict Resolution Design | 0.1 | Accepted — Gate 5 | Define detection, resolution, merge, invalidation, and rollback rules |
| Security & Privacy Threat Model | 0.1 | Accepted — Gate 5 | Define assets, trust boundaries, STRIDE threats, controls, and security gates |
| Observability, SLO & Error Budget Design | 0.1 | Accepted — Gate 5 | Define content-safe telemetry, beta SLOs, alerts, and reliability policy |
| Deployment & Environment Strategy | 0.2 | Accepted — Gate 5 | Define environments, release chain, update policy, recovery, and degraded modes |
| Cost Model & Capacity Envelope | 0.1 | Accepted — Gate 5 | Define cost units, meters, capacity hypotheses, and pricing readiness |
| Kage/Sensei to Shoo Migration Plan | 0.1 | Accepted — Gate 5 | Define contract-first mapping, rehearsal, shadowing, cutover, and rollback |
| Architecture Fitness Test Catalogue | 0.1 | Accepted — Gate 5 | Bind architecture claims to executable pass/fail evidence |
| Decision Gate 5 Review Package | 0.2 | Accepted — Gate 5 | Consolidate decisions, conditions, residual risks, and acceptance statement |
| UX Architecture & Information Architecture | 0.1 | Accepted — Gate 6 | Define experience objects, navigation, hierarchy and responsive boundaries |
| End-to-End User Flows | 0.1 | Accepted — Gate 6 | Define activation, onboarding, resume, correction, Ask and data-control flows |
| Developer Tool UX Specification | 0.1 | Accepted — Gate 6 | Define CLI, agent interaction, health, diagnostics and update behavior |
| Web Screen Inventory & Specifications | 0.1 | Accepted — Gate 6 | Define MVP screens, questions, hierarchy and deferred routes |
| Interaction, State & Feedback Rules | 0.1 | Accepted — Gate 6 | Define cross-surface state grammar, recovery, confirmation and citations |
| Wireframe & Component Architecture | 0.1 | Accepted — Gate 6 | Define low-fidelity shell, screen regions and semantic component contracts |
| UX Copy & Accessibility Specification | 0.1 | Accepted — Gate 6 | Define terminology, state copy and WCAG/CLI accessibility baseline |
| Decision Gate 6 Review Package | 0.2 | Accepted — Gate 6 | Consolidate UX decisions, validation conditions and residual risks |
| Visual Direction & Brand System | 0.1 | Accepted — Gate 7 | Define Calm Technical Evidence, themes, typography, iconography and anti-goals |
| Design Tokens & Foundations | 0.1 | Accepted — Gate 7 | Define semantic color, type, spacing, grid, motion and governance |
| Component System Specifications | 0.1 | Accepted — Gate 7 | Define MVP evidence/state components and future lineage boundaries |
| Data Visualization, Timeline & Graph System | 0.1 | Accepted — Gate 7 | Define timeline/lineage/sync visuals and anti-surveillance rules |
| Screen-Level UI Specifications | 0.1 | Accepted — Gate 7 | Apply visual hierarchy and components to critical screens |
| Responsive, Accessibility & UI Quality Strategy | 0.1 | Accepted — Gate 7 | Define responsive contracts, WCAG target and UI quality gates |
| Decision Gate 7 Review Package | 0.2 | Accepted — Gate 7 | Consolidate UI decisions, validation conditions and residual risks |
| Repository, Service & Package Architecture | 0.2 | Accepted — Gate 8 | Define monorepo, runtime boundaries, packages and technology candidates |
| Engineering Standards & Contract Governance | 0.1 | Accepted — Gate 8 | Define code, API, migration, security and ADR standards |
| Local Development, CI/CD & Environment Plan | 0.2 | Accepted — Gate 8 | Define local profiles, CI gates, environments, flags and channels |
| Vertical Slice Roadmap & Release Plan | 0.2 | Accepted — Gate 8 | Define five outcome slices, ranges, exit and stop gates |
| Implementation Backlog | 0.2 | Accepted baseline — Gate 8 | Define epics, features, stories, tasks and authorized tranche |
| Migration, Release, Rollout & Recovery Plan | 0.2 | Accepted — Gate 8 | Define reversible workstreams, rollout and recovery |
| Implementation Testing Strategy | 0.1 | Accepted — Gate 8 | Define testing pyramid, journeys, invariants and ownership |
| Program Governance, Definition of Done & Ownership | 0.2 | Accepted — Gate 8 | Define readiness/done, ownership and change control |
| Decision Gate 8 Review Package | 0.2 | Accepted — Gate 8 | Consolidate implementation decisions, conditions and residual risks |
| Phase 8 Team, Platform & Security Decision Addendum | 0.1 | Accepted — Gate 8 | Record team, GitHub Actions, Docker, local encryption, ownership and responsibility boundaries |
| Product Metrics & Measurement Model | 0.1 | Accepted — Gate 9 | Define SCRR, outcome metrics, telemetry and anti-surveillance guardrails |
| Technical Evaluation Framework | 0.1 | Accepted — Gate 9 | Evaluate capture through security and recovery, not vector similarity alone |
| Gold Dataset & Evaluation Rubrics | 0.1 | Accepted — Gate 9 | Define versioned cases, partitions, scoring and annotation governance |
| User Research & Usability Test Plan | 0.1 | Accepted — Gate 9 | Define participants, tasks, failure states and research integrity |
| Beta Cohort & Experiment Roadmap | 0.1 | Accepted — Gate 9 | Define evidence-based cohort expansion, experiments and stop rules |
| Success Thresholds & Calibration Plan | 0.1 | Accepted — Gate 9 | Define R0/R2/R3 targets, uncertainty and threshold change control |
| Interview Guide & Study Protocols | 0.1 | Accepted — Gate 9 | Define baseline, moderated, debrief and severity protocols |
| Decision Gate 9 Review Package | 0.1 | Accepted — Gate 9 | Consolidate Phase 9 decisions, conditions and residual risks |
| Implementation Readiness — Capacity, Ownership & Recovery | 0.2 | Accepted | Normalize FTE and assign Slice A, security, durable, evaluation, dataset and recovery duties |
| Planning Closure & Implementation Readiness Checklist | 0.2 | Accepted — Gate 10 | Close planning into an implementation-ready boundary with canonical artifacts, authorized scope, owners, assumptions and pre-kickoff blockers |
| Implementation Readiness Week | 0.1 | Accepted — Implementation Readiness | Timebox ownership, repository, security, MemWal, migration and evaluation evidence before Slice A kickoff |

## Status vocabulary

- Draft: authored but not approved.
- Proposed: explicit choice awaiting a decision gate.
- Accepted: approved and currently canonical.
- Superseded: replaced by a later accepted decision.
- Open: requires evidence, mitigation, or an owner.
- Validated / Invalidated: resolved by evidence.

## Planned artifacts

Phases 0–9 are accepted as the Shoo blueprint baseline. Gate 10 accepts ART-82 and declares planning complete for a bounded implementation start without expanding the authorization established by Gate 8: repository scaffolding, approved spikes and Slice A. ART-83 is the accepted five-working-day readiness plan for entering that tranche. Gate 9 permits privacy-reviewed instrumentation, dataset/research preparation and evidence collection within it; none of these decisions establishes observed success, SLA or product-market fit.
