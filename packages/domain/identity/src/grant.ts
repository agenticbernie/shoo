import {
  type AggregateVersion,
  checkExpectedVersion,
  fail,
  type GrantId,
  INITIAL_VERSION,
  type Instant,
  isAfter,
  nextVersion,
  ok,
  type ProjectId,
  type Result,
  type UserId,
  type Versioned,
} from '@shoo/domain-shared';
import { type Action, type Role, roleAllows, roleRank } from './roles.js';
import {
  narrowestVisibility,
  type VisibilityScope,
  withinVisibilityCeiling,
} from './visibility.js';

/**
 * Project grants (docs/36 `iam.project_grants`).
 *
 * Core invariant: **no grant may exceed its issuer's authority**. That is enforced here,
 * on both axes a grant can widen — the action set and the visibility ceiling — and on the
 * role rank, so a developer cannot mint an owner-equivalent device grant.
 */

export type GrantSubjectType = 'user' | 'device' | 'agent' | 'worker';

export interface ProjectGrant extends Versioned {
  readonly id: GrantId;
  readonly projectId: ProjectId;
  readonly subjectType: GrantSubjectType;
  readonly subjectId: string;
  readonly role: Role;
  readonly actions: ReadonlySet<Action>;
  readonly visibilityCeiling: VisibilityScope;
  readonly expiresAt: Instant | null;
  readonly revokedAt: Instant | null;
  readonly issuedByUserId: UserId;
}

export interface IssuerAuthority {
  readonly userId: UserId;
  readonly role: Role;
  readonly actions: ReadonlySet<Action>;
  readonly visibilityCeiling: VisibilityScope;
}

export function issueGrant(input: {
  readonly id: GrantId;
  readonly projectId: ProjectId;
  readonly subjectType: GrantSubjectType;
  readonly subjectId: string;
  readonly role: Role;
  readonly actions: readonly Action[];
  readonly visibilityCeiling: VisibilityScope;
  readonly expiresAt: Instant | null;
  readonly issuer: IssuerAuthority;
}): Result<ProjectGrant> {
  const { issuer } = input;

  if (roleRank(input.role) > roleRank(issuer.role)) {
    return fail('AUTHORITY_REQUIRED', 'a grant may not exceed the issuer role', {
      issuer_role: issuer.role,
      requested_role: input.role,
    });
  }

  if (!withinVisibilityCeiling(input.visibilityCeiling, issuer.visibilityCeiling)) {
    return fail('SCOPE_VIOLATION', 'a grant may not exceed the issuer visibility ceiling', {
      issuer_ceiling: issuer.visibilityCeiling,
      requested_ceiling: input.visibilityCeiling,
    });
  }

  for (const action of input.actions) {
    if (!issuer.actions.has(action)) {
      return fail('AUTHORITY_REQUIRED', 'a grant may not include an action the issuer lacks', {
        action,
      });
    }
    if (!roleAllows(input.role, action)) {
      return fail('INVARIANT_VIOLATION', 'granted action is not permitted for the granted role', {
        action,
        role: input.role,
      });
    }
  }

  return ok({
    id: input.id,
    projectId: input.projectId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    role: input.role,
    actions: new Set(input.actions),
    visibilityCeiling: input.visibilityCeiling,
    expiresAt: input.expiresAt,
    revokedAt: null,
    issuedByUserId: issuer.userId,
    version: INITIAL_VERSION,
  });
}

export function revokeGrant(
  grant: ProjectGrant,
  at: Instant,
  expectedVersion: AggregateVersion,
): Result<ProjectGrant> {
  const versionCheck = checkExpectedVersion(grant.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (grant.revokedAt !== null) {
    return fail('ALREADY_TERMINAL', 'grant is already revoked');
  }
  return ok({ ...grant, revokedAt: at, version: nextVersion(grant.version) });
}

export function isGrantActive(grant: ProjectGrant, at: Instant): boolean {
  if (grant.revokedAt !== null) return false;
  if (grant.expiresAt !== null && isAfter(at, grant.expiresAt)) return false;
  return true;
}

/**
 * Effective authority of a subject on a project: the intersection of what the membership
 * role allows and what the grant conveys. Combining never widens either side.
 */
export function effectiveAuthority(input: {
  readonly membershipRole: Role;
  readonly membershipCeiling: VisibilityScope;
  readonly grant: ProjectGrant | null;
  readonly at: Instant;
}): {
  readonly role: Role;
  readonly visibilityCeiling: VisibilityScope;
  readonly active: boolean;
} {
  const { membershipRole, membershipCeiling, grant, at } = input;
  if (grant === null) {
    return {
      role: membershipRole,
      visibilityCeiling: membershipCeiling,
      active: true,
    };
  }
  const active = isGrantActive(grant, at);
  const role = roleRank(grant.role) <= roleRank(membershipRole) ? grant.role : membershipRole;
  return {
    role,
    visibilityCeiling: narrowestVisibility(membershipCeiling, grant.visibilityCeiling),
    active,
  };
}
