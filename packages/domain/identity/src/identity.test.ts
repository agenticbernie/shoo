import {
  type GrantId,
  type OrganizationId,
  type ProjectId,
  type UserId,
  asId,
  instant,
  unwrap,
} from '@shoo/domain-shared';
import { describe, expect, it } from 'vitest';
import { authorize } from './authorization.js';
import { issueGrant } from './grant.js';
import { createProject, reconcileRepository } from './project.js';
import { ROLE_ACTIONS, roleAllows } from './roles.js';
import type { AuthorizationContext } from './subject.js';

const org = asId<OrganizationId>('018f4b1a-0000-7000-8000-0000000000aa');
const project = asId<ProjectId>('018f4b1a-0000-7000-8000-0000000000bb');
const user = asId<UserId>('018f4b1a-0000-7000-8000-0000000000cc');
const at = instant(1_760_000_000_000);

function context(overrides: Partial<AuthorizationContext> = {}): AuthorizationContext {
  return {
    subject: { kind: 'user', userId: user },
    organizationId: org,
    projectId: project,
    role: 'project_owner',
    visibilityCeiling: 'project',
    subjectActive: true,
    stepUpVerified: true,
    previewTokenPresent: true,
    ...overrides,
  };
}

describe('role matrix', () => {
  it('never lets a device adapter canonicalize or manage policy', () => {
    expect(roleAllows('device_adapter', 'memory.mark_canonical')).toBe(false);
    expect(roleAllows('device_adapter', 'project.manage_policy')).toBe(false);
    expect(roleAllows('device_adapter', 'conflict.resolve')).toBe(false);
  });

  it('never lets a developer canonicalize', () => {
    expect(roleAllows('developer', 'memory.mark_canonical')).toBe(false);
  });

  it('gives a support operator no project content access', () => {
    expect(ROLE_ACTIONS.support_operator.has('memory.read')).toBe(false);
    expect(ROLE_ACTIONS.support_operator.has('context.build')).toBe(false);
  });

  it('never lets a background worker promote authority', () => {
    expect(roleAllows('background_worker', 'memory.accept')).toBe(false);
    expect(roleAllows('background_worker', 'memory.mark_canonical')).toBe(false);
  });
});

describe('authorize', () => {
  it('fails closed for a revoked subject', () => {
    const result = authorize({
      context: context({ subjectActive: false }),
      action: 'memory.read',
    });
    expect(result.ok).toBe(false);
  });

  it('requires step-up for canonicalization', () => {
    const result = authorize({
      context: context({ stepUpVerified: false }),
      action: 'memory.mark_canonical',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('AUTHORITY_REQUIRED');
  });

  it('requires a preview token for a supersession', () => {
    const result = authorize({
      context: context({ previewTokenPresent: false }),
      action: 'memory.supersede',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a request whose target visibility exceeds the caller ceiling', () => {
    const result = authorize({
      context: context({ visibilityCeiling: 'project' }),
      action: 'memory.propose',
      targetVisibility: 'organization',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('SCOPE_VIOLATION');
  });

  it('allows a permitted action with all preconditions met', () => {
    expect(authorize({ context: context(), action: 'memory.read' }).ok).toBe(true);
  });
});

describe('grants', () => {
  const issuer = {
    userId: user,
    role: 'developer' as const,
    actions: ROLE_ACTIONS.developer,
    visibilityCeiling: 'project' as const,
  };

  it('refuses a grant that exceeds the issuer role', () => {
    const result = issueGrant({
      id: asId<GrantId>('018f4b1a-0000-7000-8000-0000000000d1'),
      projectId: project,
      subjectType: 'device',
      subjectId: 'device-1',
      role: 'project_owner',
      actions: ['memory.read'],
      visibilityCeiling: 'project',
      expiresAt: null,
      issuer,
    });
    expect(result.ok).toBe(false);
  });

  it('refuses a grant carrying an action the issuer lacks', () => {
    const result = issueGrant({
      id: asId<GrantId>('018f4b1a-0000-7000-8000-0000000000d2'),
      projectId: project,
      subjectType: 'device',
      subjectId: 'device-1',
      role: 'device_adapter',
      actions: ['memory.mark_canonical'],
      visibilityCeiling: 'project',
      expiresAt: null,
      issuer,
    });
    expect(result.ok).toBe(false);
  });

  it('refuses a grant that widens visibility beyond the issuer ceiling', () => {
    const result = issueGrant({
      id: asId<GrantId>('018f4b1a-0000-7000-8000-0000000000d3'),
      projectId: project,
      subjectType: 'device',
      subjectId: 'device-1',
      role: 'device_adapter',
      actions: ['memory.read'],
      visibilityCeiling: 'organization',
      expiresAt: null,
      issuer,
    });
    expect(result.ok).toBe(false);
  });

  it('issues a grant within the issuer authority', () => {
    const result = issueGrant({
      id: asId<GrantId>('018f4b1a-0000-7000-8000-0000000000d4'),
      projectId: project,
      subjectType: 'device',
      subjectId: 'device-1',
      role: 'device_adapter',
      actions: ['memory.read', 'evidence.ingest'],
      visibilityCeiling: 'private',
      expiresAt: null,
      issuer,
    });
    expect(result.ok).toBe(true);
  });
});

describe('project', () => {
  const base = unwrap(
    createProject({
      id: project,
      organizationId: org,
      name: 'Shoo',
      slug: 'Shoo Core',
      retention: {
        retentionPolicyId: 'default',
        localEvidenceDays: 30,
        operationalDays: 365,
        legalHold: false,
      },
      createdAt: at,
    }),
  );

  it('normalizes the slug', () => {
    expect(base.slug).toBe('shoo-core');
  });

  it('requires the expected version to reconcile a repository link', () => {
    const stale = reconcileRepository(base, {
      repositoryFingerprint: 'f'.repeat(64),
      localIdentityHash: 'a'.repeat(64),
      expectedVersion: base.version + 1,
    });
    expect(stale.ok).toBe(false);
    const fresh = unwrap(
      reconcileRepository(base, {
        repositoryFingerprint: 'f'.repeat(64),
        localIdentityHash: 'a'.repeat(64),
        expectedVersion: base.version,
      }),
    );
    expect(fresh.repositoryLink?.status).toBe('verified');
    expect(fresh.version).toBe(base.version + 1);
  });
});
