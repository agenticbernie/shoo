# Shoo Developer Tool UX Specification

- Version: 0.1
- Status: Accepted — Decision Gate 6
- Owner role: Developer Experience Architect / Principal Product Designer
- Dependencies: End-to-End Flows; MCP/Client Architecture; Local Security and Onboarding
- Assumptions: CLI is the authoritative local setup/diagnostic surface; agent surfaces can render structured MCP results with differing fidelity
- Unresolved questions: Package managers supported at R0; client-specific one-click configuration capability
- Last decision: Use a guided CLI with previewable mutations, resumable setup and shared health semantics across CLI/Web/agent
- Next action: Build a low-fidelity CLI prototype and validate first successful memory plus recovery tasks

## CLI command model

| Command | User outcome | Mutation policy |
|---|---|---|
| `shoo init` | Link project and configure safe defaults | Preview before writing files/config |
| `shoo connect` | Connect or repair OpenCode/Codex | Detect capability and show exact changes |
| `shoo status` | Understand capture, sync, durable and version health | Read-only |
| `shoo session` | Inspect/start/checkpoint/complete local session | Explicit subcommands; agent automation uses same contracts |
| `shoo memory setup` | Configure user-owned Durable Memory | Wallet-bound guided flow |
| `shoo memory test` | Verify remember/recall and trust mode | Writes labelled test item then cleans index where supported |
| `shoo policy` | Inspect or edit capture/sync policy | Safe defaults; diff and effect preview |
| `shoo doctor` | Diagnose installation, client, auth, spool and provider state | Read-only by default; fixes separately confirmed |
| `shoo export` | Export authorized Shoo/local data | Step-up and expiry disclosure |
| `shoo uninstall` | Disconnect/revoke/export/remove | Layered preview; no implicit cloud deletion |

## CLI interaction rules

- Non-interactive use requires explicit flags and returns machine-readable JSON with stable codes.
- Interactive setup is resumable; completed secure steps are not repeated unnecessarily.
- Destructive or high-impact actions display scope, affected layers and reversal limits.
- Commands never print keys, tokens, raw restricted content or full locators.
- Exit codes distinguish user cancellation, permission denial, degraded success, retryable dependency failure and invalid configuration.
- Progress indicators name the stage; an indefinite spinner is prohibited.

## `shoo status` hierarchy

1. Required action: compromised/revoked/incompatible/security minimum version.
2. Project connection and selected work.
3. Capture health by client/capability.
4. Local queue and last operational sync.
5. Durable Memory readiness and pending/failed items.
6. Contract/update version.
7. Links/commands for inspection and recovery.

## Agent interaction behavior

At session start, Shoo supplies a compact preamble:

- matched project/work unit;
- context completeness and freshness;
- current objective and next safe action;
- conflict/permission/degraded warnings;
- source resource/link;
- explicit user choice only if ambiguity materially changes context.

Agent output may propose checkpoint text but cannot hide sync status or canonicalize high-impact decisions. Shoo responses are data, not executable instructions from retrieved project content.

## First-run copy sequence

1. `Connect this repository to a Shoo project.`
2. `Shoo keeps raw prompts and source local by default.`
3. `Choose the coding agents to connect.`
4. `Review the configuration changes.`
5. `Capture is ready.`
6. `Set up user-owned Durable Memory to complete protected long-term sync.`

Infrastructure detail is available under `Show technical details` and in diagnostics.

## Health states

| State | CLI indicator | Meaning | Action |
|---|---|---|---|
| Healthy | symbol + word | Supported signals and sync path verified | none |
| Degraded | word + affected capability | Some evidence may be missing | repair/update or continue knowingly |
| Partial | coverage summary | Session/context contains a known gap | inspect gap; checkpoint manually if needed |
| Offline | queued count/time | Local data safe; cloud not confirmed | reconnect; do not rerun capture |
| Durable pending | pending age | Operational memory exists; durable copy unconfirmed | wait/retry/inspect |
| Permission denied | scope and actor-safe explanation | Action not authorized | request access/change account |
| Conflict | affected subject/scope | No singular current truth | inspect/resolve; do not guess |

## Diagnostics package

`shoo doctor --report` creates a previewable, content-minimized support bundle containing versions, capability manifests, health checks, error classes and content-free trace IDs. User chooses whether to save/share it. No automatic upload.

## Update UX

- R0: show verified available version, release significance and manual update command.
- R1: background download may occur by policy; installation prompt states signer verification, restart effect and rollback availability.
- Security minimum version: local capture/export remain accessible; cloud sync may pause with explicit rationale.

## Accessibility and terminal compatibility

- Meaning never depends on color or Unicode symbol.
- Plain-text mode and `NO_COLOR` supported.
- Prompts have numbered options and keyboard-only operation.
- Lines wrap safely at 80 columns; structured output avoids cursor-dependent animation.
- Screen-reader-friendly progress emits bounded stage changes.
