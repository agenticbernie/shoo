# Shoo AICD Plan and Architecture Evidence

- Version: 0.4
- Status: Accepted — Decision Gate 5
- Owner role: Staff Software Architect / Technical Program Manager
- Dependencies: Accepted PRD; Repository Evidence Review; Decision Log
- Assumptions: Existing Kage/Sensei code is migration input, not the target architecture; managed cloud plus local runtime remains commercially viable
- Unresolved questions: Final embedding model/provider quote and empirical R0–R2 fitness results
- Last decision: User approved the complete Phase 5 AICD baseline at Gate 5
- Next action: Use architecture invariants and fitness tests as constraints for UX and implementation planning

## Phase 5 checkpoints

| Checkpoint | Scope | Exit evidence |
|---|---|---|
| 5A — Architecture baseline | Context/container boundaries, domain ownership, stores, consistency, memory/retrieval, MCP/client model, Walrus trust model | Coherent end-to-end design; no PRD contradiction; major ADRs proposed |
| 5B — Contracts and failure design | Component specifications, event schemas, API/MCP contracts, sequences, permission model, threat model | **Draft complete** — contract examples, state machines, threat controls, recovery behavior |
| 5C — Deployment and architecture validation | Deployment model, capacity/cost assumptions, observability, migration, ADR consolidation | **Complete** — ART-42–47 define SLOs, environments, cost, migration, fitness and gate review |
| Gate 5 | Approve AICD | Architecture authorized for UX architecture and implementation backlog inputs |

No detailed production backlog or UI visual design is authorized before Gate 5.

## Refreshed evidence — 2026-07-14

### Shoo predecessor repository

Verified current repository evidence:

- Kage and Sensei remain separately named packages and semantics; the repository has not yet migrated to a unified Shoo domain.
- Kage uses MCP SDK `^1.29.0`; Kage references MemWal as `latest`, while Sensei Web pins `0.0.7`. This is a reproducibility and compatibility risk.
- The current remote MCP path uses the 2025-03-26 Streamable HTTP session pattern.
- Bridge uploads zipped `src/` content to cloud processing. This conflicts with Shoo's safe default raw-source policy and must not become the Shoo default.
- Authentication is prototype-oriented JWT/password/API-key logic, not a Commercial SaaS tenant identity model.

Inference: predecessor code can accelerate adapters, MCP handling, compression, and MemWal integration, but cannot be renamed wholesale into Shoo.

### MemWal/Walrus

Verified current upstream evidence:

- Walrus Memory remains beta and evolving.
- `remember` is asynchronous; completion requires job polling. Bulk supports up to 20 memories per request in current documentation.
- Recall is scoped by `owner + namespace` and returns semantic distance.
- Restore incrementally reconstructs missing vector/index entries from Walrus blobs.
- Managed relayer performs embedding, SEAL encryption/decryption, Walrus transfer, and vector search.
- Critical trust fact: managed relayer sees plaintext before encryption. Encryption at rest does not equal end-to-end encryption from Shoo local runtime.
- Manual flow can perform embedding and SEAL operations locally; self-hosted and TEE patterns are alternative trust modes.
- Relayer deployment currently binds to one active Walrus Memory package ID.

Architecture consequence: Shoo needs an explicit `durable_trust_mode`; payload eligibility cannot depend only on “encrypted on Walrus.”

### MCP and selected clients

- Current stable architecture baseline targets MCP specification `2025-11-25`; a future/draft protocol must not silently become an MVP dependency.
- MCP tools are model-controlled actions; resources are better for read-only, addressable context; prompts are user-controlled workflow templates.
- Streamable HTTP authorization and stdio credential handling have different trust requirements.
- OpenCode exposes plugins/events plus MCP, supporting richer local capture.
- Codex exposes MCP configuration and lifecycle hooks; project hooks load only in trusted project configuration.

Architecture consequence: MCP is the agent access plane, not the sole capture plane. Client adapters normalize native events into Shoo events.

## Architecture quality attributes

Priority order for MVP decisions:

1. privacy and tenant isolation;
2. truthful recovery and provenance;
3. non-blocking coding workflow;
4. cross-agent continuation quality;
5. operability and migration safety;
6. delivery speed;
7. scale beyond validated demand.

## Architecture invariants

- Shoo Operational is the source of current operational truth; Walrus is policy-selected durable evidence/artifact storage.
- A Walrus write never implies canonical acceptance or work completion.
- Evidence, derived memory, authority, visibility, and durability remain orthogonal.
- Client adapters cannot define domain semantics.
- Web, Ask Shoo, and MCP context use the same resolver and retrieval pipeline.
- Local filtering occurs before any cloud or MemWal boundary.
- Cloud/Walrus outage cannot block repository editing or agent execution.
- Team identifiers do not authorize team workflows.

## Migration posture

Use a strangler migration by vertical slice:

1. wrap existing Kage MCP and MemWal functions behind Shoo ports;
2. introduce Shoo identity/event schemas beside predecessor records;
3. route one OpenCode-to-Codex slice through Shoo contracts;
4. compare old/new outputs and reconcile;
5. retire predecessor semantics only after slice acceptance.

Rejected: bulk rename of Kage/Sensei packages, direct reuse of flat memory records, and retaining `latest` dependencies.
