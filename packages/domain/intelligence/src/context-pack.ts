import {
  type ContextPackId,
  type Instant,
  type ProjectId,
  type Result,
  type RetrievalRequestId,
  type RevisionId,
  type WorkUnitId,
  fail,
  ok,
} from '@shoo/domain-shared';

/**
 * Context pack and its manifest (docs/30 "Context pack contract").
 *
 * Packs are immutable and content-addressed. A later correction produces a *new* pack and
 * invalidates the previous one — packs are never edited in place.
 */

export const CONTEXT_PACK_SECTIONS = [
  'identity',
  'objective_and_state',
  'verified_progress',
  'decisions_and_constraints',
  'tests',
  'unresolved',
  'recommended_next_action',
  'citations',
  'indicators',
  'manifest',
] as const;
export type ContextPackSection = (typeof CONTEXT_PACK_SECTIONS)[number];

/**
 * Sections the token budget may never drop, because removing them makes continuation
 * unsafe (docs/30 "token budget cannot remove the objective, next action, or conflict
 * notice required for safe continuation").
 */
export const NON_DROPPABLE_SECTIONS: ReadonlySet<ContextPackSection> = new Set<ContextPackSection>(
  ['identity', 'objective_and_state', 'unresolved', 'recommended_next_action', 'manifest'],
);

export type Completeness = 'complete' | 'partial' | 'unknown';
export type Freshness = 'current' | 'stale' | 'partial' | 'unknown';

/** Versioned explanation of how a pack was produced. */
export interface RetrievalManifest {
  readonly resolverVersion: string;
  readonly rankerVersion: string;
  readonly indexWatermark: Instant;
  readonly filtersApplied: readonly string[];
  readonly candidateCount: number;
  readonly selectedCount: number;
}

export interface ContextPackItem {
  readonly revisionId: RevisionId;
  readonly rank: number;
  readonly score: number;
  readonly scoreFeatures: Readonly<Record<string, number>>;
  readonly tokenAllocation: number;
  readonly section: ContextPackSection;
  readonly citationCount: number;
}

export interface ContextPack {
  readonly id: ContextPackId;
  readonly requestId: RetrievalRequestId;
  readonly projectId: ProjectId;
  readonly workUnitId: WorkUnitId | null;
  /** Identity is content-addressed: the same inputs produce the same hash. */
  readonly contentHash: string;
  readonly tokenBudget: number;
  readonly tokenUsed: number;
  readonly items: readonly ContextPackItem[];
  readonly presentSections: readonly ContextPackSection[];
  readonly completeness: Completeness;
  readonly freshness: Freshness;
  readonly degradedReasons: readonly string[];
  readonly manifest: RetrievalManifest;
  readonly createdAt: Instant;
  readonly invalidatedAt: Instant | null;
}

export interface ComposePackInput {
  readonly id: ContextPackId;
  readonly requestId: RetrievalRequestId;
  readonly projectId: ProjectId;
  readonly workUnitId: WorkUnitId | null;
  readonly contentHash: string;
  readonly tokenBudget: number;
  readonly items: readonly ContextPackItem[];
  readonly presentSections: readonly ContextPackSection[];
  readonly completeness: Completeness;
  readonly freshness: Freshness;
  readonly degradedReasons: readonly string[];
  readonly manifest: RetrievalManifest;
  readonly at: Instant;
}

export function composeContextPack(input: ComposePackInput): Result<ContextPack> {
  if (input.tokenBudget <= 0) {
    return fail('INVALID_ARGUMENT', 'token budget must be positive');
  }
  if (input.contentHash.trim() === '') {
    return fail('INVALID_ARGUMENT', 'a context pack requires a content hash');
  }

  const present = new Set(input.presentSections);
  for (const required of NON_DROPPABLE_SECTIONS) {
    if (!present.has(required)) {
      return fail(
        'INVARIANT_VIOLATION',
        'the token budget may not drop a section required for safe continuation',
        { missing_section: required },
      );
    }
  }

  const tokenUsed = input.items.reduce((total, item) => total + item.tokenAllocation, 0);
  if (tokenUsed > input.tokenBudget) {
    return fail('INVARIANT_VIOLATION', 'composed pack exceeds its token budget', {
      token_used: tokenUsed,
      token_budget: input.tokenBudget,
    });
  }

  /** A fact without a citation cannot be emitted (docs/30 "Ranking contract"). */
  const uncited = input.items.filter(
    (item) => item.section === 'decisions_and_constraints' && item.citationCount === 0,
  );
  if (uncited.length > 0) {
    return fail('EVIDENCE_REQUIRED', 'a pack item asserting fact requires at least one citation', {
      uncited_items: uncited.length,
    });
  }

  const ranks = input.items.map((item) => item.rank);
  if (new Set(ranks).size !== ranks.length) {
    return fail('INVARIANT_VIOLATION', 'pack item ranks must be unique');
  }

  return ok({
    id: input.id,
    requestId: input.requestId,
    projectId: input.projectId,
    workUnitId: input.workUnitId,
    contentHash: input.contentHash,
    tokenBudget: input.tokenBudget,
    tokenUsed,
    items: [...input.items].sort((a, b) => a.rank - b.rank),
    presentSections: input.presentSections,
    completeness: input.completeness,
    freshness: input.freshness,
    degradedReasons: input.degradedReasons,
    manifest: input.manifest,
    createdAt: input.at,
    invalidatedAt: null,
  });
}

/**
 * Invalidate a pack after a correction, supersession, conflict resolution or permission
 * change. Invalidation is recorded, not destructive: the pack stays addressable for audit.
 */
export function invalidatePack(pack: ContextPack, at: Instant): ContextPack {
  if (pack.invalidatedAt !== null) return pack;
  return { ...pack, invalidatedAt: at };
}

export function isPackUsable(pack: ContextPack, at: Instant): boolean {
  if (pack.invalidatedAt === null) return true;
  return pack.invalidatedAt.epochMillis > at.epochMillis;
}

/**
 * The server may lower a requested budget but can never silently broaden scope
 * (docs/37 "The server may lower budget but cannot silently broaden scope").
 */
export function effectiveTokenBudget(requested: number, serverMaximum: number): number {
  return Math.min(requested, serverMaximum);
}
