import {
  authorityStatus,
  citation,
  claimStatus,
  conflictSeverity,
  conflictState,
  durabilityStatus,
  freshnessStatus,
  lineageStatus,
  longText,
  memoryType,
  resolutionAction,
  semver,
  sha256Hex,
  shortText,
  timestamp,
  typedSubject,
  uuid,
  verificationStatus,
  visibilityScope,
} from '@shoo/contracts-common';
import { z } from 'zod';
import { expectedVersion, pageQuery, previewToken } from './common.js';

/** Memory, decision and conflict contracts (docs/37 "Memory and decision endpoints"). */

/** The six independent authority axes travel together and are never collapsed (docs/30). */
export const authorityStateView = z.object({
  claim_status: claimStatus,
  verification_status: verificationStatus,
  authority_status: authorityStatus,
  visibility_scope: visibilityScope,
  durability_status: durabilityStatus,
  freshness_status: freshnessStatus,
  lineage_status: lineageStatus,
});
export type AuthorityStateView = z.infer<typeof authorityStateView>;

export const memoryRevisionView = z.object({
  revision_id: uuid,
  memory_id: uuid,
  revision: z.number().int().positive(),
  content: z.record(z.string(), z.unknown()),
  content_hash: sha256Hex,
  state: authorityStateView,
  effective_at: timestamp,
  created_at: timestamp,
  created_by_user_id: uuid.nullable().default(null),
  extractor_version: semver.nullable().default(null),
  rule_version: semver.nullable().default(null),
  evidence_ids: z.array(uuid).max(200).default([]),
  predecessor_revision_id: uuid.nullable().default(null),
});
export type MemoryRevisionView = z.infer<typeof memoryRevisionView>;

export const memoryView = z.object({
  memory_id: uuid,
  project_id: uuid,
  memory_type: memoryType,
  subject: typedSubject,
  current_revision: memoryRevisionView,
  version: z.number().int().nonnegative(),
  conflict_ids: z.array(uuid).max(50).default([]),
  citations: z.array(citation).max(50).default([]),
  created_at: timestamp,
  updated_at: timestamp,
});
export type MemoryView = z.infer<typeof memoryView>;

export const memoryDetailView = memoryView.extend({
  revisions: z.array(memoryRevisionView).max(200),
  supersession_edges: z
    .array(
      z.object({
        predecessor_revision_id: uuid,
        successor_revision_id: uuid,
        reason: shortText,
        actor_user_id: uuid.nullable().default(null),
        created_at: timestamp,
      }),
    )
    .max(200)
    .default([]),
});
export type MemoryDetailView = z.infer<typeof memoryDetailView>;

/** `GET /v1/projects/{project_id}/memories` — intent is explicit, never inferred. */
export const listMemoriesQuery = pageQuery.extend({
  intent: z.enum(['current', 'history']),
  memory_types: z.array(memoryType).max(20).optional(),
  subject_type: shortText.optional(),
  subject_key: shortText.optional(),
  branch: shortText.optional(),
  work_unit_id: uuid.optional(),
  query: shortText.optional(),
  include_conflicted: z.coerce.boolean().default(true),
});
export type ListMemoriesQuery = z.infer<typeof listMemoriesQuery>;

/** `POST /v1/projects/{project_id}/memories` — always creates a candidate. */
export const proposeMemoryRequest = z.object({
  memory_type: memoryType,
  subject: typedSubject,
  content: z.record(z.string(), z.unknown()),
  evidence_ids: z.array(uuid).max(200).default([]),
  requested_visibility: visibilityScope.default('private'),
  requested_durable: z.boolean().default(false),
  work_unit_id: uuid.nullable().default(null),
  session_id: uuid.nullable().default(null),
});
export type ProposeMemoryRequest = z.infer<typeof proposeMemoryRequest>;

export const correctMemoryRequest = expectedVersion.extend({
  correction_type: z.enum(['content', 'scope', 'subject', 'retraction']),
  content: z.record(z.string(), z.unknown()),
  reason: longText,
  evidence_ids: z.array(uuid).max(200).default([]),
  preview_token: previewToken.nullable().default(null),
});
export type CorrectMemoryRequest = z.infer<typeof correctMemoryRequest>;

export const acceptMemoryRequest = expectedVersion.extend({
  revision_id: uuid,
  /** Constrained by the caller's grant; requesting more than granted is rejected. */
  requested_authority: authorityStatus,
  rationale: longText.nullable().default(null),
});
export type AcceptMemoryRequest = z.infer<typeof acceptMemoryRequest>;

export const markCanonicalRequest = expectedVersion.extend({
  revision_id: uuid,
  canonical_subject: typedSubject,
  rationale: longText,
  /** Human-approved preview token. An MCP/API call alone is not human approval (docs/38). */
  preview_token: previewToken,
});
export type MarkCanonicalRequest = z.infer<typeof markCanonicalRequest>;

export const supersedeMemoryRequest = expectedVersion.extend({
  predecessor_revision_id: uuid,
  successor_revision_id: uuid.nullable().default(null),
  successor_content: z.record(z.string(), z.unknown()).nullable().default(null),
  reason: longText,
  preview_token: previewToken.nullable().default(null),
});
export type SupersedeMemoryRequest = z.infer<typeof supersedeMemoryRequest>;

export const supersedeMemoryResult = z.object({
  memory_id: uuid,
  predecessor_revision_id: uuid,
  successor_revision_id: uuid,
  lineage_status: lineageStatus,
  invalidated_context_pack_count: z.number().int().nonnegative(),
  durable_operation_id: uuid.nullable().default(null),
});
export type SupersedeMemoryResult = z.infer<typeof supersedeMemoryResult>;

export const decisionView = z.object({
  memory_id: uuid,
  revision_id: uuid,
  decision_key: shortText,
  impact: z.enum(['local', 'project', 'organization']),
  approval_scope: authorityStatus,
  state: authorityStateView,
  rationale: longText.nullable().default(null),
  citations: z.array(citation).max(50).default([]),
  effective_at: timestamp,
});
export type DecisionView = z.infer<typeof decisionView>;

export const conflictSideView = z.object({
  side_label: shortText,
  revision_id: uuid.nullable().default(null),
  evidence_id: uuid.nullable().default(null),
  /** Unauthorized side evidence is withheld rather than fabricated (docs/37). */
  visible: z.boolean().default(true),
  summary: shortText.nullable().default(null),
});

export const conflictView = z.object({
  conflict_id: uuid,
  project_id: uuid,
  subject: typedSubject,
  scope_fingerprint: sha256Hex,
  state: conflictState,
  severity: conflictSeverity,
  detected_rule_version: semver,
  sides: z.array(conflictSideView).min(2).max(20),
  detected_at: timestamp,
  resolved_at: timestamp.nullable().default(null),
  version: z.number().int().nonnegative(),
});
export type ConflictView = z.infer<typeof conflictView>;

export const listConflictsQuery = pageQuery.extend({
  state: conflictState.optional(),
  subject_type: shortText.optional(),
  work_unit_id: uuid.optional(),
});
export type ListConflictsQuery = z.infer<typeof listConflictsQuery>;

export const resolveConflictRequest = expectedVersion.extend({
  action: resolutionAction,
  selected_revision_id: uuid.nullable().default(null),
  merged_content: z.record(z.string(), z.unknown()).nullable().default(null),
  scope_restriction: typedSubject.nullable().default(null),
  rationale: longText,
  preview_token: previewToken,
});
export type ResolveConflictRequest = z.infer<typeof resolveConflictRequest>;

export const resolveConflictResult = z.object({
  conflict_id: uuid,
  resolution_id: uuid,
  action: resolutionAction,
  resulting_revision_id: uuid.nullable().default(null),
  invalidation_watermark: timestamp,
  state: conflictState,
});
export type ResolveConflictResult = z.infer<typeof resolveConflictResult>;
