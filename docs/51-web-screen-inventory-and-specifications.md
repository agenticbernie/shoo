# Shoo Web Screen Inventory and Specifications

- Version: 0.1
- Status: Accepted — Decision Gate 6
- Owner role: Principal Product Designer / Principal UX Architect
- Dependencies: UX Architecture; PRD; Web/API Contracts; Conflict Resolution Design
- Assumptions: Minimal Web governance is MVP Slice D; desktop is primary; coordination screens are deferred
- Unresolved questions: Whether Work and Activity need saved views in MVP; mobile approval demand
- Last decision: Keep six project-level primary destinations and reveal detail through stable drawers/routes
- Next action: Create low-fidelity screen prototypes and conduct navigation/source/correction usability tests

## MVP screen inventory

| ID | Screen | Primary question | Primary action |
|---|---|---|---|
| WEB-01 | Project Pulse | Where is the project and what should I continue? | Resume work |
| WEB-02 | Work | What is active, unfinished or historical? | Open/resume work unit |
| WEB-03 | Work Unit Detail | What is the current state of this bounded work? | Resume or checkpoint |
| WEB-04 | Ask Shoo | What does project evidence support? | Ask scoped question |
| WEB-05 | Activity Timeline | What changed, when and through what source? | Inspect event/session |
| WEB-06 | Agents & Sessions | Is capture healthy and what contributed evidence? | Diagnose session/client |
| WEB-07 | Decisions | What decisions currently govern the project? | Inspect/propose/correct |
| WEB-08 | Decision Detail | Why is this current and what did it supersede? | Open sources or correction |
| WEB-09 | Memory Explorer | What structured memory exists and with what authority? | Filter/inspect/correct |
| WEB-10 | Conflict Review | What claims cannot coexist and how should scope/truth change? | Resolve or keep unresolved |
| WEB-11 | Source Drawer/Route | What evidence supports this claim? | Navigate lineage/correct |
| WEB-12 | Connections | Which clients are connected and healthy? | Repair/connect |
| WEB-13 | Capture Policy | What is captured and where does it go? | Preview/apply policy |
| WEB-14 | Durable Memory | Is user-owned long-term memory ready and healthy? | Continue setup/revoke/test |
| WEB-15 | Access | Who can access this project and at what scope? | Manage membership/roles |
| WEB-16 | Privacy & Data | How do I export, restrict or delete data? | Start governed operation |
| WEB-17 | Diagnostics | What is failing without exposing content? | Copy/download safe report |

## Project Pulse specification

Priority order:

1. Blocking trust/action banner: capture outage, permission change, conflict affecting resume, incompatible version.
2. Resume card: work unit, objective, last verified progress, next action, freshness and context completeness.
3. Since last visit: material decisions, completed/unfinished work and capture gaps—not raw event count.
4. Current decisions/conflicts relevant to active work.
5. Continuity health: connected clients, last checkpoint, operational/durable state.

Empty state: explain that Shoo has no project memory yet and provide one action—start a supported agent session—plus connection health.

## Work and Work Unit Detail

Work list grouping: `Needs attention`, `Active`, `Unfinished`, `Recently completed`. Default sort is actionable state then recency; no sort by person performance.

Work Unit Detail regions:

- identity: title/objective, branch/worktree, current state;
- resume: next safe action and context preview;
- progress: accepted facts versus unverified claims;
- decisions/tests/files/artifacts;
- session/checkpoint timeline;
- sources, freshness, capture and durable status;
- corrections/history.

## Ask Shoo specification

- Starts with intent suggestions: `Where should I continue?`, `What changed?`, `Why was this decided?`, `Has this bug occurred?`, `What is unfinished?`.
- Scope bar shows project, work/branch if applied and timeframe.
- Response uses labelled sections: Facts, Inferences, Suggestions, Limits.
- Inline citation markers open Source Drawer; response-level manifest shows freshness/completeness.
- Follow-ups retain visible scope. A general non-project question is declined or redirected.
- No-evidence state offers search-scope changes or capture instructions, not a plausible answer.

## Activity and Agents & Sessions

Timeline groups normalized events by session/checkpoint while preserving event time and ingestion time. Filters include type, work unit, branch, client, authority and sync state. Raw chat is absent by default.

Agents & Sessions displays capability/health and contribution provenance. It prohibits leaderboard, rank, token/commit/prompt counts and individual productivity interpretation.

## Decisions and Memory Explorer

Decisions default to Current, then Proposed/Conflicted, then Superseded history. Each row exposes subject, scope, status, effective time, rationale summary and source count.

Memory Explorer supports typed filters, authority, scope, source, time, branch and durable state. Search results never imply canonical authority through ranking position.

## Conflict Review

- State conflict subject and normalized scope first.
- Show each permitted side with authority, effective time and evidence.
- Restricted side appears only as `Additional restricted evidence exists`.
- Actions: select, merge, split scope/time, downgrade authority, deprecate, keep unresolved.
- Preview affected context packs, Ask answers and future consumers before confirmation.
- No default winner and no recency-only resolution.

## Settings specifications

- Connections: client capability, trust, version, last event and repair action.
- Capture Policy: data-class routing in product language with examples and impact preview.
- Durable Memory: owner/account/namespace/device status in plain language; technical details expandable.
- Access: role/scope matrix; personal data cannot be broadened silently.
- Privacy & Data: layer-specific export/deletion/retention truth.
- Diagnostics: content-safe health, trace and support report.

## Deferred screens

Blockers, Dependencies, Handoffs, Team Pace and Critical Path are not MVP routes. Their future IA remains under `Flow`, contingent on a new product scope gate and anti-surveillance validation.
