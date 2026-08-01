# Shoo Decision Gate 9 Review Package

- Version: 0.1
- Status: Accepted — Gate 9 (2026-07-15)
- Owner role: Product & Engineering Design Board / Evaluation Lead
- Dependencies: ART-73 through ART-79; accepted Gates 0–8
- Assumptions: Gate 9 approves an evidence protocol, not implementation success or product-market fit
- Unresolved questions: External cohort access, incentive/support budget and FTE ownership for evaluation
- Last decision: Gate 9 accepted the staged, privacy-safe validation contract centered on sufficient context resume
- Next action: Assign owners, freeze R0 protocols and begin privacy-reviewed evidence work within the authorized tranche

## Gate recommendation

**Approved: Phase 9 is the validation contract for Slice A through R3.**

Approval recorded on 2026-07-15. This accepts the evaluation protocol and thresholds; it does not assert that any threshold has already been achieved.

## Decisions proposed

### ADR-EVAL-001 — SCRR is the North Star

Use Sufficient Context Resume Rate with explicit eligibility and success rules; do not use activity or output volume as a proxy.

### ADR-EVAL-002 — Triangulated outcome evidence

Combine content-safe product events, sampled user confirmation and calibrated independent review. Neither self-report nor behavioral inference alone is sufficient.

### ADR-EVAL-003 — Authority-first technical evaluation

Evaluate capture, extraction, canonical resolution, retrieval, context utility, citations, durability, resilience and security. Vector similarity alone cannot pass quality.

### ADR-EVAL-004 — Versioned gold data with a sealed set

Use synthetic-first typed cases, consented minimized beta samples, double annotation and a sealed regression partition.

### ADR-EVAL-005 — Staged thresholds and zero-tolerance trust gates

Use ART-78 thresholds; any cross-tenant disclosure, secret egress, false critical canonical truth or unrecoverable accepted-memory loss blocks release.

### ADR-EVAL-006 — Cohort expansion by evidence

Advance internal proof → internal alpha → private alpha → beta only after prior outcome and risk exits. Feature completeness does not authorize expansion.

### ADR-EVAL-007 — No premature PMF claim

R3 evidence may validate the continuation hypothesis for the tested cohort. Team coordination, enterprise fit and PMF remain separate hypotheses.

## Coverage assessment

| Phase 9 output | Artifact | Assessment |
|---|---|---|
| Product metrics and North Star | ART-73 | Defined with denominator and privacy guardrails |
| Technical evaluation | ART-74 | Pipeline, corpus, protocol and failure severity defined |
| Dataset and rubric | ART-75 | Units, partitions, scoring and annotation governance defined |
| User research | ART-76 | Cohorts, tasks, states and ethics defined |
| Beta/experiments | ART-77 | Ladder, experiment order and stop rules defined |
| Thresholds | ART-78 | R0/R2/R3 values and calibration rules defined |
| Interview protocols | ART-79 | Baseline, usability, debrief and severity defined |

## Conditions before collecting release evidence

- Name metric, dataset, privacy and research owners; avoid Bernie as sole evaluator.
- Instrument only the ART-73 minimum dictionary and complete privacy review.
- Freeze dataset/rubric/version before scoring candidate builds.
- Record client/model/embedding/ranker versions with each run.
- Secure consent, retention/deletion and incident path before real-project samples.
- Confirm support capacity and stop controls before each cohort expansion.

## Residual risks

1. Small self-selected cohorts may overstate adoption and technical literacy.
2. Behavioral detection of re-explanation may be noisy or privacy-invasive.
3. Synthetic datasets may not represent long-lived repositories.
4. Mandatory Manual/Walrus setup may create survivorship bias.
5. Thresholds may be gamed unless sealed data and disconfirming failures remain visible.
6. Team capacity can make evaluation ownership conflict with delivery pressure.

## Gate 9 acceptance statement

“Shoo’s Phase 9 metrics, technical evaluation, gold dataset governance, user research, beta experiments and staged thresholds are approved as the validation contract. Approval authorizes privacy-reviewed instrumentation, dataset construction, research recruitment and evidence collection within Gate 8’s tranche; it does not authorize later implementation slices, production launch, Team Coordination, autonomous orchestration or a product-market-fit claim.”
