# Developer tooling

- `postgres-init/` — role separation applied when the local PostgreSQL container is first
  created: `shoo_migrator` owns the schema, `shoo_app` and `shoo_worker` serve traffic
  without table ownership or `BYPASSRLS` so `FORCE ROW LEVEL SECURITY` applies to them.

Local profiles from docs/65 (`core`, `web`, `integration`, `durable-test`, `failure`) are
implemented here as they are needed. The real durable profile requires explicit opt-in and
a separate low-value test wallet; it never uses a developer's owner wallet or a production
namespace.
