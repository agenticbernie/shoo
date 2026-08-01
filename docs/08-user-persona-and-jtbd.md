# Shoo User, Persona and Jobs-to-Be-Done Map

- Version: 0.2
- Status: Accepted — Decision Gate 2
- Owner role: Principal Product Manager / Principal UX Architect
- Dependencies: Product DNA v0.2; MVP Boundary v0.2; Repository Evidence Review
- Assumptions: The initial user personally uses OpenCode most often and Codex second; team personas are expansion users
- Unresolved questions: First paid cohort and later team-sharing defaults remain validation topics
- Last decision: Sponsor approved work unit as the continuity identity
- Next action: Preserve JTBD traceability through Phase 3 feature classification

## User hierarchy

### Primary persona — Multi-agent solo developer

**Context:** Owns or substantially drives a software project, alternates between OpenCode and Codex, and creates multiple sessions per work item.

**Primary goal:** Continue useful work without reconstructing goals, decisions, attempts, changed files, test state, and unfinished work.

**Current behavior:** Uses prompts, `AGENTS.md`, Git, issue notes, terminal history, chat history, and personal recollection. May paste context manually or ask the prior agent to summarize.

**Pain:** Project state is fragmented and temporal. Existing artifacts show what was committed or documented but not necessarily why, what failed, what remains, or which statement is current.

**Trust needs:** Local visibility, predictable sync policy, citations, correction, deletion, and no silent canonicalization.

**Success:** A different supported agent can continue the same work unit with no manual project-state explanation before useful work.

### Secondary persona — Team developer using multiple agents

**Context:** Works within a shared repository, branch conventions, ownership rules, and dependencies. Their private exploration should not automatically become team truth.

**Primary goal:** Resume personal work and consume relevant team state without receiving a flat, noisy memory pool.

**Additional needs:** Visibility scope, branch relevance, ownership, permission, conflict awareness, and clear separation between personal working memory and accepted project memory.

### Expansion persona — Technical lead or project maintainer

**Context:** Needs continuity and flow visibility without supervising every session or measuring individual activity.

**Primary goal:** Understand canonical decisions, dependency risks, blockers, stale work, and handoff readiness.

**Boundary:** Must not use Shoo to infer human performance from tokens, prompts, hours, commits, or code volume.

### Expansion persona — Temporary inheritor

**Context:** A developer or agent taking over unfamiliar or interrupted work.

**Primary goal:** Determine the current objective, constraints, last verified state, risks, and safest next action.

## Actors that are not personas

- OpenCode and Codex are client actors, not users or authorities.
- Shoo extraction and retrieval processes are system actors, not decision owners.
- MemWal/Walrus is a durable-memory dependency, not a user-facing persona.
- A coding agent may propose or report, but has only the authority granted by policy and user role.

## Core JTBD

### JTBD-001 — Resume a work unit

**When** I open a new coding session or switch agent while continuing existing work,  
**I want** the new agent to receive the current objective, latest accepted decisions, verified progress, relevant files, tests, blockers, and unfinished work,  
**so that** useful work continues without me retelling the project state.

Outcome signals:

- no manual state recap before the first useful action;
- agent operates on the correct work unit and branch;
- cited current decisions are preferred over superseded ones;
- unresolved uncertainty is surfaced rather than guessed.

### JTBD-002 — Preserve meaningful session outcomes

**When** a coding session makes progress, is compacted, stops, fails, or is interrupted,  
**I want** meaningful outcomes captured and classified with provenance,  
**so that** the result survives the session without treating every transcript fragment as knowledge.

### JTBD-003 — Ask the project

**When** I need to know what changed, why a decision exists, whether a bug happened before, or where to continue,  
**I want** a current, source-backed answer that distinguishes fact, inference, and suggestion,  
**so that** I can act without manually searching fragmented histories.

### JTBD-004 — Correct project memory

**When** captured memory is wrong, stale, too broad, sensitive, or superseded,  
**I want** to correct, restrict, supersede, or remove it,  
**so that** future agents do not amplify an error and policy remains under human control.

### JTBD-005 — Continue team flow around a blocker

**When** work becomes blocked,  
**I want** Shoo to identify the blocker type, affected dependencies, available parallel work, and handoff readiness,  
**so that** one blocked task does not automatically block the entire team.

## Job priorities by release

| Job | MVP | Team expansion | Later |
|---|---:|---:|---:|
| Resume a work unit | Core | Core | Core |
| Preserve meaningful outcomes | Core | Core | Core |
| Ask the project | Core | Core | Core |
| Correct project memory | Core | Core | Core |
| Share selected memory across members | Schema-ready only | Core | Core |
| Continue around blockers | Basic personal suggestion | Core | Advanced |
| Autonomous assignment/orchestration | Reject | Reject | Consider only after evidence |

## Behavioral principles

- Passive capture should reduce effort, not hide what was captured.
- The user confirms ambiguity, not every low-impact event.
- A session ending is not proof that a task completed.
- A commit is evidence of change, not proof of correct intent or accepted decision.
- A recent memory is not necessarily authoritative.
- Personal exploration remains personal until policy or an explicit action promotes its visibility.
