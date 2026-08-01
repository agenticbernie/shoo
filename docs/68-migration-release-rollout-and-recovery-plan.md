# Shoo Migration, Release, Rollout and Recovery Plan

- Version: 0.2
- Status: Accepted — Gate 8
- Owner role: Platform Engineer / Data Architect / Technical Program Manager
- Dependencies: Gate 5 Migration Plan; Vertical Roadmap; CI/CD Plan; Backlog
- Assumptions: Predecessor repository can be frozen/snapshotted; no external user or production data requires migration
- Unresolved questions: Which predecessor capabilities merit reuse after M0/M1 inventory
- Last decision: Remove production data/user migration and preserve only bounded code-lineage extraction with fixture transformations
- Next action: Run the authorized M0/M1 code-lineage inventory and immutable predecessor snapshot

## Migration workstreams

| Workstream | Unit of change | Rollback boundary |
|---|---|---|
| Code/capability | Adapter or package behind Shoo port | Route back to previous implementation |
| Operational data | Versioned deterministic transformation | Isolated target/delta reconciliation |
| Client configuration | OpenCode/Codex connection changes | Restore previewed prior config |
| Durable memory | New Shoo namespace/mapping | Stop new writes; never silently rewrite owner data |
| User cohort | Feature flag/channel | Disable exposure while preserving local spool |
| Infrastructure | Immutable app/db-compatible release | Previous artifact or roll-forward migration |

The operational-data workstream applies only to prototype fixtures. There is no production predecessor migration, user cutover or dual-write requirement.

## Ordered execution

1. M0 inventory/freeze/dependency pin.
2. M1 semantic mapping and prohibited-data classification.
3. M2 Shoo contract adapters around reusable capability.
4. M3 read-only deterministic dry migration.
5. M4 fixture/shadow semantic comparison for reused capability.
6. M5 route the selected internal capability through Shoo contracts.
7. M6 archive unused predecessor code/data while preserving lineage.

Bulk rename, in-place canonical promotion and automatic Walrus import remain prohibited.

## Release readiness checklist

- Requirement/story/fitness/UI test trace complete.
- Contract compatibility and current/previous Local matrix pass.
- Database migration rehearsal and lock/backfill risk accepted.
- Security/privacy/secret scan pass.
- Rollout flag/kill switch and owner exist.
- SLO/cost dashboards and runbook exist.
- Backup/rollback/roll-forward tested for the change class.
- User-facing degraded/recovery copy exists.
- No Coordination scope or unpinned dependency.

## Progressive rollout

| Stage | Cohort | Observation | Exit |
|---|---|---|---|
| Internal | maintainers/synthetic projects | full traces and active support | no critical invariant failure |
| Canary | up to 5% invited | 24–48h or sufficient sessions | healthy burn/correctness |
| Limited | up to 25% | several workload cycles | no rising correction/security/cost risk |
| Broad beta | 100% invited cohort | error-budget policy | Gate-specific success evidence |

Rollout percentages are ceilings, not automatic progression. Low volume may require a minimum event/session count rather than elapsed time.

## Rollback versus roll-forward

- Stateless app/UI defect: rollback artifact when schema compatible.
- Additive DB migration defect: disable feature and roll forward correction.
- Contract incompatibility: restore compatibility router/previous client support.
- Local package defect: channel revoke, preserve old binary/spool, signed rollback.
- Incorrect derived memory/index: stop worker, invalidate projection, rebuild from operational evidence.
- Canonical corruption: use audited corrective revision; never destructive database rewind without incident review.
- Durable mapping failure: preserve operational record, reconcile; do not silently change trust mode.

## Data recovery

- Operational RPO/RTO targets remain provisional `<=15 min` and `<=4 h` until rehearsal.
- Restore occurs into isolated environment.
- Migrations and deletion tombstones apply before serving.
- RLS/authorization canaries run after restore.
- Durable mappings are reconciled by owner/namespace/package/version; blobs are not treated as current truth.

## Incident severity examples

- SEV-0: cross-tenant/private-key/secret disclosure — stop affected traffic immediately.
- SEV-1: canonical corruption, unrecoverable local loss, update compromise.
- SEV-2: widespread context/durable failure with safe operational fallback.
- SEV-3: degraded optional Ask/UI/provider capability.

Severity never depends on customer visibility alone; hidden trust violations are critical.

## Recovery validation

- One-click/one-runbook containment is tested for adapter, worker, model and durable dependencies.
- Restore and tombstone drill before production beta.
- Local update rollback on all supported OS targets.
- One predecessor slice cutover and rollback rehearsal.
- Post-incident review updates tests, runbook, risk and ADR where required.
