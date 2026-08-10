import {
  type DurableOperationId,
  fail,
  type Instant,
  isAfter,
  type OperationId,
  ok,
  type Result,
  type RevisionId,
  stateMachine,
} from '@shoo/domain-shared';

/**
 * Async operation handles and durable (MemWal/Walrus) operations
 * (docs/36 `platform.operations`, `platform.durable_operations`; docs/29 offline/sync).
 */

export const OPERATION_STATUSES = [
  'pending',
  'running',
  'succeeded',
  'failed',
  'cancelled',
  'expired',
] as const;
export type OperationStatus = (typeof OPERATION_STATUSES)[number];

export const operationStateMachine = stateMachine<OperationStatus>({
  name: 'operation',
  initial: 'pending',
  terminal: ['succeeded', 'failed', 'cancelled', 'expired'],
  transitions: {
    pending: ['running', 'cancelled', 'failed', 'expired'],
    running: ['succeeded', 'failed', 'cancelled', 'expired'],
    succeeded: [],
    failed: [],
    cancelled: [],
    expired: [],
  },
});

export interface Operation {
  readonly id: OperationId;
  readonly operationType: string;
  readonly status: OperationStatus;
  readonly progress: number | null;
  /** Safe metadata only; no project content travels through an operation handle. */
  readonly resultRef: string | null;
  readonly errorCode: string | null;
  readonly createdAt: Instant;
  readonly updatedAt: Instant;
  readonly expiresAt: Instant;
}

export function startOperation(input: {
  readonly id: OperationId;
  readonly operationType: string;
  readonly at: Instant;
  readonly expiresAt: Instant;
}): Operation {
  return {
    id: input.id,
    operationType: input.operationType,
    status: 'pending',
    progress: null,
    resultRef: null,
    errorCode: null,
    createdAt: input.at,
    updatedAt: input.at,
    expiresAt: input.expiresAt,
  };
}

export function advanceOperation(
  operation: Operation,
  input: {
    readonly status: OperationStatus;
    readonly progress?: number | null;
    readonly resultRef?: string | null;
    readonly errorCode?: string | null;
    readonly at: Instant;
  },
): Result<Operation> {
  const transition = operationStateMachine.transition(operation.status, input.status);
  if (!transition.ok) return transition;
  if (input.progress !== undefined && input.progress !== null) {
    if (input.progress < 0 || input.progress > 1) {
      return fail('INVALID_ARGUMENT', 'operation progress must be within [0, 1]');
    }
  }
  return ok({
    ...operation,
    status: input.status,
    progress: input.progress ?? operation.progress,
    resultRef: input.resultRef ?? operation.resultRef,
    errorCode: input.errorCode ?? operation.errorCode,
    updatedAt: input.at,
  });
}

/**
 * An expired handle does not delete the underlying domain result (docs/38 "Async operation
 * behavior"); it only stops being pollable.
 */
export function isOperationExpired(operation: Operation, at: Instant): boolean {
  return isAfter(at, operation.expiresAt);
}

/** Cancellation is best effort and cannot reverse an already submitted immutable blob. */
export function canCancel(operation: Operation): boolean {
  return operation.status === 'pending' || operation.status === 'running';
}

// --- durable operations -----------------------------------------------------

export const DURABLE_STATUSES = [
  'local',
  'operational',
  'durable_pending',
  'durable',
  'durable_failed',
] as const;
export type DurableStatus = (typeof DURABLE_STATUSES)[number];

export type TrustMode = 'manual' | 'managed';

export interface DurableOperation {
  readonly id: DurableOperationId;
  readonly revisionId: RevisionId;
  readonly namespaceBindingId: string;
  readonly trustMode: TrustMode;
  /** Unique per record/namespace/trust/schema tuple (docs/36). */
  readonly operationKey: string;
  readonly status: DurableStatus;
  readonly jobId: string | null;
  readonly blobLocator: string | null;
  readonly payloadHash: string | null;
  readonly localSchemaVersion: number;
  readonly remoteSchemaVersion: number | null;
  readonly attempts: number;
  readonly lastErrorCode: string | null;
  readonly requestedAt: Instant;
  readonly updatedAt: Instant;
}

export function requestDurablePersist(input: {
  readonly id: DurableOperationId;
  readonly revisionId: RevisionId;
  readonly namespaceBindingId: string;
  readonly trustMode: TrustMode;
  readonly operationKey: string;
  readonly payloadHash: string;
  readonly localSchemaVersion: number;
  readonly at: Instant;
}): Result<DurableOperation> {
  if (input.operationKey.trim() === '') {
    return fail('INVALID_ARGUMENT', 'durable operation requires a deterministic operation key');
  }
  return ok({
    id: input.id,
    revisionId: input.revisionId,
    namespaceBindingId: input.namespaceBindingId,
    trustMode: input.trustMode,
    operationKey: input.operationKey,
    status: 'durable_pending',
    jobId: null,
    blobLocator: null,
    payloadHash: input.payloadHash,
    localSchemaVersion: input.localSchemaVersion,
    remoteSchemaVersion: null,
    attempts: 0,
    lastErrorCode: null,
    requestedAt: input.at,
    updatedAt: input.at,
  });
}

export function markDurablePersisted(
  operation: DurableOperation,
  input: {
    readonly jobId: string;
    readonly blobLocator: string;
    readonly remoteSchemaVersion: number;
    readonly at: Instant;
  },
): Result<DurableOperation> {
  if (operation.status !== 'durable_pending' && operation.status !== 'durable_failed') {
    return fail('ILLEGAL_TRANSITION', 'only a pending or failed durable operation can persist', {
      status: operation.status,
    });
  }
  return ok({
    ...operation,
    status: 'durable',
    jobId: input.jobId,
    blobLocator: input.blobLocator,
    remoteSchemaVersion: input.remoteSchemaVersion,
    updatedAt: input.at,
  });
}

/**
 * Durable failure never invalidates operational truth (docs/38). The failure is recorded
 * and remains visible and retryable; nothing about the checkpoint is rolled back.
 */
export function markDurableFailed(
  operation: DurableOperation,
  input: {
    readonly errorCode: string;
    readonly terminal: boolean;
    readonly at: Instant;
  },
): Result<DurableOperation> {
  if (operation.status === 'durable') {
    return fail('ILLEGAL_TRANSITION', 'a persisted durable operation cannot be marked failed');
  }
  return ok({
    ...operation,
    status: 'durable_failed',
    attempts: operation.attempts + 1,
    lastErrorCode: input.errorCode,
    updatedAt: input.at,
  });
}

/**
 * Reconciliation queries the job/mapping before any idempotent replacement; a timed-out
 * accepted job is never blindly resubmitted (docs/29 "MemWal accepted job timeout").
 */
export function reconcileDurable(
  operation: DurableOperation,
  input: {
    readonly observedStatus: DurableStatus;
    readonly jobId: string | null;
    readonly blobLocator: string | null;
    readonly at: Instant;
  },
): Result<DurableOperation> {
  if (operation.status === 'durable' && input.observedStatus !== 'durable') {
    return fail(
      'INVARIANT_VIOLATION',
      'a persisted durable operation cannot be reconciled backwards',
      { observed: input.observedStatus },
    );
  }
  return ok({
    ...operation,
    status: input.observedStatus,
    jobId: input.jobId ?? operation.jobId,
    blobLocator: input.blobLocator ?? operation.blobLocator,
    updatedAt: input.at,
  });
}
