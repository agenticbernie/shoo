import type { MemWalPort } from '@shoo/application';

/**
 * `@shoo/adapter-memwal` — MemWal Manual durable adapter (docs/32, docs/34).
 *
 * OWNERSHIP: the worker and Shoo Local engineers implement this package.
 *
 * Trust boundary rules fixed by the foundation:
 * - encryption and decryption happen in Shoo Local. Shoo Cloud receives only ciphertext,
 *   locators and status; it never receives an owner or delegate private key;
 * - a durable failure never invalidates operational truth and never blocks work;
 * - an accepted job that times out is *reconciled* by querying the job or mapping, never
 *   blindly resubmitted (docs/29 "Retry and dead-letter policy");
 * - a namespace is immutable after its first durable write, and a mismatch stops writes
 *   rather than guessing (docs/34 "Namespace mismatch").
 */

export type MemWalAdapterFactory = (options: {
  readonly relayerUrl: string;
  readonly network: 'mainnet' | 'testnet' | 'devnet' | 'localnet';
  readonly packageId: string;
  readonly accountId: string;
  /** Opaque OS-vault alias of the device delegate key. Never the key material itself. */
  readonly delegateKeyAlias: string;
}) => MemWalPort;

/** Durable record classes eligible for Manual persistence in MVP. */
export const DURABLE_RECORD_CLASSES = [
  'checkpoint_summary',
  'accepted_decision',
  'canonical_memory',
] as const;
export type DurableRecordClass = (typeof DURABLE_RECORD_CLASSES)[number];

export const MEMWAL_LOCAL_SCHEMA_VERSION = 1;
