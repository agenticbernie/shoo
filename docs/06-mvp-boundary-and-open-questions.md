# Shoo MVP Boundary and Open Questions

- Version: 0.2.2
- Status: Accepted — Decision Gate 1
- Owner role: Principal Product Manager / Staff Software Architect
- Dependencies: Product DNA; Assumption Ledger; Risk Register
- Assumptions: MVP supports OpenCode first, Codex second, and one developer per project while preserving future tenant scopes
- Unresolved questions: Phase 3 feature classification and release boundaries
- Last decision: Gate 2 confirmed work-unit continuity, hybrid checkpoints, separated states, evidence-first capture, and safe default sync policy
- Next action: Convert the accepted workflow into Phase 3 MVP scope and feature dependencies

## MVP outcome

A developer completes meaningful work in Agent A, and later Agent B or a new session can continue the same task from a compact, source-backed context without the developer manually re-explaining project state.

## In-scope closed loop

1. Initialize/link one local project.
2. Connect OpenCode or Codex through MCP and its client-specific capture adapter.
3. Start a Shoo-aware session and request scoped context.
4. Capture significant session signals automatically where supported.
5. Create an explicit or automatic checkpoint.
6. Complete or interrupt the session and extract a narrow set of structured memories.
7. Preserve provenance, confidence, verification state, scope, and supersession links.
8. Evaluate sync policy: keep local, sync operational state, persist durable memory through MemWal/Walrus, or share with an allowed scope.
9. Resume in a new session or second supported agent using a token-bounded context pack.
10. Inspect the session timeline, current decisions, unfinished work, and sources in a minimal Shoo Web view.
11. Ask project-scoped questions and receive cited answers that distinguish fact, inference, and suggestion.
12. Correct or supersede a memory and observe the correction in later retrieval.

## Minimum memory taxonomy

The MVP should begin with only the memory types required for continuation:

- task state / unfinished work;
- accepted decision and rationale;
- verified code change reference;
- test result;
- blocker;
- session summary;
- artifact/source reference.

Bug, learning, convention, dependency, conflict, and handoff may exist as extensible schema concepts, but should not all receive complete workflows until evidence requires them.

## Minimum interface boundary

### Agent-facing

- Get project/task context.
- Start session.
- Checkpoint session.
- Complete session.
- Resume context.
- Recall scoped memory.
- Correct/supersede memory through an explicit, permission-aware path.

The final MCP tool naming and contract are deferred to AICD. A long catalogue of team tools is out of scope.

### Client adapters

- OpenCode: project/global plugin using documented session, message, file, todo, permission, and tool events. `session.idle` is a candidate completion signal, not automatically equivalent to task completion.
- Codex: MCP configuration for Shoo tools plus trusted lifecycle hooks. Candidate signals include `SessionStart`, `PostToolUse`, `PreCompact`, `PostCompact`, and `Stop`.
- Both adapters emit the same normalized Shoo event envelope and declare unsupported fields rather than fabricating equivalence.

### Human-facing Web

- Project overview / last-known state.
- Recent activity and session timeline.
- Current decisions.
- Unfinished work.
- Ask Shoo with citations.
- Source drawer and memory correction/supersession.
- Capture/privacy settings.

This is an inspection and governance surface, not a full project-management application.

## Required non-functional behaviors in MVP

- Idempotent capture of duplicate events.
- Visible handling of out-of-order, partial, stale, and unverified data.
- Offline/local queue for temporary cloud, MemWal, or Walrus unavailability.
- Coding work is not blocked by durable-persistence failure.
- Secret and path exclusion controls before data leaves the local trust boundary.
- Project isolation and least privilege even for single-user UX.
- Export and deletion for captured data.
- Explicit disclosure that recall deletion and underlying Walrus blob retention may have different lifecycles.
- Source citation for factual Q&A claims.
- Observability for capture, extraction, retrieval, and persistence failures.

## Explicitly deferred

- Full organizations, teams, role administration, and enterprise SSO UI.
- Team pace dashboard.
- Critical-path computation.
- Automatic dependency graph across teams.
- Rich handoff workflow between people.
- Notifications and approval routing.
- Autonomous task assignment or coordination.
- Broad issue-tracker, chat, and Git-provider integration catalogue.
- Mobile application.
- Billing and complex packaging beyond validation needs.
- Universal agent support.
- Token, incentive, or blockchain-facing features.

## Rejected from MVP

- Storing every transcript as canonical memory.
- Writing all realtime events to Walrus.
- General-purpose chat.
- Individual productivity scores.
- Automatic canonicalization of high-impact agent decisions.
- A graph UI without a validated decision question it answers.

## MVP success gate

Proceed to team shared-memory work only when a representative beta cohort demonstrates:

- improved Sufficient Context Resume Rate over its baseline;
- reduced context recovery time and manual re-explanation;
- acceptable cited-answer and canonical-memory accuracy;
- acceptable capture completeness in the supported-client matrix;
- no critical privacy or isolation failures;
- a correction burden low enough that Shoo saves more effort than it creates.

Numeric thresholds must be set in Phase 9 after baseline measurement; inventing them now would create false precision.

## Resolved strategic questions

### Q-001 — What implementation evidence from Kage and Sensei exists? — Resolved

Why it matters: Determines whether Shoo is a migration/refactor or a new build with lineage. Required evidence: repositories, schemas, MCP contracts, screenshots, deployments, tests, and known failures.

### Q-002 — Which two coding-agent clients are the first supported pair? — Resolved

Decision: OpenCode first; Codex second.

### Q-003 — What is the default capture trust boundary? — Partially resolved

Decision: sync is policy-driven. Phase 2 must define default policy and local/cloud processing split.

### Q-004 — Is Walrus a mandatory product constraint or a falsifiable adapter hypothesis? — Resolved

Decision: MemWal/Walrus is mandatory for durable memory; hot state remains outside Walrus.

### Q-005 — What is the product motion? — Resolved

Decision: Commercial SaaS. A local capture runtime plus hosted Shoo Web/control plane remains the leading delivery hypothesis.

## Phase 2 open questions

- Which exact events constitute session start, checkpoint, completion, interruption, and task completion in each client?
- What is the default sync policy for source code, prompts, tool outputs, decisions, test results, and secrets?
- Is the local capture runtime distributed as separate CLI/daemon packages, a Shoo plugin bundle, or both?
- Which existing Kage/Sensei data is migrated, transformed, archived, or discarded?
- What solo-to-team sharing action creates an explicit visibility-scope transition?

## Decision Gate 0/1 outcome

Accepted with sponsor constraints:

1. Shoo is one current product; Kage and Sensei are lineage only.
2. The primary user is a solo developer using multiple agents/sessions.
3. The primary job is continuation without manual re-explanation.
4. The North Star is Sufficient Context Resume Rate.
5. MVP is the capture → structure → retrieve → resume loop plus minimal Web inspection/governance.
6. Team coordination and autonomous orchestration are deferred.
7. Walrus is used selectively and remains subject to value validation.
8. Agent claims cannot become canonical high-impact state without authority.

Gate result: **Approved with amendments.** Phase 2 may begin.
