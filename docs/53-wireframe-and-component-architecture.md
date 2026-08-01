# Shoo Wireframe and Component Architecture

- Version: 0.1
- Status: Accepted — Decision Gate 6
- Owner role: Principal Product Designer / Staff Frontend Engineer
- Dependencies: Web Screen Inventory; Interaction Rules; Information Architecture
- Assumptions: Phase 6 specifies hierarchy and behavior only; visual tokens and final component styling belong to Phase 7
- Unresolved questions: Default right-drawer width after prototype; density preferences for large projects
- Last decision: Use a stable three-region desktop shell and reusable evidence/state components across Pulse, Work, Ask and Knowledge
- Next action: Convert specifications into low-fidelity interactive prototypes for Gate 6 validation

## Application shell

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Project selector | Global search                          Help Account│
├───────────────┬──────────────────────────────────┬───────────────────┤
│ Primary nav   │ Page heading + scope/actions     │ Context drawer    │
│ Pulse         ├──────────────────────────────────┤ Sources / history │
│ Work          │ Main task-focused content        │ / correction      │
│ Ask Shoo      │                                  │                   │
│ Activity      │                                  │                   │
│ Knowledge     │                                  │                   │
│ Settings      │                                  │                   │
└───────────────┴──────────────────────────────────┴───────────────────┘
```

The context drawer is absent until invoked and retains a route so evidence can be linked/shared subject to permission.

## Project Pulse wireframe

```text
[Project name] [freshness]                         [Resume work]
[Required action / trust warning — only if material]

┌ Resume target ──────────────────────────────────────────────┐
│ Work unit · objective · last verified progress              │
│ Next safe action                                            │
│ Context: current/partial · sources · capture/durable state  │
└──────────────────────────────────────────────────────────────┘

Since your last visit                    Relevant decisions
- material change                        - current / conflict
- unfinished result                      - source and scope

Continuity health
[OpenCode] [Codex] [last checkpoint] [operational] [durable]
```

If no memory exists, the resume card becomes one guided empty-state panel; other empty cards are suppressed.

## Ask Shoo wireframe

```text
[Project scope] [Work/branch: optional] [Time: current] [Reset]
[Question input.....................................] [Ask]
[Intent suggestions]

Answer state: Current / Partial / Conflict / Unknown
Facts
- Claim [1] [freshness]
Inferences
- Labelled inference [supporting sources]
Suggestions
- Next action [why]
Limits
- Missing/restricted/stale evidence

[Source manifest] [Correct memory] [Ask follow-up]
```

Chat bubbles are not the dominant layout. The response is an evidence report with conversational follow-up.

## Decision detail and conflict review

```text
[Decision subject] [Canonical/Conflict/Superseded] [scope] [effective]
Current statement / unresolved summary
Rationale
Affected work/files
Sources and authority
Lineage: proposed → accepted → superseded

[Inspect source] [Propose correction] [Resolve conflict—authorized]
```

Conflict mode replaces the single current statement with parallel permitted sides and a resolution preview workspace. Restricted evidence does not expose layout-dependent hints such as title length.

## Component architecture

| Component | Responsibility | Required states |
|---|---|---|
| Project Pulse Card | Outcome summary and next action | empty, current, partial, conflict, denied |
| Resume Target Card | Work objective/progress/context CTA | ambiguous, stale, unavailable |
| Agent Session Card | Provenance and capture health | active, completed, failed, partial |
| Memory Source Chip | Source type/time/scope entry point | restricted, local unavailable |
| Evidence Manifest | Completeness/freshness/source summary | current, partial, stale, conflict |
| Decision Status | Authority and lineage | proposed, accepted, canonical, conflict, superseded |
| Timeline Event | Normalized event summary | duplicate, out-of-order, redacted |
| Context Pack Preview | Token-bounded sections and warnings | ready, partial, stale, conflict |
| Ask Shoo Response | Facts/inferences/suggestions/limits | unknown, denied, partial, conflict |
| Source Drawer | Evidence/provenance/lineage actions | loading, restricted, unavailable |
| Correction Preview | Scope/consumer impact and confirmation | stale version, denied, high impact |
| Sync State Cluster | Local/operational/durable status | pending, confirmed, failed |
| Capture Health | Client/capability completeness | healthy, degraded, partial, unavailable |
| Operation Progress | Async stage/retry/result | queued, running, failed, complete |

Phase 7 owns typography, spacing, colors, surfaces, iconography and data-visual styling. Component names here define semantic contracts, not final visual appearance.

## Frontend state model

- URL owns project, page, selected work/decision/memory/source and shareable filters.
- Server owns authorization, canonical state and operation truth.
- Client owns temporary form/drawer/filter state and optimistic low-risk affordances only.
- Canonical/correction/conflict mutations require expected version; no optimistic truth replacement.
- Permission/correction/supersession events invalidate affected client queries and context previews.

## Responsive transformation

- Navigation collapses to labelled menu.
- Context drawer becomes full-height overlay with preserved back navigation.
- Two-column comparison becomes sequential sides with explicit labels.
- Dense tables become semantic cards; filters move to modal sheet.
- Mobile disallows complex merge/policy editing in MVP but supports viewing source, approving/rejecting simple preview and monitoring operations.
