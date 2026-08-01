# Shoo Core Scenario Workflows

- Version: 0.2
- Status: Accepted — Decision Gate 2
- Owner role: Principal UX Architect / Principal Product Manager
- Dependencies: User and JTBD Map; Product Principles; accepted client decisions
- Assumptions: OpenCode offers the richer first capture adapter; Codex is the cross-agent continuation target
- Unresolved questions: Exact checkpoint thresholds remain prototype/evaluation decisions
- Last decision: Sponsor approved the four workflows and hybrid checkpoint strategy
- Next action: Use Scenario 1 as the primary Phase 3 vertical-slice boundary

## Shared workflow vocabulary

- **Work unit:** Continuity container for one intended outcome. It may map to a task, bug, issue, feature slice, or investigation.
- **Session:** One bounded interaction between a developer and a coding agent.
- **Checkpoint:** A resumable statement of verified progress, current intent, uncertainty, and next action.
- **Capture event:** Raw or normalized evidence emitted by a client adapter.
- **Memory candidate:** Structured claim extracted from evidence but not automatically canonical.
- **Context pack:** Token-bounded, scope-aware continuation input with citations.

## Scenario 1 — Solo Developer, Multiple Agents

### Actor and trigger

- Actor: Multi-agent solo developer.
- Trigger: Starts OpenCode or Codex in a linked project, resumes an existing work unit, or begins a new one.

### Preconditions

- Project is linked to Shoo.
- The selected client adapter and Shoo MCP connection are configured.
- User has reviewed capture and sync policy.
- Shoo can identify repository/worktree and user; branch may be absent in non-Git workflows.

### Current workflow

1. Developer opens a new session.
2. Developer recalls what the previous agent did.
3. Developer searches Git, chat history, terminal output, issue tracker, or notes.
4. Developer writes a recap prompt.
5. New agent asks follow-up questions or repeats previous investigation.
6. Developer manually requests a summary at the next stopping point.

### Pain

- Recap quality depends on human memory.
- Failed attempts and uncommitted work are often lost.
- Context is copied without source or current authority.
- Session boundaries are mistaken for task boundaries.
- Switching agents changes available history and conventions.

### Proposed workflow

#### A. Session start

1. Client adapter detects a supported session start or resume signal.
2. Shoo resolves developer, project, client, session, worktree, branch, and candidate work unit.
3. If work-unit identity is ambiguous, Shoo offers a compact choice: resume likely work, select another, or create new.
4. Shoo checks capture health and policy status.
5. Agent requests or receives a context pack containing:
   - work-unit objective and status;
   - latest accepted decisions and supersession state;
   - last verified checkpoint;
   - changed/relevant files and artifact references;
   - tests and known failures;
   - blockers and unresolved questions;
   - recommended next action;
   - citations and freshness.
6. Developer may inspect the pack but is not required to paste a recap.

#### B. Work in progress

1. Adapter emits normalized message, tool, file, test, todo, compaction, and session signals according to client capability.
2. Local policy filters secrets, excluded paths, raw content, and local-only events.
3. Shoo maintains hot work state without turning every event into durable memory.
4. Checkpoint triggers occur on meaningful boundaries: explicit user request, pre-compaction, verified test transition, material file set change, blocker, long inactivity, or session stop.
5. Extraction produces memory candidates linked to evidence.
6. Low-impact observed facts may become verified through deterministic evidence; decisions and high-impact claims remain proposed until authorized.

#### C. Session stop or interruption

1. Adapter reports stop, idle, error, compaction, process termination, or next-start recovery signal.
2. Shoo distinguishes session state from work-unit state.
3. A checkpoint records completed progress, incomplete changes, test state, blockers, uncertainty, and next action.
4. If outcome is ambiguous, work unit remains `in_progress` or `unknown`; it is not marked complete.
5. Policy routes data to local-only, cloud operational, durable Walrus, or allowed shared scope.
6. MemWal persistence is asynchronous and does not block session exit.

#### D. Cross-agent continuation

1. Developer opens Codex after OpenCode, or a new session in either client.
2. Shoo retrieves the relevant context pack using work unit, branch/worktree, files, authority, recency, and evidence.
3. Agent states its understood objective and unresolved uncertainty through normal interaction.
4. Useful work proceeds; developer only corrects exceptions.
5. Shoo measures whether manual state re-explanation occurred before useful work.

### System responsibilities

- Detect supported lifecycle signals and declare capture gaps.
- Preserve event provenance and ordering metadata.
- Separate hot work state from durable memory.
- Avoid auto-completing work from client inactivity.
- Generate cited, token-bounded context.
- Exclude superseded or unauthorized claims from current truth.
- Queue durable writes when MemWal/Walrus is unavailable.

### User responsibilities

- Install and trust the adapter.
- Select or correct a work unit when inference is ambiguous.
- Approve or correct high-impact decisions.
- Configure sensitive-data and sharing policy.

### Failure cases and recovery

- Adapter disabled: show capture degraded; allow explicit checkpoint.
- Client crash: reconstruct from last event and next-start evidence; label partial.
- Wrong work unit: reassign evidence and regenerate context without deleting provenance.
- MemWal unavailable: queue durable candidate; resume from operational state.
- Conflicting agent claims: preserve both as unresolved; do not choose by recency alone.
- User correction: supersede the wrong memory and invalidate affected context packs.

### Success metric

Primary: Sufficient Context Resume Rate. Supporting: recovery time, manual re-explanation rate, context relevance, citation coverage, correction burden, and capture completeness by client.

## Scenario 2 — Development Team, Multiple Agents per Member

### Actor and trigger

- Actors: Team developer, maintainer, temporary inheritor.
- Trigger: Member begins or resumes work in a shared project, changes visibility, depends on another work unit, or takes over work.

### Preconditions

- Organization, project, member, role, and policy scopes exist.
- Personal working memory and project-visible memory are distinct.
- Work unit has ownership and optional dependency relationships.

### Current workflow

Progress is distributed across stand-ups, pull requests, chat, issue trackers, private agent sessions, and individuals. Team members cannot tell which statements are current or which session evidence is safe to share.

### Proposed workflow

1. Each member's adapter captures into their permitted personal/project scopes.
2. Personal exploration remains private unless policy or user action promotes it.
3. Accepted decisions, verified changes, blockers, and handoff checkpoints become project-visible according to role and policy.
4. Context packs include only memories permitted for the requesting member and relevant to their branch/work unit.
5. When two members or agents produce conflicting decisions or overlapping changes, Shoo records a conflict rather than flattening them.
6. Maintainers resolve high-impact canonical conflicts; lower-impact working conflicts may remain branch-scoped.
7. A temporary inheritor receives a handoff-oriented context pack without private or irrelevant session content.

### System responsibilities

- Enforce visibility and authority independently.
- Preserve owner, branch, worktree, work unit, and source.
- Prevent cross-project or cross-member leakage.
- Explain why an item is visible and whether it is canonical.
- Produce flow metrics without individual productivity scoring.

### User responsibilities

- Promote or restrict personal memory when policy cannot infer safely.
- Accept decisions within role authority.
- Resolve or escalate material conflicts.

### Failure cases

- Permission changes mid-session; revoked data must disappear from future packs.
- Member works offline; eventual sync may conflict with newer canonical state.
- Same task claimed on two branches; keep both claims and surface overlap.
- Private evidence supports a shared claim; show claim with redacted evidence state rather than leaking source.

### Success metric

Continuation success across members, handoff latency, permission-leak rate, conflict resolution time, and context recovery time.

## Scenario 3 — Ask Shoo for Solo Developer

### Actor and trigger

- Actor: Developer.
- Trigger: Asks a project-state question from Web or an agent client.

### Proposed workflow

1. Shoo resolves project, user, visibility, current branch/worktree, and optional work unit.
2. Query is classified by intent: current state, history, rationale, prior bug, unfinished work, actor/session activity, or recommendation.
3. Retrieval gathers structured candidates and semantic evidence.
4. Authority, supersession, recency, scope, task relevance, branch relevance, and source quality rerank candidates.
5. Contradictions are either resolved from canonical state or displayed as unresolved.
6. Answer is partitioned into:
   - **Fact:** supported by cited evidence;
   - **Inference:** derived from multiple facts and labeled;
   - **Suggestion:** proposed next action and labeled.
7. User opens sources, corrects memory, narrows scope, or asks a follow-up.

### Failure cases

- No evidence: answer that Shoo does not know; do not fill from generic model knowledge.
- Only stale evidence: show last-known state and freshness warning.
- Superseded decision: answer with current decision and link history.
- Conflicting branches: ask or clearly split the answer by branch.
- Citation unavailable: do not present the claim as verified fact.
- Permission-denied evidence: disclose that accessible evidence is incomplete without revealing restricted content.

### Success metric

Answer citation coverage, canonical accuracy, stale-memory exposure rate, successful follow-up rate, and time to actionable understanding.

## Scenario 4 — Team Non-Blocking Coordination

### Actor and trigger

- Actors: Blocked developer, dependent developer, maintainer.
- Trigger: A work unit is reported or inferred as blocked, a dependency changes, or a handoff is requested.

### Proposed workflow

1. Shoo creates a blocker candidate linked to work unit, evidence, owner, and dependency.
2. Blocker is classified: local, hard, soft, information, approval, dependency, external, cross-team, or critical-path.
3. User confirms ambiguous severity or ownership.
4. Shoo determines affected work units and whether the blocker is on a critical path; critical-path computation remains post-MVP.
5. Shoo suggests non-blocking responses:
   - parallel work;
   - mock contract or provisional interface;
   - fallback task;
   - temporary owner;
   - handoff;
   - alternative path;
   - explicit escalation.
6. Suggested action remains a recommendation until a user accepts it.
7. Resolution updates blocker history and affected context packs.

### Failure cases

- False inferred blocker: user dismisses; Shoo records feedback.
- Hidden dependency: show incomplete impact assessment.
- Blocker affects one member only: do not label team blocked.
- Suggested workaround violates policy or architecture: require source-backed constraint check.
- Absent owner: generate handoff readiness; do not auto-reassign.

### Success metric

Blocked time, dependency wait time, accepted parallel-work suggestions, handoff latency, and false-blocker rate. No individual ranking.

## Decision matrix — checkpoint strategy

Scores: 1 = poor, 5 = strong. Reliability and privacy are weighted higher than implementation speed.

| Option | User value | MVP speed | Reliability | Privacy | Token/cost | Total posture |
|---|---:|---:|---:|---:|---:|---|
| Store every event as memory | 2 | 3 | 2 | 1 | 1 | Reject |
| Manual checkpoints only | 2 | 5 | 2 | 5 | 5 | Insufficient automation |
| Passive events + semantic checkpoints + explicit override | 5 | 3 | 4 | 4 | 4 | Recommended |

Recommendation: capture passive evidence locally, materialize structured checkpoints at meaningful boundaries, and retain an explicit user checkpoint/correction path.
