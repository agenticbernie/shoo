import {
  asId,
  instant,
  type OrganizationId,
  type OutboxJobId,
  type ProjectId,
  type UserId,
  unwrap,
} from '@shoo/domain-shared';
import { describe, expect, it } from 'vitest';
import { defineFlag, resolveFlag } from './flags.js';
import { completeJob, enqueueJob, failJob, isRunnable, leaseJob } from './outbox.js';
import { createPolicyVersion, evaluateRoute } from './policy.js';

const org = asId<OrganizationId>('018f4b1a-0000-7000-8000-0000000000aa');
const project = asId<ProjectId>('018f4b1a-0000-7000-8000-0000000000bb');
const user = asId<UserId>('018f4b1a-0000-7000-8000-0000000000cc');
const at = instant(1_760_000_000_000);

function job() {
  return unwrap(
    enqueueJob({
      id: asId<OutboxJobId>('018f4b1a-0000-7000-8000-000000000f01'),
      organizationId: org,
      projectId: project,
      jobClass: 'extraction',
      operationKey: 'extract:session:1',
      payloadRef: 'ledger:1',
      at,
    }),
  );
}

describe('outbox job', () => {
  it('leases, then completes', () => {
    const leased = unwrap(leaseJob(job(), { owner: 'worker-1', leaseMillis: 30_000, at }));
    expect(leased.attempts).toBe(1);
    expect(unwrap(completeJob(leased, at)).status).toBe('succeeded');
  });

  it('reclaims a job whose lease expired without completion', () => {
    const leased = unwrap(leaseJob(job(), { owner: 'worker-1', leaseMillis: 1_000, at }));
    expect(isRunnable(leased, instant(at.epochMillis + 500))).toBe(false);
    expect(isRunnable(leased, instant(at.epochMillis + 5_000))).toBe(true);
  });

  it('backs off a transient failure and dead-letters a permanent one', () => {
    const leased = unwrap(leaseJob(job(), { owner: 'worker-1', leaseMillis: 30_000, at }));
    const transient = unwrap(
      failJob(leased, {
        errorCode: 'PROVIDER_TIMEOUT',
        failureClass: 'transient',
        jitterFactor: 0.5,
        at,
      }),
    );
    expect(transient.status).toBe('pending');
    expect(transient.nextRunAt.epochMillis).toBeGreaterThan(at.epochMillis);

    const permanent = unwrap(
      failJob(leased, {
        errorCode: 'SCHEMA_INCOMPATIBLE',
        failureClass: 'permanent',
        jitterFactor: 0.5,
        at,
      }),
    );
    expect(permanent.status).toBe('dead_letter');
  });

  it('dead-letters once attempts are exhausted', () => {
    let current = job();
    for (let i = 0; i < current.maxAttempts; i += 1) {
      current = unwrap(leaseJob(current, { owner: 'worker-1', leaseMillis: 1, at }));
      const failed = failJob(current, {
        errorCode: 'PROVIDER_TIMEOUT',
        failureClass: 'transient',
        jitterFactor: 0,
        at,
      });
      current = unwrap(failed);
      if (current.status === 'dead_letter') break;
      current = { ...current, nextRunAt: at };
    }
    expect(current.status).toBe('dead_letter');
  });
});

describe('sync policy routing', () => {
  const policy = unwrap(
    createPolicyVersion({
      projectId: project,
      previous: null,
      defaultRoute: 'operational',
      rules: [
        {
          ruleId: 'decisions-durable',
          memoryTypes: ['decision'],
          classifications: ['durable_eligible'],
          pathGlobs: [],
          minVerification: 'verified',
          route: 'durable',
          visibilityCeiling: 'project',
          explanation: 'Verified decisions are eligible for durable persistence.',
        },
      ],
      trustMode: 'manual',
      authoredByUserId: user,
      at,
    }),
  );

  it('never routes restricted material off the device', () => {
    const result = evaluateRoute(policy, {
      memoryType: 'decision',
      classification: 'restricted',
      paths: [],
      verification: 'verified',
    });
    expect(result.operational).toBe('denied');
    expect(result.durable).toBe('denied');
    expect(result.local).toBe('local_only');
  });

  it('routes a verified durable-eligible decision to durable', () => {
    const result = evaluateRoute(policy, {
      memoryType: 'decision',
      classification: 'durable_eligible',
      paths: [],
      verification: 'verified',
    });
    expect(result.durable).toBe('durable');
    expect(result.matchedRuleId).toBe('decisions-durable');
  });

  it('does not reach a rule whose minimum verification is unmet', () => {
    const result = evaluateRoute(policy, {
      memoryType: 'decision',
      classification: 'durable_eligible',
      paths: [],
      verification: 'unverified',
    });
    expect(result.durable).toBe('denied');
    expect(result.reasonCode).toBe('default_route');
  });

  it('increments the immutable policy version', () => {
    const next = unwrap(
      createPolicyVersion({
        projectId: project,
        previous: policy,
        defaultRoute: 'local_only',
        rules: [],
        trustMode: 'manual',
        authoredByUserId: user,
        at,
      }),
    );
    expect(next.version).toBe(policy.version + 1);
  });
});

describe('feature flags', () => {
  const base = {
    type: 'release' as const,
    ownerUserId: user,
    defaultEnabled: false,
    expiresAt: instant(at.epochMillis + 86_400_000),
    removalStory: 'Remove after the beta cohort completes.',
    description: 'Enable the new resume flow.',
  };

  it('refuses a flag that would gate a protected capability', () => {
    expect(defineFlag({ ...base, key: 'disable.rls.for.tests' }).ok).toBe(false);
    expect(defineFlag({ ...base, key: 'skip.citations' }).ok).toBe(false);
  });

  it('falls back to the default once expired', () => {
    const flag = unwrap(defineFlag({ ...base, key: 'resume.v2' }));
    expect(resolveFlag(flag, { override: true, at })).toBe(true);
    expect(
      resolveFlag(flag, {
        override: true,
        at: instant(at.epochMillis + 200_000_000),
      }),
    ).toBe(false);
  });
});
