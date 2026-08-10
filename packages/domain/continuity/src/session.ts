import {
  type AgentId,
  type AggregateVersion,
  type CheckpointId,
  checkExpectedVersion,
  type DeviceId,
  fail,
  INITIAL_VERSION,
  type Instant,
  nextVersion,
  type OrganizationId,
  ok,
  type ProjectId,
  type Result,
  type SessionId,
  stateMachine,
  type UserId,
  type Versioned,
  type WorkUnitId,
} from '@shoo/domain-shared';
import type { WorkUnitState } from './work-unit.js';

/**
 * Session aggregate (docs/36 `continuity.sessions`).
 *
 * Two invariants dominate this file:
 *
 * 1. A client stop cannot update work completion. `completeSession` therefore returns a
 *    *proposal* for the work unit, never a mutation of it (docs/36, docs/38).
 * 2. Capture health is separate from session state: a degraded session is still a valid
 *    session, and degradation is recorded rather than hidden.
 */

export const SESSION_STATES = ['starting', 'active', 'completed', 'failed', 'abandoned'] as const;
export type SessionState = (typeof SESSION_STATES)[number];

export const sessionStateMachine = stateMachine<SessionState>({
  name: 'session',
  initial: 'starting',
  terminal: ['completed', 'failed', 'abandoned'],
  transitions: {
    starting: ['active', 'failed', 'abandoned'],
    active: ['completed', 'failed', 'abandoned'],
    completed: [],
    failed: [],
    abandoned: [],
  },
});

export type CaptureState = 'healthy' | 'degraded' | 'unsupported' | 'disabled';
export type ClientName = 'opencode' | 'codex' | 'web' | 'api' | 'worker';
export type SessionOutcome = 'succeeded' | 'partial' | 'abandoned';

export interface CaptureHealth {
  readonly state: CaptureState;
  readonly missingCapabilities: readonly string[];
  readonly detectedAt: Instant | null;
}

export interface Session extends Versioned {
  readonly id: SessionId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly workUnitId: WorkUnitId | null;
  readonly developerUserId: UserId;
  readonly deviceId: DeviceId | null;
  readonly agentId: AgentId | null;
  readonly client: ClientName;
  readonly nativeSessionId: string;
  readonly state: SessionState;
  readonly capture: CaptureHealth;
  readonly capabilityManifestVersion: number;
  readonly policyVersion: number;
  readonly lastCheckpointId: CheckpointId | null;
  /** True when evidence after the last checkpoint could not be verified (docs/36). */
  readonly partialTail: boolean;
  readonly startedAt: Instant;
  readonly endedAt: Instant | null;
}

export function startSession(input: {
  readonly id: SessionId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly workUnitId: WorkUnitId | null;
  readonly developerUserId: UserId;
  readonly deviceId: DeviceId | null;
  readonly agentId: AgentId | null;
  readonly client: ClientName;
  readonly nativeSessionId: string;
  readonly capture: CaptureHealth;
  readonly capabilityManifestVersion: number;
  readonly policyVersion: number;
  readonly at: Instant;
}): Result<Session> {
  if (input.nativeSessionId.trim() === '') {
    return fail('INVALID_ARGUMENT', 'native session id is required for idempotent session start');
  }
  if (input.capabilityManifestVersion <= 0) {
    return fail('INVALID_ARGUMENT', 'capability manifest version must be positive');
  }
  return ok({
    id: input.id,
    organizationId: input.organizationId,
    projectId: input.projectId,
    workUnitId: input.workUnitId,
    developerUserId: input.developerUserId,
    deviceId: input.deviceId,
    agentId: input.agentId,
    client: input.client,
    nativeSessionId: input.nativeSessionId,
    state: input.workUnitId === null ? 'starting' : 'active',
    capture: input.capture,
    capabilityManifestVersion: input.capabilityManifestVersion,
    policyVersion: input.policyVersion,
    lastCheckpointId: null,
    partialTail: false,
    startedAt: input.at,
    endedAt: null,
    version: INITIAL_VERSION,
  });
}

/** Attaching the resolved work unit is what moves a session from `starting` to `active`. */
export function attachWorkUnit(
  session: Session,
  workUnitId: WorkUnitId,
  expectedVersion: AggregateVersion,
): Result<Session> {
  const versionCheck = checkExpectedVersion(session.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (session.workUnitId !== null && session.workUnitId !== workUnitId) {
    return fail('INVARIANT_VIOLATION', 'session is already bound to a different work unit');
  }
  if (sessionStateMachine.isTerminal(session.state)) {
    return fail('ALREADY_TERMINAL', 'a terminal session cannot bind a work unit', {
      state: session.state,
    });
  }
  return ok({
    ...session,
    workUnitId,
    state: session.state === 'starting' ? 'active' : session.state,
    version: nextVersion(session.version),
  });
}

export function recordCaptureDegradation(
  session: Session,
  capture: CaptureHealth,
  expectedVersion: AggregateVersion,
): Result<Session> {
  const versionCheck = checkExpectedVersion(session.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (capture.state === 'healthy') {
    return fail('INVALID_ARGUMENT', 'degradation must record a non-healthy capture state');
  }
  return ok({ ...session, capture, version: nextVersion(session.version) });
}

export function recordCheckpointOnSession(
  session: Session,
  checkpointId: CheckpointId,
  expectedVersion: AggregateVersion,
): Result<Session> {
  const versionCheck = checkExpectedVersion(session.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (sessionStateMachine.isTerminal(session.state)) {
    return fail('ALREADY_TERMINAL', 'a terminal session cannot record a checkpoint', {
      state: session.state,
    });
  }
  return ok({
    ...session,
    lastCheckpointId: checkpointId,
    partialTail: false,
    version: nextVersion(session.version),
  });
}

/**
 * A proposal produced by session completion. The Work & Session component decides whether
 * to apply it through `transitionWorkUnit`; the session itself never applies it.
 */
export interface WorkUnitStateProposal {
  readonly workUnitId: WorkUnitId;
  readonly proposedState: WorkUnitState;
  readonly reason: string;
}

export interface CompleteSessionResult {
  readonly session: Session;
  readonly workUnitProposal: WorkUnitStateProposal | null;
}

export function completeSession(
  session: Session,
  input: {
    readonly outcome: SessionOutcome;
    readonly expectedVersion: AggregateVersion;
    readonly lastCheckpointId: CheckpointId | null;
    readonly partialTail: boolean;
    readonly proposedWorkUnitState: WorkUnitState | null;
    readonly at: Instant;
  },
): Result<CompleteSessionResult> {
  const versionCheck = checkExpectedVersion(session.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  const transition = sessionStateMachine.transition(session.state, 'completed');
  if (!transition.ok) return transition;

  const completed: Session = {
    ...session,
    state: 'completed',
    lastCheckpointId: input.lastCheckpointId ?? session.lastCheckpointId,
    partialTail: input.partialTail,
    endedAt: input.at,
    version: nextVersion(session.version),
  };

  if (input.proposedWorkUnitState === null || session.workUnitId === null) {
    return ok({ session: completed, workUnitProposal: null });
  }

  /**
   * Missing evidence preserves the unfinished/unknown state: a partial or abandoned
   * session may not propose work completion (docs/38 `shoo.complete_session`).
   */
  if (input.proposedWorkUnitState === 'completed' && input.outcome !== 'succeeded') {
    return fail(
      'EVIDENCE_REQUIRED',
      'a partial or abandoned session cannot propose work completion',
      { outcome: input.outcome },
    );
  }
  if (input.proposedWorkUnitState === 'completed' && input.partialTail) {
    return fail(
      'EVIDENCE_REQUIRED',
      'a session with an unverified partial tail cannot propose work completion',
    );
  }

  return ok({
    session: completed,
    workUnitProposal: {
      workUnitId: session.workUnitId,
      proposedState: input.proposedWorkUnitState,
      reason: `session ${session.id} completed with outcome ${input.outcome}`,
    },
  });
}

export function failSession(
  session: Session,
  input: {
    readonly expectedVersion: AggregateVersion;
    readonly partialTail: boolean;
    readonly at: Instant;
  },
): Result<Session> {
  const versionCheck = checkExpectedVersion(session.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  const transition = sessionStateMachine.transition(session.state, 'failed');
  if (!transition.ok) return transition;
  return ok({
    ...session,
    state: 'failed',
    partialTail: input.partialTail,
    endedAt: input.at,
    version: nextVersion(session.version),
  });
}
