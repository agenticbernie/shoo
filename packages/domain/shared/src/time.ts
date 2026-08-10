import { fail, ok, type Result } from './result.js';

/**
 * Time in the Shoo domain.
 *
 * docs/64 requires source, ingestion, effective and system time to stay distinguishable,
 * so `Instant` is a single opaque value type and the four axes are carried explicitly by
 * `TimeAxes` rather than by one ambiguous `timestamp` field.
 */

export type Instant = Readonly<{ epochMillis: number }>;

export function instant(epochMillis: number): Instant {
  return { epochMillis };
}

export function instantFromIso(iso: string): Result<Instant> {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) {
    return fail('INVALID_ARGUMENT', 'timestamp is not a valid RFC3339 instant');
  }
  return ok({ epochMillis: parsed });
}

export function toIso(value: Instant): string {
  return new Date(value.epochMillis).toISOString();
}

export function isBefore(a: Instant, b: Instant): boolean {
  return a.epochMillis < b.epochMillis;
}

export function isAfter(a: Instant, b: Instant): boolean {
  return a.epochMillis > b.epochMillis;
}

export function earliest(a: Instant, b: Instant): Instant {
  return a.epochMillis <= b.epochMillis ? a : b;
}

export function latest(a: Instant, b: Instant): Instant {
  return a.epochMillis >= b.epochMillis ? a : b;
}

export function plusMillis(value: Instant, millis: number): Instant {
  return { epochMillis: value.epochMillis + millis };
}

export function differenceMillis(a: Instant, b: Instant): number {
  return a.epochMillis - b.epochMillis;
}

/**
 * The four time axes every record carries.
 *
 * - `occurredAt`: when the observed thing happened at the source;
 * - `receivedAt`: when Shoo ingested it;
 * - `effectiveAt`: when the claim becomes true for resolution purposes;
 * - `recordedAt`: system write time.
 */
export interface TimeAxes {
  readonly occurredAt: Instant;
  readonly receivedAt: Instant;
  readonly effectiveAt: Instant | null;
  readonly recordedAt: Instant;
}

/**
 * Injected clock. Domain code is deterministic: it never reads the wall clock directly
 * (docs/64 "Side effects occur through ports; domain code remains deterministic").
 */
export interface Clock {
  now(): Instant;
}

export function fixedClock(at: Instant): Clock {
  return { now: () => at };
}
