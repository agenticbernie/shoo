/**
 * `@shoo/domain-memory` — Evidence & Memory bounded context (docs/29, docs/30, docs/40).
 *
 * Owns provenance, verification, supersession, authority and conflict. It never infers
 * canon from recency or agent confidence, and it never overwrites: every change is a new
 * immutable revision plus an explicit lineage edge.
 */
export * from './authority.js';
export * from './evidence.js';
export * from './supersession.js';
export * from './memory.js';
export * from './conflict.js';
export * from './resolver.js';
