-- 0006_platform_and_audit.sql
--
-- Lock risk:      low (new tables)
-- Data volume:    none; event ledger and outbox grow fastest in production
-- Rollback:       DROP TABLE in reverse dependency order
-- Observability:  queue age, retries, dead-letter count, durable pending age
--
-- Platform and audit tables (docs/36 "Platform and durable operations").

CREATE TABLE platform.sync_policies (
  id                  uuid PRIMARY KEY,
  organization_id     uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id          uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  version             integer NOT NULL CHECK (version > 0),
  default_route       platform.route_decision NOT NULL,
  rules               jsonb NOT NULL DEFAULT '[]'::jsonb,
  trust_mode          platform.trust_mode NOT NULL DEFAULT 'manual',
  active_from         timestamptz NOT NULL DEFAULT now(),
  authored_by_user_id uuid NOT NULL REFERENCES iam.users (id),
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX sync_policies_version_key ON platform.sync_policies (project_id, version);

-- Policy versions are immutable (docs/36).
CREATE OR REPLACE FUNCTION platform.reject_policy_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'sync policy versions are immutable; create a new version'
    USING ERRCODE = 'restrict_violation';
END
$$;

CREATE TRIGGER sync_policies_immutable
  BEFORE UPDATE OR DELETE ON platform.sync_policies
  FOR EACH ROW EXECUTE FUNCTION platform.reject_policy_mutation();

CREATE TABLE platform.route_decisions (
  id                    uuid PRIMARY KEY,
  organization_id       uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id            uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  subject_kind          text NOT NULL CHECK (subject_kind IN ('evidence', 'revision')),
  subject_id            uuid NOT NULL,
  policy_version        integer NOT NULL,
  classification        platform.classification NOT NULL,
  local_decision        platform.route_decision NOT NULL,
  operational_decision  platform.route_decision NOT NULL,
  durable_decision      platform.route_decision NOT NULL,
  shared_decision       platform.route_decision NOT NULL,
  matched_rule_id       text,
  reason_code           text NOT NULL,
  decided_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT route_decisions_restricted_stays_local
    CHECK (classification <> 'restricted'
           OR (operational_decision = 'denied'
               AND durable_decision = 'denied'
               AND shared_decision = 'denied'))
);
CREATE UNIQUE INDEX route_decisions_subject_policy_key
  ON platform.route_decisions (subject_kind, subject_id, policy_version);

CREATE TRIGGER route_decisions_immutable
  BEFORE UPDATE OR DELETE ON platform.route_decisions
  FOR EACH ROW EXECUTE FUNCTION platform.reject_policy_mutation();

-- ---------------------------------------------------------------------------
-- Append-only event ledger. Written in the same transaction as the aggregate
-- mutation and the outbox job (docs/29 "Transactional outbox").
-- ---------------------------------------------------------------------------
CREATE TABLE platform.event_ledger (
  event_id            uuid PRIMARY KEY,
  event_type          text NOT NULL,
  schema_version      integer NOT NULL CHECK (schema_version > 0),
  organization_id     uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id          uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  work_unit_id        uuid,
  session_id          uuid,
  actor_type          platform.actor_type NOT NULL,
  actor_user_id       uuid,
  actor_device_id     uuid,
  actor_agent_id      uuid,
  source_client       platform.client_name NOT NULL,
  source_event_id     text NOT NULL,
  adapter_instance_id text,
  adapter_version     text,
  source_sequence     bigint,
  occurred_at         timestamptz NOT NULL,
  received_at         timestamptz NOT NULL DEFAULT now(),
  policy_version      integer NOT NULL,
  correlation_id      uuid NOT NULL,
  causation_id        uuid,
  idempotency_key     text NOT NULL,
  payload             jsonb NOT NULL,
  payload_hash        text NOT NULL,
  CONSTRAINT event_ledger_reserved_types_unused
    CHECK (event_type NOT LIKE 'blocker.%'
           AND event_type NOT LIKE 'dependency.%'
           AND event_type NOT LIKE 'handoff.%')
);
-- Duplicate uniqueness key: org + project + adapter instance + source event id (docs/29).
CREATE UNIQUE INDEX event_ledger_source_identity_key
  ON platform.event_ledger (
    organization_id, project_id, COALESCE(adapter_instance_id, ''), source_event_id
  );
CREATE INDEX event_ledger_project_time_idx
  ON platform.event_ledger (project_id, occurred_at DESC);
CREATE INDEX event_ledger_correlation_idx ON platform.event_ledger (correlation_id);
CREATE INDEX event_ledger_type_idx ON platform.event_ledger (project_id, event_type, occurred_at DESC);

CREATE OR REPLACE FUNCTION platform.reject_ledger_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'the event ledger is append-only' USING ERRCODE = 'restrict_violation';
END
$$;

CREATE TRIGGER event_ledger_append_only
  BEFORE UPDATE OR DELETE ON platform.event_ledger
  FOR EACH ROW EXECUTE FUNCTION platform.reject_ledger_mutation();

CREATE TABLE platform.outbox_jobs (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  job_class       text NOT NULL CHECK (job_class IN (
                    'extraction', 'indexing', 'context_build', 'durable_persist',
                    'durable_reconcile', 'projection_rebuild', 'retention', 'export', 'deletion')),
  operation_key   text NOT NULL,
  payload_ref     text NOT NULL,
  status          platform.outbox_status NOT NULL DEFAULT 'pending',
  attempts        integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts    integer NOT NULL DEFAULT 8 CHECK (max_attempts > 0),
  lease_owner     text,
  lease_expires_at timestamptz,
  next_run_at     timestamptz NOT NULL DEFAULT now(),
  last_error_code text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outbox_lease_consistent
    CHECK ((status = 'leased') = (lease_owner IS NOT NULL AND lease_expires_at IS NOT NULL))
);
-- Deterministic operation key: re-enqueueing identical work is a no-op (docs/29).
CREATE UNIQUE INDEX outbox_jobs_operation_key ON platform.outbox_jobs (operation_key);
-- Partial index over runnable jobs keeps the claim query cheap under load (FIT-015).
CREATE INDEX outbox_jobs_runnable_idx
  ON platform.outbox_jobs (job_class, next_run_at)
  WHERE status IN ('pending', 'leased');
CREATE INDEX outbox_jobs_dead_letter_idx
  ON platform.outbox_jobs (project_id, updated_at DESC)
  WHERE status = 'dead_letter';

CREATE TABLE platform.operations (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid REFERENCES iam.projects (id) ON DELETE CASCADE,
  operation_type  text NOT NULL,
  status          platform.operation_status NOT NULL DEFAULT 'pending',
  progress        double precision CHECK (progress IS NULL OR (progress >= 0 AND progress <= 1)),
  -- Safe metadata only: no project content travels through an operation handle.
  result_ref      text,
  error_code      text,
  requested_by_user_id uuid REFERENCES iam.users (id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL
);
CREATE INDEX operations_project_idx ON platform.operations (project_id, created_at DESC);
CREATE INDEX operations_expiry_idx ON platform.operations (expires_at);

CREATE TABLE platform.durable_operations (
  id                    uuid PRIMARY KEY,
  organization_id       uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id            uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  revision_id           uuid NOT NULL REFERENCES memory.memory_revisions (id) ON DELETE CASCADE,
  namespace_binding_id  uuid NOT NULL REFERENCES iam.namespace_registry (id) ON DELETE RESTRICT,
  trust_mode            platform.trust_mode NOT NULL DEFAULT 'manual',
  operation_key         text NOT NULL,
  status                memory.durability_status NOT NULL DEFAULT 'durable_pending',
  job_id                text,
  blob_locator          text,
  payload_hash          text,
  local_schema_version  integer NOT NULL,
  remote_schema_version integer,
  attempts              integer NOT NULL DEFAULT 0,
  last_error_code       text,
  requested_at          timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
-- Unique record/namespace/trust/schema operation key (docs/36).
CREATE UNIQUE INDEX durable_operations_operation_key
  ON platform.durable_operations
     (revision_id, namespace_binding_id, trust_mode, local_schema_version);
CREATE INDEX durable_operations_status_idx
  ON platform.durable_operations (project_id, status, updated_at DESC);

CREATE TABLE platform.compatibility_records (
  id              uuid PRIMARY KEY,
  organization_id uuid REFERENCES iam.organizations (id) ON DELETE CASCADE,
  component       text NOT NULL
                    CHECK (component IN ('shoo_local', 'shoo_api', 'shoo_worker', 'memwal_sdk')),
  local_version   integer NOT NULL,
  remote_version  integer NOT NULL,
  min_supported   integer NOT NULL,
  max_supported   integer NOT NULL,
  result          text NOT NULL
                    CHECK (result IN ('compatible', 'upgrade_recommended', 'blocked')),
  checked_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX compatibility_records_component_idx
  ON platform.compatibility_records (component, checked_at DESC);

CREATE TABLE platform.feature_flags (
  key             text PRIMARY KEY,
  flag_type       text NOT NULL
                    CHECK (flag_type IN ('release', 'kill_switch', 'compatibility', 'experiment')),
  owner_user_id   uuid NOT NULL REFERENCES iam.users (id),
  default_enabled boolean NOT NULL DEFAULT false,
  description     text NOT NULL,
  removal_story   text NOT NULL CHECK (length(btrim(removal_story)) > 0),
  expires_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  -- A flag may never gate a protected capability (docs/65 "Feature-flag policy").
  CONSTRAINT feature_flags_not_protected
    CHECK (key !~* '(rls|row_level_security|authorization|authz|citation|provenance|privacy|consent|audit)')
);

CREATE TABLE platform.flag_assignments (
  key             text NOT NULL REFERENCES platform.feature_flags (key) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid REFERENCES iam.projects (id) ON DELETE CASCADE,
  enabled         boolean NOT NULL,
  assigned_at     timestamptz NOT NULL DEFAULT now()
);
-- One assignment per flag and scope; a NULL project means the whole organization.
CREATE UNIQUE INDEX flag_assignments_scope_key
  ON platform.flag_assignments
     (key, organization_id, COALESCE(project_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE TABLE platform.deletion_status (
  project_id              uuid PRIMARY KEY REFERENCES iam.projects (id) ON DELETE CASCADE,
  organization_id         uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  local                   text NOT NULL DEFAULT 'not_started',
  operational             text NOT NULL DEFAULT 'not_started',
  search_index            text NOT NULL DEFAULT 'not_started',
  backups                 text NOT NULL DEFAULT 'not_started',
  durable_recall_mapping  text NOT NULL DEFAULT 'not_started',
  -- Shoo cannot guarantee physical Walrus expiry, and must never claim it (docs/29).
  durable_blob_expiry     text NOT NULL DEFAULT 'not_guaranteed'
                            CHECK (durable_blob_expiry IN ('not_guaranteed', 'in_progress', 'completed')),
  unsupported_guarantees  text[] NOT NULL DEFAULT '{}',
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Audit: append-only, content-minimized, restricted role.
-- ---------------------------------------------------------------------------
CREATE TABLE audit.security_events (
  id              uuid PRIMARY KEY,
  organization_id uuid REFERENCES iam.organizations (id) ON DELETE SET NULL,
  project_id      uuid REFERENCES iam.projects (id) ON DELETE SET NULL,
  actor_type      platform.actor_type NOT NULL,
  actor_user_id   uuid,
  actor_device_id uuid,
  action          text NOT NULL,
  target_type     text NOT NULL,
  target_id       text,
  result          text NOT NULL CHECK (result IN ('allowed', 'denied', 'error')),
  reason_code     text NOT NULL,
  request_id      uuid,
  correlation_id  uuid,
  step_up_verified boolean NOT NULL DEFAULT false,
  occurred_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX security_events_scope_idx
  ON audit.security_events (organization_id, project_id, occurred_at DESC);
CREATE INDEX security_events_action_idx ON audit.security_events (action, occurred_at DESC);

CREATE OR REPLACE FUNCTION audit.reject_audit_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit records are append-only' USING ERRCODE = 'restrict_violation';
END
$$;

CREATE TRIGGER security_events_append_only
  BEFORE UPDATE OR DELETE ON audit.security_events
  FOR EACH ROW EXECUTE FUNCTION audit.reject_audit_mutation();

CREATE TRIGGER outbox_jobs_touch BEFORE UPDATE ON platform.outbox_jobs
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
CREATE TRIGGER operations_touch BEFORE UPDATE ON platform.operations
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
CREATE TRIGGER durable_operations_touch BEFORE UPDATE ON platform.durable_operations
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
