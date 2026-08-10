import {
  type AggregateVersion,
  type BranchScope,
  type EvidenceId,
  INITIAL_VERSION,
  type Instant,
  type OrganizationId,
  type ProjectId,
  type Result,
  type UserId,
  type Versioned,
  type WorkUnitId,
  checkExpectedVersion,
  fail,
  nextVersion,
  ok,
  stateMachine,
} from '@shoo/domain-shared';

/**
 * Work unit aggregate (docs/29 Project Continuity, docs/36 `continuity.work_units`).
 *
 * The context "never infers work completion from session stop". That rule is structural
 * here: nothing in this module accepts a session as an argument. Completion is only ever
 * reached through an explicit, authorized, versioned `transitionWorkUnit` command.
 */

export const WORK_UNIT_STATES = [
  'proposed',
  'active',
  'paused',
  'blocked',
  'in_review',
  'completed',
  'abandoned',
] as const;
export type WorkUnitState = (typeof WORK_UNIT_STATES)[number];

export const workUnitStateMachine = stateMachine<WorkUnitState>({
  name: 'work unit',
  initial: 'proposed',
  terminal: ['completed', 'abandoned'],
  transitions: {
    proposed: ['active', 'abandoned'],
    active: ['paused', 'blocked', 'in_review', 'completed', 'abandoned'],
    paused: ['active', 'blocked', 'abandoned'],
    blocked: ['active', 'paused', 'abandoned'],
    in_review: ['active', 'completed', 'blocked', 'abandoned'],
    completed: [],
    abandoned: [],
  },
});

export type WorkUnitLinkType = 'issue' | 'pull_request' | 'ticket' | 'document' | 'commit';

export interface WorkUnitLink {
  readonly linkType: WorkUnitLinkType;
  readonly externalId: string;
  readonly url: string | null;
}

export interface WorkUnit extends Versioned {
  readonly id: WorkUnitId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly objective: string | null;
  readonly state: WorkUnitState;
  readonly ownerUserId: UserId | null;
  readonly scope: BranchScope;
  readonly links: readonly WorkUnitLink[];
  readonly createdAt: Instant;
  readonly updatedAt: Instant;
}

export function createWorkUnit(input: {
  readonly id: WorkUnitId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly objective?: string | null;
  readonly ownerUserId?: UserId | null;
  readonly scope: BranchScope;
  readonly at: Instant;
  readonly state?: Extract<WorkUnitState, 'proposed' | 'active'>;
}): Result<WorkUnit> {
  if (input.title.trim() === '') {
    return fail('INVALID_ARGUMENT', 'work unit title is required');
  }
  return ok({
    id: input.id,
    organizationId: input.organizationId,
    projectId: input.projectId,
    title: input.title.trim(),
    objective: input.objective ?? null,
    state: input.state ?? 'proposed',
    ownerUserId: input.ownerUserId ?? null,
    scope: input.scope,
    links: [],
    createdAt: input.at,
    updatedAt: input.at,
    version: INITIAL_VERSION,
  });
}

export interface TransitionWorkUnitInput {
  readonly targetState: WorkUnitState;
  readonly expectedVersion: AggregateVersion;
  readonly reason: string;
  /**
   * Evidence backing the transition. Completing work requires at least one evidence
   * reference: Shoo does not accept "done" as an unsupported assertion
   * (docs/30 "missing citation = cannot be emitted as fact").
   */
  readonly evidenceIds: readonly EvidenceId[];
  readonly at: Instant;
}

export function transitionWorkUnit(
  workUnit: WorkUnit,
  input: TransitionWorkUnitInput,
): Result<WorkUnit> {
  const versionCheck = checkExpectedVersion(workUnit.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  if (input.reason.trim() === '') {
    return fail('INVALID_ARGUMENT', 'a work unit transition requires a reason');
  }

  const transition = workUnitStateMachine.transition(workUnit.state, input.targetState);
  if (!transition.ok) return transition;

  if (input.targetState === 'completed' && input.evidenceIds.length === 0) {
    return fail('EVIDENCE_REQUIRED', 'completing a work unit requires supporting evidence');
  }

  return ok({
    ...workUnit,
    state: input.targetState,
    updatedAt: input.at,
    version: nextVersion(workUnit.version),
  });
}

export function reassignWorkUnit(
  workUnit: WorkUnit,
  input: {
    readonly newOwnerUserId: UserId;
    readonly expectedVersion: AggregateVersion;
    readonly at: Instant;
  },
): Result<WorkUnit> {
  const versionCheck = checkExpectedVersion(workUnit.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (workUnitStateMachine.isTerminal(workUnit.state)) {
    return fail('ALREADY_TERMINAL', 'a terminal work unit cannot be reassigned', {
      state: workUnit.state,
    });
  }
  return ok({
    ...workUnit,
    ownerUserId: input.newOwnerUserId,
    updatedAt: input.at,
    version: nextVersion(workUnit.version),
  });
}

export function addWorkUnitLink(
  workUnit: WorkUnit,
  link: WorkUnitLink,
  expectedVersion: AggregateVersion,
): Result<WorkUnit> {
  const versionCheck = checkExpectedVersion(workUnit.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  const duplicate = workUnit.links.some(
    (existing) => existing.linkType === link.linkType && existing.externalId === link.externalId,
  );
  if (duplicate) return ok(workUnit);
  return ok({
    ...workUnit,
    links: [...workUnit.links, link],
    version: nextVersion(workUnit.version),
  });
}

export function isWorkUnitOpen(workUnit: WorkUnit): boolean {
  return !workUnitStateMachine.isTerminal(workUnit.state);
}
