# Shoo Cost Model and Capacity Envelope

- Version: 0.1
- Status: Accepted — Decision Gate 5
- Owner role: Platform Engineer / FinOps Lead / Principal Product Manager
- Dependencies: Deployment Strategy; Retention Policy; Retrieval Design; MemWal/Walrus Design
- Assumptions: Live provider prices and Walrus economics change; R0 pricing must be measured rather than embedded as a fixed architecture fact
- Unresolved questions: Paid plan quotes; chosen embedding/model rate card; Walrus epoch price and expected blob size distribution
- Last decision: Adopt a cost-meter-first approach and defer pricing/plan economics until measured R0–R2 usage
- Next action: Populate the model from official quotes at environment creation and compare actual unit costs weekly

## Decision purpose

The architecture needs a cost envelope, not a prematurely precise monthly number. Provider rates are inputs; the durable decisions are cost units, meters, allocation rules, alert thresholds and reversal conditions.

## Unit economics model

Primary cost unit: **one eligible coding session that produces a trusted checkpoint and one usable later continuation**.

Supporting units:

- active project-month;
- captured session;
- accepted structured memory;
- generated context pack;
- Ask Shoo answer;
- policy-eligible durable write and durable recall;
- GB-month by operational, index, backup and durable class.

## Monthly cost equation

`Total = Fixed platform + Operational DB + Model/embedding + Durable MemWal/Walrus + Storage/backup + Egress + Observability + Identity + Support reserve`

| Driver | Meter | Allocation key | Main control |
|---|---|---|---|
| API/Web/workers | instance-hours, CPU/memory | request and job time | co-location, autoscaling, worker concurrency |
| PostgreSQL | instance, storage, I/O, backup | tenant rows/bytes/query time | retention, indexes, batching, query budgets |
| Embedding | input tokens/characters or local compute | memory/query owner | minimization, caching, local mode |
| Generative model | input/output tokens | extraction/context/Ask operation | typed extraction, budget, model routing |
| Walrus/MemWal | writes, blob bytes, epochs, relayer/chain fees | owner/namespace | eligible data only, batching, compression, retention disclosure |
| Network | regional/cross-region egress | destination class | same-region operations, no raw cloud sync |
| Observability | events, spans, retention | service/environment | sampling, content-safe aggregation |
| Identity | monthly active users or enterprise feature | organization | chosen plan and abstraction layer |

## Required meters

Every billable dependency operation records a content-free usage event with:

- operation type and stage;
- provider/model/version class;
- input/output token or byte bucket;
- cache hit/miss;
- durable epochs and blob-size bucket;
- retry count and success/failure;
- pseudonymous tenant/project allocation key;
- estimated and later reconciled actual cost.

Provider invoices are reconciled against usage events weekly during R0–R2. A gap above 5% blocks confident unit-economics claims.

## Capacity planning assumptions to validate

| Dimension | R0 proof | R1 internal alpha | R2 private alpha | Split/review signal |
|---|---:|---:|---:|---|
| Active users | 1–5 | 5–20 | 20–100 | concurrency/SLO, not user count alone |
| Active projects | 1–10 | 10–50 | 50–300 | tenant isolation and index size |
| Sessions/day | 5–30 | 30–200 | 200–2,000 | worker/outbox age |
| Memories/session | measure | measured p50/p95 | measured p50/p95 | extraction/correction burden |
| Vector rows | `<100k` expected | `<500k` expected | benchmark to 3M | ART-35 vector triggers |
| Async jobs/sec | low burst | measure | load-test to 50/s | ART-35 broker triggers |

Numbers are test envelopes, not demand forecasts.

## Cost guardrails

- Core continuity remains available even if optional Ask/explanation budget is exhausted.
- Retry storms must be bounded by exponential backoff, attempt ceilings and circuit breakers.
- No raw transcript/source durable write by default.
- Context packs have explicit token budgets; retrieval deduplicates before model calls.
- Embeddings are reused by content hash, model version and policy scope where permitted.
- Durable batching is used only when it preserves independent idempotency and user-visible state.
- Cost anomaly alert fires when cost per successful continuation exceeds its rolling forecast band by 30%.
- A plan limit may degrade optional generation but cannot silently reduce provenance, authorization or citation requirements.

## Embedding cost/privacy policy

R0 uses a cloud embedding provider only for policy-eligible minimized text with explicit disclosure. Shoo keeps a provider-neutral embedding port and records model/version/dimension. R1/R2 evaluates local embedding as a privacy mode and potential cost control. A change of model requires re-index compatibility and quality evaluation; it is not a transparent configuration change.

## Pricing readiness gate

Shoo must not set Commercial SaaS packaging from infrastructure estimates alone. Pricing hypotheses require:

1. measured cost per successful continuation at p50 and p95 users;
2. cost distribution by capture, retrieval, Ask and durable route;
3. willingness-to-pay research;
4. team expansion value evidence;
5. a gross-margin range with model and Walrus sensitivity analysis.

## Fitness tests

- COST-FT-01: reconcile provider invoice to internal meters within 5%.
- COST-FT-02: reproduce cost per successful continuation and project-month.
- COST-FT-03: simulate 2× model price, 2× Walrus cost and 3× memory volume.
- COST-FT-04: demonstrate optional workload throttling without harming capture/current truth.
- COST-FT-05: validate PostgreSQL/vector/outbox thresholds with measured resource interference.
