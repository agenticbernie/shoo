import {
  type MemoryId,
  type OrganizationId,
  type ProjectId,
  type RevisionId,
  type UserId,
  asId,
  instant,
  unwrap,
} from '@shoo/domain-shared';
import { describe, expect, it } from 'vitest';
import { checkOrthogonality, isCurrentStateEligible } from './authority.js';
import {
  acceptRevision,
  changeVerification,
  correctMemory,
  createCandidateMemory,
  currentRevision,
  markCanonical,
  restrictVisibility,
  supersedeMemory,
} from './memory.js';
import { resolveCanonical } from './resolver.js';
import { addSupersessionEdge } from './supersession.js';

const org = asId<OrganizationId>('018f4b1a-0000-7000-8000-0000000000aa');
const project = asId<ProjectId>('018f4b1a-0000-7000-8000-0000000000bb');
const user = asId<UserId>('018f4b1a-0000-7000-8000-0000000000cc');
const at = instant(1_760_000_000_000);

const subject = { subjectType: 'decision', subjectKey: 'auth-strategy', branchScope: null };

function candidate(overrides: Partial<Parameters<typeof createCandidateMemory>[0]> = {}) {
  return unwrap(
    createCandidateMemory({
      memoryId: asId<MemoryId>('018f4b1a-0000-7000-8000-000000000001'),
      revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000101'),
      organizationId: org,
      projectId: project,
      memoryType: 'decision',
      subject,
      content: { statement: 'use clerk' },
      contentHash: 'a'.repeat(64),
      claim: 'claimed',
      requestedVisibility: 'project',
      visibilityCeiling: 'project',
      evidence: [{ evidenceId: asId('018f4b1a-0000-7000-8000-000000000201'), supportType: 'supports' }],
      createdByUserId: user,
      extractorVersion: '1.0.0',
      ruleVersion: null,
      effectiveAt: at,
      at,
      ...overrides,
    }),
  );
}

describe('candidate creation', () => {
  it('creates an unverified, session-authority candidate', () => {
    const record = candidate();
    const revision = currentRevision(record);
    expect(revision.state.verification).toBe('unverified');
    expect(revision.state.authority).toBe('session');
    expect(revision.state.lineage).toBe('active');
  });

  it('clamps requested visibility to the caller ceiling', () => {
    const record = candidate({ requestedVisibility: 'organization', visibilityCeiling: 'project' });
    expect(currentRevision(record).state.visibility).toBe('project');
  });

  it('refuses an empty claim', () => {
    const result = createCandidateMemory({
      memoryId: asId<MemoryId>('018f4b1a-0000-7000-8000-000000000001'),
      revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000101'),
      organizationId: org,
      projectId: project,
      memoryType: 'fact',
      subject,
      content: {},
      contentHash: 'a'.repeat(64),
      claim: 'observed',
      requestedVisibility: 'private',
      visibilityCeiling: 'project',
      evidence: [],
      createdByUserId: user,
      extractorVersion: null,
      ruleVersion: null,
      effectiveAt: at,
      at,
    });
    expect(result.ok).toBe(false);
  });

  it('refuses schema-reserved coordination memory types', () => {
    const result = createCandidateMemory({
      memoryId: asId<MemoryId>('018f4b1a-0000-7000-8000-000000000001'),
      revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000101'),
      organizationId: org,
      projectId: project,
      memoryType: 'handoff',
      subject,
      content: { to: 'someone' },
      contentHash: 'a'.repeat(64),
      claim: 'claimed',
      requestedVisibility: 'project',
      visibilityCeiling: 'project',
      evidence: [],
      createdByUserId: user,
      extractorVersion: null,
      ruleVersion: null,
      effectiveAt: at,
      at,
    });
    expect(result.ok).toBe(false);
  });
});

describe('authority transitions', () => {
  it('never lets accept confer canonical authority', () => {
    const record = candidate();
    const result = acceptRevision(record, {
      revisionId: record.currentRevisionId,
      requestedAuthority: 'canonical',
      actorAuthorityCeiling: 'canonical',
      expectedVersion: record.version,
      at,
    });
    expect(result.ok).toBe(false);
  });

  it('rejects an accept above the actor authority ceiling', () => {
    const record = candidate();
    const result = acceptRevision(record, {
      revisionId: record.currentRevisionId,
      requestedAuthority: 'team',
      actorAuthorityCeiling: 'branch',
      expectedVersion: record.version,
      at,
    });
    expect(result.ok).toBe(false);
  });

  it('refuses canonical promotion of an unverified revision', () => {
    const record = candidate();
    const result = markCanonical(record, {
      revisionId: record.currentRevisionId,
      expectedVersion: record.version,
      existingCanonicalRevisionId: null,
      previewResolvesExisting: false,
      at,
    });
    expect(result.ok).toBe(false);
  });

  it('promotes a verified revision with evidence to canonical', () => {
    const verified = unwrap(
      changeVerification(candidate(), {
        revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000101'),
        verification: 'verified',
        expectedVersion: 1,
        at,
      }),
    );
    const canonical = unwrap(
      markCanonical(verified, {
        revisionId: verified.currentRevisionId,
        expectedVersion: verified.version,
        existingCanonicalRevisionId: null,
        previewResolvesExisting: false,
        at,
      }),
    );
    expect(currentRevision(canonical).state.authority).toBe('canonical');
  });

  it('creates a conflict instead of replacing an existing canonical value by time', () => {
    const verified = unwrap(
      changeVerification(candidate(), {
        revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000101'),
        verification: 'verified',
        expectedVersion: 1,
        at,
      }),
    );
    const result = markCanonical(verified, {
      revisionId: verified.currentRevisionId,
      expectedVersion: verified.version,
      existingCanonicalRevisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-0000000009ff'),
      previewResolvesExisting: false,
      at,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CONFLICT_ACTIVE');
  });

  it('rejects a version conflict rather than applying a stale mutation', () => {
    const record = candidate();
    const result = acceptRevision(record, {
      revisionId: record.currentRevisionId,
      requestedAuthority: 'branch',
      actorAuthorityCeiling: 'canonical',
      expectedVersion: record.version + 5,
      at,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VERSION_CONFLICT');
  });

  it('allows narrowing visibility but not widening beyond the ceiling', () => {
    const record = candidate();
    expect(
      restrictVisibility(record, {
        revisionId: record.currentRevisionId,
        visibility: 'private',
        visibilityCeiling: 'project',
        expectedVersion: record.version,
        at,
      }).ok,
    ).toBe(true);
    expect(
      restrictVisibility(record, {
        revisionId: record.currentRevisionId,
        visibility: 'organization',
        visibilityCeiling: 'project',
        expectedVersion: record.version,
        at,
      }).ok,
    ).toBe(false);
  });
});

describe('correction and supersession', () => {
  const successorId = asId<RevisionId>('018f4b1a-0000-7000-8000-000000000102');

  it('creates a successor revision and demotes the predecessor to historical', () => {
    const record = candidate();
    const corrected = unwrap(
      correctMemory(record, {
        successorRevisionId: successorId,
        predecessorRevisionId: record.currentRevisionId,
        correctionType: 'content',
        content: { statement: 'use clerk with SSO' },
        contentHash: 'b'.repeat(64),
        reason: 'the earlier statement omitted SSO',
        evidence: [
          { evidenceId: asId('018f4b1a-0000-7000-8000-000000000202'), supportType: 'supports' },
        ],
        actorUserId: user,
        expectedVersion: record.version,
        effectiveAt: at,
        at,
      }),
    );

    expect(corrected.revisions).toHaveLength(2);
    const predecessor = corrected.revisions[0];
    expect(predecessor?.state.lineage).toBe('superseded');
    expect(predecessor?.state.authority).toBe('historical');
    expect(predecessor?.content).toEqual({ statement: 'use clerk' });
    expect(corrected.currentRevisionId).toBe(successorId);
    expect(corrected.supersessionEdges).toHaveLength(1);
  });

  it('does not carry canonical authority forward to the successor', () => {
    const verified = unwrap(
      changeVerification(candidate(), {
        revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000101'),
        verification: 'verified',
        expectedVersion: 1,
        at,
      }),
    );
    const canonical = unwrap(
      markCanonical(verified, {
        revisionId: verified.currentRevisionId,
        expectedVersion: verified.version,
        existingCanonicalRevisionId: null,
        previewResolvesExisting: false,
        at,
      }),
    );
    const superseded = unwrap(
      supersedeMemory(canonical, {
        successorRevisionId: successorId,
        predecessorRevisionId: canonical.currentRevisionId,
        content: { statement: 'use auth0' },
        contentHash: 'c'.repeat(64),
        reason: 'vendor change approved',
        evidence: [
          { evidenceId: asId('018f4b1a-0000-7000-8000-000000000203'), supportType: 'supports' },
        ],
        actorUserId: user,
        expectedVersion: canonical.version,
        effectiveAt: at,
        at,
      }),
    );
    expect(currentRevision(superseded).state.authority).toBe('session');
  });

  it('refuses to supersede an already closed revision', () => {
    const record = candidate();
    const once = unwrap(
      supersedeMemory(record, {
        successorRevisionId: successorId,
        predecessorRevisionId: record.currentRevisionId,
        content: { statement: 'v2' },
        contentHash: 'b'.repeat(64),
        reason: 'first correction',
        evidence: [],
        actorUserId: user,
        expectedVersion: record.version,
        effectiveAt: at,
        at,
      }),
    );
    const twice = supersedeMemory(once, {
      successorRevisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000103'),
      predecessorRevisionId: record.currentRevisionId,
      content: { statement: 'v3' },
      contentHash: 'd'.repeat(64),
      reason: 'second correction of the same predecessor',
      evidence: [],
      actorUserId: user,
      expectedVersion: once.version,
      effectiveAt: at,
      at,
    });
    expect(twice.ok).toBe(false);
  });

  it('rejects a lineage cycle', () => {
    const a = asId<RevisionId>('018f4b1a-0000-7000-8000-00000000aa01');
    const b = asId<RevisionId>('018f4b1a-0000-7000-8000-00000000aa02');
    const edges = unwrap(
      addSupersessionEdge([], {
        predecessorRevisionId: a,
        successorRevisionId: b,
        reason: 'correction',
        actorUserId: null,
        createdAt: at,
      }),
    );
    const cycle = addSupersessionEdge(edges, {
      predecessorRevisionId: b,
      successorRevisionId: a,
      reason: 'correction',
      actorUserId: null,
      createdAt: at,
    });
    expect(cycle.ok).toBe(false);
  });
});

describe('orthogonal state checks (docs/36)', () => {
  it('rejects a superseded revision that still claims non-historical authority', () => {
    const result = checkOrthogonality({
      claim: 'observed',
      verification: 'verified',
      authority: 'canonical',
      visibility: 'project',
      durability: 'operational',
      freshness: 'current',
      lineage: 'superseded',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects durable + canonical without verification', () => {
    const result = checkOrthogonality({
      claim: 'claimed',
      verification: 'unverified',
      authority: 'canonical',
      visibility: 'project',
      durability: 'durable',
      freshness: 'current',
      lineage: 'active',
    });
    expect(result.ok).toBe(false);
  });

  it('accepts project visibility with only session authority', () => {
    const result = checkOrthogonality({
      claim: 'claimed',
      verification: 'unverified',
      authority: 'session',
      visibility: 'project',
      durability: 'operational',
      freshness: 'current',
      lineage: 'active',
    });
    expect(result.ok).toBe(true);
  });

  it('never treats a superseded revision as current-state eligible', () => {
    expect(
      isCurrentStateEligible({
        claim: 'observed',
        verification: 'verified',
        authority: 'historical',
        visibility: 'project',
        durability: 'operational',
        freshness: 'current',
        lineage: 'superseded',
      }),
    ).toBe(false);
  });
});

describe('canonical resolver', () => {
  const permitted = new Set(['018f4b1a-0000-7000-8000-000000000001']);

  it('returns unknown when no record matches the subject', () => {
    const result = resolveCanonical({
      subject: { subjectType: 'decision', subjectKey: 'nothing', branchScope: null },
      requestedScope: { branch: null, worktreeId: null, modulePaths: [] },
      candidates: [candidate()],
      permittedMemoryIds: permitted,
      ineligibleMemoryIds: new Set(),
      at,
      stalenessMillis: null,
    });
    expect(result.outcome).toBe('unknown');
  });

  it('excludes unauthorized records', () => {
    const result = resolveCanonical({
      subject,
      requestedScope: { branch: null, worktreeId: null, modulePaths: [] },
      candidates: [candidate()],
      permittedMemoryIds: new Set(),
      ineligibleMemoryIds: new Set(),
      at,
      stalenessMillis: null,
    });
    expect(result.outcome).toBe('unknown');
    expect(result.reasons).toContain('filtered:unauthorized');
  });

  it('follows supersession lineage and never returns the superseded predecessor', () => {
    const record = candidate();
    const corrected = unwrap(
      correctMemory(record, {
        successorRevisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000102'),
        predecessorRevisionId: record.currentRevisionId,
        correctionType: 'content',
        content: { statement: 'use clerk with SSO' },
        contentHash: 'b'.repeat(64),
        reason: 'omitted SSO',
        evidence: [
          { evidenceId: asId('018f4b1a-0000-7000-8000-000000000202'), supportType: 'supports' },
        ],
        actorUserId: user,
        expectedVersion: record.version,
        effectiveAt: at,
        at,
      }),
    );
    const result = resolveCanonical({
      subject,
      requestedScope: { branch: null, worktreeId: null, modulePaths: [] },
      candidates: [corrected],
      permittedMemoryIds: permitted,
      ineligibleMemoryIds: new Set(),
      at,
      stalenessMillis: null,
    });
    expect(result.outcome).toBe('current');
    expect(result.revisionId).toBe('018f4b1a-0000-7000-8000-000000000102');
  });

  it('reports stale rather than current when the winner exceeds the staleness budget', () => {
    const result = resolveCanonical({
      subject,
      requestedScope: { branch: null, worktreeId: null, modulePaths: [] },
      candidates: [candidate()],
      permittedMemoryIds: permitted,
      ineligibleMemoryIds: new Set(),
      at: instant(at.epochMillis + 10_000),
      stalenessMillis: 1_000,
    });
    expect(result.outcome).toBe('stale');
  });

  it('reports a conflict when two accepted authorities disagree', () => {
    const first = unwrap(
      acceptRevision(candidate(), {
        revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000101'),
        requestedAuthority: 'team',
        actorAuthorityCeiling: 'canonical',
        expectedVersion: 1,
        at,
      }),
    );
    const secondBase = candidate({
      memoryId: asId<MemoryId>('018f4b1a-0000-7000-8000-000000000002'),
      revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000111'),
      content: { statement: 'use auth0' },
      contentHash: 'e'.repeat(64),
    });
    const second = unwrap(
      acceptRevision(secondBase, {
        revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000111'),
        requestedAuthority: 'team',
        actorAuthorityCeiling: 'canonical',
        expectedVersion: 1,
        at,
      }),
    );
    const result = resolveCanonical({
      subject,
      requestedScope: { branch: null, worktreeId: null, modulePaths: [] },
      candidates: [first, second],
      permittedMemoryIds: new Set([first.id, second.id]),
      ineligibleMemoryIds: new Set(),
      at,
      stalenessMillis: null,
    });
    expect(result.outcome).toBe('conflicted');
    expect(result.conflictingRevisionIds).toHaveLength(2);
  });

  it('prefers accepted authority over a more recent agent claim', () => {
    const accepted = unwrap(
      acceptRevision(candidate(), {
        revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000101'),
        requestedAuthority: 'team',
        actorAuthorityCeiling: 'canonical',
        expectedVersion: 1,
        at,
      }),
    );
    const newerClaim = candidate({
      memoryId: asId<MemoryId>('018f4b1a-0000-7000-8000-000000000002'),
      revisionId: asId<RevisionId>('018f4b1a-0000-7000-8000-000000000111'),
      content: { statement: 'agent thinks otherwise' },
      contentHash: 'f'.repeat(64),
      effectiveAt: instant(at.epochMillis + 60_000),
    });
    const result = resolveCanonical({
      subject,
      requestedScope: { branch: null, worktreeId: null, modulePaths: [] },
      candidates: [accepted, newerClaim],
      permittedMemoryIds: new Set([accepted.id, newerClaim.id]),
      ineligibleMemoryIds: new Set(),
      at,
      stalenessMillis: null,
    });
    expect(result.outcome).toBe('current');
    expect(result.revisionId).toBe('018f4b1a-0000-7000-8000-000000000101');
  });
});
