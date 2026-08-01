# Shoo Product DNA

- Version: 0.2.1
- Status: Accepted — Decision Gate 1
- Owner role: Principal Product Manager / Principal Product Designer
- Dependencies: Current-State Audit; four core scenarios; product principles
- Assumptions: Solo multi-agent continuity is the highest-value validation wedge for a Commercial SaaS that later expands to teams
- Unresolved questions: Pricing unit, tenant model, policy defaults, and beta cohort
- Last decision: Commercial SaaS; OpenCode then Codex; policy-driven sync; MemWal/Walrus mandatory for durable memory
- Next action: Preserve Product DNA constraints through Decision Gate 2

## Mission

Enable human–AI software teams to continue work from a trustworthy shared project state without repeatedly reconstructing context by hand.

## Vision

Every coding session can begin from sufficient, relevant, attributable project context; every meaningful result can become reusable memory; and work can continue across agents, sessions, devices, and people without depending on one person's recollection.

## Product Goal

Reduce manual context reconstruction between coding sessions and agents while preserving provenance, authority, privacy, and user control.

## Category

Project Intelligence and Shared Memory Infrastructure for Human–AI Software Teams.

This category is intentionally narrower than “AI developer platform” and broader than “memory database.” Shoo owns the workflow from session signals to structured memory to context recovery and human project visibility.

## Primary user

A software developer who works on the same codebase with two or more AI coding agents or multiple sessions and regularly loses time restating goals, decisions, progress, and constraints. The first supported workflow is OpenCode as the primary client and Codex as the secondary client.

The initial user is also the operator and evaluator. Team leads, engineering managers, and non-developer stakeholders are expansion users, not the MVP primary user.

## Primary job to be done

When I start or switch a coding session, help the next agent understand the current task state, relevant decisions, recent verified changes, and unfinished work so I can continue without manually retelling the project history.

## Primary pain

Project context is fragmented across agent sessions and remains implicit in a developer's memory. Existing artifacts such as Git, issue trackers, and instruction files each preserve only part of the state and rarely explain current rationale, unfinished work, or cross-agent continuity.

## Product promise

Shoo gives each new coding session a compact, source-backed continuation context and lets the developer inspect why that context is trusted.

## One-sentence positioning

Shoo is shared project memory and intelligence that lets coding work continue across AI agents and sessions with relevant, cited, and controllable context.

## 30-second pitch

Coding agents remember only what is in their current session, so developers repeatedly explain what changed, why decisions were made, and what remains unfinished. Shoo captures meaningful session signals, converts them into provenance-rich project memory, and provides the next agent with a compact continuation context. Its Web interface exposes current decisions, recent work, sources, and unresolved items. Durable records can be persisted through MemWal to Walrus where portability, retention, or tamper evidence justifies it; realtime state stays in an operational layer.

## Product narrative

Kage identified the infrastructure problem: agents and sessions do not share project memory. Sensei identified the human visibility problem: memory is valuable only when people can ask, understand, and coordinate from it. Keeping these as separate products would create duplicate identity, permissions, semantics, and packaging, and would obscure the end-to-end outcome.

Shoo unifies the loop. An agent-facing interface captures and returns context; a human-facing interface explains, cites, corrects, and governs it. Neither surface is the product alone. The product is reliable continuation from shared project state.

## Why Shoo must exist

- Agent-native memory is session- or vendor-bound.
- Git records code states but not complete task intent, rationale, failed attempts, or uncommitted session outcomes.
- CLAUDE.md and AGENTS.md are valuable instructions but require manual maintenance and are poor temporal state stores.
- Linear and similar trackers model planned work, not automatic agent-session evidence.
- Notion stores authored knowledge but does not close the session capture/resume loop.
- A vector database retrieves similar text but does not model authority, supersession, branch scope, dependencies, or provenance.

Shoo should integrate with these systems rather than pretend to replace them.

## Why MCP and Web both exist

- MCP is needed at the moment of work: session start, contextual recall, checkpoint, completion, and correction from a coding agent.
- Web is needed for inspection and governance: source review, decision state, timeline, unresolved conflict, privacy, and project pulse.
- A Web-only product would not reliably enter the coding workflow.
- An MCP-only product would hide trust, provenance, and governance behind tool calls.

## Mandatory Walrus boundary

Walrus through MemWal is a mandatory architectural and ecosystem constraint for Shoo durable memory. Mandatory does not mean universal: a record is written to Walrus only when the active sync policy classifies it as durable and eligible. Qualifying value includes long-term durability, portable ownership, cross-client availability, verifiability, or retention independent of Shoo's hot operational store.

It is not used for presence, locks, notifications, live task claims, intermediate extraction jobs, or every raw event. If its product differentiation is weaker than expected, Shoo must reduce the set of Walrus-eligible records and messaging claims, but must not remove the MemWal integration without a new sponsor-level decision.

MemWal is currently beta and asynchronous. Shoo therefore owns job tracking, compatibility checks, retries, reconciliation, retention disclosure, and degraded-mode UX rather than exposing SDK behavior directly to users.

## Unique value proposition

Continue coding work across agents and sessions from a compact, source-backed project state that distinguishes what happened, what an agent claimed, what a human accepted, and what is currently canonical.

## Core differentiation

The differentiator is not “memory.” It is the combination of:

1. automatic workflow capture;
2. structured, scope-aware project memory;
3. explicit authority and supersession;
4. context packs optimized for continuation;
5. the same evidence model in agent and human interfaces;
6. optional durable portability for selected records.

## Product boundaries

Shoo owns session-to-continuation memory and project-state intelligence. It integrates with, but does not initially replace:

- source control and code review;
- issue planning and sprint management;
- general documentation;
- CI/CD;
- IDEs and coding agents;
- team messaging;
- general-purpose chat assistants.

## Anti-goals

- General chatbot or ChatGPT wrapper.
- Complete transcript archive presented as knowledge.
- Autonomous project manager or agent orchestrator in MVP.
- Employee activity monitoring or individual productivity scoring.
- Git, issue tracker, or documentation replacement.
- Realtime collaboration protocol built entirely on Walrus.
- Universal support for every coding agent in the first release.
- Automatic promotion of agent claims to canonical truth.
- Blockchain-centric UX or tokenized product mechanics.

## North Star Metric

**Sufficient Context Resume Rate (SCRR):** percentage of eligible coding sessions that resume a prior task with sufficient context and no manual project-state re-explanation before useful work begins.

An eligible session is one that starts on a previously observed Shoo project and continues or relates to existing work. “Sufficient” must be confirmed through a combination of user signal and behavior-based rubric; mere tool invocation does not count.

### Guardrail and supporting metrics

- Median context recovery time.
- Manual re-explanation rate.
- Cross-agent continuation success rate.
- Context-pack relevance score.
- Citation coverage for factual answers.
- Canonical memory correction rate.
- Stale or superseded memory exposure rate.
- Capture completeness for eligible session outcomes.
- Privacy opt-out/deletion success.
- Time to first successful cross-agent continuation.

Token count, prompt count, lines of code, and hours online are explicitly excluded as performance metrics.

## Commercial model and ecosystem

Shoo is a Commercial SaaS. The initial product hypothesis is a local capture runtime connected to a hosted Shoo control plane and Shoo Web. Commercial packaging, pricing unit, and team expansion are not yet validated.

Sync is policy-driven. Policy decides which events remain local, which operational summaries sync to Shoo Cloud, which durable memories are written through MemWal to Walrus, and which scopes may be shared across agents or team members.

Shoo is one product system with several interfaces, not a suite of renamed products:

- Agent surface: MCP for context/tools; an OpenCode plugin event adapter and Codex lifecycle hooks for automatic capture.
- Human surface: Shoo Web for inspection, Ask Shoo, sources, and project pulse.
- Local runtime: trust-boundary functions such as capture, redaction, queueing, and offline recovery.
- Cloud control plane: identity, sync, operational state, indexing, and Web APIs where chosen.
- Durable adapter: MemWal SDK to Walrus for policy-selected memories.

These are delivery surfaces and runtime boundaries. They must not become independent product identities.
