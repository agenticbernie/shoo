# Shoo Planning Closure and Implementation Readiness Checklist

- Version: 0.2
- Status: Accepted — Gate 10
- Owner role: Technical Program Manager / Principal Product Manager / Staff Software Architect
- Dependencies: ART-71 Gate 8 Review Package; ART-80 Gate 9 Review Package; ART-81 Implementation Readiness Capacity, Ownership and Recovery
- Assumptions: ART-81 ownership model is accepted; named allocation, role consent and capability evidence are not yet fully collected
- Unresolved questions: Named owner/deputy confirmation, actual Shoo allocation, capability evidence, recovery drill completion and evidence-based Slice A forecast
- Last decision: Gate 10 accepted; Shoo planning is complete for the bounded implementation start defined by this artifact
- Next action: Enter implementation readiness: confirm named allocation and role consent, execute approved spikes, establish the repository skeleton and prepare Slice A kickoff evidence

## 1. Purpose

ART-82 is the planning-closure artifact for Shoo. It does not add new product scope, architecture, UX, UI or implementation features. Its job is to confirm that the accepted blueprint can be executed without reopening Product DNA, PRD, architecture or UX unless new evidence invalidates an accepted decision.

The planning is considered complete only when this artifact can answer five questions:

1. Which artifacts are canonical?
2. What scope is authorized to start?
3. Who owns each critical workstream and who can cover them?
4. Which assumptions remain open and how will they be validated?
5. What evidence is required before committing dates, expanding scope or claiming success?

## 2. Canonical artifact set

The canonical planning baseline is the approved Phase 0–9 artifact set recorded in the Artifact Registry, with the following closure hierarchy:

| Planning layer | Canonical source | Closure rule |
|---|---|---|
| Product identity, boundaries and goals | Product DNA; Product Scope; PRD Overview | Do not reopen unless customer discovery invalidates core continuation value or buyer assumptions |
| MVP scope | MVP Definition; Feature Prioritization; Deferred & Rejected Features | Solo multi-agent continuation remains the first wedge; team orchestration remains deferred |
| Architecture and contracts | Gate 5 architecture artifacts; API/MCP contracts; schemas; threat model | Implementation must conform to contracts or raise ADR before semantic change |
| UX and UI | Gate 6 and Gate 7 packages; screen/component/state specs | UX changes cannot dilute evidence, citation, authority or durable-state clarity |
| Implementation | Gate 8 artifacts; ART-72 addendum; ART-81 readiness decision | Only repository skeleton, approved spikes and Slice A are authorized initially |
| Evaluation | Gate 9 artifacts | Claims require pre-registered metrics, sealed evaluation discipline and zero-tolerance trust gates |
| Planning closure | ART-82 | Gate 10 decides whether planning is complete enough to start implementation kickoff |

## 3. Authorized implementation boundary after planning closure

Gate 10 should authorize only the implementation start boundary below.

| Boundary | Authorized after Gate 10 | Not authorized by Gate 10 |
|---|---|---|
| Repository | Shoo monorepo skeleton, package boundaries, CI walking skeleton | Production launch, broad service split, microservice extraction |
| Slice A | OpenCode/Codex capture credibility path, normalized events, local spool spike, basic session lifecycle proof | Full Ask Shoo, full Web SaaS, team coordination, autonomous orchestration |
| Migration | Kage/Sensei capability inventory and contract-first mapping | Bulk rename, uncontrolled predecessor data migration, automatic canonical promotion |
| MemWal/Walrus | Manual setup path spike, namespace/delegate guidance, durable job prototype | Durable write for every realtime event, unsupported E2E claims, hidden retention semantics |
| Security | Local encryption spike, secrets policy, break-glass setup, threat-review gates | Restricted-data beta without security review and recovery drill |
| Evaluation | Dataset governance setup, rubric calibration plan, privacy-safe telemetry design | PMF claims, public success claims, unsealed benchmark tuning |

Rationale: Shoo has a large blueprint surface. Implementation must begin with a narrow vertical proof of continuation, not with parallel construction of every planned subsystem.

Trade-off: This slows visible breadth but reduces the risk that the team completes components without proving cross-agent continuation.

Validation: Slice A exit must demonstrate a real or fixture-backed end-to-end supported-client path plus at least one failure/recovery path.

## 4. Role readiness matrix

| Workstream | Proposed accountable owner | Deputy | Gate 10 readiness evidence |
|---|---|---|---|
| Product scope and decision gates | Bernie | BA/frontend | Scope-change rule understood; deferred scope list reviewed |
| Slice A delivery | Backend developer | DevOps engineer | Owner/deputy explicitly accept; Slice A demo path and blockers understood |
| Local/OpenCode trust path | Bernie initially | Backend developer | Transfer plan exists; capture and local-security risks understood |
| Durable Memory / MemWal / Walrus | Cryptography/backend developer | Backend developer | Manual setup spike owner accepts; namespace/delegate/key-loss risks understood |
| Security engineering | Cryptography/backend developer | DevOps engineer | Capability checklist completed or external AppSec review trigger accepted |
| Release, CI/CD, Docker and recovery | DevOps engineer | Backend developer | GitHub Actions/GHCR walking skeleton owner accepts; rollback drill owner named |
| Evaluation program | BA/frontend | Frontend developer | Rubric, consent and sealed-data process owner accepts |
| Sealed dataset custody | DevOps engineer | BA/frontend | Owner/custodian separation understood; two-person unseal rule accepted |
| Research recruitment | Marketing | BA/frontend | Recruit criteria and anti-bias guardrails understood |
| UI implementation | Frontend developer | BA/frontend | MVP screens and deferred routes understood |

If a proposed owner cannot accept or cannot demonstrate the required capability, Gate 10 may still close planning only if the role is remapped or the affected workstream is removed from the authorized tranche.

## 5. Capacity closure checklist

Before committing a Slice A date, the team must fill this table with named people or explicit role labels.

| Contributor | Employment FTE | Shoo allocation % | Focus factor | Effective delivery FTE | Critical responsibilities | Confirmed? |
|---|---:|---:|---:|---:|---|---|
| Bernie | TBD | TBD | 0.50–0.70 recommended | TBD | Sponsor, architecture, local trust, break-glass primary | Open |
| BA/frontend | TBD | TBD | 0.60–0.85 recommended | TBD | Evaluation, UX support, frontend support | Open |
| Frontend developer | TBD | TBD | 0.80–0.85 recommended | TBD | UI implementation, evaluation deputy | Open |
| Backend developer | TBD | TBD | 0.80–0.85 recommended | TBD | Slice A owner, backend contracts, Durable deputy | Open |
| DevOps engineer | TBD | TBD | 0.80–0.85 recommended | TBD | CI/CD, recovery, sealed custody, Slice A deputy | Open |
| Cryptography/backend developer | TBD | TBD | 0.80–0.85 recommended | TBD | Security, encryption, MemWal/Walrus | Open |
| Marketing | TBD | TBD | 0.60–0.80 recommended | TBD | Research recruitment and GTM learning | Open |

Formula:

`effective delivery FTE = employment FTE × Shoo allocation × focus factor`

Planning rule:

- Baseline must not exceed 1.0 FTE per person.
- Temporary surge may be tracked separately up to 1.15 equivalent for at most two weeks, followed by recovery or reforecast.
- No external date should be committed until actual allocation and two weeks of throughput/blocker evidence are available.

## 6. Slice A readiness checklist

Slice A is ready to start only when all critical items below are either complete or explicitly accepted as controlled risks.

| Area | Required before kickoff | Status |
|---|---|---|
| Scope | Slice A outcome statement, non-goals and demo path are reviewed | Open |
| Repository | Monorepo/package skeleton plan approved; no production logic required before kickoff | Open |
| Client path | OpenCode first and Codex second priority reconfirmed | Accepted |
| Events | Normalized session/event contract selected from Gate 5 artifacts | Accepted |
| Local storage | Encrypted SQLite binding/application-encryption spike owner named | Open |
| CI/CD | GitHub Actions and Docker image walking skeleton owner named | Accepted owner model; implementation open |
| MemWal | Manual setup spike and user-owned namespace/delegate guidance owner named | Open |
| Security | Secrets policy, no-production-data rule and local key-handling spike defined | Open |
| Evaluation | Slice A demo acceptance and failure-case rubric prepared | Open |
| Migration | Kage/Sensei inventory order defined before reuse | Open |

## 7. Assumption closure plan

Planning can close while assumptions remain open, but no assumption may be silently treated as fact.

| Assumption | Closure action | Blocks |
|---|---|---|
| ASM-070: 4.0–4.8 effective FTE estimate | Record allocation and compare two-week throughput | Date commitment |
| ASM-071: owner/deputy competence and consent | Capability checklist, explicit acceptance, rehearsal evidence | Slice A kickoff for affected stream |
| ASM-030: MemWal Manual fit | Cross-platform remember/recall/restore and session-key UX spike | R1 durable path |
| ASM-055: cross-platform signed Local package | Windows/macOS/Linux packaging and encrypted spool spike | Slice A exit / R1 updater |
| ASM-061/062: local encryption and metadata safety | Crypto review, tamper tests, metadata inference review | Restricted capture |
| ASM-065/067: SCRR measurement and threshold | Privacy-safe event dictionary, calibration and ≥200 eligible resumes before R3 | Product success claim |

## 8. Risk controls that remain active after planning closure

Gate 10 does not retire risk. It makes risk ownership executable.

| Risk | Control that must survive kickoff |
|---|---|
| Scope creep | Gate 10 authorizes Slice A only; later slices require exit evidence |
| Founder bottleneck | Owner/deputy model and break-glass drill remain mandatory |
| Security debt | Restricted-data beta blocked until security review and recovery drill |
| Evaluation bias | Sealed dataset custody separated from feature implementers |
| Walrus misuse | Durable path remains policy-selected; hot operational state stays off Walrus |
| False success claims | Gate 9 thresholds and zero-tolerance trust failures govern claims |

## 9. Planning completion definition

Shoo planning is complete when:

1. Artifact Registry marks ART-82 as Accepted.
2. Gate 10 acceptance statement is recorded.
3. The authorized implementation boundary is limited to repository skeleton, approved spikes and Slice A.
4. Named owner/deputy/allocation evidence is either recorded or explicitly marked as a pre-kickoff blocker.
5. Open assumptions are linked to validation methods and blocking rules.
6. No Phase 0–9 artifact has unresolved contradiction with ART-81/ART-82.
7. The team understands that planning closure is not product validation, delivery evidence or PMF.

## 10. Gate 10 acceptance record

Accepted on 2026-07-15:

> Gate 10 is accepted. Shoo planning is complete for the bounded implementation start. The team may begin repository skeleton, approved spikes and Slice A readiness work under the accepted Product DNA, PRD, architecture, UX, UI, implementation and evaluation baselines. Gate 10 does not authorize production launch, full team coordination, autonomous orchestration, unrestricted data capture, public success claims or external date commitments without the required evidence.

## 11. Decision matrix

| Option | User value | MVP speed | Reliability | Security | Operational clarity | Reversibility | Recommendation |
|---|---:|---:|---:|---:|---:|---:|---|
| Close planning now without ART-82 | Medium | High | Low | Low | Low | Medium | Reject |
| Keep planning open until all assumptions are validated | Medium | Low | High | High | Medium | Low | Reject |
| Close planning with Gate 10 and controlled pre-kickoff blockers | High | Medium-high | High | High | High | High | Accept |

Decision rationale: Shoo should not keep expanding planning, but it also should not convert unvalidated assumptions into implementation commitments. Gate 10 closes design planning while preserving implementation evidence gates.

## 12. Gate 10 decision

Decision: Accepted. Missing named allocation, consent and capability evidence remain controlled pre-kickoff blockers for their affected workstreams. Recovery, security and evaluation evidence remain pre-exit blockers where specified; approval does not waive them.

The operating mode is now:

- Planning: complete.
- Implementation: authorized only for repository skeleton, approved spikes and Slice A.
- Validation: evidence collection begins but success is not yet claimed.
- Scope expansion: blocked until slice exit evidence and a new decision gate.
