/**
 * `@shoo/domain-shared` — the Shoo domain shared kernel.
 *
 * Deviation note: docs/63 lists the five bounded contexts under `packages/domain/`. This
 * sixth sibling holds only the shared kernel (branded ids, time axes, results, versioning,
 * tenant scope, state machines, domain events) so the contexts can stay independent of
 * each other instead of one of them becoming a de facto utility package — which docs/63
 * explicitly prohibits ("A generic `utils` package is prohibited; shared code must have a
 * semantic owner"). Its owner is the domain layer as a whole.
 *
 * This package has no dependencies: no apps, no database, no Clerk, no MCP SDK, no MemWal
 * SDK, no web framework, no model provider.
 */
export * from './brand.js';
export * from './domain-event.js';
export * from './result.js';
export * from './scope.js';
export * from './state-machine.js';
export * from './time.js';
export * from './version.js';
