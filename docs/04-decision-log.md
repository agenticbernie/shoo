# Shoo Decision Log

- Version: 2.2
- Status: Decision Gates 0–10 accepted; Implementation Readiness Week authorized
- Owner role: Product & Engineering Design Board
- Dependencies: Current-State Audit; Product DNA
- Assumptions: Sponsor decisions in the brief are binding unless explicitly revised
- Unresolved questions: Actual Shoo allocation, named-person consent/capability, observed threshold calibration and beta cohort availability
- Last decision: Accept ADR-IMPL-016 and ART-83 as the readiness timebox before Slice A kickoff
- Next action: Schedule and execute the five-day readiness evidence plan; decide GO, CONDITIONAL GO or NO-GO on Day 5

## ADR-PROD-001 — One unified product identity

- Status: Accepted
- Context: Kage focused on memory infrastructure; Sensei focused on Web intelligence. Separate products duplicate semantics and obscure the end-to-end outcome.
- Decision: Shoo is the only current product identity. Kage and Sensei are retained solely as predecessor lineage.
- Alternatives: Keep two products; make Kage an internal platform and Sensei the commercial brand; rename modules Kage/Sensei inside Shoo.
- Consequences: Clearer packaging and shared domain model; migration communication must preserve lineage.
- Risks: Shoo's category can feel broad unless the primary continuation job is kept explicit.
- Reversal condition: Validated buyer research proves infrastructure and intelligence have different buyers, procurement paths, and independent value loops.

## ADR-PROD-002 — Solo multi-agent continuation is the MVP wedge

- Status: Accepted
- Context: Full team coordination adds identity, permissions, workflow graph, and organizational-change risks before memory quality is proven.
- Decision: Validate one developer, multiple sessions/agents first.
- Alternatives: Team-first; Web Q&A-first; storage infrastructure-first.
- Consequences: Faster closed-loop evidence; team features remain schema-aware but not product-complete.
- Risks: Solo willingness to pay may be limited.
- Reversal condition: Recruitment shows the pain exists mainly at team boundaries and cannot be reproduced meaningfully for solo users.

## ADR-PROD-003 — Continuation outcome, not memory volume, defines success

- Status: Accepted
- Context: More captured data can increase noise, risk, and retrieval cost.
- Decision: Use Sufficient Context Resume Rate as the North Star Metric.
- Alternatives: Memories stored; queries answered; active users; sessions captured.
- Consequences: Extraction, ranking, and UX are evaluated against real work continuation.
- Risks: Sufficiency measurement requires a rigorous rubric and user signal.
- Reversal condition: Measurement proves too gameable or cannot predict user value.

## ADR-PROD-004 — MemWal/Walrus is mandatory for policy-selected durable storage, not hot state

- Status: Accepted
- Context: Realtime state and durable memory have different latency, consistency, privacy, and cost needs.
- Decision: Shoo must use MemWal/Walrus for policy-eligible durable records and must retain operational state elsewhere.
- Alternatives: Walrus for all events; no Walrus; archive-only export.
- Consequences: More than one persistence class but clearer reliability behavior.
- Risks: Dual-write and recovery complexity; product differentiation may be weak.
- Reversal condition: Only a new sponsor-level product decision can remove MemWal/Walrus. Technical failure instead triggers degraded mode, policy narrowing, adapter replacement, or operational remediation.

## ADR-PROD-005 — Canonical memory requires explicit authority

- Status: Accepted
- Context: Agent-generated summaries can be wrong; recency alone does not confer truth.
- Decision: Separate observation, claim, verification, accepted decision, canonical state, and superseded history.
- Alternatives: Last-write-wins; confidence score only; human approval for every memory.
- Consequences: Better trust and contradiction handling; greater UX and data-model complexity.
- Risks: Excess verification friction.
- Reversal condition: Evaluation finds a materially simpler authority model with equal stale-memory and correction performance.

## ADR-PROD-006 — MCP for agent access; Web for inspection and governance

- Status: Accepted
- Context: Context must enter the coding workflow while trust and correction need a legible human surface.
- Decision: Treat MCP and Web as complementary interfaces over the same product semantics.
- Alternatives: MCP-only; Web-only; IDE extension-first.
- Consequences: Shared contracts and identity become mandatory.
- Risks: Two interfaces increase MVP surface area.
- Reversal condition: A selected client cannot support the core loop through MCP, requiring a narrower native integration.

## ADR-PROD-007 — OpenCode and Codex are the first supported clients

- Status: Accepted
- Context: The sponsor uses OpenCode most often and Codex second most often; both support MCP, but automatic capture surfaces differ.
- Decision: Prioritize OpenCode first and Codex second. Use a client adapter model: OpenCode plugin events; Codex lifecycle hooks; MCP for shared context/tool contracts.
- Alternatives: Universal MCP-only adapter; Codex-first; broad client matrix.
- Consequences: Faster sponsor validation and explicit adapter boundaries.
- Risks: Behavior may diverge between clients; hook/event schemas can change.
- Reversal condition: A selected client cannot meet capture completeness or beta recruitment needs.

## ADR-PROD-008 — Shoo is a Commercial SaaS

- Status: Accepted
- Context: Product packaging affects identity, tenancy, telemetry, deployment, and support expectations.
- Decision: Build Shoo as a Commercial SaaS with a local capture runtime and hosted Web/control plane hypothesis.
- Alternatives: Open-source-only; self-hosted enterprise-only; local desktop product.
- Consequences: Multi-tenancy, billing readiness, privacy commitments, and service operations become product requirements.
- Risks: Solo willingness to pay may be lower than team willingness to pay.
- Reversal condition: Commercial discovery invalidates hosted SaaS willingness or data-hosting acceptance.

## ADR-PROD-009 — Synchronization is policy-driven

- Status: Accepted
- Context: Shoo must sync progress across agents and later team members without uploading all session data indiscriminately.
- Decision: A sync policy classifies data into local-only, cloud operational, durable Walrus, and shared scopes.
- Alternatives: Sync everything; manual-only sync; Walrus-only sync.
- Consequences: Policy evaluation, explainability, and auditability become core platform responsibilities.
- Risks: Configuration complexity and incorrect classifications.
- Reversal condition: Usability testing supports a simpler policy model with equivalent privacy and continuity outcomes.

## ADR-PROD-010 — Work unit is the continuity identity

- Status: Accepted
- Context: A task spans multiple sessions and agents; a session can touch more than one task. Treating them as identical creates false progress and completion.
- Decision: Use a Shoo work unit as continuity identity, with optional issue, branch, pull request, or external-task links.
- Alternatives: Session as task; require external issue; infer identity entirely from conversation.
- Consequences: Reliable cross-agent continuation and explicit ambiguity handling; introduces a user-visible concept.
- Risks: Users may see work-unit confirmation as project-management overhead.
- Reversal condition: Discovery shows an existing identifier provides equal continuity with materially lower friction.

## ADR-PROD-011 — Hybrid checkpoint strategy

- Status: Accepted
- Context: Persisting every event creates noise/privacy cost; manual-only capture fails the automatic-capture goal.
- Decision: Capture passive evidence locally, create semantic checkpoints at meaningful boundaries, and retain explicit checkpoint/correction controls.
- Alternatives: Every event as durable memory; manual checkpoints only; periodic timer summaries.
- Consequences: Lower noise and better recovery; boundary detection and partial-state UX become necessary.
- Risks: Missed boundary or premature checkpoint.
- Reversal condition: Evaluation finds a simpler strategy with equal capture completeness and lower correction burden.

## ADR-PROD-012 — Session, work-unit, memory, and sync states are orthogonal

- Status: Accepted
- Context: Client stop/idle, task completion, memory authority, and durable persistence describe different facts.
- Decision: Model and display them independently; no automatic state implication across dimensions without an explicit rule and evidence.
- Alternatives: One aggregate status; last-event-wins state.
- Consequences: Correct degraded/conflict behavior; greater domain and UX complexity.
- Risks: Too many statuses can overwhelm users if surfaced without hierarchy.
- Reversal condition: A simplified projection preserves all required failure semantics.

## ADR-PROD-013 — Automatic capture produces evidence, not automatic truth

- Status: Accepted
- Context: Agent messages and client events can be incomplete, wrong, or scope-specific.
- Decision: Adapters automatically capture evidence; extraction produces candidates; authority rules govern verification, acceptance, and canonicalization.
- Alternatives: Auto-canonical extraction; human approval for every event; raw transcript only.
- Consequences: Trustworthy memory lifecycle with selective human control.
- Risks: Verification friction and delayed canonical state.
- Reversal condition: A narrower memory type can be safely auto-promoted with deterministic validation.

## ADR-PROD-014 — Safe default sync policy minimizes raw durable data

- Status: Accepted
- Context: Policy-driven sync must provide immediate cross-agent value without requiring users to design a security policy before first use.
- Decision: Keep raw prompts, transcripts, secrets, and verbose tool output local by default; sync structured operational state to Shoo Cloud; persist accepted checkpoints, decisions, handoff summaries, and necessary evidence references through MemWal/Walrus; do not persist raw source code to Walrus by default.
- Alternatives: Sync everything; local-only until manual promotion; durable-store all normalized events.
- Consequences: Safer onboarding and lower durable noise; some deep evidence may be unavailable across devices unless explicitly permitted.
- Risks: Over-filtering can reduce context sufficiency; references may point to local evidence unavailable to another device/member.
- Reversal condition: Continuation evaluation proves a broader data class is necessary and privacy/security review approves it.

## ADR-PROD-015 — MVP is one closed loop delivered through four vertical slices

- Status: Accepted
- Context: A component checklist can produce storage, Web, or MCP pieces without proving continuation value.
- Decision: Scope MVP as Slice A trusted start, Slice B durable checkpoint, Slice C cross-agent continuation, and Slice D inspect/correct/ask.
- Alternatives: Component-based releases; Web-first Q&A; storage-first infrastructure; full feature bundle before testing.
- Consequences: Each slice has user-observable value and exit evidence; later features cannot mask an earlier failed hypothesis.
- Risks: Cross-cutting contracts must be minimal but coherent early.
- Reversal condition: A smaller end-to-end slice proves the same hypothesis with lower scope.

## ADR-PROD-016 — OpenCode capture and Codex continuation are intentionally asymmetric

- Status: Accepted
- Context: The clients expose different lifecycle capabilities; parity would delay evidence and encourage false equivalence.
- Decision: Optimize OpenCode for first capture and Codex for first continuation; both use shared Shoo contracts but need not offer identical capture depth in MVP.
- Alternatives: Full parity; single-client MVP; broad multi-agent matrix.
- Consequences: Faster cross-agent proof with explicit capability manifests.
- Risks: Users may interpret Codex capture as second class.
- Reversal condition: Evaluation requires bidirectional parity to demonstrate value.

## ADR-PROD-017 — Minimal Shoo Web governance is mandatory in MVP

- Status: Accepted
- Context: Automatic capture without inspection, sources, correction, policy, and durable status creates unacceptable trust risk.
- Decision: Include minimal overview, timeline, decisions, unfinished work, source drawer, correction, and policy/durable state; exclude broad project-management UI.
- Alternatives: MCP/CLI-only MVP; full Sensei-style intelligence dashboard.
- Consequences: Larger MVP surface but closes the trust and correction loop.
- Risks: Web work competes with core capture/resume work.
- Reversal condition: An agent/CLI governance experience passes the same usability and trust outcomes.

## ADR-PROD-018 — Team-ready domain constraints, solo-only product workflow

- Status: Accepted
- Context: Retrofitting tenant/scope identity is expensive, but building team orchestration before solo validation is over-scope.
- Decision: Preserve organization/team/member/visibility/authority identifiers and isolation invariants while deferring team UX and coordination logic.
- Alternatives: Pure solo schema; full team-first MVP.
- Consequences: Safer Commercial SaaS evolution without team feature breadth.
- Risks: “Schema-ready” becomes a pretext for premature generalized infrastructure.
- Reversal condition: Domain review shows a smaller solo model can migrate safely later.

## ADR-PROD-019 — Ask Shoo is included after the continuation path and shares its truth system

- Status: Accepted
- Context: Ask Shoo is an accepted MVP outcome, but building it first risks becoming a generic chatbot or parallel retrieval stack.
- Decision: Deliver cited Ask Shoo in Slice D only after context-pack retrieval works; reuse the same scope, authority, supersession, ranking, and citations.
- Alternatives: Ask-first MVP; defer Ask entirely; separate RAG stack.
- Consequences: Lower duplication and consistent truth; Ask arrives later in MVP sequence.
- Risks: Slice D scope may extend beta timing.
- Reversal condition: Ask cannot reuse the shared retrieval path without disproportionate complexity.

## ADR-PROD-020 — One requirement registry and one current-truth model

- Status: Accepted — Gate 4
- Context: Separate module PRDs can drift into inconsistent definitions of project state, authority, and citations.
- Decision: Core, Memory, Intelligence, Coordination, and Platform use stable requirement IDs, shared problem/goal/scenario registries, and one current-truth/citation semantics.
- Alternatives: Independent module PRDs; Web-specific projection; agent-specific memory semantics.
- Consequences: Strong cross-surface consistency and traceability; shared contracts become a coordination dependency.
- Risks: Central semantics can become a bottleneck or overcoupled implementation.
- Reversal condition: A bounded projection can prove semantic equivalence through explicit consistency tests.

## ADR-PROD-021 — Coordination PRD is a deferred planning baseline

- Status: Accepted — Gate 4
- Context: Team coordination is strategically important but Gate 3 excludes its workflow from MVP.
- Decision: Keep only team-ready scope/permission/anti-surveillance invariants in MVP; SHOO-FR-301–307 are not implementation-authorized.
- Alternatives: Remove Coordination documentation; include a thin team beta; implement blockers/handoffs early.
- Consequences: Future intent remains traceable without contaminating the continuation MVP.
- Risks: Schema fields invite premature services; future requirements may be mistaken for commitments.
- Reversal condition: A new discovery and scope gate supersedes Gate 3 after solo continuation evidence.

## ADR-PROD-022 — Phase 4 specifies behavior, not technology or detailed contracts

- Status: Accepted — Gate 4
- Context: PRD must be testable while preserving architectural decision space for AICD.
- Decision: Requirements define user/system behavior, acceptance evidence, security, data semantics, and failure outcomes; exact MCP/API schemas, stores, consistency mechanisms, and deployment topology belong to Gate 5.
- Alternatives: Technology-specific PRD; architecture-free prose; prototype-as-contract.
- Consequences: Lower premature lock-in and clearer Gate 5 authority.
- Risks: Some feasibility questions remain open until AICD; vague requirements could be misread.
- Reversal condition: A requirement cannot be evaluated without a product-level protocol constraint, in which case that constraint is added explicitly.

## ADR-PROD-023 — Instrument now; set numeric quality thresholds from measured baselines

- Status: Accepted — Gate 4
- Context: Shoo lacks production or beta baselines for SCRR, retrieval, capture accuracy, latency, and failure recovery.
- Decision: Make metric instrumentation and qualitative release guards mandatory in MVP, then pre-register and approve numeric thresholds in Phase 9 using R0–R2 evidence.
- Alternatives: Invent thresholds now; release without thresholds; copy unrelated industry benchmarks.
- Consequences: Avoids false precision while preserving evidence collection.
- Risks: Teams may treat missing numbers as permission to ship weak quality.
- Reversal condition: Authoritative external constraints or validated benchmark data justify an earlier hard threshold.

## ADR-ARCH-001 — Modular cloud core, separate workers, and separate local runtime

- Status: Accepted — Gate 5
- Context: The predecessor combined container is fast but coupled; microservices would add operational cost before validated scale.
- Decision: Use a modular monolith for synchronous cloud domain operations, horizontally scalable workers for asynchronous jobs, Shoo Web as a separate deployment, and Shoo Local as a separately packaged trust boundary.
- Alternatives: Extend combined predecessor container; microservices from day one.
- Consequences: Fast transactions and migration with explicit split seams through ports/outbox.
- Risks: Module boundaries can erode without dependency checks.
- Reversal condition: Measured scale, isolation, regulatory, or deployment needs require a service split.

## ADR-ARCH-002 — PostgreSQL operational truth, SQLite local spool, pgvector first

- Status: Accepted — Gate 5
- Context: MVP needs transactions, tenant scope, FTS/vector search, offline capture, and low operational complexity.
- Decision: PostgreSQL owns cloud operational truth and initial hybrid index; encrypted SQLite owns local restricted evidence/offline spool; Redis is optional ephemeral acceleration only.
- Alternatives: Dedicated vector DB; Walrus operational store; Redis-first queue/state; local JSON files.
- Consequences: Fewer consistency planes and strong offline recovery.
- Risks: pgvector or SQLite packaging may miss future workload/platform needs.
- Reversal condition: Benchmarks or security review fail approved fitness thresholds.

## ADR-ARCH-003 — Transactional aggregates, event ledger, and outbox; not full event sourcing

- Status: Accepted — Gate 5
- Context: Shoo needs audit/replay and reliable async work without making every read a projection concern.
- Decision: Mutate aggregate tables, append domain events, and enqueue outbox jobs in one PostgreSQL transaction.
- Alternatives: CRUD without ledger; full event sourcing; external broker dual-write.
- Consequences: Correct recovery with lower MVP complexity.
- Risks: Ledger and aggregate divergence if transaction boundaries are bypassed.
- Reversal condition: Temporal/replay requirements justify full event sourcing or throughput requires a log platform.

## ADR-ARCH-004 — Strong authority mutations, eventual extraction/index/durability

- Status: Accepted — Gate 5
- Context: Permission/canonical state needs correctness; capture and external durability need availability and non-blocking behavior.
- Decision: Use strong transactional consistency for authorization, work transitions and canonical lineage; optimistic concurrency per aggregate; eventual idempotent processing for evidence, extraction, projections, retrieval index and MemWal/Walrus.
- Alternatives: Strong consistency everywhere; eventual consistency everywhere; last-write-wins.
- Consequences: Coding continues during provider outages while high-impact truth remains protected.
- Risks: Users must understand pending/freshness state.
- Reversal condition: A workflow proves that its consistency class violates an approved acceptance outcome.

## ADR-ARCH-005 — Canonical resolution precedes retrieval ranking

- Status: Accepted — Gate 5
- Context: Semantic similarity and recency can surface superseded or unauthorized memory.
- Decision: Apply permission, typed scope, authority, supersession and conflict resolution before hybrid candidate ranking; all surfaces share this path.
- Alternatives: Vector-first filtering; per-surface retrieval; LLM conflict resolution.
- Consequences: Safer current truth and consistent citations.
- Risks: Resolver complexity and tighter shared dependency.
- Reversal condition: A bounded alternative proves equivalent authority and cross-surface consistency.

## ADR-ARCH-006 — MCP is the agent access plane, not the automatic capture plane

- Status: Accepted — Gate 5
- Context: Model-invoked tools cannot reliably capture all lifecycle evidence; selected clients expose native plugins/hooks.
- Decision: Use OpenCode plugins and Codex hooks for automatic capture, normalize them through client adapters, and keep MCP narrow for context, explicit checkpoint/memory and authorized mutations.
- Alternatives: MCP-only capture; client-specific domain models; broad tool catalogue.
- Consequences: Better capture completeness with explicit capability asymmetry.
- Risks: Adapter maintenance and client-version drift.
- Reversal condition: A standardized client protocol provides equivalent verified lifecycle capture.

## ADR-ARCH-007 — MemWal/Walrus durable trust mode is explicit

- Status: Accepted — Gate 5
- Context: Managed MemWal encrypts for storage but its relayer processes plaintext; manual, self-hosted and TEE modes have different trust/operations trade-offs.
- Decision: Use MemWal Manual as Shoo's default durable path. Managed mode is not an automatic fallback. Never market managed mode as E2E encryption.
- Alternatives: Assume managed encryption is E2E; avoid MemWal; persist all eligible data identically.
- Consequences: Honest threat model and policy-aware durability.
- Risks: Manual mode increases wallet, embedding, local crypto, recovery and cross-platform responsibility.
- Reversal condition: Verified upstream behavior or Shoo encryption architecture changes the plaintext exposure boundary.

## ADR-ARCH-008 — MemWal account, namespace and delegate authority belong to the user

- Status: Accepted — Gate 5
- Context: Shoo promises portable user-controlled project memory; Shoo-owned accounts would recreate platform custody and lock-in.
- Decision: The user owns the wallet and MemWal account. Namespaces are created for the user's Shoo projects. Device/service delegate keys are registered under user authority and are independently revocable.
- Alternatives: Shoo-owned pooled account; account per Shoo tenant controlled by Shoo; shared delegate key.
- Consequences: Strong portability and exit rights; onboarding and recovery become product responsibilities.
- Risks: Key loss, wallet friction, namespace mistakes and multi-device recovery complexity.
- Reversal condition: MemWal introduces a safer non-custodial account abstraction with equivalent user ownership.

## ADR-ARCH-009 — Defense-in-depth tenant isolation without per-tenant database roles

- Status: Accepted — Gate 5
- Context: App-only filtering is fragile; one database role per tenant creates operational complexity and poor connection pooling.
- Decision: Enforce authorization in the application and PostgreSQL FORCE RLS. Runtime uses a non-owner, non-BYPASSRLS role and sets transaction-local tenant/project context. Migration/maintenance roles are separate and never serve requests.
- Alternatives: App checks only; role/schema/database per tenant; RLS only.
- Consequences: Strong isolation with no user-facing friction and manageable SaaS operations.
- Risks: Missing transaction context can deny work; unsafe privileged paths can bypass RLS.
- Reversal condition: Enterprise isolation requirements demand database-per-tenant or a verified simpler model offers equal protection.

## ADR-ARCH-010 — OS vault for keys, encrypted SQLite for evidence

- Status: Accepted — Gate 5
- Context: Shoo Local needs offline capture and Manual crypto while protecting wallet/delegate material across desktop operating systems.
- Decision: Store delegate/database secrets in the OS credential vault; store restricted evidence in encrypted SQLite; never store the primary wallet private key or plaintext secrets in SQLite. Wallet-signer mode is default; headless mode is explicit opt-in using a separate Shoo Memory Wallet.
- Alternatives: Environment variables; plaintext SQLite; cloud-only evidence; always-headless wallet key.
- Consequences: Balanced UX/security with graceful offline behavior.
- Risks: Linux vault availability, lost recovery material, OS-account compromise and packaging complexity.
- Reversal condition: Cross-platform spike cannot meet security/recovery requirements or a hardware-backed solution becomes practical.

## ADR-ARCH-011 — Specialized vector store and broker require measured scale triggers

- Status: Accepted — Gate 5
- Context: Adding infrastructure early increases cost and consistency failure modes; waiting too long can overload PostgreSQL.
- Decision: Keep pgvector and PostgreSQL outbox until defined latency, interference, backlog, replay or recovery thresholds are crossed in sustained measurement.
- Alternatives: Add vector database and broker immediately; never split.
- Consequences: Lower MVP complexity with explicit escape hatches.
- Risks: Migration under growth pressure if telemetry is inadequate.
- Reversal condition: Phase 5C benchmark already crosses a trigger.

## ADR-ARCH-012 — Singapore-first, provider-portable deployment

- Status: Accepted — Gate 5
- Context: Initial users are in Vietnam/SEA; Shoo needs fast delivery without creating permanent provider lock-in.
- Decision: Co-locate paid app, worker and PostgreSQL services in Singapore for R0–R2; keep containers, PostgreSQL schema and backup format portable. Review AWS Singapore migration before R3 only if availability, compliance, network or scale requirements justify it.
- Alternatives: AWS from day one; free-tier Render; US region; multi-region MVP.
- Consequences: Low latency and faster operations with a credible migration path.
- Risks: Provider capability limits, region migration and Walrus's non-regional durable layer.
- Reversal condition: Target cohort, legal requirement, provider outage profile or cost evidence favors another region/provider.

## ADR-ARCH-013 — Hybrid embedding policy with an explicit privacy boundary

- Status: Accepted — Gate 5
- Context: MemWal Manual protects plaintext from the managed relayer, but a cloud embedding provider would still receive eligible plaintext. Local embedding improves privacy but adds packaging, compute and model-consistency cost.
- Decision: Use a disclosed cloud embedding provider for minimized policy-eligible R0 data; retain a provider-neutral embedding port and evaluate local embedding as a R1/R2 privacy mode. Record model/version/dimension and require re-index evaluation on change.
- Alternatives: Cloud-only; local-only from R0; no semantic retrieval.
- Consequences: Faster R0 with an honest boundary and an escape path.
- Risks: Users may reasonably reject cloud plaintext processing; local/cloud embeddings may diverge.
- Reversal condition: Privacy research, provider terms, quality or latency makes the R0 route unacceptable.

## ADR-ARCH-014 — Clerk behind a Shoo identity abstraction for R0–R2

- Status: Accepted — Gate 5
- Context: Commercial SaaS needs secure identity quickly, while Shoo authorization and MemWal ownership must remain independent from an identity vendor.
- Decision: Use Clerk for R0–R2 authentication/session/organization integration behind internal identity ports. Shoo owns stable subject mapping, roles, project membership and authorization; MemWal wallet ownership remains user-controlled.
- Alternatives: Auth0; self-hosted identity; cloud-provider-native identity.
- Consequences: Faster SaaS delivery with contained lock-in.
- Risks: Pricing, outage, organization semantics or export constraints may become limiting.
- Reversal condition: Enterprise federation, cost, residency or portability evidence favors another provider.

## ADR-ARCH-015 — Cost-meter-first commercial architecture

- Status: Accepted — Gate 5
- Context: Render, model and Walrus prices change, and Shoo lacks usage distributions. A fixed estimate would create false precision.
- Decision: Meter cost by successful continuation and supporting operations, reconcile invoices weekly, and delay packaging/pricing claims until R0–R2 evidence and willingness-to-pay research exist.
- Alternatives: Price from competitor anchors; build for maximum scale; ignore unit cost until beta.
- Consequences: Evidence-based economics and clear cost controls.
- Risks: Pricing remains open longer; missing meters can hide margin problems.
- Reversal condition: Binding provider contracts or validated comparable workloads give a reliable earlier baseline.

## ADR-ARCH-016 — Initial beta SLO and error-budget baseline

- Status: Accepted — Gate 5
- Context: Non-blocking durability requires separate stage targets; no baseline currently exists.
- Decision: Target p95 local capture `<500ms`, operational commit `<2s`, context retrieval `<5s`, outbox age `<30s`, and Manual durable confirmation `<5m`, with 99.5% monthly beta context availability and zero discretionary cross-tenant disclosure budget.
- Alternatives: No targets until production; one end-to-end latency; contractual SLA immediately.
- Consequences: Operable stage-level expectations that can be recalibrated from evidence.
- Risks: Targets may be too loose/tight or confused with customer SLA.
- Reversal condition: R1 measurements or product research justify a documented adjustment.

## ADR-ARCH-017 — Signed manual update at R0, prompted auto-update from R1

- Status: Accepted — Gate 5
- Context: Shoo Local handles sensitive evidence and keys; unsigned or silent updates create supply-chain and trust risk, while permanent manual updates cause fragmentation.
- Decision: R0 provides signed user-initiated updates. R1 may download and prompt for signed updates with safe rollback. No silent MVP installation; trust-mode changes always require consent.
- Alternatives: Silent auto-update; manual forever; OS store only.
- Consequences: Balanced control and security with a clear evolution path.
- Risks: Signing-key compromise, skipped updates and cross-platform packaging complexity.
- Reversal condition: Platform store policy or validated enterprise device management provides a safer equivalent.

## ADR-ARCH-018 — Contract-first strangler migration from predecessor code

- Status: Accepted — Gate 5
- Context: Kage/Sensei contain useful capability but different names, auth, data semantics and unsafe default source transfer.
- Decision: Inventory and map first; wrap reusable functions behind Shoo contracts; run deterministic dry migration and shadow comparison; cut over by vertical slice; never bulk rename or auto-promote imported memory.
- Alternatives: Rewrite everything; bulk rename/in-place schema migration; run predecessor and Shoo indefinitely.
- Consequences: Preserves useful code and lineage while protecting Shoo semantics.
- Risks: Dual-path complexity and hidden semantic mismatch.
- Reversal condition: Inventory proves reuse cost exceeds a clean rewrite for a bounded capability.

## ADR-UX-001 through ADR-UX-008 — Phase 6 UX baseline

- Status: Accepted — Gate 6
- Context: Shoo requires one coherent behavior model across CLI, agents and Web without expanding into project management or obscuring trust boundaries.
- Decision: Adopt continuity-first organization, staged activation, six-destination MVP Web navigation, independent state grammar, one-interaction source access, impact preview, outcome-first technical disclosure, and Web governance without Coordination breadth as specified in ART-55.
- Alternatives: Agent/infrastructure-first IA; one-step mandatory setup; chatbot-first Web; combined status badge; always-visible technical detail; disabled future navigation.
- Consequences: Clearer core outcome and trust behavior; significant usability validation remains necessary.
- Risks: Work Unit terminology, status complexity, wallet friction and Web breadth.
- Reversal condition: Gate 6 validation shows a named decision fails the acceptance outcome; revise that ADR without reopening accepted architecture or scope.

## ADR-UI-001 through ADR-UI-008 — Phase 7 visual baseline

- Status: Accepted — Gate 7
- Context: Shoo needs a recognizable B2B developer-infrastructure visual system that preserves authority, provenance, durability and accessibility semantics.
- Decision: Adopt Calm Technical Evidence, semantic redundant state colors, IBM Plex typography, flat bordered surfaces, evidence-first components, independent durability visuals, question-led anti-surveillance visualization and accessibility/state fidelity as release invariants, as specified in ART-62.
- Alternatives: AI-neon branding; dashboard-card-first UI; system-font-only without mono pairing; color-only status; visualized activity volume; dark-mode-first styling.
- Consequences: Coherent and trustworthy UI with explicit implementation QA; less decorative novelty and more design-system discipline.
- Risks: Palette distinction, font delivery, provenance density, dark-mode accent overuse and future-component scope leakage.
- Reversal condition: Rendered contrast, accessibility, comprehension or performance validation fails a named choice; revise that choice without collapsing accepted UX semantics.

## ADR-IMPL-001 through ADR-IMPL-008 — Phase 8 implementation baseline

- Status: Accepted — Gate 8
- Context: Accepted product, architecture and design must become an executable delivery system without reintroducing predecessor coupling or component-first planning.
- Decision: Adopt the TypeScript pnpm/Turborepo monorepo, four runtime boundaries, Fastify/Next.js candidates behind Shoo contracts, typed SQL/authored migrations, tranche-gated vertical slices, contract-first predecessor strangler, CI-enforced fitness gates and one accountable owner per outcome/invariant, as specified in ART-71.
- Alternatives: Multi-repository/microservices from day one; component-team roadmap; bulk predecessor rename; ORM-managed schema; broad backlog authorization.
- Consequences: Fast contract reuse and incremental proof with explicit boundaries; cross-platform Local and framework candidates require spikes.
- Risks: MVP breadth, tooling/framework lock-in, local packaging, MemWal dependency and unknown migration volume.
- Reversal condition: Named spike or measured delivery evidence fails a choice; revise that ADR while preserving Gate 5–7 semantics.

## ADR-IMPL-009 through ADR-IMPL-013 — Phase 8 implementation addendum

- Status: Accepted — Gate 8
- Context: The confirmed team, CI provider, container question, local encryption uncertainty, provider ownership and user/Shoo responsibility boundary materially affect delivery and security.
- Decision: Use Docker for separate cloud images but a signed host package for Shoo Local; application-level libsodium AEAD for sensitive SQLite payloads with optional SQLCipher after spike; GitHub Actions/GHCR; organizational recovery around Bernie-owned initial accounts; and a shared-responsibility model where user ownership never removes Shoo's security/legal enforcement duties, as specified in ART-72.
- Alternatives: Containerize Local by default; mandate SQLCipher fork now; founder-personal accounts indefinitely; transfer authorization/encryption liability to users.
- Consequences: Clearer runtime and legal/security boundaries with less native encryption lock-in; requires package, crypto and account-governance work.
- Risks: Metadata leakage from minimal SQLite scheduling fields, application-crypto implementation error, founder account concentration and host-package complexity.
- Reversal condition: SPIKE-01/security review proves a maintained full-file binding is safer and operationally viable, or provider/account structure changes without weakening user ownership or Shoo duties.

## ADR-EVAL-001 through ADR-EVAL-007 — Phase 9 validation contract

- Status: Accepted — Gate 9
- Context: Gate 8 authorizes a bounded implementation tranche, but Shoo must define falsifiable product, technical, trust and commercial evidence before observing results.
- Decision: Use SCRR as North Star; triangulate outcome evidence; evaluate authority before ranking fluency; govern versioned/sealed datasets; apply staged thresholds and zero-tolerance trust gates; expand cohorts only on evidence; and prohibit premature PMF claims, as specified in ART-80.
- Alternatives: Feature-completion release gates; self-report-only success; vector benchmark as quality; unsealed tuning dataset; activity-volume adoption metrics.
- Consequences: Clear go/hold/stop criteria and stronger claim integrity; adds research/evaluation work and may slow cohort expansion.
- Risks: Small-cohort uncertainty, measurement privacy, benchmark gaming, threshold weakening and evaluation-owner conflict.
- Reversal condition: Calibration evidence shows a metric or threshold is invalid; revise it through a pre-unblinding ADR without weakening zero-tolerance security/authority gates.

## ADR-IMPL-014 — Sustainable capacity, separated ownership and recoverable control

- Status: Accepted — Implementation Readiness
- Context: Shoo has a multi-role startup team, but headcount and temporary overtime do not establish sustainable delivery capacity. Slice A, security, durable memory, evaluation, sealed data and emergency recovery require explicit accountable/deputy separation.
- Decision: Cap baseline planning at 1.0 FTE per person; calculate effective delivery capacity from actual Shoo allocation and focus factors; accept the ART-81 owner/deputy map; separate dataset owner, custodian and release approver; assign Bernie and the DevOps engineer as primary and second break-glass administrators with named-account, hardware-MFA and drill controls.
- Alternatives: Plan at 1.0–1.5 FTE/person; leave ownership with Bernie; grant a shared emergency credential; let feature implementers own sealed labels and release approval.
- Consequences: More credible dates, lower founder bus factor and stronger evaluation/recovery integrity; less nominal roadmap capacity and additional rehearsal/governance work.
- Risks: Role-title fit may not equal AppSec/evaluation competence; DevOps may accumulate operational privilege; deputies may be nominal without real practice.
- Reversal condition: Allocation, capability, trust/employment or rehearsal evidence fails an assignment; remap the affected duty through an ADR while retaining separation of duties and two-person recovery controls.

## ADR-IMPL-015 — Planning closure with bounded implementation authorization

- Status: Accepted — Gate 10
- Context: Shoo has accepted product, PRD, architecture, UX, UI, implementation and evaluation baselines. The remaining risk is not lack of planning depth; it is converting unvalidated assumptions into delivery commitments or expanding scope before the first continuation loop is proven.
- Decision: Use ART-82 as the planning-closure checklist. Gate 10 declares planning complete only for the bounded implementation start: repository skeleton, approved spikes and Slice A. Named allocation, capability evidence, security review, recovery drill and evaluation setup remain pre-kickoff or pre-exit blockers according to ART-82.
- Alternatives: Close planning informally; keep planning open until all assumptions are validated; authorize the full roadmap at once.
- Consequences: The team gets a clear transition from planning to implementation while preserving evidence gates and scope control.
- Risks: Stakeholders may misread planning closure as product validation, date commitment or authorization for all phases.
- Reversal condition: ART-82 reveals unresolved contradictions among accepted artifacts, missing critical ownership, or a stakeholder decision to change the MVP boundary.

## ADR-IMPL-016 — Five-day evidence-based Implementation Readiness Week

- Status: Accepted — Implementation Readiness
- Context: Gate 10 closed planning, but named allocation, role consent, cross-platform local encryption, MemWal Manual behavior, predecessor mapping and Slice A evaluation readiness still require execution evidence before an implementation forecast is credible.
- Decision: Execute ART-83 as a five-consecutive-working-day readiness timebox. Limit work to ownership/capacity closure, repository and CI walking skeleton, approved security and MemWal spikes, client/event fixtures, Kage/Sensei contract mapping, failure/recovery dry runs and Slice A evaluation readiness. End with GO, CONDITIONAL GO or NO-GO.
- Alternatives: Start Slice A immediately without readiness evidence; keep readiness open-ended; run all future platform and product work in parallel.
- Consequences: The team spends one week reducing execution and trust uncertainty before broad implementation; visible feature output is intentionally limited.
- Risks: The week may become a disguised implementation sprint, a ceremonial checklist or an excuse for scope expansion.
- Reversal condition: A critical owner is unavailable or the five-day timebox cannot produce a decision; pause affected work, remap ownership or reduce the supported Slice A boundary through an ADR.
