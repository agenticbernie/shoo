/**
 * Visibility scope value object.
 *
 * Visibility is orthogonal to authority: `visible = project` never implies
 * `authority = project`, and `canonical` never implies organization-wide visibility
 * (docs/36 "Orthogonal state checks", docs/33 "Authorization tests required").
 */

export const VISIBILITY_SCOPES = ['private', 'project', 'team', 'organization'] as const;
export type VisibilityScope = (typeof VISIBILITY_SCOPES)[number];

const VISIBILITY_RANK: Readonly<Record<VisibilityScope, number>> = Object.freeze({
  private: 0,
  project: 1,
  team: 2,
  organization: 3,
});

export function visibilityRank(scope: VisibilityScope): number {
  return VISIBILITY_RANK[scope];
}

/** True when `requested` is not broader than `ceiling`. */
export function withinVisibilityCeiling(
  requested: VisibilityScope,
  ceiling: VisibilityScope,
): boolean {
  return VISIBILITY_RANK[requested] <= VISIBILITY_RANK[ceiling];
}

/** Clamp a requested visibility down to the ceiling the caller actually holds. */
export function clampVisibility(
  requested: VisibilityScope,
  ceiling: VisibilityScope,
): VisibilityScope {
  return withinVisibilityCeiling(requested, ceiling) ? requested : ceiling;
}

/** The narrower of two ceilings — used when composing membership and grant ceilings. */
export function narrowestVisibility(a: VisibilityScope, b: VisibilityScope): VisibilityScope {
  return VISIBILITY_RANK[a] <= VISIBILITY_RANK[b] ? a : b;
}
