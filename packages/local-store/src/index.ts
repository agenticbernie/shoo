/**
 * `@shoo/local-store` — the encrypted local SQLite port for Shoo Local.
 *
 * Sensitive payload columns are sealed with an AES-256-GCM envelope bound to their table,
 * column, record id and schema version. The data-encryption key lives in the OS credential
 * vault; the only fallback is the explicitly opted-in file provider documented in
 * README.md for CI and headless Linux.
 */
export * from './crypto.js';
export * from './key-provider.js';
export * from './store.js';
