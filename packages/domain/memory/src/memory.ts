import {
  type AggregateVersion,
  INITIAL_VERSION,
  type Instant,
  type MemoryId,
  type OrganizationId,
  type ProjectId,
  type Result,
  type RevisionId,
  type TypedSubject,
  type UserId,
  type Versioned,
  checkExpectedVersion,
  fail,
  nextVersion,
  ok,
  subjectEquals,
} from '@shoo/domain-shared';
import {
  type AuthorityState,
  type AuthorityStatus,
  type ClaimStatus,
  type DurabilityStatus,
  type FreshnessStatus,
  type VerificationStatus,
  type VisibilityScope,
  authorityRank,
  authorityStateMachine,
  candidateState,
  checkOrthogonality,
  durabilityStateMachine,
  isAcceptedAuthority,
  isCurrentStateEligible,
  lineageStateMachine,
  verificationStateMachine,
  visibilityRank,
} from './authority.js';
import type { EvidenceSupport } from './evidence.js';
import { type SupersessionEdge, type SupersessionReason, addSupersessionEdge } from './supersession.js';

/**
 * Memory record aggregate (docs/36 `memory.memory_records` / `memory.memory_revisions`,
 * docs/30 "Memory layers").
 *
 * The layer progression observed → candidate → verified → accepted → canonical is not a
 * single enum: it is the combination of the claim, verification and authority axes, so a
 * record can be verified without being accepted and accepted without being canonical.
 *
 * Nothing here overwrites content. Every change is a new immutable revision plus an
 * explicit supersession edge.
 */

export const MEMORY_TYPES = [
  'fact',
  'decision',
  'task_state',
  'progress',
  'code_change',
  'test_result',
  'bug',
  'blocker',
  'risk',
  'convention',
  'question',
  'conflict_resolution',
  // schema-reserved; MVP services do not emit these (docs/30)
  'handoff',
  'dependency',
] as const;
export type MemoryType = (typeof MEMORY_TYPES)[number];

export const RESERVED_MEMORY_TYPES: ReadonlySet<MemoryType> = new Set<MemoryType>([
  'handoff',
  'dependency',
]);

export type MemoryContent = Readonly<Record<string, unknown>>;

export interface MemoryRevision {
  readonly id: RevisionId;
  readonly memoryId: MemoryId;
  readonly revision: number;
  readonly content: MemoryContent;
  readonly contentHash: string;
  readonly state: AuthorityState;
  readonly effectiveAt: Instant;
  readonly createdAt: Instant;
  readonly createdByUserId: UserId | null;
  readonly extractorVersion: string | null;
  readonly ruleVersion: string | null;
  readonly evidence: readonly EvidenceSupport[];
  readonly predecessorRevisionId: RevisionId | null;
}

export interface MemoryRecord extends Versioned {
  readonly id: MemoryId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly memoryType: MemoryType;
  readonly subject: TypedSubject;
  readonly currentRevisionId: RevisionId;
  readonly revisions: readonly MemoryRevision[];
  readonly supersessionEdges: readonly SupersessionEdge[];
  readonly createdAt: Instant;
  readonly updatedAt: Instant;
}

export function currentRevision(record: MemoryRecord): MemoryRevision {
  const found = record.revisions.find((revision) => revision.id === record.currentRevisionId);
  if (found === undefined) {
    // The aggregate is constructed only through these commands, which always keep the
    // pointer consistent. Reaching here means persistence returned a broken row.
    throw new Error(`memory ${record.id} has no revision ${record.currentRevisionId}`);
  }
  return found;
}

function revisionById(record: MemoryRecord, id: RevisionId): MemoryRevision | undefined {
  return record.revisions.find((revision) => revision.id === id);
}

// --- creation ---------------------------------------------------------------

export interface CreateCandidateInput {
  readonly memoryId: MemoryId;
  readonly revisionId: RevisionId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly memoryType: MemoryType;
  readonly subject: TypedSubject;
  readonly content: MemoryContent;
  readonly contentHash: string;
  readonly claim: ClaimStatus;
  readonly requestedVisibility: VisibilityScope;
  /** Ceiling the caller actually holds; the request is clamped, never widened. */
  readonly visibilityCeiling: VisibilityScope;
  readonly evidence: readonly EvidenceSupport[];
  readonly createdByUserId: UserId | null;
  readonly extractorVersion: string | null;
  readonly ruleVersion: string | null;
  readonly effectiveAt: Instant;
  readonly at: Instant;
}

/**
 * Create a candidate memory. Always unverified, never canonical, and never more visible
 * than the caller's ceiling (docs/38 `shoo.remember`).
 */
export function createCandidateMemory(input: CreateCandidateInput): Result<MemoryRecord> {
  if (RESERVED_MEMORY_TYPES.has(input.memoryType)) {
    return fail('NOT_ELIGIBLE', 'memory type is schema-reserved and not emitted in MVP', {
      memory_type: input.memoryType,
    });
  }
  if (input.contentHash.trim() === '') {
    return fail('INVALID_ARGUMENT', 'memory revision requires a content integrity hash');
  }
  if (Object.keys(input.content).length === 0) {
    return fail('INVALID_ARGUMENT', 'an empty claim is not converted into a memory');
  }

  const visibility =
    visibilityRank(input.requestedVisibility) <= visibilityRank(input.visibilityCeiling)
      ? input.requestedVisibility
      : input.visibilityCeiling;

  const state = candidateState({ claim: input.claim, visibility });
  const orthogonality = checkOrthogonality(state);
  if (!orthogonality.ok) return orthogonality;

  const revision: MemoryRevision = {
    id: input.revisionId,
    memoryId: input.memoryId,
    revision: 1,
    content: input.content,
    contentHash: input.contentHash,
    state,
    effectiveAt: input.effectiveAt,
    createdAt: input.at,
    createdByUserId: input.createdByUserId,
    extractorVersion: input.extractorVersion,
    ruleVersion: input.ruleVersion,
    evidence: input.evidence,
    predecessorRevisionId: null,
  };

  return ok({
    id: input.memoryId,
    organizationId: input.organizationId,
    projectId: input.projectId,
    memoryType: input.memoryType,
    subject: input.subject,
    currentRevisionId: revision.id,
    revisions: [revision],
    supersessionEdges: [],
    createdAt: input.at,
    updatedAt: input.at,
    version: INITIAL_VERSION,
  });
}

// --- axis transitions on the current revision -------------------------------

function replaceRevision(
  record: MemoryRecord,
  updated: MemoryRevision,
  at: Instant,
): MemoryRecord {
  return {
    ...record,
    revisions: record.revisions.map((revision) =>
      revision.id === updated.id ? updated : revision,
    ),
    updatedAt: at,
    version: nextVersion(record.version),
  };
}

export function changeVerification(
  record: MemoryRecord,
  input: {
    readonly revisionId: RevisionId;
    readonly verification: VerificationStatus;
    readonly expectedVersion: AggregateVersion;
    readonly at: Instant;
  },
): Result<MemoryRecord> {
  const versionCheck = checkExpectedVersion(record.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  const revision = revisionById(record, input.revisionId);
  if (revision === undefined) {
    return fail('INVALID_ARGUMENT', 'revision does not belong to this memory');
  }
  const transition = verificationStateMachine.transition(
    revision.state.verification,
    input.verification,
  );
  if (!transition.ok) return transition;

  const state: AuthorityState = { ...revision.state, verification: input.verification };
  const orthogonality = checkOrthogonality(state);
  if (!orthogonality.ok) return orthogonality;

  return ok(replaceRevision(record, { ...revision, state }, input.at));
}

export interface AcceptInput {
  readonly revisionId: RevisionId;
  readonly requestedAuthority: AuthorityStatus;
  /** Highest authority the accepting actor may confer. */
  readonly actorAuthorityCeiling: AuthorityStatus;
  readonly expectedVersion: AggregateVersion;
  readonly at: Instant;
}

/**
 * Accept a revision within the actor's scope (docs/37 `:accept`).
 *
 * Accepting raises the authority axis only. It does not verify the claim, change
 * visibility, or make the record durable.
 */
export function acceptRevision(record: MemoryRecord, input: AcceptInput): Result<MemoryRecord> {
  const versionCheck = checkExpectedVersion(record.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  if (input.requestedAuthority === 'canonical') {
    return fail(
      'AUTHORITY_REQUIRED',
      'canonical authority is granted by markCanonical, not by accept',
    );
  }
  if (!isAcceptedAuthority(input.requestedAuthority)) {
    return fail('INVALID_ARGUMENT', 'accept must request branch or team authority', {
      requested: input.requestedAuthority,
    });
  }

  const revision = revisionById(record, input.revisionId);
  if (revision === undefined) {
    return fail('INVALID_ARGUMENT', 'revision does not belong to this memory');
  }

  if (authorityRank(input.requestedAuthority) > authorityRank(input.actorAuthorityCeiling)) {
    return fail('AUTHORITY_REQUIRED', 'requested authority exceeds the actor authority ceiling', {
      requested: input.requestedAuthority,
      ceiling: input.actorAuthorityCeiling,
    });
  }

  const transition = authorityStateMachine.transition(
    revision.state.authority,
    input.requestedAuthority,
  );
  if (!transition.ok) return transition;

  const state: AuthorityState = { ...revision.state, authority: input.requestedAuthority };
  const orthogonality = checkOrthogonality(state);
  if (!orthogonality.ok) return orthogonality;

  return ok(replaceRevision(record, { ...revision, state }, input.at));
}

export interface MarkCanonicalInput {
  readonly revisionId: RevisionId;
  readonly expectedVersion: AggregateVersion;
  /**
   * The currently active canonical revision for this typed subject and scope, if any.
   * Passing it is how the "one active canonical revision" invariant is enforced without
   * the domain reaching into persistence.
   */
  readonly existingCanonicalRevisionId: RevisionId | null;
  /** True when an approved preview explicitly resolves the existing canonical value. */
  readonly previewResolvesExisting: boolean;
  readonly at: Instant;
}

/**
 * Mark a revision canonical (docs/36 "One active canonical revision").
 *
 * A concurrent accepted candidate creates a conflict rather than replacing by time. This
 * function refuses the promotion and the caller raises the conflict; it never silently
 * demotes the incumbent.
 */
export function markCanonical(
  record: MemoryRecord,
  input: MarkCanonicalInput,
): Result<MemoryRecord> {
  const versionCheck = checkExpectedVersion(record.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  const revision = revisionById(record, input.revisionId);
  if (revision === undefined) {
    return fail('INVALID_ARGUMENT', 'revision does not belong to this memory');
  }
  if (revision.state.verification === 'unverified') {
    return fail('EVIDENCE_REQUIRED', 'an unverified revision cannot become canonical');
  }
  if (revision.state.verification === 'disputed') {
    return fail('CONFLICT_ACTIVE', 'a disputed revision cannot become canonical');
  }
  if (revision.evidence.length === 0) {
    return fail('EVIDENCE_REQUIRED', 'canonical truth requires at least one supporting evidence');
  }
  if (
    input.existingCanonicalRevisionId !== null &&
    input.existingCanonicalRevisionId !== input.revisionId &&
    !input.previewResolvesExisting
  ) {
    return fail(
      'CONFLICT_ACTIVE',
      'another active canonical revision exists for this subject and scope',
      { existing_revision_id: input.existingCanonicalRevisionId },
    );
  }

  const transition = authorityStateMachine.transition(revision.state.authority, 'canonical');
  if (!transition.ok) return transition;

  const state: AuthorityState = { ...revision.state, authority: 'canonical' };
  const orthogonality = checkOrthogonality(state);
  if (!orthogonality.ok) return orthogonality;

  return ok(replaceRevision(record, { ...revision, state }, input.at));
}

/**
 * Restriction: narrow the visibility of a revision. Visibility can always be reduced;
 * widening requires the caller's ceiling and is rejected here when it exceeds it.
 */
export function restrictVisibility(
  record: MemoryRecord,
  input: {
    readonly revisionId: RevisionId;
    readonly visibility: VisibilityScope;
    readonly visibilityCeiling: VisibilityScope;
    readonly expectedVersion: AggregateVersion;
    readonly at: Instant;
  },
): Result<MemoryRecord> {
  const versionCheck = checkExpectedVersion(record.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  const revision = revisionById(record, input.revisionId);
  if (revision === undefined) {
    return fail('INVALID_ARGUMENT', 'revision does not belong to this memory');
  }
  const widening = visibilityRank(input.visibility) > visibilityRank(revision.state.visibility);
  if (widening && visibilityRank(input.visibility) > visibilityRank(input.visibilityCeiling)) {
    return fail('SCOPE_VIOLATION', 'requested visibility exceeds the caller ceiling', {
      requested: input.visibility,
      ceiling: input.visibilityCeiling,
    });
  }

  const state: AuthorityState = { ...revision.state, visibility: input.visibility };
  const orthogonality = checkOrthogonality(state);
  if (!orthogonality.ok) return orthogonality;

  return ok(replaceRevision(record, { ...revision, state }, input.at));
}

export function changeDurability(
  record: MemoryRecord,
  input: {
    readonly revisionId: RevisionId;
    readonly durability: DurabilityStatus;
    readonly expectedVersion: AggregateVersion;
    readonly at: Instant;
  },
): Result<MemoryRecord> {
  const versionCheck = checkExpectedVersion(record.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  const revision = revisionById(record, input.revisionId);
  if (revision === undefined) {
    return fail('INVALID_ARGUMENT', 'revision does not belong to this memory');
  }
  const transition = durabilityStateMachine.transition(
    revision.state.durability,
    input.durability,
  );
  if (!transition.ok) return transition;

  const state: AuthorityState = { ...revision.state, durability: input.durability };
  const orthogonality = checkOrthogonality(state);
  if (!orthogonality.ok) return orthogonality;

  return ok(replaceRevision(record, { ...revision, state }, input.at));
}

export function changeFreshness(
  record: MemoryRecord,
  input: {
    readonly revisionId: RevisionId;
    readonly freshness: FreshnessStatus;
    readonly expectedVersion: AggregateVersion;
    readonly at: Instant;
  },
): Result<MemoryRecord> {
  const versionCheck = checkExpectedVersion(record.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  const revision = revisionById(record, input.revisionId);
  if (revision === undefined) {
    return fail('INVALID_ARGUMENT', 'revision does not belong to this memory');
  }
  const state: AuthorityState = { ...revision.state, freshness: input.freshness };
  const orthogonality = checkOrthogonality(state);
  if (!orthogonality.ok) return orthogonality;

  return ok(replaceRevision(record, { ...revision, state }, input.at));
}

// --- correction and supersession -------------------------------------------

export type CorrectionType = 'content' | 'scope' | 'subject' | 'retraction';

export interface CorrectInput {
  readonly successorRevisionId: RevisionId;
  readonly predecessorRevisionId: RevisionId;
  readonly correctionType: CorrectionType;
  readonly content: MemoryContent;
  readonly contentHash: string;
  readonly reason: string;
  readonly evidence: readonly EvidenceSupport[];
  readonly actorUserId: UserId | null;
  readonly expectedVersion: AggregateVersion;
  readonly effectiveAt: Instant;
  readonly at: Instant;
}

/**
 * Correct a memory: create a successor revision, add a supersession edge and demote the
 * predecessor to historical (docs/29 "Correction creates a new revision and supersession
 * edge; it does not rewrite evidence").
 *
 * A user correction always produces a new revision. It never edits the predecessor.
 */
export function correctMemory(record: MemoryRecord, input: CorrectInput): Result<MemoryRecord> {
  return supersedeInternal(record, {
    successorRevisionId: input.successorRevisionId,
    predecessorRevisionId: input.predecessorRevisionId,
    content: input.content,
    contentHash: input.contentHash,
    reason: input.reason,
    supersessionReason: input.correctionType === 'retraction' ? 'retraction' : 'correction',
    evidence: input.evidence,
    actorUserId: input.actorUserId,
    expectedVersion: input.expectedVersion,
    effectiveAt: input.effectiveAt,
    at: input.at,
    /** A retraction leaves nothing active; other corrections carry the state forward. */
    retract: input.correctionType === 'retraction',
  });
}

export interface SupersedeInput {
  readonly successorRevisionId: RevisionId;
  readonly predecessorRevisionId: RevisionId;
  readonly content: MemoryContent;
  readonly contentHash: string;
  readonly reason: string;
  readonly evidence: readonly EvidenceSupport[];
  readonly actorUserId: UserId | null;
  readonly expectedVersion: AggregateVersion;
  readonly effectiveAt: Instant;
  readonly at: Instant;
}

/** Explicit lineage mutation (docs/37 `:supersede`, docs/38 `shoo.supersede_memory`). */
export function supersedeMemory(
  record: MemoryRecord,
  input: SupersedeInput,
): Result<MemoryRecord> {
  return supersedeInternal(record, {
    ...input,
    supersessionReason: 'supersession',
    retract: false,
  });
}

function supersedeInternal(
  record: MemoryRecord,
  input: SupersedeInput & {
    readonly supersessionReason: SupersessionReason;
    readonly retract: boolean;
  },
): Result<MemoryRecord> {
  const versionCheck = checkExpectedVersion(record.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;

  const predecessor = revisionById(record, input.predecessorRevisionId);
  if (predecessor === undefined) {
    return fail('INVALID_ARGUMENT', 'predecessor revision does not belong to this memory');
  }
  if (predecessor.state.lineage === 'superseded' || predecessor.state.lineage === 'deprecated') {
    return fail('LINEAGE_VIOLATION', 'predecessor revision is already closed', {
      lineage: predecessor.state.lineage,
    });
  }
  if (input.reason.trim() === '') {
    return fail('INVALID_ARGUMENT', 'supersession requires a reason');
  }
  if (input.contentHash.trim() === '') {
    return fail('INVALID_ARGUMENT', 'successor revision requires a content integrity hash');
  }
  if (revisionById(record, input.successorRevisionId) !== undefined) {
    return fail('INVALID_ARGUMENT', 'successor revision id already exists on this memory');
  }

  const edges = addSupersessionEdge(record.supersessionEdges, {
    predecessorRevisionId: input.predecessorRevisionId,
    successorRevisionId: input.successorRevisionId,
    reason: input.supersessionReason,
    actorUserId: input.actorUserId,
    createdAt: input.at,
  });
  if (!edges.ok) return edges;

  /**
   * The successor inherits verification and visibility but never authority: replacing a
   * canonical value requires its own explicit canonical decision (docs/30 "do not
   * auto-supersede high-impact decision").
   */
  const successorState: AuthorityState = {
    claim: predecessor.state.claim,
    verification: input.evidence.length > 0 ? predecessor.state.verification : 'unverified',
    authority: 'session',
    visibility: predecessor.state.visibility,
    durability: 'operational',
    freshness: 'current',
    lineage: 'active',
  };
  const successorOrthogonality = checkOrthogonality(successorState);
  if (!successorOrthogonality.ok) return successorOrthogonality;

  const closedPredecessorState: AuthorityState = {
    ...predecessor.state,
    authority: 'historical',
    lineage: 'superseded',
  };
  const predecessorLineage = lineageStateMachine.transition(
    predecessor.state.lineage,
    'superseded',
  );
  if (!predecessorLineage.ok) return predecessorLineage;
  const predecessorOrthogonality = checkOrthogonality(closedPredecessorState);
  if (!predecessorOrthogonality.ok) return predecessorOrthogonality;

  const successor: MemoryRevision = {
    id: input.successorRevisionId,
    memoryId: record.id,
    revision: predecessor.revision + 1,
    content: input.content,
    contentHash: input.contentHash,
    state: successorState,
    effectiveAt: input.effectiveAt,
    createdAt: input.at,
    createdByUserId: input.actorUserId,
    extractorVersion: null,
    ruleVersion: null,
    evidence: input.evidence,
    predecessorRevisionId: predecessor.id,
  };

  const revisions = record.revisions
    .map((revision) =>
      revision.id === predecessor.id ? { ...revision, state: closedPredecessorState } : revision,
    )
    .concat(successor);

  return ok({
    ...record,
    revisions,
    supersessionEdges: edges.value,
    /**
     * A retraction leaves no current revision pointing at new content: the pointer stays
     * on the successor (the retraction record itself), so lineage remains queryable.
     */
    currentRevisionId: successor.id,
    updatedAt: input.at,
    version: nextVersion(record.version),
  });
}

export function markConflicted(
  record: MemoryRecord,
  input: { readonly revisionId: RevisionId; readonly expectedVersion: AggregateVersion; readonly at: Instant },
): Result<MemoryRecord> {
  const versionCheck = checkExpectedVersion(record.version, input.expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  const revision = revisionById(record, input.revisionId);
  if (revision === undefined) {
    return fail('INVALID_ARGUMENT', 'revision does not belong to this memory');
  }
  const transition = lineageStateMachine.transition(revision.state.lineage, 'conflicted');
  if (!transition.ok) return transition;
  return ok(
    replaceRevision(
      record,
      { ...revision, state: { ...revision.state, lineage: 'conflicted' } },
      input.at,
    ),
  );
}

/** Whether this record may answer a `current` intent for the given subject. */
export function isCurrentTruthFor(record: MemoryRecord, subject: TypedSubject): boolean {
  if (!subjectEquals(record.subject, subject)) return false;
  return isCurrentStateEligible(currentRevision(record).state);
}
