# Shoo Component System Specifications

- Version: 0.1
- Status: Accepted — Decision Gate 7
- Owner role: Design Systems Lead / Staff Frontend Engineer / Accessibility Lead
- Dependencies: Design Tokens; Phase 6 Component Architecture; State Grammar
- Assumptions: Components expose semantic state and provenance data rather than infer truth from display strings
- Unresolved questions: Framework-specific composition API; virtualization threshold for timeline and memory lists
- Last decision: Prioritize evidence, state and recovery components; future Coordination components remain documented but not MVP implementation-authorized
- Next action: Prototype high-risk components in Storybook-equivalent isolation and screen context

## Component rules

- Every state component exposes text, icon and accessible name.
- Components do not merge authority, freshness and sync into one status prop.
- Source/citation controls remain keyboard-operable and stable during streaming.
- Destructive actions are never the visually dominant default.
- Dense components provide comfortable and compact modes; compact is not used during onboarding or conflict resolution.

## MVP domain components

### Project Pulse Card

- Purpose: summarize one actionable project condition.
- Anatomy: eyebrow/state, title, evidence summary, time/scope, primary action, source/health footer.
- Variants: Resume Target, Material Change, Decision Attention, Continuity Health.
- States: empty, current, partial, stale, conflict, denied.
- Rule: maximum one primary Pulse card; avoid dashboard tile uniformity.

### Agent Session Card

- Anatomy: client icon/name, session/work identity, capture health, started/ended time, checkpoint result, source link.
- Active animation is a static live indicator plus text, not pulsing indefinitely.
- Never shows productivity rank or comparative volume.

### Memory Source Chip

- Contains source type icon, short label/index and optional restricted/local marker.
- Opens Source Drawer; tooltip is supplementary only.
- Citation numbering remains stable within a response/context pack.

### Decision Status

- Variants: Proposed, Accepted, Canonical, Conflict, Superseded, Rejected.
- Canonical uses cobalt + compass/check icon; Accepted uses teal + check; Conflict amber + split icon; Superseded neutral/violet + history icon.
- Never encode canonical as “greenest.”

### Timeline Event

- Anatomy: semantic icon, event title, outcome, source actor/client, event/source time, ingestion variance, scope, related object.
- Duplicate/out-of-order are secondary audit annotations.
- Expand reveals normalized metadata, not raw transcript by default.

### Context Pack Preview

- Fixed section order: Warning/limits, Objective, Current progress, Decisions, Tests, Relevant artifacts/files, Uncertainty, Next action, Sources.
- Shows token-budget/omission summary only in detail.
- Conflict warning cannot be collapsed below the suggestion.

### Canonical Badge and Superseded Badge

- Badges are semantic shortcuts, not the only state explanation.
- Canonical badge includes scope in accessible label.
- Superseded badge links to successor; historical content is visually muted but remains readable.

### Conflict Resolution Panel

- Side-by-side only when width permits; otherwise sequential labelled sides.
- Includes subject/scope, permitted evidence, resolution action, impact preview and version check.
- No preselected winner. Restricted side uses equal-size neutral placeholder to avoid metadata leakage.

### Ask Shoo Response

- Evidence-report container with state header and Facts, Inferences, Suggestions, Limits sections.
- Facts use citation anchors; inference/suggestion use distinct label and subtle surface, not color alone.
- Streaming cannot reorder already-cited claims without announcing an update.

### Source Drawer

- Width 400–480px desktop; route-addressable.
- Header: source type/status; body: permitted excerpt, provenance, scope/time, lineage; footer: inspect related/correct.
- Restricted/unavailable states preserve provenance metadata only as permitted.

### Sync State Cluster

- Three-step compact model: Device → Shoo → Durable.
- Each step has explicit status and timestamp.
- Durable confirmed never implies canonical; canonical appears separately.

### Policy Route Preview

- Displays data class and destination: Keep on device, Sync to Shoo, Save durable copy, Share, Deny.
- Uses plain-language example and effective change diff.
- Raw prompts/source default to Keep on device.

## Foundation components

Button, icon button, link, text input, command input, select, combobox, checkbox, radio, switch, tabs, breadcrumb, table/list, disclosure, tooltip, popover, drawer, dialog, banner, inline notice, toast, progress, skeleton and empty state follow tokens and accessibility contracts.

Key constraints:

- Switch only for immediate reversible binary settings; policy/trust-mode changes use explicit apply flow.
- Dialog only for blocking/high-impact decisions.
- Tooltip cannot contain required instructions or actions.
- Toast is never the only persistence/error record.

## Future Coordination components — design lineage only

These components are specified for coherence but are not authorized for MVP implementation:

### Blocker Card

- Shows blocker type, affected work, critical-path relevance, evidence, owner/next review and alternative work.
- Severity never implies employee fault.

### Handoff Pack

- Shows objective, completed/unfinished, decisions, files/tests, blockers, next action, freshness and sources.
- Readiness is evidence completeness, not a person score.

### Dependency Node

- Encodes state by shape/icon/text; edges identify hard/soft/information/approval relationships.
- Graph has linear accessible alternative.

### Team Flow Metric

- Supports handoff latency, blocked time, dependency wait, recovery time, WIP and stale work.
- No individual comparison, prompt count, token count, online hours or code-volume ranking.

## Component quality gates

- All states demonstrated in isolation and real screens.
- Keyboard, screen reader, zoom, dark mode and reduced motion pass.
- Long Vietnamese/English strings and missing/restricted metadata tested.
- Permission changes and stale-version updates tested live.
- No future Coordination component appears in MVP bundles/routes/backlog.
