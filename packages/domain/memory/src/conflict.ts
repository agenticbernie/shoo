import {
  type AggregateVersion,
  type ConflictId,
  checkExpectedVersion,
  type EvidenceId,
  fail,
  INITIAL_VERSION,
  type Instant,
  nextVersion,
  type OrganizationId,
  ok,
  type ProjectId,
  type ResolutionId,
  type Result,
  type RevisionId,
  stateMachine,
  subjectScopeFingerprint,
  type TenantScope,
  type TypedSubject,
  type UserId,
  type Versioned,
} from '@shoo/domain-shared';

/**
 * Conflict aggregate (docs/36 `memory.conflicts` / `conflict_sides` / `resolutions`,
 * docs/40 conflict resolution design).
 *
 * A conflict is what Shoo produces instead of silently picking a winner. Two accepted
 * values for the same typed subject and scope are represented, never merged by recency.
 */

export const CONFLICT_STATES = ['active', 'resolving', 'resolved', 'dismissed'] as const;
export type ConflictState = (typeof CONFLICT_STATES)[number];

export const conflictStateMachine = stateMachine<ConflictState>({
  name: 'conflict',
  initial: 'active',
  terminal: ['resolved', 'dismissed'],
  transitions: {
    active: ['resolving', 'resolved', 'dismissed'],
    resolving: ['active', 'resolved', 'dismissed'],
    resolved: [],
    dismissed: [],
  },
});

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ConflictSide {
  readonly label: string;
  readonly revisionId: RevisionId | null;
  readonly evidenceId: EvidenceId | null;
}

export interface Conflict extends Versioned {
  readonly id: ConflictId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly subject: TypedSubject;
  /** Uniqueness key for "one active equivalent conflict per subject/scope" (docs/36). */
  readonly scopeFingerprint: string;
  readonly state: ConflictState;
  readonly severity: ConflictSeverity;
  readonly detectedRuleVersion: string;
  readonly sides: readonly ConflictSide[];
  readonly detectedAt: Instant;
  readonly resolvedAt: Instant | null;
  readonly resolution: ConflictResolution | null;
}

export function detectConflict(input: {
  readonly id: ConflictId;
  readonly scope: TenantScope;
  readonly subject: TypedSubject;
  readonly severity: ConflictSeverity;
  readonly detectedRuleVersion: string;
  readonly sides: readonly ConflictSide[];
  readonly at: Instant;
}): Result<Conflict> {
  if (input.sides.length < 2) {
    return fail('INVALID_ARGUMENT', 'a conflict requires at least two distinct sides');
  }
  const identities = new Set(
    input.sides.map((side) => `${side.revisionId ?? ''}|${side.evidenceId ?? ''}`),
  );
  if (identities.size !== input.sides.length) {
    return fail('INVALID_ARGUMENT', 'conflict sides must be distinct');
  }
  return ok({
    id: input.id,
    organizationId: input.scope.organizationId,
    projectId: input.scope.projectId,
    subject: input.subject,
    scopeFingerprint: subjectScopeFingerprint(input.scope, input.subject),
    state: 'active',
    severity: input.severity,
    detectedRuleVersion: input.detectedRuleVersion,
    sides: input.sides,
    detectedAt: input.at,
    resolvedAt: null,
    resolution: null,
    version: INITIAL_VERSION,
  });
}

export type ResolutionAction = 'select' | 'merge' | 'scope' | 'deprecate';

/** Resolutions are immutable and close the conflict transactionally (docs/36). */
export interface ConflictResolution {
  readonly id: ResolutionId;
  readonly action: ResolutionAction;
  readonly selectedRevisionId: RevisionId | null;
  readonly createdRevisionId: RevisionId | null;
  readonly scopeRestriction: TypedSubject | null;
  readonly rationale: string;
  readonly actorUserId: UserId;
  readonly invalidationWatermark: Instant;
  readonly resolvedAt: Instant;
}

export interface ResolveConflictInput {
  readonly resolution: ConflictResolution;
  readonly expectedVersion: AggregateVersion;
}

export function resolveConflict(conflict: Conflict, input: ResolveConflictInput): Result<Conflict> {
  const versionCheck = checkExpectedVersion(conflict.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  const transition = conflictStateMachine.transition(conflict.state, 'resolved');
  if (!transition.ok) return transition;

  const { resolution } = input;
  if (resolution.rationale.trim() === '') {
    return fail('INVALID_ARGUMENT', 'a resolution requires a rationale');
  }

  switch (resolution.action) {
    case 'select': {
      if (resolution.selectedRevisionId === null) {
        return fail('INVALID_ARGUMENT', 'select resolution requires a selected revision');
      }
      const belongs = conflict.sides.some(
        (side) => side.revisionId === resolution.selectedRevisionId,
      );
      if (!belongs) {
        return fail('INVALID_ARGUMENT', 'selected revision is not one of the conflict sides');
      }
      break;
    }
    case 'merge': {
      if (resolution.createdRevisionId === null) {
        return fail('INVALID_ARGUMENT', 'merge resolution requires a created successor revision');
      }
      break;
    }
    case 'scope': {
      if (resolution.scopeRestriction === null) {
        return fail('INVALID_ARGUMENT', 'scope resolution requires a narrowed subject scope');
      }
      if (resolution.scopeRestriction.branchScope === null) {
        return fail(
          'INVALID_ARGUMENT',
          'scope resolution must narrow the subject to a specific branch scope',
        );
      }
      break;
    }
    case 'deprecate':
      break;
  }

  return ok({
    ...conflict,
    state: 'resolved',
    resolvedAt: resolution.resolvedAt,
    resolution,
    version: nextVersion(conflict.version),
  });
}

export function beginResolving(
  conflict: Conflict,
  expectedVersion: AggregateVersion,
): Result<Conflict> {
  const versionCheck = checkExpectedVersion(conflict.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  const transition = conflictStateMachine.transition(conflict.state, 'resolving');
  if (!transition.ok) return transition;
  return ok({
    ...conflict,
    state: 'resolving',
    version: nextVersion(conflict.version),
  });
}

export function isConflictOpen(conflict: Conflict): boolean {
  return !conflictStateMachine.isTerminal(conflict.state);
}

/** Two conflicts are equivalent when they describe the same subject in the same scope. */
export function conflictsAreEquivalent(a: Conflict, b: Conflict): boolean {
  return a.scopeFingerprint === b.scopeFingerprint;
}

export const INITIAL_CONFLICT_VERSION = INITIAL_VERSION;
