import { z } from 'zod';

/**
 * Transport scalars shared by every Shoo contract surface.
 *
 * Rules (docs/36 "Schema rules", docs/64 "TypeScript standards"):
 * - identifiers are opaque UUIDv7-compatible strings unless they are external locators;
 * - timestamps are RFC3339 with an explicit offset, UTC by convention;
 * - transport schemas validate shape only. They never authorize an action.
 */

const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const RFC3339_PATTERN =
  /^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/;
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;
const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/;

/** Opaque, sortable UUIDv7-compatible identifier. Any RFC 4122 shape is accepted on the wire. */
export const uuid = z.string().regex(UUID_PATTERN, 'must be a UUID');

/** RFC3339 timestamp with explicit offset. */
export const timestamp = z.string().regex(RFC3339_PATTERN, 'must be an RFC3339 timestamp');

/** Semantic version of an adapter, extractor, resolver, ranker or schema. */
export const semver = z.string().regex(SEMVER_PATTERN, 'must be a semantic version');

/** Lowercase hex SHA-256 digest. */
export const sha256Hex = z.string().regex(SHA256_HEX_PATTERN, 'must be a lowercase sha256 hex digest');

/**
 * Caller-supplied idempotency key. Opaque to the server: it is only ever compared,
 * never parsed. Scoped by tenant + project + adapter instance (docs/29).
 */
export const idempotencyKey = z.string().min(8).max(255);

/** Opaque, server-issued cursor for keyset pagination. */
export const cursor = z.string().min(1).max(2048);

/** Monotonic optimistic-concurrency version of a mutable aggregate. */
export const aggregateVersion = z.number().int().nonnegative();

/** Schema version of an event payload, contract envelope or table row. */
export const schemaVersion = z.number().int().positive();

/** Version of the effective sync/capture policy that governed a decision. */
export const policyVersion = z.number().int().positive();

/** A repository-relative path. Absolute paths and traversal are rejected at the boundary. */
export const relativePath = z
  .string()
  .min(1)
  .max(1024)
  .refine((value) => !value.startsWith('/') && !value.includes('..'), {
    message: 'must be a repository-relative path without traversal',
  });

/** Non-empty short label safe for logs and UI. */
export const shortText = z.string().min(1).max(256);

/** Bounded free text used for objectives, rationale and reasons. */
export const longText = z.string().min(1).max(8000);

export type Uuid = z.infer<typeof uuid>;
export type Timestamp = z.infer<typeof timestamp>;
export type Semver = z.infer<typeof semver>;
export type Sha256Hex = z.infer<typeof sha256Hex>;
export type IdempotencyKey = z.infer<typeof idempotencyKey>;
export type Cursor = z.infer<typeof cursor>;
