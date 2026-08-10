/**
 * `@shoo/db-postgres` — typed Kysely access to the Shoo operational database and the
 * authored-SQL migration runner.
 *
 * This package owns persistence mechanics only. Domain rules live in `packages/domain/*`
 * and are never re-implemented here.
 */

export * from './client.js';
export * from './migrate.js';
export * from './schema.js';
