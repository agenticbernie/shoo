import { z } from 'zod';
import { completenessState, freshness } from './enums.js';
import { schemaVersion, uuid } from './scalars.js';

/** Contract version advertised by this build of the contracts packages. */
export const CONTRACT_SCHEMA_VERSION = 1 as const;

export const warning = z.object({
  code: z.string().min(1).max(128),
  message: z.string().min(1).max(512),
});
export type Warning = z.infer<typeof warning>;

export const responseMeta = z.object({
  request_id: uuid,
  schema_version: schemaVersion.default(CONTRACT_SCHEMA_VERSION),
  freshness: freshness.default('current'),
  warnings: z.array(warning).max(50).default([]),
});
export type ResponseMeta = z.infer<typeof responseMeta>;

export const completeness = z.object({
  state: completenessState,
  missing_capabilities: z.array(z.string().min(1).max(128)).max(50).default([]),
});
export type Completeness = z.infer<typeof completeness>;

/**
 * Success envelope (docs/37 "Common response envelopes").
 *
 * `data` is always an object so additive optional fields stay backward compatible.
 */
export function successEnvelope<T extends z.ZodTypeAny>(data: T) {
  return z.object({ data, meta: responseMeta });
}

/** Cursor page envelope for list endpoints. No unbounded exports through queries. */
export function pageEnvelope<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.object({
      items: z.array(item),
      next_cursor: z.string().min(1).max(2048).nullable().default(null),
      has_more: z.boolean().default(false),
    }),
    meta: responseMeta,
  });
}

export const operationHandle = z.object({
  operation_id: uuid,
  status: z.literal('pending').or(z.literal('running')),
  poll_url: z.string().min(1).max(512),
  poll_after_ms: z.number().int().positive().default(1000),
});
export type OperationHandle = z.infer<typeof operationHandle>;

/** 202 Accepted envelope. Receiving this means "do not resubmit" (docs/37, docs/38). */
export const acceptedEnvelope = z.object({
  data: operationHandle,
  meta: responseMeta,
});
export type AcceptedEnvelope = z.infer<typeof acceptedEnvelope>;

/**
 * Citation attached to any emitted fact. A factual claim without at least one permitted
 * citation cannot be emitted (docs/30 "Ranking contract", docs/36 `intelligence.citations`).
 */
export const citation = z.object({
  claim_key: z.string().min(1).max(256),
  memory_id: uuid.nullable().default(null),
  revision_id: uuid.nullable().default(null),
  evidence_id: uuid.nullable().default(null),
  source_id: uuid.nullable().default(null),
  /** Excerpts are policy-gated; `null` means the excerpt is not permitted for this actor. */
  excerpt: z.string().max(2000).nullable().default(null),
  excerpt_policy: z.enum(['permitted', 'restricted', 'local_unavailable']).default('restricted'),
  occurred_at: z.string().nullable().default(null),
});
export type Citation = z.infer<typeof citation>;
