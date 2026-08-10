import {
  type AggregateVersion,
  INITIAL_VERSION,
  type Instant,
  type OrganizationId,
  type ProjectId,
  type Result,
  type Versioned,
  checkExpectedVersion,
  fail,
  nextVersion,
  ok,
} from '@shoo/domain-shared';
import { normalizeSlug } from './organization.js';
import type { VisibilityScope } from './visibility.js';

/** Project aggregate and repository link (docs/36 `iam.projects`, `continuity.repository_links`). */

export type ProjectStatus = 'active' | 'archived' | 'deleting' | 'deleted';
export type RepositoryLinkStatus = 'verified' | 'unverified' | 'mismatched';

export interface RepositoryLink {
  /** Content-addressed repository identity. A path is never an identity (docs/29). */
  readonly repositoryFingerprint: string;
  readonly provider: string | null;
  readonly ref: string | null;
  readonly localIdentityHash: string;
  readonly status: RepositoryLinkStatus;
}

export interface RetentionPolicy {
  readonly retentionPolicyId: string;
  readonly localEvidenceDays: number;
  readonly operationalDays: number | null;
  readonly legalHold: boolean;
}

export interface Project extends Versioned {
  readonly id: ProjectId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly status: ProjectStatus;
  readonly repositoryLink: RepositoryLink | null;
  readonly retention: RetentionPolicy;
  readonly defaultVisibility: VisibilityScope;
  readonly syncPolicyVersion: number;
  readonly createdAt: Instant;
}

export function createProject(input: {
  readonly id: ProjectId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly retention: RetentionPolicy;
  readonly defaultVisibility?: VisibilityScope;
  readonly repositoryLink?: RepositoryLink | null;
  readonly createdAt: Instant;
}): Result<Project> {
  const slug = normalizeSlug(input.slug);
  if (slug === '') {
    return fail('INVALID_ARGUMENT', 'project slug must normalize to a valid slug');
  }
  if (input.name.trim() === '') {
    return fail('INVALID_ARGUMENT', 'project name is required');
  }
  if (input.retention.localEvidenceDays <= 0) {
    return fail('INVALID_ARGUMENT', 'local evidence retention must be positive');
  }
  return ok({
    id: input.id,
    organizationId: input.organizationId,
    name: input.name.trim(),
    slug,
    status: 'active',
    repositoryLink: input.repositoryLink ?? null,
    retention: input.retention,
    defaultVisibility: input.defaultVisibility ?? 'project',
    syncPolicyVersion: 1,
    createdAt: input.createdAt,
    version: INITIAL_VERSION,
  });
}

/**
 * Reconcile a repository path/fingerprint mismatch (docs/37 `:reconcile-repository`).
 *
 * Reconciliation is an explicit, versioned command. Shoo never silently re-points a
 * project at a different repository identity because a path changed.
 */
export function reconcileRepository(
  project: Project,
  input: {
    readonly repositoryFingerprint: string;
    readonly localIdentityHash: string;
    readonly expectedVersion: AggregateVersion;
  },
): Result<Project> {
  const versionCheck = checkExpectedVersion(project.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (project.status !== 'active') {
    return fail('ILLEGAL_TRANSITION', 'only an active project can be reconciled', {
      status: project.status,
    });
  }
  if (input.repositoryFingerprint.trim() === '') {
    return fail('INVALID_ARGUMENT', 'repository fingerprint is required');
  }
  return ok({
    ...project,
    repositoryLink: {
      repositoryFingerprint: input.repositoryFingerprint,
      provider: project.repositoryLink?.provider ?? null,
      ref: project.repositoryLink?.ref ?? null,
      localIdentityHash: input.localIdentityHash,
      status: 'verified',
    },
    version: nextVersion(project.version),
  });
}

export function beginProjectDeletion(
  project: Project,
  expectedVersion: AggregateVersion,
): Result<Project> {
  const versionCheck = checkExpectedVersion(project.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (project.status === 'deleted' || project.status === 'deleting') {
    return fail('ALREADY_TERMINAL', 'project deletion already started', {
      status: project.status,
    });
  }
  if (project.retention.legalHold) {
    return fail('POLICY_DENIED', 'project is under legal hold and cannot be deleted');
  }
  return ok({ ...project, status: 'deleting', version: nextVersion(project.version) });
}

export function isProjectWritable(project: Project): boolean {
  return project.status === 'active';
}
