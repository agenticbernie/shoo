-- Local development role separation, mirroring docs/33 "Balanced PostgreSQL isolation".
--
--   shoo_migrator  : owns the schemas/tables, runs migrations. Never serves traffic.
--   shoo_app       : request-serving runtime role. NOT table owner, NOT superuser,
--                    NOT BYPASSRLS, so FORCE ROW LEVEL SECURITY applies to it.
--   shoo_worker    : background worker role with the same RLS exposure as shoo_app.
--
-- Production credentials are provisioned by infrastructure, not by this file.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shoo_app') THEN
    CREATE ROLE shoo_app LOGIN PASSWORD 'shoo_dev_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shoo_worker') THEN
    CREATE ROLE shoo_worker LOGIN PASSWORD 'shoo_dev_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE shoo TO shoo_app, shoo_worker;
