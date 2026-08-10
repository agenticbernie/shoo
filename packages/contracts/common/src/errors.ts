import { z } from 'zod';
import { aggregateVersion, uuid } from './scalars.js';

/**
 * Stable machine error codes (docs/37 "Errors use stable machine code, safe detail and
 * correlation ID"). Codes are additive: removing or repurposing a code is a breaking
 * contract change and requires a new major path.
 */
export const errorCode = z.enum([
  // request shape / protocol
  'INVALID_REQUEST',
  'UNSUPPORTED_SCHEMA_VERSION',
  'PAYLOAD_TOO_LARGE',
  // identity and authorization
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'STEP_UP_REQUIRED',
  'PREVIEW_TOKEN_REQUIRED',
  'PREVIEW_TOKEN_INVALID',
  'DEVICE_REVOKED',
  // resource state
  'NOT_FOUND',
  'VERSION_CONFLICT',
  'STATE_CONFLICT',
  'IDEMPOTENCY_KEY_REUSED',
  'CONFLICT_UNRESOLVED',
  'PRECONDITION_FAILED',
  // domain / policy
  'POLICY_DENIED',
  'TRANSITION_REJECTED',
  'AUTHORITY_REQUIRED',
  'EVIDENCE_INSUFFICIENT',
  'COMPATIBILITY_BLOCKED',
  // capacity and dependencies
  'RATE_LIMITED',
  'DEPENDENCY_DEGRADED',
  'OPERATION_EXPIRED',
  'INTERNAL_ERROR',
]);
export type ErrorCode = z.infer<typeof errorCode>;

/** HTTP status mapping for each stable code (docs/37 "Status and retry semantics"). */
export const ERROR_STATUS: Readonly<Record<ErrorCode, number>> = Object.freeze({
  INVALID_REQUEST: 400,
  UNSUPPORTED_SCHEMA_VERSION: 400,
  PAYLOAD_TOO_LARGE: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  STEP_UP_REQUIRED: 403,
  PREVIEW_TOKEN_REQUIRED: 403,
  PREVIEW_TOKEN_INVALID: 403,
  DEVICE_REVOKED: 403,
  NOT_FOUND: 404,
  VERSION_CONFLICT: 409,
  STATE_CONFLICT: 409,
  IDEMPOTENCY_KEY_REUSED: 409,
  CONFLICT_UNRESOLVED: 409,
  PRECONDITION_FAILED: 412,
  POLICY_DENIED: 422,
  TRANSITION_REJECTED: 422,
  AUTHORITY_REQUIRED: 422,
  EVIDENCE_INSUFFICIENT: 422,
  COMPATIBILITY_BLOCKED: 422,
  RATE_LIMITED: 429,
  DEPENDENCY_DEGRADED: 503,
  OPERATION_EXPIRED: 410,
  INTERNAL_ERROR: 500,
});

/** Codes a client may retry without operator intervention. */
export const RETRYABLE_ERROR_CODES: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
  'RATE_LIMITED',
  'DEPENDENCY_DEGRADED',
  'INTERNAL_ERROR',
]);

export const errorDetail = z.object({
  /** Dotted path into the request body, or a domain field name. Never contains content. */
  field: z.string().max(256).nullable().default(null),
  code: z.string().min(1).max(128),
  message: z.string().min(1).max(512),
});
export type ErrorDetail = z.infer<typeof errorDetail>;

export const errorBody = z.object({
  code: errorCode,
  message: z.string().min(1).max(512),
  retryable: z.boolean(),
  /** Present for VERSION_CONFLICT / PRECONDITION_FAILED so the client can re-read. */
  current_version: aggregateVersion.nullable().default(null),
  details: z.array(errorDetail).max(50).default([]),
});
export type ErrorBody = z.infer<typeof errorBody>;

export const errorEnvelope = z.object({
  error: errorBody,
  meta: z.object({ request_id: uuid }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelope>;
