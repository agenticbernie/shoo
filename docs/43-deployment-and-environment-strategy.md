# Shoo Deployment and Environment Strategy

- Version: 0.2
- Status: Accepted — Decision Gate 5
- Owner role: Platform Engineer / DevOps Architect / Security Architect
- Dependencies: System Architecture; Security Threat Model; Deployment/Scale/Retention; SLO Design
- Assumptions: R0–R2 use paid Singapore-region services; PostgreSQL and container portability are preserved
- Unresolved questions: Final Render plan sizes; approved backup destination; domain and certificate ownership
- Last decision: Singapore-first, provider-portable deployment and signed prompted updates are approved
- Next action: Create an R0 environment and execute deployment, backup/restore and update-channel fitness tests

## Environment model

| Environment | Data | Access | Purpose | Promotion rule |
|---|---|---|---|---|
| Local development | synthetic fixtures only | developer machine | contracts, adapters, migrations, fault injection | tests pass locally |
| CI ephemeral | generated tenant-isolation fixtures | CI workload identity | unit, contract, architecture, migration and security tests | signed build provenance |
| Preview | synthetic or explicitly scrubbed | short-lived team access | PR integration and Web review | auto-expire; no durable production namespace |
| Staging | synthetic + designated test wallets/namespaces | restricted internal | production-like rehearsals and load/failure tests | release candidate passes fitness suite |
| Production beta | real user data by policy | least-privilege operational roles | R1–R3 user outcomes | progressive rollout and error-budget gate |

No production database, wallet namespace, delegate or identity tenant is shared with non-production environments.

## R0–R2 topology

- Shoo Web deployed separately from Shoo API/MCP Gateway.
- Shoo API and horizontally scalable workers deployed as versioned containers.
- Web, API and Worker use separate immutable Docker images; production managed PostgreSQL is not bundled in the application image.
- GitHub Actions builds/tests/attests images and publishes approved digests to GHCR.
- Shoo Local is a signed host package by default; Docker is limited to development, CI and explicitly constrained future headless use.
- Managed PostgreSQL with pgvector is the only operational truth store.
- Redis is absent by default; it may be introduced only as disposable cache after evidence.
- Shoo Local is distributed as signed platform packages and connects outbound over TLS.
- MemWal Manual operations execute in Shoo Local; Shoo Cloud stores only allowed operational metadata and verified durable mappings.
- API, workers and PostgreSQL are co-located in Singapore. CDN assets may be globally cached but never include project memory.

## Network and identity boundaries

- Public ingress terminates TLS at the managed edge and forwards only to Web/API/MCP surfaces.
- PostgreSQL accepts connections only from approved runtime and migration paths.
- Runtime and migration database credentials are separate; runtime cannot bypass RLS.
- Worker egress to model, identity, MemWal and Walrus dependencies uses explicit allowlists where the provider permits.
- Support access is time-bound, audited and cannot read decrypted local evidence.

## Configuration and secrets

- Configuration is typed, schema-versioned and validated at process start.
- Secrets reside in the platform secret store; no secret is baked into image, repository or telemetry.
- Environment-specific identifiers include identity tenant, database, MemWal package/app ID and durable namespace prefix.
- Feature flags are server-controlled for cloud paths and signed/config-bound for local behavior.
- A trust-mode change requires user-visible consent; a flag cannot silently switch Manual to Managed.

## Build and release chain

1. Pin dependency versions and lockfiles.
2. Run unit, contract, architecture, schema, migration, RLS, threat-fixture and package tests.
3. Produce SBOM and provenance attestation.
4. Sign cloud image and Shoo Local package/channel manifest.
5. Deploy database-compatible cloud release to staging.
6. Run migration rehearsal, smoke tests and failure injections.
7. Promote progressively: internal → 5% → 25% → 100%, subject to error budget.
8. Retain the previous compatible artifact and tested rollback procedure.

## Shoo Local update policy

### R0

Signed manual update:

- CLI/Web surfaces show a verified release and checksum/signature status;
- user initiates installation;
- security-critical minimum-version policy may block cloud sync but must not delete local evidence.

### R1+

Prompted auto-update:

- signed channel manifest contains version, platform, hash, minimum compatible contract and rollback compatibility;
- package downloads in the background only when policy permits;
- installation requires an explicit prompt or configured maintenance policy;
- no silent update in MVP;
- failed update preserves old binary, encrypted spool and database schema compatibility.

Signing keys are offline/segmented from normal CI credentials. Key rotation and revocation are part of the incident runbook.

## Database migration policy

- Expand/contract only; no single release both removes old fields and requires new-only clients.
- Every migration declares forward, rollback or roll-forward recovery behavior.
- Online indexes and bounded backfills are used for large tables.
- Schema compatibility supports at least current and previous Shoo Local contract versions during beta rollout.
- Restore rehearsal runs migrations and deletion tombstones before serving traffic.

## Backup and recovery baseline

- Managed PITR enabled for production beta with 30-day target retention.
- Daily logical/portable export verifies provider portability.
- Backup encryption and access are independently controlled from runtime credentials.
- Quarterly during beta—or before each major release—restore into a clean target and verify RLS, counts, checksums, tombstone replay and durable mappings.
- Target design objectives: operational RPO `<= 15 min`, RTO `<= 4 h` for beta; validate before representing them externally.

## Degraded modes

| Failure | Permitted behavior | Prohibited behavior |
|---|---|---|
| Cloud unavailable | encrypted local capture, queued sync, visible health | claim operational sync succeeded |
| Model unavailable | preserve evidence/checkpoint; use existing verified memory | fabricate extraction or current truth |
| MemWal/Walrus unavailable | operational commit, queued Manual durability | silent Managed fallback or block coding |
| Identity provider unavailable | active short-lived session may continue within policy | bypass authorization or mint local admin |
| PostgreSQL unavailable | local capture only; fail cloud mutation closed | write canonical truth elsewhere |
| Update service unavailable | continue supported installed version | install unsigned artifact |

## Exit tests

- DEP-FT-01: clean staging deployment from immutable artifacts.
- DEP-FT-02: database restore meets provisional RPO/RTO and reapplies tombstones.
- DEP-FT-03: previous local client remains contract-compatible during cloud rollout.
- DEP-FT-04: unsigned/tampered update is rejected; failed update rolls back safely.
- DEP-FT-05: provider export restores into a clean PostgreSQL target.
- DEP-FT-06: every listed dependency outage yields the specified truthful degraded mode.
