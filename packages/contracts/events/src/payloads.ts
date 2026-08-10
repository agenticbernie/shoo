import {
  aggregateVersion,
  authorityStatus,
  captureState,
  checkpointReason,
  claimStatus,
  clientName,
  completenessState,
  conflictSeverity,
  durabilityStatus,
  freshnessStatus,
  lineageStatus,
  longText,
  memoryType,
  policyVersion,
  relativePath,
  resolutionAction,
  retrievalIntent,
  routeDecision,
  semver,
  sessionState,
  sha256Hex,
  shortText,
  timestamp,
  trustMode,
  typedSubject,
  uuid,
  verificationStatus,
  visibilityScope,
  workUnitState,
} from '@shoo/contracts-common';
import { z } from 'zod';

/**
 * Event payload schemas — docs/29 "Event taxonomy" and docs/36 "Event payload minimums".
 *
 * Only the events listed as accepted MVP events may be emitted. Coordination payloads
 * (blocker/dependency/handoff) are schema-reserved: they exist here so migration fixtures
 * and forward compatibility work, and `MVP_EMITTABLE_EVENT_TYPES` excludes them.
 */

const evidenceRefs = z.array(uuid).max(200).default([]);

// --- identity / project -----------------------------------------------------

export const projectLinkedPayload = z.object({
  project_id: uuid,
  repository_fingerprint: sha256Hex,
  repository_provider: shortText.nullable().default(null),
  repository_ref: shortText.nullable().default(null),
  local_identity_hash: sha256Hex,
  linked_by_user_id: uuid,
});

export const projectLinkReconciledPayload = z.object({
  project_id: uuid,
  previous_repository_fingerprint: sha256Hex,
  repository_fingerprint: sha256Hex,
  reason: shortText,
  expected_version: aggregateVersion,
});

// --- continuity -------------------------------------------------------------

export const workUnitProposedPayload = z.object({
  work_unit_id: uuid,
  title: shortText,
  objective: longText.nullable().default(null),
  proposal_confidence: z.number().min(0).max(1),
  evidence_ids: evidenceRefs,
  branch: shortText.nullable().default(null),
});

export const workUnitSelectedPayload = z.object({
  work_unit_id: uuid,
  session_id: uuid.nullable().default(null),
  selection_source: z.enum(['user', 'adapter', 'resolver']),
  alternatives_considered: z.array(uuid).max(20).default([]),
});

export const workUnitReassignedPayload = z.object({
  work_unit_id: uuid,
  previous_owner_user_id: uuid.nullable().default(null),
  new_owner_user_id: uuid,
  expected_version: aggregateVersion,
  reason: shortText,
});

export const workUnitStateChangedPayload = z.object({
  work_unit_id: uuid,
  prior_state: workUnitState,
  new_state: workUnitState,
  expected_version: aggregateVersion,
  new_version: aggregateVersion,
  reason: shortText,
  evidence_ids: evidenceRefs,
});

export const sessionStartedPayload = z.object({
  session_id: uuid,
  work_unit_id: uuid.nullable().default(null),
  client: clientName,
  client_version: shortText,
  capability_manifest_version: z.number().int().positive(),
  capabilities: z.array(shortText).max(100).default([]),
  work_unit_resolution: z.enum(['resolved', 'ambiguous', 'unknown', 'created']),
  capture_state: captureState,
});

export const sessionCaptureDegradedPayload = z.object({
  session_id: uuid,
  capture_state: captureState,
  missing_capabilities: z.array(shortText).max(100).default([]),
  detected_at: timestamp,
  reason_code: shortText,
});

export const sessionCheckpointedPayload = z.object({
  session_id: uuid,
  checkpoint_id: uuid,
  checkpoint_revision: z.number().int().positive(),
  trigger: checkpointReason,
  completeness: completenessState,
  evidence_ids: evidenceRefs,
  omitted_fields: z.array(shortText).max(50).default([]),
});

export const sessionCompletedPayload = z.object({
  session_id: uuid,
  session_state: z.literal('completed'),
  outcome: z.enum(['succeeded', 'partial', 'abandoned']),
  last_checkpoint_id: uuid.nullable().default(null),
  partial_tail: z.boolean().default(false),
  /** Session completion is never work completion (docs/38). A proposal is only a proposal. */
  proposed_work_unit_state: workUnitState.nullable().default(null),
  expected_session_version: aggregateVersion,
});

export const sessionFailedPayload = z.object({
  session_id: uuid,
  session_state: z.literal('failed'),
  reason_code: shortText,
  partial_tail: z.boolean().default(false),
  last_checkpoint_id: uuid.nullable().default(null),
});

// --- evidence and memory ----------------------------------------------------

export const evidenceObservedPayload = z.object({
  evidence_id: uuid,
  source_type: z.enum([
    'prompt',
    'assistant_message',
    'tool_call',
    'file_change',
    'test_run',
    'command',
    'git',
    'user_note',
  ]),
  source_ref: shortText.nullable().default(null),
  content_hash: sha256Hex,
  occurred_at: timestamp,
  received_at: timestamp,
  policy_version: policyVersion,
  local_availability: z.enum(['available', 'expired', 'purged', 'unknown']),
  classification: z.enum(['restricted', 'operational', 'durable_eligible']),
  affected_paths: z.array(relativePath).max(200).default([]),
});

export const memoryCandidateExtractedPayload = z.object({
  memory_id: uuid,
  revision_id: uuid,
  memory_type: memoryType,
  subject: typedSubject,
  extractor_version: semver,
  model_version: shortText.nullable().default(null),
  evidence_ids: evidenceRefs,
  claim_status: claimStatus,
  verification_status: verificationStatus.default('unverified'),
  authority_status: authorityStatus.default('session'),
  visibility_scope: visibilityScope.default('private'),
});

export const memoryVerifiedPayload = z.object({
  memory_id: uuid,
  revision_id: uuid,
  prior_verification_status: verificationStatus,
  verification_status: verificationStatus,
  verified_by_actor_type: z.enum(['user', 'rule', 'corroboration']),
  rule_version: semver.nullable().default(null),
  evidence_ids: evidenceRefs,
});

export const memoryCorrectedPayload = z.object({
  memory_id: uuid,
  predecessor_revision_id: uuid,
  successor_revision_id: uuid,
  correction_type: z.enum(['content', 'scope', 'subject', 'retraction']),
  reason: longText,
  impact_scope: z.object({
    invalidated_context_pack_count: z.number().int().nonnegative().default(0),
    affected_citation_count: z.number().int().nonnegative().default(0),
    durable_successor_required: z.boolean().default(false),
  }),
});

export const memorySupersededPayload = z.object({
  memory_id: uuid,
  predecessor_revision_id: uuid,
  successor_revision_id: uuid,
  authority_actor_id: uuid,
  effective_at: timestamp,
  lineage_status: lineageStatus,
});

export const decisionProposedPayload = z.object({
  memory_id: uuid,
  revision_id: uuid,
  decision_key: shortText,
  impact: z.enum(['local', 'project', 'organization']),
  evidence_ids: evidenceRefs,
});

export const decisionAcceptedPayload = z.object({
  memory_id: uuid,
  revision_id: uuid,
  decision_key: shortText,
  approval_scope: authorityStatus,
  approved_by_user_id: uuid,
  step_up_verified: z.boolean(),
  expected_version: aggregateVersion,
});

export const decisionSupersededPayload = z.object({
  memory_id: uuid,
  predecessor_revision_id: uuid,
  successor_revision_id: uuid,
  decision_key: shortText,
  approved_by_user_id: uuid,
  effective_at: timestamp,
});

export const conflictDetectedPayload = z.object({
  conflict_id: uuid,
  subject: typedSubject,
  scope_fingerprint: sha256Hex,
  side_revision_ids: z.array(uuid).min(2).max(20),
  detected_rule_version: semver,
  severity: conflictSeverity,
});

export const conflictResolvedPayload = z.object({
  conflict_id: uuid,
  resolution_id: uuid,
  action: resolutionAction,
  resulting_revision_id: uuid.nullable().default(null),
  invalidation_watermark: timestamp,
  resolved_by_user_id: uuid,
});

// --- intelligence -----------------------------------------------------------

export const contextRequestedPayload = z.object({
  request_id: uuid,
  intent: retrievalIntent,
  token_budget: z.number().int().positive(),
  requested_scope: z.object({
    branch: shortText.nullable().default(null),
    module_paths: z.array(relativePath).max(64).default([]),
    include_history: z.boolean().default(false),
  }),
  client: clientName,
});

export const contextBuiltPayload = z.object({
  request_id: uuid,
  pack_id: uuid,
  content_hash: sha256Hex,
  resolver_version: semver,
  ranker_version: semver,
  index_watermark: timestamp,
  completeness: completenessState,
  token_used: z.number().int().nonnegative(),
  item_count: z.number().int().nonnegative(),
  citation_coverage: z.number().min(0).max(1),
});

export const contextConsumedPayload = z.object({
  pack_id: uuid,
  consumer: clientName,
  consumed_at: timestamp,
  truncated: z.boolean().default(false),
});

// --- sync and durability ----------------------------------------------------

export const syncRouteDecidedPayload = z.object({
  subject_kind: z.enum(['evidence', 'revision']),
  subject_id: uuid,
  policy_version: policyVersion,
  classification: z.enum(['restricted', 'operational', 'durable_eligible']),
  local_decision: routeDecision,
  operational_decision: routeDecision,
  durable_decision: routeDecision,
  shared_decision: routeDecision,
  reason_code: shortText,
});

export const durableRequestedPayload = z.object({
  durable_operation_id: uuid,
  revision_id: uuid,
  namespace_binding_id: uuid,
  trust_mode: trustMode,
  operation_key: shortText,
  payload_hash: sha256Hex,
});

export const durablePersistedPayload = z.object({
  durable_operation_id: uuid,
  revision_id: uuid,
  namespace_binding_id: uuid,
  job_id: shortText,
  blob_locator: shortText,
  payload_hash: sha256Hex,
  local_schema_version: z.number().int().positive(),
  remote_schema_version: z.number().int().positive(),
  durability_status: durabilityStatus,
});

export const durableFailedPayload = z.object({
  durable_operation_id: uuid,
  revision_id: uuid,
  reason_code: shortText,
  attempts: z.number().int().nonnegative(),
  terminal: z.boolean(),
  /** Durable failure never invalidates operational truth (docs/38). */
  operational_state_preserved: z.literal(true),
});

export const durableReconciledPayload = z.object({
  durable_operation_id: uuid,
  revision_id: uuid,
  reconciled_status: durabilityStatus,
  blob_locator: shortText.nullable().default(null),
  discrepancy: shortText.nullable().default(null),
});

// --- freshness maintenance --------------------------------------------------

export const memoryFreshnessChangedPayload = z.object({
  memory_id: uuid,
  revision_id: uuid,
  prior_freshness: freshnessStatus,
  freshness: freshnessStatus,
  evaluated_at: timestamp,
  rule_version: semver,
});

/** Registry of accepted MVP event payloads, keyed by `event_type`. */
export const EVENT_PAYLOADS = {
  'project.linked': projectLinkedPayload,
  'project.link_reconciled': projectLinkReconciledPayload,
  'work_unit.proposed': workUnitProposedPayload,
  'work_unit.selected': workUnitSelectedPayload,
  'work_unit.reassigned': workUnitReassignedPayload,
  'work_unit.state_changed': workUnitStateChangedPayload,
  'session.started': sessionStartedPayload,
  'session.capture_degraded': sessionCaptureDegradedPayload,
  'session.checkpointed': sessionCheckpointedPayload,
  'session.completed': sessionCompletedPayload,
  'session.failed': sessionFailedPayload,
  'evidence.observed': evidenceObservedPayload,
  'memory.candidate_extracted': memoryCandidateExtractedPayload,
  'memory.verified': memoryVerifiedPayload,
  'memory.corrected': memoryCorrectedPayload,
  'memory.superseded': memorySupersededPayload,
  'memory.freshness_changed': memoryFreshnessChangedPayload,
  'decision.proposed': decisionProposedPayload,
  'decision.accepted': decisionAcceptedPayload,
  'decision.superseded': decisionSupersededPayload,
  'conflict.detected': conflictDetectedPayload,
  'conflict.resolved': conflictResolvedPayload,
  'context.requested': contextRequestedPayload,
  'context.built': contextBuiltPayload,
  'context.consumed': contextConsumedPayload,
  'sync.route_decided': syncRouteDecidedPayload,
  'durable.requested': durableRequestedPayload,
  'durable.persisted': durablePersistedPayload,
  'durable.failed': durableFailedPayload,
  'durable.reconciled': durableReconciledPayload,
} as const;

export type EventType = keyof typeof EVENT_PAYLOADS;

export type EventPayloadMap = {
  [K in EventType]: z.infer<(typeof EVENT_PAYLOADS)[K]>;
};

/**
 * Coordination event names reserved by schema but never emitted by MVP services
 * (docs/29, FIT-025 "Coordination remains out of MVP").
 */
export const RESERVED_EVENT_TYPES = [
  'blocker.raised',
  'blocker.cleared',
  'dependency.declared',
  'dependency.satisfied',
  'handoff.requested',
  'handoff.accepted',
] as const;
export type ReservedEventType = (typeof RESERVED_EVENT_TYPES)[number];

export const MVP_EMITTABLE_EVENT_TYPES = Object.keys(EVENT_PAYLOADS) as readonly EventType[];

export function isEmittableEventType(value: string): value is EventType {
  return Object.hasOwn(EVENT_PAYLOADS, value);
}

export function isReservedEventType(value: string): value is ReservedEventType {
  return (RESERVED_EVENT_TYPES as readonly string[]).includes(value);
}
