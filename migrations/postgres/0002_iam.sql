-- 0002_iam.sql
--
-- Lock risk:      low (new tables)
-- Data volume:    none
-- Rollback:       DROP TABLE in reverse dependency order
-- Observability:  runner records duration; RLS coverage asserted by the RLS matrix test
--
-- Identity and scope tables (docs/36 "Identity and scope", docs/33).
-- Shoo stores public wallet/delegate material only. No private key column exists
-- anywhere in this schema by design.

CREATE TABLE iam.organizations (
  id            uuid PRIMARY KEY,
  name          text NOT NULL CHECK (length(btrim(name)) > 0),
  slug          text NOT NULL,
  status        text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'deleting', 'deleted')),
  version       bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX organizations_slug_key ON iam.organizations (lower(slug));

CREATE TABLE iam.users (
  id                          uuid PRIMARY KEY,
  identity_provider           text NOT NULL DEFAULT 'clerk',
  identity_provider_subject   text NOT NULL,
  display_name                text,
  status                      text NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_provider_subject_key
  ON iam.users (identity_provider, identity_provider_subject);

CREATE TABLE iam.memberships (
  id                uuid PRIMARY KEY,
  organization_id   uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES iam.users (id) ON DELETE CASCADE,
  role              platform.role NOT NULL,
  status            text NOT NULL DEFAULT 'active'
                      CHECK (status IN ('invited', 'active', 'suspended', 'removed')),
  visibility_ceiling platform.visibility_scope NOT NULL DEFAULT 'project',
  version           bigint NOT NULL DEFAULT 1,
  joined_at         timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
-- One active membership per organization/user (docs/36).
CREATE UNIQUE INDEX memberships_active_org_user_key
  ON iam.memberships (organization_id, user_id)
  WHERE status <> 'removed';

CREATE TABLE iam.projects (
  id                    uuid PRIMARY KEY,
  organization_id       uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  name                  text NOT NULL CHECK (length(btrim(name)) > 0),
  slug                  text NOT NULL,
  status                text NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'archived', 'deleting', 'deleted')),
  retention_policy_id   text NOT NULL DEFAULT 'default',
  local_evidence_days   integer NOT NULL DEFAULT 30 CHECK (local_evidence_days > 0),
  operational_days      integer CHECK (operational_days IS NULL OR operational_days > 0),
  legal_hold            boolean NOT NULL DEFAULT false,
  default_visibility    platform.visibility_scope NOT NULL DEFAULT 'project',
  sync_policy_version   integer NOT NULL DEFAULT 1 CHECK (sync_policy_version > 0),
  version               bigint NOT NULL DEFAULT 1,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
-- Unique active project slug per organization (docs/36).
CREATE UNIQUE INDEX projects_active_slug_key
  ON iam.projects (organization_id, lower(slug))
  WHERE status IN ('active', 'archived');
CREATE INDEX projects_organization_idx ON iam.projects (organization_id, status);

CREATE TABLE iam.project_grants (
  id                  uuid PRIMARY KEY,
  organization_id     uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  project_id          uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  subject_type        text NOT NULL CHECK (subject_type IN ('user', 'device', 'agent', 'worker')),
  subject_id          text NOT NULL,
  role                platform.role NOT NULL,
  actions             text[] NOT NULL DEFAULT '{}',
  visibility_ceiling  platform.visibility_scope NOT NULL DEFAULT 'private',
  issued_by_user_id   uuid NOT NULL REFERENCES iam.users (id),
  expires_at          timestamptz,
  revoked_at          timestamptz,
  version             bigint NOT NULL DEFAULT 1,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX project_grants_active_subject_key
  ON iam.project_grants (project_id, subject_type, subject_id)
  WHERE revoked_at IS NULL;
CREATE INDEX project_grants_scope_idx ON iam.project_grants (organization_id, project_id);

CREATE TABLE iam.devices (
  id                      uuid PRIMARY KEY,
  organization_id         uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  user_id                 uuid NOT NULL REFERENCES iam.users (id) ON DELETE CASCADE,
  device_name             text NOT NULL,
  platform                text NOT NULL CHECK (platform IN ('windows', 'macos', 'linux')),
  public_key_fingerprint  text NOT NULL,
  adapter_capabilities    jsonb NOT NULL DEFAULT '[]'::jsonb,
  status                  text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  registered_at           timestamptz NOT NULL DEFAULT now(),
  revoked_at              timestamptz,
  version                 bigint NOT NULL DEFAULT 1,
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT devices_revocation_consistent
    CHECK ((status = 'revoked') = (revoked_at IS NOT NULL))
);
-- Unique device fingerprint per user (docs/36).
CREATE UNIQUE INDEX devices_user_fingerprint_key
  ON iam.devices (user_id, public_key_fingerprint);

CREATE TABLE iam.memwal_bindings (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES iam.users (id) ON DELETE CASCADE,
  owner_address   text NOT NULL,
  account_id      text NOT NULL,
  package_id      text NOT NULL,
  network         text NOT NULL CHECK (network IN ('mainnet', 'testnet', 'devnet', 'localnet')),
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'verified', 'revoked', 'mismatched')),
  trust_mode      platform.trust_mode NOT NULL DEFAULT 'manual',
  verified_at     timestamptz,
  version         bigint NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
-- Unique active owner/account/package/network tuple (docs/36).
CREATE UNIQUE INDEX memwal_bindings_active_tuple_key
  ON iam.memwal_bindings (owner_address, account_id, package_id, network)
  WHERE status <> 'revoked';

CREATE TABLE iam.memwal_delegates (
  id                              uuid PRIMARY KEY,
  organization_id                 uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  binding_id                      uuid NOT NULL REFERENCES iam.memwal_bindings (id) ON DELETE CASCADE,
  device_id                       uuid NOT NULL REFERENCES iam.devices (id) ON DELETE CASCADE,
  -- Public identifiers only. There is deliberately no private-key column.
  delegate_public_key             text NOT NULL,
  delegate_public_key_fingerprint text NOT NULL,
  onchain_status                  text NOT NULL DEFAULT 'pending'
    CHECK (onchain_status IN ('pending', 'registered', 'removal_pending', 'removed', 'failed')),
  registered_at                   timestamptz,
  created_at                      timestamptz NOT NULL DEFAULT now(),
  updated_at                      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX memwal_delegates_active_device_key
  ON iam.memwal_delegates (binding_id, device_id)
  WHERE onchain_status <> 'removed';

CREATE TABLE iam.namespace_registry (
  id              uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES iam.organizations (id) ON DELETE CASCADE,
  binding_id      uuid NOT NULL REFERENCES iam.memwal_bindings (id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES iam.projects (id) ON DELETE CASCADE,
  namespace       text NOT NULL,
  record_class    text NOT NULL,
  schema_version  integer NOT NULL DEFAULT 1 CHECK (schema_version > 0),
  -- Namespace is immutable once a durable write has happened (docs/36); the
  -- trigger below enforces that rather than trusting callers.
  immutable_since timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX namespace_registry_binding_namespace_key
  ON iam.namespace_registry (binding_id, namespace);
CREATE UNIQUE INDEX namespace_registry_project_key
  ON iam.namespace_registry (binding_id, project_id);

CREATE OR REPLACE FUNCTION iam.enforce_namespace_immutability() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.immutable_since IS NOT NULL AND NEW.namespace IS DISTINCT FROM OLD.namespace THEN
    RAISE EXCEPTION 'namespace is immutable after the first durable write'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER namespace_registry_immutability
  BEFORE UPDATE ON iam.namespace_registry
  FOR EACH ROW EXECUTE FUNCTION iam.enforce_namespace_immutability();

CREATE TRIGGER organizations_touch BEFORE UPDATE ON iam.organizations
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
CREATE TRIGGER projects_touch BEFORE UPDATE ON iam.projects
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
CREATE TRIGGER memberships_touch BEFORE UPDATE ON iam.memberships
  FOR EACH ROW EXECUTE FUNCTION platform.touch_updated_at();
