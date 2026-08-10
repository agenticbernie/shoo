# Shoo

Shoo gives coding agents work continuity, evidence-backed project memory and cited context.
It captures what actually happened during agent sessions, turns that evidence into
structured memory with explicit authority, and hands back token-bounded context that says
where every claim came from and how fresh it is.

This repository is the implementation of the accepted Gate 5–8 architecture in `docs/`.
Those documents are the specification; the code follows them rather than the other way
round.

## Repository layout

```text
shoo/
├── apps/
│   ├── web/                 Next.js Shoo Web (talks to the API, never to PostgreSQL)
│   ├── api/                 Fastify HTTP + MCP gateway, composition root
│   ├── worker/              extraction, indexing, outbox, durable jobs
│   └── local/               Shoo Local CLI/daemon, adapters, encrypted spool
├── packages/
│   ├── contracts/
│   │   ├── common/          scalars, authority axes, error codes, envelopes
│   │   ├── http/            versioned /v1 request/response schemas + route registry
│   │   ├── mcp/             the nine MVP tools, resources, prompts
│   │   └── events/          event envelope, taxonomy, payload minimums
│   ├── domain/
│   │   ├── shared/          branded ids, time axes, results, state machines
│   │   ├── identity/        org, membership, project, subject, role, grant
│   │   ├── continuity/      work unit, session, checkpoint, client envelope
│   │   ├── memory/          evidence, authority, revisions, supersession, resolver
│   │   ├── intelligence/    context manifest, retrieval read model, answers
│   │   └── platform/        outbox, operations, policy, compatibility, flags
│   ├── application/         use-case and port interfaces
│   ├── db-postgres/         Kysely types, tenant context, migration runner
│   ├── local-store/         encrypted SQLite, AEAD envelope, OS-vault keys
│   ├── auth-clerk/          identity adapter
│   ├── adapter-opencode/    OpenCode client adapter
│   ├── adapter-codex/       Codex client adapter
│   ├── adapter-memwal/      MemWal Manual durable adapter
│   ├── embedding/           embedding provider registry
│   ├── retrieval/           ranking configuration, merge and budget helpers
│   ├── observability/       content-safe logging and metrics
│   ├── ui/                  React primitives over semantic tokens
│   ├── design-tokens/       primitive, semantic and component tokens
│   ├── config/              validated environment configuration
│   └── testing/             deterministic clocks, id factories, fixtures
├── migrations/
│   ├── postgres/            authored SQL, applied in filename order
│   └── local/               encrypted SQLite schema
├── fixtures/                contracts, retrieval-gold, security, migration corpora
├── tooling/
│   ├── architecture-tests/  import-graph and contract fitness checks
│   ├── release/             SBOM, provenance, signing, channels
│   └── dev/                 local stack helpers
└── docs/                    accepted architecture, UX and engineering specifications
```

## Dependency rule

```text
contracts ───────────────┐
domain ──────────────────┼→ application → runtime adapters/apps
design-tokens → ui ──────┘
```

`domain` must not import apps, the database, Clerk, the MCP SDK, the MemWal SDK, a web
framework or a model provider. This is enforced on every run by `pnpm architecture:check`,
which fails the build and names the file, the import and the rule it broke.

Two other rules matter day to day: a generic `utils` package is prohibited — shared code
gets a semantic owner — and cross-context reads go through application query ports or
explicit read models, never by importing another module's tables.

## Getting started

Requirements: Node 24.18.0 (`.nvmrc`), pnpm 11.13.0, Docker for PostgreSQL.

```bash
pnpm install
cp .env.example .env

docker compose up -d postgres   # PostgreSQL 16 + pgvector
pnpm db:migrate                 # apply migrations/postgres

pnpm build                      # build every package and app
pnpm typecheck
pnpm test
pnpm architecture:check
pnpm dev                        # run all apps
```

`pnpm --filter @shoo/local start doctor` opens the encrypted local store and reports any
quarantined records.

## Pinned versions

Runtime and framework pins come from docs/63; the rest are current-stable choices recorded
in `pnpm-workspace.yaml`.

| Component | Version |
|---|---|
| Node | 24.18.0 |
| pnpm | 11.13.0 |
| Turborepo | 2.10.5 |
| Fastify | 5.10.0 |
| Next.js | 16.2.10 |
| Kysely | 0.29.3 |
| TypeScript | 5.9.3 |
| PostgreSQL | 16 + pgvector |

## Things that are true here and easy to get wrong

- **Session completion is not work completion.** A session returns a *proposal*; the work
  unit changes only through its own authorized, versioned command.
- **Authority is not implied.** Claim, verification, authority, visibility, durability,
  freshness and lineage are seven independent axes. Durable does not mean canonical,
  project-visible does not mean project-authoritative, and verified does not mean current.
- **Nothing is overwritten.** A correction is a new immutable revision plus an explicit
  supersession edge; the predecessor stays queryable as history.
- **Two accepted values are a conflict, not a race.** The resolver never picks by recency.
- **A fact without a permitted citation cannot be emitted.** Insufficient evidence answers
  "unknown from available project evidence" and names what is missing.
- **Restricted evidence stays on the device.** Classification is a floor that policy cannot
  raise.
- **Deletion is reported layer by layer.** Shoo never claims physical durable deletion it
  cannot verify.

## Testing and CI

`.github/workflows/ci.yml` runs the docs/65 pull-request fast path: frozen-lockfile
install, lint, build, typecheck, architecture fitness, unit and contract tests, a
migration + RLS matrix job against real PostgreSQL, and secret/dependency scans.

## Licence

Apache-2.0. See `LICENSE`.
