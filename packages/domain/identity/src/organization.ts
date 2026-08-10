import {
  type AggregateVersion,
  checkExpectedVersion,
  fail,
  INITIAL_VERSION,
  type Instant,
  type MembershipId,
  nextVersion,
  type OrganizationId,
  ok,
  type Result,
  type UserId,
  type Versioned,
} from '@shoo/domain-shared';
import type { Role } from './roles.js';

/** Organization and membership aggregates (docs/36 `iam.organizations`, `iam.memberships`). */

export type OrganizationStatus = 'active' | 'suspended' | 'deleting' | 'deleted';

export interface Organization extends Versioned {
  readonly id: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly status: OrganizationStatus;
  readonly createdAt: Instant;
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/;

/** Slugs are normalized before uniqueness is enforced (docs/36 "unique normalized slug"). */
export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createOrganization(input: {
  readonly id: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly createdAt: Instant;
}): Result<Organization> {
  const slug = normalizeSlug(input.slug);
  if (!SLUG_PATTERN.test(slug)) {
    return fail('INVALID_ARGUMENT', 'organization slug must normalize to a valid slug');
  }
  if (input.name.trim() === '') {
    return fail('INVALID_ARGUMENT', 'organization name is required');
  }
  return ok({
    id: input.id,
    name: input.name.trim(),
    slug,
    status: 'active',
    createdAt: input.createdAt,
    version: INITIAL_VERSION,
  });
}

export type MembershipStatus = 'invited' | 'active' | 'suspended' | 'removed';

export interface Membership extends Versioned {
  readonly id: MembershipId;
  readonly organizationId: OrganizationId;
  readonly userId: UserId;
  readonly role: Role;
  readonly status: MembershipStatus;
  readonly joinedAt: Instant | null;
}

export function createMembership(input: {
  readonly id: MembershipId;
  readonly organizationId: OrganizationId;
  readonly userId: UserId;
  readonly role: Role;
  readonly status?: MembershipStatus;
  readonly joinedAt: Instant | null;
}): Membership {
  return {
    id: input.id,
    organizationId: input.organizationId,
    userId: input.userId,
    role: input.role,
    status: input.status ?? 'active',
    joinedAt: input.joinedAt,
    version: INITIAL_VERSION,
  };
}

/**
 * Change a member's role.
 *
 * A membership role change never elevates the *issuer*: the caller's own role is checked
 * by `authorize` before this is reached, and `grant.ts` enforces that no grant exceeds its
 * issuer's authority.
 */
export function changeMembershipRole(
  membership: Membership,
  role: Role,
  expectedVersion: AggregateVersion,
): Result<Membership> {
  const versionCheck = checkExpectedVersion(membership.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (membership.status === 'removed') {
    return fail('ILLEGAL_TRANSITION', 'a removed membership cannot change role');
  }
  if (membership.role === role) return ok(membership);
  return ok({ ...membership, role, version: nextVersion(membership.version) });
}

export function suspendMembership(
  membership: Membership,
  expectedVersion: AggregateVersion,
): Result<Membership> {
  const versionCheck = checkExpectedVersion(membership.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (membership.status === 'removed') {
    return fail('ALREADY_TERMINAL', 'membership is already removed');
  }
  return ok({
    ...membership,
    status: 'suspended',
    version: nextVersion(membership.version),
  });
}

export function isMembershipActive(membership: Membership): boolean {
  return membership.status === 'active';
}
