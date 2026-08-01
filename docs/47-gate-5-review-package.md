# Shoo Decision Gate 5 Review Package

- Version: 0.2
- Status: Accepted — Decision Gate 5
- Owner role: Product & Engineering Design Board / Technical Program Manager
- Dependencies: ART-28 through ART-46; accepted PRD and Gate 3 scope
- Assumptions: Architecture approval authorizes UX architecture and implementation planning inputs, not production launch
- Unresolved questions: Empirical R0–R2 results, provider quotes, final embedding vendor/model and final identity contract
- Last decision: User approved Gate 5 without amendments
- Next action: Use the accepted architecture as the constraint baseline for Phase 6 UX and later implementation planning

## Gate recommendation

**Approve Phase 5 architecture with implementation evidence conditions.**

This means the architecture is sufficiently defined to begin Phase 6 UX Architecture and later Phase 8 vertical-slice planning. It does not assert that latency, cost, retrieval quality, MemWal UX or migration safety have already been empirically validated.

## Approved decision baseline

1. Modular cloud core + workers + separate Shoo Local trust boundary.
2. PostgreSQL operational truth, encrypted SQLite local spool, pgvector first.
3. Transactional aggregates + event ledger + outbox; no full event sourcing.
4. Strong authority mutations; eventual extraction/index/durability.
5. Canonical resolution before retrieval; one truth path across MCP/API/Web.
6. MCP is access plane; native hooks/plugins are automatic capture plane.
7. MemWal Manual default; no silent Managed fallback.
8. User owns wallet, MemWal account, namespace and revocable delegates.
9. App authorization + PostgreSQL FORCE RLS with non-bypass runtime role.
10. OS vault + encrypted SQLite; wallet signer default; headless uses separate low-value Shoo Memory Wallet.
11. Specialized vector store/broker only after measured triggers.
12. Singapore-first provider-portable R0–R2 deployment.
13. Hybrid embedding policy: disclosed cloud embedding at R0 for eligible minimized data; local privacy mode evaluated R1/R2; provider-neutral port.
14. Clerk is the R0–R2 Commercial SaaS identity provider behind a Shoo identity abstraction.
15. Cost-meter-first; pricing requires measured successful-continuation economics.
16. Beta SLOs: local capture `<500ms`, operational sync `<2s`, context p95 `<5s`, outbox p95 `<30s`, Manual durability p95 `<5m`.
17. Signed manual updater at R0; prompted signed auto-update from R1; no silent MVP update.
18. Contract-first strangler migration with dry-run, shadow comparison and vertical cutover.

## Architecture completeness review

| Area | Evidence | Gate assessment |
|---|---|---|
| Product/requirement trace | ART-20–27 | Complete for MVP scope |
| Context/container/component | ART-28, 39 | Complete for planning; benchmarks pending |
| Domain/data/events/consistency | ART-29, 36 | Complete baseline; migrations need implementation proof |
| Memory/retrieval/conflict | ART-30, 40 | Complete design; quality thresholds require corpus evidence |
| MCP/API/client contracts | ART-31, 37, 38 | Complete MVP surface; conformance implementation pending |
| MemWal/Walrus trust and ownership | ART-32–35 | Explicit and non-custodial; Manual UX/cost proof pending |
| Security/privacy | ART-33, 34, 41 | Threat baseline complete; release gates are mandatory |
| Deployment/observability/cost | ART-35, 42–44 | Operating model complete; provider figures measured later |
| Migration | ART-27, 45 | Ordered, reversible plan; source inventory pending |
| Validation | ART-46 | Claims bound to fitness tests |

## Conditions carried into implementation

- R0 cannot use real restricted user data until FIT-006, 012 and 017 pass.
- R1 cannot claim reliable continuity until FIT-003–005, 011, 013, 015 and 021 pass.
- R2 cannot expand private alpha until truth consistency, governance, updater and restore tests pass.
- R3 cannot launch beta until Phase 9 approves outcome/quality thresholds and SCRR shows improvement over baseline.
- Team Coordination requirements remain documentation-only until a new scope gate supersedes Gate 3.

## Known residual risks

1. Manual MemWal wallet/recovery friction may undermine first value.
2. Cloud embedding weakens the local-plaintext privacy story unless disclosure and policy are clear.
3. Cross-client automatic capture remains asymmetric and version-sensitive.
4. The trustworthy MVP is broad across local, cloud, Web, model and durable boundaries.
5. Solo adoption may validate usage without validating Commercial SaaS willingness to pay.

## Gate choices

- **Approve:** accept ADR-ARCH-001–018 and authorize Phase 6.
- **Approve with conditions:** accept architecture but add named pre-Phase-6 clarification(s).
- **Revise:** identify the ADR or artifact and the acceptance issue; do not reopen unrelated accepted scope.

## Gate 5 acceptance statement

“Shoo’s Phase 5 AICD baseline is approved as the target architecture for UX Architecture and vertical-slice implementation planning. Empirical fitness, cost and product-quality claims remain gated by ART-46 and Phase 9; approval does not authorize team coordination scope or production launch.”
