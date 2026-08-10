-- 0007_rls_policies.sql
--
-- Lock risk:      low (ALTER TABLE ... ENABLE RLS takes a brief ACCESS EXCLUSIVE lock)
-- Data volume:    none
-- Rollback:       DISABLE ROW LEVEL SECURITY per table and DROP POLICY
-- Observability:  the RLS matrix test (FIT-006) asserts cross-tenant denial per table
--
-- Tenant isolation as defence in depth (docs/33 "Balanced PostgreSQL isolation",
-- docs/36 "RLS contract").
--
-- The application already authorizes every request. RLS exists so a missing WHERE clause
-- cannot leak across tenants. Both are required; neither replaces the other.
--
-- Context is supplied per transaction with:
--   SET LOCAL shoo.organization_id = '...';
--   SET LOCAL shoo.project_id = '...';
-- Unset context yields NULL, and every predicate below is then false — fail closed.

-- --- organization-scoped tables --------------------------------------------
DO $$
DECLARE
  t text;
  org_scoped text[] := ARRAY[
    'iam.memberships',
    'iam.projects',
    'iam.devices',
    'iam.memwal_bindings',
    'iam.memwal_delegates',
    'iam.namespace_registry',
    'platform.compatibility_records',
    'platform.flag_assignments'
  ];
BEGIN
  FOREACH t IN ARRAY org_scoped LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY tenant_isolation ON %s
      USING (
        organization_id IS NOT DISTINCT FROM platform.current_organization_id()
      )
      WITH CHECK (
        organization_id IS NOT DISTINCT FROM platform.current_organization_id()
      )
    $f$, t);
  END LOOP;
END
$$;

-- `iam.organizations` keys on `id`, not `organization_id`, so it gets its own policy.
ALTER TABLE iam.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.organizations FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON iam.organizations
  USING (id = platform.current_organization_id())
  WITH CHECK (id = platform.current_organization_id());

-- `platform.compatibility_records` may carry a NULL organization for
-- deployment-wide checks; those rows are readable in any tenant context but
-- writable only by the migration/maintenance role, which is not a policy target.
DROP POLICY tenant_isolation ON platform.compatibility_records;
CREATE POLICY tenant_isolation ON platform.compatibility_records
  USING (
    organization_id IS NULL
    OR organization_id = platform.current_organization_id()
  )
  WITH CHECK (organization_id = platform.current_organization_id());

-- --- project-scoped tables --------------------------------------------------
DO $$
DECLARE
  t text;
  project_scoped text[] := ARRAY[
    'iam.project_grants',
    'continuity.repository_links',
    'continuity.work_units',
    'continuity.work_unit_links',
    'continuity.sessions',
    'continuity.checkpoints',
    'continuity.checkpoint_evidence',
    'continuity.partial_tails',
    'memory.evidence_records',
    'memory.memory_records',
    'memory.memory_revisions',
    'memory.memory_evidence',
    'memory.supersession_edges',
    'memory.decisions',
    'memory.conflicts',
    'memory.conflict_sides',
    'memory.resolutions',
    'intelligence.memory_embeddings',
    'intelligence.retrieval_requests',
    'intelligence.context_packs',
    'intelligence.context_pack_items',
    'intelligence.citations',
    'intelligence.answers',
    'platform.sync_policies',
    'platform.route_decisions',
    'platform.event_ledger',
    'platform.outbox_jobs',
    'platform.durable_operations',
    'platform.deletion_status'
  ];
BEGIN
  FOREACH t IN ARRAY project_scoped LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY tenant_isolation ON %s
      USING (
        organization_id = platform.current_organization_id()
        AND project_id = platform.current_project_id()
      )
      WITH CHECK (
        organization_id = platform.current_organization_id()
        AND project_id = platform.current_project_id()
      )
    $f$, t);
  END LOOP;
END
$$;

-- `platform.operations` may be organization-scoped (project_id NULL) for
-- account-level exports, so it gets its own predicate.
ALTER TABLE platform.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.operations FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON platform.operations
  USING (
    organization_id = platform.current_organization_id()
    AND (project_id IS NULL OR project_id = platform.current_project_id())
  )
  WITH CHECK (
    organization_id = platform.current_organization_id()
    AND (project_id IS NULL OR project_id = platform.current_project_id())
  );

-- `audit.security_events` is append-only and restricted: runtime roles may INSERT
-- within their tenant but may not read the audit trail at all. Reading is an
-- explicitly elevated, separately audited operation.
ALTER TABLE audit.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.security_events FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_append_only ON audit.security_events
  FOR INSERT
  WITH CHECK (
    organization_id IS NOT DISTINCT FROM platform.current_organization_id()
  );

-- `iam.users` is not tenant-scoped by column. It is reachable only through a
-- membership in the current organization.
ALTER TABLE iam.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam.users FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON iam.users
  USING (
    EXISTS (
      SELECT 1 FROM iam.memberships m
      WHERE m.user_id = iam.users.id
        AND m.organization_id = platform.current_organization_id()
        AND m.status <> 'removed'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM iam.memberships m
      WHERE m.user_id = iam.users.id
        AND m.organization_id = platform.current_organization_id()
        AND m.status <> 'removed'
    )
  );

-- `platform.feature_flags` is a global definition table with no tenant column.
-- Runtime roles read it; only the migration/maintenance role writes it.
ALTER TABLE platform.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.feature_flags FORCE ROW LEVEL SECURITY;
CREATE POLICY feature_flags_read ON platform.feature_flags FOR SELECT USING (true);

-- --- runtime role privileges ------------------------------------------------
-- The runtime roles get DML but never DDL and never table ownership, so FORCE RLS
-- always applies to them (docs/33 "Runtime connection role is not table owner,
-- superuser or BYPASSRLS").
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['shoo_app', 'shoo_worker'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA '
        || 'iam, continuity, memory, intelligence, platform TO %I', r);
      EXECUTE format('GRANT INSERT ON audit.security_events TO %I', r);
      EXECUTE format(
        'GRANT USAGE ON ALL SEQUENCES IN SCHEMA '
        || 'iam, continuity, memory, intelligence, platform TO %I', r);
      EXECUTE format(
        'GRANT EXECUTE ON FUNCTION platform.current_organization_id(), '
        || 'platform.current_project_id() TO %I', r);
    END IF;
  END LOOP;
END
$$;
