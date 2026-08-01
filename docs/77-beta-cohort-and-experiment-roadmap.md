# Shoo Beta Cohort and Experiment Roadmap

- Version: 0.1
- Status: Accepted — Gate 9
- Owner role: Principal Product Manager / Technical Program Manager / GTM Lead
- Dependencies: Roadmap; Research Plan; Product Metrics; Security Gates
- Assumptions: Cohort exposure can be feature-flagged by project and client adapter
- Unresolved questions: Incentive budget, support capacity and external beta start date
- Last decision: Expand cohorts by evidence and risk exit, never by feature count
- Next action: Recruit baseline cohort while Slice A is built; do not expose restricted code before trust gates

## Cohort ladder

| Stage | Users | Allowed data | Entry evidence | Exit evidence |
|---|---:|---|---|---|
| R0 technical proof | Internal team | Synthetic/test repositories | Gate 8 + isolated accounts | End-to-end OpenCode→Codex path credible |
| R1 internal alpha | 4–8 technical contributors | Internal low-sensitivity projects | Slice A/B tests and security canaries | Failure recovery truthful; no P0 |
| R2 private alpha | 8–15 external developers | Consented projects under exclusions | R1 exits, privacy/onboarding review | Threshold band in ART-78; acceptable correction burden |
| R3 MVP beta | 20–40 developers | Policy-eligible real projects | R2 evidence and incident readiness | SCRR, trust, reliability and unit-cost evidence |

## Experiment sequence

1. Baseline diary: current recovery time and repeated-context incidents without Shoo.
2. Capture-policy comprehension: local-only vs operational vs durable/shared routes.
3. Context continuation: summary-only control versus structured cited context pack.
4. Cross-agent test: same-agent resume versus OpenCode→Codex resume.
5. Trust interface: cited authority states versus simplified memory list.
6. Manual durability: setup completion, prompt burden, recovery and perceived ownership value.
7. Ask Shoo incremental value: only after continuation works; measure whether it adds value without delaying/rescoping core loop.
8. Willingness-to-pay: after a participant has experienced successful continuation.

## Experiment controls

- Pre-register primary outcome, denominator, exclusions and stop rule.
- Prefer within-user crossover where project variability is high.
- Log client/version and capability coverage.
- Do not expose a user to an unsafe control merely to obtain comparison data.
- Segment results by new/same agent, project size and capture health; never by employee performance.

## Stop conditions

Pause cohort expansion for any P0, repeated wrong-canonical P1, unexplained secret egress, unrecoverable local loss, misleading durable state, or support load that exceeds named capacity. Roll back feature flags while preserving local evidence and user export controls.

## Commercial evidence

Capture willingness-to-pay, buyer/user distinction, procurement blocker, support expectation and perceived value of user-owned durability. Pricing remains a hypothesis until successful continuation is demonstrated; beta signups alone are not demand evidence.
