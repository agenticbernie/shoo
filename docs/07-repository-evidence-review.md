# Shoo Repository Evidence Review

- Version: 0.2
- Status: Accepted evidence snapshot — refreshed for Phase 5
- Owner role: Staff Software Architect / Technical Program Manager
- Dependencies: `bernieweb3/kage-sensei`; `MystenLabs/MemWal`; official OpenCode and Codex documentation
- Assumptions: Repository documentation and test records accurately describe the inspected revisions
- Unresolved questions: Runtime security, deployed version, dependency compatibility, schema migration, trust mode, and load behavior
- Last decision: Repository remains migration input; MemWal/client/MCP dependencies require pinning and trust-boundary redesign
- Next action: Map reusable predecessor capabilities to Shoo ports during Phase 5B migration design

## Sources reviewed

- [Kage Sensei repository](https://github.com/bernieweb3/kage-sensei), default branch `main`.
- [Kage Sensei README](https://github.com/bernieweb3/kage-sensei/blob/main/README.md).
- Kage, Sensei CLI, and Sensei Web package manifests.
- Docker and Compose configuration.
- Bridge and Learn V2 development evidence dated 2026-06-19.
- [MemWal repository](https://github.com/MystenLabs/MemWal), default branch `dev`.
- [MemWal SDK API reference](https://github.com/MystenLabs/MemWal/blob/dev/docs/sdk/api-reference.md).
- [OpenCode plugin events](https://opencode.ai/docs/plugins/).
- [OpenCode MCP configuration](https://opencode.ai/docs/mcp-servers/).
- [Codex MCP configuration](https://developers.openai.com/codex/mcp).
- [Codex lifecycle hooks](https://developers.openai.com/codex/hooks).

## Reusable prototype assets

| Asset | Evidence | Shoo disposition |
|---|---|---|
| Kage TypeScript CLI | Build/test scripts and command surface | Reuse command logic selectively; rename public surface to Shoo through migration |
| MCP transport | MCP SDK, stdio, Streamable HTTP, Web `/mcp` | Preserve transport knowledge; redesign tool contracts around Shoo lifecycle |
| MemWal adapter usage | Kage and Sensei packages call MemWal | Consolidate into one versioned Shoo durable-memory adapter |
| CCR/compression | Local metadata, compression, relevance, token fitting | Evaluate for context-pack implementation; migrate only with tests |
| Kage Learn V2 | Resumable jobs, heuristics, checkpoints, tests | Supporting extraction input, not canonical memory engine |
| Sensei Web/API | Hono, React/Vite, JWT APIs, dashboard | UI/backend prototype; replace admin auth with SaaS tenancy model |
| Bridge | Local source ZIP to cloud processing | Reuse local-sidecar lessons; replace bulk source sync as the main progress-sync model |
| Docker deployment | Multi-stage build, non-root runtime, health checks | Useful baseline; not evidence of multi-tenant production readiness |

## MemWal constraints accepted into Shoo

- The SDK is beta and actively evolving.
- `remember` creates an asynchronous job; Shoo needs durable job/outbox state.
- `rememberBulk` accepts up to 20 memories per request in the reviewed API.
- Recall is scoped by `owner + namespace` and returns semantic distance.
- Restore can rebuild missing index entries from Walrus.
- SDK/relayer compatibility is a runtime concern and exposes a compatibility check.
- Forgetting from recall/index does not necessarily remove the underlying Walrus blob immediately; retention semantics must be explicit.
- Shoo cannot use raw MemWal semantic recall as its complete retrieval model because authority, task, branch, supersession, and source-quality ranking remain Shoo responsibilities.
- Current upstream documentation removed earlier claims that the managed relayer provides encryption or end-to-end SEAL protection. Shoo must not promise encrypted durable memory until the exact managed/manual flow is verified and threat-modeled.

## Client integration finding

### OpenCode

OpenCode is the better first capture target. Its plugin interface exposes session, message, file, todo, permission, command, and tool events. Shoo can implement event-driven capture locally and use MCP for context/commands.

Risk: an event such as `session.idle` indicates no active generation, not necessarily completed work. Shoo must distinguish client lifecycle from task semantics.

### Codex

Codex supports project/user MCP configuration and lifecycle hooks. Hooks can observe session start, tool use, compaction, and stop boundaries, making automatic capture feasible when the hook is reviewed and trusted.

Risk: hooks can be disabled or untrusted, and not every session outcome maps cleanly to a task state. Shoo must surface capture health rather than silently claim completeness.

## Restructuring implication

The recommended path is an incremental strangler migration:

1. Define Shoo domain and event contracts outside predecessor naming.
2. Wrap existing MemWal, MCP, CCR, and extraction capabilities behind adapters.
3. Implement OpenCode and Codex capture adapters that emit normalized Shoo events.
4. Add operational state and policy evaluation without moving hot state to Walrus.
5. Migrate Web/API workflows to Shoo tenancy, authority, and provenance rules.
6. Deprecate Kage/Sensei public commands and routes only after equivalent Shoo flows pass continuation evaluation.

Simply renaming the repository and UI would preserve the existing product split and fail the restructuring goal.
