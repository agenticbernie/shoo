import { type Instant, type Result, type UserId, fail, isAfter, ok } from '@shoo/domain-shared';

/**
 * Feature flags (docs/65 "Feature-flag policy").
 *
 * Every flag has an owner, a default, an expiry and a removal story — enforced here rather
 * than left to convention. Crucially, a flag can never disable RLS, authorization,
 * citations, provenance, privacy controls or trust-mode consent, so those capability names
 * are refused at construction time.
 */

export type FlagType = 'release' | 'kill_switch' | 'compatibility' | 'experiment';

/** Capabilities no flag may ever gate. */
export const PROTECTED_CAPABILITIES = [
  'rls',
  'row_level_security',
  'authorization',
  'authz',
  'citations',
  'provenance',
  'privacy',
  'privacy_controls',
  'trust_mode_consent',
  'consent',
  'audit',
] as const;
export type ProtectedCapability = (typeof PROTECTED_CAPABILITIES)[number];

export interface FeatureFlag {
  readonly key: string;
  readonly type: FlagType;
  readonly ownerUserId: UserId;
  readonly defaultEnabled: boolean;
  readonly expiresAt: Instant;
  readonly removalStory: string;
  readonly description: string;
}

function mentionsProtectedCapability(value: string): ProtectedCapability | null {
  const normalized = value.toLowerCase();
  for (const capability of PROTECTED_CAPABILITIES) {
    if (normalized.includes(capability)) return capability;
  }
  return null;
}

export function defineFlag(input: FeatureFlag): Result<FeatureFlag> {
  if (!/^[a-z][a-z0-9_.]{2,80}$/.test(input.key)) {
    return fail('INVALID_ARGUMENT', 'flag key must be a lowercase dotted identifier');
  }
  const protectedCapability = mentionsProtectedCapability(input.key);
  if (protectedCapability !== null) {
    return fail('POLICY_DENIED', 'a flag may not gate a protected capability', {
      capability: protectedCapability,
    });
  }
  if (input.removalStory.trim() === '') {
    return fail('INVALID_ARGUMENT', 'every flag requires a removal story');
  }
  return ok(input);
}

export function isFlagExpired(flag: FeatureFlag, at: Instant): boolean {
  return isAfter(at, flag.expiresAt);
}

/**
 * An expired flag falls back to its default rather than silently continuing to override
 * behaviour, so a forgotten flag cannot quietly become permanent configuration.
 */
export function resolveFlag(
  flag: FeatureFlag,
  input: { readonly override: boolean | null; readonly at: Instant },
): boolean {
  if (isFlagExpired(flag, input.at)) return flag.defaultEnabled;
  return input.override ?? flag.defaultEnabled;
}

// --- compatibility ----------------------------------------------------------

export type CompatibilityComponent = 'shoo_local' | 'shoo_api' | 'shoo_worker' | 'memwal_sdk';
export type CompatibilityResult = 'compatible' | 'upgrade_recommended' | 'blocked';

export interface CompatibilityRecord {
  readonly component: CompatibilityComponent;
  readonly localVersion: number;
  readonly remoteVersion: number;
  readonly minSupported: number;
  readonly maxSupported: number;
  readonly result: CompatibilityResult;
  readonly checkedAt: Instant;
}

/**
 * Compatibility check (docs/64 "API versioning", docs/36 `platform.compatibility_records`).
 * A failed check blocks the affected write rather than degrading silently.
 */
export function checkCompatibility(input: {
  readonly component: CompatibilityComponent;
  readonly localVersion: number;
  readonly remoteVersion: number;
  readonly minSupported: number;
  readonly maxSupported: number;
  readonly at: Instant;
}): CompatibilityRecord {
  const result: CompatibilityResult =
    input.localVersion < input.minSupported || input.localVersion > input.maxSupported
      ? 'blocked'
      : input.localVersion < input.maxSupported
        ? 'upgrade_recommended'
        : 'compatible';
  return {
    component: input.component,
    localVersion: input.localVersion,
    remoteVersion: input.remoteVersion,
    minSupported: input.minSupported,
    maxSupported: input.maxSupported,
    result,
    checkedAt: input.at,
  };
}

export function blocksWrite(record: CompatibilityRecord): boolean {
  return record.result === 'blocked';
}
