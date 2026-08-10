import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { DecryptionError, generateKey, open, seal } from './crypto.js';
import { EphemeralKeyProvider, FileKeyProvider, resolveKeyProvider } from './key-provider.js';
import { LocalStore } from './store.js';

const scope = {
  table: 'capture_events',
  column: 'payload_ciphertext',
  recordId: 'record-1',
  schemaVersion: 1,
};

describe('AEAD envelope', () => {
  it('round-trips a payload', () => {
    const key = generateKey();
    const sealed = seal('sensitive prompt', key, scope);
    expect(open(sealed, key, scope).toString('utf8')).toBe('sensitive prompt');
  });

  it('does not leave plaintext in the envelope', () => {
    const key = generateKey();
    const sealed = seal('sensitive prompt', key, scope);
    expect(sealed.toString('utf8')).not.toContain('sensitive prompt');
  });

  it('fails when the ciphertext is rebound to another record', () => {
    const key = generateKey();
    const sealed = seal('sensitive prompt', key, scope);
    expect(() => open(sealed, key, { ...scope, recordId: 'record-2' })).toThrow(DecryptionError);
  });

  it('fails when the ciphertext is rebound to another column', () => {
    const key = generateKey();
    const sealed = seal('sensitive prompt', key, scope);
    expect(() => open(sealed, key, { ...scope, column: 'excerpt_ciphertext' })).toThrow(
      DecryptionError,
    );
  });

  it('fails under a different key', () => {
    const sealed = seal('sensitive prompt', generateKey(), scope);
    expect(() => open(sealed, generateKey(), scope)).toThrow(DecryptionError);
  });

  it('fails when a single byte is tampered with', () => {
    const key = generateKey();
    const sealed = seal('sensitive prompt', key, scope);
    const tampered = Buffer.from(sealed);
    const last = tampered.length - 1;
    tampered[last] = (tampered[last] ?? 0) ^ 0x01;
    expect(() => open(tampered, key, scope)).toThrow(DecryptionError);
  });
});

describe('key providers', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it('never selects the file provider implicitly', () => {
    expect(resolveKeyProvider().name).toBe('os-vault');
    expect(() => resolveKeyProvider({ providerName: 'file' })).toThrow(/SHOO_LOCAL_KEY_FILE/);
  });

  it('creates a stable key with the explicit file provider', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'shoo-key-'));
    dirs.push(dir);
    const provider = new FileKeyProvider(join(dir, 'keys.json'));
    const first = await provider.getOrCreateKey('alias');
    const second = await provider.getOrCreateKey('alias');
    expect(first.equals(second)).toBe(true);
    expect(first).toHaveLength(32);
  });

  it('forgets a deleted key', async () => {
    const provider = new EphemeralKeyProvider();
    await provider.getOrCreateKey('alias');
    await provider.deleteKey('alias');
    expect(await provider.getKey('alias')).toBeNull();
  });
});

describe('local store', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  async function openStore(): Promise<LocalStore> {
    const dir = mkdtempSync(join(tmpdir(), 'shoo-store-'));
    dirs.push(dir);
    return LocalStore.open({
      filePath: join(dir, 'shoo.sqlite'),
      keyProvider: new EphemeralKeyProvider(),
    });
  }

  it('applies the local migrations and creates every documented table', async () => {
    const store = await openStore();
    const tables = (
      store.connection
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
        .all() as { name: string }[]
    ).map((row) => row.name);

    for (const expected of [
      'local_identity',
      'capture_events',
      'offline_outbox',
      'local_sources',
      'policy_cache',
      'context_cache',
      'durable_queue',
      'quarantine',
    ]) {
      expect(tables).toContain(expected);
    }
    store.close();
  });

  it('is idempotent across reopen', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'shoo-store-'));
    dirs.push(dir);
    const provider = new EphemeralKeyProvider();
    const path = join(dir, 'shoo.sqlite');
    const first = await LocalStore.open({
      filePath: path,
      keyProvider: provider,
    });
    first.close();
    const second = await LocalStore.open({
      filePath: path,
      keyProvider: provider,
    });
    expect(second.connection.prepare('SELECT count(*) AS n FROM schema_migrations').get()).toEqual({
      n: 1,
    });
    second.close();
  });

  it('stores sealed payloads as opaque blobs and reads them back', async () => {
    const store = await openStore();
    const payload = { prompt: 'do not leak me', path: '/home/dev/secret.ts' };
    const sealed = store.seal(payload, {
      table: 'capture_events',
      column: 'payload_ciphertext',
      recordId: 'evt-1',
    });

    store.connection
      .prepare(
        `INSERT INTO capture_events
           (id, source_event_id, adapter_instance_id, client, event_type, schema_version,
            content_hash, classification, payload_ciphertext, occurred_at, received_at, policy_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        'evt-1',
        'native-1',
        'adapter-1',
        'opencode',
        'prompt',
        1,
        'hash',
        'restricted',
        sealed,
        1,
        2,
        1,
      );

    const row = store.connection
      .prepare('SELECT payload_ciphertext FROM capture_events WHERE id = ?')
      .get('evt-1') as { payload_ciphertext: Buffer };

    expect(row.payload_ciphertext.toString('utf8')).not.toContain('do not leak me');
    expect(
      store.openSealed<typeof payload>(row.payload_ciphertext, {
        table: 'capture_events',
        column: 'payload_ciphertext',
        recordId: 'evt-1',
      }),
    ).toEqual(payload);
    store.close();
  });

  it('quarantines rather than overwrites an unreadable record', async () => {
    const store = await openStore();
    const foreign = seal('written under another key', generateKey(), {
      table: 'capture_events',
      column: 'payload_ciphertext',
      recordId: 'evt-2',
      schemaVersion: 1,
    });

    const result = store.openSealed(foreign, {
      table: 'capture_events',
      column: 'payload_ciphertext',
      recordId: 'evt-2',
    });

    expect(result).toBeNull();
    expect(store.listQuarantined()).toEqual([
      {
        table: 'capture_events',
        recordId: 'evt-2',
        reason: 'ciphertext failed authentication',
      },
    ]);
    store.close();
  });

  it('refuses a migration whose content changed after it was applied', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'shoo-mig-'));
    dirs.push(dir);
    const store = await openStore();
    store.connection
      .prepare('UPDATE schema_migrations SET checksum = ? WHERE name = ?')
      .run('different', '0001_initial.sql');
    const path = store.connection.name;
    store.close();

    await expect(
      LocalStore.open({
        filePath: path,
        keyProvider: new EphemeralKeyProvider(),
      }),
    ).rejects.toThrow(/changed after it was applied/);
  });
});
