# Shoo Feature Prioritization

- Version: 0.2
- Status: Accepted — Decision Gate 3
- Owner role: Principal Product Manager / Staff Software Architect
- Dependencies: Feature Inventory; Product Scope; Risk Register
- Assumptions: Scores compare capability groups, not engineering estimates
- Unresolved questions: Empirical effort estimates after repository spike; beta cohort constraints
- Last decision: Sponsor approved priority tiers and sequencing principles
- Next action: Preserve P0/P1 boundaries through Phase 4 PRD

## Weighted decision model

Each criterion is scored 1–5.

| Criterion | Weight | Meaning |
|---|---:|---|
| User value | 25% | Direct reduction of context reconstruction or increase in trust |
| Hypothesis criticality | 20% | Required to prove MVP hypotheses |
| Risk reduction | 15% | Reduces Critical/High product or security risk |
| Dependency leverage | 15% | Unlocks multiple downstream outcomes |
| MVP speed | 15% | Can reach evaluable value quickly; 5 is faster |
| Operational simplicity | 10% | Lower ongoing complexity; 5 is simpler |

Weighted score is normalized to 100.

## Capability prioritization matrix

| Capability group | Value | Hyp. | Risk | Leverage | Speed | Simplicity | Score | Tier |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Work-unit and session continuity | 5 | 5 | 5 | 5 | 4 | 4 | 95 | P0 |
| OpenCode capture + normalized evidence | 5 | 5 | 5 | 5 | 4 | 3 | 93 | P0 |
| Hybrid checkpoint + narrow extraction | 5 | 5 | 5 | 5 | 3 | 3 | 90 | P0 |
| Provenance + authority + supersession | 5 | 5 | 5 | 5 | 3 | 2 | 88 | P0 |
| Operational sync + policy routing | 5 | 5 | 5 | 5 | 3 | 2 | 88 | P0 |
| MemWal/Walrus durable adapter | 4 | 5 | 5 | 5 | 3 | 2 | 83 | P0 |
| Retrieval + context-pack builder | 5 | 5 | 4 | 5 | 3 | 3 | 87 | P0 |
| Codex resume adapter/delivery | 5 | 5 | 4 | 4 | 4 | 3 | 87 | P0 |
| Connectivity/capture health | 4 | 4 | 5 | 4 | 4 | 4 | 83 | P0 |
| Minimal Web inspection/correction | 4 | 4 | 5 | 4 | 3 | 3 | 78 | P1 |
| Cited Ask Shoo | 4 | 3 | 4 | 3 | 3 | 3 | 68 | P1 |
| Project overview/timeline/unfinished work | 4 | 3 | 3 | 3 | 4 | 4 | 70 | P1 |
| Audit/observability/evaluation | 3 | 5 | 5 | 4 | 3 | 3 | 77 | P0 enabling |
| Export/deletion/retention disclosure | 3 | 3 | 5 | 2 | 3 | 3 | 63 | P1 launch guardrail |
| Full team administration | 2 | 1 | 2 | 3 | 1 | 1 | 34 | P2/Future |
| Handoff/dependency/critical path | 3 | 1 | 2 | 2 | 1 | 1 | 36 | P2/Future |
| Additional agent adapters | 2 | 1 | 2 | 3 | 2 | 2 | 39 | P2/Future |
| Autonomous coordination | 1 | 1 | 1 | 1 | 1 | 1 | 20 | Reject |

## Priority tier definition

### P0 — Closed-loop critical

If any P0 group is absent, Shoo cannot prove reliable cross-agent continuation or cannot measure/trust the result.

### P1 — MVP completion and trust

Required before external MVP completion, but can follow the first internal cross-agent continuation. P1 does not mean optional for the final MVP.

### P2 — Post-MVP expansion

Useful only after the solo continuation hypothesis passes. P2 features must not enter the MVP merely because schema fields already exist.

### Reject

Contradicts Product Goal or validates no current hypothesis.

## Sequencing principles

1. Build the smallest end-to-end path before expanding individual capability depth.
2. OpenCode and Codex are intentionally asymmetric: capture quality first in OpenCode, continuation proof in Codex.
3. MemWal/Walrus is integrated early enough to test failure behavior, but no coding interaction waits synchronously for durable completion.
4. Correction is not polish; it is part of the trust hypothesis.
5. Ask Shoo follows the same retrieval/citation path as context packs and must not create a second truth system.
6. Team features do not begin until SCRR and correction burden show positive solo value.

## Scope pressure rules

When schedule pressure occurs, reduce configuration depth, visualization depth, memory taxonomy breadth, and client parity before cutting provenance, correction, capture health, durable recovery, or evaluation telemetry.
