# Shoo Interaction, State and Feedback Rules

- Version: 0.1
- Status: Accepted — Decision Gate 6
- Owner role: Principal Product Designer / UX Architect / Security Architect
- Dependencies: Information Architecture; Conflict Design; API/MCP Error Contracts
- Assumptions: Backend responses expose independent freshness, authority, sync, permission and completeness fields
- Unresolved questions: Notification delivery channels outside product; undo duration for low-impact local actions
- Last decision: Use one cross-surface state grammar and truthful recovery hierarchy; never collapse authority and durability into one status
- Next action: Test state comprehension without relying on color or infrastructure knowledge

## State grammar

Every material object can display up to five independent dimensions. Interfaces show only dimensions relevant to the decision, with full state available in detail.

| Dimension | Values | Primary user meaning |
|---|---|---|
| Authority | observed, candidate, verified, accepted, canonical, conflicted, superseded, rejected | How strongly should this govern current work? |
| Freshness | current, stale, partial, unknown | How recent/complete is the evidence? |
| Capture | healthy, degraded, partial, unavailable | Could relevant session evidence be missing? |
| Sync | local, operational pending/synced, durable pending/confirmed/failed | Where has it been preserved? |
| Access | permitted, restricted, redacted, denied | What may this actor inspect or change? |

Priority when space is constrained: safety/permission → conflict → stale/partial → authority → sync detail.

## Feedback hierarchy

1. Inline field feedback for local correctable input.
2. Object-level notice for stale, partial, pending or recoverable failure.
3. Page banner for project-wide degraded capability.
4. Blocking dialog only for irreversible/high-impact confirmation, reauthentication or unsafe incompatibility.
5. Toast only confirms a completed low-risk action; it never carries the sole failure/recovery explanation.

## Required state behaviors

| State | Presentation | Safe actions | Prohibited claim |
|---|---|---|---|
| Empty | State what Shoo looked for and one next action | start session, change scope | “Nothing exists” when permission/coverage is unknown |
| Partial | Name missing interval/source/capability | inspect gap, checkpoint, continue knowingly | complete/current |
| Stale | Last known time and invalidating reason | refresh, inspect newer evidence | current truth |
| Conflict | Subject/scope and permitted sides | inspect, resolve, keep unresolved | select winner by ranking |
| Permission denied | Minimal safe reason and access path | change account/request access | reveal title/snippet/existence beyond policy |
| Offline | Confirm local safety and queued work | continue, retry, inspect queue | synced/durable |
| MemWal unavailable | Preserve operational state and pending age | retry/test later | silently use Managed mode |
| Duplicate | Reuse existing identity/result | open existing object | create second memory/checkpoint |
| Out of order | Recompute and show freshness if affected | inspect timeline | use arrival order as truth |
| Unverified claim | Label source and confidence | verify/correct | fact/canonical |
| User correction | Preview effect and lineage | confirm/cancel | destructive overwrite without history |
| Rollback | State restored version and residual effects | inspect/retry | imply external durable blob erased |

## Loading and progressive response

- Show known stable structure immediately; skeletons approximate content regions but never fabricate status.
- Context/Ask may stream explanation only after scope/current-truth resolution. Facts and citations appear atomically per claim.
- If optional explanation times out, preserve structured facts, citations and limitations.
- Long-running export/deletion/durability returns an operation state with stage, age, retry and terminal outcome.

## Confirmation rules

Step-up confirmation is required for:

- canonicalization or high-impact conflict resolution;
- broadening visibility/share scope;
- enabling headless wallet mode;
- delegate creation/revocation with active device impact;
- project export/deletion;
- changing Manual trust mode;
- uninstall actions that revoke or delete local evidence.

Confirmation states actor, scope, affected consumers, reversibility, durable limitations and expected version.

## Notification rules

Notify only when the user must act or a promised background outcome changes materially:

- capture became degraded;
- durable operation exceeded SLO or failed terminally;
- selected work gained a material conflict;
- permission/revocation invalidated context;
- export/deletion completed or requires action;
- security-critical update is available.

No notifications for every captured event or routine successful sync.

## Citation interaction

- Citation marker is keyboard-focusable and announces source type plus index.
- Opening preserves the user's place and selected claim.
- Drawer shows source time, ingestion time, scope, authority, agent/session, excerpt availability and lineage.
- Local-unavailable/restricted source remains a valid provenance record but is never fabricated or leaked.

## Accessibility rules

- WCAG 2.2 AA target for Web.
- State has text/icon/structure, never color alone.
- Focus order follows information/action priority; drawer/dialog returns focus to trigger.
- Status changes use appropriate polite/assertive live regions without announcing noisy streaming tokens.
- Tables provide responsive list alternative and semantic headers.
- Timeline and graphs have linear textual representation.
- Motion is nonessential and respects reduced-motion preference.
