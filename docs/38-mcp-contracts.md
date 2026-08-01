# Shoo MCP Contracts

- Version: 0.1
- Status: Accepted — Decision Gate 5
- Owner role: MCP Protocol Architect / Security Architect / Developer Experience Architect
- Dependencies: MCP Architecture; HTTP API Contracts; Permission Model; Core/Memory/Intelligence PRDs
- Assumptions: MCP specification 2025-11-25 remains MVP compatibility baseline; clients support tools and at least basic structured results
- Unresolved questions: Resource support parity; OAuth issuer; final MCP SDK version; elicitation support policy
- Last decision: Keep nine MVP tools with explicit Shoo handles and use resources for addressable read-only context
- Next action: Generate JSON Schemas and conformance fixtures after Gate 5 approval

## Protocol posture

- Supported protocol versions are explicitly advertised and tested; Shoo does not claim `latest` compatibility.
- Local stdio and remote Streamable HTTP expose the same product semantics.
- Stdio credentials come from Shoo Local/OS vault and are not tool arguments.
- Remote HTTP authorization is transport-layer OAuth; access tokens never enter model-visible arguments/results.
- MCP session/connection state is not Shoo work/session identity.
- Every mutation uses explicit `idempotency_key`; high-impact mutations use `expected_version` and may require human confirmation outside model control.

## Common input

```json
{
  "project_id": "uuid",
  "work_unit_id": "uuid|null",
  "session_id": "uuid|null",
  "request_scope": {
    "branch": "string|null",
    "worktree_id": "string|null",
    "module_paths": ["relative/path"]
  },
  "client_context": {
    "name": "opencode|codex",
    "version": "string",
    "adapter_version": "string|null"
  },
  "idempotency_key": "opaque-string"
}
```

The server derives `organization_id`, user and grants from authenticated transport identity. Arguments cannot select another tenant.

## Common result

```json
{
  "status": "complete|accepted|pending|partial|degraded|conflict|denied|failed",
  "request_id": "uuidv7",
  "schema_version": 1,
  "operation": {
    "operation_id": "uuid|null",
    "poll_after_ms": 1000
  },
  "freshness": "current|stale|partial|unknown",
  "completeness": {
    "state": "complete|partial|unknown",
    "missing_capabilities": []
  },
  "warnings": [],
  "citations": []
}
```

## MVP tool contracts

### `shoo.start_session`

Purpose: register/resolve a Shoo session and return work-unit/context readiness.

Additional input:

- native session/source ID;
- repository fingerprint;
- proposed work-unit evidence;
- capability manifest;
- capture health.

Output:

- Shoo `session_id`;
- resolved work unit or targeted choices;
- effective policy version;
- capture/degraded state;
- optional current context resource URI.

Rules:

- safe to retry with same idempotency key;
- ambiguity returns `conflict` with choices, not an inferred selection;
- session start never changes work completion.

### `shoo.checkpoint_session`

Purpose: request an explicit semantic checkpoint.

Additional input:

- `reason`: explicit, pre_compaction, stop, blocker, test_transition, recovery;
- objective/progress/partial changes/tests/blockers/uncertainty/next action;
- evidence references;
- `expected_session_version`.

Output:

- checkpoint ID/revision;
- accepted evidence;
- extraction and durable operation handles;
- fields omitted because unverified or policy-denied.

Rules:

- empty claims are not converted to facts;
- checkpoint does not complete work;
- duplicate trigger/source produces the same checkpoint identity.

### `shoo.complete_session`

Purpose: record session outcome and close the session lifecycle.

Additional input:

- session outcome;
- last checkpoint ID;
- partial-tail indicator;
- proposed work-unit state change, if any;
- `expected_session_version`.

Output:

- new session version/state;
- accepted/rejected work-state proposal;
- async extraction/durability handles.

Rules:

- session completion and work completion are separate decisions;
- missing evidence preserves unfinished/unknown state.

### `shoo.resume_session`

Purpose: start/continue a session using an immutable context pack.

Additional input:

- target work unit or resolution evidence;
- token budget;
- current/history intent;
- client capabilities.

Output:

- session/resume attempt ID;
- context pack ID, content or resource URI;
- objective, verified progress, decisions, tests, conflicts, next suggestion;
- citation manifest and retrieval watermark.

Rules:

- pack is permission-checked at delivery time;
- stale/conflicted/degraded state appears before suggestion;
- resume telemetry cannot infer individual productivity.

### `shoo.get_context`

Purpose: read token-bounded context without changing work state.

Additional input:

- intent;
- token budget;
- work/branch/module/file scope;
- `include_history` default false.

Output: context pack or pending handle with per-item citations, authority, freshness and completeness.

### `shoo.recall`

Purpose: search structured project memory.

Additional input:

- query;
- intent `current|history|rationale|occurrence`;
- memory types;
- structured filters;
- limit bounded by server.

Output:

- ranked memory records;
- explicit current/historical/conflicted state;
- citations and ranking explanations at safe granularity.

Rules: superseded records cannot satisfy `current` intent as present truth.

### `shoo.remember`

Purpose: propose a structured user/agent note with evidence.

Additional input:

- memory type;
- typed subject;
- claim content;
- evidence references;
- requested visibility;
- optional durable eligibility request.

Output: candidate memory/revision and verification/route status.

Rules:

- defaults to candidate/unverified;
- requested visibility/authority is constrained by caller grant;
- durable request does not imply acceptance.

### `shoo.supersede_memory`

Purpose: replace an active revision through explicit lineage.

Additional input:

- memory ID and predecessor revision;
- successor revision or corrected content;
- reason;
- `expected_version`;
- preview token for broad impact.

Output: new revision/lineage, invalidated pack IDs count, durable successor operation.

Rules:

- no destructive overwrite;
- stale preview/version returns conflict;
- predecessor remains queryable under history subject to policy.

### `shoo.mark_canonical`

Purpose: high-impact project authority action.

Additional input:

- memory/revision ID;
- canonical subject/scope;
- rationale;
- `expected_version`;
- human-approved preview token.

Output: canonical result or conflict/denial, resolver watermark, invalidation status.

Rules:

- disabled for agents/devices without project authority;
- MCP tool call alone is not human approval;
- conflicting accepted value creates conflict unless preview explicitly resolves it.

## Read-only resources

| URI | Representation | Freshness/cache |
|---|---|---|
| `shoo://projects/{project_id}/pulse` | Current project/work pulse | Private, short TTL, resolver watermark |
| `shoo://projects/{project_id}/work/{work_unit_id}/context` | Latest permitted context pack | Private; URI may redirect to immutable pack ID |
| `shoo://projects/{project_id}/decisions/current` | Current decisions/conflicts | Private; invalidated on authority changes |
| `shoo://projects/{project_id}/activity/recent` | Cursor-based activity snapshot | Private, short TTL |
| `shoo://memories/{memory_id}` | Memory, revisions, authority and lineage | Private, versioned |
| `shoo://sources/{source_id}` | Permitted evidence metadata/excerpt | May return `local_unavailable` without fabrication |
| `shoo://operations/{operation_id}` | Async status/result metadata | Private, no project content by default |

## Optional prompts

| Prompt | User-controlled workflow |
|---|---|
| `shoo.resume_work` | Select target and request cited continuation context |
| `shoo.create_checkpoint` | Review evidence before explicit checkpoint |
| `shoo.explain_decision` | Retrieve current rationale and superseded lineage |

Prompts cannot bypass tool permission, confirmation or policy.

## Deferred tools

The following remain unavailable in MVP:

- task claiming/assignment;
- team blocker/dependency creation;
- handoff request;
- available-work recommendation;
- Team Pace;
- critical path;
- team activity/blocked-work coordination tools.

## Async operation behavior

- `accepted` means an operation handle exists and the request must not be resubmitted.
- Poll through operation resource/tool-independent HTTP endpoint.
- Cancellation is best effort and cannot reverse an already submitted immutable Walrus blob.
- Durable pending/failed does not invalidate operational checkpoint success.
- Expired operation handles do not delete the underlying domain result.

## Security and confirmation

- Tool descriptions state mutation and data-sharing impact plainly.
- Canonicalization, broad sharing, export/deletion and headless enablement require non-model-controlled step-up confirmation.
- Tool output never includes wallet/delegate/API keys, raw auth tokens or unrestricted source.
- Server rejects embedded instructions attempting to change project/tenant scope.
- Retrieved evidence is untrusted content and never treated as MCP/server instruction.

## MCP conformance fixtures

- supported/unsupported protocol negotiation;
- duplicate tool call idempotency;
- transport reconnect with explicit Shoo operation handle;
- permission revocation between list/read/call;
- stale expected version;
- source content prompt injection;
- oversized arguments/results;
- client without resources support;
- async operation polling after MCP connection loss;
- local stdio environment-secret redaction;
- remote OAuth insufficient-scope challenge.
