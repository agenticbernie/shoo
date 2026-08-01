# Shoo Program Governance, Definition of Done and Ownership

- Version: 0.5
- Status: Accepted — Gate 10 planning closure
- Owner role: Technical Program Manager / Engineering Manager / Product Manager
- Dependencies: Backlog; Roadmap; Engineering Standards; Testing Strategy
- Assumptions: Proposed ART-81 role holders will accept duties and pass capability/rehearsal checks; actual allocation remains open
- Unresolved questions: Contributor names beyond Bernie, actual allocation, capability evidence, on-call schedule and readiness rehearsal results
- Last decision: Gate 10 accepted ART-82 and authorized transition from planning to the bounded implementation start
- Next action: Record named consent/allocation and demonstrate deputy, dataset and recovery readiness before affected kickoff, exit or date commitment

## Ownership model

| Area | Accountable role | Consulted |
|---|---|---|
| Product outcome/scope | Principal Product Manager | UX, architecture, GTM |
| Slice delivery | Technical Program Manager + designated Engineering Lead | All contributing leads |
| Domain/current truth | Staff Software Architect | Data, Memory, Security |
| Local/client trust | Local Platform Lead | Security, DX, adapter owners |
| MemWal/Walrus | Durable Memory Lead | Security, Data, Product |
| Retrieval/evaluation | AI Systems Lead | Product, QA, Data |
| Identity/RLS/privacy | Security Lead | Backend, Platform, Legal |
| UX/UI/accessibility | Design Lead | Frontend, QA, Product |
| Reliability/release | Platform Lead | Security, Support, TPM |

One story may have contributors across layers but only one accountable owner.

Initial role mapping:

- Backend developer: accountable Slice A delivery owner; DevOps engineer is deputy; Bernie is sponsor/escalation;
- Bernie: initial Local/OpenCode trust-path owner; backend developer is deputy, with transfer required as a Slice A outcome;
- Cryptography/backend developer: accountable Durable Memory/MemWal owner and proposed Security owner; DevOps is security deputy and backend is durable deputy;
- BA/frontend developer: accountable Evaluation owner; frontend developer is deputy;
- DevOps engineer: sealed-dataset custodian and release/recovery owner; BA/frontend is custody deputy and backend is release deputy;
- Bernie and DevOps engineer: primary and second break-glass administrators; cryptography/backend becomes recovery trustee before R2 without automatic daily admin;
- Frontend contributors: Web/design-system/accessibility implementation within slice outcomes;
- Marketing: research/recruitment/GTM, outside technical approval.

The sealed dataset has separate owner, custodian, annotator/adjudicator and two-of-three release-approval duties. Feature implementers receive development/calibration cases and aggregate sealed results, not sealed labels before the release window closes.

Before R2, at least two named break-glass organization admins, hardware-backed MFA/recovery evidence and three rehearsed technical deputies are required. Redundancy must not be achieved by sharing private keys. Emergency-admin status does not automatically grant wallet/private-key or sealed-dataset access.

## Definition of Ready — Story

- Authorized requirement/slice and stable ID.
- User/system outcome and non-goal.
- Normal plus relevant failure states.
- Acceptance criteria and test references.
- Dependencies and data/security classification.
- Observability/cost requirements.
- UX/design contract where user-facing.
- Rollout flag/recovery approach for material changes.
- No unresolved decision that would cause substantial rework.

## Definition of Done — Story

- Behavior works end to end in the owning slice path.
- Code reviewed and package boundaries pass.
- Unit/component/contract/integration acceptance tests pass.
- Authorization, RLS and protected-data handling pass where applicable.
- Idempotency, retries, stale version and degraded behavior implemented.
- Content-safe observability and cost meter present.
- Accessibility/responsive states pass for user-facing work.
- API/events/docs/changelog updated.
- Feature flag and rollback/recovery verified.
- No P0/P1 known defect for the outcome; residual risk is recorded.

## Definition of Done — Vertical Slice

- User-observable outcome demonstrated from supported client/interface.
- All required layers integrated; no mocked critical boundary in release evidence unless explicitly R0.
- Architecture/UI fitness tests assigned to the slice pass.
- SLO/correctness/capture/citation evidence collected.
- Failure injection and recovery demonstrated.
- Support/operations runbook exists.
- Decision gate exit criterion is met or stop/pivot decision recorded.
- Feature count does not substitute for outcome evidence.

## Sprint/release governance

- Plan by slice outcome and risk, then stories; do not allocate independent “frontend sprint” and “backend sprint.”
- Review weekly dependency/decision/risk state without individual performance metrics.
- Demo the real vertical path and one failure path.
- Update Assumption Ledger and Risk Register from evidence.
- Architecture/design review occurs at contract or invariant changes, not every minor PR.
- Release review uses error budget, security, migration and recovery evidence.

## Change control

| Change | Authority |
|---|---|
| Story implementation detail within accepted contract | Engineering owner |
| Contract/schema additive compatible change | Module lead + consumer review |
| Public semantic/security/consistency change | ADR + architecture owner |
| UX workflow/state grammar change | Return to Gate 6 owner |
| Visual semantic/accessibility change | Gate 7 design-system governance |
| MVP scope/Coordination entry | New product scope gate |
| Walrus mandatory/trust ownership change | Product + architecture sponsor decision |

## Delivery health metrics

Permitted program metrics:

- slice lead/cycle time;
- blocked/dependency wait;
- CI and environment recovery time;
- change failure/rollback rate;
- escaped defect and test flake rate;
- decision age and unresolved critical risk;
- context recovery/SCRR product outcomes.

Prohibited: individual hours, commits, lines, prompts, tokens or agent usage as performance ranking.

## Gate 8 implementation authorization

Gate 8 approval authorizes repository skeleton, spikes and Slice A backlog execution. It does not authorize all future backlog at once, production launch, Team Coordination, autonomous coordination or infrastructure splits absent trigger evidence.

## Gate 10 planning closure rule

Gate 10 is accepted and declares planning complete for bounded implementation start only. It authorizes the team to move from planning mode into implementation kickoff for repository skeleton, approved spikes and Slice A readiness/execution under the accepted Phase 0–9 baselines.

Gate 10 does not authorize:

- production launch;
- unrestricted real-user data capture;
- full Team Coordination;
- autonomous coordination;
- public success or PMF claims;
- external date commitments without allocation and throughput evidence;
- relaxing security, durable-memory or evaluation gates.

If a team member proposes work outside the Gate 10 boundary, it must enter backlog as deferred scope or return to a scope decision gate.
