import { type Result, fail, ok } from './result.js';

/**
 * Optimistic concurrency for mutable aggregates (docs/29 "Consistency model").
 *
 * A mutation carries the version the caller believes is current. A mismatch is a
 * `VERSION_CONFLICT` result carrying the actual version so the caller can re-read;
 * blind retry of a mutation is never correct.
 */

export type AggregateVersion = number;

export const INITIAL_VERSION: AggregateVersion = 1;

export function checkExpectedVersion(
  current: AggregateVersion,
  expected: AggregateVersion,
): Result<AggregateVersion> {
  if (current !== expected) {
    return fail('VERSION_CONFLICT', 'aggregate changed since it was read', {
      current_version: current,
      expected_version: expected,
    });
  }
  return ok(current);
}

export function nextVersion(current: AggregateVersion): AggregateVersion {
  return current + 1;
}

/** Base shape of every mutable aggregate root in the Shoo domain. */
export interface Versioned {
  readonly version: AggregateVersion;
}
