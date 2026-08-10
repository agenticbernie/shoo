/**
 * `@shoo/domain-identity` — Identity & Access bounded context (docs/29, docs/33).
 *
 * Owns tenant scope, roles, memberships, projects, grants, device identity and the public
 * side of the user-owned MemWal binding. It never infers authority from visibility, and it
 * holds no private key material of any kind.
 */

export * from './authorization.js';
export * from './device.js';
export * from './grant.js';
export * from './organization.js';
export * from './project.js';
export * from './roles.js';
export * from './subject.js';
export * from './visibility.js';
