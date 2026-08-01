# PRD — Shoo Core

- Version: 0.2
- Status: Accepted — Decision Gate 4
- Owner role: Principal Product Manager / Principal UX Architect
- Dependencies: PRD Overview; accepted work-unit/session lifecycles; Product Scope
- Assumptions: Work unit is understandable with targeted confirmation; client stop is never task completion
- Unresolved questions: Match-confidence thresholds; useful-action signal definition
- Last decision: Sponsor approved Core requirements and acceptance criteria
- Next action: Map Core aggregates, commands, events, and interfaces during Phase 5

## Executive summary

Shoo Core manages project linking, work-unit identity, session lifecycle, semantic checkpoints, interrupted recovery, and cross-agent resume orchestration. It does not decide durable storage implementation, retrieval algorithms, or team coordination.

## Users

- Primary: solo developer using OpenCode and Codex.
- Expansion: team developer and temporary inheritor; not MVP UX.

## Goals

- Start a session with correct work-unit context.
- Preserve resumable progress without manual memory entry.
- Keep session status separate from work completion.
- Resume in another agent and measure the outcome.

## Non-goals

- Issue tracker replacement.
- Sprint/project management.
- Team assignment or critical path.
- Universal client parity.

## Functional requirements

| ID | Requirement | Priority | Acceptance criteria | Trace |
|---|---|---|---|---|
| SHOO-FR-001 | User shall sign in and link a local repository/worktree to one Shoo project. | P0/A | Reopening the same identity resolves the same project; mismatch/duplicate flow is explicit. | PROB-01/03; GOAL-01; SCN-01; FND-001/002; TC-CORE-001 |
| SHOO-FR-002 | Shoo shall propose, create, select, and reassign a work unit with optional branch/issue links. | P0/A | Ambiguous fixture prompts targeted selection; reassignment preserves audit lineage and invalidates wrong packs. | PROB-02/03; GOAL-01; SCN-01; WRK-001; TC-CORE-002 |
| SHOO-FR-003 | Shoo shall create a session identity from supported client lifecycle evidence. | P0/A | OpenCode/Codex start produces scoped session with capability manifest and source event. | PROB-01/02; GOAL-02; SCN-01; WRK-002; TC-CORE-003 |
| SHOO-FR-004 | Shoo shall show session capture health and completeness independent of session/work state. | P0/A | Disabled/partial adapter displays degraded state and affected context completeness. | PROB-02; GOAL-02/03; SCN-01; FND-003/CAP-007; TC-CORE-004 |
| SHOO-FR-005 | Shoo shall initiate semantic checkpoints at explicit, pre-compaction, stop, blocker, verified test transition, and recovery boundaries supported by policy/capability. | P0/B | Each trigger fixture creates at most one checkpoint candidate with reason; idle alone never completes work. | PROB-02/03; GOAL-02; SCN-01; CAP-005; TC-CORE-005 |
| SHOO-FR-006 | A checkpoint shall represent objective, verified progress, partial changes, tests, blockers, uncertainty, and next action where evidence exists. | P0/B | Interrupted fixture distinguishes last verified checkpoint from partial tail. | PROB-02/03; GOAL-01/02; SCN-01; CAP-005/006; TC-CORE-006 |
| SHOO-FR-007 | Session state and work-unit state shall transition independently. | P0/B | Stop/error/idle cannot mark work completed without separate outcome evidence and authorized rule. | PROB-02; GOAL-03; SCN-01; WRK-002/003; TC-CORE-007 |
| SHOO-FR-008 | Shoo shall represent unfinished, paused, blocked, verification, completed, and reopened work-unit states. | P0/B | Lifecycle fixture allows valid transitions, rejects invalid implied transitions, and preserves history. | PROB-02/03; GOAL-01/03; SCN-01; WRK-003; TC-CORE-008 |
| SHOO-FR-009 | Shoo shall recover interrupted/degraded sessions from last safe checkpoint plus labeled partial evidence. | P0/B | Crash/restart scenario resumes without claiming missing interval completeness. | PROB-02; GOAL-01/02; SCN-01; WRK-004; TC-CORE-009 |
| SHOO-FR-010 | At supported session start, Shoo shall request/build context for the selected work unit. | P0/C | Context request includes project/work unit/client/branch/scope/token budget and capture state. | PROB-01/03; GOAL-01; SCN-01; RET-004/RES-001; TC-CORE-010 |
| SHOO-FR-011 | Shoo shall deliver the continuation context to Codex through the supported agent interface. | P0/C | Codex receives pack and sources for the selected OpenCode work unit. | PROB-01/03; GOAL-01; SCN-01; RES-002; TC-CORE-011 |
| SHOO-FR-012 | Shoo shall record a resume attempt, manual re-explanation signal, and first useful action signal without inferring human performance. | P0/C | Evaluation fixture records SCRR inputs and excludes tokens/hours/code-volume scoring. | PROB-03; GOAL-01; SCN-01; RES-003/OPS-003; TC-CORE-012 |
| SHOO-FR-013 | User shall be able to correct work-unit selection or state without deleting original evidence. | P1/D | Correction reassigns/updates derived state, preserves lineage, and changes later context. | PROB-03; GOAL-03/05; SCN-01; WRK-001/CAP-006; TC-CORE-013 |
| SHOO-FR-014 | Shoo Web shall present current project state and recommended resume target. | P1/D | Overview shows current work unit, freshness, unfinished work, capture/durable status, and source access. | PROB-03; GOAL-01/05; SCN-03; WEB-001/004; TC-CORE-014 |

## Data requirements

- Project identity shall survive local path changes through an explicit reconciliation flow.
- Work-unit identity shall not depend exclusively on branch or issue identifiers.
- Session records shall declare client and supported/unsupported capability fields.
- Checkpoints shall link source events and partial-tail state.
- Useful-action/manual-recap signals shall be evaluation events, not productivity data.

## UX requirements

- Work-unit ambiguity uses a compact choice, not a required project-management form.
- Capture health remains visible but low-noise during normal work.
- Stop/interruption/checkpoint/work completion use distinct language.
- Resume pack preview exposes objective, next action, sources, freshness, and completeness.

## Telemetry

- project-link success/failure;
- work-unit match confidence and user correction;
- session start/stop/interruption/degraded state;
- checkpoint trigger and completion;
- context request/delivery;
- resume attempt, recap signal, first useful action;
- correction/reassignment.

## Security and permission requirements

- Project linking requires authenticated project scope.
- Work-unit and session metadata must not leak across projects.
- Client/source identifiers are evidence, not authorization.
- Resume context honors current permissions at delivery time.

## Rollout

- Slice A: SHOO-FR-001–004.
- Slice B: SHOO-FR-005–009.
- Slice C: SHOO-FR-010–012.
- Slice D: SHOO-FR-013–014.

## Risks

- Work-unit UX becomes overhead.
- Checkpoint triggers overfire or miss partial work.
- Useful-action measurement becomes subjective or surveillance-adjacent.
- Client lifecycle changes break state mapping.

## Open questions

- Match-confidence thresholds belong to prototype evaluation.
- Whether first useful action uses user confirmation, agent/tool evidence, or a combined rubric belongs to Phase 9.
