# Shoo Decision Gate 8 Review Package

- Version: 0.2
- Status: Accepted — Gate 8 (2026-07-15)
- Owner role: Product & Engineering Design Board / Technical Program Manager
- Dependencies: ART-63 through ART-70; accepted Gates 3–7
- Assumptions: Gate 8 authorizes implementation planning baseline and Slice A execution, not full-budget commitment or production launch
- Unresolved questions: Contributor FTE allocation, SQLite/package spike results, second break-glass admin and cost quotes
- Last decision: User confirmed team, GitHub Actions, founder-owned initial accounts, no predecessor production migration and the ART-72 Docker/security responsibility baseline
- Next action: Execute only repository skeleton, approved spikes and Slice A; use Phase 9 evidence gates for later tranches

## Gate recommendation

**Approved: Phase 8 authorizes repository skeleton, timeboxed technical spikes and Slice A implementation.**

Approval recorded on 2026-07-15. This does not authorize later slices, production launch, Team Coordination or autonomous orchestration.

## Implementation decisions proposed

### ADR-IMPL-001 — TypeScript monorepo with pnpm and Turborepo

Use one contract-first monorepo to share schemas and enforce boundaries across Web, API, Worker and Local. Re-evaluate only if measured tooling overhead exceeds integration benefit.

### ADR-IMPL-002 — Four runtime boundaries

Ship `web`, `api`, `worker` and `local`; do not create additional MVP microservices.

### ADR-IMPL-003 — Fastify modular API and Next.js Web candidates

Use Fastify for explicit modular cloud composition and Next.js for Commercial SaaS Web, behind Shoo contracts. Framework-specific logic cannot enter domain packages.

### ADR-IMPL-004 — Typed SQL with authored migrations

Use Kysely-style typed queries and reviewed SQL migrations so RLS, pgvector and migration behavior remain explicit.

### ADR-IMPL-005 — Vertical-slice delivery and authorization by tranche

Deliver Trusted Start, Durable Checkpoint, Cross-Agent Resume, Inspect/Correct/Ask and Beta Hardening. Gate 8 authorizes only foundation spikes and Slice A commitment; later slices require prior exit evidence.

### ADR-IMPL-006 — Contract-first predecessor strangler

Inventory/map/wrap/dry-run/shadow/cut over by slice; no bulk rename, direct canonical import or automatic Walrus rewrite.

### ADR-IMPL-007 — CI gates architecture, security, accessibility and recovery

Package boundaries, contracts, RLS, protected content, OS packaging, Manual durability, UI state and restore tests are release evidence, not optional cleanup.

### ADR-IMPL-008 — One accountable owner per outcome/invariant

Cross-layer work has one slice owner; program metrics measure flow and reliability, never individual activity volume.

### ADR-IMPL-009 — Docker for cloud boundaries, host package for Shoo Local

Build separate Web/API/Worker images and a local development stack; do not use Docker as the default Local distribution or mount host wallets/vaults broadly.

### ADR-IMPL-010 — Application-level AEAD for local sensitive payloads

Encrypt sensitive SQLite payload columns with reviewed libsodium AEAD and OS-vault key custody. Evaluate SQLCipher as optional full-file defense after SPIKE-01.

### ADR-IMPL-011 — GitHub Actions and GHCR

Use GitHub Actions for CI/CD and GHCR for immutable cloud images, with environment protection, pinned actions, SBOM/provenance and digest promotion.

### ADR-IMPL-012 — Organizational account recovery

Bernie is initial owner, but Shoo organization accounts, hardware-backed MFA, documented recovery and additional break-glass admins are required before R2.

### ADR-IMPL-013 — Shared-responsibility security model

Users own wallet/account/namespace/delegates and project choices. Shoo remains responsible for secure defaults, authorization/RLS, policy enforcement, disclosures, retention, incidents and refusal of unsafe configurations.

## Completeness assessment

| Phase 8 output | Artifact | Assessment |
|---|---|---|
| Repository/service/package boundaries | ART-63 | Complete target and dependency rules |
| Engineering/contract standards | ART-64 | Complete baseline and change governance |
| Local development/CI/CD | ART-65 | Complete environment, pipeline, flags and channels |
| Vertical roadmap | ART-66 | Complete R0–R3 slices, ranges and stop gates |
| Backlog | ART-67 | Complete epics/features/stories/tasks/spikes baseline |
| Migration/release/recovery | ART-68 | Complete reversible workstreams and rollout |
| Testing strategy | ART-69 | Complete pyramid, journeys and invariants |
| Program governance/DoD | ART-70 | Complete readiness/done/ownership/change control |

## Conditions before first production candidate

- Confirm contributor FTE, assign named Slice A owners/deputies and estimate the tranche.
- Validate and pin ART-72 initial versions; remove all `latest`.
- SPIKE-01/02/03 resolve encrypted SQLite, client coverage and signed packaging.
- Provider/test tenants and low-value test wallet are isolated.
- RLS, secret-exclusion and architecture fitness tests run in CI.
- No real restricted user data before applicable security/trust gates pass.

## Residual risks

1. MVP remains broad for a small team; 18–26 weeks assumes 4–6 engineers.
2. Cross-platform Shoo Local packaging/encrypted SQLite is unresolved.
3. Fastify/Next.js/Kysely choices require small compatibility spikes, not blind adoption.
4. MemWal Manual and wallet dependencies can dominate Slice B.
5. Code-reuse scope is unknown until M0/M1 inventory; production data migration is removed.
6. Web/UI breadth can delay cross-agent value unless Slice order is enforced.

## Gate 8 acceptance statement

“Shoo’s Phase 8 repository architecture, engineering standards, vertical-slice roadmap, backlog, testing, migration and delivery governance are approved as the implementation baseline. Approval authorizes repository scaffolding, approved technical spikes and Slice A execution only; later slices remain contingent on prior outcome gates, and Team Coordination/autonomous orchestration remain out of scope.”
