/**
 * `@shoo/application` — use-case and port interfaces.
 *
 * Apps implement the use cases; adapter packages implement the ports. Nothing here
 * depends on a database driver, an HTTP framework, Clerk, the MCP SDK or a model
 * provider — those live behind the ports defined in `./ports`.
 */

export * from './ports/adapters.js';
export * from './ports/persistence.js';
export * from './use-case.js';
