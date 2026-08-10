-- 0005_intelligence.sql
--
-- Lock risk:      low (new tables)
-- Data volume:    none; embedding index built empty
-- Rollback:       DROP TABLE in reverse dependency order
-- Observability:  index watermark, pack build latency and citation coverage
--
-- Intelligence tables (docs/36 "Intelligence", docs/30).
--
-- Embedding dimension is pinned per model row rather than globally: a dimension or
-- model change creates a NEW row and a parallel index; meaning is never mutated in
-- place (docs/36 "Migration and compatibility").

-- Default embedding width for the initial provider candidate. A different width is
-- stored in its own partial index added by a later migration.
CREATE TABLE intelligence.memory_embeddings (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  revision_id     uuid NOT NULL REFERENCES memory.memory_revisions (id) ON DELETE CASCADE,
  model           text NOT NULL,
  model_version   text NOT NULL,
  dimension       integer NOT NULL CHECK (dimension > 0),
  embedding       vector(1536) NOT NULL,
  index_state     text NOT NULL DEFAULT 'pending'
                    CHECK (index_state IN ('pending', 'indexed', 'stale', 'failed')),
  indexed_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX memory_embeddings_revision_model_key
  ON intelligence.memory_embeddings (revision_id, model, model_version);

-- Filtered ANN index over eligible rows only: superseded and unindexed vectors never
-- participate in retrieval (docs/36 "filtered index by active eligibility").
CREATE INDEX memory_embeddings_ann_idx
  ON intelligence.memory_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WHERE index_state = 'indexed';
CREATE INDEX memory_embeddings_project_idx
  ON intelligence.memory_embeddings (project_id, index_state);

CREATE TABLE intelligence.retrieval_requests (
  id                uuid PRIMARY KEY,
  organization_id   uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id        uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  work_unit_id      uuid REFERENCES continuity.work_units (id) ON DELETE SET NULL,
  intent            text NOT NULL
                      CHECK (intent IN ('current', 'history', 'rationale', 'occurrence', 'resume')),
  -- Content-minimized telemetry: scope filters and counts, never the query text.
  scope_filters     jsonb NOT NULL DEFAULT '{}'::jsonb,
  token_budget      integer NOT NULL CHECK (token_budget > 0),
  resolver_version  text NOT NULL,
  ranker_version    text NOT NULL,
  index_watermark   timestamptz NOT NULL,
  candidate_count   integer NOT NULL DEFAULT 0,
  selected_count    integer NOT NULL DEFAULT 0,
  requested_at      timestamptz NOT NULL DEFAULT now(),
  -- Short retention (docs/36); the retention worker prunes by this column.
  expires_at        timestamptz NOT NULL
);
CREATE INDEX retrieval_requests_project_idx
  ON intelligence.retrieval_requests (project_id, requested_at DESC);
CREATE INDEX retrieval_requests_expiry_idx ON intelligence.retrieval_requests (expires_at);

CREATE TABLE intelligence.context_packs (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  request_id      uuid NOT NULL REFERENCES intelligence.retrieval_requests (id) ON DELETE CASCADE,
  work_unit_id    uuid REFERENCES continuity.work_units (id) ON DELETE SET NULL,
  content_hash    text NOT NULL,
  completeness    continuity.completeness_state NOT NULL,
  freshness       memory.freshness_status NOT NULL,
  degraded_reasons text[] NOT NULL DEFAULT '{}',
  token_budget    integer NOT NULL CHECK (token_budget > 0),
  token_used      integer NOT NULL DEFAULT 0 CHECK (token_used >= 0),
  manifest        jsonb NOT NULL,
  sections        jsonb NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  invalidated_at  timestamptz,
  CONSTRAINT context_packs_within_budget CHECK (token_used <= token_budget)
);
CREATE INDEX context_packs_work_unit_idx
  ON intelligence.context_packs (project_id, work_unit_id, created_at DESC);
CREATE UNIQUE INDEX context_packs_content_hash_key
  ON intelligence.context_packs (project_id, content_hash);

-- Packs are immutable; only the invalidation marker may change.
CREATE OR REPLACE FUNCTION intelligence.reject_pack_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.content_hash IS DISTINCT FROM OLD.content_hash
     OR NEW.sections IS DISTINCT FROM OLD.sections
     OR NEW.manifest IS DISTINCT FROM OLD.manifest THEN
    RAISE EXCEPTION 'context packs are immutable; build a new pack instead'
      USING ERRCODE = 'restrict_violation';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER context_packs_immutable
  BEFORE UPDATE ON intelligence.context_packs
  FOR EACH ROW EXECUTE FUNCTION intelligence.reject_pack_mutation();

CREATE TABLE intelligence.context_pack_items (
  organization_id   uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id        uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  pack_id           uuid NOT NULL REFERENCES intelligence.context_packs (id) ON DELETE CASCADE,
  revision_id       uuid NOT NULL REFERENCES memory.memory_revisions (id) ON DELETE CASCADE,
  rank              integer NOT NULL CHECK (rank >= 0),
  score             double precision NOT NULL,
  -- Snapshot of the ranking explanation at build time (docs/36).
  score_features    jsonb NOT NULL DEFAULT '{}'::jsonb,
  token_allocation  integer NOT NULL CHECK (token_allocation >= 0),
  section           text NOT NULL,
  PRIMARY KEY (pack_id, revision_id)
);
CREATE UNIQUE INDEX context_pack_items_rank_key ON intelligence.context_pack_items (pack_id, rank);

CREATE TABLE intelligence.citations (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  consumer_type   text NOT NULL CHECK (consumer_type IN ('context_pack', 'answer', 'checkpoint')),
  consumer_id     uuid NOT NULL,
  claim_key       text NOT NULL,
  revision_id     uuid REFERENCES memory.memory_revisions (id) ON DELETE CASCADE,
  evidence_id     uuid REFERENCES memory.evidence_records (id) ON DELETE CASCADE,
  excerpt_policy  text NOT NULL DEFAULT 'restricted'
                    CHECK (excerpt_policy IN ('permitted', 'restricted', 'local_unavailable')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  -- Every citation must point at something citable.
  CONSTRAINT citations_reference_something
    CHECK (revision_id IS NOT NULL OR evidence_id IS NOT NULL)
);
CREATE INDEX citations_consumer_idx ON intelligence.citations (consumer_type, consumer_id);
CREATE UNIQUE INDEX citations_claim_key
  ON intelligence.citations (consumer_type, consumer_id, claim_key, COALESCE(revision_id, evidence_id));

CREATE TABLE intelligence.answers (
  id                    uuid PRIMARY KEY,
  organization_id       uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id            uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  request_id            uuid NOT NULL REFERENCES intelligence.retrieval_requests (id) ON DELETE CASCADE,
  intent                text NOT NULL,
  evidence_sufficiency  text NOT NULL
                          CHECK (evidence_sufficiency IN ('sufficient', 'partial', 'insufficient')),
  -- Facts, inferences and suggestions are stored separately (docs/30).
  facts                 jsonb NOT NULL DEFAULT '[]'::jsonb,
  inferences            jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggestions           jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_evidence      text[] NOT NULL DEFAULT '{}',
  content_hash          text NOT NULL,
  pack_id               uuid REFERENCES intelligence.context_packs (id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  expires_at            timestamptz NOT NULL,
  CONSTRAINT answers_insufficient_states_gap
    CHECK (evidence_sufficiency <> 'insufficient' OR cardinality(missing_evidence) > 0)
);
CREATE INDEX answers_request_idx ON intelligence.answers (request_id);
CREATE INDEX answers_expiry_idx ON intelligence.answers (expires_at);
