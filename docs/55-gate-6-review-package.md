# Shoo Decision Gate 6 Review Package

- Version: 0.2
- Status: Accepted — Decision Gate 6
- Owner role: Product & Engineering Design Board / Technical Program Manager
- Dependencies: ART-48 through ART-54; accepted Gate 5 architecture
- Assumptions: Low-fidelity usability validation is carried into implementation; Gate 6 approves UX architecture, not visual styling
- Unresolved questions: Terminology and prototype results that may refine labels/layout without changing workflow semantics
- Last decision: User approved Gate 6 without amendments
- Next action: Use accepted UX architecture as the constraint baseline for Phase 7 visual design

## Gate recommendation

**Approve Phase 6 UX Architecture with prototype validation conditions.**

## UX decisions proposed

### ADR-UX-001 — Continuity-first product organization

Organize every surface around resume, current change, trust and required action—not agents, memory volume or infrastructure.

### ADR-UX-002 — Staged activation

Measure and guide first connected project, first successful memory, first durable memory and first cross-agent continuation separately. Durable setup can remain incomplete without blocking local coding, but onboarding is not fully complete until the Manual round trip succeeds.

### ADR-UX-003 — Six-destination MVP Web navigation

Use Pulse, Work, Ask Shoo, Activity, Knowledge and Settings. Hide future Flow/Coordination navigation until a new scope gate.

### ADR-UX-004 — One independent state grammar

Use authority, freshness, capture, sync and permission as independent dimensions across CLI, MCP and Web.

### ADR-UX-005 — Evidence one interaction away

Every factual current-state item exposes freshness and accessible source interaction; detailed provenance uses a stable drawer/route.

### ADR-UX-006 — Preview before high-impact mutation

Correction, canonicalization, broad sharing, headless mode, delegate change, export/deletion and trust-mode changes preview scope, impact and reversibility.

### ADR-UX-007 — Outcome language with technical disclosure

Use Durable Memory and Device Access in primary UX; disclose MemWal/Walrus/namespace/delegate details in setup and technical views. Never obscure retention or plaintext boundaries.

### ADR-UX-008 — Web governance, not project-management breadth

MVP Web supports Pulse, inspection, correction, Ask, policy and privacy. It does not implement blocker, dependency, handoff, team pace or critical path screens.

## Completeness assessment

| Phase 6 requirement | Artifact | Assessment |
|---|---|---|
| Information architecture | ART-48 | Complete MVP/deferred boundaries |
| User flows | ART-49 | Complete core and recovery paths |
| Developer tool UX | ART-50 | Complete command/health/onboarding baseline |
| Screen inventory/specifications | ART-51 | Complete MVP screen questions and content hierarchy |
| Interaction/state rules | ART-52 | Complete cross-surface state and failure grammar |
| Wireframe/component inventory | ART-53 | Complete low-fidelity structure; visual design intentionally pending |
| UX copy/accessibility | ART-54 | Complete baseline and acceptance rules |

## Validation conditions

- UX-FT-01: user completes project/client connection and understands effective capture policy.
- UX-FT-02: user distinguishes first memory, operational sync and durable confirmation.
- UX-FT-03: user resumes OpenCode work in Codex without manual project-state recap.
- UX-FT-04: user identifies fact, inference, suggestion, conflict and superseded state without color.
- UX-FT-05: user opens a source and explains its time, scope and authority.
- UX-FT-06: user corrects a stale memory and predicts affected future outputs.
- UX-FT-07: user recovers from offline, MemWal unavailable and partial-capture states.
- UX-FT-08: user exports/uninstalls without unintentionally deleting cloud or durable data.
- UX-FT-09: navigation tree test reaches key destinations without training.
- UX-FT-10: keyboard/screen-reader audit passes critical onboarding, resume, Ask and correction paths.

## Residual UX risks

1. Work Unit may feel like a second task system.
2. Wallet/Manual setup may interrupt activation before value is understood.
3. Five status dimensions may overwhelm if hierarchy is not disciplined.
4. Ask Shoo may visually drift into generic chatbot conventions.
5. Minimal Web still has significant surface area for an MVP.

## Gate 6 acceptance statement

“Shoo’s Phase 6 UX Architecture is approved as the behavioral and information-structure baseline for Phase 7 visual design. Visual styling may refine presentation but may not collapse authority/durability states, hide provenance, introduce Coordination scope, or change accepted workflows without a new decision.”
