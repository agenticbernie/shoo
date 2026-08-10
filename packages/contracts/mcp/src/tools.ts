import {
  authorityStatus,
  captureState,
  checkpointReason,
  clientName,
  conflictSeverity,
  longText,
  memoryType,
  policyVersion,
  relativePath,
  retrievalIntent,
  semver,
  sessionState,
  sha256Hex,
  shortText,
  timestamp,
  typedSubject,
  uuid,
  visibilityScope,
  workUnitState,
} from '@shoo/contracts-common';
import { z } from 'zod';
import { toolInput, toolResult } from './common.js';

/**
 * The nine MVP MCP tools — docs/38 "MVP tool contracts".
 *
 * Tool names are stable. Renaming one is a breaking contract change; the schema carries
 * the contract version and capability manifest instead (docs/64 "API versioning").
 */

// --- shoo.start_session -----------------------------------------------------

export const startSessionInput = toolInput({
  native_session_id: shortText,
  repository_fingerprint: sha256Hex,
  proposed_work_unit_evidence: z
    .object({
      recent_paths: z.array(relativePath).max(200).default([]),
      recent_commit_messages: z.array(shortText).max(50).default([]),
      prompt_summary: shortText.nullable().default(null),
    })
    .nullable()
    .default(null),
  capability_manifest_version: z.number().int().positive(),
  capabilities: z.array(shortText).max(100).default([]),
  capture_state: captureState,
});
export type StartSessionInput = z.infer<typeof startSessionInput>;

export const workUnitChoice = z.object({
  work_unit_id: uuid,
  title: shortText,
  state: workUnitState,
  confidence: z.number().min(0).max(1),
  reasons: z.array(shortText).max(20).default([]),
});

export const startSessionResult = toolResult({
  session_id: uuid,
  session_state: sessionState,
  /** Ambiguity is returned as choices with `status: "conflict"`, never inferred. */
  resolved_work_unit_id: uuid.nullable().default(null),
  work_unit_choices: z.array(workUnitChoice).max(10).default([]),
  effective_policy_version: policyVersion,
  capture_state: captureState,
  context_resource_uri: z.string().max(512).nullable().default(null),
  session_version: z.number().int().nonnegative(),
});
export type StartSessionResult = z.infer<typeof startSessionResult>;

// --- shoo.checkpoint_session ------------------------------------------------

export const checkpointSessionInput = toolInput({
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
  evidence_references: z.array(uuid).max(200).default([]),
  expected_session_version: z.number().int().nonnegative(),
});
export type CheckpointSessionInput = z.infer<typeof checkpointSessionInput>;

export const checkpointSessionResult = toolResult({
  checkpoint_id: uuid,
  checkpoint_revision: z.number().int().positive(),
  accepted_evidence_ids: z.array(uuid).max(200).default([]),
  /** Fields dropped because they were unverified or policy-denied — never silently lost. */
  omitted_fields: z
    .array(
      z.object({
        field: shortText,
        reason: z.enum(['unverified', 'policy_denied', 'empty_claim', 'over_budget']),
      }),
    )
    .max(50)
    .default([]),
  extraction_operation_id: uuid.nullable().default(null),
  durable_operation_id: uuid.nullable().default(null),
  session_version: z.number().int().nonnegative(),
});
export type CheckpointSessionResult = z.infer<typeof checkpointSessionResult>;

// --- shoo.complete_session --------------------------------------------------

export const completeSessionInput = toolInput({
  outcome: z.enum(['succeeded', 'partial', 'abandoned']),
  last_checkpoint_id: uuid.nullable().default(null),
  partial_tail: z.boolean().default(false),
  proposed_work_unit_state: workUnitState.nullable().default(null),
  expected_session_version: z.number().int().nonnegative(),
});
export type CompleteSessionInput = z.infer<typeof completeSessionInput>;

export const completeSessionResult = toolResult({
  session_id: uuid,
  session_state: sessionState,
  session_version: z.number().int().nonnegative(),
  /** Session completion and work completion are separate decisions (docs/38). */
  work_state_proposal: z
    .object({
      accepted: z.boolean(),
      resulting_work_unit_state: workUnitState.nullable().default(null),
      reason: shortText.nullable().default(null),
    })
    .nullable()
    .default(null),
  extraction_operation_id: uuid.nullable().default(null),
  durable_operation_id: uuid.nullable().default(null),
});
export type CompleteSessionResult = z.infer<typeof completeSessionResult>;

// --- shoo.resume_session ----------------------------------------------------

export const contextSection = z.object({
  section: z.enum([
    'identity',
    'objective_and_state',
    'verified_progress',
    'decisions_and_constraints',
    'tests',
    'unresolved',
    'recommended_next_action',
    'citations',
    'indicators',
    'manifest',
  ]),
  content: z.unknown(),
});

export const resumeSessionInput = toolInput({
  target_work_unit_id: uuid.nullable().default(null),
  resolution_evidence: z
    .object({
      recent_paths: z.array(relativePath).max(200).default([]),
      prompt_summary: shortText.nullable().default(null),
    })
    .nullable()
    .default(null),
  token_budget: z.number().int().min(256).max(200000).default(6000),
  intent: z.enum(['current', 'history']).default('current'),
  client_capabilities: z.array(shortText).max(100).default([]),
});
export type ResumeSessionInput = z.infer<typeof resumeSessionInput>;

export const resumeSessionResult = toolResult({
  session_id: uuid.nullable().default(null),
  resume_attempt_id: uuid,
  pack_id: uuid.nullable().default(null),
  pack_resource_uri: z.string().max(512).nullable().default(null),
  sections: z.array(contextSection).max(20).default([]),
  index_watermark: timestamp.nullable().default(null),
  resolver_version: semver.nullable().default(null),
  ranker_version: semver.nullable().default(null),
});
export type ResumeSessionResult = z.infer<typeof resumeSessionResult>;

// --- shoo.get_context -------------------------------------------------------

export const getContextInput = toolInput({
  intent: retrievalIntent,
  token_budget: z.number().int().min(256).max(200000).default(4000),
  file_paths: z.array(relativePath).max(200).default([]),
  memory_types: z.array(memoryType).max(20).optional(),
  include_history: z.boolean().default(false),
});
export type GetContextInput = z.infer<typeof getContextInput>;

export const contextItem = z.object({
  memory_id: uuid,
  revision_id: uuid,
  memory_type: memoryType,
  summary: longText,
  authority_status: authorityStatus,
  freshness: z.enum(['current', 'stale', 'expired', 'unknown']),
  rank: z.number().int().nonnegative(),
  token_allocation: z.number().int().nonnegative(),
});

export const getContextResult = toolResult({
  pack_id: uuid.nullable().default(null),
  pack_resource_uri: z.string().max(512).nullable().default(null),
  items: z.array(contextItem).max(500).default([]),
  token_used: z.number().int().nonnegative().default(0),
});
export type GetContextResult = z.infer<typeof getContextResult>;

// --- shoo.recall ------------------------------------------------------------

export const recallInput = toolInput({
  query: z.string().min(1).max(2000),
  intent: z.enum(['current', 'history', 'rationale', 'occurrence']),
  memory_types: z.array(memoryType).max(20).optional(),
  filters: z
    .object({
      subject_type: shortText.nullable().default(null),
      subject_key: shortText.nullable().default(null),
      branch: shortText.nullable().default(null),
      since: timestamp.nullable().default(null),
      until: timestamp.nullable().default(null),
    })
    .default({ subject_type: null, subject_key: null, branch: null, since: null, until: null }),
  limit: z.number().int().min(1).max(50).default(20),
});
export type RecallInput = z.infer<typeof recallInput>;

export const recallItem = z.object({
  memory_id: uuid,
  revision_id: uuid,
  memory_type: memoryType,
  subject: typedSubject,
  summary: longText,
  /** Superseded records can never satisfy a `current` intent as present truth (docs/38). */
  record_state: z.enum(['current', 'historical', 'conflicted']),
  authority_status: authorityStatus,
  score: z.number(),
  ranking_explanation: z.array(shortText).max(20).default([]),
});

export const recallResult = toolResult({
  items: z.array(recallItem).max(50).default([]),
  conflicts: z
    .array(z.object({ conflict_id: uuid, subject: typedSubject, severity: conflictSeverity }))
    .max(50)
    .default([]),
  total_candidates: z.number().int().nonnegative().default(0),
});
export type RecallResult = z.infer<typeof recallResult>;

// --- shoo.remember ----------------------------------------------------------

export const rememberInput = toolInput({
  memory_type: memoryType,
  subject: typedSubject,
  claim_content: z.record(z.string(), z.unknown()),
  evidence_references: z.array(uuid).max(200).default([]),
  requested_visibility: visibilityScope.default('private'),
  requested_durable: z.boolean().default(false),
});
export type RememberInput = z.infer<typeof rememberInput>;

export const rememberResult = toolResult({
  memory_id: uuid,
  revision_id: uuid,
  /** Defaults to candidate/unverified; the request never grants authority (docs/38). */
  authority_status: authorityStatus,
  verification_status: z.enum(['unverified', 'corroborated', 'verified', 'disputed']),
  granted_visibility: visibilityScope,
  route_decision: z.enum(['local_only', 'operational', 'durable', 'shared', 'denied']),
  durable_operation_id: uuid.nullable().default(null),
});
export type RememberResult = z.infer<typeof rememberResult>;

// --- shoo.supersede_memory --------------------------------------------------

export const supersedeMemoryInput = toolInput({
  memory_id: uuid,
  predecessor_revision_id: uuid,
  successor_revision_id: uuid.nullable().default(null),
  corrected_content: z.record(z.string(), z.unknown()).nullable().default(null),
  reason: longText,
  expected_version: z.number().int().nonnegative(),
  preview_token: z.string().min(8).max(2048).nullable().default(null),
});
export type SupersedeMemoryInput = z.infer<typeof supersedeMemoryInput>;

export const supersedeMemoryResult = toolResult({
  memory_id: uuid,
  predecessor_revision_id: uuid,
  successor_revision_id: uuid.nullable().default(null),
  lineage_status: z.enum(['active', 'superseded', 'deprecated', 'conflicted']),
  invalidated_pack_count: z.number().int().nonnegative().default(0),
  durable_operation_id: uuid.nullable().default(null),
  current_version: z.number().int().nonnegative().nullable().default(null),
});
export type SupersedeMemoryToolResult = z.infer<typeof supersedeMemoryResult>;

// --- shoo.mark_canonical ----------------------------------------------------

export const markCanonicalInput = toolInput({
  memory_id: uuid,
  revision_id: uuid,
  canonical_subject: typedSubject,
  rationale: longText,
  expected_version: z.number().int().nonnegative(),
  /** A tool call alone is not human approval; the token is issued outside model control. */
  preview_token: z.string().min(8).max(2048),
});
export type MarkCanonicalInput = z.infer<typeof markCanonicalInput>;

export const markCanonicalResult = toolResult({
  memory_id: uuid,
  revision_id: uuid,
  authority_status: authorityStatus,
  conflict_id: uuid.nullable().default(null),
  resolver_watermark: timestamp.nullable().default(null),
  invalidated_pack_count: z.number().int().nonnegative().default(0),
  current_version: z.number().int().nonnegative().nullable().default(null),
});
export type MarkCanonicalResult = z.infer<typeof markCanonicalResult>;

// --- registry ---------------------------------------------------------------

export interface McpToolDefinition {
  readonly name: string;
  /** Tool descriptions must state mutation and data-sharing impact plainly (docs/38). */
  readonly description: string;
  readonly mutating: boolean;
  /** Requires non-model-controlled step-up confirmation. */
  readonly requiresStepUp: boolean;
  readonly requiresExpectedVersion: boolean;
  readonly input: z.ZodTypeAny;
  readonly output: z.ZodTypeAny;
}

export const MCP_TOOLS = {
  'shoo.start_session': {
    name: 'shoo.start_session',
    description:
      'Register or resolve a Shoo session for this client and report work-unit and context readiness. Mutates Shoo session state. Does not change work completion.',
    mutating: true,
    requiresStepUp: false,
    requiresExpectedVersion: false,
    input: startSessionInput,
    output: startSessionResult,
  },
  'shoo.checkpoint_session': {
    name: 'shoo.checkpoint_session',
    description:
      'Record an explicit semantic checkpoint of the current session. Mutates Shoo session state and may start extraction and durable operations. Does not complete work.',
    mutating: true,
    requiresStepUp: false,
    requiresExpectedVersion: true,
    input: checkpointSessionInput,
    output: checkpointSessionResult,
  },
  'shoo.complete_session': {
    name: 'shoo.complete_session',
    description:
      'Record the outcome of this session and close its lifecycle. Mutates Shoo session state. A work-unit state change is only a proposal and is decided separately.',
    mutating: true,
    requiresStepUp: false,
    requiresExpectedVersion: true,
    input: completeSessionInput,
    output: completeSessionResult,
  },
  'shoo.resume_session': {
    name: 'shoo.resume_session',
    description:
      'Start or continue work using an immutable, permission-checked context pack with citations. Records a resume attempt.',
    mutating: true,
    requiresStepUp: false,
    requiresExpectedVersion: false,
    input: resumeSessionInput,
    output: resumeSessionResult,
  },
  'shoo.get_context': {
    name: 'shoo.get_context',
    description:
      'Read token-bounded project context with citations, authority and freshness. Does not change work state.',
    mutating: false,
    requiresStepUp: false,
    requiresExpectedVersion: false,
    input: getContextInput,
    output: getContextResult,
  },
  'shoo.recall': {
    name: 'shoo.recall',
    description:
      'Search structured project memory. Read only. Superseded records cannot satisfy a current-state intent.',
    mutating: false,
    requiresStepUp: false,
    requiresExpectedVersion: false,
    input: recallInput,
    output: recallResult,
  },
  'shoo.remember': {
    name: 'shoo.remember',
    description:
      'Propose a structured memory with evidence. Creates an unverified candidate; it never becomes canonical and never grants visibility beyond your grant.',
    mutating: true,
    requiresStepUp: false,
    requiresExpectedVersion: false,
    input: rememberInput,
    output: rememberResult,
  },
  'shoo.supersede_memory': {
    name: 'shoo.supersede_memory',
    description:
      'Replace an active memory revision through explicit lineage. Nothing is overwritten; the predecessor stays queryable as history. Broad impact requires an approved preview token.',
    mutating: true,
    requiresStepUp: false,
    requiresExpectedVersion: true,
    input: supersedeMemoryInput,
    output: supersedeMemoryResult,
  },
  'shoo.mark_canonical': {
    name: 'shoo.mark_canonical',
    description:
      'Mark a revision as project canonical truth. High impact: it changes what every surface reports as current. Requires project authority and a human-approved preview token.',
    mutating: true,
    requiresStepUp: true,
    requiresExpectedVersion: true,
    input: markCanonicalInput,
    output: markCanonicalResult,
  },
} as const satisfies Record<string, McpToolDefinition>;

export type McpToolName = keyof typeof MCP_TOOLS;

export const MCP_TOOL_NAMES = Object.keys(MCP_TOOLS) as readonly McpToolName[];

/**
 * Coordination tools explicitly unavailable in MVP (docs/38 "Deferred tools",
 * FIT-025). Present as a denylist so the conformance test can assert their absence.
 */
export const DEFERRED_MCP_TOOL_NAMES = [
  'shoo.claim_task',
  'shoo.assign_task',
  'shoo.create_blocker',
  'shoo.declare_dependency',
  'shoo.request_handoff',
  'shoo.recommend_available_work',
  'shoo.team_pace',
  'shoo.critical_path',
  'shoo.team_activity',
] as const;
export type DeferredMcpToolName = (typeof DEFERRED_MCP_TOOL_NAMES)[number];

export function isMcpToolName(value: string): value is McpToolName {
  return Object.hasOwn(MCP_TOOLS, value);
}

/** Client names accepted on the MCP surface for local stdio transports. */
export const MCP_LOCAL_CLIENTS = ['opencode', 'codex'] as const satisfies readonly z.infer<
  typeof clientName
>[];
