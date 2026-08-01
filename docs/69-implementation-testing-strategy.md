# Shoo Implementation Testing Strategy

- Version: 0.1
- Status: Accepted — Gate 8
- Owner role: QA Architect / Staff Engineers / Security Architect
- Dependencies: PRD Acceptance Criteria; Architecture/UI Fitness Tests; Backlog
- Assumptions: Synthetic and gold fixtures can cover protected content without using customer data
- Unresolved questions: Exact mutation/property test tooling; external penetration-test timing
- Last decision: Organize tests around invariants and vertical journeys, with fewer broad end-to-end tests than component/contract tests
- Next action: Create the test-ID registry, Slice A fixtures and Phase 9 evaluation harness

## Testing pyramid

| Layer | Purpose | Frequency |
|---|---|---|
| Static/architecture | types, boundaries, schemas, tokens, forbidden scope | every change |
| Unit/property | domain invariants, policy, ordering, ranking helpers | every change |
| Component | adapters, UI states, repositories, workers with doubles | every change |
| Contract | HTTP/MCP/events/providers/current-previous versions | PR/main |
| Integration | PostgreSQL/RLS/pgvector/SQLite/provider sandboxes | PR/main |
| Journey E2E | critical activation/resume/correction/export flows | main/release |
| Fitness/resilience | load, crash, outage, restore, security | scheduled/release gate |
| Evaluation | retrieval/context/SCRR/user comprehension | R1–R3/Phase 9 |

## Test environments and data

- Synthetic multi-tenant fixtures with canary secrets and restricted scopes.
- Versioned OpenCode/Codex envelopes including duplicates, gaps and reorder.
- Retrieval gold corpus with current, superseded, conflict, branch and permission cases.
- MemWal test wallet/account/namespace only.
- Predecessor migration fixtures covering malformed/ambiguous/prohibited inputs.
- No production transcript/source is copied into test environments.

## Mandatory vertical journey tests

### Journey A

Install/config preview → trusted project → OpenCode event → encrypted local commit → offline/reconnect → scoped checkpoint candidate.

### Journey B

Checkpoint → operational transaction/outbox → extraction → policy route → Manual remember → verified durable mapping; repeat with provider outage and restore.

### Journey C

OpenCode checkpoint → resolver/filter/rank/pack → Codex delivery → source inspection; repeat with stale/conflict/permission/durable outage.

### Journey D

Web Pulse → Ask → source → correction preview → supersession → cache invalidation → updated MCP/Web truth.

### Journey E

Export/delete/uninstall/update/backup-restore with layer-specific truth and no entitlement or tombstone regression.

## High-risk invariant tests

- Cross-tenant access never succeeds through app, RLS, cache, source drawer or restored backup.
- Agent/retrieved content cannot self-authorize canonicalization/tool mutation.
- Duplicate/out-of-order events converge without evidence loss.
- Session completion never implies work completion.
- Durable confirmation never implies accepted/canonical authority.
- Conflict never resolves by recency/ranking alone.
- Permission/correction/supersession invalidates cached context.
- Cloud/MemWal outage never blocks safe local coding/capture.
- No raw prompt/source/secret/private key appears in telemetry.
- Coordination requirements/routes/components remain absent.

## UI and accessibility testing

- Component state matrix in light/dark and responsive widths.
- Keyboard and screen reader for critical flows.
- 200% zoom, reduced motion, `NO_COLOR` CLI and Vietnamese expansion.
- Visual regression covers empty, partial, stale, conflict, denied, offline and unavailable.
- State comprehension is an evaluation test, not inferred from screenshot equality.

## Performance/capacity tests

- Local capture p95 `<500ms` candidate target.
- Operational sync p95 `<2s`.
- Context retrieval p95 `<5s`.
- Outbox normal job age p95 `<30s`.
- Manual durability p95 `<5m`.
- pgvector benchmark through 3M synthetic vectors and transaction interference.
- Outbox through 50 jobs/s and poison/lease contention.

Targets are Gate 5 beta baselines and may be recalibrated through approved evidence, not silently weakened.

## Test ownership and failure policy

- Story author owns acceptance tests; module owner owns invariant tests; platform/security own fitness gates.
- Failing critical isolation/key/prohibited-content tests block merge/release.
- Flaky critical tests are defects, not rerun-until-green workflows.
- Waiver includes owner, impact, mitigation, expiry and release authority; no waiver for confirmed cross-tenant/private-key leakage.
- Every escaped defect adds a regression test at the lowest effective layer.

## Coverage reporting

Report separately:

- requirement/story coverage;
- architecture/UI fitness coverage;
- line/branch coverage as diagnostic only;
- supported client/OS/version matrix;
- failure-state coverage;
- product-evaluation evidence.

High code coverage does not imply continuation quality or canonical correctness.
