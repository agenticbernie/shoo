# Shoo Product Metrics and Measurement Model

- Version: 0.1
- Status: Accepted — Gate 9
- Owner role: Principal Product Manager / Data Architect / Privacy Lead
- Dependencies: Product DNA; PRD; Observability Design; accepted Gate 8 roadmap
- Assumptions: Privacy-safe outcome events can distinguish manual re-explanation from useful continuation without storing prompt content
- Unresolved questions: Baseline rate and cohort size available during R2
- Last decision: Use successful context recovery, not activity volume, as the product measurement center
- Next action: Implement the minimum event dictionary in Slice A and run the evaluator agreement study

## North Star Metric

**Sufficient Context Resume Rate (SCRR)** = eligible resumed coding sessions that reach a verified useful action without material manual re-explanation / all eligible resumed coding sessions.

An eligible resume:

- starts from an existing Shoo work unit after a prior session checkpoint/completion;
- occurs in a new session or different supported agent;
- has enough prior evidence to form a context pack;
- excludes training demos, synthetic tests, session restarts under two minutes and user-deleted evidence.

A successful resume must satisfy all of:

- the intended work unit is selected or correctly inferred;
- the agent reaches first useful action within 10 minutes;
- no material goal, completed-work, current-decision or unresolved-risk explanation is manually reconstructed;
- no critical stale/superseded memory is treated as current truth;
- the user confirms success or two independent behavioral signals plus sampled review agree.

Short corrections such as a file typo do not fail the session. Re-explaining a goal, decision, completed work, blocker or next step does.

## Supporting outcome metrics

| Metric | Definition | Why it matters | Guardrail |
|---|---|---|---|
| Context Recovery Time | Resume start to first useful action | Measures time returned to user | Never equate with developer speed |
| Repeated-Context Rate | Eligible resumes with material re-explanation | Direct problem frequency | Sampled evaluator calibration required |
| Cross-Agent Continuation Success | SCRR where source and target agents differ | Tests Shoo's differentiation | Report client pair and capability coverage |
| Context Relevance | Weighted relevant facts / presented facts | Controls context noise | Critical omissions measured separately |
| Citation Coverage | Supported factual claims / factual claims | Supports trust | Citation presence is not citation correctness |
| Canonical Accuracy | Current-truth claims correct under accepted authority state | Prevents stale truth | Critical errors have a zero-tolerance release gate |
| Correction Burden | Median corrections and correction minutes per eligible session | Detects extraction cleanup cost | No individual ranking |
| Durable Completion | Eligible Manual jobs confirmed within policy window | Tests meaningful Walrus path | User rejection and outage shown separately |
| Continuation Unit Cost | Allocated variable cost / successful resume | Tests SaaS viability | Never optimize by weakening privacy/trust |

## Measurement design

Use three evidence classes:

1. product events: content-safe state transitions and timings;
2. user outcome confirmation: lightweight post-resume check sampled, not shown every session;
3. independent review: consented redacted replay or controlled study scored with ART-75 rubric.

Self-report alone cannot establish SCRR. Behavioral inference alone cannot establish it until evaluator agreement reaches Cohen's kappa at least 0.70 on a blinded sample.

## Privacy-safe event minimum

`resume.started`, `context.pack_built`, `context.pack_consumed`, `first_useful_action`, `manual_context_repeated`, `resume.outcome_recorded`, `memory.corrected`, `citation.opened`, `durability.state_changed`.

Allowed properties are opaque tenant/project/work/session/client IDs, state enums, timings, counts, policy route, pack token count and evaluator label. Prompts, source text, file paths, code, secrets and wallet material are prohibited from product telemetry.

## Anti-surveillance rules

- No individual productivity score, leaderboard or manager ranking.
- Do not infer performance from tokens, prompts, commits, code lines or online time.
- Team reporting aggregates work-system flow with minimum cohort thresholds.
- Individual debugging views are access-controlled and explain their purpose.
- Marketing claims require cohort, denominator, uncertainty and measurement-window disclosure.

## Decision thresholds

Thresholds in ART-78 are release hypotheses, not SLA or product-market-fit claims. Any threshold change must be made before unblinding the relevant evaluation window or be labeled post hoc.
