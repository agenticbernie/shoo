import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Application-level AEAD for sensitive local payload columns
 * (docs/34 "Cross-platform secure storage", ART-72 in docs/63).
 *
 * AES-256-GCM with a random 96-bit nonce per record and associated data binding the
 * ciphertext to its scope and schema version. Rebinding a ciphertext to a different
 * table, record or schema version therefore fails authentication instead of decrypting.
 *
 * SQLCipher full-file encryption remains a separate, later defence (SPIKE-01); this is
 * the R0 baseline, not a replacement for it.
 */

export const AEAD_ALGORITHM = 'aes-256-gcm' as const;
export const KEY_BYTES = 32;
const NONCE_BYTES = 12;
const TAG_BYTES = 16;

/** Envelope format version, stored with every ciphertext so rotation stays possible. */
export const ENVELOPE_VERSION = 1;

export interface AeadScope {
  /** Logical table the ciphertext belongs to. */
  readonly table: string;
  /** Column name, so two columns of one row cannot be swapped. */
  readonly column: string;
  /** Primary key of the owning row. */
  readonly recordId: string;
  /** Local schema version at write time. */
  readonly schemaVersion: number;
}

export function associatedData(scope: AeadScope): Buffer {
  return Buffer.from(
    `v${ENVELOPE_VERSION}|${scope.table}|${scope.column}|${scope.recordId}|${scope.schemaVersion}`,
    'utf8',
  );
}

/**
 * Ciphertext envelope layout:
 *   byte 0        envelope version
 *   bytes 1..12   nonce
 *   bytes 13..28  auth tag
 *   bytes 29..    ciphertext
 */
export function seal(plaintext: Buffer | string, key: Buffer, scope: AeadScope): Buffer {
  assertKey(key);
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv(AEAD_ALGORITHM, key, nonce, {
    authTagLength: TAG_BYTES,
  });
  cipher.setAAD(associatedData(scope));
  const body = Buffer.concat([
    cipher.update(typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf8') : plaintext),
    cipher.final(),
  ]);
  return Buffer.concat([Buffer.from([ENVELOPE_VERSION]), nonce, cipher.getAuthTag(), body]);
}

export class DecryptionError extends Error {
  override readonly name = 'DecryptionError';
}

export function open(envelope: Buffer, key: Buffer, scope: AeadScope): Buffer {
  assertKey(key);
  if (envelope.length < 1 + NONCE_BYTES + TAG_BYTES) {
    throw new DecryptionError('ciphertext envelope is truncated');
  }
  const version = envelope[0];
  if (version !== ENVELOPE_VERSION) {
    throw new DecryptionError(`unsupported ciphertext envelope version ${String(version)}`);
  }
  const nonce = envelope.subarray(1, 1 + NONCE_BYTES);
  const tag = envelope.subarray(1 + NONCE_BYTES, 1 + NONCE_BYTES + TAG_BYTES);
  const body = envelope.subarray(1 + NONCE_BYTES + TAG_BYTES);

  const decipher = createDecipheriv(AEAD_ALGORITHM, key, nonce, {
    authTagLength: TAG_BYTES,
  });
  decipher.setAAD(associatedData(scope));
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(body), decipher.final()]);
  } catch {
    // Never leak which part failed: a corrupted store and a wrong key look identical
    // to the caller, which quarantines rather than overwrites (docs/34).
    throw new DecryptionError('ciphertext failed authentication');
  }
}

export function sealJson(value: unknown, key: Buffer, scope: AeadScope): Buffer {
  return seal(Buffer.from(JSON.stringify(value), 'utf8'), key, scope);
}

export function openJson<T>(envelope: Buffer, key: Buffer, scope: AeadScope): T {
  return JSON.parse(open(envelope, key, scope).toString('utf8')) as T;
}

export function generateKey(): Buffer {
  return randomBytes(KEY_BYTES);
}

export function keysEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

function assertKey(key: Buffer): void {
  if (key.length !== KEY_BYTES) {
    throw new Error(`data encryption key must be ${KEY_BYTES} bytes`);
  }
}
