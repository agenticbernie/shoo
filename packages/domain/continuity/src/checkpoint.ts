import {
  type CheckpointId,
  type EvidenceId,
  fail,
  type Instant,
  ok,
  type ProjectId,
  type Result,
  type SessionId,
  type WorkUnitId,
} from '@shoo/domain-shared';

/**
 * Checkpoint entity (docs/36 `continuity.checkpoints`, docs/38 `shoo.checkpoint_session`).
 *
 * Checkpoint revisions are immutable: a corrected checkpoint is a new revision of the same
 * checkpoint identity, and the identity is derived from the session plus the trigger
 * idempotency key so a duplicate trigger produces the same checkpoint, not a second one.
 *
 * Empty claims are never converted into facts. `buildCheckpoint` records what was omitted
 * and why instead of silently dropping it.
 */

export const CHECKPOINT_REASONS = [
  'explicit',
  'pre_compaction',
  'stop',
  'blocker',
  'test_transition',
  'recovery',
] as const;
export type CheckpointReason = (typeof CHECKPOINT_REASONS)[number];

export type TestOutcome = 'passed' | 'failed' | 'skipped' | 'unknown';

export interface TestObservation {
  readonly name: string;
  readonly outcome: TestOutcome;
  readonly detail: string | null;
}

export type OmissionReason = 'unverified' | 'policy_denied' | 'empty_claim' | 'over_budget';

export interface OmittedField {
  readonly field: string;
  readonly reason: OmissionReason;
}

export type Completeness = 'complete' | 'partial' | 'unknown';

export interface Checkpoint {
  readonly id: CheckpointId;
  readonly projectId: ProjectId;
  readonly workUnitId: WorkUnitId;
  readonly sessionId: SessionId;
  /** Immutable revision number within the checkpoint identity. */
  readonly revision: number;
  readonly reason: CheckpointReason;
  readonly triggerIdempotencyKey: string;
  readonly objective: string | null;
  readonly progress: readonly string[];
  readonly partialChanges: readonly string[];
  readonly tests: readonly TestObservation[];
  readonly blockers: readonly string[];
  readonly uncertainty: readonly string[];
  readonly nextAction: string | null;
  readonly evidenceIds: readonly EvidenceId[];
  readonly completeness: Completeness;
  readonly omittedFields: readonly OmittedField[];
  readonly createdAt: Instant;
}

export interface BuildCheckpointInput {
  readonly id: CheckpointId;
  readonly projectId: ProjectId;
  readonly workUnitId: WorkUnitId;
  readonly sessionId: SessionId;
  readonly revision: number;
  readonly reason: CheckpointReason;
  readonly triggerIdempotencyKey: string;
  readonly objective: string | null;
  readonly progress: readonly string[];
  readonly partialChanges: readonly string[];
  readonly tests: readonly TestObservation[];
  readonly blockers: readonly string[];
  readonly uncertainty: readonly string[];
  readonly nextAction: string | null;
  readonly evidenceIds: readonly EvidenceId[];
  /** Capture health at checkpoint time; a degraded capture cannot yield `complete`. */
  readonly captureDegraded: boolean;
  readonly at: Instant;
}

function isBlank(value: string): boolean {
  return value.trim() === '';
}

export function buildCheckpoint(input: BuildCheckpointInput): Result<Checkpoint> {
  if (input.revision < 1) {
    return fail('INVALID_ARGUMENT', 'checkpoint revision starts at 1');
  }
  if (isBlank(input.triggerIdempotencyKey)) {
    return fail('INVALID_ARGUMENT', 'checkpoint requires a trigger idempotency key');
  }

  const omitted: OmittedField[] = [];

  const objective = input.objective !== null && !isBlank(input.objective) ? input.objective : null;
  if (input.objective !== null && objective === null) {
    omitted.push({ field: 'objective', reason: 'empty_claim' });
  }

  const nextAction =
    input.nextAction !== null && !isBlank(input.nextAction) ? input.nextAction : null;
  if (input.nextAction !== null && nextAction === null) {
    omitted.push({ field: 'next_action', reason: 'empty_claim' });
  }

  const progress = input.progress.filter((entry) => !isBlank(entry));
  if (progress.length !== input.progress.length) {
    omitted.push({ field: 'progress', reason: 'empty_claim' });
  }

  const blockers = input.blockers.filter((entry) => !isBlank(entry));
  if (blockers.length !== input.blockers.length) {
    omitted.push({ field: 'blockers', reason: 'empty_claim' });
  }

  const uncertainty = input.uncertainty.filter((entry) => !isBlank(entry));
  if (uncertainty.length !== input.uncertainty.length) {
    omitted.push({ field: 'uncertainty', reason: 'empty_claim' });
  }

  /**
   * A claim with no evidence is not verified progress. It is kept as uncertainty rather
   * than promoted, so a checkpoint never manufactures verified state.
   */
  const hasEvidence = input.evidenceIds.length > 0;
  const verifiedProgress = hasEvidence ? progress : [];
  const carriedUncertainty = hasEvidence ? uncertainty : [...uncertainty, ...progress];
  if (!hasEvidence && progress.length > 0) {
    omitted.push({ field: 'progress', reason: 'unverified' });
  }

  const completeness: Completeness = input.captureDegraded
    ? 'partial'
    : hasEvidence && objective !== null
      ? 'complete'
      : 'partial';

  return ok({
    id: input.id,
    projectId: input.projectId,
    workUnitId: input.workUnitId,
    sessionId: input.sessionId,
    revision: input.revision,
    reason: input.reason,
    triggerIdempotencyKey: input.triggerIdempotencyKey,
    objective,
    progress: verifiedProgress,
    partialChanges: input.partialChanges,
    tests: input.tests,
    blockers,
    uncertainty: carriedUncertainty,
    nextAction,
    evidenceIds: input.evidenceIds,
    completeness,
    omittedFields: omitted,
    createdAt: input.at,
  });
}

/**
 * Identity key of a checkpoint: the same session and trigger key always denote the same
 * checkpoint (docs/36 "unique session/trigger idempotency key", docs/38 "duplicate trigger
 * produces the same checkpoint identity").
 */
export function checkpointIdentityKey(sessionId: SessionId, triggerIdempotencyKey: string): string {
  return `${sessionId}|${triggerIdempotencyKey}`;
}

/** A correction produces the next immutable revision; the previous revision is retained. */
export function nextCheckpointRevision(previous: Checkpoint): number {
  return previous.revision + 1;
}
