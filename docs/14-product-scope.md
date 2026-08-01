# Shoo Product Scope

- Version: 0.2
- Status: Accepted — Decision Gate 3
- Owner role: Principal Product Manager / Technical Program Manager
- Dependencies: Product DNA v0.2.1; Decision Gate 2 workflow baseline; MVP Boundary v0.2.2
- Assumptions: A narrow solo-developer loop can validate the core before full team coordination
- Unresolved questions: Beta cohort size, numeric success thresholds, and paid packaging remain later validation decisions
- Last decision: Sponsor approved the closed-loop MVP scope without amendments
- Next action: Convert accepted scope into Phase 4 requirements

## Scope objective

Prove that Shoo can automatically preserve enough trustworthy project state from an OpenCode work session for Codex to continue the same work unit without manual project-state re-explanation.

## Core hypotheses under test

| ID | Hypothesis | Required evidence |
|---|---|---|
| HYP-MVP-001 | Automatic evidence capture plus semantic checkpoints reduces manual state reconstruction. | OpenCode session produces a useful checkpoint without “remember this” behavior. |
| HYP-MVP-002 | A source-backed context pack enables cross-agent continuation. | Codex begins useful work on the correct work unit without manual recap. |
| HYP-MVP-003 | Provenance, authority, freshness, and correction create sufficient trust. | User can explain why a memory is included, correct it, and observe changed future context. |
| HYP-MVP-004 | MemWal/Walrus can provide mandatory durable memory without blocking active coding. | Durable write, retry, restore, and degraded paths preserve continuity. |
| HYP-MVP-005 | Minimal Shoo Web inspection is necessary to govern automatic capture. | User can inspect activity, decisions, unfinished work, sources, policy, and correction state. |

## In-scope user outcome

The MVP is complete only when this entire path works:

1. Developer signs in, links one project, and reviews an effective safe sync policy.
2. OpenCode adapter and Shoo MCP show healthy or explicitly degraded capability.
3. Developer creates or confirms a Shoo work unit.
4. OpenCode work produces permitted evidence and a semantic checkpoint.
5. Structured memory retains provenance, authority, scope, and supersession state.
6. Operational state syncs independently from mandatory durable MemWal/Walrus persistence.
7. Codex identifies the work unit and receives a cited context pack.
8. Developer does not manually restate project state before the first useful action.
9. User inspects and corrects a wrong memory in Shoo Web.
10. A later context pack and Ask Shoo response respect the correction.

## MVP product surfaces

### Required

- Shoo local runtime and client adapters.
- Shoo MCP interface for agent context and explicit workflow actions.
- Hosted Shoo control plane and operational sync.
- MemWal/Walrus durable-memory path.
- Minimal Shoo Web for inspection, sources, correction, policy, and project state.

### Explicitly not independent products

- OpenCode adapter, Codex adapter, MCP, Web, and durable adapter are Shoo delivery surfaces.
- Kage and Sensei remain predecessor lineage and do not survive as separate product tiers.

## MVP scope guardrails

- One developer per project in the initial product UX.
- OpenCode capture first; Codex continuation second.
- No promise of symmetric event parity between clients.
- Team-ready identity/scope fields exist in the model, but team administration UX is deferred.
- Raw transcript is evidence only and local by default.
- Raw source code is not written to Walrus by default.
- High-impact agent claims cannot become canonical automatically.
- Durable persistence failure cannot block coding or erase a valid local checkpoint.
- Ask Shoo remains project-scoped, cited, and evidence-limited.

## In scope for MVP

| Capability group | Included outcome |
|---|---|
| Setup and trust | Authentication, project linking, adapter/MCP health, effective policy preview |
| Work continuity | Work unit identity, session lifecycle, checkpointing, interrupted recovery |
| Capture | OpenCode events, Codex hooks, normalized evidence, local exclusions and redaction |
| Memory | Narrow extraction, provenance, authority, supersession, basic contradiction handling |
| Sync and durability | Operational outbox, policy routing, MemWal jobs, retry, reconciliation, restore awareness |
| Retrieval | Structured + semantic retrieval, recency/authority ranking, cited token-bounded packs |
| Resume | Work-unit match and OpenCode-to-Codex continuation |
| Web governance | Project overview, activity/session timeline, decisions, unfinished work, sources, correction |
| Ask Shoo | Current-state/history/rationale questions with fact/inference/suggestion labels |
| Operability | Capture completeness, audit events, telemetry, export/deletion states, failure visibility |

## Schema-ready but not product-complete

- organization, team, member, role, visibility scope;
- owner and temporary owner;
- dependencies, handoffs, blockers, conflicts;
- branch/worktree and external issue links;
- sharing/promotion lineage;
- policy version and authority grant.

Schema-ready means identifiers and invariants must not block later expansion. It does not authorize team screens, critical-path logic, or enterprise administration in MVP.

## Deferred beyond MVP

- Full team member/role administration.
- Team shared-memory promotion UX beyond minimal schema and test fixtures.
- Handoff workflow between developers.
- Dependency graph visualization.
- Critical path and team pace.
- Notifications, approval routing, and escalations.
- Git provider, issue tracker, Slack, and broad integration catalogue.
- Additional coding-agent adapters.
- Enterprise SSO, SCIM, compliance exports, and advanced billing.
- Self-hosted control plane.

## Rejected

- General chatbot.
- Flat transcript archive as project memory.
- All realtime events written to Walrus.
- Autonomous task assignment or project orchestration.
- Individual productivity scores.
- Token, incentive, or blockchain-facing product UX.
- Universal agent support in the first release.
- Automatic canonicalization of high-impact decisions.

## Scope change rule

A feature can enter MVP only if it is required to complete the accepted continuation journey, reduce a Critical/High risk on that journey, or measure the core hypothesis. New scope must name its JTBD, scenario, dependency, acceptance outcome, and displaced work.
