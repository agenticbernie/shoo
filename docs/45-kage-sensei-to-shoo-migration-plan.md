# Kage/Sensei to Shoo Migration Plan

- Version: 0.1
- Status: Accepted — Decision Gate 5
- Owner role: Staff Software Architect / Data Architect / Technical Program Manager
- Dependencies: Repository Evidence Review; Domain Model; Data/Event Schemas; API/MCP Contracts
- Assumptions: Predecessor data may be incomplete, prototype-grade and semantically different; Shoo contracts are authoritative
- Unresolved questions: Quantity and sensitivity of existing predecessor data; whether any external users require in-place migration
- Last decision: Use contract-first strangler migration; no bulk rename or direct flat-record import into canonical Shoo state
- Next action: Build an inventory and fixture corpus, then run a read-only dry migration before implementation cutover

## Migration principles

- Kage and Sensei remain lineage labels only; new runtime/domain names use Shoo.
- Reuse is capability-by-capability behind Shoo ports.
- Source records enter as evidence with provenance and migration confidence, not automatic canonical truth.
- Every transformed row is idempotent, auditable and reversible before cutover.
- No production cutover occurs until old/new paths are compared on the same fixtures and real shadow traffic.
- MemWal versions are pinned; `latest` is removed before reproducible migration tests.

## Ordered migration rehearsal

### M0 — Freeze and inventory

- create immutable source snapshot and dependency lock evidence;
- inventory packages, schemas, MCP tools, endpoints, MemWal versions and stored records;
- classify each capability as reuse, wrap, rewrite, retire or unknown;
- identify secrets/source archives that violate Shoo policy.

Exit: 100% of in-scope source tables/endpoints/packages have an owner and disposition.

### M1 — Semantic mapping

- map Kage session/checkpoint/memory records and Sensei project/intelligence views to Shoo entities/events;
- define `source_system`, `source_id`, `source_version`, confidence and transformation reason;
- document unmappable fields and prohibited imports;
- create golden fixtures for complete, partial, duplicate, contradictory and malformed records.

Exit: mapping review finds no implicit promotion to accepted/canonical state.

### M2 — Contract adapters

- wrap reusable Kage MCP/client and MemWal functions behind Shoo interfaces;
- replace predecessor authentication assumptions with Shoo identity/permission context;
- expose only approved Shoo MCP/API contracts;
- quarantine unsupported predecessor behavior.

Exit: contract/conformance suite passes without predecessor semantics leaking through public contracts.

### M3 — Read-only dry migration

- transform snapshot into an isolated Shoo database;
- preserve source checksums and migration ledger;
- validate counts, scopes, lineage, timestamps, citations and conflict outcomes;
- do not write imported data to Walrus automatically.

Exit: deterministic rerun yields the same target state and exception report.

### M4 — Shadow execution

- route selected OpenCode capture and Codex context requests through old and Shoo paths without exposing new output by default;
- compare capture coverage, context relevance, authority, citations, latency and failures;
- investigate semantic differences rather than forcing byte equality.

Exit: approved difference budget; no critical privacy/authority regression.

### M5 — Vertical cutover

Cut over in product-value order:

1. session start and local capture;
2. checkpoint and operational persistence;
3. Manual durable mapping;
4. cross-agent context retrieval;
5. Web inspection/correction and Ask.

Each slice uses cohort flags and retains a rollback path to the last safe contract-compatible version.

### M6 — Reconciliation and retirement

- reconcile late writes and unresolved exceptions;
- export or retain predecessor source according to policy;
- disable predecessor write paths;
- remove names only after data lineage and support references remain discoverable;
- archive migration reports and rollback expiry decision.

## Data transformation rules

| Predecessor input | Shoo treatment |
|---|---|
| raw transcript/source archive | local/restricted evidence or excluded; never default durable import |
| memory text without authority | extracted memory candidate with migration provenance |
| decision claim | proposed/unverified decision unless independent accepted evidence exists |
| session summary | session-completion evidence; not proof every task completed |
| MemWal locator | validate owner/namespace/package/trust metadata before mapping |
| flat team/project record | resolve tenant/project/visibility explicitly; ambiguous records quarantined |
| duplicate record | retain one target identity plus source aliases and duplicate audit outcome |

## Rollback model

- Before cutover: discard isolated target and rerun.
- During shadow: disable Shoo exposure; preserve both audit streams.
- After a slice cutover: stop new Shoo writes for that slice, export delta, restore previous compatible router; never delete local spools.
- After predecessor retirement: prefer roll-forward from migration ledger; rollback requires an explicit data-loss and security review.

## Migration acceptance tests

- MIG-FT-01: deterministic transformation and checksum ledger.
- MIG-FT-02: duplicate replay creates no duplicate Shoo aggregate/event.
- MIG-FT-03: ambiguous scope/authority is quarantined, not guessed.
- MIG-FT-04: no prohibited raw data crosses cloud/Walrus boundaries.
- MIG-FT-05: old/new contract comparison reports semantic differences.
- MIG-FT-06: one vertical slice rolls back without losing local captured work.
- MIG-FT-07: external Shoo contracts contain no Kage/Sensei product namespace.
