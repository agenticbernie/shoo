# Shoo Implementation Readiness Week

- Version: 0.1
- Status: Accepted — Implementation Readiness
- Owner role: Technical Program Manager / Slice A Delivery Owner
- Dependencies: ART-63–72 Implementation baseline; ART-81 Capacity, Ownership and Recovery; ART-82 Planning Closure
- Assumptions: The team can reserve five consecutive working days for readiness work; role assignments remain subject to named-person consent and capability evidence
- Unresolved questions: Calendar start date, contributor names beyond Bernie, actual Shoo allocation, security capability assessment and cross-platform spike results
- Last decision: Founder approved creation and execution of the Implementation Readiness Week after Gate 10 on 2026-07-15
- Next action: Schedule Day 1, collect allocation and role acceptance, and open the readiness evidence board

## 1. Outcome

The week exists to make the authorized Slice A tranche executable. It does not add product scope and it does not attempt to deliver the Shoo MVP in five days.

At the end of the timebox, the team must be able to answer with evidence:

1. Who owns and covers every Slice A trust-critical workstream?
2. Can the repository, CI and packaging skeleton support the first vertical slice?
3. Is there a credible cross-platform local encryption path?
4. Can a user-owned MemWal Manual namespace/delegate path be exercised safely?
5. Are predecessor capabilities mapped to Shoo contracts before code reuse?
6. Is the Slice A demo, failure path and evaluation rubric precise enough to start implementation?

The valid exit decisions are `GO`, `CONDITIONAL GO`, or `NO-GO`. Completion of activities without their required evidence is not readiness.

## 2. Scope boundary

### Authorized

- Named allocation and owner/deputy confirmation.
- Repository skeleton and package-boundary fitness checks.
- GitHub Actions CI walking skeleton.
- Docker image spike for Shoo cloud/runtime services; Shoo Local remains host-native by default.
- Windows, macOS and Linux local encrypted-spool spike.
- OpenCode-first and Codex-second adapter contract fixtures.
- Normalized session/event contract selection and conformance fixtures.
- MemWal Manual account, namespace, delegate and remember/recall/restore spike.
- Kage/Sensei predecessor capability inventory and Shoo contract mapping.
- Slice A evaluation rubric, privacy-safe event dictionary and failure cases.
- Break-glass, secrets and recovery procedure preparation or rehearsal where accounts are ready.

### Not authorized

- Production launch or production-data migration.
- Full Ask Shoo, Web SaaS or Team Coordination implementation.
- Autonomous coordination.
- Unrestricted capture of source, prompts, secrets or raw transcripts.
- Bulk renaming or copying predecessor code before contract mapping.
- Public success, SLA, PMF or external delivery-date claims.

## 3. Working cadence

Use five consecutive working days. A candidate window is 2026-07-20 through 2026-07-24, subject to explicit contributor allocation; it is an internal planning window, not an external commitment.

| Cadence | Purpose | Required output |
|---|---|---|
| Day 1 kickoff, 60–90 minutes | Confirm scope, allocation, ownership and evidence locations | Signed role/allocation matrix; blocker board; accepted Slice A outcome/non-goals |
| Daily 15-minute readiness sync | Surface dependency and decision blockers | Updated evidence links and blocker age; no individual productivity scoring |
| Daily technical review, maximum 30 minutes | Decide only contract, security or spike questions | Decision or ADR with owner and reversal condition |
| Day 5 readiness review, 90 minutes | Evaluate exit evidence | GO / CONDITIONAL GO / NO-GO record and next tranche authorization |

Async evidence is canonical. Meetings do not substitute for test output, fixtures, runbooks or explicit acceptance.

## 4. Day-by-day execution plan

### Day 1 — Ownership, capacity and Slice A contract

Accountable: Backend developer as Slice A owner. Deputy: DevOps engineer. Sponsor: Bernie.

Work:

- Record each contributor's employment FTE, Shoo allocation, focus factor and effective delivery FTE.
- Obtain explicit owner/deputy acceptance for Slice A, Local trust, Security, Durable Memory, Evaluation, Release/Recovery and dataset custody.
- Review Slice A outcome: a supported Agent A session produces normalized, protected evidence that a supported Agent B can use to resume with sufficient context.
- Freeze Slice A non-goals and choose one demo repository/fixture.
- Select the canonical session/event contracts from Gate 5.
- Create the readiness blocker board with severity, owner, deputy, evidence and deadline.

Evidence:

- Completed ART-82 capacity and readiness tables or an attached execution record.
- Named RACI acceptance.
- Slice A outcome, non-goals, demo path and stop conditions.
- No external date commitment.

### Day 2 — Repository, CI, Docker and Local security spikes

Accountable: DevOps for CI/release; Bernie for Local trust; Crypto/backend for encryption review.

Work:

- Establish the pnpm/Turborepo skeleton and approved package ownership boundaries from ART-63.
- Add GitHub Actions walking-skeleton checks for install, formatting/lint, typecheck, unit tests and build.
- Produce a minimal Docker image for eligible server/runtime packages and record why Shoo Local is not container-first.
- Spike the encrypted local spool on Windows, macOS and Linux using application-level AEAD as the baseline; evaluate SQLCipher only as an optional defense if bindings are reliable.
- Verify OS vault/keychain integration boundaries, fail-closed behavior, tamper detection and content-safe logs.

Evidence:

- Green walking-skeleton CI on the supported matrix or a documented platform blocker.
- Reproducible Docker build plus SBOM/provenance plan.
- Encryption spike matrix covering install/build, key retrieval, write/read, tamper, crash/restart and migration.
- Decision record naming the selected R0 path and reversal trigger.

### Day 3 — MemWal Manual, client contracts and predecessor inventory

Accountable: Crypto/backend for Durable Memory; Bernie for OpenCode; Backend developer for contract mapping.

Work:

- Exercise the user-owned MemWal Manual flow: account/wallet readiness, namespace creation, constrained delegate, encrypted remember, recall and restore.
- Draft the user guide for wallet/account, namespace, delegate scope, revocation, key loss and recovery acknowledgment.
- Create OpenCode-first and Codex-second capability fixtures without claiming behavioral symmetry.
- Validate normalized start/checkpoint/complete/fail event envelopes and idempotency keys.
- Inventory Kage and Sensei predecessor capabilities and map each item to `reuse`, `adapt`, `rewrite`, `retire` or `unknown` against Shoo contracts.

Evidence:

- MemWal round-trip transcript with secrets and identifiers redacted.
- Namespace/delegate/revocation/recovery checklist.
- Client capability manifests and contract fixtures.
- Kage/Sensei-to-Shoo mapping with no uncontrolled code import.

### Day 4 — Integrated dry run, recovery and evaluation readiness

Accountable: Backend developer for dry run; BA/frontend for evaluation; DevOps for recovery; Crypto/backend for security.

Work:

- Run a fixture-backed path from session event through local protected spool, normalization and policy-selected durable job boundary.
- Inject at least: duplicate event, out-of-order event, unavailable MemWal/Walrus, invalid delegate, corrupted spool record and unverified agent claim.
- Verify that unavailable durability does not falsely report durable success or block safe local coding work.
- Prepare the Slice A acceptance rubric, privacy-safe telemetry dictionary and evidence-report template.
- Rehearse deputy recovery and break-glass procedures where accounts are available; otherwise record the missing rehearsal as a blocking item for its release stage.

Evidence:

- Dry-run trace with correlation IDs and content-safe logs.
- Failure-injection results and recovery behavior.
- Slice A scoring rubric separating fact, inference, suggestion, authority and durability status.
- Recovery rehearsal result or explicit stage blocker.

### Day 5 — Readiness review and Slice A authorization

Accountable: Bernie as gate sponsor. Evidence owners: Slice A, Security, Durable Memory, Evaluation and Release/Recovery owners.

Work:

- Review the evidence matrix; do not accept verbal completion.
- Classify unresolved items by `pre-kickoff`, `pre-exit`, `pre-R1`, or `backlog`.
- Recalculate effective delivery FTE and create only an internal forecast range.
- Decide GO, CONDITIONAL GO or NO-GO.
- If GO, authorize the first Slice A implementation iteration and its demo date internally.
- If NO-GO, timebox remediation or reduce the supported platform/client boundary through an ADR.

Evidence:

- Signed readiness decision.
- Updated Assumption Ledger, Decision Log and Risk Register references.
- Slice A iteration objective, owner, deputy, acceptance tests and stop conditions.

## 5. Workstream ownership and deliverables

| Workstream | Accountable | Deputy | Week deliverable |
|---|---|---|---|
| Slice A integration | Backend developer | DevOps engineer | Demo contract, integrated dry run, kickoff decision |
| Local/OpenCode trust path | Bernie initially | Backend developer | Capture boundary and capability fixture; transfer plan |
| Security/encryption | Crypto/backend developer | DevOps engineer | Cross-platform encryption decision and threat checks |
| MemWal/Walrus | Crypto/backend developer | Backend developer | Manual round trip and user-owned setup/recovery guide |
| CI/CD, Docker, recovery | DevOps engineer | Backend developer | Green skeleton CI, Docker proof and recovery evidence |
| Evaluation | BA/frontend | Frontend developer | Acceptance rubric, event dictionary and evidence template |
| UI readiness | Frontend developer | BA/frontend | Only UI contracts needed by Slice A evidence; no broad Web build |
| Research/GTM | Marketing | BA/frontend | Candidate research list and claim guardrails; no launch campaign |

An assignment is effective only after the named person accepts it. Role labels in this artifact are proposals until that evidence exists.

## 6. Evidence board schema

Every readiness item must contain:

- stable ID;
- workstream;
- requirement or risk reference;
- accountable owner and deputy;
- status: `not-started`, `in-progress`, `passed`, `failed`, `blocked`, or `waived-by-ADR`;
- evidence link or artifact;
- observed result and environment;
- blocker severity and stage blocked;
- decision/reversal condition;
- last-updated timestamp.

Do not store secrets, raw private repository content, wallet keys, recovery codes or sealed dataset cases in the evidence board.

## 7. Exit criteria

### GO

All must be true:

- Slice A scope, contracts, demo path and owners are accepted.
- Critical workstreams have named owners and deputies.
- Repository and CI walking skeleton is reproducible.
- At least one credible local encryption path works on the supported R0 platform boundary; unsupported platforms are explicit.
- MemWal Manual remember/recall path and user-owned authority model are demonstrated or isolated behind a clearly staged pre-R1 blocker without false durable claims.
- Kage/Sensei reuse is contract-mapped.
- Duplicate, out-of-order and unavailable-durability behaviors are defined and exercised at fixture level.
- Evaluation rubric and privacy-safe evidence capture are ready.
- No unresolved critical secret, cross-tenant, canonical-authority or key-custody defect.

### CONDITIONAL GO

Allowed only when every remaining item:

- has an owner, deputy and deadline;
- is classified as pre-exit or later, not pre-kickoff;
- cannot create secret leakage, false canonical truth, false durability, tenant leakage or unrecoverable key risk;
- has a contained fallback path.

### NO-GO

Required when any of the following is true:

- Slice A lacks an accountable owner or sufficient allocation.
- Local evidence cannot be protected on the declared supported platform.
- MemWal Manual authority/key behavior is materially unknown and cannot be isolated.
- Repository/client contracts conflict with accepted Gate 5 semantics.
- Testing cannot distinguish queued, persisted, verified and canonical states.
- The team attempts to expand into Web breadth, Team Coordination or production launch to compensate for missing continuation evidence.

## 8. Metrics for the week

Use readiness and flow metrics only:

- critical readiness items passed / total;
- blocker count and age by workstream;
- owner/deputy acceptance coverage;
- supported-platform spike coverage;
- contract fixture pass rate;
- failure/recovery cases exercised;
- decisions with evidence and reversal conditions.

Do not use hours worked, commits, lines of code, prompts, tokens or agent usage to evaluate individuals.

## 9. Risks and controls

| Risk | Control | Validation |
|---|---|---|
| Readiness week becomes a hidden implementation sprint | Timebox work to skeleton, spikes, contracts and evidence | Scope audit at daily sync and Day 5 |
| Founder becomes execution bottleneck | Backend owns Slice A; deputies must execute evidence | Owner acceptance and recovery handoff |
| Cross-platform spike consumes the week | Declare R0 platform boundary and record reversal trigger | Day 2 decision deadline |
| MemWal demo hides user key/recovery risk | Include delegate revocation and key-loss state | Recovery checklist and negative test |
| Green CI is mistaken for product progress | Day 5 decision requires integrated continuation evidence | Evidence matrix review |
| Conditional GO becomes permanent exception | Stage, owner and deadline required; no trust-critical waiver | Follow-up gate audit |

## 10. Readiness Week decision rule

Recommended operating decision:

> Execute one five-working-day Implementation Readiness Week. Authorize only the artifacts, spikes and walking skeleton necessary to make Slice A executable. At Day 5, issue GO, CONDITIONAL GO or NO-GO using evidence. Do not expand scope, commit an external date, or claim product validation.

This artifact is accepted as the immediate operating plan after Gate 10. It does not itself assert that any readiness criterion has passed.
