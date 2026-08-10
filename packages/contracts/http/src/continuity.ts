import {
  captureState,
  checkpointReason,
  clientContext,
  clientName,
  completenessState,
  freshness,
  idempotencyKey,
  longText,
  policyVersion,
  relativePath,
  requestScope,
  schemaVersion,
  sessionState,
  sha256Hex,
  shortText,
  timestamp,
  uuid,
  workUnitState,
} from '@shoo/contracts-common';
import { z } from 'zod';
import { expectedVersion } from './common.js';

/** Work unit, session, checkpoint and capture ingestion contracts (docs/37). */

export const workUnitView = z.object({
  work_unit_id: uuid,
  project_id: uuid,
  title: shortText,
  objective: longText.nullable().default(null),
  state: workUnitState,
  owner_user_id: uuid.nullable().default(null),
  branch: shortText.nullable().default(null),
  worktree_id: shortText.nullable().default(null),
  links: z
    .array(
      z.object({
        link_type: z.enum(['issue', 'pull_request', 'ticket', 'document', 'commit']),
        external_id: shortText,
        url: z.string().max(2048).nullable().default(null),
      }),
    )
    .max(50)
    .default([]),
  version: z.number().int().nonnegative(),
  freshness,
  created_at: timestamp,
  updated_at: timestamp,
});
export type WorkUnitView = z.infer<typeof workUnitView>;

/** `POST /v1/projects/{project_id}/work-units:resolve` — resolved, ambiguous or unknown. */
export const resolveWorkUnitRequest = z.object({
  client_context: clientContext,
  request_scope: requestScope,
  evidence: z.object({
    recent_paths: z.array(relativePath).max(200).default([]),
    recent_commit_messages: z.array(shortText).max(50).default([]),
    prompt_summary: shortText.nullable().default(null),
    native_session_id: shortText.nullable().default(null),
  }),
  allow_create: z.boolean().default(false),
});
export type ResolveWorkUnitRequest = z.infer<typeof resolveWorkUnitRequest>;

export const workUnitCandidate = z.object({
  work_unit_id: uuid,
  title: shortText,
  state: workUnitState,
  confidence: z.number().min(0).max(1),
  reasons: z.array(shortText).max(20).default([]),
});

/** Ambiguity is returned as choices; the resolver never infers a selection (docs/38). */
export const resolveWorkUnitResult = z.discriminatedUnion('resolution', [
  z.object({ resolution: z.literal('resolved'), work_unit: workUnitView }),
  z.object({
    resolution: z.literal('ambiguous'),
    choices: z.array(workUnitCandidate).min(2).max(10),
  }),
  z.object({
    resolution: z.literal('unknown'),
    suggested_title: shortText.nullable().default(null),
  }),
  z.object({ resolution: z.literal('created'), work_unit: workUnitView }),
]);
export type ResolveWorkUnitResult = z.infer<typeof resolveWorkUnitResult>;

export const createWorkUnitRequest = z.object({
  title: shortText,
  objective: longText.nullable().default(null),
  branch: shortText.nullable().default(null),
  worktree_id: shortText.nullable().default(null),
  owner_user_id: uuid.nullable().default(null),
});
export type CreateWorkUnitRequest = z.infer<typeof createWorkUnitRequest>;

export const transitionWorkUnitRequest = expectedVersion.extend({
  target_state: workUnitState,
  reason: shortText,
  evidence_ids: z.array(uuid).max(200).default([]),
});
export type TransitionWorkUnitRequest = z.infer<typeof transitionWorkUnitRequest>;

export const sessionView = z.object({
  session_id: uuid,
  project_id: uuid,
  work_unit_id: uuid.nullable().default(null),
  developer_user_id: uuid,
  device_id: uuid.nullable().default(null),
  agent_id: uuid.nullable().default(null),
  client: clientName,
  session_state: sessionState,
  capture_state: captureState,
  capability_manifest_version: z.number().int().positive(),
  policy_version: policyVersion,
  version: z.number().int().nonnegative(),
  started_at: timestamp,
  ended_at: timestamp.nullable().default(null),
});
export type SessionView = z.infer<typeof sessionView>;

/** `POST /v1/projects/{project_id}/sessions` — idempotent session start. */
export const startSessionRequest = z.object({
  client_context: clientContext,
  native_session_id: shortText,
  repository_fingerprint: sha256Hex,
  request_scope: requestScope,
  work_unit_id: uuid.nullable().default(null),
  work_unit_evidence: z
    .object({
      recent_paths: z.array(relativePath).max(200).default([]),
      prompt_summary: shortText.nullable().default(null),
    })
    .nullable()
    .default(null),
  capability_manifest_version: z.number().int().positive(),
  capabilities: z.array(shortText).max(100).default([]),
  capture_state: captureState,
});
export type StartSessionRequest = z.infer<typeof startSessionRequest>;

export const checkpointView = z.object({
  checkpoint_id: uuid,
  session_id: uuid,
  work_unit_id: uuid,
  revision: z.number().int().positive(),
  reason: checkpointReason,
  objective: longText.nullable().default(null),
  progress: z.array(shortText).max(50).default([]),
  next_action: longText.nullable().default(null),
  completeness: completenessState,
  omitted_fields: z.array(shortText).max(50).default([]),
  created_at: timestamp,
});
export type CheckpointView = z.infer<typeof checkpointView>;

/** `POST /v1/projects/{project_id}/sessions/{id}:checkpoint`. Returns 202 when async work follows. */
export const checkpointSessionRequest = z.object({
  expected_session_version: z.number().int().nonnegative(),
  reason: checkpointReason,
  objective: longText.nullable().default(null),
  progress: z.array(shortText).max(50).default([]),
  partial_changes: z.array(relativePath).max(200).default([]),
  tests: z
    .array(
      z.object({
        name: shortText,
        outcome: z.enum(['passed', 'failed', 'skipped', 'unknown']),
        detail: shortText.nullable().default(null),
      }),
    )
    .max(100)
    .default([]),
  blockers: z.array(shortText).max(50).default([]),
  uncertainty: z.array(shortText).max(50).default([]),
  next_action: longText.nullable().default(null),
  evidence_ids: z.array(uuid).max(200).default([]),
  trigger_idempotency_key: idempotencyKey,
});
export type CheckpointSessionRequest = z.infer<typeof checkpointSessionRequest>;

export const completeSessionRequest = z.object({
  expected_session_version: z.number().int().nonnegative(),
  outcome: z.enum(['succeeded', 'partial', 'abandoned']),
  last_checkpoint_id: uuid.nullable().default(null),
  partial_tail: z.boolean().default(false),
  /** A proposal only. The work-unit decision is separate (docs/38). */
  proposed_work_unit_state: workUnitState.nullable().default(null),
});
export type CompleteSessionRequest = z.infer<typeof completeSessionRequest>;

export const failSessionRequest = z.object({
  expected_session_version: z.number().int().nonnegative(),
  reason_code: shortText,
  partial_tail: z.boolean().default(false),
  last_checkpoint_id: uuid.nullable().default(null),
});
export type FailSessionRequest = z.infer<typeof failSessionRequest>;

export const resumeSessionRequest = z.object({
  work_unit_id: uuid.nullable().default(null),
  token_budget: z.number().int().min(256).max(200000).default(6000),
  include_history: z.boolean().default(false),
  client_context: clientContext,
  request_scope: requestScope,
});
export type ResumeSessionRequest = z.infer<typeof resumeSessionRequest>;

// --- capture ingestion ------------------------------------------------------

export const captureEventItem = z.object({
  source_event_id: shortText,
  schema_version: schemaVersion,
  event_type: shortText,
  occurred_at: timestamp,
  policy_version: policyVersion,
  idempotency_key: idempotencyKey,
  source_sequence: z.number().int().nonnegative().nullable().default(null),
  session_id: uuid.nullable().default(null),
  work_unit_id: uuid.nullable().default(null),
  content_hash: sha256Hex,
  /**
   * Raw bodies are forbidden unless the project policy explicitly permits them
   * (docs/37 "Capture ingestion"). Servers reject `raw_body` when policy says no.
   */
  raw_body: z.string().max(65536).nullable().default(null),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type CaptureEventItem = z.infer<typeof captureEventItem>;

export const captureBatchRequest = z.object({
  device_id: uuid,
  adapter_instance_id: shortText,
  client_context: clientContext,
  items: z.array(captureEventItem).min(1).max(500),
});
export type CaptureBatchRequest = z.infer<typeof captureBatchRequest>;

/** Per-item outcomes: one invalid item does not roll back independent valid items. */
export const captureBatchResult = z.object({
  accepted: z.array(z.object({ source_event_id: shortText, evidence_id: uuid })).default([]),
  duplicate: z.array(z.object({ source_event_id: shortText, evidence_id: uuid })).default([]),
  quarantined: z
    .array(z.object({ source_event_id: shortText, reason_code: shortText }))
    .default([]),
  rejected: z
    .array(z.object({ source_event_id: shortText, reason_code: shortText, message: shortText }))
    .default([]),
});
export type CaptureBatchResult = z.infer<typeof captureBatchResult>;
