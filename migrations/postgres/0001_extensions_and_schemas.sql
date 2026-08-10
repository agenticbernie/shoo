-- 0001_extensions_and_schemas.sql
--
-- Lock risk:      low (no existing objects)
-- Data volume:    none
-- Rollback:       DROP SCHEMA ... CASCADE; DROP EXTENSION vector
-- Observability:  migration runner records name, checksum and duration
--
-- Creates the six schema-owned areas from docs/36 and the extensions Shoo depends on.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE SCHEMA IF NOT EXISTS iam;
CREATE SCHEMA IF NOT EXISTS continuity;
CREATE SCHEMA IF NOT EXISTS memory;
CREATE SCHEMA IF NOT EXISTS intelligence;
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS audit;

COMMENT ON SCHEMA iam IS 'Organizations, users, membership, devices, grants, MemWal public bindings.';
COMMENT ON SCHEMA continuity IS 'Projects links, repositories, work units, sessions, checkpoints.';
COMMENT ON SCHEMA memory IS 'Evidence metadata, memories, revisions, decisions, conflicts, supersession.';
COMMENT ON SCHEMA intelligence IS 'Embeddings, retrieval requests, context packs, citations, answers.';
COMMENT ON SCHEMA platform IS 'Policies, event ledger, outbox, operations, durable mappings, compatibility.';
COMMENT ON SCHEMA audit IS 'Append-oriented security and high-impact action records.';

-- The request-serving roles may use the schemas but never own objects in them.
-- (Roles themselves are provisioned by infrastructure; tooling/dev/postgres-init
-- creates them for local development.)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shoo_app') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA iam, continuity, memory, intelligence, platform, audit TO shoo_app';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shoo_worker') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA iam, continuity, memory, intelligence, platform, audit TO shoo_worker';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- Shared enumerations. Values mirror @shoo/contracts-common exactly; adding a
-- value is additive, removing one is a breaking contract change (docs/64).
-- ---------------------------------------------------------------------------

CREATE TYPE platform.client_name AS ENUM ('opencode', 'codex', 'web', 'api', 'worker');
CREATE TYPE platform.actor_type AS ENUM ('user', 'device', 'worker', 'system');
CREATE TYPE platform.role AS ENUM (
  'project_owner', 'developer', 'device_adapter', 'background_worker', 'support_operator'
);
CREATE TYPE platform.visibility_scope AS ENUM ('private', 'project', 'team', 'organization');
CREATE TYPE platform.route_decision AS ENUM (
  'local_only', 'operational', 'durable', 'shared', 'denied'
);
CREATE TYPE platform.classification AS ENUM ('restricted', 'operational', 'durable_eligible');
CREATE TYPE platform.trust_mode AS ENUM ('manual', 'managed');

CREATE TYPE memory.claim_status AS ENUM ('observed', 'inferred', 'claimed');
CREATE TYPE memory.verification_status AS ENUM (
  'unverified', 'corroborated', 'verified', 'disputed'
);
CREATE TYPE memory.authority_status AS ENUM (
  'personal', 'session', 'branch', 'team', 'canonical', 'historical'
);
CREATE TYPE memory.durability_status AS ENUM (
  'local', 'operational', 'durable_pending', 'durable', 'durable_failed'
);
CREATE TYPE memory.freshness_status AS ENUM ('current', 'stale', 'expired', 'unknown');
CREATE TYPE memory.lineage_status AS ENUM ('active', 'superseded', 'deprecated', 'conflicted');
CREATE TYPE memory.memory_type AS ENUM (
  'fact', 'decision', 'task_state', 'progress', 'code_change', 'test_result', 'bug',
  'blocker', 'risk', 'convention', 'question', 'conflict_resolution',
  -- schema-reserved; MVP services do not write these (docs/30, FIT-025)
  'handoff', 'dependency'
);
CREATE TYPE memory.conflict_state AS ENUM ('active', 'resolving', 'resolved', 'dismissed');
CREATE TYPE memory.conflict_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE memory.resolution_action AS ENUM ('select', 'merge', 'scope', 'deprecate');

CREATE TYPE continuity.work_unit_state AS ENUM (
  'proposed', 'active', 'paused', 'blocked', 'in_review', 'completed', 'abandoned'
);
CREATE TYPE continuity.session_state AS ENUM (
  'starting', 'active', 'completed', 'failed', 'abandoned'
);
CREATE TYPE continuity.capture_state AS ENUM ('healthy', 'degraded', 'unsupported', 'disabled');
CREATE TYPE continuity.checkpoint_reason AS ENUM (
  'explicit', 'pre_compaction', 'stop', 'blocker', 'test_transition', 'recovery'
);
CREATE TYPE continuity.completeness_state AS ENUM ('complete', 'partial', 'unknown');

CREATE TYPE platform.operation_status AS ENUM (
  'pending', 'running', 'succeeded', 'failed', 'cancelled', 'expired'
);
CREATE TYPE platform.outbox_status AS ENUM (
  'pending', 'leased', 'succeeded', 'failed', 'dead_letter', 'cancelled'
);

-- ---------------------------------------------------------------------------
-- Tenant context helpers.
--
-- The API sets `shoo.organization_id` / `shoo.project_id` as transaction-local
-- settings inside the same transaction as the query (docs/33). The helpers below
-- return NULL when unset, which makes every RLS predicate evaluate to false —
-- i.e. missing context fails closed rather than exposing rows.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION platform.current_organization_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('shoo.organization_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION platform.current_project_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('shoo.project_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION platform.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$$;
