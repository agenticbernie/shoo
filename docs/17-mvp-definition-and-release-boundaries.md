# Shoo MVP Definition and Release Boundaries

- Version: 0.2
- Status: Accepted — Decision Gate 3
- Owner role: Principal Product Manager / Technical Program Manager
- Dependencies: Product Scope; Feature Prioritization; Phase 2 journeys
- Assumptions: Internal and private-beta releases can use controlled OpenCode/Codex versions
- Unresolved questions: Beta access model; numeric exit thresholds; hosted environment limits
- Last decision: Sponsor approved four vertical slices and release boundaries
- Next action: Trace requirements and rollout criteria to Slices A–D

## MVP statement

Shoo MVP enables one developer to have work captured from OpenCode, persist a trustworthy checkpoint through policy-selected operational and MemWal/Walrus paths, resume the same work unit in Codex with a cited context pack, inspect/correct memory in Shoo Web, and receive later context and Ask Shoo answers that respect the correction.

## Vertical release slices

### Slice A — Trusted project and capture start

**User value:** Developer can connect Shoo to one project and know whether OpenCode capture is healthy and what data may sync.

Includes:

- sign-in and project link;
- safe policy preview;
- OpenCode adapter and MCP connectivity;
- work-unit creation/selection;
- session detection;
- capture health and local exclusions;
- audit/diagnostic evidence.

Acceptance outcome: Developer starts a work unit without manual memory entry and can distinguish healthy from degraded capture.

### Slice B — Resumable checkpoint with durable proof

**User value:** An OpenCode session produces a trustworthy, recoverable checkpoint.

Includes:

- normalized evidence;
- hybrid checkpoint;
- narrow extraction;
- provenance and authority state;
- operational outbox;
- safe policy routing;
- MemWal/Walrus durable job, retry, reconciliation, and status;
- interrupted-session recovery.

Acceptance outcome: A valid checkpoint survives session interruption and durable-layer unavailability without falsely marking work complete.

### Slice C — Cross-agent continuation

**User value:** Codex continues the OpenCode work unit without manual project-state recap.

Includes:

- Codex hook/MCP integration;
- work-unit matching;
- structured + semantic retrieval;
- authority/supersession ranking;
- cited token-bounded context pack;
- freshness/completeness manifest;
- resume feedback and SCRR signal.

Acceptance outcome: Codex performs the first useful action on the correct work unit without user recap.

### Slice D — Inspect, correct, and ask

**User value:** Developer can trust and govern what future agents will receive.

Includes:

- project overview;
- activity/session timeline;
- current decisions and unfinished work;
- source drawer;
- correction/restriction/supersession;
- pack invalidation;
- cited Ask Shoo with fact/inference/suggestion labels;
- policy and durable status;
- export/deletion/retention disclosure.

Acceptance outcome: User corrects a wrong memory; subsequent context and answer no longer present it as current truth.

## Release boundary table

| Release | Audience | Included slices | Purpose | Exit evidence |
|---|---|---|---|---|
| R0 — Technical proof | Internal | Thin A+B+C happy path | Confirm client and MemWal feasibility | One reproducible OpenCode→Codex continuation |
| R1 — Internal alpha | Project team | A+B+C with degraded paths | Validate workflow and observability | Crash, duplicate, out-of-order, offline, MemWal failure pass |
| R2 — Private alpha | Selected solo developers | A+B+C+D core | Validate trust and correction | Users complete resume and correction tasks |
| R3 — MVP beta | External invited cohort | Complete MVP boundary | Measure product hypothesis | SCRR, relevance, citation, capture, privacy, correction thresholds met |

Numeric thresholds are intentionally deferred to Phase 9 after baseline collection. Gate 3 approves what must be measured, not invented target values.

## MVP exit criteria

MVP is not complete merely because all screens or endpoints exist. It requires:

- supported OpenCode and Codex paths declare capability/completeness;
- one work unit spans both clients;
- checkpoint and resume work under normal, interrupted, offline, duplicate, out-of-order, and durable-unavailable conditions;
- every factual context/Ask claim has accessible evidence or an explicit uncertainty label;
- current state excludes superseded memory;
- correction changes future retrieval;
- no Critical cross-project, secret, or permission leakage;
- durable persistence status is truthful and recoverable;
- SCRR and manual-recap behavior are observable;
- correction burden is measurable.

## Not required for MVP exit

- team invitations or role UI;
- dependency graph or critical path;
- human-to-human handoff workflow;
- additional agent clients;
- broad third-party integrations;
- mobile support;
- autonomous coordination;
- complete billing self-service;
- advanced visualization.

## Rollback boundary

If a slice fails its hypothesis, later slices do not compensate with more features. The product returns to the failed slice, narrows memory types or policy scope, and revalidates the continuation outcome.
