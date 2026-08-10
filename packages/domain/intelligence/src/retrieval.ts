import {
  type BranchScope,
  type Instant,
  type MemoryId,
  type ProjectId,
  type Result,
  type RetrievalRequestId,
  type RevisionId,
  type TypedSubject,
  type WorkUnitId,
  fail,
  ok,
} from '@shoo/domain-shared';
import type {
  AuthorityStatus,
  FreshnessStatus,
  LineageStatus,
  VerificationStatus,
  VisibilityScope,
} from '@shoo/domain-memory';

/**
 * Retrieval read model and ranking contract (docs/30 "Hybrid retrieval pipeline",
 * "Ranking contract").
 *
 * This module owns the *shape* of retrieval and its hard rules. Ranking weights are
 * configuration, benchmarked in Phase 9, and deliberately live outside the domain.
 */

export type RetrievalIntent = 'current' | 'history' | 'rationale' | 'occurrence' | 'resume';

export interface RetrievalRequest {
  readonly id: RetrievalRequestId;
  readonly projectId: ProjectId;
  readonly workUnitId: WorkUnitId | null;
  readonly intent: RetrievalIntent;
  readonly scope: BranchScope;
  readonly tokenBudget: number;
  readonly includeHistory: boolean;
  readonly resolverVersion: string;
  readonly rankerVersion: string;
  readonly indexWatermark: Instant;
  readonly requestedAt: Instant;
}

/**
 * Read-model row: everything ranking needs without touching the memory aggregate. Owned by
 * this context and rebuildable from the ledger (docs/29 "Rebuildable projections").
 */
export interface RetrievalCandidate {
  readonly memoryId: MemoryId;
  readonly revisionId: RevisionId;
  readonly subject: TypedSubject;
  readonly memoryType: string;
  readonly authority: AuthorityStatus;
  readonly verification: VerificationStatus;
  readonly visibility: VisibilityScope;
  readonly freshness: FreshnessStatus;
  readonly lineage: LineageStatus;
  readonly branchScope: string | null;
  readonly modulePaths: readonly string[];
  readonly workUnitId: WorkUnitId | null;
  readonly effectiveAt: Instant;
  readonly citationCount: number;
  readonly hasUnresolvedConflict: boolean;
  readonly permitted: boolean;
}

/** The normalized feature vector the versioned ranking function scores (docs/30). */
export interface RankingFeatures {
  readonly scopeMatch: number;
  readonly workMatch: number;
  readonly branchMatch: number;
  readonly dependencyProximity: number;
  readonly authority: number;
  readonly verification: number;
  readonly freshness: number;
  readonly semanticSimilarity: number;
  readonly lexicalMatch: number;
  readonly sourceQuality: number;
  readonly contradictionPenalty: number;
}

export const RANKING_FEATURE_NAMES = [
  'scopeMatch',
  'workMatch',
  'branchMatch',
  'dependencyProximity',
  'authority',
  'verification',
  'freshness',
  'semanticSimilarity',
  'lexicalMatch',
  'sourceQuality',
  'contradictionPenalty',
] as const satisfies readonly (keyof RankingFeatures)[];

export type HardRuleExclusion =
  | 'unauthorized'
  | 'superseded_for_current_intent'
  | 'missing_citation'
  | 'out_of_branch_scope'
  | 'reserved_memory_type';

export interface FilterOutcome {
  readonly candidate: RetrievalCandidate;
  readonly excludedBy: HardRuleExclusion | null;
  /** Conflicted candidates are represented as a conflict, never silently picked. */
  readonly representAsConflict: boolean;
}

/**
 * Mandatory pre-rank filters and hard rules (docs/30).
 *
 * Hard rules override score. Applying them before ranking is what makes "semantic
 * similarity can never override scope or supersession" structurally true rather than a
 * weighting choice.
 */
export function applyHardRules(
  candidate: RetrievalCandidate,
  request: RetrievalRequest,
): FilterOutcome {
  if (!candidate.permitted) {
    return { candidate, excludedBy: 'unauthorized', representAsConflict: false };
  }

  const currentStateIntent = request.intent === 'current' || request.intent === 'resume';

  if (currentStateIntent && (candidate.lineage === 'superseded' || candidate.lineage === 'deprecated')) {
    return { candidate, excludedBy: 'superseded_for_current_intent', representAsConflict: false };
  }

  if (currentStateIntent && candidate.freshness === 'expired') {
    return { candidate, excludedBy: 'superseded_for_current_intent', representAsConflict: false };
  }

  if (candidate.citationCount === 0 && candidate.memoryType !== 'question') {
    return { candidate, excludedBy: 'missing_citation', representAsConflict: false };
  }

  if (
    candidate.branchScope !== null &&
    request.scope.branch !== null &&
    candidate.branchScope !== request.scope.branch
  ) {
    return { candidate, excludedBy: 'out_of_branch_scope', representAsConflict: false };
  }

  if (candidate.memoryType === 'handoff' || candidate.memoryType === 'dependency') {
    return { candidate, excludedBy: 'reserved_memory_type', representAsConflict: false };
  }

  return {
    candidate,
    excludedBy: null,
    representAsConflict: candidate.hasUnresolvedConflict || candidate.lineage === 'conflicted',
  };
}

export interface FilteredCandidates {
  readonly eligible: readonly RetrievalCandidate[];
  readonly conflicted: readonly RetrievalCandidate[];
  readonly excluded: readonly FilterOutcome[];
  /** Candidate counts are safe metadata and belong in the manifest (docs/30). */
  readonly candidateCount: number;
}

export function filterCandidates(
  candidates: readonly RetrievalCandidate[],
  request: RetrievalRequest,
): FilteredCandidates {
  const eligible: RetrievalCandidate[] = [];
  const conflicted: RetrievalCandidate[] = [];
  const excluded: FilterOutcome[] = [];

  for (const candidate of candidates) {
    const outcome = applyHardRules(candidate, request);
    if (outcome.excludedBy !== null) {
      excluded.push(outcome);
      continue;
    }
    if (outcome.representAsConflict) {
      conflicted.push(candidate);
      continue;
    }
    eligible.push(candidate);
  }

  return { eligible, conflicted, excluded, candidateCount: candidates.length };
}

export type RankingWeights = Readonly<Record<keyof RankingFeatures, number>>;

/**
 * Versioned score: a weighted sum of normalized features. Weights are configuration and
 * the version travels in the pack manifest so a result can always be explained.
 */
export function score(features: RankingFeatures, weights: RankingWeights): number {
  let total = 0;
  for (const name of RANKING_FEATURE_NAMES) {
    total += features[name] * weights[name];
  }
  return total;
}

export function validateWeights(weights: RankingWeights): Result<RankingWeights> {
  for (const name of RANKING_FEATURE_NAMES) {
    const weight = weights[name];
    if (!Number.isFinite(weight)) {
      return fail('INVALID_ARGUMENT', 'ranking weights must be finite numbers', { feature: name });
    }
  }
  if (weights.contradictionPenalty > 0) {
    return fail('INVALID_ARGUMENT', 'the contradiction penalty weight must not be positive');
  }
  return ok(weights);
}
