# Shoo Repository, Service and Package Architecture

- Version: 0.2
- Status: Accepted — Gate 8; implementation plan, not production code
- Owner role: Staff Software Architect / Developer Experience Architect
- Dependencies: Accepted Gate 5 Architecture; Gate 6 UX; Gate 7 UI; Migration Plan
- Assumptions: TypeScript remains the lowest-risk reuse language; product team can operate one monorepo; Node LTS supports required MCP/client/package targets
- Unresolved questions: Final SQLite binding after compatibility spike; final embedding provider adapter
- Last decision: Adopt ART-72 Docker boundaries, application-level AEAD local payload encryption and initial pinned version candidates
- Next action: Create the authorized empty repository skeleton and run approved compatibility spikes

## Repository decision matrix

Scores: 1 poor, 5 strong. Operational complexity is scored inversely: 5 means simpler.

| Option | Contract reuse | Boundary enforcement | CI speed | Migration fit | Operational simplicity | Total /25 |
|---|---:|---:|---:|---:|---:|---:|
| Separate repositories | 2 | 5 | 3 | 2 | 2 | 14 |
| pnpm workspaces only | 5 | 3 | 3 | 5 | 5 | 21 |
| pnpm + Turborepo | 5 | 4 | 5 | 5 | 4 | **23** |
| Nx integrated monorepo | 5 | 5 | 5 | 4 | 2 | 21 |

Decision: pnpm workspaces plus Turborepo. Reversal condition: cache/task orchestration overhead exceeds measured CI benefit or team policy requires another system.

## Runtime/deployable boundaries

| Deployable | Responsibility | Scaling | Trust boundary |
|---|---|---|---|
| `apps/web` | Shoo Web UI, server rendering/BFF-safe composition, Clerk session handoff | CDN/app instances | Browser/public Web boundary |
| `apps/api` | HTTP/MCP gateway, synchronous domain commands/queries, authorization | Horizontal stateless | Cloud request/tenant boundary |
| `apps/worker` | Extraction, indexing, outbox, durable jobs, reconciliation, operations | Horizontal by job class | Async/provider boundary |
| `apps/local` | CLI, daemon, OpenCode/Codex adapters, encrypted spool, policy, Manual crypto | Per developer device | Local/private-key/evidence boundary |

No additional microservice is authorized for MVP. Web may call the API; it does not query operational PostgreSQL directly.

## Proposed repository tree

```text
shoo/
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── local/
├── packages/
│   ├── contracts/
│   │   ├── http/
│   │   ├── mcp/
│   │   └── events/
│   ├── domain/
│   │   ├── identity/
│   │   ├── continuity/
│   │   ├── memory/
│   │   ├── intelligence/
│   │   └── platform/
│   ├── application/
│   ├── db-postgres/
│   ├── local-store/
│   ├── auth-clerk/
│   ├── adapter-opencode/
│   ├── adapter-codex/
│   ├── adapter-memwal/
│   ├── embedding/
│   ├── retrieval/
│   ├── observability/
│   ├── ui/
│   ├── design-tokens/
│   ├── config/
│   └── testing/
├── migrations/
│   ├── postgres/
│   └── local/
├── fixtures/
│   ├── contracts/
│   ├── retrieval-gold/
│   ├── security/
│   └── migration/
├── tooling/
│   ├── architecture-tests/
│   ├── release/
│   └── dev/
├── docs/
│   ├── adr/
│   ├── runbooks/
│   └── compatibility/
└── package.json / pnpm-workspace.yaml / turbo.json
```

This is a target structure. Exact filenames are implementation candidates, not authorization to generate production code before Gate 8.

## Package dependency rules

```text
contracts ───────────────┐
domain ──────────────────┼→ application → runtime adapters/apps
design-tokens → ui ──────┘

domain must not import:
apps, database, Clerk, MCP SDK, MemWal SDK, Web framework or model provider.
```

- `contracts` owns versioned transport schemas, never business authorization.
- `domain/*` owns aggregates, value objects, invariants and domain events.
- `application` owns use cases and ports.
- Adapters implement ports and translate provider/client behavior.
- Apps compose dependencies and own process lifecycle.
- `ui` consumes semantic design tokens and typed view models, not database rows.
- A generic `utils` package is prohibited; shared code must have a semantic owner.
- Cross-domain reads use application query ports or explicit read models, not table imports.

## Technology candidates accepted for implementation planning

| Area | Decision | Reason | Reversal condition |
|---|---|---|---|
| Language/runtime | TypeScript + supported Node LTS | Predecessor reuse, MCP/client ecosystem, shared contracts | Packaging/performance spike fails |
| Workspace | pnpm + Turborepo | Deterministic installs, task graph/cache, moderate overhead | Measured overhead/no cache value |
| Web | Next.js behind Shoo API contracts | Commercial SaaS delivery, routing/rendering, Clerk integration | BFF coupling or runtime constraints violate boundaries |
| API | Fastify modular monolith | Low framework ceremony, schema-first requests, explicit composition | Team capability or plugin conflict fails spike |
| Query layer | Kysely-style typed SQL + authored SQL migrations | RLS/pgvector/control without ORM hiding semantics | Maintenance/productivity evidence favors alternative |
| Operational DB | PostgreSQL + pgvector | Accepted Gate 5 decision | ART-35 split triggers |
| Local DB | encrypted SQLite behind `local-store` port | Offline/crash recovery | Cross-platform security/package spike fails |
| Queue | PostgreSQL outbox/leases | Atomicity and MVP simplicity | ART-35 broker triggers |
| Identity | Clerk adapter | Accepted ADR-ARCH-014 | Cost/enterprise/residency trigger |
| Durable | MemWal Manual adapter | Mandatory and accepted | Upstream trust architecture changes; Walrus remains mandatory |

Exact library versions are pinned at implementation kickoff after compatibility review; `latest` is prohibited.

Initial candidate pins are defined in ART-72: Node 24.18.0 LTS, pnpm 11.13.0, Turborepo 2.10.5, Fastify 5.10.0, Next.js 16.2.10 and Kysely 0.29.3. These remain conditional on compatibility/security CI.

Cloud deployables use separate Docker images. Shoo Local uses a signed host package by default; an optional headless container cannot claim OS-vault or wallet-signer parity.

The `local-store` baseline encrypts sensitive payload columns with reviewed application-level AEAD and keeps the key in the OS vault. SQLCipher is an additional full-file defense candidate after SPIKE-01, not an R0 prerequisite.

## Current primary-source evidence check — 2026-07-14

- [pnpm Workspaces](https://pnpm.io/workspaces) confirms native multi-package workspace support through `pnpm-workspace.yaml`.
- [Turborepo caching](https://turborepo.com/docs/crafting-your-repository/caching) confirms declared task-output caching; cache correctness configuration remains a Shoo responsibility.
- [Fastify plugins](https://fastify.io/docs/latest/Reference/Plugins/) documents encapsulated plugin scopes and a dependency DAG; Shoo still requires independent package/domain enforcement.
- [Fastify validation and serialization](https://fastify.io/docs/latest/Reference/Validation-and-Serialization/) confirms schema-based request/response boundaries.
- [Next.js App Router](https://nextjs.org/docs/app) confirms TypeScript-capable application routing and server/client rendering primitives; Shoo forbids direct database access from Web regardless of framework features.
- [Kysely](https://kysely.dev/) documents typed SQL with PostgreSQL and SQLite dialects; raw/authored SQL remains necessary for Shoo-specific RLS, pgvector and migration control.
- [Node.js release policy](https://nodejs.org/en/about/previous-releases) recommends production applications use Active or Maintenance LTS; exact major version is pinned at kickoff.

These sources support candidate fit, not automatic adoption. SPIKE-01/03 and the composition spike remain required.

## Database ownership

- `identity`: organizations, memberships, projects, subjects, roles.
- `continuity`: work units, sessions, checkpoints, client envelopes.
- `memory`: evidence, memories, revisions, conflicts, durable mappings.
- `intelligence`: context manifests, retrieval/read projections, Ask operations.
- `platform`: outbox/jobs, compatibility, flags, deletion/export operations.
- `audit`: append-oriented security and high-impact action records.

Only the owning module writes its tables. Read projections have named owners and rebuild procedures.

## Architecture fitness enforcement

- Import graph test on every PR.
- Public API export allowlist per package.
- Database access lint/test prevents non-owner table writes.
- Contract snapshots detect Kage/Sensei namespace leakage.
- App composition roots are the only provider construction sites.
- Coordination package/routes are absent until a new scope gate.
