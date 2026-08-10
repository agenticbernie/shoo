import { z } from 'zod';
import { type EventEnvelopeBase, eventEnvelopeBase, parseEnvelope } from './envelope.js';
import {
  EVENT_PAYLOADS,
  type EventPayloadMap,
  type EventType,
  isEmittableEventType,
  isReservedEventType,
} from './payloads.js';

/** A fully typed, validated event: envelope plus its declared payload. */
export type ShooEvent<K extends EventType = EventType> = Omit<EventEnvelopeBase, 'payload' | 'event_type'> & {
  readonly event_type: K;
  readonly payload: EventPayloadMap[K];
};

export type EventParseResult =
  | { readonly outcome: 'accepted'; readonly event: ShooEvent }
  | {
      readonly outcome: 'quarantined';
      readonly reason: 'unsupported_schema_version' | 'unknown_event_type' | 'reserved_event_type';
    }
  | { readonly outcome: 'rejected'; readonly issues: readonly string[] };

/**
 * Validate an event end to end.
 *
 * Quarantine (not rejection) is used for version skew and for event types this build does
 * not know, so an older reader never silently drops a newer producer's ledger row
 * (docs/36 "Migration and compatibility").
 */
export function parseEvent(input: unknown): EventParseResult {
  const envelopeResult = parseEnvelope(input);
  if (envelopeResult.outcome !== 'accepted') {
    return envelopeResult;
  }
  const envelope = envelopeResult.envelope;

  if (isReservedEventType(envelope.event_type)) {
    return { outcome: 'quarantined', reason: 'reserved_event_type' };
  }
  if (!isEmittableEventType(envelope.event_type)) {
    return { outcome: 'quarantined', reason: 'unknown_event_type' };
  }

  const payloadSchema = EVENT_PAYLOADS[envelope.event_type];
  const payload = payloadSchema.safeParse(envelope.payload);
  if (!payload.success) {
    return {
      outcome: 'rejected',
      issues: payload.error.issues.map((issue) => `payload.${issue.path.join('.')}: ${issue.message}`),
    };
  }

  return {
    outcome: 'accepted',
    event: {
      ...envelope,
      event_type: envelope.event_type,
      payload: payload.data,
    } as ShooEvent,
  };
}

/** Schema for one concrete event type, useful for fixtures and per-topic validation. */
export function eventSchema<K extends EventType>(type: K) {
  return eventEnvelopeBase.extend({
    event_type: z.literal(type),
    payload: EVENT_PAYLOADS[type],
  });
}
