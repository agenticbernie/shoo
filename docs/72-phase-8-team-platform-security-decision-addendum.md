# Shoo Phase 8 Team, Platform and Security Decision Addendum

- Version: 0.1
- Status: Accepted — Gate 8 (2026-07-15)
- Owner role: Founder/CTO / Technical Program Manager / Security Architect
- Dependencies: ART-63–71; user-provided team and ownership decisions
- Assumptions: Named contributors are available at meaningful capacity; exact FTE allocation is still unknown
- Unresolved questions: Contributor availability/FTE; legal entity/account transfer plan; SQLCipher commercial evaluation timing
- Last decision: Adopt GitHub Actions, scoped Docker images, application-encrypted SQLite payloads, founder-controlled initial provider accounts with organizational recovery, and explicit Shoo/user security responsibilities
- Next action: Assign named Slice A owners/deputies, confirm capacity and execute the approved spikes

## Confirmed team

| Person/role | Primary delivery responsibility | Secondary/review responsibility |
|---|---|---|
| Bernie — Founder, CTO, Architect, Fullstack, DevOps | Product/architecture decisions, integration, critical-path unblock | Security/release approval; not sole implementer |
| BA + Frontend | Requirement trace, acceptance scenarios, Pulse/Work workflows | UX QA and customer research support |
| Frontend Developer | Design system, Web shell, accessibility/responsive implementation | Ask/Source/Conflict UI |
| Backend Developer | Domain/application/API/PostgreSQL/outbox | RLS and worker integration |
| DevOps Engineer | GitHub Actions, environments, Docker/GHCR, observability/recovery | Signed release and incident tooling |
| Cryptography + Backend | MemWal Manual, wallet/delegate, local encryption, durable trust tests | Memory/backend implementation |
| Marketing | Positioning, recruitment, beta communication and GTM evidence | No authority over technical truth/security gates |

The engineering capacity is nominally six contributors including Bernie, but roadmap estimates depend on FTE, not headcount. If fewer than four engineering FTE are sustained, reforecast before committing beyond Slice A.

## Bus-factor correction

Bernie should not remain the only owner of architecture, production accounts, release and incident recovery simultaneously.

Required before R2:

- backend lead becomes deputy for domain/API/data;
- DevOps engineer becomes deputy for production/release/recovery;
- cryptography/backend contributor becomes deputy for Durable Memory/key controls;
- at least two break-glass organization administrators exist;
- no private key or recovery secret is shared to create redundancy;
- runbooks and recovery drills replace founder-only knowledge.

## GitHub Actions and artifact decision

- CI/CD provider: GitHub Actions.
- Source and workflow ownership: Shoo GitHub organization, not a personal-only repository.
- Container registry: GitHub Container Registry (GHCR) unless Render constraints require a documented alternative.
- Cloud images: separate immutable images for Web, API and Worker; do not build one combined Shoo image.
- Actions are pinned to immutable commit SHAs for release workflows.
- GitHub Environments protect staging/production with least-privilege secrets and required approval.
- Build produces SBOM, provenance/attestation, image digest and vulnerability scan.

## Docker decision

| Target | Docker? | Decision |
|---|---|---|
| Shoo API | Yes | Required cloud image |
| Shoo Worker | Yes | Required independent cloud image |
| Shoo Web | Yes | Preferred standalone cloud image; CDN/static assets remain separate where useful |
| PostgreSQL/pgvector | Development/test only | Production uses managed PostgreSQL, not an application-owned DB container |
| Local cloud stack | Yes | Compose-equivalent developer profile for API/Worker/Web/DB/doubles |
| Shoo Local CLI/daemon | No as default distribution | Signed host package must access OS vault, filesystem and agent configuration |
| Headless/CI Shoo Local | Optional later | Explicit limitations; no wallet-signer or desktop-vault promise |

Docker is deployment packaging, not the Shoo Local security sandbox. Mounting host wallets, credential vaults or broad home directories into a default container is prohibited.

## Local SQLite encryption decision

### MVP baseline

Use a standard supported SQLite binding behind `local-store`, with application-level authenticated encryption for sensitive payload columns:

- algorithm: libsodium XChaCha20-Poly1305 AEAD candidate;
- random nonce per record;
- associated data binds record ID, schema version, project/session scope and event type;
- encryption key generated locally and stored only in OS credential vault;
- sensitive payload, paths, excerpts and error detail encrypted;
- plaintext columns limited to opaque ID, ordering/scheduling state, retry counters and coarse timestamps required to operate offline;
- database/logs never contain key material.

Libsodium documents AEAD as providing confidentiality plus tamper authentication, and supports XChaCha20-Poly1305; this is the reason for the candidate, not permission to implement cryptography without review. See [libsodium AEAD](https://doc.libsodium.org/secret-key_cryptography/aead).

### SQLCipher evaluation

SQLCipher remains a defense-in-depth candidate for full database-file encryption. Official material describes cross-platform support for Windows, macOS and Linux, while distribution/licensing differs between Community and Commercial editions. See [SQLCipher overview](https://www.zetetic.net/sqlcipher/) and [license information](https://www.zetetic.net/sqlcipher/license/).

Do not select an unofficial SQLCipher Node fork before verifying:

- Node 24 ABI/prebuilt availability across OS/architecture;
- crash/WAL/backup behavior;
- reproducible signed packaging;
- maintenance and vulnerability posture;
- attribution/commercial redistribution terms;
- migration/key rotation and recovery.

Decision rule: application-level AEAD is required; SQLCipher may add full-file defense only after SPIKE-01 passes. `node:sqlite` is not selected for R0 because official Node 26 documentation still labels it release candidate; binding remains behind a port. See [Node SQLite](https://nodejs.org/api/sqlite.html).

## Initial version baseline — 2026-07-14

Pin exact versions in the first lockfile, then update only through compatibility PRs:

| Dependency | Initial candidate |
|---|---:|
| Node.js | `24.18.0` LTS |
| pnpm | `11.13.0` |
| Turborepo | `2.10.5` |
| Fastify | `5.10.0` |
| Next.js | `16.2.10` |
| Kysely | `0.29.3` |
| better-sqlite3 candidate | `12.11.1` |
| libsodium-wrappers-sumo candidate | `0.8.4` |

Node's official release table identifies v24 as LTS and v26 as Current at the decision date. See [Node.js releases](https://nodejs.org/en/about/previous-releases). Package versions are registry snapshots and must pass the Gate 8 compatibility/security spike before becoming production candidates.

## Provider and account ownership

Bernie is the initial accountable owner for GitHub, Render, Clerk, model provider and Shoo test/service accounts. This is acceptable only for R0 with these controls:

- accounts are created under Shoo organization/legal entity where supported;
- billing and recovery contacts are documented;
- at least one additional break-glass admin before R2;
- hardware-backed MFA and recovery-code custody;
- environment/service credentials are non-personal and revocable;
- access review and offboarding policy;
- provider export/transfer procedure;
- no production secret stored in a personal password note or shared chat.

## User ownership versus Shoo responsibility

User ownership does not transfer Shoo's security/legal duty to the user.

### User owns and controls

- owner wallet and recovery material;
- MemWal account and project namespace authorization;
- device delegates and their revocation;
- capture/sync/share policy within allowed safe bounds;
- project membership/access choices;
- export and deletion requests.

### Shoo must enforce

- secure defaults and data minimization;
- secret/path exclusion before egress;
- tenant/project authorization and FORCE RLS;
- delegate least privilege, expiry/revocation and device visibility;
- explicit cloud embedding/Manual/Walrus trust disclosure;
- retention, deletion-layer and key-loss disclosure;
- high-impact confirmation and audit;
- incident response, breach handling and legal/compliance process;
- provider/subprocessor governance and access review;
- refusal of unsafe policy combinations.

### Shared responsibility

- device security and update posture;
- recovery readiness;
- timely delegate/member revocation;
- classification of project data beyond Shoo's automatic detection;
- compliance with third-party repository/client policies.

Shoo cannot use Terms of Service to disclaim defects in its authorization, encryption, policy enforcement or retention behavior.

## Predecessor migration decision

No external user or production data requires migration. Therefore:

- delete data-migration/cutover work from the critical path;
- retain M0/M1 code/capability inventory and compatibility fixtures;
- reuse code only behind Shoo contracts;
- do not build dual-write, user migration UI or production rollback for predecessor data;
- archive lineage and prototype fixtures after useful capability is extracted.

This reduces EPIC-06 from production migration to bounded code-lineage extraction.

## Decision Gate impact

These answers remove major Gate 8 blockers. Remaining pre-Slice-A requirements are named owner/FTE allocation, repository organization setup, version/security checks and the three timeboxed Local/client/package spikes.
