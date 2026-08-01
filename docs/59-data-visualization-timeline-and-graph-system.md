# Shoo Data Visualization, Timeline and Graph System

- Version: 0.1
- Status: Accepted — Decision Gate 7
- Owner role: Principal Product Designer / Data Visualization Designer / Accessibility Lead
- Dependencies: Product Principles; Design Tokens; Component System; Anti-Surveillance Requirements
- Assumptions: MVP emphasizes timeline and small evidence relationships; full dependency/critical-path graphs are future scope
- Unresolved questions: Large-project timeline density; graph engine only when Coordination is re-authorized
- Last decision: Use visualization only for temporal, lineage or relationship comprehension; prohibit decorative analytics and individual performance charts
- Next action: Validate timeline and decision-lineage prototypes with realistic event density

## Visualization principles

1. Answer a user question, not “show data.”
2. Prefer list/table when relationship is not materially clearer as a visual.
3. Show uncertainty, missing intervals and restricted evidence explicitly.
4. Provide text/table equivalent for every graph.
5. Never infer individual performance from activity or agent volume.
6. State and scope labels remain visible; color is secondary.

## MVP visualization inventory

| Visual | User question | Form | MVP |
|---|---|---|---|
| Activity timeline | What changed and in what order? | Vertical grouped timeline | Yes |
| Session/checkpoint lane | Which session produced which checkpoint? | Compact swimlane | Yes |
| Decision lineage | What superseded what? | Linear/branched lineage | Yes |
| Sync progression | Where is this memory preserved? | Three-step status sequence | Yes |
| Capture completeness | Is there a known evidence gap? | Segmented interval bar + text | Yes |
| Retrieval/source composition | What supported the answer? | Counts/list, not chart by default | Optional detail |
| Dependency graph | What blocks what? | Directed typed graph | Future |
| Critical path | Which dependency affects delivery? | Graph overlay | Future |
| Team flow trend | Is work-system flow improving? | Line/control chart | Future |

## Activity timeline

- Vertical axis represents source/event time; ingestion delay is annotated, not used as primary ordering.
- Events group under session/checkpoint boundaries.
- Gap region uses dashed boundary plus `Evidence may be missing from…` text.
- Out-of-order arrival gets an audit marker; the item is placed by source time when reliable.
- Current filter/scope stays sticky.
- Virtualize only after measured threshold; preserve keyboard reading order and URL anchors.

## Decision lineage

- Nodes: Proposed, Accepted, Canonical, Conflict, Superseded.
- Solid directed edge: explicit supersession.
- Dashed edge: proposed relationship or unresolved merge.
- Branch split: scope/time split, not “version competition.”
- Default view centers current governing decision and immediate predecessor/successor.
- Screen-reader alternative lists lineage chronologically with relationship verbs.

## Sync progression

```text
[Device ✓ 10:32] ─ [Shoo ✓ 10:33] ─ [Durable … pending]
Authority: Accepted · Freshness: Current
```

The separate Authority line prevents preservation from implying truth.

## Future dependency graph rules

- Hard dependency: solid directional edge.
- Soft/information/approval dependency: distinct line pattern plus label.
- Node shape/icon/text communicates state; color assists only.
- Critical-path emphasis is calculated and source-backed; no “AI predicted” glow.
- Cluster by work/module/team scope, never by developer productivity.
- Offer table: upstream, downstream, type, state, evidence and alternative path.

## Team flow metrics — future

Permitted:

- handoff latency;
- blocked time;
- dependency wait time;
- context recovery time;
- cycle time;
- WIP;
- stale work;
- conflict rate;
- continuation success.

Prohibited:

- developer leaderboard;
- prompt/token/commit/line counts as productivity;
- hours-online chart;
- agent-use comparison by employee;
- composite performance score.

## Palette and labeling

- Categorical series use cobalt, teal, violet, amber and neutral with shapes/dashes.
- Red is reserved for critical/security/terminal failure, not ordinary negative trend.
- Sequential scales use one hue and labelled endpoints.
- Do not use red–green oppositions without shape/text.
- Chart titles state the question; captions state scope, timeframe and missing data.

## Visualization quality tests

- Correct reading in grayscale and common color-vision simulations.
- Keyboard navigation and textual equivalent produce the same conclusion.
- Restricted evidence does not leak through edge count, node size or layout.
- Missing data cannot appear as zero.
- Participant cannot interpret flow metrics as an individual ranking without contradicting visible copy.
