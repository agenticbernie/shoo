# Shoo Deferred and Rejected Features

- Version: 0.2
- Status: Accepted — Decision Gate 3
- Owner role: Principal Product Manager / Technical Program Manager
- Dependencies: Product Scope; Feature Prioritization; Product Principles
- Assumptions: Deferred features may return only after core-hypothesis evidence
- Unresolved questions: Team expansion trigger and enterprise buyer evidence
- Last decision: Sponsor approved the deferred and rejected feature catalogue
- Next action: Reject PRD requirements that silently reintroduce deferred scope

## Deferred feature catalogue

| Feature | Reason deferred | Evidence required to reconsider | Earliest boundary |
|---|---|---|---|
| Full organization/team/member administration | Does not prove solo continuation; adds permission and onboarding breadth | Solo core value plus team design partners | Post-MVP team release |
| Personal-to-project promotion UI | Important for teams but not required for one-user MVP | Team workflow research and visibility comprehension | Team alpha |
| Human-to-human handoff packs | Depends on trustworthy work/memory state first | Successful cross-agent continuation and handoff interviews | Team alpha |
| Dependency graph | High data-quality and visualization cost | Reliable work-unit/dependency capture | Team beta |
| Critical-path detection | Requires validated dependency graph and planning semantics | Dependency precision and user trust | Later coordination |
| Team Pace dashboard | Risk of surveillance and misinterpretation | Valid flow metrics and governance research | Later coordination |
| Parallel-work recommendations | Requires trustworthy blocker/dependency state | Blocker precision and accepted suggestions | Later coordination |
| Git provider integration | Local Git evidence is enough for first loop | Repeated user need for remote PR/commit context | Post-MVP |
| Issue tracker integration | Shoo work unit avoids initial dependency | Strong demand for issue linking/automation | Post-MVP |
| Slack/notification integrations | Does not improve initial resume loop | Team async coordination demand | Team release |
| Additional coding-agent adapters | Dilutes capture quality and evaluation | OpenCode/Codex loop meets thresholds | Post-MVP |
| Enterprise SSO/SCIM | Commercially relevant but not core hypothesis | Enterprise design partner or procurement need | Enterprise track |
| Self-hosted control plane | High operational support burden | Confirmed enterprise data-residency demand | Enterprise track |
| Advanced graph/timeline visualization | Visual depth before decision utility | Usability evidence that current views fail | Post-MVP |
| Complete billing self-service | Private beta can be manually provisioned | Pricing and packaging validated | Commercial beta |

## Rejected feature catalogue

| Feature | Decision | Rationale | Reversal condition |
|---|---|---|---|
| General-purpose chatbot | Reject | Breaks project-evidence boundary and weakens positioning | None within current Product DNA |
| Transcript archive as canonical memory | Reject | Noise, privacy, stale truth, poor authority semantics | None; transcript remains evidence only |
| Persist every realtime event to Walrus | Reject | Violates hot/durable separation and adds latency/cost | None under ADR-PROD-004 |
| Automatic canonicalization of high-impact agent claims | Reject | Violates human authority and trust model | Deterministic validation for a narrow low-impact type only |
| Autonomous task assignment/orchestration | Reject for foreseeable roadmap | Core memory and coordination are unproven | New product gate after team evidence |
| Individual productivity score | Reject | Surveillance risk and invalid performance inference | None under Product Principle 6 |
| Tokens, incentives, or blockchain-facing UX | Reject | Walrus is infrastructure, not user value by terminology | New product strategy decision |
| Universal agent support at launch | Reject | Breadth reduces reliability and slows evaluation | After adapter contract and core thresholds |
| Raw source code durable on Walrus by default | Reject | Privacy, retention, cost, and deletion risk | Explicit project policy with security review |
| Last-write-wins canonical truth | Reject | Recency is not authority; destroys conflict lineage | None under accepted authority model |
| Separate Kage and Sensei product tiers | Reject | Reintroduces duplicated identity, semantics, and packaging | New buyer evidence and sponsor-level reversal |

## Anti-scope-creep test

Before reconsidering a deferred feature, answer all of the following:

1. Which accepted JTBD and scenario does it serve?
2. Which measured failure or user evidence requires it?
3. Why can the outcome not be achieved with current scope?
4. Which MVP or roadmap item is displaced?
5. Does it preserve privacy, authority, provenance, and hot/durable separation?
6. Is the decision reversible?

If these cannot be answered, the feature remains deferred or rejected.
