# Shoo Physical Data and Event Schemas

- Version: 0.1
- Status: Accepted — Decision Gate 5
- Owner role: Data Architect / Staff Backend Engineer
- Dependencies: Domain/Data Architecture; Permission Model; Memory Model; accepted PRDs
- Assumptions: PostgreSQL 16+ with pgvector and UUIDv7-compatible IDs; SQLite is available in Shoo Local
- Unresolved questions: Exact embedding dimension/provider; physical partition thresholds; maintained SQLite encryption library
- Last decision: Use normalized authority/state tables plus JSONB payload extensions, append-only event ledger, and transactional outbox
- Next action: Validate DDL through migration, RLS, concurrency, retention, and representative workload tests

## Schema rules

- All identifiers are opaque UUIDv7-compatible strings unless they are external locators.
- Every tenant record includes `organization_id` and `project_id` where applicable.
- Timestamps use UTC `timestamptz`; source, received and processed times stay separate.
- Mutable aggregates include `version bigint` for optimistic concurrency.
- Structured query/authority fields are columns; provider-specific or forward-compatible attributes may use validated JSONB.
- Secrets, plaintext wallet keys, raw prompts and source code are forbidden from cloud schemas by default.
- Soft deletion is not a universal substitute for deletion. Each table declares tombstone/retention behavior.

## PostgreSQL logical schemas

| Schema | Responsibility |
|---|---|
| `iam` | Organizations, users, membership, devices, grants, MemWal public bindings |
| `continuity` | Projects, repositories, work units, sessions, checkpoints |
| `memory` | Evidence metadata, memories, revisions, decisions, conflicts, supersession |
| `intelligence` | Embeddings, retrieval requests, context packs, citations, answers |
| `platform` | Policies, event ledger, outbox, operations, durable mappings, compatibility |
| `audit` | Security and high-impact mutation audit records |

## Core tables

### Identity and scope

| Table | Required fields | Critical constraints/indexes |
|---|---|---|
| `iam.organizations` | `id`, `name`, `status`, `version`, timestamps | PK `id`; unique normalized slug |
| `iam.users` | `id`, identity-provider subject, status | Unique provider subject; no wallet private data |
| `iam.memberships` | `organization_id`, `user_id`, `role`, status, version | Unique active org/user membership |
| `iam.projects` | `id`, `organization_id`, name, status, retention policy ID, version | Unique active project slug per organization |
| `iam.project_grants` | subject type/id, project ID, actions, visibility ceiling, expiry, version | No grant may exceed issuer authority |
| `iam.devices` | device ID, user ID, public fingerprint, adapter capabilities, revoked time | Unique device fingerprint per user |
| `iam.memwal_bindings` | user ID, owner address, account ID, package ID, network, status, verified time | Unique active owner/account/package/network tuple |
| `iam.memwal_delegates` | binding ID, device ID, delegate public key/fingerprint, onchain status | Never store delegate private key |
| `iam.namespace_registry` | binding ID, project ID, namespace, record class, version | Unique binding/namespace; namespace immutable after first durable write |

### Continuity

| Table | Required fields | Critical constraints/indexes |
|---|---|---|
| `continuity.repository_links` | project, repository fingerprint, provider/ref, local identity hash, status | One verified active mapping per repository identity/project |
| `continuity.work_units` | project, title/objective, state, branch/worktree refs, owner user, version | State transition through command only; index project/state/updated time |
| `continuity.work_unit_links` | work unit, link type, external ID/URL | Unique type/external ID/work unit |
| `continuity.sessions` | project, work unit, developer, agent, client, capture state, session state, capability version, version | Client stop cannot update work completion |
| `continuity.checkpoints` | project, work unit, session, reason, objective, progress, next action, completeness, revision | Immutable checkpoint revision; unique session/trigger idempotency key |
| `continuity.partial_tails` | session, from event, completeness, local source availability | Explicitly non-verified; retention-controlled |

### Evidence, memory and authority

| Table | Required fields | Critical constraints/indexes |
|---|---|---|
| `memory.evidence_records` | project, source type/ref/hash, occurred/received time, policy, local availability, classification | Immutable identity/hash; cloud content nullable by default |
| `memory.memory_records` | project, type, typed subject key, visibility, current revision ID, version | One record identity; current revision FK is transactionally maintained |
| `memory.memory_revisions` | memory ID, revision, content, claim/verification/authority/freshness/lineage states, effective time, creator, rule/model versions | Unique memory/revision; content integrity hash |
| `memory.memory_evidence` | revision ID, evidence ID, support type | Unique revision/evidence/support; evidence immutable |
| `memory.supersession_edges` | predecessor revision, successor revision, reason, actor | Acyclic lineage; successor cannot precede unrelated scope |
| `memory.decisions` | memory record ID, decision key, impact, approval scope | Current project decision requires authorized accepted revision |
| `memory.conflicts` | project, typed subject, state, severity, detected rule, version | One active equivalent conflict per subject/scope fingerprint |
| `memory.conflict_sides` | conflict ID, revision/evidence ID, side label | At least two distinct sides |
| `memory.resolutions` | conflict ID, action, selected/created revision, rationale, actor | Immutable resolution; closes conflict transactionally |

### Intelligence

| Table | Required fields | Critical constraints/indexes |
|---|---|---|
| `intelligence.memory_embeddings` | revision ID, model/version, dimension, vector, index state | Unique revision/model/version; filtered index by active eligibility |
| `intelligence.retrieval_requests` | project, work unit, intent, scope filters, budget, resolver/ranker versions, watermark | Content-minimized telemetry; short retention |
| `intelligence.context_packs` | pack ID, request ID, content hash, completeness, freshness, token use, manifest, invalidated time | Immutable pack; index work unit/created time |
| `intelligence.context_pack_items` | pack ID, revision ID, rank, score features, token allocation | Unique pack/revision; snapshot of ranking explanation |
| `intelligence.citations` | consumer type/id, claim key, source/evidence/revision IDs, excerpt policy | Every factual claim requires at least one permitted citation |
| `intelligence.answers` | request ID, intent, response sections, evidence sufficiency, content hash | Facts/inferences/suggestions stored separately if retained |

### Platform and durable operations

| Table | Required fields | Critical constraints/indexes |
|---|---|---|
| `platform.sync_policies` | project, version, rules, default route, active time, author | Immutable versions; one active policy per project |
| `platform.route_decisions` | evidence/revision ID, policy version, classification, local/operational/durable/shared decisions, reason | Decision immutable and auditable |
| `platform.event_ledger` | event ID/type/schema, scope IDs, source/correlation/causation, times, payload, integrity hash | Append-only; unique source idempotency tuple |
| `platform.outbox_jobs` | operation key, tenant/project, job type, payload reference, status, attempts, lease, next run | Unique operation key; partial index runnable jobs |
| `platform.operations` | operation handle, type, status, progress, result/error, expiry | User-queryable async handle; safe metadata only |
| `platform.durable_operations` | record revision, namespace binding, trust mode, operation key, job/blob IDs, compatibility versions, status | Unique record/namespace/trust/schema operation key |
| `platform.compatibility_records` | component, local version, remote version, result, checked time | Failed compatibility blocks affected write |
| `audit.security_events` | actor, action, target, scope, result, reason code, request/correlation ID, time | Append-only, content minimized, restricted role |

## State constraints

### One active canonical revision

For a typed subject and exact project/branch scope, at most one non-conflicted canonical revision may be active. A concurrent accepted candidate creates a conflict rather than replacing by time.

### Orthogonal state checks

Database constraints and command validation prevent:

- `durable = true` implying `authority = canonical`;
- `session = completed` implying `work_unit = completed`;
- `visible = project` implying `authority = project`;
- `verified = true` implying `freshness = current`;
- `superseded` revisions remaining current-state eligible.

## RLS contract

All tenant tables:

```sql
ALTER TABLE <tenant_table> ENABLE ROW LEVEL SECURITY;
ALTER TABLE <tenant_table> FORCE ROW LEVEL SECURITY;
```

Policy concept:

```sql
USING (
  organization_id = current_setting('shoo.organization_id', true)::uuid
  AND project_id = current_setting('shoo.project_id', true)::uuid
)
WITH CHECK (
  organization_id = current_setting('shoo.organization_id', true)::uuid
  AND project_id = current_setting('shoo.project_id', true)::uuid
);
```

This is illustrative contract SQL. Production migrations must add action/visibility joins or security-definer functions only after leakproofness and privilege review.

## Local SQLite schema

| Table | Purpose | Cloud eligibility |
|---|---|---|
| `local_identity` | Non-secret device/project mapping | Selected metadata only |
| `capture_events` | Raw/normalized local evidence with retention class | Policy-dependent envelope; raw body local default |
| `offline_outbox` | Idempotent cloud requests and retry state | Yes after local policy |
| `local_sources` | File/tool/transcript references and encrypted excerpts | Reference/summary only by default |
| `policy_cache` | Signed/versioned effective project policy | Yes; refreshable |
| `context_cache` | Encrypted pack plus expiry/invalidation watermark | No independent truth |
| `durable_queue` | Eligible record, Manual state and local operation key | Ciphertext/vector or cloud-safe status only |

Secrets remain in OS vault and are referenced by opaque key aliases.

## Event envelope contract

```json
{
  "event_id": "uuidv7",
  "event_type": "memory.corrected",
  "schema_version": 1,
  "scope": {
    "organization_id": "uuid",
    "project_id": "uuid",
    "work_unit_id": "uuid|null",
    "session_id": "uuid|null"
  },
  "actor": {
    "user_id": "uuid|null",
    "device_id": "uuid|null",
    "agent_id": "uuid|null",
    "actor_type": "user|device|worker|system"
  },
  "source": {
    "client": "opencode|codex|web|api|worker",
    "source_event_id": "string",
    "adapter_version": "semver|null",
    "source_sequence": "integer|null"
  },
  "occurred_at": "RFC3339",
  "received_at": "RFC3339",
  "policy_version": 3,
  "correlation_id": "uuidv7",
  "causation_id": "uuidv7|null",
  "idempotency_key": "opaque-string",
  "payload": {},
  "integrity": { "algorithm": "sha256", "payload_hash": "hex" }
}
```

## Event payload minimums

| Event | Required payload |
|---|---|
| `session.started` | client/capability manifest, work-unit resolution, capture health |
| `session.checkpointed` | trigger, checkpoint ID, completeness, evidence references |
| `work_unit.state_changed` | prior/new state, expected version, reason, evidence |
| `memory.candidate_extracted` | memory/revision IDs, type, subject, extractor version, evidence IDs |
| `memory.corrected` | predecessor/successor IDs, correction type, reason, impact scope |
| `memory.superseded` | predecessor/successor IDs, authority actor, effective time |
| `conflict.detected` | conflict ID, subject/scope fingerprint, side revision IDs, rule version |
| `conflict.resolved` | resolution ID, action, resulting revision, invalidation watermark |
| `context.built` | pack ID, resolver/ranker versions, index watermark, completeness |
| `durable.persisted` | operation ID, blob/job locator, namespace binding, payload hash, compatibility versions |

## Migration and compatibility

- Every table and event payload has explicit schema version.
- Expand/contract migrations support at least one prior local/client version during rolling upgrade.
- Event readers ignore unknown optional fields and reject unsupported required versions into quarantine.
- Vector dimension/model changes create a new embedding row and parallel index; never mutate meaning in place.
- Namespace and durable locator migrations preserve prior mapping until reconciliation completes.

## Retention implementation

- Partition high-volume event/audit tables by time only after Phase 5C volume validation.
- Retention workers operate by data class and legal hold, not a universal delete timestamp.
- Backup restoration reapplies deletion tombstones before serving traffic.
- Physical Walrus expiry remains outside PostgreSQL deletion guarantees.
