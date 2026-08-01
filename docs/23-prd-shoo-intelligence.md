# PRD — Shoo Intelligence

- Version: 0.2
- Status: Accepted — Decision Gate 4
- Owner role: AI Systems Architect / Principal UX Architect / Principal Product Manager
- Dependencies: PRD Overview; Shoo Memory PRD; Feature Dependency Map
- Assumptions: Context-pack retrieval and Ask Shoo can share one truth/ranking/citation path
- Unresolved questions: Token budgets; useful-action rubric; ranking weights and evaluation corpus
- Last decision: Sponsor approved Intelligence requirements and shared truth path
- Next action: Define retrieval stages, ranking contract, context manifest, and cache invalidation in Phase 5

## Executive summary

Shoo Intelligence retrieves relevant, permitted, current project memory; builds token-bounded context packs; generates source-backed project answers; and recommends a resume target. It must prefer authority and scope over fluent but unsupported output.

## Goals

- Provide sufficient context for cross-agent continuation.
- Prefer current accepted state over stale/superseded memory.
- Expose sources, freshness, completeness, and contradictions.
- Answer project questions with fact/inference/suggestion separation.
- Reuse one retrieval/current-state path across MCP, Web, and Ask Shoo.

## Non-goals

- General-purpose assistant or external knowledge answerer.
- Semantic vector search as the only retrieval method.
- Hidden chain-of-thought exposure.
- Autonomous planning or task assignment.
- Separate Web and agent knowledge bases.

## Functional requirements

| ID | Requirement | Priority | Acceptance criteria | Trace |
|---|---|---|---|---|
| SHOO-FR-201 | Retrieval shall enforce project, visibility, work-unit, branch/worktree, type, authority, and current/historical filters before answer/context use. | P0/C | Cross-project/restricted fixture returns no unauthorized candidate; branch fixture remains separated. | PROB-01/04; GOAL-01/03; SCN-01/03; RET-001; TC-INT-001 |
| SHOO-FR-202 | Retrieval shall support semantic candidate discovery only within eligible scoped data. | P0/C | Semantic query finds relevant eligible candidate and never bypasses structured permission/status filters. | PROB-01/03; GOAL-01/05; SCN-01/03; RET-002; TC-INT-002 |
| SHOO-FR-203 | Ranking shall consider authority, canonical/supersession state, recency, work-unit/branch relevance, dependency proximity where known, source quality, confidence, and semantic relevance. | P0/C | Gold fixture ranks current accepted decision above newer unverified or superseded claims. | PROB-03; GOAL-01/03; SCN-01/03; RET-003; TC-INT-003 |
| SHOO-FR-204 | Shoo shall build a token-bounded context pack containing objective, current state, decisions, last checkpoint, relevant files/artifacts, tests, blockers, uncertainty, and next action where evidence exists. | P0/C | Pack fits requested budget, includes mandatory sections/status, and does not silently truncate citations or critical uncertainty. | PROB-01/02/03; GOAL-01; SCN-01; RET-004; TC-INT-004 |
| SHOO-FR-205 | Context packs shall include a manifest of sources, freshness, scope, capture completeness, and omitted/limited evidence. | P0/C | Partial/stale/permission fixture produces explicit manifest warnings and accessible sources. | PROB-02/03; GOAL-03; SCN-01; RET-005; TC-INT-005 |
| SHOO-FR-206 | Permission, correction, supersession, or relevant work-state change shall invalidate affected cached packs. | P0/C-D | Invalidated pack is not served after mutation; regenerated pack reflects current state. | PROB-03/04; GOAL-03/05; SCN-01/03; MEM-004/RET-005; TC-INT-006 |
| SHOO-FR-207 | Shoo shall suggest the most likely resume work unit and require a targeted choice when confidence is insufficient. | P0/A-C | Correct fixture auto-suggests; ambiguous fixture presents top scoped choices/new work option. | PROB-03; GOAL-01; SCN-01; RES-001/WEB-004; TC-INT-007 |
| SHOO-FR-208 | Ask Shoo shall classify query intent and resolve project/work-unit/branch/time scope. | P1/D | Current-state, history, rationale, prior bug, unfinished work, and next-action fixtures route correctly or ask one targeted scope question. | PROB-03; GOAL-05; SCN-03; ASK-001; TC-INT-008 |
| SHOO-FR-209 | Ask Shoo shall separate fact, inference, and suggestion and cite every factual project-state claim. | P1/D | Evaluator maps each factual claim to accessible evidence; inference/suggestion labels are explicit. | PROB-03; GOAL-03/05; SCN-03; ASK-002; TC-INT-009 |
| SHOO-FR-210 | Ask Shoo shall return an explicit unknown/insufficient/stale/conflict/permission-limited result rather than fabricate certainty. | P1/D | No-evidence and contradiction fixtures contain no unsupported fact and provide recovery/narrowing options. | PROB-03; GOAL-03/05; SCN-03; ASK-002; TC-INT-010 |
| SHOO-FR-211 | Current-state answers shall prefer accepted current memory and expose superseded history only when relevant/requested. | P1/D | “Why/current decision” fixture answers current decision and links superseded lineage. | PROB-03; GOAL-03/05; SCN-03; WEB-003/ASK-002; TC-INT-011 |
| SHOO-FR-212 | Resume recommendations shall be suggestions, not automatic task assignment. | P1/D | Recommendation shows evidence/uncertainty and requires user/agent choice to begin another work unit. | PROB-03; GOAL-01/05; SCN-01/04; WEB-004; TC-INT-012 |

## Ranking contract requirements

The PRD does not set weights or algorithms. A compliant design must:

- filter unauthorized/ineligible data before ranking;
- exclude superseded/rejected current truth;
- retain unresolved contradictions;
- make authority and scope capable of outweighing pure semantic similarity;
- enforce token budgets after preserving mandatory context sections;
- expose ranking/evidence metadata for evaluation without exposing hidden model reasoning.

## UX requirements

- Context-pack preview groups objective/current state/decisions/progress/tests/blockers/next action.
- Source chips expose type, time, work unit, branch, authority, and freshness.
- Ask responses show Fact, Inference, and Suggestion sections only when present.
- Unknown, partial, stale, conflict, and permission-limited states use explicit copy.
- Correction entry points lead to the shared Memory correction workflow.

## Telemetry and evaluation

- query/pack scope and token budget;
- candidate counts by stage;
- citation coverage;
- stale/superseded/conflict exposure;
- context item feedback/correction;
- pack latency and size;
- Ask unknown/partial outcomes;
- manual recap and first useful action correlation.

No hidden chain-of-thought shall be logged or exposed.

## Security requirements

- Retrieval must reauthorize on every request, not trust cached client scope.
- Citations cannot reveal restricted title/snippet/existence beyond policy.
- Prompt/context assembly must distinguish untrusted evidence from instructions and mitigate prompt injection.
- Answer output must not expose secrets/redacted local evidence.

## Rollout

- R0: structured retrieval and minimal context pack for one work unit.
- R1: authority/supersession ranking, completeness/citation manifest, failure fixtures.
- R2: Web source inspection, correction invalidation, Ask intents.
- R3: evaluation thresholds and broader beta corpus.

## Risks

- Ranking weights hide stale/authority failures.
- Token budget removes critical uncertainty.
- Ask Shoo becomes a generic assistant.
- Citation points to inaccessible or over-redacted evidence.
- Prompt injection enters through captured artifacts.

## Open questions

- Token-budget tiers by client/session.
- Relevance/precision thresholds after corpus creation.
- Useful-action and manual-recap measurement rubric in Phase 9.
