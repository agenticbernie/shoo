import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { type AeadScope, DecryptionError, openJson, sealJson } from './crypto.js';
import { DEFAULT_KEY_ALIAS, type KeyProvider } from './key-provider.js';

/**
 * Encrypted local SQLite store (docs/36 "Local SQLite schema", docs/34).
 *
 * The store owns three responsibilities and no business logic:
 *
 * 1. open the database with crash-safe pragmas and apply `migrations/local`;
 * 2. seal and open sensitive payload columns with the AEAD envelope;
 * 3. quarantine — never overwrite — records whose ciphertext fails authentication.
 */

export const LOCAL_SCHEMA_VERSION = 1;

export interface OpenLocalStoreOptions {
  readonly filePath: string;
  readonly keyProvider: KeyProvider;
  readonly keyAlias?: string;
  readonly migrationsDir?: string;
}

export function defaultLocalMigrationsDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, '..', '..', '..', 'migrations', 'local');
}

export class LocalStore {
  private constructor(
    private readonly db: Database.Database,
    private readonly key: Buffer,
    readonly keyAlias: string,
  ) {}

  static async open(options: OpenLocalStoreOptions): Promise<LocalStore> {
    const keyAlias = options.keyAlias ?? DEFAULT_KEY_ALIAS;
    const key = await options.keyProvider.getOrCreateKey(keyAlias);

    if (options.filePath !== ':memory:') {
      mkdirSync(dirname(options.filePath), { recursive: true });
    }
    const db = new Database(options.filePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');

    await applyLocalMigrations(db, options.migrationsDir ?? defaultLocalMigrationsDir());
    return new LocalStore(db, key, keyAlias);
  }

  /** Direct handle for callers that own their own queries (apps/local). */
  get connection(): Database.Database {
    return this.db;
  }

  seal(value: unknown, scope: Omit<AeadScope, 'schemaVersion'>): Buffer {
    return sealJson(value, this.key, {
      ...scope,
      schemaVersion: LOCAL_SCHEMA_VERSION,
    });
  }

  /**
   * Open a sealed column.
   *
   * On authentication failure the row is quarantined and `null` is returned: an
   * unreadable record is a recovery situation for the user, never a reason to delete or
   * silently replace their evidence (docs/34 "Failure and recovery UX").
   */
  openSealed<T>(envelope: Buffer, scope: Omit<AeadScope, 'schemaVersion'>): T | null {
    try {
      return openJson<T>(envelope, this.key, {
        ...scope,
        schemaVersion: LOCAL_SCHEMA_VERSION,
      });
    } catch (error) {
      if (error instanceof DecryptionError) {
        this.quarantine(scope.table, scope.recordId, error.message);
        return null;
      }
      throw error;
    }
  }

  quarantine(table: string, recordId: string, reason: string): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO quarantine (id, table_name, record_id, reason, detected_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(`${table}:${recordId}`, table, recordId, reason, Date.now());
  }

  listQuarantined(): readonly {
    table: string;
    recordId: string;
    reason: string;
  }[] {
    const rows = this.db
      .prepare('SELECT table_name, record_id, reason FROM quarantine ORDER BY detected_at DESC')
      .all() as { table_name: string; record_id: string; reason: string }[];
    return rows.map((row) => ({
      table: row.table_name,
      recordId: row.record_id,
      reason: row.reason,
    }));
  }

  /** Run `fn` in one SQLite transaction; better-sqlite3 is synchronous by design. */
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  close(): void {
    this.db.close();
  }
}

export async function applyLocalMigrations(
  db: Database.Database,
  dir: string,
): Promise<readonly string[]> {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name        TEXT PRIMARY KEY,
      checksum    TEXT NOT NULL,
      applied_at  INTEGER NOT NULL
    );
  `);

  const names = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort();
  const applied: string[] = [];
  const known = new Map(
    (
      db.prepare('SELECT name, checksum FROM schema_migrations').all() as {
        name: string;
        checksum: string;
      }[]
    ).map((row) => [row.name, row.checksum]),
  );

  for (const name of names) {
    const sql = await readFile(join(dir, name), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const previous = known.get(name);
    if (previous !== undefined) {
      if (previous !== checksum) {
        throw new Error(
          `local migration ${name} changed after it was applied; add a new migration instead`,
        );
      }
      continue;
    }
    // PRAGMA statements inside the file cannot run in a transaction, so the file is
    // executed directly and recorded immediately after.
    db.exec(sql);
    db.prepare('INSERT INTO schema_migrations (name, checksum, applied_at) VALUES (?, ?, ?)').run(
      name,
      checksum,
      Date.now(),
    );
    applied.push(name);
  }

  return applied;
}
