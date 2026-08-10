import {
  type Clock,
  fixedClock,
  type Instant,
  instant,
  isErr,
  type Result,
  unwrap,
} from '@shoo/domain-shared';

/**
 * `@shoo/testing` — deterministic primitives shared by every test suite.
 *
 * Domain code is deterministic and takes its clock and identifiers through ports, so tests
 * inject these rather than stubbing globals (docs/64).
 */

export const TEST_EPOCH: Instant = instant(1_760_000_000_000);

/** A clock that advances only when the test tells it to. */
export function controllableClock(start: Instant = TEST_EPOCH): Clock & {
  advance(millis: number): void;
  set(value: Instant): void;
} {
  let current = start;
  return {
    now: () => current,
    advance(millis) {
      current = instant(current.epochMillis + millis);
    },
    set(value) {
      current = value;
    },
  };
}

export { fixedClock };

/**
 * Deterministic, sortable UUIDv7-shaped identifiers.
 *
 * Real ids come from the ingress owner of a record; tests need reproducibility, so this
 * factory produces stable values from a counter rather than randomness.
 */
export function idFactory(prefix = 0): () => string {
  let counter = 0;
  return () => {
    counter += 1;
    const hex = counter.toString(16).padStart(12, '0');
    const p = prefix.toString(16).padStart(8, '0');
    return `${p}-0000-7000-8000-${hex}`;
  };
}

/** Assert a `Result` is Ok and return its value with a readable failure message. */
export function expectOk<T>(result: Result<T>): T {
  if (isErr(result)) {
    throw new Error(`expected ok, got ${result.error.code}: ${result.error.message}`);
  }
  return unwrap(result);
}

/** Assert a `Result` failed and return its error code. */
export function expectErrCode<T>(result: Result<T>): string {
  if (!isErr(result)) {
    throw new Error('expected an error result, got ok');
  }
  return result.error.code;
}

/** Root of the shared fixture corpora (docs/63 `fixtures/`). */
export const FIXTURE_DIRECTORIES = {
  contracts: 'fixtures/contracts',
  retrievalGold: 'fixtures/retrieval-gold',
  security: 'fixtures/security',
  migration: 'fixtures/migration',
} as const;
