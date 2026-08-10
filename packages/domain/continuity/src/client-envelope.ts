import {
  type DeviceId,
  type Instant,
  type OrganizationId,
  type ProjectId,
  type Result,
  type SessionId,
  type WorkUnitId,
  fail,
  isAfter,
  ok,
} from '@shoo/domain-shared';
import type { ClientName } from './session.js';

/**
 * Client capture envelope (docs/29 "Ordering and duplicate handling", docs/36 local
 * `capture_events`).
 *
 * Ingestion is at-least-once. Correctness therefore comes from a deterministic duplicate
 * key and from ordering rules that never assume a global clock.
 */

export interface ClientEnvelope {
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly deviceId: DeviceId;
  /** Stable per installed adapter instance; part of the duplicate key. */
  readonly adapterInstanceId: string;
  readonly client: ClientName;
  readonly sourceEventId: string;
  readonly sourceSequence: number | null;
  readonly sessionId: SessionId | null;
  readonly workUnitId: WorkUnitId | null;
  readonly schemaVersion: number;
  readonly policyVersion: number;
  readonly occurredAt: Instant;
  readonly receivedAt: Instant;
  readonly contentHash: string;
  readonly idempotencyKey: string;
}

export function validateEnvelope(envelope: ClientEnvelope): Result<ClientEnvelope> {
  if (envelope.sourceEventId.trim() === '') {
    return fail('INVALID_ARGUMENT', 'source event id is required');
  }
  if (envelope.adapterInstanceId.trim() === '') {
    return fail('INVALID_ARGUMENT', 'adapter instance id is required');
  }
  if (envelope.contentHash.trim() === '') {
    return fail('INVALID_ARGUMENT', 'content hash is required');
  }
  if (isAfter(envelope.occurredAt, envelope.receivedAt)) {
    /**
     * Source clocks drift. This is not an error: source and ingestion time stay separate
     * and both are retained (docs/64). It is only invalid when it is impossible, i.e. more
     * than a day of forward skew, which indicates a broken adapter clock.
     */
    const skewMillis = envelope.occurredAt.epochMillis - envelope.receivedAt.epochMillis;
    if (skewMillis > 24 * 60 * 60 * 1000) {
      return fail('INVALID_ARGUMENT', 'source time is implausibly ahead of ingestion time', {
        skew_millis: skewMillis,
      });
    }
  }
  return ok(envelope);
}

/**
 * Duplicate uniqueness key (docs/29):
 * `organization_id + project_id + adapter_instance_id + source_event_id`.
 *
 * The same payload arriving from a *different* source is not a duplicate; it is
 * corroborating evidence, which is why the client and content hash are not in this key.
 */
export function envelopeDuplicateKey(envelope: ClientEnvelope): string {
  return [
    envelope.organizationId,
    envelope.projectId,
    envelope.adapterInstanceId,
    envelope.sourceEventId,
  ].join('|');
}

/**
 * Deterministic fallback key for adapters with no native event id (docs/29
 * "deterministic hash fallback only when no native ID exists"). The caller supplies the
 * hash; this function only fixes its composition so two runtimes agree.
 */
export function deterministicSourceEventId(input: {
  readonly adapterInstanceId: string;
  readonly contentHash: string;
  readonly occurredAt: Instant;
}): string {
  return `derived:${input.adapterInstanceId}:${input.contentHash}:${input.occurredAt.epochMillis}`;
}

export type IngestDecision = 'accept' | 'duplicate';

export function decideIngest(
  envelope: ClientEnvelope,
  knownKeys: ReadonlySet<string>,
): IngestDecision {
  return knownKeys.has(envelopeDuplicateKey(envelope)) ? 'duplicate' : 'accept';
}

/**
 * Ordering comparator for one adapter's stream.
 *
 * `source_sequence` wins when the client provides it; otherwise source time orders, with
 * ingestion time as the tiebreak. Global total ordering is explicitly rejected (docs/29),
 * so this comparator is only meaningful within a single adapter instance.
 */
export function compareEnvelopes(a: ClientEnvelope, b: ClientEnvelope): number {
  if (a.adapterInstanceId === b.adapterInstanceId) {
    if (a.sourceSequence !== null && b.sourceSequence !== null) {
      if (a.sourceSequence !== b.sourceSequence) return a.sourceSequence - b.sourceSequence;
    }
  }
  if (a.occurredAt.epochMillis !== b.occurredAt.epochMillis) {
    return a.occurredAt.epochMillis - b.occurredAt.epochMillis;
  }
  if (a.receivedAt.epochMillis !== b.receivedAt.epochMillis) {
    return a.receivedAt.epochMillis - b.receivedAt.epochMillis;
  }
  return a.sourceEventId.localeCompare(b.sourceEventId);
}

/** Out-of-order arrival is accepted; the caller recomputes derived state (docs/29). */
export function isOutOfOrder(
  envelope: ClientEnvelope,
  lastAccepted: ClientEnvelope | null,
): boolean {
  if (lastAccepted === null) return false;
  return compareEnvelopes(envelope, lastAccepted) < 0;
}

/**
 * Partial tail: evidence observed after the last checkpoint that could not be verified
 * (docs/36 `continuity.partial_tails`). Explicitly non-verified, retention controlled.
 */
export interface PartialTail {
  readonly sessionId: SessionId;
  readonly fromEventId: string;
  readonly completeness: 'partial' | 'unknown';
  readonly localSourceAvailable: boolean;
}
