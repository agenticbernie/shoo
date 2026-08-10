-- 0004_memory.sql
--
-- Lock risk:      low (new tables)
-- Data volume:    none
-- Rollback:       DROP TABLE in reverse dependency order
-- Observability:  authority/conflict counters; canonical uniqueness violations alert
--
-- Evidence, memory and authority (docs/36 "Evidence, memory and authority", docs/30).
--
-- The database mirrors the domain prohibitions from docs/36 "Orthogonal state checks"
-- as CHECK constraints so a bug in application code cannot persist an impossible state.

CREATE TABLE memory.evidence_records (
  id                      uuid PRIMARY KEY,
  organization_id         uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id              uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  session_id              uuid REFERENCES continuity.sessions (id) ON DELETE SET NULL,
  source_type             text NOT NULL CHECK (source_type IN (
                            'prompt', 'assistant_message', 'tool_call', 'file_change',
                            'test_run', 'command', 'git', 'user_note')),
  source_ref              text,
  content_hash            text NOT NULL,
  -- Cloud content is nullable by default; restricted evidence never carries a body.
  content_excerpt         text,
  classification          platform.classification NOT NULL,
  local_availability      text NOT NULL DEFAULT 'unknown'
                            CHECK (local_availability IN ('available', 'expired', 'purged', 'unknown')),
  affected_paths          text[] NOT NULL DEFAULT '{}',
  policy_version          integer NOT NULL CHECK (policy_version > 0),
  occurred_at             timestamptz NOT NULL,
  received_at             timestamptz NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evidence_restricted_has_no_cloud_body
    CHECK (classification <> 'restricted' OR content_excerpt IS NULL)
);
CREATE UNIQUE INDEX evidence_records_identity_key
  ON memory.evidence_records (project_id, source_type, content_hash, occurred_at);
CREATE INDEX evidence_records_session_idx ON memory.evidence_records (project_id, session_id);
CREATE INDEX evidence_records_paths_idx ON memory.evidence_records USING gin (affected_paths);

CREATE OR REPLACE FUNCTION memory.reject_evidence_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.content_hash IS DISTINCT FROM OLD.content_hash
     OR NEW.occurred_at IS DISTINCT FROM OLD.occurred_at
     OR NEW.source_type IS DISTINCT FROM OLD.source_type THEN
    RAISE EXCEPTION 'evidence identity and hash are immutable'
      USING ERRCODE = 'restrict_violation';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER evidence_records_immutable_identity
  BEFORE UPDATE ON memory.evidence_records
  FOR EACH ROW EXECUTE FUNCTION memory.reject_evidence_mutation();

CREATE TABLE memory.memory_records (
  id                  uuid PRIMARY KEY,
  organization_id     uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id          uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  memory_type         memory.memory_type NOT NULL,
  subject_type        text NOT NULL,
  subject_key         text NOT NULL,
  branch_scope        text,
  work_unit_id        uuid REFERENCES continuity.work_units (id) ON DELETE SET NULL,
  -- Set NOT NULL by 0004b once the first revision exists; maintained transactionally.
  current_revision_id uuid,
  version             bigint NOT NULL DEFAULT 1,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_records_reserved_types_unused
    CHECK (memory_type NOT IN ('handoff', 'dependency'))
);
CREATE INDEX memory_records_subject_idx
  ON memory.memory_records (project_id, subject_type, subject_key, branch_scope);
CREATE INDEX memory_records_work_unit_idx ON memory.memory_records (project_id, work_unit_id);
CREATE INDEX memory_records_type_idx ON memory.memory_records (project_id, memory_type);

CREATE TABLE memory.memory_revisions (
  id                      uuid PRIMARY KEY,
  organization_id         uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id              uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  memory_id               uuid NOT NULL REFERENCES memory.memory_records (id) ON DELETE CASCADE,
  revision                integer NOT NULL CHECK (revision > 0),
  content                 jsonb NOT NULL,
  content_hash            text NOT NULL,
  claim_status            memory.claim_status NOT NULL,
  verification_status     memory.verification_status NOT NULL DEFAULT 'unverified',
  authority_status        memory.authority_status NOT NULL DEFAULT 'session',
  visibility_scope        platform.visibility_scope NOT NULL DEFAULT 'private',
  durability_status       memory.durability_status NOT NULL DEFAULT 'operational',
  freshness_status        memory.freshness_status NOT NULL DEFAULT 'current',
  lineage_status          memory.lineage_status NOT NULL DEFAULT 'active',
  effective_at            timestamptz NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  created_by_user_id      uuid REFERENCES iam.users (id),
  extractor_version       text,
  rule_version            text,
  model_version           text,
  predecessor_revision_id uuid REFERENCES memory.memory_revisions (id),

  -- docs/36 "Orthogonal state checks", mirrored from @shoo/domain-memory.
  CONSTRAINT revisions_canonical_requires_verification
    CHECK (authority_status <> 'canonical' OR verification_status <> 'unverified'),
  CONSTRAINT revisions_superseded_is_historical
    CHECK (lineage_status <> 'superseded' OR authority_status = 'historical'),
  CONSTRAINT revisions_historical_is_not_active
    CHECK (authority_status <> 'historical' OR lineage_status <> 'active'),
  CONSTRAINT revisions_expired_is_not_active_truth
    CHECK (NOT (verification_status = 'verified'
                AND freshness_status = 'expired'
                AND lineage_status = 'active'))
);
CREATE UNIQUE INDEX memory_revisions_memory_revision_key
  ON memory.memory_revisions (memory_id, revision);
CREATE INDEX memory_revisions_authority_idx
  ON memory.memory_revisions (project_id, authority_status, lineage_status);
CREATE INDEX memory_revisions_content_gin ON memory.memory_revisions USING gin (content jsonb_path_ops);

ALTER TABLE memory.memory_records
  ADD CONSTRAINT memory_records_current_revision_fk
  FOREIGN KEY (current_revision_id) REFERENCES memory.memory_revisions (id)
  DEFERRABLE INITIALLY DEFERRED;

-- The typed subject is denormalized onto the revision so the "one active canonical
-- revision" invariant can be a partial unique index rather than application logic.
-- The trigger below keeps it consistent with the parent record, so the denormalization
-- cannot drift.
ALTER TABLE memory.memory_revisions
  ADD COLUMN subject_type text,
  ADD COLUMN subject_key text,
  ADD COLUMN branch_scope text;

CREATE OR REPLACE FUNCTION memory.sync_revision_subject() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  rec RECORD;
BEGIN
  SELECT subject_type, subject_key, branch_scope INTO rec
  FROM memory.memory_records WHERE id = NEW.memory_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'revision references an unknown memory record'
      USING ERRCODE = 'foreign_key_violation';
  END IF;
  NEW.subject_type = rec.subject_type;
  NEW.subject_key = rec.subject_key;
  NEW.branch_scope = rec.branch_scope;
  RETURN NEW;
END
$$;

CREATE TRIGGER memory_revisions_sync_subject
  BEFORE INSERT OR UPDATE ON memory.memory_revisions
  FOR EACH ROW EXECUTE FUNCTION memory.sync_revision_subject();

-- One active canonical revision per typed subject and exact scope (docs/36).
-- A concurrent accepted candidate must therefore become a conflict rather than
-- silently replacing the incumbent. COALESCE keeps project-wide scope (NULL branch)
-- distinct from any named branch instead of exempting it from the constraint.
CREATE UNIQUE INDEX memory_revisions_one_active_canonical
  ON memory.memory_revisions (
    project_id, subject_type, subject_key, COALESCE(branch_scope, '')
  )
  WHERE authority_status = 'canonical' AND lineage_status = 'active';

CREATE TABLE memory.memory_evidence (
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  revision_id     uuid NOT NULL REFERENCES memory.memory_revisions (id) ON DELETE CASCADE,
  evidence_id     uuid NOT NULL REFERENCES memory.evidence_records (id) ON DELETE RESTRICT,
  support_type    text NOT NULL CHECK (support_type IN ('supports', 'contradicts', 'contextualizes')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (revision_id, evidence_id, support_type)
);
CREATE INDEX memory_evidence_evidence_idx ON memory.memory_evidence (evidence_id);

CREATE TABLE memory.supersession_edges (
  id                      uuid PRIMARY KEY,
  organization_id         uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id              uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  predecessor_revision_id uuid NOT NULL REFERENCES memory.memory_revisions (id) ON DELETE CASCADE,
  successor_revision_id   uuid NOT NULL REFERENCES memory.memory_revisions (id) ON DELETE CASCADE,
  reason                  text NOT NULL
    CHECK (reason IN ('correction', 'supersession', 'retraction', 'conflict_resolution')),
  actor_user_id           uuid REFERENCES iam.users (id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT supersession_no_self_edge
    CHECK (predecessor_revision_id <> successor_revision_id)
);
-- At most one successor per predecessor keeps "current" unambiguous and, combined
-- with the no-self-edge check, keeps lineage acyclic for the shapes Shoo creates.
CREATE UNIQUE INDEX supersession_edges_predecessor_key
  ON memory.supersession_edges (predecessor_revision_id);
CREATE INDEX supersession_edges_successor_idx
  ON memory.supersession_edges (successor_revision_id);

CREATE TABLE memory.decisions (
  id                uuid PRIMARY KEY,
  organization_id   uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id        uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  memory_id         uuid NOT NULL REFERENCES memory.memory_records (id) ON DELETE CASCADE,
  decision_key      text NOT NULL,
  impact            text NOT NULL CHECK (impact IN ('local', 'project', 'organization')),
  approval_scope    memory.authority_status NOT NULL,
  approved_by_user_id uuid REFERENCES iam.users (id),
  step_up_verified  boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT decisions_project_impact_requires_step_up
    CHECK (impact = 'local' OR step_up_verified)
);
CREATE UNIQUE INDEX decisions_project_key ON memory.decisions (project_id, decision_key, memory_id);

CREATE TABLE memory.conflicts (
  id                    uuid PRIMARY KEY,
  organization_id       uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id            uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  subject_type          text NOT NULL,
  subject_key           text NOT NULL,
  branch_scope          text,
  scope_fingerprint     text NOT NULL,
  state                 memory.conflict_state NOT NULL DEFAULT 'active',
  severity              memory.conflict_severity NOT NULL DEFAULT 'medium',
  detected_rule_version text NOT NULL,
  detected_at           timestamptz NOT NULL DEFAULT now(),
  resolved_at           timestamptz,
  version               bigint NOT NULL DEFAULT 1,
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conflicts_terminal_has_resolution
    CHECK ((state IN ('resolved', 'dismissed')) = (resolved_at IS NOT NULL))
);
-- One active equivalent conflict per subject/scope fingerprint (docs/36).
CREATE UNIQUE INDEX conflicts_active_fingerprint_key
  ON memory.conflicts (project_id, scope_fingerprint)
  WHERE state IN ('active', 'resolving');

CREATE TABLE memory.conflict_sides (
  id            uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id    uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  conflict_id   uuid NOT NULL REFERENCES memory.conflicts (id) ON DELETE CASCADE,
  side_label    text NOT NULL,
  revision_id   uuid REFERENCES memory.memory_revisions (id) ON DELETE CASCADE,
  evidence_id   uuid REFERENCES memory.evidence_records (id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conflict_sides_reference_something
    CHECK (revision_id IS NOT NULL OR evidence_id IS NOT NULL)
);
CREATE UNIQUE INDEX conflict_sides_key ON memory.conflict_sides (conflict_id, side_label);
CREATE INDEX conflict_sides_conflict_idx ON memory.conflict_sides (conflict_id);

CREATE TABLE memory.resolutions (
  id                      uuid PRIMARY KEY,
  organization_id         uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id              uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  conflict_id             uuid NOT NULL REFERENCES memory.conflicts (id) ON DELETE CASCADE,
  action                  memory.resolution_action NOT NULL,
  selected_revision_id    uuid REFERENCES memory.memory_revisions (id),
  created_revision_id     uuid REFERENCES memory.memory_revisions (id),
  scope_restriction       jsonb,
  rationale               text NOT NULL CHECK (length(btrim(rationale)) > 0),
  actor_user_id           uuid NOT NULL REFERENCES iam.users (id),
  invalidation_watermark  timestamptz NOT NULL,
  resolved_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resolutions_select_requires_revision
    CHECK (action <> 'select' OR selected_revision_id IS NOT NULL),
  CONSTRAINT resolutions_merge_requires_successor
    CHECK (action <> 'merge' OR created_revision_id IS NOT NULL),
  CONSTRAINT resolutions_scope_requires_restriction
    CHECK (action <> 'scope' OR scope_restriction IS NOT NULL)
);
CREATE UNIQUE INDEX resolutions_conflict_key ON memory.resolutions (conflict_id);

CREATE OR REPLACE FUNCTION memory.reject_resolution_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'resolutions are immutable' USING ERRCODE = 'restrict_violation';
END
$$;

CREATE TRIGGER resolutions_immutable
  BEFORE UPDATE OR DELETE ON memory.resolutions
  FOR EACH ROW EXECUTE FUNCTION memory.reject_resolution_mutation();

CREATE TRIGGER memory_records_touch BEFORE UPDATE ON memory.memory_records
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
CREATE TRIGGER conflicts_touch BEFORE UPDATE ON memory.conflicts
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
