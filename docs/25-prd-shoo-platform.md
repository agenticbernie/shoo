# PRD — Shoo Platform

- Version: 0.2
- Status: Accepted — Decision Gate 4
- Owner role: Platform Engineer / Security Architect / MCP Protocol Architect / Principal Product Manager
- Dependencies: PRD Overview; Core/Memory/Intelligence PRDs; Repository Evidence Review
- Assumptions: OpenCode plugin and Codex hooks can emit sufficient evidence; MemWal remains mandatory and beta
- Unresolved questions: Hosted topology; auth provider; local runtime packaging; encryption mode; exact MCP contracts
- Last decision: Sponsor approved Platform behavior requirements and failure semantics
- Next action: Define containers, adapters, durability workflow, trust modes, and operational boundaries in Phase 5

## Executive summary

Shoo Platform provides local capture adapters, MCP access, authentication, policy enforcement, operational synchronization, MemWal/Walrus durable persistence, compatibility/recovery, Web/control-plane access, audit, observability, export, and rollout controls.

## Goals

- Connect OpenCode and Codex without pretending capability parity.
- Keep secret filtering and safe policy decisions at the proper trust boundary.
- Maintain operational progress when network/durable dependencies fail.
- Persist eligible durable memory through MemWal/Walrus truthfully.
- Operate a secure Commercial SaaS with measurable rollout and recovery.

## Non-goals

- Final container/service/database design.
- Exact MCP JSON schemas or HTTP API contracts before AICD.
- Full enterprise identity or self-hosting.
- Exposing Walrus/blockchain terminology in default UX.
- Using Walrus as realtime operational state.

## Platform requirements

| ID | Requirement | Priority | Acceptance criteria | Trace |
|---|---|---|---|---|
| SHOO-PLATFORM-001 | Shoo shall provide an OpenCode adapter that declares supported events/capabilities and emits normalized evidence. | P0/A-B | Supported fixture emits session/message/file/tool/todo evidence; unsupported capability is explicit. | PROB-01/02; GOAL-02; SCN-01; CAP-001/003; TC-PLAT-001 |
| SHOO-PLATFORM-002 | Shoo shall provide a Codex integration using MCP and trusted lifecycle hooks with visible trust/enabled state. | P0/A-C | Trusted hooks emit supported boundaries; disabled/untrusted state is degraded and never reported healthy. | PROB-01/02; GOAL-01/02; SCN-01; CAP-002/007; TC-PLAT-002 |
| SHOO-PLATFORM-003 | Shoo shall apply local exclusions, secret detection, redaction, and effective safe default routing before prohibited data leaves local scope. | P0/A-B | Canary secret/raw source/transcript fixtures follow deny/local rules and never reach cloud/durable/log paths. | PROB-03; GOAL-03/04; SCN-01; CAP-004/FND-005; TC-PLAT-003 |
| SHOO-PLATFORM-004 | Shoo MCP shall expose only the context/session/memory operations required by the accepted MVP workflow. | P0/A-D | Agent can start/get context/checkpoint/complete-resume/recall/correct through approved semantics; no team/autonomous tools are exposed. | PROB-01/03; GOAL-01/02/05; SCN-01/03; MVP boundary; TC-PLAT-004 |
| SHOO-PLATFORM-005 | Local runtime shall queue eligible operational/capture work during temporary offline/cloud failure. | P0/A-B | Offline fixture preserves ordered/idempotent work and reconciles visibly after reconnect. | PROB-02; GOAL-02/04; SCN-01; SYN-001; TC-PLAT-005 |
| SHOO-PLATFORM-006 | Coding and valid local checkpoint creation shall continue during Shoo Cloud, MemWal, or Walrus outage. | P0/B | Failure fixture allows coding/checkpoint and displays pending/degraded durable status. | PROB-02; GOAL-01/04; SCN-01; SYN-001/003; TC-PLAT-006 |
| SHOO-PLATFORM-007 | Shoo shall maintain an operational outbox with idempotent scheduling, retry, terminal failure, and reconciliation. | P0/B | Duplicate/retry/partial failure fixture reaches one logical outcome with audit history. | PROB-02; GOAL-04; SCN-01; SYN-001/004; TC-PLAT-007 |
| SHOO-PLATFORM-008 | Shoo shall verify client/API/schema/MemWal compatibility before affected operations. | P0/A-B | Unsupported version blocks affected write with actionable diagnostic and preserves queued data. | GOAL-04; SCN-01; SYN-004; TC-PLAT-008 |
| SHOO-PLATFORM-009 | Shoo shall persist policy-eligible durable memory through MemWal and track accepted, pending, persisted, failed, and reconciled outcomes. | P0/B | Remember/bulk job fixture round-trips Shoo/durable metadata and never reports persisted before confirmation. | PROB-02; GOAL-04; SCN-01; SYN-003/004; TC-PLAT-009 |
| SHOO-PLATFORM-010 | Shoo shall support restore/re-index awareness and distinguish recall removal from underlying durable retention. | P1/B-D | Restore fixture rebuilds eligible index state; deletion UI/API reports each layer truthfully. | PROB-02/03; GOAL-03/04/05; SCN-01/03; SYN-005/OPS-004; TC-PLAT-010 |
| SHOO-PLATFORM-011 | Hosted Shoo shall authenticate users and enforce project isolation across MCP, Web, and API. | P0/A | Cross-project/tenant fixtures fail closed; revoked session loses access. | PROB-04; GOAL-03; SCN-01/02; FND-001/004; TC-PLAT-011 |
| SHOO-PLATFORM-012 | Shoo shall expose audit history for policy, capture, authority, correction, sync, durable, and access events. | P0/A-D | Authorized user can inspect event metadata; protected content remains redacted. | GOAL-03/04/05; OPS-001; TC-PLAT-012 |
| SHOO-PLATFORM-013 | Shoo shall expose pipeline health for adapters, ingestion, extraction, sync, MemWal, retrieval, and context delivery. | P0/R1 | Failure injection identifies affected stage, scope, retryability, and user-visible impact. | GOAL-02/04; OPS-002; TC-PLAT-013 |
| SHOO-PLATFORM-014 | Shoo shall collect product/evaluation telemetry required for SCRR without individual productivity scoring. | P0/C-D | Telemetry supports eligible resume, recap, useful action, capture completeness, correction, citation, and latency analysis only. | PROB-03/04; GOAL-01; OPS-003; TC-PLAT-014 |
| SHOO-PLATFORM-015 | User shall be able to export Shoo-controlled data and request deletion/restriction with layer-specific status. | P1/D | Export is scoped/authorized; deletion reports local/operational/index/durable outcomes and retention limits. | GOAL-03/05; OPS-004; TC-PLAT-015 |
| SHOO-PLATFORM-016 | Shoo shall support staged rollout and rollback of adapters, extraction/ranking versions, policy, and durable writes. | P0/R0-R3 | Feature/version can be limited by cohort/project and rolled back without losing evidence/lineage. | GOAL-03/04; Release boundary; TC-PLAT-016 |
| SHOO-PLATFORM-017 | Billing enforcement in MVP beta shall not block local export or correction/deletion rights. | P1/R3 | Entitlement-expired fixture denies paid service appropriately while export/privacy operations remain available. | Commercial SaaS; OPS-005; TC-PLAT-017 |

## MCP product boundary

The exact tool names/contracts are deferred to Phase 5. MVP MCP behavior must cover:

- scoped project/work-unit context;
- session start/checkpoint/stop/resume semantics;
- recent changes and related decisions;
- recall with sources/status;
- explicit correction/supersession request;
- capture/durable health.

Team pace, critical path, team activity, task assignment, and autonomous coordination tools are not MVP-exposed.

## Local trust-boundary requirements

- Adapter/hook trust state and source are visible.
- Exclusions and secret detection run before prohibited sync.
- Durable credentials remain outside prompts/Web/client logs.
- Offline queue is protected from unauthorized local access appropriate to environment.
- User can pause/disable capture and understand resulting completeness impact.

## MemWal/Walrus requirements

- MemWal is mandatory for eligible durable memory.
- Remember is treated as asynchronous until terminal confirmation.
- Bulk limit/compatibility is discovered from supported contract rather than assumed forever.
- Owner/namespace mapping cannot substitute for Shoo permission checks.
- Semantic recall from MemWal cannot bypass Shoo filters/authority.
- Restore and forget/retention semantics are surfaced truthfully.
- Sensitive durable content requires verified encryption/retention policy; otherwise deny/quarantine.

## Observability requirements

For every stage, record correlation identity, scope-safe status, latency, retryability, error class, version, and downstream impact. Do not record protected payloads.

Required alerts/health views shall cover:

- adapter disconnected/degraded;
- event backlog/duplication;
- extraction failure/correction spike;
- operational sync lag;
- MemWal compatibility/job failure;
- retrieval/context error;
- authorization/tenant-isolation anomalies;
- export/deletion failure.

## Rollout

- R0: controlled project, fixed supported client versions, thin path.
- R1: failure injection, compatibility matrix, observability, rollback.
- R2: invited users, privacy/export/correction, support diagnostics.
- R3: staged beta cohorts, entitlement controls, Phase 9 thresholds.

## Risks

- Hooks/plugins change without compatibility detection.
- Local runtime becomes hard to install/support.
- MemWal beta or retention semantics break SaaS promises.
- Credential leakage through agent/log/client bundle.
- Platform scope overgeneralizes for future teams.
- Operational and durable state diverge.

## Open questions

- Local runtime packaging and auto-update model.
- Hosted identity provider and session strategy.
- Managed versus manual MemWal flow and application encryption.
- Exact MCP tools/resources/prompts and HTTP contracts in Phase 5.
- Datastore/cache/search selection in Phase 5.
