# PRD — Shoo Coordination

- Version: 0.2
- Status: Accepted planning baseline — not authorized for MVP implementation
- Owner role: Principal Product Manager / Distributed Systems Architect
- Dependencies: PRD Overview; Scenario 4; Deferred Feature Catalogue
- Assumptions: Coordination value depends on validated shared memory, work units, permissions, and dependency data
- Unresolved questions: Team design partners; blocker/dependency precision; permission and ownership workflows
- Last decision: Sponsor approved Coordination as deferred; SHOO-FR-301–307 remain unauthorized
- Next action: Preserve only schema, security, and anti-surveillance invariants during Phase 5

## Executive summary

Shoo Coordination will eventually help teams understand blockers, dependencies, handoffs, parallel work, and critical paths without ranking individual performance. Gate 3 explicitly deferred its product workflows. This PRD records future intent and schema constraints only; it is not an MVP commitment.

## Future users

- team developer;
- maintainer/technical lead;
- temporary inheritor;
- authorized cross-team collaborator.

## Future goals

- Identify who/what is waiting on what.
- Distinguish local and critical-path blockers.
- Support handoff and takeover.
- Suggest parallel/fallback work without autonomous assignment.
- Measure system flow rather than human productivity.

## Non-goals

- Employee monitoring or ranking.
- Automatic task assignment.
- Meeting replacement claims.
- Critical-path computation from incomplete/unverified dependencies.
- Team workflow in Shoo MVP.

## MVP schema constraints

| ID | Requirement | MVP status | Acceptance criteria | Trace |
|---|---|---|---|---|
| SHOO-DATA-301 | Core domain records shall allow optional organization, team, member, owner, role, visibility, blocker, dependency, handoff, and conflict references without enabling team behavior. | Schema-only | Solo fixtures validate with explicit null/absent relationships; no team endpoint/screen is required or reachable. | PROB-04; SCN-02/04; TEAM/COORD future; TC-COORD-001 |
| SHOO-SEC-301 | Future team visibility and authority shall remain independent constraints. | Invariant | Domain review prevents “visible = canonical” and “canonical = visible to all.” | PROB-04; GOAL-03; SCN-02; TC-COORD-002 |
| SHOO-NFR-301 | MVP telemetry shall not create individual productivity metrics that later Coordination could expose. | Guardrail | Data inventory contains no token/prompt/hour/code-volume performance score. | PROB-04; SCN-04; TC-COORD-003 |

## Future functional requirements — not MVP authorized

| ID | Future requirement | Re-entry evidence required | Trace |
|---|---|---|---|
| SHOO-FR-301 | Create/confirm/dismiss blocker with type, severity, evidence, owner, and scope. | Reliable solo work/blocker memory and team design partner | PROB-04; GOAL-03; SCN-04; COORD-002; TC-COORD-101 |
| SHOO-FR-302 | Link work-unit dependencies and distinguish hard/soft/information/approval/external/cross-team blockers. | Dependency capture precision benchmark | PROB-04; SCN-04; COORD-001/002; TC-COORD-102 |
| SHOO-FR-303 | Compute affected work without treating one blocker as team-wide by default. | Verified dependency graph and impact evaluation | PROB-04; SCN-04; COORD-001/002; TC-COORD-103 |
| SHOO-FR-304 | Suggest parallel work, provisional interface, mock, fallback, handoff, temporary owner, or escalation. | Acceptable suggestion quality and constraint checks | PROB-04; SCN-04; COORD-003; TC-COORD-104 |
| SHOO-FR-305 | Create a handoff pack with objective, state, decisions, evidence, risks, and next action. | Cross-agent continuation and team handoff research pass | PROB-04; SCN-02/04; TEAM-003; TC-COORD-105 |
| SHOO-FR-306 | Measure handoff latency, blocked time, dependency wait, context recovery, WIP, stale work, and conflict rate. | Governance review and anti-surveillance usability test | PROB-04; SCN-04; COORD-004; TC-COORD-106 |
| SHOO-FR-307 | Compute and explain critical path only from sufficiently verified dependencies. | Dependency completeness/accuracy thresholds | PROB-04; SCN-04; COORD-004; TC-COORD-107 |

## Permission requirements for future re-entry

- Personal evidence may support a shared claim without exposing private source.
- Only authorized roles may accept project-level decisions or change shared ownership.
- Revocation invalidates future context/handoff access.
- Cross-team dependencies expose the minimum permitted metadata.

## Future telemetry boundary

Allowed flow metrics:

- handoff latency;
- blocked time;
- dependency wait;
- context recovery time;
- cycle time;
- WIP and stale work;
- conflict rate;
- continuation success.

Prohibited inference:

- productivity from tokens, prompts, online hours, commits, or code volume;
- individual ranking or performance score;
- private session surveillance.

## Rollout condition

No future Coordination requirement may enter implementation until:

1. Gate 3 scope is formally superseded;
2. solo continuation meets approved evaluation thresholds;
3. permission/visibility model is approved;
4. team discovery validates the workflow;
5. a new scope/PRD gate authorizes the release.

## Risks

- Schema-ready fields become premature services/UI.
- Inferred blockers are false or politically harmful.
- Flow metrics become employee surveillance.
- Suggestions violate architecture or ownership constraints.
- Critical path creates false certainty.

## Open questions

- Team buyer and design partners.
- Ownership/approval semantics.
- Dependency evidence and confidence thresholds.
- Cross-team visibility minimums.
