import type { OrganizationId, ProjectId, SessionId, WorkUnitId } from './brand.js';
import { type Result, fail, ok } from './result.js';

/**
 * Tenant scope value object.
 *
 * Every cloud record carries `organizationId` and `projectId` (docs/29 "Identity and key
 * strategy"). Narrower scope is added by the aggregates that need it.
 */
export interface TenantScope {
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
}

export interface WorkScope extends TenantScope {
  readonly workUnitId: WorkUnitId | null;
  readonly sessionId: SessionId | null;
}

export function sameTenant(a: TenantScope, b: TenantScope): boolean {
  return a.organizationId === b.organizationId && a.projectId === b.projectId;
}

/** Reject any cross-tenant operation before it can reach persistence. */
export function requireSameTenant<T>(a: TenantScope, b: TenantScope, value: T): Result<T> {
  if (!sameTenant(a, b)) {
    return fail('SCOPE_VIOLATION', 'operation crosses an organization or project boundary');
  }
  return ok(value);
}

/**
 * Branch/worktree/module scope of a record or request.
 *
 * Branch is not an identity (docs/29): it is a normalized reference. A branch-scoped
 * record never leaks into an unrelated branch's context (docs/30 "Contradiction handling").
 */
export interface BranchScope {
  readonly branch: string | null;
  readonly worktreeId: string | null;
  readonly modulePaths: readonly string[];
}

export const PROJECT_WIDE_BRANCH_SCOPE: BranchScope = Object.freeze({
  branch: null,
  worktreeId: null,
  modulePaths: Object.freeze([]) as readonly string[],
});

/**
 * `candidate` applies within `requested` when it is project-wide, or when both name the
 * same branch. A project-wide record applies everywhere; a branch record applies only to
 * its own branch.
 */
export function branchScopeApplies(candidate: BranchScope, requested: BranchScope): boolean {
  if (candidate.branch === null) return true;
  return candidate.branch === requested.branch;
}

/**
 * Typed subject key — the resolution key of a memory record.
 *
 * Resolution keys on a typed subject, never on free text (docs/30 "Canonical resolver").
 */
export interface TypedSubject {
  readonly subjectType: string;
  readonly subjectKey: string;
  readonly branchScope: string | null;
}

export function typedSubject(
  subjectType: string,
  subjectKey: string,
  branchScope: string | null = null,
): Result<TypedSubject> {
  if (subjectType.trim() === '' || subjectKey.trim() === '') {
    return fail('INVALID_ARGUMENT', 'typed subject requires a non-empty type and key');
  }
  return ok({ subjectType, subjectKey, branchScope });
}

export function subjectEquals(a: TypedSubject, b: TypedSubject): boolean {
  return (
    a.subjectType === b.subjectType &&
    a.subjectKey === b.subjectKey &&
    a.branchScope === b.branchScope
  );
}

/**
 * Stable fingerprint of a subject within a tenant scope, used as the uniqueness key for
 * "one active equivalent conflict per subject/scope" (docs/36).
 */
export function subjectScopeFingerprint(scope: TenantScope, subject: TypedSubject): string {
  return [
    scope.organizationId,
    scope.projectId,
    subject.subjectType,
    subject.subjectKey,
    subject.branchScope ?? '*',
  ].join('|');
}
