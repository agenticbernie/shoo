# Shoo Screen-Level UI Specifications

- Version: 0.1
- Status: Accepted — Decision Gate 7
- Owner role: Principal Product Designer / Staff Frontend Engineer
- Dependencies: Accepted Phase 6 Screens/Wireframes; Design Tokens; Component System
- Assumptions: Desktop-first Web with light/dark parity; CLI remains the authoritative local setup surface
- Unresolved questions: Final prototype density; whether onboarding is CLI-led with Web handoff or embedded browser wizard
- Last decision: Apply one visual hierarchy across onboarding, Pulse, Ask, Activity, Knowledge and Settings while preserving task-specific layouts
- Next action: Produce representative high-fidelity prototypes for usability and visual QA

## Global shell

- Canvas uses `surface.canvas`; navigation and main surfaces are separated by border, not heavy shadow.
- Left navigation 232px; project identity at top; Settings anchored below primary tasks.
- Page header contains title, current scope/freshness and at most one primary action.
- Source Drawer appears on the right without shifting reading position where space permits.
- Content density defaults comfortable; Activity and Memory Explorer may offer compact mode.

## Onboarding and project connection

Visual sequence:

1. Progress rail with outcome stages: Project, Agents, Capture, Durable Memory, Test.
2. One decision per panel; explanatory diagram only at trust boundary.
3. Safe-default policy summary uses destination rows, not a matrix of every event.
4. Configuration diff uses mono filenames/keys and explicit Add/Change/No change status.
5. Wallet/Manual screen uses owner → account → project space → device access diagram.
6. Completion separates Capture ready, First checkpoint pending and Durable Memory verified.

No celebratory confetti; success is a concise verified checklist and next action.

## Project Pulse

- Page title and last-view freshness lead.
- Required-action banner appears only for material trust/security/continuation impact.
- Resume Target is visually dominant through size and content, not saturated background.
- “Since last visit” uses a short timeline/list.
- Relevant decisions use compact status rows.
- Continuity health uses the Sync State Cluster and client health rows.
- Empty state collapses the page to one guided setup/start action.

## Work and Work Unit Detail

- Work list uses section headers Needs attention, Active, Unfinished and Recently completed.
- Status appears as label/icon; no Kanban board in MVP.
- Work Unit Detail uses two columns desktop: main continuity narrative and sticky trust/context rail.
- Resume CTA appears with preview/freshness; completion action is secondary and requires explicit work-state intent.
- Files/tests are reference lists with code-aware typography, not generic attachment cards.

## Ask Shoo

- Question input is standard command/search field, not glowing AI composer.
- Scope bar precedes the question.
- Answer state and limits appear before Facts when material.
- Facts use readable 720px column and citation anchors.
- Inferences and Suggestions use labelled secondary surfaces.
- Source manifest and correction actions form a stable footer.
- Follow-ups appear as a scoped thread below reports, but each answer retains report structure.

## Activity Timeline and Agents & Sessions

- Sticky filter toolbar; active filters display as removable labelled chips.
- Timeline has a single vertical guide, semantic event icons and grouped session headers.
- Known capture gaps interrupt the line visually and textually.
- Agent Session Cards emphasize capture health and provenance, not volume.
- Dense audit metadata is disclosed inline or in Source Drawer.

## Decisions

- Default table/list sections: Needs attention, Current, Proposed, Historical.
- Decision row: subject, statement excerpt, scope, status, effective time, source count.
- Decision Detail dedicates a narrow rail to state/scope/freshness and main column to statement/rationale/lineage.
- Superseded content remains readable with muted surface and a strong successor link.

## Memory Explorer

- Query/filter control is compact and deterministic.
- Result rows show type, claim excerpt, authority, scope, source/time and durability separately.
- Semantic relevance score is not shown as truth confidence.
- Bulk canonicalization is prohibited; bulk low-risk retention/policy actions require preview.

## Conflict Resolution

- Amber attention border/background is restrained; red only when security/destructive consequence exists.
- Conflicting sides receive equal visual weight.
- Resolution choices use radio/card selection followed by impact preview.
- Confirm action names the operation; Keep unresolved remains a legitimate visible option.
- Stale-version response overlays a comparison and requires re-review.

## Settings

- Settings uses local secondary navigation and task-specific panels.
- Connections prioritizes client health/action.
- Capture Policy uses route preview and real examples.
- Durable Memory separates owner/account, project space, device access, health and retention.
- Privacy & Data uses layer-by-layer deletion status and explicit residual retention.
- Diagnostics uses neutral technical table and copyable safe reference IDs.

## Critical responsive behaviors

- At `<1100px`, Source Drawer overlays; main content state is preserved.
- At `<768px`, navigation becomes modal menu and complex conflict/policy editing becomes view-only with desktop guidance.
- Tables become structured cards; column meaning is retained as labels.
- Primary action remains reachable without sticky overlays obscuring content or focus.

## Screen visual QA checklist

- One obvious primary action or none.
- Current scope/freshness visible.
- Source access within one interaction.
- Conflict/partial/denied states cannot resemble success.
- Light/dark theme hierarchy equivalent.
- 200% zoom and long Vietnamese text do not truncate critical meaning.
- No future Coordination affordance appears.
