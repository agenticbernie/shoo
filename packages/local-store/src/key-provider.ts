import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { generateKey, KEY_BYTES } from './crypto.js';

/**
 * Data-encryption-key providers (docs/34 "Key hierarchy", "Cross-platform secure storage").
 *
 * The SQLite data-encryption key lives in the OS credential vault — DPAPI/Credential
 * Manager on Windows, Keychain on macOS, a Secret Service keyring on Linux — and never in
 * the SQLite file, the repository, an environment file or telemetry.
 *
 * There is exactly one fallback, and it is explicit: `SHOO_LOCAL_KEY_PROVIDER=file` for
 * CI and headless Linux. Shoo never silently falls back to a plaintext key file
 * (docs/34 "Never silently fall back to plaintext/env file").
 */

export interface KeyProvider {
  readonly name: string;
  /** Return the existing key, or create and store one on first use. */
  getOrCreateKey(alias: string): Promise<Buffer>;
  /** Return the existing key, or null when none is stored. */
  getKey(alias: string): Promise<Buffer | null>;
  /** Remove a key. Used by device de-registration and recovery flows. */
  deleteKey(alias: string): Promise<void>;
}

export const DEFAULT_KEY_ALIAS = 'shoo.local-store.dek' as const;
const SERVICE_NAME = 'dev.shoo.local-store';

export class KeyUnavailableError extends Error {
  override readonly name = 'KeyUnavailableError';
}

/**
 * OS credential vault provider backed by `@napi-rs/keyring`, which maps to DPAPI,
 * Keychain and Secret Service respectively.
 */
export class OsVaultKeyProvider implements KeyProvider {
  readonly name = 'os-vault';

  constructor(private readonly service: string = SERVICE_NAME) {}

  private async entry(alias: string): Promise<{
    getPassword(): string;
    setPassword(value: string): void;
    deletePassword(): boolean;
  }> {
    const keyring = (await import('@napi-rs/keyring')) as unknown as {
      Entry: new (
        service: string,
        account: string,
      ) => {
        getPassword(): string;
        setPassword(value: string): void;
        deletePassword(): boolean;
      };
    };
    return new keyring.Entry(this.service, alias);
  }

  async getKey(alias: string): Promise<Buffer | null> {
    try {
      const entry = await this.entry(alias);
      const encoded = entry.getPassword();
      const key = Buffer.from(encoded, 'base64');
      if (key.length !== KEY_BYTES) {
        throw new KeyUnavailableError('stored key has an unexpected length');
      }
      return key;
    } catch (error) {
      if (error instanceof KeyUnavailableError) throw error;
      // A missing entry and a locked vault are different situations for the user, but
      // both mean "no key right now"; the caller decides whether to prompt or quarantine.
      return null;
    }
  }

  async getOrCreateKey(alias: string): Promise<Buffer> {
    const existing = await this.getKey(alias);
    if (existing !== null) return existing;
    const key = generateKey();
    try {
      const entry = await this.entry(alias);
      entry.setPassword(key.toString('base64'));
    } catch (error) {
      throw new KeyUnavailableError(
        'the OS credential vault is unavailable; unlock it or opt in to the documented ' +
          'file provider with SHOO_LOCAL_KEY_PROVIDER=file',
        { cause: error },
      );
    }
    return key;
  }

  async deleteKey(alias: string): Promise<void> {
    try {
      const entry = await this.entry(alias);
      entry.deletePassword();
    } catch {
      // Deleting an absent key is not an error.
    }
  }
}

/**
 * Explicit, opt-in file provider for CI and headless environments.
 *
 * The key file is created with owner-only permissions and the provider is never selected
 * automatically: `SHOO_LOCAL_KEY_PROVIDER=file` must be set. Restricted capture on a
 * developer machine should use the OS vault instead.
 */
export class FileKeyProvider implements KeyProvider {
  readonly name = 'file';

  constructor(private readonly path: string) {}

  private read(): Record<string, string> {
    if (!existsSync(this.path)) return {};
    return JSON.parse(readFileSync(this.path, 'utf8')) as Record<string, string>;
  }

  private write(entries: Record<string, string>): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(entries), { mode: 0o600 });
    chmodSync(this.path, 0o600);
  }

  async getKey(alias: string): Promise<Buffer | null> {
    const encoded = this.read()[alias];
    if (encoded === undefined) return null;
    const key = Buffer.from(encoded, 'base64');
    if (key.length !== KEY_BYTES) {
      throw new KeyUnavailableError('stored key has an unexpected length');
    }
    return key;
  }

  async getOrCreateKey(alias: string): Promise<Buffer> {
    const existing = await this.getKey(alias);
    if (existing !== null) return existing;
    const key = generateKey();
    const entries = this.read();
    entries[alias] = key.toString('base64');
    this.write(entries);
    return key;
  }

  async deleteKey(alias: string): Promise<void> {
    const entries = this.read();
    delete entries[alias];
    this.write(entries);
  }
}

/** In-memory provider for tests. Keys never touch disk and never survive the process. */
export class EphemeralKeyProvider implements KeyProvider {
  readonly name = 'ephemeral';
  private readonly keys = new Map<string, Buffer>();

  async getKey(alias: string): Promise<Buffer | null> {
    return this.keys.get(alias) ?? null;
  }

  async getOrCreateKey(alias: string): Promise<Buffer> {
    const existing = this.keys.get(alias);
    if (existing !== undefined) return existing;
    const key = generateKey();
    this.keys.set(alias, key);
    return key;
  }

  async deleteKey(alias: string): Promise<void> {
    this.keys.delete(alias);
  }
}

export interface ResolveProviderOptions {
  /** `SHOO_LOCAL_KEY_PROVIDER`: unset or `os-vault` (default), `file`, `ephemeral`. */
  readonly providerName?: string | undefined;
  /** `SHOO_LOCAL_KEY_FILE`: required when the file provider is selected. */
  readonly keyFilePath?: string | undefined;
}

/**
 * Select a provider from explicit configuration.
 *
 * Selecting a weaker provider is always a deliberate act by the operator; there is no
 * automatic degradation path.
 */
export function resolveKeyProvider(options: ResolveProviderOptions = {}): KeyProvider {
  const requested = options.providerName ?? 'os-vault';
  switch (requested) {
    case 'os-vault':
      return new OsVaultKeyProvider();
    case 'file': {
      if (options.keyFilePath === undefined || options.keyFilePath === '') {
        throw new KeyUnavailableError('SHOO_LOCAL_KEY_PROVIDER=file requires SHOO_LOCAL_KEY_FILE');
      }
      return new FileKeyProvider(options.keyFilePath);
    }
    case 'ephemeral':
      return new EphemeralKeyProvider();
    default:
      throw new KeyUnavailableError(`unknown key provider "${requested}"`);
  }
}
