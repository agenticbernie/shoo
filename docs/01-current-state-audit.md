# Shoo Current-State Audit

- Version: 0.2.1
- Status: Accepted — Decision Gate 0
- Owner role: Principal Product Manager / Staff Software Architect
- Dependencies: Project lineage brief; current product principles; four core scenarios
- Assumptions: Repository documentation and tests are implementation evidence, but no independent runtime, security, load, or user validation was performed
- Unresolved questions: Production readiness; data migration quality; multi-tenant isolation; SaaS buyer validation
- Last decision: Treat Kage/Sensei as a working prototype foundation to restructure, not a greenfield concept or production-ready platform
- Next action: Use Phase 2 workflow gaps to guide scope and migration decisions

## Executive finding

Shoo has a coherent problem definition and a working predecessor prototype, but not yet a demonstrated commercial product. Repository evidence confirms reusable implementation across CLI, MCP, Web, Bridge sync, MemWal persistence, Docker deployment, and automated tests. It does not prove automatic lifecycle capture across OpenCode and Codex, structured canonical memory, multi-tenant SaaS isolation, retrieval quality, or user outcomes.

The restructuring is strategically sound only if Shoo is presented as one product with two interface families: agent-facing infrastructure and human-facing project intelligence. It must not preserve Kage and Sensei as independent product surfaces merely for lineage.

## Evidence classification

### Facts established by the brief

- The current official product name is Shoo.
- Kage and Sensei are predecessor project names, not current product modules or independent products.
- Kage's declared predecessor role was shared memory and MCP-based coordination infrastructure.
- Sensei's declared predecessor role was Web SaaS project intelligence and coordination visibility.
- Shoo is intentionally defined as a unified product system.
- MCP is the intended primary interface for coding agents.
- Shoo Web is the intended human interface for project intelligence and coordination.
- MemWal SDK is the intended adapter to Walrus.
- Walrus is intended for selected durable memory, not realtime hot state.
- The first priority is a solo developer using multiple coding agents.
- Security, permission, provenance, and canonical state must be designed from the beginning.

These are product decisions or constraints supplied by the sponsor. They are facts about intended direction, not proof of working capabilities.

### Proposals not yet proven

- Automatic capture can work reliably across materially different coding agents.
- Agent output can be converted into structured project memory with acceptable accuracy.
- Hybrid retrieval can provide sufficient context without flooding the agent.
- Cross-agent continuation materially reduces manual re-explanation.
- Users will trust background capture when privacy controls are explicit.
- Walrus durability, portability, verification, or ownership creates enough user value to justify added complexity.
- Project Q&A with citations can prefer current canonical truth over plausible but superseded memory.
- Team blocker and dependency intelligence can be derived accurately without becoming surveillance.

### Unknowns requiring evidence

- Production behavior of the deployed predecessor under realistic load and failures.
- Completeness of existing schemas and migration suitability for Shoo's domain model.
- MemWal SDK stability, API constraints, cost, latency, encryption support, and recovery behavior.
- Which coding agents expose hooks sufficient for automatic capture.
- Whether capture is local-first, cloud-mediated, or mixed for the first release.
- User willingness to authorize code/session access.
- Target repository sizes, session volumes, latency budgets, and retention periods.
- Commercial buyer, willingness to pay, and acceptable pricing unit.

## Verified predecessor implementation

Repository inspection confirms:

- a TypeScript Kage CLI package at version `0.1.0`;
- MCP SDK integration with stdio and Streamable HTTP transports;
- implemented Kage memory, recall, context, stats, learn, export, analyze, session-fetch, and cleanup tools;
- compression-first CCR metadata, relevance scoring, and token-budget fitting;
- a Sensei CLI and React/Vite + Hono Web application;
- JWT-protected APIs, secure session upload, dashboard, project sync, and health endpoints;
- a local Bridge that packages selected project source and sends it to the cloud service;
- MemWal/Walrus persistence and a restore/cleanup path;
- a multi-stage Docker build, non-root runtime, persistent local CCR volume, and health checks;
- documented test evidence for Kage Learn V2, server routes, ZIP validation, rate limits, and builds;
- a published Docker image and documented remote MCP deployment path.

This evidence upgrades Kage/Sensei from “declared lineage” to “verified prototype lineage.” It does not upgrade the system to production-ready Commercial SaaS.

## Verified gaps relative to Shoo

- Current Kage usage still includes manual `remember`, `context`, or session upload workflows.
- The repository does not establish Shoo's explicit session start/checkpoint/complete/resume lifecycle.
- Existing memories do not yet demonstrate the required authority ladder or canonical-state resolver.
- Current local CCR and MemWal recall do not constitute a multi-tenant operational data model.
- Bridge source ZIP sync is not equivalent to policy-driven session progress sync.
- Existing Web auth is an admin-style JWT flow, not organization/team/member SaaS identity and access control.
- Existing retrieval is relevance/token-budget aware, but not yet the complete structured + semantic + authority + supersession ranking required by Shoo.
- Package versions are inconsistent: Kage depends on MemWal `latest`, while Sensei packages pin `0.0.7`. This is a migration and reproducibility risk.

## Product lineage map

| Capability | Kage predecessor | Sensei predecessor | Shoo treatment | Evidence status |
|---|---|---|---|---|
| MCP connection | Implemented via stdio/HTTP | Web MCP endpoint | Unify under Shoo agent interface | Prototype verified |
| Session capture | Upload/fetch paths exist | Downstream input | Redesign as automatic capture lifecycle | Partial prototype |
| Structured memory | Memory + CCR metadata exist | Retrieval source | Redesign with provenance and authority states | Partial prototype |
| Durable Walrus memory | Implemented through MemWal | Implemented consumer | Mandatory for policy-selected durable records | Prototype verified; operational semantics remain risky |
| Q&A with citations | Supporting/implicit | Ask capability exists | Redesign as cited Ask Shoo | Partial prototype; citation quality unverified |
| Project pulse/timeline | Stats/history endpoints | Dashboard exists | Retain in Shoo Web | Partial prototype |
| Decisions and blockers | Coordination memory | Declared intelligence | Redesign on shared domain model | Unproven |
| Team coordination | Declared asynchronous direction | Declared visibility layer | Defer beyond solo MVP except schema readiness | Unproven |
| Canonical truth | Partial intent | Needed by answers | New explicit authority lifecycle | New |
| Trust classification | Partial provenance | Needed for explanation | New observed/claimed/verified/canonical model | New |
| Context pack ranking | Retrieval intent | Explanation input | New explicit hybrid ranking and budget model | New |
| Anti-surveillance flow metrics | Not established | Pace concept | New product boundary | New |

## Restructuring map

### Retain from Kage as lineage

- MCP-first agent connectivity.
- Cross-session and cross-agent project memory objective.
- Local/daemon/API shape as possible delivery interfaces.
- MemWal-to-Walrus durable persistence direction.
- Provenance-aware capture and asynchronous coordination intent.

### Retain from Sensei as lineage

- Ask-project experience with cited answers.
- Project pulse, recent changes, decisions, blockers, dependencies, and handoffs.
- Human-readable explanation and visibility.
- Team continuity and non-blocking coordination objective.

### Must be restructured in Shoo

- One identity, permission, event, memory, and canonical-state model across MCP and Web.
- One ingestion-to-retrieval lifecycle instead of infrastructure and SaaS behaving as separate products.
- A single product navigation and packaging model.
- Context delivery and Web explanations using the same source and authority rules.
- Hot operational state separated from durable project memory.
- Team coordination built on validated shared memory, not parallel to it.

### Entirely new or newly explicit

- Authority ladder: observed event → agent claim → verified fact → accepted decision → canonical state.
- Supersession and contradiction handling as first-class behavior.
- Context packs constrained by task, branch, file, authority, and token budget.
- Product evaluation centered on continuation without manual re-explanation.
- Privacy controls and anti-surveillance metrics as product invariants.
- Graceful degraded mode when MemWal or Walrus is unavailable.

### Should not survive the restructuring

- Separate Kage/Sensei product positioning.
- A flat memory pool shared across all users, branches, and tasks.
- Transcript-as-memory as the primary model.
- Blockchain language in routine developer UX.
- Team orchestration in the first MVP.
- A broad MCP tool catalogue before core lifecycle evidence exists.

## Initial strategic assessment

### Desirability

The pain is credible and frequent for the sponsor's OpenCode/Codex workflow, but broader willingness to install, authorize capture, and pay for a Commercial SaaS remains unvalidated.

### Feasibility

Cross-session recall is feasible in one controlled client. Cross-agent automatic capture is the hardest integration risk because clients expose different hooks and semantics.

### Viability

The solo-developer wedge is appropriate for validation but may have low willingness to pay. Team continuity is the likely commercial expansion, not an MVP requirement.

### Defensibility

Storage and vector retrieval alone are not defensible. Defensibility could come from provenance-rich project memory, canonical-state resolution, continuation quality, integration coverage, and accumulated workflow graph data.

### Architecture implication without choosing technology

The product requires a local trust boundary, an operational state layer, a durable memory layer, and shared authority semantics. Exact technologies remain deferred to AICD.
