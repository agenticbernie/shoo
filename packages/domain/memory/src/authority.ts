import { type Result, fail, ok, stateMachine } from '@shoo/domain-shared';

/**
 * The authority model (docs/30 "Authority model", docs/36 "Orthogonal state checks").
 *
 * Six independent fields describe a revision. **No transition of one field implies a
 * transition of another.** This module owns the legal transitions of each axis *and* the
 * cross-axis rules that are explicitly forbidden — which are prohibitions, not
 * implications:
 *
 *   durable        does not imply canonical
 *   visible=project does not imply authority=project
 *   verified       does not imply freshness=current
 *   superseded     is never eligible as current state
 */

// --- claim ------------------------------------------------------------------

export const CLAIM_STATUSES = ['observed', 'inferred', 'claimed'] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

// --- verification -----------------------------------------------------------

export const VERIFICATION_STATUSES = [
  'unverified',
  'corroborated',
  'verified',
  'disputed',
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/**
 * Verification may move forward as evidence accumulates and may always fall to
 * `disputed` when contradicting evidence arrives. `disputed` can be re-examined, which is
 * why it is not terminal.
 */
export const verificationStateMachine = stateMachine<VerificationStatus>({
  name: 'verification status',
  initial: 'unverified',
  terminal: [],
  transitions: {
    unverified: ['corroborated', 'verified', 'disputed'],
    corroborated: ['verified', 'disputed', 'unverified'],
    verified: ['disputed', 'corroborated'],
    disputed: ['corroborated', 'verified', 'unverified'],
  },
});

// --- authority --------------------------------------------------------------

export const AUTHORITY_STATUSES = [
  'personal',
  'session',
  'branch',
  'team',
  'canonical',
  'historical',
] as const;
export type AuthorityStatus = (typeof AUTHORITY_STATUSES)[number];

/**
 * Authority is granted by explicit action, never by recency or agent confidence
 * (docs/29 "Never infers automatically: Canon from recency or agent confidence").
 *
 * `historical` is terminal: a revision demoted to history is superseded, and a new
 * revision — not a resurrection — is how truth changes again.
 */
export const authorityStateMachine = stateMachine<AuthorityStatus>({
  name: 'authority status',
  initial: 'session',
  terminal: ['historical'],
  transitions: {
    personal: ['session', 'branch', 'team', 'canonical', 'historical'],
    session: ['personal', 'branch', 'team', 'canonical', 'historical'],
    branch: ['team', 'canonical', 'historical'],
    team: ['canonical', 'historical'],
    canonical: ['historical'],
    historical: [],
  },
});

const AUTHORITY_RANK: Readonly<Record<AuthorityStatus, number>> = Object.freeze({
  historical: -1,
  personal: 0,
  session: 1,
  branch: 2,
  team: 3,
  canonical: 4,
});

export function authorityRank(status: AuthorityStatus): number {
  return AUTHORITY_RANK[status];
}

/** Accepted authority beats an agent claim regardless of recency (docs/30 resolver step 5). */
export function isAcceptedAuthority(status: AuthorityStatus): boolean {
  return status === 'branch' || status === 'team' || status === 'canonical';
}

// --- durability -------------------------------------------------------------

export const DURABILITY_STATUSES = [
  'local',
  'operational',
  'durable_pending',
  'durable',
  'durable_failed',
] as const;
export type DurabilityStatus = (typeof DURABILITY_STATUSES)[number];

export const durabilityStateMachine = stateMachine<DurabilityStatus>({
  name: 'durability status',
  initial: 'local',
  terminal: [],
  transitions: {
    local: ['operational'],
    operational: ['durable_pending'],
    durable_pending: ['durable', 'durable_failed'],
    durable: ['durable_pending'],
    durable_failed: ['durable_pending'],
  },
});

// --- freshness --------------------------------------------------------------

export const FRESHNESS_STATUSES = ['current', 'stale', 'expired', 'unknown'] as const;
export type FreshnessStatus = (typeof FRESHNESS_STATUSES)[number];

// --- lineage ----------------------------------------------------------------

export const LINEAGE_STATUSES = ['active', 'superseded', 'deprecated', 'conflicted'] as const;
export type LineageStatus = (typeof LINEAGE_STATUSES)[number];

/**
 * `superseded` and `deprecated` are terminal for a revision: lineage moves forward through
 * new revisions, never by reviving an old one.
 */
export const lineageStateMachine = stateMachine<LineageStatus>({
  name: 'lineage status',
  initial: 'active',
  terminal: ['superseded', 'deprecated'],
  transitions: {
    active: ['superseded', 'deprecated', 'conflicted'],
    conflicted: ['active', 'superseded', 'deprecated'],
    superseded: [],
    deprecated: [],
  },
});

// --- visibility -------------------------------------------------------------

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

// --- the composed state -----------------------------------------------------

export interface AuthorityState {
  readonly claim: ClaimStatus;
  readonly verification: VerificationStatus;
  readonly authority: AuthorityStatus;
  readonly visibility: VisibilityScope;
  readonly durability: DurabilityStatus;
  readonly freshness: FreshnessStatus;
  readonly lineage: LineageStatus;
}

/** The state every extracted or proposed candidate starts in. */
export function candidateState(input: {
  readonly claim: ClaimStatus;
  readonly visibility: VisibilityScope;
}): AuthorityState {
  return {
    claim: input.claim,
    verification: 'unverified',
    authority: 'session',
    visibility: input.visibility,
    durability: 'operational',
    freshness: 'current',
    lineage: 'active',
  };
}

export type OrthogonalityViolation =
  | 'durable_implies_canonical'
  | 'visibility_implies_authority'
  | 'verified_implies_current'
  | 'superseded_is_current_eligible'
  | 'canonical_requires_verification'
  | 'historical_requires_closed_lineage';

/**
 * Cross-axis integrity check (docs/36 "Orthogonal state checks").
 *
 * These are the checks the database constraints mirror. They are prohibitions: nothing
 * here *derives* one axis from another.
 */
export function checkOrthogonality(state: AuthorityState): Result<AuthorityState> {
  // A durable copy existing says nothing about authority. Only reject the *inference*:
  // a durable revision that was auto-promoted to canonical without accepted verification.
  if (
    state.durability === 'durable' &&
    state.authority === 'canonical' &&
    state.verification === 'unverified'
  ) {
    return fail('INVARIANT_VIOLATION', 'durability may not imply canonical authority', {
      violation: 'durable_implies_canonical' satisfies OrthogonalityViolation,
    });
  }

  // Canonical truth must have been verified or corroborated by something.
  if (state.authority === 'canonical' && state.verification === 'unverified') {
    return fail('AUTHORITY_REQUIRED', 'canonical authority requires a verified claim', {
      violation: 'canonical_requires_verification' satisfies OrthogonalityViolation,
    });
  }

  // Verification says nothing about freshness; a verified fact may still be stale. The
  // forbidden case is claiming `expired` while asserting the record is current truth.
  if (state.verification === 'verified' && state.freshness === 'expired' && state.lineage === 'active') {
    return fail('INVARIANT_VIOLATION', 'an expired revision cannot remain active current truth', {
      violation: 'verified_implies_current' satisfies OrthogonalityViolation,
    });
  }

  // A superseded revision is never current-state eligible.
  if (state.lineage === 'superseded' && state.authority !== 'historical') {
    return fail('LINEAGE_VIOLATION', 'a superseded revision must hold historical authority', {
      violation: 'superseded_is_current_eligible' satisfies OrthogonalityViolation,
    });
  }

  if (state.authority === 'historical' && state.lineage === 'active') {
    return fail('LINEAGE_VIOLATION', 'a historical revision cannot have active lineage', {
      violation: 'historical_requires_closed_lineage' satisfies OrthogonalityViolation,
    });
  }

  return ok(state);
}

/** Whether this state may be returned as present truth for a `current` intent. */
export function isCurrentStateEligible(state: AuthorityState): boolean {
  if (state.lineage !== 'active') return false;
  if (state.authority === 'historical') return false;
  if (state.freshness === 'expired') return false;
  return true;
}
