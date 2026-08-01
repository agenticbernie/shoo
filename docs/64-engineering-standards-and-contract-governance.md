# Shoo Engineering Standards and Contract Governance

- Version: 0.1
- Status: Accepted — Gate 8
- Owner role: Staff Engineer / Developer Experience Architect / Security Architect
- Dependencies: Repository Architecture; API/MCP/Event Contracts; Threat Model
- Assumptions: Trunk-based development with short-lived branches is feasible; generated schemas can be validated across apps
- Unresolved questions: Exact lint/format tool choice; supported Node/browser/OS version table at kickoff
- Last decision: Treat contracts, migrations, security boundaries and observability as code-reviewed product behavior
- Next action: Encode standards as repository checks in the authorized skeleton and Slice A

## Development model

- Trunk-based development; short-lived feature branches and draft PRs.
- Every change links requirement/story/test IDs.
- Feature flags separate deployment from release.
- No long-running frontend/backend integration branches.
- Changes ship vertically or behind inactive flags.
- Conventional commit syntax is optional; intentional commit/PR scope is mandatory.

## TypeScript standards

- Strictest practical compiler mode; no unchecked implicit `any`.
- Runtime validation at every external boundary; static types are not validation.
- Domain identifiers use branded/value-object types, not interchangeable strings.
- Time distinguishes source, ingestion, effective and system timestamps.
- Errors are typed by stable class/code; provider errors are translated at adapter boundaries.
- Dependency injection is explicit through constructors/factories; no hidden global service locator.
- Side effects occur through ports; domain code remains deterministic.

## API versioning

- HTTP major version in path: `/v1`.
- MCP tool/resource names remain stable; schema includes contract version/capability manifest.
- Event envelope contains `event_type` and `schema_version`.
- Additive optional fields are backward compatible.
- Removing/renaming/semantic change requires new version and migration window.
- Cloud supports current and previous Shoo Local contract versions during beta rollout.
- Deprecation includes notice, telemetry, migration guide, minimum version and end date.

## Contract workflow

1. Update source schema and behavior note.
2. Generate/validate transport types if generation is used.
3. Add consumer/provider contract fixtures.
4. Check backward compatibility.
5. Update API/MCP examples, changelog and capability manifest.
6. Run current/previous client matrix.
7. Release behind compatibility flag where necessary.

Transport schemas cannot authorize an action; application policy always re-evaluates actor, scope, resource version and preview token.

## Database and migration standards

- Authored, reviewed SQL migrations; no automatic production schema synchronization.
- Expand → backfill → dual-read/write if necessary → verify → contract.
- Every migration declares lock risk, data volume, rollback/roll-forward and observability.
- Tenant tables include required scope and RLS policy in the same change.
- Runtime database role never owns tables or bypasses RLS.
- Migration fixtures cover empty, representative and malformed predecessor data.

## Security standards

- Secrets never enter repository, fixtures, logs or screenshots.
- Dependency pinning, lockfile, SBOM and provenance generated for release candidates.
- Secret scanning, SAST, dependency review and malicious fixture tests run in CI.
- High-impact actions use expected version, step-up/preview token and audit event.
- Sensitive local changes require platform security review and cross-OS tests.
- Retrieved content is untrusted data; it cannot construct tool calls or permissions.

## Observability standards

- Every user journey propagates content-safe trace/correlation IDs.
- Logs are structured with allowlisted fields; raw objects are not logged.
- Metrics name stage, status and latency without project content.
- New async work includes queue age, retries, terminal state and runbook.
- New external dependency includes health probe, timeout, circuit behavior and cost meter.

## Code review checklist

- Requirement and acceptance outcome preserved.
- Package/domain boundary respected.
- Authorization and RLS both covered.
- Idempotency/ordering/retry considered.
- Empty/partial/stale/conflict/denied/offline behavior covered where relevant.
- Telemetry and cost meter added without protected content.
- API/event compatibility assessed.
- Tests fail for the intended defect, not merely increase coverage.
- Docs/runbook/ADR updated for material change.
- No deferred Coordination scope leakage.

## Decision and ADR governance

Create an implementation ADR when a choice:

- changes a Gate 5–7 invariant;
- adds a persistence/consistency/security boundary;
- introduces a provider/platform dependency;
- changes public contracts or migration strategy;
- creates material lock-in or ongoing operational cost.

Minor local implementation detail does not require an ADR. Reversing an accepted gate decision requires returning to the owning decision gate, not an implementation-only PR.
