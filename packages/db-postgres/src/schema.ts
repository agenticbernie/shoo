import type { ColumnType, Generated, JSONColumnType } from 'kysely';

/**
 * Kysely table types for the Shoo operational database.
 *
 * These mirror migrations/postgres exactly. They are hand-authored on purpose: docs/63
 * chose typed SQL over an ORM so the schema semantics (RLS, pgvector, partial indexes)
 * stay visible. When a migration changes a column, change it here in the same PR.
 */

type Timestamp = ColumnType<Date, Date | string, Date | string>;
type Json = JSONColumnType<Record<string, unknown>>;
type JsonArray = JSONColumnType<unknown[]>;

export type ClientName = 'opencode' | 'codex' | 'web' | 'api' | 'worker';
export type ActorType = 'user' | 'device' | 'worker' | 'system';
export type RoleName =
  | 'project_owner'
  | 'developer'
  | 'device_adapter'
  | 'background_worker'
  | 'support_operator';
export type VisibilityScope = 'private' | 'project' | 'team' | 'organization';
export type RouteDecision = 'local_only' | 'operational' | 'durable' | 'shared' | 'denied';
export type Classification = 'restricted' | 'operational' | 'durable_eligible';
export type TrustMode = 'manual' | 'managed';
export type ClaimStatus = 'observed' | 'inferred' | 'claimed';
export type VerificationStatus = 'unverified' | 'corroborated' | 'verified' | 'disputed';
export type AuthorityStatus =
  | 'personal'
  | 'session'
  | 'branch'
  | 'team'
  | 'canonical'
  | 'historical';
export type DurabilityStatus =
  | 'local'
  | 'operational'
  | 'durable_pending'
  | 'durable'
  | 'durable_failed';
export type FreshnessStatus = 'current' | 'stale' | 'expired' | 'unknown';
export type LineageStatus = 'active' | 'superseded' | 'deprecated' | 'conflicted';
export type MemoryTypeName =
  | 'fact'
  | 'decision'
  | 'task_state'
  | 'progress'
  | 'code_change'
  | 'test_result'
  | 'bug'
  | 'blocker'
  | 'risk'
  | 'convention'
  | 'question'
  | 'conflict_resolution';
export type ConflictState = 'active' | 'resolving' | 'resolved' | 'dismissed';
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ResolutionActionName = 'select' | 'merge' | 'scope' | 'deprecate';
export type WorkUnitStateName =
  | 'proposed'
  | 'active'
  | 'paused'
  | 'blocked'
  | 'in_review'
  | 'completed'
  | 'abandoned';
export type SessionStateName = 'starting' | 'active' | 'completed' | 'failed' | 'abandoned';
export type CaptureStateName = 'healthy' | 'degraded' | 'unsupported' | 'disabled';
export type CheckpointReasonName =
  | 'explicit'
  | 'pre_compaction'
  | 'stop'
  | 'blocker'
  | 'test_transition'
  | 'recovery';
export type CompletenessStateName = 'complete' | 'partial' | 'unknown';
export type OperationStatusName =
  | 'pending'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'expired';
export type OutboxStatusName =
  | 'pending'
  | 'leased'
  | 'succeeded'
  | 'failed'
  | 'dead_letter'
  | 'cancelled';

// --- iam --------------------------------------------------------------------

export interface OrganizationsTable {
  id: string;
  name: string;
  slug: string;
  status: Generated<string>;
  version: Generated<string>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface UsersTable {
  id: string;
  identity_provider: Generated<string>;
  identity_provider_subject: string;
  display_name: string | null;
  status: Generated<string>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface MembershipsTable {
  id: string;
  organization_id: string;
  user_id: string;
  role: RoleName;
  status: Generated<string>;
  visibility_ceiling: Generated<VisibilityScope>;
  version: Generated<string>;
  joined_at: Timestamp | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface ProjectsTable {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  status: Generated<string>;
  retention_policy_id: Generated<string>;
  local_evidence_days: Generated<number>;
  operational_days: number | null;
  legal_hold: Generated<boolean>;
  default_visibility: Generated<VisibilityScope>;
  sync_policy_version: Generated<number>;
  version: Generated<string>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface ProjectGrantsTable {
  id: string;
  organization_id: string;
  project_id: string;
  subject_type: 'user' | 'device' | 'agent' | 'worker';
  subject_id: string;
  role: RoleName;
  actions: Generated<string[]>;
  visibility_ceiling: Generated<VisibilityScope>;
  issued_by_user_id: string;
  expires_at: Timestamp | null;
  revoked_at: Timestamp | null;
  version: Generated<string>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface DevicesTable {
  id: string;
  organization_id: string;
  user_id: string;
  device_name: string;
  platform: 'windows' | 'macos' | 'linux';
  public_key_fingerprint: string;
  adapter_capabilities: Generated<JsonArray>;
  status: Generated<string>;
  registered_at: Generated<Timestamp>;
  revoked_at: Timestamp | null;
  version: Generated<string>;
  updated_at: Generated<Timestamp>;
}

export interface MemwalBindingsTable {
  id: string;
  organization_id: string;
  user_id: string;
  owner_address: string;
  account_id: string;
  package_id: string;
  network: 'mainnet' | 'testnet' | 'devnet' | 'localnet';
  status: Generated<string>;
  trust_mode: Generated<TrustMode>;
  verified_at: Timestamp | null;
  version: Generated<string>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface MemwalDelegatesTable {
  id: string;
  organization_id: string;
  binding_id: string;
  device_id: string;
  delegate_public_key: string;
  delegate_public_key_fingerprint: string;
  onchain_status: Generated<string>;
  registered_at: Timestamp | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface NamespaceRegistryTable {
  id: string;
  organization_id: string;
  binding_id: string;
  project_id: string;
  namespace: string;
  record_class: string;
  schema_version: Generated<number>;
  immutable_since: Timestamp | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

// --- continuity -------------------------------------------------------------

export interface RepositoryLinksTable {
  id: string;
  organization_id: string;
  project_id: string;
  repository_fingerprint: string;
  provider: string | null;
  provider_ref: string | null;
  local_identity_hash: string;
  status: Generated<string>;
  version: Generated<string>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface WorkUnitsTable {
  id: string;
  organization_id: string;
  project_id: string;
  title: string;
  objective: string | null;
  state: Generated<WorkUnitStateName>;
  owner_user_id: string | null;
  branch: string | null;
  worktree_id: string | null;
  module_paths: Generated<string[]>;
  version: Generated<string>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface WorkUnitLinksTable {
  id: string;
  organization_id: string;
  project_id: string;
  work_unit_id: string;
  link_type: 'issue' | 'pull_request' | 'ticket' | 'document' | 'commit';
  external_id: string;
  url: string | null;
  created_at: Generated<Timestamp>;
}

export interface SessionsTable {
  id: string;
  organization_id: string;
  project_id: string;
  work_unit_id: string | null;
  developer_user_id: string;
  device_id: string | null;
  agent_id: string | null;
  client: ClientName;
  native_session_id: string;
  adapter_instance_id: string;
  session_state: Generated<SessionStateName>;
  capture_state: Generated<CaptureStateName>;
  missing_capabilities: Generated<string[]>;
  capability_manifest_version: number;
  policy_version: number;
  last_checkpoint_id: string | null;
  partial_tail: Generated<boolean>;
  version: Generated<string>;
  started_at: Generated<Timestamp>;
  ended_at: Timestamp | null;
  updated_at: Generated<Timestamp>;
}

export interface CheckpointsTable {
  id: string;
  organization_id: string;
  project_id: string;
  work_unit_id: string;
  session_id: string;
  revision: number;
  reason: CheckpointReasonName;
  trigger_idempotency_key: string;
  objective: string | null;
  progress: Generated<string[]>;
  partial_changes: Generated<string[]>;
  tests: Generated<JsonArray>;
  blockers: Generated<string[]>;
  uncertainty: Generated<string[]>;
  next_action: string | null;
  completeness: Generated<CompletenessStateName>;
  omitted_fields: Generated<JsonArray>;
  created_at: Generated<Timestamp>;
}

export interface CheckpointEvidenceTable {
  organization_id: string;
  project_id: string;
  checkpoint_id: string;
  evidence_id: string;
}

export interface PartialTailsTable {
  id: string;
  organization_id: string;
  project_id: string;
  session_id: string;
  from_event_id: string;
  completeness: Generated<'partial' | 'unknown'>;
  local_source_available: Generated<boolean>;
  expires_at: Timestamp;
  created_at: Generated<Timestamp>;
}

// --- memory -----------------------------------------------------------------

export interface EvidenceRecordsTable {
  id: string;
  organization_id: string;
  project_id: string;
  session_id: string | null;
  source_type:
    | 'prompt'
    | 'assistant_message'
    | 'tool_call'
    | 'file_change'
    | 'test_run'
    | 'command'
    | 'git'
    | 'user_note';
  source_ref: string | null;
  content_hash: string;
  content_excerpt: string | null;
  classification: Classification;
  local_availability: Generated<'available' | 'expired' | 'purged' | 'unknown'>;
  affected_paths: Generated<string[]>;
  policy_version: number;
  occurred_at: Timestamp;
  received_at: Timestamp;
  created_at: Generated<Timestamp>;
}

export interface MemoryRecordsTable {
  id: string;
  organization_id: string;
  project_id: string;
  memory_type: MemoryTypeName;
  subject_type: string;
  subject_key: string;
  branch_scope: string | null;
  work_unit_id: string | null;
  current_revision_id: string | null;
  version: Generated<string>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface MemoryRevisionsTable {
  id: string;
  organization_id: string;
  project_id: string;
  memory_id: string;
  revision: number;
  content: Json;
  content_hash: string;
  claim_status: ClaimStatus;
  verification_status: Generated<VerificationStatus>;
  authority_status: Generated<AuthorityStatus>;
  visibility_scope: Generated<VisibilityScope>;
  durability_status: Generated<DurabilityStatus>;
  freshness_status: Generated<FreshnessStatus>;
  lineage_status: Generated<LineageStatus>;
  effective_at: Timestamp;
  created_at: Generated<Timestamp>;
  created_by_user_id: string | null;
  extractor_version: string | null;
  rule_version: string | null;
  model_version: string | null;
  predecessor_revision_id: string | null;
  /** Denormalized from the parent record by a trigger; never written by hand. */
  subject_type: Generated<string>;
  subject_key: Generated<string>;
  branch_scope: Generated<string | null>;
}

export interface MemoryEvidenceTable {
  organization_id: string;
  project_id: string;
  revision_id: string;
  evidence_id: string;
  support_type: 'supports' | 'contradicts' | 'contextualizes';
  created_at: Generated<Timestamp>;
}

export interface SupersessionEdgesTable {
  id: string;
  organization_id: string;
  project_id: string;
  predecessor_revision_id: string;
  successor_revision_id: string;
  reason: 'correction' | 'supersession' | 'retraction' | 'conflict_resolution';
  actor_user_id: string | null;
  created_at: Generated<Timestamp>;
}

export interface DecisionsTable {
  id: string;
  organization_id: string;
  project_id: string;
  memory_id: string;
  decision_key: string;
  impact: 'local' | 'project' | 'organization';
  approval_scope: AuthorityStatus;
  approved_by_user_id: string | null;
  step_up_verified: Generated<boolean>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface ConflictsTable {
  id: string;
  organization_id: string;
  project_id: string;
  subject_type: string;
  subject_key: string;
  branch_scope: string | null;
  scope_fingerprint: string;
  state: Generated<ConflictState>;
  severity: Generated<ConflictSeverity>;
  detected_rule_version: string;
  detected_at: Generated<Timestamp>;
  resolved_at: Timestamp | null;
  version: Generated<string>;
  updated_at: Generated<Timestamp>;
}

export interface ConflictSidesTable {
  id: string;
  organization_id: string;
  project_id: string;
  conflict_id: string;
  side_label: string;
  revision_id: string | null;
  evidence_id: string | null;
  created_at: Generated<Timestamp>;
}

export interface ResolutionsTable {
  id: string;
  organization_id: string;
  project_id: string;
  conflict_id: string;
  action: ResolutionActionName;
  selected_revision_id: string | null;
  created_revision_id: string | null;
  scope_restriction: Json | null;
  rationale: string;
  actor_user_id: string;
  invalidation_watermark: Timestamp;
  resolved_at: Generated<Timestamp>;
}

// --- intelligence -----------------------------------------------------------

export interface MemoryEmbeddingsTable {
  id: string;
  organization_id: string;
  project_id: string;
  revision_id: string;
  model: string;
  model_version: string;
  dimension: number;
  /** pgvector literal, e.g. `[0.1,0.2,...]`. */
  embedding: string;
  index_state: Generated<'pending' | 'indexed' | 'stale' | 'failed'>;
  indexed_at: Timestamp | null;
  created_at: Generated<Timestamp>;
}

export interface RetrievalRequestsTable {
  id: string;
  organization_id: string;
  project_id: string;
  work_unit_id: string | null;
  intent: 'current' | 'history' | 'rationale' | 'occurrence' | 'resume';
  scope_filters: Generated<Json>;
  token_budget: number;
  resolver_version: string;
  ranker_version: string;
  index_watermark: Timestamp;
  candidate_count: Generated<number>;
  selected_count: Generated<number>;
  requested_at: Generated<Timestamp>;
  expires_at: Timestamp;
}

export interface ContextPacksTable {
  id: string;
  organization_id: string;
  project_id: string;
  request_id: string;
  work_unit_id: string | null;
  content_hash: string;
  completeness: CompletenessStateName;
  freshness: FreshnessStatus;
  degraded_reasons: Generated<string[]>;
  token_budget: number;
  token_used: Generated<number>;
  manifest: Json;
  sections: Json;
  created_at: Generated<Timestamp>;
  invalidated_at: Timestamp | null;
}

export interface ContextPackItemsTable {
  organization_id: string;
  project_id: string;
  pack_id: string;
  revision_id: string;
  rank: number;
  score: number;
  score_features: Generated<Json>;
  token_allocation: number;
  section: string;
}

export interface CitationsTable {
  id: string;
  organization_id: string;
  project_id: string;
  consumer_type: 'context_pack' | 'answer' | 'checkpoint';
  consumer_id: string;
  claim_key: string;
  revision_id: string | null;
  evidence_id: string | null;
  excerpt_policy: Generated<'permitted' | 'restricted' | 'local_unavailable'>;
  created_at: Generated<Timestamp>;
}

export interface AnswersTable {
  id: string;
  organization_id: string;
  project_id: string;
  request_id: string;
  intent: string;
  evidence_sufficiency: 'sufficient' | 'partial' | 'insufficient';
  facts: Generated<JsonArray>;
  inferences: Generated<JsonArray>;
  suggestions: Generated<JsonArray>;
  missing_evidence: Generated<string[]>;
  content_hash: string;
  pack_id: string | null;
  created_at: Generated<Timestamp>;
  expires_at: Timestamp;
}

// --- platform and audit -----------------------------------------------------

export interface SyncPoliciesTable {
  id: string;
  organization_id: string;
  project_id: string;
  version: number;
  default_route: RouteDecision;
  rules: Generated<JsonArray>;
  trust_mode: Generated<TrustMode>;
  active_from: Generated<Timestamp>;
  authored_by_user_id: string;
  created_at: Generated<Timestamp>;
}

export interface RouteDecisionsTable {
  id: string;
  organization_id: string;
  project_id: string;
  subject_kind: 'evidence' | 'revision';
  subject_id: string;
  policy_version: number;
  classification: Classification;
  local_decision: RouteDecision;
  operational_decision: RouteDecision;
  durable_decision: RouteDecision;
  shared_decision: RouteDecision;
  matched_rule_id: string | null;
  reason_code: string;
  decided_at: Generated<Timestamp>;
}

export interface EventLedgerTable {
  event_id: string;
  event_type: string;
  schema_version: number;
  organization_id: string;
  project_id: string;
  work_unit_id: string | null;
  session_id: string | null;
  actor_type: ActorType;
  actor_user_id: string | null;
  actor_device_id: string | null;
  actor_agent_id: string | null;
  source_client: ClientName;
  source_event_id: string;
  adapter_instance_id: string | null;
  adapter_version: string | null;
  source_sequence: string | null;
  occurred_at: Timestamp;
  received_at: Generated<Timestamp>;
  policy_version: number;
  correlation_id: string;
  causation_id: string | null;
  idempotency_key: string;
  payload: Json;
  payload_hash: string;
}

export interface OutboxJobsTable {
  id: string;
  organization_id: string;
  project_id: string;
  job_class:
    | 'extraction'
    | 'indexing'
    | 'context_build'
    | 'durable_persist'
    | 'durable_reconcile'
    | 'projection_rebuild'
    | 'retention'
    | 'export'
    | 'deletion';
  operation_key: string;
  payload_ref: string;
  status: Generated<OutboxStatusName>;
  attempts: Generated<number>;
  max_attempts: Generated<number>;
  lease_owner: string | null;
  lease_expires_at: Timestamp | null;
  next_run_at: Generated<Timestamp>;
  last_error_code: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface OperationsTable {
  id: string;
  organization_id: string;
  project_id: string | null;
  operation_type: string;
  status: Generated<OperationStatusName>;
  progress: number | null;
  result_ref: string | null;
  error_code: string | null;
  requested_by_user_id: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
  expires_at: Timestamp;
}

export interface DurableOperationsTable {
  id: string;
  organization_id: string;
  project_id: string;
  revision_id: string;
  namespace_binding_id: string;
  trust_mode: Generated<TrustMode>;
  operation_key: string;
  status: Generated<DurabilityStatus>;
  job_id: string | null;
  blob_locator: string | null;
  payload_hash: string | null;
  local_schema_version: number;
  remote_schema_version: number | null;
  attempts: Generated<number>;
  last_error_code: string | null;
  requested_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface CompatibilityRecordsTable {
  id: string;
  organization_id: string | null;
  component: 'shoo_local' | 'shoo_api' | 'shoo_worker' | 'memwal_sdk';
  local_version: number;
  remote_version: number;
  min_supported: number;
  max_supported: number;
  result: 'compatible' | 'upgrade_recommended' | 'blocked';
  checked_at: Generated<Timestamp>;
}

export interface FeatureFlagsTable {
  key: string;
  flag_type: 'release' | 'kill_switch' | 'compatibility' | 'experiment';
  owner_user_id: string;
  default_enabled: Generated<boolean>;
  description: string;
  removal_story: string;
  expires_at: Timestamp;
  created_at: Generated<Timestamp>;
}

export interface FlagAssignmentsTable {
  key: string;
  organization_id: string;
  project_id: string | null;
  enabled: boolean;
  assigned_at: Generated<Timestamp>;
}

export interface DeletionStatusTable {
  project_id: string;
  organization_id: string;
  local: Generated<string>;
  operational: Generated<string>;
  search_index: Generated<string>;
  backups: Generated<string>;
  durable_recall_mapping: Generated<string>;
  durable_blob_expiry: Generated<'not_guaranteed' | 'in_progress' | 'completed'>;
  unsupported_guarantees: Generated<string[]>;
  updated_at: Generated<Timestamp>;
}

export interface SecurityEventsTable {
  id: string;
  organization_id: string | null;
  project_id: string | null;
  actor_type: ActorType;
  actor_user_id: string | null;
  actor_device_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  result: 'allowed' | 'denied' | 'error';
  reason_code: string;
  request_id: string | null;
  correlation_id: string | null;
  step_up_verified: Generated<boolean>;
  occurred_at: Generated<Timestamp>;
}

export interface SchemaMigrationsTable {
  name: string;
  checksum: string;
  applied_at: Generated<Timestamp>;
  duration_ms: number;
}

/** The full database shape, keyed by `schema.table` as Kysely expects. */
export interface Database {
  'iam.organizations': OrganizationsTable;
  'iam.users': UsersTable;
  'iam.memberships': MembershipsTable;
  'iam.projects': ProjectsTable;
  'iam.project_grants': ProjectGrantsTable;
  'iam.devices': DevicesTable;
  'iam.memwal_bindings': MemwalBindingsTable;
  'iam.memwal_delegates': MemwalDelegatesTable;
  'iam.namespace_registry': NamespaceRegistryTable;

  'continuity.repository_links': RepositoryLinksTable;
  'continuity.work_units': WorkUnitsTable;
  'continuity.work_unit_links': WorkUnitLinksTable;
  'continuity.sessions': SessionsTable;
  'continuity.checkpoints': CheckpointsTable;
  'continuity.checkpoint_evidence': CheckpointEvidenceTable;
  'continuity.partial_tails': PartialTailsTable;

  'memory.evidence_records': EvidenceRecordsTable;
  'memory.memory_records': MemoryRecordsTable;
  'memory.memory_revisions': MemoryRevisionsTable;
  'memory.memory_evidence': MemoryEvidenceTable;
  'memory.supersession_edges': SupersessionEdgesTable;
  'memory.decisions': DecisionsTable;
  'memory.conflicts': ConflictsTable;
  'memory.conflict_sides': ConflictSidesTable;
  'memory.resolutions': ResolutionsTable;

  'intelligence.memory_embeddings': MemoryEmbeddingsTable;
  'intelligence.retrieval_requests': RetrievalRequestsTable;
  'intelligence.context_packs': ContextPacksTable;
  'intelligence.context_pack_items': ContextPackItemsTable;
  'intelligence.citations': CitationsTable;
  'intelligence.answers': AnswersTable;

  'platform.sync_policies': SyncPoliciesTable;
  'platform.route_decisions': RouteDecisionsTable;
  'platform.event_ledger': EventLedgerTable;
  'platform.outbox_jobs': OutboxJobsTable;
  'platform.operations': OperationsTable;
  'platform.durable_operations': DurableOperationsTable;
  'platform.compatibility_records': CompatibilityRecordsTable;
  'platform.feature_flags': FeatureFlagsTable;
  'platform.flag_assignments': FlagAssignmentsTable;
  'platform.deletion_status': DeletionStatusTable;
  'platform.schema_migrations': SchemaMigrationsTable;

  'audit.security_events': SecurityEventsTable;
}

/** Tables owned by each module. Only the owning module may write its own tables. */
export const SCHEMA_OWNERSHIP = {
  identity: ['iam'],
  continuity: ['continuity'],
  memory: ['memory'],
  intelligence: ['intelligence'],
  platform: ['platform'],
  audit: ['audit'],
} as const;
