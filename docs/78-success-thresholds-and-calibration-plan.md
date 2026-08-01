# Shoo Success Thresholds and Calibration Plan

- Version: 0.1
- Status: Accepted — Gate 9
- Owner role: Product & Engineering Design Board / Evaluation Lead
- Dependencies: Product Metrics; Technical Evaluation; Gold Dataset; Beta Roadmap
- Assumptions: Early samples are small and require confidence intervals plus qualitative failure review
- Unresolved questions: Whether R2 can reach 60 eligible real resumes without extending the window
- Last decision: Use staged thresholds and zero-tolerance safety gates; recalibrate only through pre-unblinding change control
- Next action: Freeze the approved R0 dataset/protocol before implementation results are reviewed

## Release threshold matrix

| Measure | R0 technical proof | R2 private alpha | R3 MVP beta |
|---|---:|---:|---:|
| Eligible resumes | ≥20 scripted pairs | ≥60 real resumes, ≥8 external users | ≥200 resumes, ≥20 external users |
| SCRR | ≥80% scripted | ≥65% | ≥75%, lower 95% CI ≥65% |
| Recovery improvement | N/A | median ≥30% vs participant baseline | median ≥40% vs baseline |
| Context rubric | mean ≥3.2/4; no critical <3 | same | same |
| Citation coverage | ≥95% material factual claims | ≥95% | ≥97% |
| Citation correctness | ≥95% | ≥97% | ≥98% |
| Canonical precision | ≥98% | ≥98% | ≥99% |
| Critical stale/cross-tenant/secret error | 0 | 0 | 0 |
| Capture completeness | ≥95% supported lifecycle events | ≥97% | ≥98% |
| Post-normalization duplicate rate | <0.5% | <0.5% | <0.2% |
| Duplicate/reorder convergence fixtures | 100% | 100% | 100% |
| Manual durable confirmation | ≥99% eligible jobs within 5m in controlled run | ≥98% within 5m, outages separated | ≥99% within 5m monthly beta |
| Context availability | N/A | ≥99.0% measured window | ≥99.5% monthly beta |
| Correction burden | measured | median ≤1 material correction/resume and ≤3m | median ≤0.5 and ≤2m |

These are product-release targets, not contractual SLAs. User-cancelled wallet prompts and confirmed upstream outages remain visible denominators and are reported separately; they are not silently discarded.

## Advancement rules

- All zero-tolerance gates pass.
- Primary threshold passes with denominator and uncertainty disclosed.
- No critical segment is hidden by the aggregate.
- At most two non-safety supporting thresholds may be conditionally missed if a named remediation owner, deadline and bounded cohort limit are approved.
- Three consecutive windows or one material P0/P1 regression can reverse an advance.

## Calibration rules

1. Freeze the metric dictionary and evaluator rubric before reading R2 outcomes.
2. Use R0 to validate instrumentation, not to weaken user-outcome targets.
3. Threshold changes require an ADR with reason, impact, original value and new value.
4. Changes after unblinding are labeled exploratory and cannot pass the same gate.
5. Report Wilson intervals for proportions and median/bootstrap intervals for time measures.

## Interpretation

Passing R3 supports the claim that the MVP continuation hypothesis is promising for the tested cohort. It does not establish broad PMF, team coordination value, enterprise readiness or autonomous orchestration safety.
