import {
  eventActor,
  eventSource,
  idempotencyKey,
  policyVersion,
  schemaVersion,
  sha256Hex,
  tenantScope,
  timestamp,
  uuid,
} from '@shoo/contracts-common';
import { z } from 'zod';

/**
 * Shoo event envelope — docs/36 "Event envelope contract".
 *
 * The envelope is append-only ledger material. Readers ignore unknown optional fields
 * and reject unsupported required versions into quarantine (docs/36 "Migration and
 * compatibility"), which is why `parseEnvelope` separates "unsupported version" from
 * "invalid shape".
 */

export const EVENT_ENVELOPE_SCHEMA_VERSION = 1 as const;

/** Versions this build can read. Unknown versions are quarantined, never guessed. */
export const SUPPORTED_ENVELOPE_SCHEMA_VERSIONS: readonly number[] = [1];

export const integrity = z.object({
  algorithm: z.literal('sha256'),
  payload_hash: sha256Hex,
});
export type Integrity = z.infer<typeof integrity>;

export const eventEnvelopeBase = z.object({
  event_id: uuid,
  event_type: z.string().min(3).max(128),
  schema_version: schemaVersion,
  scope: tenantScope,
  actor: eventActor,
  source: eventSource,
  occurred_at: timestamp,
  received_at: timestamp,
  policy_version: policyVersion,
  correlation_id: uuid,
  causation_id: uuid.nullable().default(null),
  idempotency_key: idempotencyKey,
  payload: z.record(z.string(), z.unknown()),
  integrity,
});
export type EventEnvelopeBase = z.infer<typeof eventEnvelopeBase>;

/**
 * Deterministic duplicate key (docs/29 "Ordering and duplicate handling"):
 * `organization_id + project_id + adapter_instance_id + source_event_id`.
 * The adapter instance is carried as the device id of the envelope actor; when a client
 * cannot supply a native id the caller must provide a deterministic hash fallback.
 */
export function duplicateKey(envelope: EventEnvelopeBase): string {
  const device = envelope.actor.device_id ?? 'no-device';
  return [
    envelope.scope.organization_id,
    envelope.scope.project_id,
    device,
    envelope.source.client,
    envelope.source.source_event_id,
  ].join('|');
}

export type EnvelopeParseResult =
  | { readonly outcome: 'accepted'; readonly envelope: EventEnvelopeBase }
  | { readonly outcome: 'quarantined'; readonly reason: 'unsupported_schema_version' }
  | { readonly outcome: 'rejected'; readonly issues: readonly string[] };

/** Version-aware envelope parse. Shape errors and version skew are different outcomes. */
export function parseEnvelope(input: unknown): EnvelopeParseResult {
  const parsed = eventEnvelopeBase.safeParse(input);
  if (!parsed.success) {
    return {
      outcome: 'rejected',
      issues: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    };
  }
  if (!SUPPORTED_ENVELOPE_SCHEMA_VERSIONS.includes(parsed.data.schema_version)) {
    return { outcome: 'quarantined', reason: 'unsupported_schema_version' };
  }
  return { outcome: 'accepted', envelope: parsed.data };
}
