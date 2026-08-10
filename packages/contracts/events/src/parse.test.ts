import { describe, expect, it } from 'vitest';
import { duplicateKey } from './envelope.js';
import { parseEvent } from './parse.js';

const base = {
  event_id: '018f4b1a-0000-7000-8000-000000000001',
  event_type: 'session.checkpointed',
  schema_version: 1,
  scope: {
    organization_id: '018f4b1a-0000-7000-8000-0000000000aa',
    project_id: '018f4b1a-0000-7000-8000-0000000000bb',
    work_unit_id: '018f4b1a-0000-7000-8000-0000000000cc',
    session_id: '018f4b1a-0000-7000-8000-0000000000dd',
  },
  actor: {
    user_id: '018f4b1a-0000-7000-8000-0000000000ee',
    device_id: '018f4b1a-0000-7000-8000-0000000000ff',
    agent_id: null,
    actor_type: 'device',
  },
  source: {
    client: 'opencode',
    source_event_id: 'native-42',
    adapter_version: '1.2.3',
    source_sequence: 42,
  },
  occurred_at: '2026-07-14T10:00:00Z',
  received_at: '2026-07-14T10:00:01Z',
  policy_version: 3,
  correlation_id: '018f4b1a-0000-7000-8000-000000000111',
  causation_id: null,
  idempotency_key: 'sha256-scoped-key-0001',
  payload: {
    session_id: '018f4b1a-0000-7000-8000-0000000000dd',
    checkpoint_id: '018f4b1a-0000-7000-8000-000000000222',
    checkpoint_revision: 1,
    trigger: 'explicit',
    completeness: 'complete',
    evidence_ids: [],
    omitted_fields: [],
  },
  integrity: {
    algorithm: 'sha256',
    payload_hash: 'a'.repeat(64),
  },
};

describe('parseEvent', () => {
  it('accepts a well formed accepted-MVP event', () => {
    const result = parseEvent(base);
    expect(result.outcome).toBe('accepted');
    if (result.outcome === 'accepted') {
      expect(result.event.event_type).toBe('session.checkpointed');
    }
  });

  it('quarantines an unsupported envelope schema version instead of rejecting it', () => {
    const result = parseEvent({ ...base, schema_version: 99 });
    expect(result).toEqual({ outcome: 'quarantined', reason: 'unsupported_schema_version' });
  });

  it('quarantines reserved coordination event types', () => {
    const result = parseEvent({ ...base, event_type: 'handoff.requested', payload: {} });
    expect(result).toEqual({ outcome: 'quarantined', reason: 'reserved_event_type' });
  });

  it('rejects a payload that violates its declared minimum', () => {
    const result = parseEvent({ ...base, payload: { session_id: 'not-a-uuid' } });
    expect(result.outcome).toBe('rejected');
  });

  it('derives a duplicate key from tenant, device and source event id', () => {
    const parsed = parseEvent(base);
    if (parsed.outcome !== 'accepted') throw new Error('expected accepted');
    expect(duplicateKey(parsed.event)).toContain('native-42');
  });
});
