# Shoo Decision Gate 7 Review Package

- Version: 0.2
- Status: Accepted — Decision Gate 7
- Owner role: Product & Engineering Design Board / Technical Program Manager
- Dependencies: ART-56 through ART-61; accepted Gate 6 UX Architecture
- Assumptions: Gate 7 approves visual and component direction, not production frontend code or product-quality validation
- Unresolved questions: High-fidelity prototype results, final wordmark, font delivery and dependency accessibility evidence
- Last decision: User approved Gate 7 without amendments
- Next action: Use accepted UI baseline as a constraint for Phase 8 implementation planning

## Gate recommendation

**Approve Phase 7 Principal UI Design with token/prototype validation conditions.**

## UI decisions proposed

### ADR-UI-001 — Calm Technical Evidence direction

Use graphite neutral foundations, restrained cobalt primary action and explicit evidence hierarchy. Reject neon gradients, glassmorphism, AI glow and decorative intelligence cues.

### ADR-UI-002 — Semantic status colors with redundant encoding

Use cobalt for canonical/current governing state, teal for verified/accepted, amber for conflict, violet/neutral for stale/history and red only for critical/destructive states. Text/icon/structure are mandatory.

### ADR-UI-003 — IBM Plex typography system

Use IBM Plex Sans for UI/content and IBM Plex Mono for code, identifiers, timestamps and provenance, with system fallbacks and Vietnamese validation.

### ADR-UI-004 — Flat bordered surfaces and restrained elevation

Use borders and neutral surface shifts for most hierarchy; reserve shadow/elevation for overlays and modal layers.

### ADR-UI-005 — Evidence-first component system

Prioritize Context Pack Preview, Source Drawer, Decision Status, Conflict Panel, Ask Response, Capture Health and Sync State Cluster before generic dashboard components.

### ADR-UI-006 — Durability remains visually independent from truth

Represent Device → Shoo → Durable as a separate sequence; never use a durable confirmation badge as a canonical/verified indicator.

### ADR-UI-007 — Visualization is question-led and anti-surveillance

MVP visualizations are timeline, lineage, completeness and sync progression. Dependency/team-flow visuals remain future and cannot rank people.

### ADR-UI-008 — Accessibility and responsive state fidelity are release invariants

Target WCAG 2.2 AA, light/dark parity, keyboard/screen-reader critical flows, 200% zoom, reduced motion and non-color status comprehension.

## Completeness assessment

| Phase 7 output | Artifact | Assessment |
|---|---|---|
| Visual direction | ART-56 | Complete direction and anti-goals |
| Design tokens/foundations | ART-57 | Complete candidate tokens and governance |
| Component specifications | ART-58 | Complete MVP semantics; future components clearly deferred |
| Data visualization | ART-59 | Complete MVP/future boundaries and anti-surveillance rules |
| Screen-level UI | ART-60 | Complete critical screen direction and responsive behavior |
| Accessibility/UI quality | ART-61 | Complete test strategy and release invariants |

## Validation conditions

- Token colors must pass measured contrast in rendered light/dark themes.
- High-fidelity prototype must cover Pulse, Ask, Conflict, Durable Memory setup and mobile inspection.
- Users must distinguish canonical, accepted, stale, conflict, superseded and durable states without relying on color.
- Ask Shoo must be recognized as evidence-grounded project intelligence rather than a generic chatbot.
- Third-party wallet and identity paths require accessibility review.
- Future Coordination components remain design lineage only and cannot enter MVP implementation.

## Residual risks

1. IBM Plex delivery may affect bundle or rendering consistency.
2. Cobalt/teal distinctions may be insufficient without labels—which is why labels are mandatory.
3. Dense provenance can overwhelm Pulse and Ask if progressive disclosure is poorly implemented.
4. Dark mode can drift toward “AI neon” if accents are overused.
5. Specifying future Coordination components may be misread as implementation authorization.

## Gate 7 acceptance statement

“Shoo’s Phase 7 visual direction, semantic token model, component system and screen-level UI specifications are approved as the design baseline for implementation planning. Production implementation must validate contrast, accessibility, state comprehension and responsive behavior; Gate 7 does not authorize future Coordination scope or override accepted UX/architecture semantics.”
