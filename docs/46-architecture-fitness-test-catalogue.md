# Shoo Architecture Fitness Test Catalogue

- Version: 0.1
- Status: Accepted — Decision Gate 5
- Owner role: Staff Software Architect / QA Architect / Security Architect
- Dependencies: All Phase 5 architecture and contract artifacts
- Assumptions: Tests are implemented incrementally by release slice; critical invariants run in CI and production canaries where safe
- Unresolved questions: Exact load fixture distribution and supported OS matrix versions
- Last decision: Gate 5 approval is conditional on binding architectural claims to executable fitness tests
- Next action: Assign tests to R0–R3 backlogs and establish owners

## Test classes

| Class | Purpose | Execution |
|---|---|---|
| Static architecture | package direction, forbidden imports, contract leakage | every CI run |
| Contract/conformance | HTTP, MCP, events, version compatibility | CI and release candidate |
| Data/invariant | RLS, idempotency, ordering, lineage, migrations | CI and staging |
| Resilience | outage, retry, poison job, crash, restore | staging/release gate |
| Security/privacy | isolation, secrets, prompt injection, updater, deletion | CI plus scheduled adversarial review |
| Quality | retrieval, extraction, citations, conflicts | benchmark corpus per candidate |
| Performance/cost | latency, queues, vectors, unit cost | staging/load environment |

## Gate 5 fitness catalogue

| ID | Architectural claim | Test | Release gate |
|---|---|---|---|
| FIT-001 | Module boundaries remain enforceable | dependency graph rejects forbidden cross-domain imports | R0 onward |
| FIT-002 | Public contracts are Shoo-only | schema snapshot finds no Kage/Sensei product namespace | R0 |
| FIT-003 | Capture is idempotent | replay duplicate/out-of-order client envelopes | R1 |
| FIT-004 | Coding continues offline | cloud/Walrus outage with encrypted spool and later reconciliation | R1 |
| FIT-005 | Operational truth is atomic | crash between aggregate/event/outbox operations cannot create divergence | R1 |
| FIT-006 | Tenant isolation is defense-in-depth | application matrix + FORCE RLS adversarial queries | before real users |
| FIT-007 | High-impact truth requires authority | forged tool/agent attempts to canonicalize or cross scope | before real users |
| FIT-008 | Resolver excludes invalid current truth | superseded, future, unauthorized and conflicting corpus | R1/R2 |
| FIT-009 | All surfaces share truth semantics | same query through API, MCP and Web yields equivalent facts/citations | R2 |
| FIT-010 | Context fits budget and remains useful | gold continuation corpus with relevance/citation/token rubric | R2/R3 |
| FIT-011 | Manual durability is non-blocking | MemWal/Walrus delay/failure/retry/restore sequence | R1 |
| FIT-012 | Manual trust boundary holds | plaintext/key inspection across local, cloud, relayer and logs | before real durable data |
| FIT-013 | Local secrets survive safely | vault lock/unlock, crash, OS account and SQLite corruption matrix | R1 |
| FIT-014 | Update chain is trustworthy | tampered manifest/package and signing-key rotation drill | before updater release |
| FIT-015 | Outbox meets beta freshness | worker crash, lease contention, poison job and 50 jobs/s load | R1/R2 |
| FIT-016 | pgvector meets initial envelope | filtered benchmark through 3M vectors and transaction interference | before split decision |
| FIT-017 | Telemetry is content-safe | seeded secret/source fixtures scanned across logs/traces/metrics | every release |
| FIT-018 | Backup/deletion truth survives restore | restore then tombstone replay and access probe | before production beta |
| FIT-019 | Provider portability is real | restore container/schema/export into clean PostgreSQL target | R2 |
| FIT-020 | Migration is reversible | dry-run, replay, shadow comparison and one-slice rollback | before predecessor cutover |
| FIT-021 | SLOs are reproducible | calculate SLI/SLO/error-budget from raw telemetry | R1 |
| FIT-022 | Cost units reconcile | provider invoices vs content-safe usage meters | R1/R2 |
| FIT-023 | Prompt injection cannot gain authority | adversarial repository/memory asks MCP to mutate forbidden state | R2 |
| FIT-024 | Local/cloud version skew is bounded | current/previous client against rolling cloud release | every release |
| FIT-025 | Coordination remains out of MVP | backlog/API/MCP/schema exposure audit against SHOO-FR-301–307 | Gate 5/8 |

## Pass/fail policy

- Critical security, tenant isolation, prohibited-data, canonical-authority and update-signing tests require zero known failure for the release in which they apply.
- Performance tests compare the approved SLO/capacity envelope and record hardware/provider configuration.
- Quality tests use versioned corpora; changing the corpus or rubric creates a new baseline, not a retroactive pass.
- A waived test requires owner, expiry date, affected users, mitigation and rollback condition. No waiver is allowed for confirmed cross-tenant access or private-key leakage.

## Trace to architecture artifacts

- ART-28/29/36: FIT-001–006, 15–16, 24.
- ART-30/37/38/40: FIT-007–010, 23.
- ART-31/34: FIT-003–004, 13–14, 24.
- ART-32/35: FIT-011–12, 18–19, 22.
- ART-41/42/43: FIT-006–07, 12–14, 17–18, 21–24.
- ART-45: FIT-002, 20.
