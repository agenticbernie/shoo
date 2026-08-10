/**
 * `@shoo/contracts-http` — the versioned `/v1` HTTP surface from docs/37.
 *
 * Transport schemas validate shape only; they never authorize an action. Application
 * policy always re-evaluates actor, scope, resource version and preview token
 * (docs/64 "Contract workflow").
 */
export * from './common.js';
export * from './identity.js';
export * from './continuity.js';
export * from './memory.js';
export * from './intelligence.js';
export * from './platform.js';
export * from './routes.js';
