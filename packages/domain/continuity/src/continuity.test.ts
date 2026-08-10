import {
  type CheckpointId,
  type DeviceId,
  type EvidenceId,
  type OrganizationId,
  type ProjectId,
  type SessionId,
  type UserId,
  type WorkUnitId,
  asId,
  instant,
  unwrap,
} from '@shoo/domain-shared';
import { describe, expect, it } from 'vitest';
import { buildCheckpoint, checkpointIdentityKey } from './checkpoint.js';
import { compareEnvelopes, decideIngest, envelopeDuplicateKey } from './client-envelope.js';
import { completeSession, startSession } from './session.js';
import { createWorkUnit, transitionWorkUnit } from './work-unit.js';

const org = asId<OrganizationId>('018f4b1a-0000-7000-8000-0000000000aa');
const project = asId<ProjectId>('018f4b1a-0000-7000-8000-0000000000bb');
const user = asId<UserId>('018f4b1a-0000-7000-8000-0000000000cc');
const device = asId<DeviceId>('018f4b1a-0000-7000-8000-0000000000dd');
const workUnitId = asId<WorkUnitId>('018f4b1a-0000-7000-8000-000000000001');
const sessionId = asId<SessionId>('018f4b1a-0000-7000-8000-000000000002');
const at = instant(1_760_000_000_000);
const scope = { branch: 'feature/auth', worktreeId: null, modulePaths: ['src/auth'] };

function workUnit() {
  return unwrap(
    createWorkUnit({
      id: workUnitId,
      organizationId: org,
      projectId: project,
      title: 'Add SSO',
      scope,
      at,
      state: 'active',
    }),
  );
}

function session(workUnitBound = true) {
  return unwrap(
    startSession({
      id: sessionId,
      organizationId: org,
      projectId: project,
      workUnitId: workUnitBound ? workUnitId : null,
      developerUserId: user,
      deviceId: device,
      agentId: null,
      client: 'opencode',
      nativeSessionId: 'oc-123',
      capture: { state: 'healthy', missingCapabilities: [], detectedAt: null },
      capabilityManifestVersion: 1,
      policyVersion: 3,
      at,
    }),
  );
}

describe('work unit', () => {
  it('refuses an illegal transition', () => {
    const completed = unwrap(
      transitionWorkUnit(workUnit(), {
        targetState: 'completed',
        expectedVersion: 1,
        reason: 'shipped',
        evidenceIds: [asId<EvidenceId>('018f4b1a-0000-7000-8000-000000000101')],
        at,
      }),
    );
    const reopen = transitionWorkUnit(completed, {
      targetState: 'active',
      expectedVersion: completed.version,
      reason: 'reopen',
      evidenceIds: [],
      at,
    });
    expect(reopen.ok).toBe(false);
    if (!reopen.ok) expect(reopen.error.code).toBe('ALREADY_TERMINAL');
  });

  it('requires evidence to complete work', () => {
    const result = transitionWorkUnit(workUnit(), {
      targetState: 'completed',
      expectedVersion: 1,
      reason: 'done',
      evidenceIds: [],
      at,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('EVIDENCE_REQUIRED');
  });

  it('rejects a stale expected version', () => {
    const result = transitionWorkUnit(workUnit(), {
      targetState: 'paused',
      expectedVersion: 99,
      reason: 'pause',
      evidenceIds: [],
      at,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VERSION_CONFLICT');
  });
});

describe('session', () => {
  it('returns a work-unit proposal rather than completing work itself', () => {
    const result = unwrap(
      completeSession(session(), {
        outcome: 'succeeded',
        expectedVersion: 1,
        lastCheckpointId: null,
        partialTail: false,
        proposedWorkUnitState: 'completed',
        at,
      }),
    );
    expect(result.session.state).toBe('completed');
    expect(result.workUnitProposal?.proposedState).toBe('completed');
    // The proposal is data. Nothing in this module can apply it.
    expect(Object.keys(result)).toEqual(['session', 'workUnitProposal']);
  });

  it('refuses to propose work completion from a partial session', () => {
    const result = completeSession(session(), {
      outcome: 'partial',
      expectedVersion: 1,
      lastCheckpointId: null,
      partialTail: false,
      proposedWorkUnitState: 'completed',
      at,
    });
    expect(result.ok).toBe(false);
  });

  it('refuses to propose work completion when the tail is unverified', () => {
    const result = completeSession(session(), {
      outcome: 'succeeded',
      expectedVersion: 1,
      lastCheckpointId: null,
      partialTail: true,
      proposedWorkUnitState: 'completed',
      at,
    });
    expect(result.ok).toBe(false);
  });

  it('starts in `starting` until a work unit is resolved', () => {
    expect(session(false).state).toBe('starting');
    expect(session(true).state).toBe('active');
  });
});

describe('checkpoint', () => {
  const base = {
    id: asId<CheckpointId>('018f4b1a-0000-7000-8000-000000000301'),
    projectId: project,
    workUnitId,
    sessionId,
    revision: 1,
    reason: 'explicit' as const,
    triggerIdempotencyKey: 'trigger-1',
    objective: 'Finish SSO callback',
    progress: ['wired callback route'],
    partialChanges: ['src/auth/callback.ts'],
    tests: [],
    blockers: [],
    uncertainty: [],
    nextAction: 'add integration test',
    evidenceIds: [asId<EvidenceId>('018f4b1a-0000-7000-8000-000000000401')],
    captureDegraded: false,
    at,
  };

  it('marks a checkpoint complete when it has an objective and evidence', () => {
    const checkpoint = unwrap(buildCheckpoint(base));
    expect(checkpoint.completeness).toBe('complete');
    expect(checkpoint.progress).toEqual(['wired callback route']);
  });

  it('never promotes unevidenced progress to verified progress', () => {
    const checkpoint = unwrap(buildCheckpoint({ ...base, evidenceIds: [] }));
    expect(checkpoint.progress).toEqual([]);
    expect(checkpoint.uncertainty).toContain('wired callback route');
    expect(checkpoint.omittedFields.some((field) => field.reason === 'unverified')).toBe(true);
  });

  it('records degraded capture as partial completeness', () => {
    expect(unwrap(buildCheckpoint({ ...base, captureDegraded: true })).completeness).toBe('partial');
  });

  it('drops empty claims instead of turning them into facts', () => {
    const checkpoint = unwrap(buildCheckpoint({ ...base, objective: '   ' }));
    expect(checkpoint.objective).toBeNull();
    expect(checkpoint.omittedFields.some((field) => field.field === 'objective')).toBe(true);
  });

  it('derives one identity per session and trigger key', () => {
    expect(checkpointIdentityKey(sessionId, 'trigger-1')).toBe(
      checkpointIdentityKey(sessionId, 'trigger-1'),
    );
    expect(checkpointIdentityKey(sessionId, 'trigger-1')).not.toBe(
      checkpointIdentityKey(sessionId, 'trigger-2'),
    );
  });
});

describe('client envelope', () => {
  const envelope = {
    organizationId: org,
    projectId: project,
    deviceId: device,
    adapterInstanceId: 'adapter-1',
    client: 'opencode' as const,
    sourceEventId: 'native-1',
    sourceSequence: 1,
    sessionId,
    workUnitId,
    schemaVersion: 1,
    policyVersion: 3,
    occurredAt: at,
    receivedAt: at,
    contentHash: 'a'.repeat(64),
    idempotencyKey: 'key-1',
  };

  it('treats a replay of the same adapter event as a duplicate', () => {
    const known = new Set([envelopeDuplicateKey(envelope)]);
    expect(decideIngest(envelope, known)).toBe('duplicate');
  });

  it('treats the same content from a different adapter as new evidence', () => {
    const known = new Set([envelopeDuplicateKey(envelope)]);
    const other = { ...envelope, adapterInstanceId: 'adapter-2' };
    expect(decideIngest(other, known)).toBe('accept');
  });

  it('orders one adapter stream by source sequence, not wall clock', () => {
    const later = { ...envelope, sourceEventId: 'native-2', sourceSequence: 2, occurredAt: instant(at.epochMillis - 5_000) };
    expect(compareEnvelopes(envelope, later)).toBeLessThan(0);
  });
});
