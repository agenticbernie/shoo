import {
  filterCandidates,
  RANKING_FEATURE_NAMES,
  type RankingWeights,
  type RetrievalCandidate,
  type RetrievalRequest,
  score,
  validateWeights,
} from '@shoo/domain-intelligence';

/**
 * `@shoo/retrieval` — the versioned ranking configuration and merge/dedupe helpers that
 * sit around the domain's hard rules (docs/30 "Hybrid retrieval pipeline").
 *
 * Hard rules and the authority resolver live in `@shoo/domain-*`. This package owns the
 * parts that are configuration rather than architecture: initial weights, the manifest
 * version they belong to, and candidate merging across the lexical, semantic and
 * structured sources.
 */

export const RANKER_VERSION = '0.1.0' as const;
export const RESOLVER_VERSION = '0.1.0' as const;

/**
 * Initial weights. docs/30 is explicit that these are configuration to be benchmarked in
 * Phase 9, not architecture truth: changing them changes `RANKER_VERSION`, and the version
 * travels in every context pack manifest so a result stays explainable.
 */
export const INITIAL_RANKING_WEIGHTS: RankingWeights = Object.freeze({
  scopeMatch: 3,
  workMatch: 2.5,
  branchMatch: 2,
  dependencyProximity: 1,
  authority: 3,
  verification: 2,
  freshness: 1.5,
  semanticSimilarity: 1.5,
  lexicalMatch: 1,
  sourceQuality: 0.5,
  // Negative by contract: a contradiction can only ever lower a score.
  contradictionPenalty: -4,
});

export interface ScoredCandidate {
  readonly candidate: RetrievalCandidate;
  readonly score: number;
  readonly features: Readonly<Record<string, number>>;
}

/**
 * Merge candidates from several sources, keeping the highest-scoring occurrence of each
 * revision. The same revision arriving from lexical and semantic search is one candidate,
 * not two.
 */
export function mergeCandidates(
  sources: readonly (readonly RetrievalCandidate[])[],
): readonly RetrievalCandidate[] {
  const byRevision = new Map<string, RetrievalCandidate>();
  for (const source of sources) {
    for (const candidate of source) {
      if (!byRevision.has(candidate.revisionId)) {
        byRevision.set(candidate.revisionId, candidate);
      }
    }
  }
  return [...byRevision.values()];
}

/**
 * Rank eligible candidates.
 *
 * Hard rules run first through the domain's `filterCandidates`, so an excluded candidate
 * can never be reintroduced by a high score.
 */
export function rank(input: {
  readonly request: RetrievalRequest;
  readonly candidates: readonly RetrievalCandidate[];
  readonly features: (candidate: RetrievalCandidate) => Readonly<Record<string, number>>;
  readonly weights?: RankingWeights;
}): {
  readonly ranked: readonly ScoredCandidate[];
  readonly conflicted: readonly RetrievalCandidate[];
  readonly excludedCount: number;
} {
  const weights = input.weights ?? INITIAL_RANKING_WEIGHTS;
  const validated = validateWeights(weights);
  if (!validated.ok) {
    throw new Error(validated.error.message);
  }

  const filtered = filterCandidates(input.candidates, input.request);
  const ranked = filtered.eligible
    .map((candidate) => {
      const raw = input.features(candidate);
      const features = Object.fromEntries(
        RANKING_FEATURE_NAMES.map((name) => [name, raw[name] ?? 0]),
      ) as Record<(typeof RANKING_FEATURE_NAMES)[number], number>;
      return { candidate, score: score(features, weights), features };
    })
    .sort((a, b) => b.score - a.score);

  return {
    ranked,
    conflicted: filtered.conflicted,
    excludedCount: filtered.excluded.length,
  };
}

/**
 * Allocate the token budget over ranked items.
 *
 * The composer stops at the budget; it never drops a section the domain marks
 * non-droppable, which `composeContextPack` verifies afterwards.
 */
export function allocateTokens(input: {
  readonly ranked: readonly ScoredCandidate[];
  readonly budget: number;
  readonly costOf: (candidate: RetrievalCandidate) => number;
  readonly reservedTokens: number;
}): readonly {
  readonly candidate: RetrievalCandidate;
  readonly tokens: number;
}[] {
  let remaining = Math.max(input.budget - input.reservedTokens, 0);
  const allocated: { candidate: RetrievalCandidate; tokens: number }[] = [];
  for (const entry of input.ranked) {
    const cost = input.costOf(entry.candidate);
    if (cost > remaining) continue;
    allocated.push({ candidate: entry.candidate, tokens: cost });
    remaining -= cost;
  }
  return allocated;
}
