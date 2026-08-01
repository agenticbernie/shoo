# Shoo Vertical Slice Roadmap and Release Plan

- Version: 0.3
- Status: Accepted — Gate 8
- Owner role: Technical Program Manager / Principal Product Manager / Staff Architect
- Dependencies: Accepted MVP Boundary; Architecture; UX/UI; Repository Plan
- Assumptions: If all six technical contributors are fully assigned, the initial credible envelope is approximately 4.0–4.8 effective delivery FTE; actual allocation is not yet confirmed
- Unresolved questions: Contributor allocation/focus factors, role consent/capability and provider onboarding lead times
- Last decision: Accept ART-81 capacity normalization; do not use 1.5 FTE/person or headcount alone for roadmap commitments
- Next action: Record actual capacity and two weeks of throughput/blocker evidence while executing only foundation, approved spikes and Slice A

## Roadmap principle

Each slice crosses Local, client adapter, MCP/API, domain, database, worker, durable path, observability, security and user-facing recovery as required. Component completion without the slice outcome does not count as release progress.

## Capacity envelope

- Cross-functional team with at least four sustained effective engineering FTE: initial MVP beta planning range **18–26 weeks**; this remains a hypothesis, not a commitment.
- One person contributes at most 1.0 baseline employment FTE. Effective delivery FTE equals employment FTE × Shoo allocation × focus factor; overtime is tracked as temporary surge.
- If all six technical contributors are fully assigned, the initial planning envelope is approximately **4.0–4.8 effective delivery FTE**; actual allocation and throughput can lower it.
- Solo founder/engineer: expect roughly **2–3× elapsed time** unless scope is reduced.
- Unknown-provider, packaging and migration spikes are timeboxed and can change the range.
- No external date is committed before named allocation/consent is recorded and at least two weeks of Slice A throughput and blocker evidence is measured.

## Slice A — Trusted Project Start and Local Capture (R0)

**User value:** OpenCode starts in a linked project; Shoo captures eligible evidence locally with clear policy/health and creates a safe checkpoint candidate.

Planning range: 4–6 weeks.

| Layer | Deliverable |
|---|---|
| UX/UI | CLI init/connect/status; capture policy preview; health states |
| Local | signed/dev package skeleton, trusted-project check, encrypted spool, secret/path exclusion |
| Client | OpenCode adapter; Codex connection/capability manifest skeleton |
| MCP/API | start/checkpoint contract walking path; auth/project link |
| Domain/data | identity/project/session/work-unit/event/outbox baseline; RLS |
| Walrus | Manual adapter spike and test namespace only; no false success |
| Observability | capture/local commit/operational sync stages and forbidden-content scan |
| Tests | duplicate/out-of-order, offline, crash, tenant canary, config preview |

Exit: first successful structured checkpoint is reproducible; prohibited data does not leave local scope; cross-client path is technically credible.

## Slice B — Trusted Checkpoint and Durable Confirmation (R1)

**User value:** A completed/paused session produces structured memory, syncs operationally and receives a user-owned MemWal/Walrus durable copy without blocking coding.

Planning range: 4–6 weeks.

| Layer | Deliverable |
|---|---|
| UX/UI | Durable Memory setup, device access, checkpoint state, pending/failure recovery |
| Local | wallet signer flow, delegate vault, Manual encryption/embedding path, reconciliation |
| Cloud | normalization, extraction candidate, authority state, durable operation API |
| Database | memory/revision/evidence/durable mapping and job lifecycle |
| Worker | extraction, index, Manual coordination metadata, retry/dead-letter |
| Walrus | verified remember/recall/restore round trip with pinned MemWal version |
| Observability/cost | outbox/durable SLO and per-operation cost meters |
| Tests | key loss messaging, provider outage, poison job, restore and trust-boundary inspection |

Exit: operational and durable states are truthful; durable outage does not lose or block work; Manual trust boundary passes.

## Slice C — Cross-Agent Continuation (R1/R2)

**User value:** Work captured from OpenCode can be resumed in Codex with relevant, current, scoped and cited context without manual project-state retelling.

Planning range: 4–6 weeks.

| Layer | Deliverable |
|---|---|
| UX/UI | targeted work ambiguity choice; context preview; freshness/conflict/partial warnings |
| Client/MCP | Codex session/resume/context tools/resources; current/previous compatibility |
| Intelligence | resolver, structured filtering, FTS/pgvector retrieval, ranking, token budget |
| Data | context manifest, citation/source access, invalidation watermark |
| Security | delivery-time permission and prompt-injection fixtures |
| Observability | context p95, candidate stage counts, citation/completeness and continuation funnel |
| Tests | gold retrieval corpus, cross-surface consistency skeleton, stale/superseded/conflict cases |

Exit: cross-agent continuation succeeds in the supported matrix and improves context recovery against the registered baseline.

## Slice D — Inspect, Correct and Ask Shoo (R2)

**User value:** User can inspect current project memory, open sources, correct/supersede records and ask cited project questions.

Planning range: 4–6 weeks.

| Layer | Deliverable |
|---|---|
| Web | Pulse, Work detail, Activity, Decisions, Memory Explorer, Source Drawer, Settings |
| Ask | evidence-report response with facts/inferences/suggestions/limits |
| Memory | correction preview, expected version, supersession and conflict workflow |
| Platform | Clerk adapter, access control, export/deletion operation previews |
| UI | semantic tokens/components, light/dark, critical responsive behavior |
| Observability | correction burden, citation coverage, stale/conflict exposure |
| Tests | RLS/permission, cache invalidation, accessibility, navigation/state comprehension |

Exit: user can verify and correct future context; Ask never fabricates unsupported current truth; private-alpha trust tasks pass.

## Slice E — Beta Hardening and Commercial Readiness (R3)

**User value:** Shoo is reliable, recoverable and governable enough for an invited Commercial SaaS beta.

Planning range: 2–4 weeks after D, plus defects from evidence.

- signed stable Shoo Local update and rollback;
- backup/PITR/tombstone restore rehearsal;
- export/deletion/uninstall end to end;
- error-budget dashboards and runbooks;
- invoice/cost reconciliation and entitlement-safe privacy operations;
- migration shadow/cutover rehearsal;
- security/accessibility review;
- beta support and incident process.

Exit: R3 Gate requires Phase 9 thresholds and SCRR evidence; feature completion alone cannot authorize beta.

## Stop/pivot gates

- After A: stop if safe automatic capture is not technically credible.
- After B: narrow if Manual durability UX/reliability is unacceptable.
- After C: stop/pivot if cross-agent continuation does not beat manual baseline.
- After D: narrow Web/Ask if trust/correction burden remains high.
- Before E: do not commercialize without cost and willingness-to-pay evidence.

## Explicitly excluded

Team blockers, dependencies, handoffs, team pace, critical path, autonomous coordination, dedicated vector database, external broker, multi-region and mobile editing remain outside this roadmap.

Production predecessor-data migration is also excluded because no external user or production data requires it. Code/capability inventory and contract-safe reuse remain in scope.
