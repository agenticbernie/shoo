import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from './migrate.js';

/**
 * Tenant isolation matrix (FIT-006) and schema invariant checks against a real
 * PostgreSQL instance.
 *
 * Run with:
 *   docker compose up -d postgres && pnpm db:migrate
 *   SHOO_TEST_DATABASE_URL=postgres://shoo_migrator:shoo_dev_password@localhost:5432/shoo \
 *   SHOO_TEST_APP_URL=postgres://shoo_app:shoo_dev_password@localhost:5432/shoo \
 *   pnpm --filter @shoo/db-postgres test
 *
 * Skipped when the URLs are absent so unit CI stays hermetic; the database job in CI
 * supplies them.
 */

const migrationUrl = process.env['SHOO_TEST_DATABASE_URL'];
const appUrl = process.env['SHOO_TEST_APP_URL'];
const enabled = migrationUrl !== undefined && appUrl !== undefined;

const ORG_A = '11111111-1111-7111-8111-1111111111a1';
const ORG_B = '22222222-2222-7222-8222-2222222222b2';
const USER_A = '33333333-3333-7333-8333-3333333333a3';
const PROJECT_A = '55555555-5555-7555-8555-5555555555a5';
const PROJECT_B = '66666666-6666-7666-8666-6666666666b6';
const MEMORY_A = '77777777-7777-7777-8777-7777777777a7';
const REVISION_A = '88888888-8888-7888-8888-8888888888a8';

describe.skipIf(!enabled)('tenant isolation and schema invariants', () => {
  let owner: pg.Client;
  let app: pg.Client;

  beforeAll(async () => {
    await runMigrations({ connectionString: migrationUrl as string });
    owner = new pg.Client({ connectionString: migrationUrl });
    app = new pg.Client({ connectionString: appUrl });
    await owner.connect();
    await app.connect();

    await owner.query('DELETE FROM iam.organizations WHERE id = ANY($1)', [[ORG_A, ORG_B]]);
    await owner.query(
      `INSERT INTO iam.organizations (id, name, slug) VALUES ($1,'Acme','acme-fit'), ($2,'Other','other-fit')`,
      [ORG_A, ORG_B],
    );
    await owner.query(
      `INSERT INTO iam.users (id, identity_provider_subject) VALUES ($1,'fit_user')
       ON CONFLICT DO NOTHING`,
      [USER_A],
    );
    await owner.query(
      `INSERT INTO iam.projects (id, organization_id, name, slug) VALUES ($1,$2,'Core','core-fit'), ($3,$4,'Core','core-fit')`,
      [PROJECT_A, ORG_A, PROJECT_B, ORG_B],
    );
    await owner.query(
      `INSERT INTO memory.memory_records (id, organization_id, project_id, memory_type, subject_type, subject_key)
       VALUES ($1,$2,$3,'decision','decision','auth-strategy')`,
      [MEMORY_A, ORG_A, PROJECT_A],
    );
    await owner.query(
      `INSERT INTO memory.memory_revisions
         (id, organization_id, project_id, memory_id, revision, content, content_hash,
          claim_status, verification_status, authority_status, effective_at)
       VALUES ($1,$2,$3,$4,1,'{"s":"clerk"}','hash-a','claimed','verified','canonical', now())`,
      [REVISION_A, ORG_A, PROJECT_A, MEMORY_A],
    );
  }, 60_000);

  afterAll(async () => {
    if (enabled) {
      await owner.query('DELETE FROM iam.organizations WHERE id = ANY($1)', [[ORG_A, ORG_B]]);
      await owner.end();
      await app.end();
    }
  });

  async function asTenant<T>(
    organizationId: string,
    projectId: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    await app.query('BEGIN');
    try {
      await app.query('SELECT set_config($1, $2, true)', ['shoo.organization_id', organizationId]);
      await app.query('SELECT set_config($1, $2, true)', ['shoo.project_id', projectId]);
      const result = await fn();
      await app.query('COMMIT');
      return result;
    } catch (error) {
      await app.query('ROLLBACK');
      throw error;
    }
  }

  it('returns nothing when the tenant context is missing (fails closed)', async () => {
    const { rows } = await app.query('SELECT count(*)::int AS count FROM memory.memory_revisions');
    expect(rows[0]?.count).toBe(0);
  });

  it('denies cross-tenant reads', async () => {
    const count = await asTenant(ORG_B, PROJECT_B, async () => {
      const { rows } = await app.query('SELECT count(*)::int AS count FROM memory.memory_revisions');
      return rows[0]?.count as number;
    });
    expect(count).toBe(0);
  });

  it('allows reads inside the caller tenant', async () => {
    const count = await asTenant(ORG_A, PROJECT_A, async () => {
      const { rows } = await app.query('SELECT count(*)::int AS count FROM memory.memory_revisions');
      return rows[0]?.count as number;
    });
    expect(count).toBe(1);
  });

  it('rejects a write that claims another tenant', async () => {
    await expect(
      asTenant(ORG_A, PROJECT_A, async () => {
        await app.query(
          `INSERT INTO continuity.work_units (id, organization_id, project_id, title)
           VALUES (gen_random_uuid(), $1, $2, 'forged')`,
          [ORG_B, PROJECT_B],
        );
      }),
    ).rejects.toThrow();
  });

  it('confirms the runtime role cannot bypass RLS', async () => {
    const { rows } = await app.query(
      'SELECT rolbypassrls, rolsuper FROM pg_roles WHERE rolname = current_user',
    );
    expect(rows[0]?.rolbypassrls).toBe(false);
    expect(rows[0]?.rolsuper).toBe(false);
  });

  it('enforces one active canonical revision per subject and scope', async () => {
    const secondMemory = '79999999-7777-7777-8777-7777777777a9';
    await owner.query(
      `INSERT INTO memory.memory_records (id, organization_id, project_id, memory_type, subject_type, subject_key)
       VALUES ($1,$2,$3,'decision','decision','auth-strategy')`,
      [secondMemory, ORG_A, PROJECT_A],
    );
    await expect(
      owner.query(
        `INSERT INTO memory.memory_revisions
           (id, organization_id, project_id, memory_id, revision, content, content_hash,
            claim_status, verification_status, authority_status, effective_at)
         VALUES (gen_random_uuid(),$1,$2,$3,1,'{"s":"auth0"}','hash-b','claimed','verified','canonical', now())`,
        [ORG_A, PROJECT_A, secondMemory],
      ),
    ).rejects.toThrow(/memory_revisions_one_active_canonical/);
  });

  it('rejects a superseded revision that keeps non-historical authority', async () => {
    await expect(
      owner.query(
        `UPDATE memory.memory_revisions SET lineage_status = 'superseded' WHERE id = $1`,
        [REVISION_A],
      ),
    ).rejects.toThrow(/revisions_superseded_is_historical/);
  });

  it('keeps the event ledger append-only', async () => {
    await expect(owner.query('DELETE FROM platform.event_ledger')).rejects.toThrow(
      /append-only/,
    );
  });
});
