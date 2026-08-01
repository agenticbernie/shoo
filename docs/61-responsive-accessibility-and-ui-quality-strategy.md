# Shoo Responsive, Accessibility and UI Quality Strategy

- Version: 0.1
- Status: Accepted — Decision Gate 7
- Owner role: Accessibility Lead / Staff Frontend Engineer / QA Architect
- Dependencies: Design Tokens; Component System; Screen UI Specifications; UX Accessibility Requirements
- Assumptions: Browser support targets current and previous major evergreen releases; terminal support follows R0 platform matrix
- Unresolved questions: Exact supported browser/OS versions at implementation planning; third-party wallet accessibility quality
- Last decision: Treat accessibility and state fidelity as release invariants, not post-visual QA
- Next action: Create automated token/component checks and manual critical-flow test scripts

## Responsive contract

| Range | Layout | Interaction boundary |
|---|---|---|
| `>=1440px` | Full nav, main content, persistent drawer possible | Full creation/resolution/policy actions |
| `1100–1439px` | Full/collapsed nav, overlay drawer | Full actions |
| `768–1099px` | Collapsible nav, single main column | Full low-complexity actions; conflict comparison sequential |
| `<768px` | Mobile menu, card/list layouts | Read/inspect/simple approve; complex merge/policy setup moves to desktop |

No information is removed solely because the viewport is smaller; complexity may be deferred with explicit rationale and preserved state.

## Accessibility release standard

- WCAG 2.2 AA target for all MVP Web flows.
- EN 301 549 considerations for future enterprise procurement are tracked, not claimed until audited.
- CLI supports keyboard-only, plain text, `NO_COLOR`, predictable exit codes and screen-reader-safe stage output.
- Third-party wallet/identity surfaces are evaluated as dependencies; inaccessible critical paths require an alternative or block release.

## Automated checks

- Semantic lint and accessible-name coverage.
- Token contrast unit tests for approved foreground/background pairs.
- Axe-equivalent critical page scans.
- Keyboard focus snapshot/order assertions for drawers/dialogs.
- Visual regression for light/dark, 200% zoom and common responsive widths.
- Component state matrix screenshots.
- No primitive color use outside token definitions.

Automated checks do not substitute for manual screen-reader, cognition and workflow tests.

## Manual critical-flow matrix

| Flow | Keyboard | Screen reader | Zoom/reflow | Contrast/state | Recovery |
|---|---|---|---|---|---|
| Connect project/agents | Required | Required | 200% | policy/status | config failure |
| Durable Memory setup | Required | Required | 200% | ownership/consent | wallet/MemWal failure |
| Resume work | Required | Required | 200% | freshness/conflict | ambiguity/offline |
| Ask and inspect source | Required | Required | 200% | facts/limits/citations | unknown/denied |
| Correct memory | Required | Required | 200% | impact/version | stale conflict |
| Export/delete/uninstall | Required | Required | 200% | destructive scope | partial operation |

## State fidelity tests

- Grayscale test distinguishes canonical, accepted, conflict, stale and superseded through icon/text/structure.
- Durable confirmed and canonical cannot be confused in a five-second test.
- Missing/restricted evidence cannot visually appear as zero/no issue.
- Focus returns to the exact citation/action trigger after drawer/dialog close.
- Live region announces operation stage and terminal result once.

## Performance and perceived quality

- UI shell and known state render before optional explanation.
- Avoid layout shift when citations or streamed explanation appear.
- Virtualize long lists only when evidence shows need; maintain semantic reading order.
- Prefer SVG/icon subset and bundled variable fonts with controlled fallback.
- Respect reduced motion and low-bandwidth conditions.

## Design-system governance

- Every component change includes owner, semantic purpose, states, accessibility evidence and screen usage.
- Exception to tokens/components expires and must not fork a second visual language.
- Design/engineering pair reviews source-of-truth semantics before visual polish.
- Phase 7 approval does not waive Phase 6 usability tests or Phase 9 outcome evaluation.

## UI quality gates

- UI-FT-01: approved semantic token contrast passes in light/dark themes.
- UI-FT-02: all critical components pass keyboard/screen-reader state matrix.
- UI-FT-03: canonical/durable/conflict comprehension passes without color.
- UI-FT-04: 200% zoom and Vietnamese expansion preserve critical actions/copy.
- UI-FT-05: no forbidden AI/Web3 visual metaphor appears in core product.
- UI-FT-06: no Coordination component/route ships in MVP.
- UI-FT-07: screenshot/state regression covers empty, partial, stale, denied, offline and unavailable.
- UI-FT-08: external wallet/identity critical path has accessibility evidence or an approved blocker disposition.
