import {
  type BranchScope,
  type Instant,
  type RevisionId,
  type TypedSubject,
  branchScopeApplies,
  isAfter,
  subjectEquals,
} from '@shoo/domain-shared';
import { authorityRank, isAcceptedAuthority, isCurrentStateEligible } from './authority.js';
import { type MemoryRecord, type MemoryRevision, currentRevision } from './memory.js';
import { isSuperseded, resolveLineageHead } from './supersession.js';

/**
 * Canonical resolver (docs/30 "Canonical resolver").
 *
 * Deterministic, pure, and applied *before* any ranking: semantic similarity can never
 * override scope or supersession. The resolver order implemented here is exactly the
 * documented one:
 *
 *   1. enforce tenant/project/visibility permission
 *   2. select matching typed subject and applicable branch/scope
 *   3. remove revoked/deleted/ineligible records
 *   4. follow explicit supersession lineage
 *   5. prefer accepted authority over agent claim regardless of recency
 *   6. detect concurrent active authoritative values as conflict
 *   7. calculate freshness from source/change evidence
 *   8. emit current, conflicted, stale or unknown with reasons
 */

export type ResolutionOutcome = 'current' | 'conflicted' | 'stale' | 'unknown';

export interface ResolvedTruth {
  readonly outcome: ResolutionOutcome;
  readonly subject: TypedSubject;
  readonly revisionId: RevisionId | null;
  readonly memoryId: string | null;
  /** Every side of a detected conflict; empty unless `outcome === 'conflicted'`. */
  readonly conflictingRevisionIds: readonly RevisionId[];
  /** Machine-readable, content-safe explanation of how this outcome was reached. */
  readonly reasons: readonly string[];
}

export interface ResolveInput {
  readonly subject: TypedSubject;
  readonly requestedScope: BranchScope;
  readonly candidates: readonly MemoryRecord[];
  /** Ids the caller is permitted to read, computed by the authorization layer. */
  readonly permittedMemoryIds: ReadonlySet<string>;
  /** Records excluded by revocation, deletion or retention. */
  readonly ineligibleMemoryIds: ReadonlySet<string>;
  /** Evaluation time, used for the freshness pass. */
  readonly at: Instant;
  /** Revision is considered stale when it has been effective longer than this. */
  readonly stalenessMillis: number | null;
}

interface Considered {
  readonly record: MemoryRecord;
  readonly revision: MemoryRevision;
}

export function resolveCanonical(input: ResolveInput): ResolvedTruth {
  const reasons: string[] = [];

  // 1. permission
  const permitted = input.candidates.filter((record) => input.permittedMemoryIds.has(record.id));
  if (permitted.length !== input.candidates.length) {
    reasons.push('filtered:unauthorized');
  }

  // 2. typed subject and applicable branch/scope
  const subjectMatched = permitted.filter(
    (record) =>
      subjectEquals(record.subject, input.subject) ||
      (record.subject.subjectType === input.subject.subjectType &&
        record.subject.subjectKey === input.subject.subjectKey &&
        branchScopeApplies(
          { branch: record.subject.branchScope, worktreeId: null, modulePaths: [] },
          input.requestedScope,
        )),
  );
  if (subjectMatched.length === 0) {
    return {
      outcome: 'unknown',
      subject: input.subject,
      revisionId: null,
      memoryId: null,
      conflictingRevisionIds: [],
      reasons: [...reasons, 'no_record_for_subject_scope'],
    };
  }

  // 3. remove ineligible records
  const eligible = subjectMatched.filter((record) => !input.ineligibleMemoryIds.has(record.id));
  if (eligible.length !== subjectMatched.length) {
    reasons.push('filtered:ineligible');
  }
  if (eligible.length === 0) {
    return {
      outcome: 'unknown',
      subject: input.subject,
      revisionId: null,
      memoryId: null,
      conflictingRevisionIds: [],
      reasons: [...reasons, 'all_records_ineligible'],
    };
  }

  // 4. follow explicit supersession lineage, then drop anything not current-state eligible
  const considered: Considered[] = [];
  for (const record of eligible) {
    const head = resolveLineageHead(record.supersessionEdges, record.currentRevisionId);
    const revision = record.revisions.find((candidate) => candidate.id === head);
    if (revision === undefined) continue;
    if (isSuperseded(record.supersessionEdges, revision.id)) {
      reasons.push('filtered:superseded');
      continue;
    }
    if (!isCurrentStateEligible(revision.state)) {
      reasons.push('filtered:not_current_state_eligible');
      continue;
    }
    considered.push({ record, revision });
  }

  if (considered.length === 0) {
    return {
      outcome: 'unknown',
      subject: input.subject,
      revisionId: null,
      memoryId: null,
      conflictingRevisionIds: [],
      reasons: [...reasons, 'no_active_revision'],
    };
  }

  // 5. prefer accepted authority over agent claim, regardless of recency
  const accepted = considered.filter((entry) => isAcceptedAuthority(entry.revision.state.authority));
  const pool = accepted.length > 0 ? accepted : considered;
  if (accepted.length > 0 && accepted.length !== considered.length) {
    reasons.push('preferred:accepted_authority_over_claim');
  }

  const highestRank = Math.max(...pool.map((entry) => authorityRank(entry.revision.state.authority)));
  const topAuthority = pool.filter(
    (entry) => authorityRank(entry.revision.state.authority) === highestRank,
  );

  // 6. concurrent active authoritative values are a conflict, never a recency pick
  if (topAuthority.length > 1 && isAcceptedAuthority(topAuthority[0]?.revision.state.authority ?? 'session')) {
    const distinctContent = new Set(topAuthority.map((entry) => entry.revision.contentHash));
    if (distinctContent.size > 1) {
      return {
        outcome: 'conflicted',
        subject: input.subject,
        revisionId: null,
        memoryId: null,
        conflictingRevisionIds: topAuthority.map((entry) => entry.revision.id),
        reasons: [...reasons, 'multiple_active_authoritative_values'],
      };
    }
  }

  // Within one authority level, the most specific branch scope wins, then effective time.
  const winner = [...topAuthority].sort((a, b) => {
    const aSpecific = a.record.subject.branchScope === null ? 0 : 1;
    const bSpecific = b.record.subject.branchScope === null ? 0 : 1;
    if (aSpecific !== bSpecific) return bSpecific - aSpecific;
    return b.revision.effectiveAt.epochMillis - a.revision.effectiveAt.epochMillis;
  })[0];

  if (winner === undefined) {
    return {
      outcome: 'unknown',
      subject: input.subject,
      revisionId: null,
      memoryId: null,
      conflictingRevisionIds: [],
      reasons: [...reasons, 'no_resolvable_revision'],
    };
  }

  // 7. freshness
  const freshness = evaluateFreshness(winner.revision, input.at, input.stalenessMillis);
  if (freshness !== 'current') {
    reasons.push(`freshness:${freshness}`);
  }

  // 8. emit
  const outcome: ResolutionOutcome =
    freshness === 'current' ? 'current' : freshness === 'unknown' ? 'unknown' : 'stale';

  return {
    outcome,
    subject: input.subject,
    revisionId: winner.revision.id,
    memoryId: winner.record.id,
    conflictingRevisionIds: [],
    reasons,
  };
}

function evaluateFreshness(
  revision: MemoryRevision,
  at: Instant,
  stalenessMillis: number | null,
): 'current' | 'stale' | 'expired' | 'unknown' {
  if (revision.state.freshness !== 'current') return revision.state.freshness;
  if (stalenessMillis === null) return 'current';
  const age = at.epochMillis - revision.effectiveAt.epochMillis;
  if (isAfter(revision.effectiveAt, at)) {
    // A revision effective in the future is not yet truth.
    return 'unknown';
  }
  return age > stalenessMillis ? 'stale' : 'current';
}

/** Convenience: current revision of a record after lineage is followed. */
export function headRevision(record: MemoryRecord): MemoryRevision {
  const head = resolveLineageHead(record.supersessionEdges, record.currentRevisionId);
  return record.revisions.find((revision) => revision.id === head) ?? currentRevision(record);
}
