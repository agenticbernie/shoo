-- 0003_continuity.sql
--
-- Lock risk:      low (new tables)
-- Data volume:    none
-- Rollback:       DROP TABLE in reverse dependency order
-- Observability:  session/checkpoint counters exported by the API; see docs/42
--
-- Project continuity tables (docs/36 "Continuity").
--
-- Structural invariant: no column here lets a session write work-unit completion.
-- Work state changes only through continuity.work_units, and every mutation carries
-- its own version for optimistic concurrency.

CREATE TABLE continuity.repository_links (
  id                      uuid PRIMARY KEY,
  organization_id         uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id              uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  repository_fingerprint  text NOT NULL,
  provider                text,
  provider_ref            text,
  local_identity_hash     text NOT NULL,
  status                  text NOT NULL DEFAULT 'unverified'
                            CHECK (status IN ('verified', 'unverified', 'mismatched')),
  version                 bigint NOT NULL DEFAULT 1,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
-- One verified active mapping per repository identity/project (docs/36).
CREATE UNIQUE INDEX repository_links_verified_key
  ON continuity.repository_links (project_id, repository_fingerprint)
  WHERE status = 'verified';

CREATE TABLE continuity.work_units (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  title           text NOT NULL CHECK (length(btrim(title)) > 0),
  objective       text,
  state           continuity.work_unit_state NOT NULL DEFAULT 'proposed',
  owner_user_id   uuid REFERENCES iam.users (id),
  branch          text,
  worktree_id     text,
  module_paths    text[] NOT NULL DEFAULT '{}',
  version         bigint NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX work_units_project_state_idx
  ON continuity.work_units (project_id, state, updated_at DESC);
CREATE INDEX work_units_owner_idx ON continuity.work_units (project_id, owner_user_id);

CREATE TABLE continuity.work_unit_links (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  work_unit_id    uuid NOT NULL REFERENCES continuity.work_units (id) ON DELETE CASCADE,
  link_type       text NOT NULL
                    CHECK (link_type IN ('issue', 'pull_request', 'ticket', 'document', 'commit')),
  external_id     text NOT NULL,
  url             text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX work_unit_links_key
  ON continuity.work_unit_links (work_unit_id, link_type, external_id);

CREATE TABLE continuity.sessions (
  id                            uuid PRIMARY KEY,
  organization_id               uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id                    uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  work_unit_id                  uuid REFERENCES continuity.work_units (id) ON DELETE SET NULL,
  developer_user_id             uuid NOT NULL REFERENCES iam.users (id),
  device_id                     uuid REFERENCES iam.devices (id),
  agent_id                      uuid,
  client                        platform.client_name NOT NULL,
  native_session_id             text NOT NULL,
  adapter_instance_id           text NOT NULL,
  session_state                 continuity.session_state NOT NULL DEFAULT 'starting',
  capture_state                 continuity.capture_state NOT NULL DEFAULT 'healthy',
  missing_capabilities          text[] NOT NULL DEFAULT '{}',
  capability_manifest_version   integer NOT NULL CHECK (capability_manifest_version > 0),
  policy_version                integer NOT NULL CHECK (policy_version > 0),
  last_checkpoint_id            uuid,
  partial_tail                  boolean NOT NULL DEFAULT false,
  version                       bigint NOT NULL DEFAULT 1,
  started_at                    timestamptz NOT NULL DEFAULT now(),
  ended_at                      timestamptz,
  updated_at                    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sessions_terminal_has_end
    CHECK ((session_state IN ('completed', 'failed', 'abandoned')) = (ended_at IS NOT NULL))
);
-- Idempotent session start: the same native session on the same adapter instance is
-- the same Shoo session (docs/37 "Idempotent session start").
CREATE UNIQUE INDEX sessions_native_identity_key
  ON continuity.sessions (project_id, adapter_instance_id, native_session_id);
CREATE INDEX sessions_work_unit_idx ON continuity.sessions (project_id, work_unit_id, started_at DESC);

CREATE TABLE continuity.checkpoints (
  id                        uuid PRIMARY KEY,
  organization_id           uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id                uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  work_unit_id              uuid NOT NULL REFERENCES continuity.work_units (id) ON DELETE CASCADE,
  session_id                uuid NOT NULL REFERENCES continuity.sessions (id) ON DELETE CASCADE,
  revision                  integer NOT NULL CHECK (revision > 0),
  reason                    continuity.checkpoint_reason NOT NULL,
  trigger_idempotency_key   text NOT NULL,
  objective                 text,
  progress                  text[] NOT NULL DEFAULT '{}',
  partial_changes           text[] NOT NULL DEFAULT '{}',
  tests                     jsonb NOT NULL DEFAULT '[]'::jsonb,
  blockers                  text[] NOT NULL DEFAULT '{}',
  uncertainty               text[] NOT NULL DEFAULT '{}',
  next_action               text,
  completeness              continuity.completeness_state NOT NULL DEFAULT 'partial',
  omitted_fields            jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at                timestamptz NOT NULL DEFAULT now()
);
-- Immutable checkpoint revision; unique session/trigger idempotency key (docs/36).
CREATE UNIQUE INDEX checkpoints_trigger_key
  ON continuity.checkpoints (session_id, trigger_idempotency_key, revision);
CREATE INDEX checkpoints_work_unit_idx
  ON continuity.checkpoints (project_id, work_unit_id, created_at DESC);

CREATE OR REPLACE FUNCTION continuity.reject_checkpoint_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'checkpoint revisions are immutable; write a new revision instead'
    USING ERRCODE = 'restrict_violation';
END
$$;

CREATE TRIGGER checkpoints_immutable
  BEFORE UPDATE OR DELETE ON continuity.checkpoints
  FOR EACH ROW EXECUTE FUNCTION continuity.reject_checkpoint_mutation();

CREATE TABLE continuity.checkpoint_evidence (
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  checkpoint_id   uuid NOT NULL REFERENCES continuity.checkpoints (id) ON DELETE CASCADE,
  evidence_id     uuid NOT NULL,
  PRIMARY KEY (checkpoint_id, evidence_id)
);

CREATE TABLE continuity.partial_tails (
  id                      uuid PRIMARY KEY,
  organization_id         uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id              uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  session_id              uuid NOT NULL REFERENCES continuity.sessions (id) ON DELETE CASCADE,
  from_event_id           text NOT NULL,
  completeness            continuity.completeness_state NOT NULL DEFAULT 'partial',
  local_source_available  boolean NOT NULL DEFAULT false,
  -- Explicitly non-verified material; retention controlled (docs/36).
  expires_at              timestamptz NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT partial_tails_never_complete CHECK (completeness <> 'complete')
);
CREATE INDEX partial_tails_session_idx ON continuity.partial_tails (session_id);
CREATE INDEX partial_tails_expiry_idx ON continuity.partial_tails (expires_at);

CREATE TRIGGER work_units_touch BEFORE UPDATE ON continuity.work_units
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
CREATE TRIGGER sessions_touch BEFORE UPDATE ON continuity.sessions
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
