import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

/**
 * Authored-SQL migration runner (docs/64 "Database and migration standards").
 *
 * - migrations are plain, reviewed `.sql` files applied in filename order;
 * - each file runs inside one transaction and is recorded with its checksum;
 * - a checksum change on an already-applied file is a hard error — history is never
 *   silently rewritten;
 * - there is no automatic schema synchronization anywhere in this repository.
 *
 * The runner connects with the *migration* role, never the request-serving role.
 */

export interface MigrationFile {
  readonly name: string;
  readonly sql: string;
  readonly checksum: string;
}

export interface MigrationResult {
  readonly applied: readonly string[];
  readonly skipped: readonly string[];
}

const MIGRATIONS_TABLE_DDL = `
CREATE SCHEMA IF NOT EXISTS platform;
CREATE TABLE IF NOT EXISTS platform.schema_migrations (
  name        text PRIMARY KEY,
  checksum    text NOT NULL,
  applied_at  timestamptz NOT NULL DEFAULT now(),
  duration_ms integer NOT NULL
);
`;

export function defaultMigrationsDir(): string {
  // packages/db-postgres/dist/migrate.js -> repository root -> migrations/postgres
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, '..', '..', '..', 'migrations', 'postgres');
}

export async function loadMigrations(dir: string): Promise<readonly MigrationFile[]> {
  const entries = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort();
  const files: MigrationFile[] = [];
  for (const name of entries) {
    const sql = await readFile(join(dir, name), 'utf8');
    files.push({
      name,
      sql,
      checksum: createHash('sha256').update(sql).digest('hex'),
    });
  }
  return files;
}

export async function runMigrations(options: {
  readonly connectionString: string;
  readonly dir?: string;
  readonly log?: (message: string) => void;
}): Promise<MigrationResult> {
  const dir = options.dir ?? defaultMigrationsDir();
  const log = options.log ?? (() => undefined);
  const files = await loadMigrations(dir);

  const client = new pg.Client({ connectionString: options.connectionString });
  await client.connect();
  const applied: string[] = [];
  const skipped: string[] = [];

  try {
    await client.query(MIGRATIONS_TABLE_DDL);
    const { rows } = await client.query<{ name: string; checksum: string }>(
      'SELECT name, checksum FROM platform.schema_migrations',
    );
    const existing = new Map(rows.map((row) => [row.name, row.checksum]));

    for (const file of files) {
      const previous = existing.get(file.name);
      if (previous !== undefined) {
        if (previous !== file.checksum) {
          throw new Error(
            `migration ${file.name} changed after it was applied ` +
              '(expand/contract with a new migration instead of editing history)',
          );
        }
        skipped.push(file.name);
        continue;
      }

      const started = Date.now();
      await client.query('BEGIN');
      try {
        await client.query(file.sql);
        await client.query(
          'INSERT INTO platform.schema_migrations (name, checksum, duration_ms) VALUES ($1, $2, $3)',
          [file.name, file.checksum, Date.now() - started],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`migration ${file.name} failed: ${(error as Error).message}`, {
          cause: error,
        });
      }
      applied.push(file.name);
      log(`applied ${file.name} in ${Date.now() - started}ms`);
    }
  } finally {
    await client.end();
  }

  return { applied, skipped };
}

/**
 * Drop and recreate every Shoo schema. Development and CI only: it refuses to run
 * against anything that does not look like a local or test database.
 */
export async function resetDatabase(connectionString: string): Promise<void> {
  if (!/localhost|127\.0\.0\.1|@postgres[:/]|_test\b/.test(connectionString)) {
    throw new Error('resetDatabase refuses to run against a non-local connection string');
  }
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query(`
      DROP SCHEMA IF EXISTS audit, platform, intelligence, memory, continuity, iam CASCADE;
    `);
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'up';
  const connectionString =
    process.env['DATABASE_MIGRATION_URL'] ??
    process.env['DATABASE_URL'] ??
    'postgres://shoo_migrator:shoo_dev_password@localhost:5432/shoo';

  if (command === 'reset') {
    await resetDatabase(connectionString);
    console.log('schemas dropped');
  }

  const result = await runMigrations({
    connectionString,
    log: (message) => console.log(message),
  });
  console.log(
    `migrations complete: ${result.applied.length} applied, ${result.skipped.length} already present`,
  );
}

// Only run the CLI when executed directly, not when imported as a library.
const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === `file://${resolve(process.argv[1])}`;
if (invokedDirectly) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
