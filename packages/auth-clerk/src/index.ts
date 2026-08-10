import type { IdentityProviderPort } from '@shoo/application';

/**
 * `@shoo/auth-clerk` — Clerk identity adapter (ADR-ARCH-014, docs/33).
 *
 * OWNERSHIP: the API/web engineer implements this package. The foundation fixes only the
 * boundary rules, which are not negotiable:
 *
 * - a verified Clerk session yields a Shoo *identity*; it never yields authority. Roles,
 *   grants and visibility ceilings come from `iam` and are re-evaluated per request;
 * - Clerk errors are translated into `@shoo/domain-shared` results here, so no provider
 *   type escapes this package;
 * - wallet identity is a separate layer and is never derived from a Clerk session
 *   (docs/33 "Identity layers").
 *
 * Implement `IdentityProviderPort` from `@shoo/application` and export a factory that the
 * app composition root calls; do not construct a Clerk client anywhere else.
 */

export interface ClerkAdapterOptions {
  readonly secretKey: string;
  readonly publishableKey: string;
  /** Maximum age of a step-up confirmation before it must be repeated. */
  readonly stepUpMaxAgeMillis: number;
}

export type ClerkIdentityProviderFactory = (options: ClerkAdapterOptions) => IdentityProviderPort;

/** Default step-up freshness window used until the security review sets a final value. */
export const DEFAULT_STEP_UP_MAX_AGE_MILLIS = 5 * 60 * 1_000;
