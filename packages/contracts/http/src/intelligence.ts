import {
  askIntent,
  citation,
  clientName,
  completeness,
  freshness,
  longText,
  memoryType,
  relativePath,
  retrievalIntent,
  semver,
  sha256Hex,
  shortText,
  timestamp,
  uuid,
} from '@shoo/contracts-common';
import { z } from 'zod';
import { pageQuery } from './common.js';
import { authorityStateView } from './memory.js';

/** Context pack, Ask, pulse and activity contracts (docs/37 "Intelligence endpoints"). */

/** `POST /v1/projects/{project_id}/context-packs`. Server may lower budget, never broaden scope. */
export const buildContextPackRequest = z.object({
  work_unit_id: uuid.nullable().default(null),
  intent: retrievalIntent,
  client: clientName,
  branch: shortText.nullable().default(null),
  module_paths: z.array(relativePath).max(64).default([]),
  file_paths: z.array(relativePath).max(200).default([]),
  memory_types: z.array(memoryType).max(20).optional(),
  token_budget: z.number().int().min(256).max(200000).default(6000),
  include_history: z.boolean().default(false),
});
export type BuildContextPackRequest = z.infer<typeof buildContextPackRequest>;

export const contextPackItem = z.object({
  revision_id: uuid,
  memory_id: uuid,
  memory_type: memoryType,
  rank: z.number().int().nonnegative(),
  score: z.number(),
  score_features: z.record(z.string(), z.number()).default({}),
  token_allocation: z.number().int().nonnegative(),
  state: authorityStateView,
  summary: longText,
  citations: z.array(citation).max(20).default([]),
});
export type ContextPackItem = z.infer<typeof contextPackItem>;

/** Required pack sections (docs/30 "Context pack contract"). Order is part of the contract. */
export const contextPackSections = z.object({
  identity: z.object({
    project_id: uuid,
    work_unit_id: uuid.nullable().default(null),
    branch: shortText.nullable().default(null),
    worktree_id: shortText.nullable().default(null),
    requesting_client: clientName,
  }),
  objective_and_state: z.object({
    objective: longText.nullable().default(null),
    work_state: shortText,
    summary: longText.nullable().default(null),
  }),
  verified_progress: z.object({
    progress: z.array(shortText).max(50).default([]),
    affected_artifacts: z.array(relativePath).max(200).default([]),
  }),
  decisions_and_constraints: z.array(contextPackItem).max(100).default([]),
  tests: z
    .array(
      z.object({
        name: shortText,
        outcome: z.enum(['passed', 'failed', 'skipped', 'unknown']),
        observed_at: timestamp,
      }),
    )
    .max(100)
    .default([]),
  unresolved: z.object({
    blockers: z.array(shortText).max(50).default([]),
    conflicts: z.array(uuid).max(50).default([]),
    uncertainty: z.array(shortText).max(50).default([]),
  }),
  /** Always labelled as a suggestion, never as fact. */
  recommended_next_action: z
    .object({ label: z.literal('suggestion'), text: longText })
    .nullable()
    .default(null),
  citations: z.array(citation).max(200).default([]),
  indicators: z.object({
    completeness,
    freshness,
    degraded_reasons: z.array(shortText).max(20).default([]),
    durability: z.enum(['local', 'operational', 'durable', 'mixed', 'unknown']),
  }),
  manifest: z.object({
    resolver_version: semver,
    ranker_version: semver,
    index_watermark: timestamp,
    filters_applied: z.array(shortText).max(50).default([]),
    candidate_count: z.number().int().nonnegative(),
    selected_count: z.number().int().nonnegative(),
  }),
});
export type ContextPackSections = z.infer<typeof contextPackSections>;

/** Packs are immutable and content addressed (docs/30). */
export const contextPackView = z.object({
  pack_id: uuid,
  request_id: uuid,
  content_hash: sha256Hex,
  token_budget: z.number().int().positive(),
  token_used: z.number().int().nonnegative(),
  created_at: timestamp,
  invalidated_at: timestamp.nullable().default(null),
  sections: contextPackSections,
  items: z.array(contextPackItem).max(500).default([]),
});
export type ContextPackView = z.infer<typeof contextPackView>;

/** `POST /v1/projects/{project_id}/ask`. */
export const askRequest = z.object({
  question: z.string().min(1).max(4000),
  intent: askIntent.nullable().default(null),
  work_unit_id: uuid.nullable().default(null),
  branch: shortText.nullable().default(null),
  module_paths: z.array(relativePath).max(64).default([]),
  token_budget: z.number().int().min(256).max(200000).default(4000),
  include_history: z.boolean().default(false),
});
export type AskRequest = z.infer<typeof askRequest>;

const claim = z.object({
  claim_key: shortText,
  text: longText,
  citations: z.array(citation).min(1).max(20),
  state: authorityStateView,
});

/**
 * Facts, inferences and suggestions are stored and returned separately (docs/30).
 * Insufficient evidence answers "unknown from available project evidence" and names the gap.
 */
export const askResult = z.object({
  request_id: uuid,
  classified_intent: askIntent,
  evidence_sufficiency: z.enum(['sufficient', 'partial', 'insufficient']),
  facts: z.array(claim).max(100).default([]),
  inferences: z
    .array(claim.extend({ confidence: z.number().min(0).max(1) }))
    .max(100)
    .default([]),
  suggestions: z
    .array(z.object({ text: longText, rationale: longText.nullable().default(null) }))
    .max(20)
    .default([]),
  missing_evidence: z.array(shortText).max(50).default([]),
  conflicts: z.array(uuid).max(50).default([]),
  pack_id: uuid.nullable().default(null),
  content_hash: sha256Hex,
});
export type AskResult = z.infer<typeof askResult>;

export const pulseView = z.object({
  project_id: uuid,
  current_work: z
    .array(
      z.object({
        work_unit_id: uuid,
        title: shortText,
        state: shortText,
        last_activity_at: timestamp,
        session_active: z.boolean(),
      }),
    )
    .max(50)
    .default([]),
  recent_changes: z
    .array(
      z.object({
        memory_id: uuid,
        memory_type: memoryType,
        summary: shortText,
        occurred_at: timestamp,
      }),
    )
    .max(100)
    .default([]),
  current_decisions: z.array(uuid).max(100).default([]),
  active_conflicts: z.array(uuid).max(100).default([]),
  degraded: z
    .object({
      capture: z.boolean().default(false),
      indexing: z.boolean().default(false),
      durable: z.boolean().default(false),
      reasons: z.array(shortText).max(20).default([]),
    })
    .default({ capture: false, indexing: false, durable: false, reasons: [] }),
  resolver_watermark: timestamp,
});
export type PulseView = z.infer<typeof pulseView>;

export const activityItem = z.object({
  event_id: uuid,
  event_type: shortText,
  occurred_at: timestamp,
  actor_label: shortText,
  work_unit_id: uuid.nullable().default(null),
  summary: shortText,
});
export type ActivityItem = z.infer<typeof activityItem>;

export const listActivityQuery = pageQuery.extend({
  work_unit_id: uuid.optional(),
  since: timestamp.optional(),
  event_types: z.array(shortText).max(50).optional(),
});
export type ListActivityQuery = z.infer<typeof listActivityQuery>;
