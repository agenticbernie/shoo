# Shoo Gold Dataset and Evaluation Rubrics

- Version: 0.1
- Status: Accepted — Gate 9
- Owner role: AI Evaluation Lead / Data Architect / Security Lead
- Dependencies: Memory Model; Retrieval Design; Technical Evaluation Framework
- Assumptions: Synthetic repositories can cover initial failure classes; real samples require explicit consent and redaction
- Unresolved questions: External evaluator availability and Vietnamese/English balance
- Last decision: Maintain development, calibration and sealed regression partitions with typed authority annotations
- Next action: Author the first 40 synthetic session pairs and double-annotate 20 percent

## Dataset units

Each case contains:

- repository fixture and immutable commit/branch state;
- source session events and evidence references;
- expected work unit, task state and session outcome;
- gold structured memories with type, scope, authority, confidence and provenance;
- supersession/conflict graph;
- target resume question and minimum sufficient context;
- forbidden/irrelevant items;
- expected citations and acceptable next actions;
- injected failures and sensitivity labels.

Raw transcript is evidence only and cannot be the gold memory unit.

## Dataset governance

| Partition | Purpose | Visibility | Change rule |
|---|---|---|---|
| Development | Fast implementation feedback | Engineering | Versioned; may expand |
| Calibration | Tune rubric and evaluator agreement | Evaluation board | Changes require annotation log |
| Sealed regression | Release comparison | Restricted evaluator owner | No tuning access; rotate on leakage |
| Consented beta | Ecological validity | Least-privilege research group | Explicit consent, minimization, deletion deadline |

No customer code enters a dataset by default. Secret-shaped decoys are synthetic. Dataset licenses and repository provenance must be recorded.

## Context pack rubric — 0 to 4 each

| Dimension | 0 | 2 | 4 |
|---|---|---|---|
| Goal continuity | Wrong/absent | Partial goal | Exact current goal and boundary |
| Completed work | Misstates work | Major items present | Material results and evidence complete |
| Current truth | Uses stale/conflict as fact | Qualified but incomplete | Authority and supersession correct |
| Unfinished work | No viable next step | Generic next step | Actionable next step with dependency/risk |
| Relevance | Mostly noise | Mixed | Only task-relevant context within budget |
| Provenance | Unsupported | Partial citations | Material facts trace to accessible evidence |

A pack is “sufficient” only if no critical dimension is below 3 and the mean is at least 3.2/4.

## Ask Shoo rubric

Score factual accuracy, citation entailment, freshness/authority, scope/permission, fact–inference–suggestion labeling and useful uncertainty. A confident unsupported answer scores zero for factual accuracy even if plausible.

## Annotation quality

- Two annotators independently label every calibration case and at least 20% of each new batch.
- Target kappa ≥0.70 before automated evaluator labels affect release decisions.
- Disagreements become rubric examples; the architect cannot unilaterally relabel failures to improve scores.
- Dataset version, evaluator version and adjudication log accompany every report.
