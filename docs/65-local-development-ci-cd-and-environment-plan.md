# Shoo Local Development, CI/CD and Environment Plan

- Version: 0.2
- Status: Accepted — Gate 8
- Owner role: Platform Engineer / DevOps Architect / Developer Experience Architect
- Dependencies: Deployment Strategy; Repository Architecture; Security and UI Quality Strategies
- Assumptions: Containers are available for cloud dependencies; real wallet/provider tests can run in isolated scheduled environments
- Unresolved questions: Artifact-signing service; Render plan and staging environment sizing
- Last decision: Use GitHub Actions, GHCR and separate Docker images for Web/API/Worker; Shoo Local remains a signed host package
- Next action: Build the authorized walking-skeleton pipeline and record Phase 9 evidence

## Local development goals

- One command starts Web, API, worker, PostgreSQL/pgvector and synthetic provider doubles.
- Shoo Local can attach to a fixture repository without touching a developer's real global agent configuration.
- Default fixtures contain no production data or real private keys.
- A developer can run one vertical journey and inspect content-safe traces locally.
- Database reset/migration/seed is deterministic.

## Local profiles

| Profile | Dependencies | Use |
|---|---|---|
| `core` | PostgreSQL, API, worker, local, synthetic auth/embedding/durable adapters | Fast default development |
| `web` | Core + Web/component sandbox | Product UI work |
| `integration` | Real Clerk test tenant, selected model sandbox | Contract/integration verification |
| `durable-test` | Test wallet, MemWal test account/namespace, test Walrus path | Scheduled/manual Manual round trip |
| `failure` | Fault proxies, clock/network/job controls | Resilience and recovery tests |

Real Durable profile requires explicit opt-in and separate low-value test wallet. It never uses a developer's owner wallet or production namespace.

## CI pipeline

```text
validate → unit/architecture → contracts → database/RLS → integration
        → security/accessibility → build/package → sign/attest
        → preview/staging → fitness/smoke → promote
```

CI/CD provider is GitHub Actions under the Shoo GitHub organization. Release workflows pin actions to immutable commit SHAs, use GitHub Environments for staging/production approvals and publish immutable Web/API/Worker images to GHCR by digest.

Production PostgreSQL remains managed and is not deployed from the application Docker Compose stack.

### Pull request checks

- install/lockfile integrity;
- format/lint/typecheck;
- unit/property tests;
- package dependency/forbidden-import tests;
- HTTP/MCP/event compatibility snapshots;
- migration dry run and RLS matrix;
- component accessibility and token checks;
- secret/SAST/dependency scans;
- affected integration tests;
- Coordination scope audit.

### Main/release checks

- full integration and current/previous client matrix;
- local package tests on Windows, macOS and Linux;
- encrypted spool crash/corruption/update tests;
- staging deployment and migration rehearsal;
- MemWal Manual test-namespace round trip;
- fault injection, backup/restore and content-safe telemetry scans;
- SBOM, provenance and signature verification.

## CI time budget

- PR fast path target: p95 under 12 minutes.
- Long OS/durable/load/security suites run in parallel or scheduled but block the relevant release gate.
- Flaky tests are quarantined only with owner, issue and expiry; critical security/contract tests cannot be ignored.

## Environment promotion

- Preview: synthetic data, per-PR expiry.
- Staging: production-like schema/topology, test identity/wallet/namespace.
- Production beta: real data only after applicable FIT/UI/SEC gates pass.
- Same immutable artifact is promoted; environment-specific configuration is injected and validated.
- Database migration is a separate visible stage before compatible app rollout.

## Feature-flag policy

Flag types:

- release flag: cohort enablement;
- operational kill switch: provider/job/adapter containment;
- compatibility flag: old/new contract transition;
- experiment flag: Phase 9 approved evaluation only.

Flags cannot disable RLS, authorization, citations, provenance, privacy controls or trust-mode consent. Every flag has owner, default, expiry and removal story.

## Release channels

- Shoo Cloud: progressive internal → 5% → 25% → 100% rollout.
- Shoo Local: internal/canary/stable signed channels.
- Compatibility manifest states minimum/maximum cloud and local contract versions.
- Security minimum version may pause sync but preserves local capture/export.

## Developer experience metrics

- clean checkout to healthy local core;
- incremental test duration;
- CI p50/p95;
- failed setup cause;
- local fixture journey completion;
- package/update failure rate.

These measure system friction, not developer performance.
