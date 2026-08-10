import { CamelCasePlugin, Kysely, PostgresDialect, type Transaction, sql } from 'kysely';
import pg from 'pg';
import type { Database } from './schema.js';

/**
 * Kysely client and tenant context (docs/63 query layer, docs/33 isolation).
 *
 * Two connection identities exist and never mix:
 *
 * - the **runtime** pool (`shoo_app` / `shoo_worker`) serves requests. It does not own
 *   tables and does not have BYPASSRLS, so FORCE ROW LEVEL SECURITY applies to it;
 * - the **migration** pool owns the schema and never serves traffic.
 */

export type ShooDatabase = Kysely<Database>;

export interface PoolOptions {
  readonly connectionString: string;
  readonly max?: number;
  readonly applicationName?: string;
  readonly statementTimeoutMillis?: number;
}

export function createPool(options: PoolOptions): pg.Pool {
  return new pg.Pool({
    connectionString: options.connectionString,
    max: options.max ?? 10,
    application_name: options.applicationName ?? 'shoo',
    statement_timeout: options.statementTimeoutMillis ?? 15_000,
    idle_in_transaction_session_timeout: 30_000,
  });
}

/**
 * Column names are snake_case in SQL and snake_case in the generated types, so no
 * case plugin is installed by default. `camelCase: true` opts a caller in explicitly.
 */
export function createDatabase(pool: pg.Pool, options: { camelCase?: boolean } = {}): ShooDatabase {
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
    plugins: options.camelCase === true ? [new CamelCasePlugin()] : [],
  });
}

export interface TenantContext {
  readonly organizationId: string;
  /** Null for organization-scoped work such as an account-level export. */
  readonly projectId: string | null;
  readonly actorUserId?: string | null;
}

const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function assertUuid(value: string, field: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`${field} must be a UUID before it can enter the tenant context`);
  }
}

/**
 * Run `fn` inside a transaction whose tenant context is set with `SET LOCAL`.
 *
 * `SET LOCAL` is transaction-scoped, so the context cannot leak to the next borrower of
 * the pooled connection, and a background job cannot switch tenant mid-transaction
 * (docs/33 "Authorization tests required").
 *
 * The ids are validated as UUIDs first: they are interpolated as literals because
 * `SET LOCAL` does not accept bind parameters.
 */
export async function withTenantContext<T>(
  db: ShooDatabase,
  context: TenantContext,
  fn: (trx: Transaction<Database>) => Promise<T>,
): Promise<T> {
  assertUuid(context.organizationId, 'organizationId');
  if (context.projectId !== null && context.projectId !== undefined) {
    assertUuid(context.projectId, 'projectId');
  }

  return db.transaction().execute(async (trx) => {
    await sql`SELECT set_config('shoo.organization_id', ${context.organizationId}, true)`.execute(
      trx,
    );
    await sql`SELECT set_config('shoo.project_id', ${context.projectId ?? ''}, true)`.execute(trx);
    if (context.actorUserId !== undefined && context.actorUserId !== null) {
      assertUuid(context.actorUserId, 'actorUserId');
      await sql`SELECT set_config('shoo.actor_user_id', ${context.actorUserId}, true)`.execute(trx);
    }
    return fn(trx);
  });
}

/** Liveness probe used by the API/worker health endpoints. */
export async function checkDatabaseHealth(db: ShooDatabase): Promise<{ ok: boolean; latencyMs: number }> {
  const started = Date.now();
  try {
    await sql`SELECT 1`.execute(db);
    return { ok: true, latencyMs: Date.now() - started };
  } catch {
    return { ok: false, latencyMs: Date.now() - started };
  }
}

/** Format a numeric vector as the pgvector text literal. */
export function toVectorLiteral(values: readonly number[]): string {
  return `[${values.join(',')}]`;
}

export function parseVectorLiteral(literal: string): number[] {
  return literal
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(',')
    .filter((part) => part.length > 0)
    .map(Number);
}
