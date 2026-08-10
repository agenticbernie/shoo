# @shoo/local-store

Encrypted local SQLite store for Shoo Local (docs/34, docs/36 "Local SQLite schema").

## What is encrypted

Plaintext in the local database is limited to opaque identifiers, ordering and scheduling
state, retry counters and coarse timestamps — everything required to keep working offline.
Everything else is a BLOB holding an AES-256-GCM envelope:

| Table | Encrypted columns |
|---|---|
| `capture_events` | `payload_ciphertext` (raw prompt/tool/transcript body) |
| `local_sources` | `path_ciphertext`, `excerpt_ciphertext` |
| `offline_outbox` | `request_ciphertext` |
| `policy_cache` | `policy_ciphertext` |
| `context_cache` | `pack_ciphertext` |
| `durable_queue` | `payload_ciphertext` |

The envelope's associated data binds each ciphertext to its table, column, record id and
local schema version, so a ciphertext cannot be moved between rows or columns and still
decrypt.

## Key management

The data-encryption key is 32 random bytes generated on first use and stored in the OS
credential vault through `@napi-rs/keyring`:

| Platform | Backing store |
|---|---|
| Windows | DPAPI / Credential Manager, current user only |
| macOS | Keychain Services, app-scoped item |
| Linux desktop | Secret Service keyring in the login session |

The key never appears in the SQLite file, the repository, an environment file, logs or
telemetry. The store only ever records the opaque **alias** (`shoo.local-store.dek`).

### Documented fallback for CI and headless environments

There is exactly one fallback and it is never selected automatically:

```bash
export SHOO_LOCAL_KEY_PROVIDER=file
export SHOO_LOCAL_KEY_FILE=./.data/local/dev-key.json
```

`FileKeyProvider` writes an owner-only (`0600`) JSON file. Use it for CI and headless
Linux without a Secret Service keyring. It is **not** an acceptable configuration for
restricted capture on a developer machine: docs/34 requires either a passphrase-derived
unlock or refusing persistent restricted capture, and Shoo never silently degrades to a
plaintext key file.

`EphemeralKeyProvider` keeps a key in process memory only and exists for tests.

## Failure behaviour

A record whose ciphertext fails authentication — wrong key, corrupted file, tampering — is
written to the `quarantine` table and read as `null`. The store never overwrites or deletes
unreadable evidence: recovery or resync is a user decision (docs/34 "SQLite key missing").

## Migrations

`migrations/local/*.sql` are applied in filename order and recorded with their checksum. A
migration whose contents change after it has been applied is a hard error; add a new
migration instead.
