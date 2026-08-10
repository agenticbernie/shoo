import {
  type Instant,
  type OrganizationId,
  type OutboxJobId,
  type ProjectId,
  type Result,
  fail,
  isAfter,
  ok,
  plusMillis,
  stateMachine,
} from '@shoo/domain-shared';

/**
 * Transactional outbox job (docs/29 "Transactional outbox", docs/36 `platform.outbox_jobs`).
 *
 * The aggregate mutation, the ledger row and the outbox job are written in one PostgreSQL
 * transaction. This module owns what happens afterwards: leases, bounded retries with
 * jittered backoff, and visible dead-lettering.
 */

export const OUTBOX_STATUSES = [
  'pending',
  'leased',
  'succeeded',
  'failed',
  'dead_letter',
  'cancelled',
] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

export const outboxStateMachine = stateMachine<OutboxStatus>({
  name: 'outbox job',
  initial: 'pending',
  terminal: ['succeeded', 'dead_letter', 'cancelled'],
  transitions: {
    pending: ['leased', 'cancelled'],
    leased: ['succeeded', 'failed', 'pending', 'cancelled'],
    failed: ['pending', 'dead_letter', 'cancelled'],
    succeeded: [],
    dead_letter: [],
    cancelled: [],
  },
});

export type JobClass =
  | 'extraction'
  | 'indexing'
  | 'context_build'
  | 'durable_persist'
  | 'durable_reconcile'
  | 'projection_rebuild'
  | 'retention'
  | 'export'
  | 'deletion';

export interface OutboxJob {
  readonly id: OutboxJobId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly jobClass: JobClass;
  /** Deterministic operation key. Re-enqueueing the same work is a no-op (docs/29). */
  readonly operationKey: string;
  readonly payloadRef: string;
  readonly status: OutboxStatus;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly leaseOwner: string | null;
  readonly leaseExpiresAt: Instant | null;
  readonly nextRunAt: Instant;
  readonly lastErrorCode: string | null;
  readonly createdAt: Instant;
  readonly updatedAt: Instant;
}

export const DEFAULT_MAX_ATTEMPTS = 8;
const BASE_BACKOFF_MILLIS = 1_000;
const MAX_BACKOFF_MILLIS = 15 * 60 * 1_000;

export function enqueueJob(input: {
  readonly id: OutboxJobId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly jobClass: JobClass;
  readonly operationKey: string;
  readonly payloadRef: string;
  readonly maxAttempts?: number;
  readonly at: Instant;
}): Result<OutboxJob> {
  if (input.operationKey.trim() === '') {
    return fail('INVALID_ARGUMENT', 'an outbox job requires a deterministic operation key');
  }
  return ok({
    id: input.id,
    organizationId: input.organizationId,
    projectId: input.projectId,
    jobClass: input.jobClass,
    operationKey: input.operationKey,
    payloadRef: input.payloadRef,
    status: 'pending',
    attempts: 0,
    maxAttempts: input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    leaseOwner: null,
    leaseExpiresAt: null,
    nextRunAt: input.at,
    lastErrorCode: null,
    createdAt: input.at,
    updatedAt: input.at,
  });
}

export function isRunnable(job: OutboxJob, at: Instant): boolean {
  if (job.status === 'pending') return !isAfter(job.nextRunAt, at);
  // A lease that expired without completion is reclaimable.
  if (job.status === 'leased' && job.leaseExpiresAt !== null) {
    return isAfter(at, job.leaseExpiresAt);
  }
  return false;
}

export function leaseJob(
  job: OutboxJob,
  input: { readonly owner: string; readonly leaseMillis: number; readonly at: Instant },
): Result<OutboxJob> {
  if (!isRunnable(job, input.at)) {
    return fail('NOT_ELIGIBLE', 'job is not runnable at this time', { status: job.status });
  }
  const transition = outboxStateMachine.transition(
    job.status === 'leased' ? 'leased' : job.status,
    'leased',
  );
  if (job.status !== 'leased' && !transition.ok) return transition;

  return ok({
    ...job,
    status: 'leased',
    leaseOwner: input.owner,
    leaseExpiresAt: plusMillis(input.at, input.leaseMillis),
    attempts: job.attempts + 1,
    updatedAt: input.at,
  });
}

export function completeJob(job: OutboxJob, at: Instant): Result<OutboxJob> {
  const transition = outboxStateMachine.transition(job.status, 'succeeded');
  if (!transition.ok) return transition;
  return ok({
    ...job,
    status: 'succeeded',
    leaseOwner: null,
    leaseExpiresAt: null,
    updatedAt: at,
  });
}

/**
 * Backoff with deterministic jitter.
 *
 * The jitter factor is supplied by the caller (a seeded source in tests, a random source
 * in production) so the domain stays deterministic while retries still spread out.
 */
export function backoffMillis(attempts: number, jitterFactor: number): number {
  const clampedJitter = Math.min(Math.max(jitterFactor, 0), 1);
  const exponential = Math.min(BASE_BACKOFF_MILLIS * 2 ** Math.max(attempts - 1, 0), MAX_BACKOFF_MILLIS);
  return Math.round(exponential * (0.5 + clampedJitter * 0.5));
}

export type FailureClass = 'transient' | 'permanent' | 'poison';

/**
 * Record a failure.
 *
 * A permanent or poison failure dead-letters immediately: retrying a validation, policy or
 * compatibility failure can never succeed (docs/29 "Retry and dead-letter policy").
 */
export function failJob(
  job: OutboxJob,
  input: {
    readonly errorCode: string;
    readonly failureClass: FailureClass;
    readonly jitterFactor: number;
    readonly at: Instant;
  },
): Result<OutboxJob> {
  const transition = outboxStateMachine.transition(job.status, 'failed');
  if (!transition.ok) return transition;

  const exhausted = job.attempts >= job.maxAttempts;
  const terminal = input.failureClass !== 'transient' || exhausted;

  if (terminal) {
    return ok({
      ...job,
      status: 'dead_letter',
      leaseOwner: null,
      leaseExpiresAt: null,
      lastErrorCode: input.errorCode,
      updatedAt: input.at,
    });
  }

  return ok({
    ...job,
    status: 'pending',
    leaseOwner: null,
    leaseExpiresAt: null,
    lastErrorCode: input.errorCode,
    nextRunAt: plusMillis(input.at, backoffMillis(job.attempts, input.jitterFactor)),
    updatedAt: input.at,
  });
}

export function cancelJob(job: OutboxJob, at: Instant): Result<OutboxJob> {
  const transition = outboxStateMachine.transition(job.status, 'cancelled');
  if (!transition.ok) return transition;
  return ok({ ...job, status: 'cancelled', leaseOwner: null, leaseExpiresAt: null, updatedAt: at });
}

/** Queue age is the SLI for outbox freshness (docs/42, FIT-015). */
export function queueAgeMillis(job: OutboxJob, at: Instant): number {
  return Math.max(at.epochMillis - job.createdAt.epochMillis, 0);
}
