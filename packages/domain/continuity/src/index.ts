/**
 * `@shoo/domain-continuity` — Project Continuity bounded context (docs/29).
 *
 * Owns the current work lifecycle and continuity identity: work units, sessions,
 * checkpoints and the client capture envelope. It never infers work completion from a
 * session stopping.
 */
export * from './work-unit.js';
export * from './session.js';
export * from './checkpoint.js';
export * from './client-envelope.js';
