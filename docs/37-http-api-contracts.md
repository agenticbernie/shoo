# Shoo HTTP API Contracts

- Version: 0.1
- Status: Accepted — Decision Gate 5
- Owner role: Staff Backend Engineer / Security Architect / Developer Experience Architect
- Dependencies: Accepted PRDs; Physical Schemas; Permission Model; Component Architecture
- Assumptions: JSON over HTTPS is sufficient for MVP commands/queries; bulk event ingestion is bounded; long jobs use operation handles
- Unresolved questions: Identity provider/OAuth issuer; pagination limits; public SDK language priorities; webhook need
- Last decision: Use resource-oriented queries plus explicit command endpoints for state transitions and asynchronous operation handles
- Next action: Produce OpenAPI candidate and contract tests after Gate 5 approval

## API principles

- Base path: `/v1`; breaking behavior requires a new major path or negotiated schema version.
- Access token determines actor/organization grants; caller IDs never create authority.
- All tenant paths include project identity for observability and routing but are revalidated against token grants.
- Mutating requests require `Idempotency-Key`; versioned aggregate mutations require `If-Match` or `expected_version`.
- Asynchronous work returns `202 Accepted` with an operation resource.
- Errors use stable machine code, safe detail and correlation ID; no stack trace or secret content.
- List endpoints use cursor pagination; no unbounded exports through ordinary query endpoints.

## Common response envelopes

### Success

```json
{
  "data": {},
  "meta": {
    "request_id": "uuidv7",
    "schema_version": 1,
    "freshness": "current|stale|partial|unknown",
    "warnings": []
  }
}
```

### Accepted operation

```json
{
  "data": {
    "operation_id": "uuidv7",
    "status": "pending",
    "poll_url": "/v1/operations/{operation_id}"
  },
  "meta": { "request_id": "uuidv7", "schema_version": 1 }
}
```

### Error

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "The resource changed. Review the current version before retrying.",
    "retryable": false,
    "current_version": 8,
    "details": []
  },
  "meta": { "request_id": "uuidv7" }
}
```

## Identity, project and device endpoints

| Method/path | Purpose | Required authority |
|---|---|---|
| `GET /v1/me` | Current Shoo identity and memberships | Authenticated user |
| `POST /v1/projects` | Create/link Shoo project | Organization member with create grant |
| `GET /v1/projects/{project_id}` | Project state and policy summary | Project read |
| `POST /v1/projects/{project_id}:reconcile-repository` | Resolve path/fingerprint mismatch | Project write + expected version |
| `POST /v1/projects/{project_id}/devices` | Register device public identity/capabilities | User step-up |
| `DELETE /v1/projects/{project_id}/devices/{device_id}` | Revoke Shoo device access | Device owner/project owner |
| `GET /v1/projects/{project_id}/memwal-binding` | Public binding/delegate/namespace state | Project owner |
| `POST /v1/projects/{project_id}/memwal-binding:verify` | Verify wallet/account ownership proof | Project owner + wallet proof |
| `POST /v1/projects/{project_id}/delegates` | Record pending device delegate registration | User step-up; onchain confirmation required |
| `POST /v1/projects/{project_id}/delegates/{id}:reconcile` | Reconcile onchain delegate state | Delegate owner/project owner |

Shoo API never accepts an owner private key, seed phrase, delegate private key or headless wallet private key.

## Work and session endpoints

| Method/path | Purpose | Result |
|---|---|---|
| `POST /v1/projects/{project_id}/work-units:resolve` | Propose/select/create a work unit from context | Resolved, ambiguous choices, or unknown |
| `POST /v1/projects/{project_id}/work-units` | Explicit work-unit creation | Work unit v1 |
| `GET /v1/projects/{project_id}/work-units/{id}` | Current state with freshness/citations | Versioned representation |
| `POST /v1/projects/{project_id}/work-units/{id}:transition` | Authorized lifecycle transition | New version or conflict |
| `POST /v1/projects/{project_id}/sessions` | Idempotent session start | Session/capture health |
| `POST /v1/projects/{project_id}/sessions/{id}:checkpoint` | Explicit/adapter checkpoint command | `202` when extraction/durability follows |
| `POST /v1/projects/{project_id}/sessions/{id}:complete` | Record session result separately from work state | Session version + operation |
| `POST /v1/projects/{project_id}/sessions/{id}:fail` | Record failure/partial evidence | Session version |
| `POST /v1/projects/{project_id}/sessions/{id}:resume` | Record resume attempt and build/deliver context | Pack or operation handle |

## Capture ingestion

`POST /v1/projects/{project_id}/capture-events:batch`

Constraints:

- device-authenticated;
- bounded count and compressed request size defined by deployment policy;
- every item includes source event ID, schema version, source time, idempotency key and policy version;
- raw body fields forbidden unless project policy explicitly permits;
- response reports accepted, duplicate, quarantined and rejected items independently;
- one invalid item does not roll back valid independent items, but related causal groups may be atomic.

## Memory and decision endpoints

| Method/path | Purpose | Key behavior |
|---|---|---|
| `GET /v1/projects/{project_id}/memories` | Filtered current/history search | Explicit `intent=current|history` |
| `GET /v1/projects/{project_id}/memories/{id}` | Provenance, revisions and lineage | Permission-filtered evidence links |
| `POST /v1/projects/{project_id}/memories` | Propose explicit structured memory | Creates candidate, never auto-canonical |
| `POST /v1/projects/{project_id}/memories/{id}:correct` | Create successor revision | Expected version, reason, impact preview token |
| `POST /v1/projects/{project_id}/memories/{id}:accept` | Accept within actor scope | Step-up for project authority |
| `POST /v1/projects/{project_id}/memories/{id}:mark-canonical` | Project-level canonical action | Project owner/authorized role, expected version |
| `POST /v1/projects/{project_id}/memories/{id}:supersede` | Explicit lineage mutation | Successor required; history retained |
| `GET /v1/projects/{project_id}/decisions/current` | Current accepted decisions | Shared resolver result |
| `GET /v1/projects/{project_id}/conflicts` | Active/resolved conflicts | Does not expose unauthorized side evidence |
| `POST /v1/projects/{project_id}/conflicts/{id}:resolve` | Select/merge/scope/deprecate resolution | Authorized actor + preview token + expected version |

High-impact mutations use two-step preview:

1. `POST ...:preview` returns affected scopes, packs, citations and durable successors.
2. Commit call includes a short-lived preview token bound to actor, target version and intended action.

## Intelligence endpoints

| Method/path | Purpose |
|---|---|
| `POST /v1/projects/{project_id}/context-packs` | Build a scoped token-budgeted pack |
| `GET /v1/projects/{project_id}/context-packs/{pack_id}` | Retrieve immutable pack/manifest if still permitted |
| `POST /v1/projects/{project_id}/ask` | Cited project question with intent and scope |
| `GET /v1/projects/{project_id}/pulse` | Current work, recent changes, decisions and degraded status |
| `GET /v1/projects/{project_id}/activity` | Cursor-based normalized timeline |

`POST /context-packs` request concept:

```json
{
  "work_unit_id": "uuid",
  "intent": "resume",
  "client": "codex",
  "branch": "feature/auth",
  "module_paths": ["src/auth"],
  "token_budget": 6000,
  "include_history": false
}
```

The server may lower budget but cannot silently broaden scope.

## Policy and durable endpoints

| Method/path | Purpose |
|---|---|
| `GET /v1/projects/{project_id}/sync-policy` | Current effective policy and explanations |
| `POST /v1/projects/{project_id}/sync-policy:preview` | Show routing impact before change |
| `PUT /v1/projects/{project_id}/sync-policy` | Create immutable new version |
| `GET /v1/projects/{project_id}/durable-operations` | Pending/failed/persisted durable status |
| `POST /v1/projects/{project_id}/durable-operations/{id}:reconcile` | Reconcile Manual/Walrus result |
| `POST /v1/projects/{project_id}/namespaces/{id}:restore` | Start quarantined restore/reindex |

Manual encryption/decryption remains in Shoo Local. Cloud durable endpoints receive only permitted ciphertext/vector/locator/status material.

## Operations, export and deletion

| Method/path | Purpose |
|---|---|
| `GET /v1/operations/{id}` | Poll authorized async operation |
| `POST /v1/operations/{id}:cancel` | Best-effort cancel before irreversible external step |
| `POST /v1/projects/{project_id}/exports` | Create authorized export operation |
| `POST /v1/projects/{project_id}:deletion-preview` | Return layer-by-layer impact and unsupported durable guarantees |
| `DELETE /v1/projects/{project_id}` | Start deletion workflow with step-up and preview token |
| `GET /v1/projects/{project_id}/deletion-status` | Local/operational/index/backup/durable-expiry states |

## Status and retry semantics

| HTTP status | Meaning |
|---:|---|
| 200/201 | Completed synchronous result |
| 202 | Accepted asynchronous operation; do not resubmit |
| 400 | Invalid request/schema |
| 401/403 | Authentication/authorization failure |
| 404 | Missing or deliberately concealed unauthorized resource |
| 409 | Version/state/conflict/idempotency mismatch |
| 412 | Failed expected-version/precondition |
| 422 | Valid schema but policy/domain transition rejected |
| 429 | Rate/abuse limit; honor retry metadata |
| 503 | Dependency degraded; operation not accepted unless handle returned |

## Security headers and content limits

- TLS required; HSTS at public edge.
- Strict JSON content type and bounded decompression.
- No sensitive response caching; private resources use explicit cache controls.
- Correlation IDs are server-issued or validated opaque values.
- Export download uses short-lived, one-use authorization and content-disposition protection.
- Archive uploads are not part of default Shoo capture architecture.
