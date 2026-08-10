/**
 * `@shoo/domain-platform` — Platform bounded context (docs/29, docs/36, docs/65).
 *
 * Owns the transactional outbox and job lifecycle, async operation handles, durable
 * (MemWal/Walrus) operation state, immutable sync-policy versions and routing decisions,
 * compatibility records and feature flags.
 */
export * from './outbox.js';
export * from './operation.js';
export * from './policy.js';
export * from './flags.js';
