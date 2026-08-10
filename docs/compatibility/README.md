# Compatibility records

The current/previous client matrix and the capability manifest history (docs/64 "API
versioning", docs/65 "Release channels").

Each release records: HTTP contract version, MCP contract version and advertised protocol
versions, event envelope `schema_version`, the minimum and maximum supported Shoo Local
contract versions, and any security minimum version that pauses sync while preserving
local capture and export.

Additive optional fields are backward compatible. Removing or renaming a field, or
changing its meaning, requires a new version and a migration window with notice,
telemetry, a migration guide, a minimum version and an end date.
