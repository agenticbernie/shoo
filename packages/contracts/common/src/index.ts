/**
 * `@shoo/contracts-common` — scalars, enumerations, scope descriptors, error codes and
 * response envelopes shared by the HTTP, MCP and event contracts.
 *
 * Deviation note: docs/63 lists `contracts/{http,mcp,events}`. This sibling package holds
 * the material all three transports share so the shape of an `authority_status` or an
 * error code cannot drift between surfaces. It contains no transport routing and no
 * business authorization.
 */

export * from './enums.js';
export * from './envelope.js';
export * from './errors.js';
export * from './scalars.js';
export * from './scope.js';
