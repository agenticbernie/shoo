-- 0001_initial.sql — Shoo Local encrypted SQLite schema (docs/36 "Local SQLite schema").
--
-- Plaintext is limited to opaque ids, ordering/scheduling state, retry counters and
-- coarse timestamps required for offline operation. Every sensitive payload column is
-- a BLOB holding an AES-256-GCM envelope produced by packages/local-store/src/crypto.ts;
-- the key lives in the OS vault and is referenced only by an opaque alias (docs/34).

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- Non-secret device/project mapping. Selected metadata is cloud eligible.
CREATE TABLE IF NOT EXISTS local_identity (
  id                    TEXT PRIMARY KEY,
  device_id             TEXT NOT NULL,
  adapter_instance_id   TEXT NOT NULL,
  organization_id       TEXT,
  project_id            TEXT,
  -- Opaque alias of the data-encryption key in the OS vault. Never the key itself.
  key_alias             TEXT NOT NULL,
  repository_fingerprint TEXT,
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);

-- Raw and normalized local evidence with retention class.
-- `payload_ciphertext` holds the raw body; it is local by default and only leaves the
-- device when the effective policy explicitly permits it.
CREATE TABLE IF NOT EXISTS capture_events (
  id                  TEXT PRIMARY KEY,
  project_id          TEXT,
  session_id          TEXT,
  work_unit_id        TEXT,
  source_event_id     TEXT NOT NULL,
  adapter_instance_id TEXT NOT NULL,
  client              TEXT NOT NULL,
  event_type          TEXT NOT NULL,
  schema_version      INTEGER NOT NULL,
  source_sequence     INTEGER,
  content_hash        TEXT NOT NULL,
  classification      TEXT NOT NULL
                        CHECK (classification IN ('restricted', 'operational', 'durable_eligible')),
  retention_class     TEXT NOT NULL DEFAULT 'short',
  payload_ciphertext  BLOB,
  occurred_at         INTEGER NOT NULL,
  received_at         INTEGER NOT NULL,
  expires_at          INTEGER,
  policy_version      INTEGER NOT NULL
);
-- Duplicate key mirrors the cloud rule: adapter instance + source event id (docs/29).
CREATE UNIQUE INDEX IF NOT EXISTS capture_events_source_key
  ON capture_events (adapter_instance_id, source_event_id);
CREATE INDEX IF NOT EXISTS capture_events_expiry ON capture_events (expires_at);
CREATE INDEX IF NOT EXISTS capture_events_session ON capture_events (session_id, occurred_at);

-- Idempotent cloud requests and retry state. Cloud eligible after local policy.
CREATE TABLE IF NOT EXISTS offline_outbox (
  id                  TEXT PRIMARY KEY,
  operation_key       TEXT NOT NULL UNIQUE,
  endpoint            TEXT NOT NULL,
  method              TEXT NOT NULL,
  idempotency_key     TEXT NOT NULL,
  request_ciphertext  BLOB NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'in_flight', 'succeeded', 'failed', 'dead_letter')),
  attempts            INTEGER NOT NULL DEFAULT 0,
  max_attempts        INTEGER NOT NULL DEFAULT 8,
  next_run_at         INTEGER NOT NULL,
  last_error_code     TEXT,
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS offline_outbox_runnable
  ON offline_outbox (status, next_run_at);

-- File/tool/transcript references and encrypted excerpts. Reference or summary only
-- leaves the device by default.
CREATE TABLE IF NOT EXISTS local_sources (
  id                  TEXT PRIMARY KEY,
  capture_event_id    TEXT REFERENCES capture_events (id) ON DELETE CASCADE,
  source_type         TEXT NOT NULL,
  -- Paths are sensitive and therefore encrypted, not stored in the clear (docs/34).
  path_ciphertext     BLOB,
  excerpt_ciphertext  BLOB,
  content_hash        TEXT NOT NULL,
  availability        TEXT NOT NULL DEFAULT 'available'
                        CHECK (availability IN ('available', 'expired', 'purged', 'unknown')),
  created_at          INTEGER NOT NULL,
  expires_at          INTEGER
);
CREATE INDEX IF NOT EXISTS local_sources_event ON local_sources (capture_event_id);

-- Signed/versioned effective project policy. Refreshable from cloud.
CREATE TABLE IF NOT EXISTS policy_cache (
  project_id        TEXT PRIMARY KEY,
  policy_version    INTEGER NOT NULL,
  policy_ciphertext BLOB NOT NULL,
  signature         TEXT,
  fetched_at        INTEGER NOT NULL,
  expires_at        INTEGER NOT NULL
);

-- Encrypted context pack plus expiry/invalidation watermark. Never independent truth.
CREATE TABLE IF NOT EXISTS context_cache (
  pack_id                 TEXT PRIMARY KEY,
  project_id              TEXT NOT NULL,
  work_unit_id            TEXT,
  content_hash            TEXT NOT NULL,
  pack_ciphertext         BLOB NOT NULL,
  invalidation_watermark  INTEGER NOT NULL,
  created_at              INTEGER NOT NULL,
  expires_at              INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS context_cache_work_unit ON context_cache (project_id, work_unit_id);

-- Eligible record, Manual state and local operation key. Only ciphertext/vector or
-- cloud-safe status ever leaves the device.
CREATE TABLE IF NOT EXISTS durable_queue (
  id                  TEXT PRIMARY KEY,
  operation_key       TEXT NOT NULL UNIQUE,
  revision_id         TEXT NOT NULL,
  namespace           TEXT NOT NULL,
  trust_mode          TEXT NOT NULL DEFAULT 'manual' CHECK (trust_mode IN ('manual', 'managed')),
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'encrypting', 'submitted', 'persisted', 'failed')),
  payload_ciphertext  BLOB NOT NULL,
  payload_hash        TEXT NOT NULL,
  job_id              TEXT,
  blob_locator        TEXT,
  attempts            INTEGER NOT NULL DEFAULT 0,
  last_error_code     TEXT,
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS durable_queue_status ON durable_queue (status, updated_at);

-- Quarantine for records whose ciphertext failed authentication. The store never
-- overwrites unreadable data silently (docs/34 "SQLite key missing").
CREATE TABLE IF NOT EXISTS quarantine (
  id            TEXT PRIMARY KEY,
  table_name    TEXT NOT NULL,
  record_id     TEXT NOT NULL,
  reason        TEXT NOT NULL,
  detected_at   INTEGER NOT NULL
);
