# Shoo UX Copy and Accessibility Specification

- Version: 0.1
- Status: Accepted — Decision Gate 6
- Owner role: Technical Writer / Content Designer / Accessibility Lead
- Dependencies: UX Architecture; Interaction Rules; Security and Trust Model
- Assumptions: Product language should explain outcomes first and expose infrastructure terms progressively
- Unresolved questions: Localized Vietnamese product copy at launch; exact wallet terminology from chosen integration surface
- Last decision: Use precise state language, distinguish fact/inference/suggestion, and prohibit success copy before verified stage completion
- Next action: Run terminology/comprehension testing in English and Vietnamese with target developers

## Voice principles

- Calm: state what happened without alarm unless action is urgent.
- Precise: name stage, scope and consequence.
- Accountable: Shoo says what it knows, cannot access or failed to confirm.
- Actionable: offer the smallest safe recovery.
- Technical on demand: outcome language first; protocol/provider detail expandable.

## Preferred terminology

| Use | Avoid by default | Reason |
|---|---|---|
| Work / Work Unit | task graph node | Works without issue tracker |
| Checkpoint | saved chat / AI memory | Represents structured continuity boundary |
| Current decision | latest answer | Authority, not recency alone |
| Source | RAG chunk | User-recognizable provenance |
| Durable Memory | Walrus blob | Outcome before infrastructure |
| Device access | delegate key | Security concept before protocol detail |
| Operational copy | hot state | User outcome |
| Pending durable copy | blockchain pending | Accurate without unnecessary Web3 language |

Technical details may name MemWal, Walrus, namespace, epochs, delegate and locator accurately.

## State copy patterns

| State | Recommended pattern |
|---|---|
| Empty | `No checkpoint exists for this work yet. Start a connected session or create one manually.` |
| Partial | `Some session evidence is missing from 14:20–14:43. This summary may be incomplete.` |
| Stale | `Last confirmed 2 hours ago. A newer change may exist on another branch.` |
| Conflict | `Shoo found two accepted values for this project-level decision. No single current answer is available.` |
| Denied | `You do not have access to this source. The answer may be limited.` |
| Offline | `Saved on this device. Shoo will sync when the connection returns.` |
| Durable pending | `Available for continuation. The user-owned durable copy is still pending.` |
| Durable failed | `Operational memory is safe, but the durable copy was not confirmed. Retry or inspect details.` |
| Unknown | `Shoo does not have enough permitted current evidence to answer this.` |
| Superseded | `Historical. Replaced by Decision D-42 on 14 July 2026.` |

## Fact, inference and suggestion language

- Fact: declarative only with citation and freshness.
- Inference: `Shoo infers… because…`; cite supporting evidence and uncertainty.
- Suggestion: `Suggested next step…`; state that it is optional and why it follows.
- Unsupported agent claim: `Agent-reported; not verified.`
- Restricted support: `Additional restricted evidence may affect this answer.`

## Confirmation copy anatomy

1. Action: what will change.
2. Scope: project/work/branch and visibility.
3. Impact: context packs, Ask answers, devices or durable state.
4. Reversibility: what can/cannot be undone.
5. Evidence: current version/source where relevant.
6. Explicit action label: `Supersede decision`, not `Confirm`.

## Error message anatomy

`Outcome + preserved safety + cause class + next action + reference`

Example: `Checkpoint saved on this device, but cloud sync could not be confirmed. Your work is safe locally. Retry after reconnecting. Reference: SYNC-4F2.`

Do not expose stack traces, raw provider errors, keys, locators or tenant identifiers in ordinary UX.

## Accessibility acceptance criteria

- WCAG 2.2 AA automated and manual review for MVP Web routes.
- Complete keyboard operation, visible focus and no focus traps.
- Screen reader identifies page, scope, status, citation and available action.
- Color contrast meets AA; status is encoded redundantly.
- 200% zoom preserves actions/content without two-dimensional scrolling except valid data tables/graphs.
- Target sizes meet WCAG 2.2 minimum where applicable.
- Errors are associated with fields and summarized for long forms.
- Dynamic operation progress is announced by stage, not every update.
- CLI supports plain text, `NO_COLOR`, numbered choices and stable machine-readable output.

## Localization rules

- Store state/action copy as semantic message IDs, not concatenated fragments.
- Dates display locale and timezone; source time and ingestion time remain distinguishable.
- Avoid idioms and metaphors that obscure authority or durability.
- English technical nouns may remain where standard, with Vietnamese explanation on first use.
