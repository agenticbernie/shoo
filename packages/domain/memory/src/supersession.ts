import { type Instant, type Result, type RevisionId, type UserId, fail, ok } from '@shoo/domain-shared';

/**
 * Supersession lineage (docs/36 `memory.supersession_edges`).
 *
 * Lineage is an acyclic graph of revisions. The invariants enforced here:
 *
 * - a revision never supersedes itself;
 * - adding an edge may not create a cycle (`acyclic lineage`);
 * - a predecessor has at most one active successor, so "current" is unambiguous;
 * - edges are append-only — history is never rewritten.
 */

export type SupersessionReason = 'correction' | 'supersession' | 'retraction' | 'conflict_resolution';

export interface SupersessionEdge {
  readonly predecessorRevisionId: RevisionId;
  readonly successorRevisionId: RevisionId;
  readonly reason: SupersessionReason;
  readonly actorUserId: UserId | null;
  readonly createdAt: Instant;
}

function wouldCreateCycle(
  edges: readonly SupersessionEdge[],
  predecessor: RevisionId,
  successor: RevisionId,
): boolean {
  // Walk forward from the proposed successor: if we can reach the predecessor, the new
  // edge closes a loop.
  const stack: RevisionId[] = [successor];
  const seen = new Set<RevisionId>();
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) break;
    if (current === predecessor) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const edge of edges) {
      if (edge.predecessorRevisionId === current) {
        stack.push(edge.successorRevisionId);
      }
    }
  }
  return false;
}

export function addSupersessionEdge(
  edges: readonly SupersessionEdge[],
  edge: SupersessionEdge,
): Result<readonly SupersessionEdge[]> {
  if (edge.predecessorRevisionId === edge.successorRevisionId) {
    return fail('LINEAGE_VIOLATION', 'a revision cannot supersede itself');
  }
  const duplicate = edges.some(
    (existing) =>
      existing.predecessorRevisionId === edge.predecessorRevisionId &&
      existing.successorRevisionId === edge.successorRevisionId,
  );
  if (duplicate) {
    return ok(edges);
  }
  const branching = edges.some(
    (existing) => existing.predecessorRevisionId === edge.predecessorRevisionId,
  );
  if (branching) {
    return fail(
      'LINEAGE_VIOLATION',
      'predecessor already has a successor; resolve the conflict instead of forking lineage',
      { predecessor_revision_id: edge.predecessorRevisionId },
    );
  }
  if (wouldCreateCycle(edges, edge.predecessorRevisionId, edge.successorRevisionId)) {
    return fail('LINEAGE_VIOLATION', 'supersession edge would create a lineage cycle');
  }
  return ok([...edges, edge]);
}

/** Follow the lineage forward to the head revision reachable from `revisionId`. */
export function resolveLineageHead(
  edges: readonly SupersessionEdge[],
  revisionId: RevisionId,
): RevisionId {
  let current = revisionId;
  const seen = new Set<RevisionId>([current]);
  for (;;) {
    const next = edges.find((edge) => edge.predecessorRevisionId === current);
    if (next === undefined) return current;
    if (seen.has(next.successorRevisionId)) return current;
    seen.add(next.successorRevisionId);
    current = next.successorRevisionId;
  }
}

/** Full ancestry of a revision, newest first, for history and rationale intents. */
export function lineageAncestry(
  edges: readonly SupersessionEdge[],
  revisionId: RevisionId,
): readonly RevisionId[] {
  const ancestry: RevisionId[] = [];
  let current: RevisionId | undefined = revisionId;
  const seen = new Set<RevisionId>();
  while (current !== undefined && !seen.has(current)) {
    seen.add(current);
    const parent = edges.find((edge) => edge.successorRevisionId === current);
    if (parent === undefined) break;
    ancestry.push(parent.predecessorRevisionId);
    current = parent.predecessorRevisionId;
  }
  return ancestry;
}

export function isSuperseded(
  edges: readonly SupersessionEdge[],
  revisionId: RevisionId,
): boolean {
  return edges.some((edge) => edge.predecessorRevisionId === revisionId);
}
