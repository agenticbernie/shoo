# Shoo Observability, SLO and Error Budget Design

- Version: 0.1
- Status: Accepted — Decision Gate 5
- Owner role: Platform Engineer / SRE / Product Analytics Lead
- Dependencies: PRD; Event Model; Component Specifications; Security Threat Model
- Assumptions: R0–R2 traffic is SEA-first; project content must not enter telemetry; initial SLOs are beta operating targets, not contractual SLAs
- Unresolved questions: Baseline traffic distribution; support coverage hours; model-provider latency by region
- Last decision: Initial beta SLOs and a content-safe measurement model are approved as the Phase 5 baseline
- Next action: Implement probes and dashboards in R0, then recalibrate at the R1 evidence review

## Objective

Make every continuity state observable without logging prompts, source code, secrets, raw memory text, embeddings, or decrypted Walrus payloads. Shoo must distinguish fast operational acknowledgement from asynchronous extraction, indexing and durable confirmation.

## Service-level indicators and objectives

| User-visible capability | SLI | R0–R2 target | Measurement boundary | Failure truth shown to user |
|---|---|---:|---|---|
| Local capture acceptance | p95 time from adapter event receipt to encrypted local-spool commit | `< 500 ms` | Shoo Local monotonic clock | `local_saved`, `capture_degraded`, or explicit failure |
| Operational persistence | p95 time from local sync start to committed event + outbox row | `< 2 s` | Local sync client to Shoo API commit | `operational_synced` or queued/offline |
| Context retrieval | p95 time from authorized request to complete cited context pack | `< 5 s` | API/MCP gateway | complete, partial, stale, conflict, or unavailable |
| Outbox freshness | p95 age of ready normal-priority jobs | `< 30 s` | `available_at` to worker claim | pending stage and oldest-job age class |
| Durable confirmation | p95 time from policy-eligible operational commit to verified MemWal/Walrus receipt | `< 5 min` | Outbox creation to verified locator mapping | `durable_pending`, `durable_failed`, or `durable_confirmed` |
| Canonical mutation | p95 authorized accept/supersede commit | `< 2 s` | API receipt to committed revision/event | no optimistic success before commit |
| Availability | successful authorized context requests excluding invalid client requests | `99.5%` monthly beta target | API/MCP edge | degraded context may count only if contract permits it |

These targets protect the coding loop. Durable confirmation does not block session completion, checkpoint creation, or repository work.

## SLO semantics

- SLOs are evaluated per region and per client capability class; OpenCode and Codex are not blended when diagnosing capture completeness.
- Planned maintenance counts against the beta availability objective unless the product is explicitly unavailable only to an internal cohort.
- A request returning stale, superseded, unauthorized, or uncited content is a correctness failure even if HTTP latency is fast.
- A correctly labelled partial pack can be a successful degraded response; an apparently complete pack with missing required stages is not.
- Walrus or model-provider outage is attributed to the dependency but still consumes the Shoo user-journey error budget when it breaks the promised outcome.

## Error budget policy

Monthly beta availability objective `99.5%` yields approximately 3h39m of unavailable journey time in a 30.5-day month. Shoo tracks separate budgets for:

1. capture acceptance;
2. operational sync;
3. context retrieval availability;
4. context correctness/citation coverage;
5. durable confirmation freshness;
6. tenant-isolation and security invariants.

Security isolation has zero discretionary error budget: any confirmed cross-tenant disclosure stops rollout and triggers the incident process.

| Budget state | Condition | Required action |
|---|---|---|
| Healthy | `< 50%` consumed at expected monthly burn | Continue planned delivery |
| Watch | `50–75%` consumed or 2× burn for 6h | Assign owner; suspend related non-critical change |
| Constrained | `> 75%` consumed or 4× burn for 1h | Reliability work takes priority; block risky rollout |
| Exhausted | `>= 100%` or repeated critical correctness breach | Freeze feature rollout; execute recovery review and re-entry gate |

## Content-safe telemetry contract

Allowed dimensions:

- opaque organization/project/session/work-unit IDs using rotating pseudonymous hashes;
- client type and capability-manifest version;
- event type, schema version, stage, status and error class;
- latency bucket, queue age, attempt count, payload-size bucket and token-count bucket;
- policy route, trust mode, durability state and regional/provider class;
- retrieval candidate counts by stage and citation coverage ratio;
- deployment, adapter, contract and migration version.

Forbidden telemetry:

- prompt, response, source code, file contents, path names, memory body or citations;
- plaintext query text, embeddings or vector values;
- wallet/delegate private keys, access tokens or full Walrus locators;
- individual productivity rankings or token/commit/prompt counts used as performance proxies.

## Trace propagation

`trace_id` follows local sync, API transaction, domain event, outbox job, worker operation and durable mapping. `causation_id` and `correlation_id` remain domain fields. Local logs use a short-lived installation pseudonym; cloud traces never require a developer's human-readable identity.

## Required dashboards

1. Continuation funnel: start → checkpoint → operational sync → context request → cited pack → first useful action.
2. Pipeline freshness: extraction, canonical resolution, indexing and durable queues with watermarks.
3. Client health: event coverage and unsupported/degraded states by adapter version.
4. Retrieval quality: filtering loss, conflicts, stale candidate rejection, citation coverage and token-budget utilization.
5. Tenant safety: denied cross-scope probes, RLS failures, privileged-path usage and audit completeness.
6. Dependency health: embedding provider, identity provider, MemWal relayer, Walrus and database.
7. Cost drivers: model tokens, vector rows, database storage/CPU, egress and durable operations.

## Alerts and runbook bindings

| Alert | Initial trigger | Runbook outcome |
|---|---|---|
| Capture loss | eligible event gap or local commit failures exceed baseline | protect spool, disable risky adapter version, expose health warning |
| Outbox lag | p95 age `>30s` for 15m | scale worker, quarantine poison job, apply backpressure |
| Context latency | p95 `>5s` for 15m | inspect resolver/search/model stages; degrade optional explanation first |
| Durable lag | p95 `>5m` for 30m | preserve operational truth, retry with jitter, never switch trust mode silently |
| RLS anomaly | any cross-tenant canary succeeds | stop traffic, revoke affected credentials, incident response |
| Citation regression | required fact coverage falls below release baseline | block retrieval rollout and invalidate affected cache |
| Cost anomaly | unit cost exceeds forecast band by `>30%` | identify dimension, cap nonessential model work, preserve core loop |

## Validation gates

- OBS-FT-01: no forbidden content appears in logs, metrics or traces under adversarial fixtures.
- OBS-FT-02: every async operation can be followed from API commit to terminal state.
- OBS-FT-03: stale/partial/conflict responses are measured separately from complete success.
- OBS-FT-04: alert fires and points to a tested runbook for each critical pipeline stage.
- OBS-FT-05: SLO calculation can be reproduced from raw content-safe telemetry.
