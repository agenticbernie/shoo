import { aggregateVersion, cursor, idempotencyKey, uuid } from '@shoo/contracts-common';
import { z } from 'zod';

/** Base path of the current HTTP major version (docs/37 "API principles"). */
export const HTTP_API_BASE_PATH = '/v1' as const;

/** Headers the API reads. Mutating requests require `Idempotency-Key`. */
export const HTTP_HEADERS = {
  idempotencyKey: 'idempotency-key',
  ifMatch: 'if-match',
  correlationId: 'x-correlation-id',
  requestId: 'x-request-id',
  stepUpToken: 'x-shoo-step-up',
  previewToken: 'x-shoo-preview-token',
  clientContractVersion: 'x-shoo-contract-version',
} as const;

export const mutationHeaders = z.object({
  'idempotency-key': idempotencyKey,
  'if-match': z.string().max(128).optional(),
  'x-correlation-id': uuid.optional(),
  'x-shoo-step-up': z.string().min(8).max(2048).optional(),
  'x-shoo-preview-token': z.string().min(8).max(2048).optional(),
});
export type MutationHeaders = z.infer<typeof mutationHeaders>;

export const projectParams = z.object({ project_id: uuid });
export type ProjectParams = z.infer<typeof projectParams>;

export const projectResourceParams = projectParams.extend({ id: uuid });
export type ProjectResourceParams = z.infer<typeof projectResourceParams>;

export const pageQuery = z.object({
  cursor: cursor.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type PageQuery = z.infer<typeof pageQuery>;

/**
 * Optimistic concurrency input. A versioned mutation must carry the expected version
 * either as `If-Match` or in the body (docs/37 "API principles").
 */
export const expectedVersion = z.object({ expected_version: aggregateVersion });
export type ExpectedVersion = z.infer<typeof expectedVersion>;

/** Short-lived token bound to actor, target version and intended action (docs/37). */
export const previewToken = z.string().min(8).max(2048);

export const previewImpact = z.object({
  affected_scopes: z.array(z.string().min(1).max(256)).max(200).default([]),
  invalidated_context_pack_count: z.number().int().nonnegative().default(0),
  affected_citation_count: z.number().int().nonnegative().default(0),
  durable_successor_required: z.boolean().default(false),
  unsupported_guarantees: z.array(z.string().min(1).max(256)).max(50).default([]),
  preview_token: previewToken,
  expires_at: z.string().min(1).max(64),
});
export type PreviewImpact = z.infer<typeof previewImpact>;
