# Shoo User Research and Usability Test Plan

- Version: 0.1
- Status: Accepted — Gate 9
- Owner role: Principal Product Designer / User Research Lead / Product Manager
- Dependencies: Phase 2 workflows; Phase 6 UX; Product Metrics
- Assumptions: Initial cohort can recruit developers who use OpenCode and/or Codex on real projects
- Unresolved questions: Recruitment channels, incentive budget and ability to observe real work safely
- Last decision: Validate continuation and trust behavior before team coordination breadth
- Next action: Recruit the first 8–12 solo multi-agent developers and run baseline interviews

## Research questions

1. How often and how painfully do developers reconstruct context today?
2. Does Shoo reduce recovery time and re-explanation across sessions/agents?
3. Do capture, authority, sync and durability states remain understandable under failure?
4. Is automatic capture acceptable with exclusions, preview, correction and deletion controls?
5. Does mandatory Manual/Walrus setup create value or unacceptable activation loss?

## Participant waves

| Wave | Participants | Purpose |
|---|---:|---|
| Discovery baseline | 8–12 solo multi-agent developers | Frequency, alternatives, privacy, terminology |
| Controlled usability | 6–8, including OpenCode-heavy and Codex-heavy users | Onboarding, resume, correction, failure comprehension |
| Private alpha | 8–15 active developers | Real continuation, reliability and correction burden |
| Team exploratory | 2 teams of 3–5, after solo evidence | Identity/scope invariants only; no coordination feature expansion |

Sponsor usage is valuable design-partner evidence but is reported separately from external users.

## Required study tasks

- Install/init/link a fixture project and connect OpenCode.
- Start, checkpoint and complete a session; inspect what was captured.
- Resume in Codex without receiving a manual summary.
- Find why a current decision was made and open its source.
- Correct an unverified/stale memory and understand downstream impact.
- Recover from offline cloud, unavailable MemWal/Walrus and failed durable write.
- Create/revoke a delegate and explain what the delegate can access.
- Export/delete data and explain what is removed locally, operationally and durably.

## State coverage

Every moderated round includes normal, empty, partial, stale, conflict, permission-denied, offline, duplicate/out-of-order, hallucinated claim, user correction and rollback states. Failure-state comprehension is a release criterion, not polish.

## Research integrity

- Obtain informed consent separately for telemetry, screen recording and content inspection.
- Allow fixture-only participation.
- Redact paths/code/secrets and set deletion dates.
- Do not recruit only Web3-native users; Walrus terminology must not be required for core comprehension.
- Record disconfirming evidence and withdrawals; never convert interview enthusiasm into PMF.
