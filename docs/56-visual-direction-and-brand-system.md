# Shoo Visual Direction and Brand System

- Version: 0.1
- Status: Accepted — Decision Gate 7
- Owner role: Principal Product Designer / Brand Design Lead
- Dependencies: Accepted Phase 6 UX Architecture; Product DNA; Accessibility Specification
- Assumptions: Shoo must feel credible beside code editors and B2B infrastructure tools; visual novelty is secondary to evidence comprehension
- Unresolved questions: Final logo/wordmark design; whether marketing surfaces share the product UI palette
- Last decision: Adopt a calm technical evidence direction with restrained color, explicit state language and minimal decorative effects
- Next action: Validate representative Pulse, Ask, conflict and onboarding screens in light/dark modes

## Visual thesis

Shoo should look like a precise project instrument: quiet when work is healthy, explicit when trust is limited, and dense only where evidence requires it. The interface communicates intelligence through organization and provenance—not animation, gradients or anthropomorphic AI treatment.

## Brand attributes translated into UI

| Attribute | Visual behavior | Rejected expression |
|---|---|---|
| Intelligent | Structured evidence, useful hierarchy, contextual recommendation | Sparkles, magic-wand metaphors, unexplained automation |
| Calm | Neutral surfaces, limited accents, stable layout | Constant motion, saturated dashboards, notification noise |
| Precise | Aligned metadata, explicit time/scope/status, mono for identifiers | Vague chips, decorative charts, hidden detail |
| Trustworthy | Sources and limitations adjacent to claims | Confidence theatre, all-green summaries, unsupported success |
| Technical | Developer-native density, code/reference treatment | Terminal cosplay or excessive monospace |
| High signal | One primary action and prioritized exceptions | Card grids made from every metric |

## Chosen visual direction — Calm Technical Evidence

- Foundation: cool graphite neutrals rather than pure black/white.
- Primary action: cobalt blue; stable and legible in both themes.
- Verified/current evidence: teal/green with explicit icon and text.
- Attention/conflict: amber, reserved for unresolved states.
- Critical/destructive: red, never used for ordinary blockers or stale state.
- Surfaces: flat or lightly elevated with borders; no glass blur.
- Shape: 6–10px radii, not pill-heavy. Pills are reserved for compact state/filter chips.
- Motion: functional transitions under 200ms; no autonomous ambient animation.
- Illustration: absent in core product. Onboarding may use small system diagrams, not AI characters.

## Theme strategy

Light and dark themes are peers. Dark mode is not an inverted afterthought and avoids pure black. Semantic contrast is validated independently in both themes.

| Role | Light direction | Dark direction |
|---|---|---|
| Canvas | cool gray-white | near-black graphite |
| Primary surface | white | elevated graphite |
| Secondary surface | muted cool gray | subtle lighter graphite |
| Border | visible low-contrast gray | visible cool charcoal |
| Primary text | ink | near-white cool gray |
| Secondary text | slate | medium cool gray |

## Typography direction

- UI and long-form: IBM Plex Sans Variable, bundled where licensing/build permits; system sans fallback.
- Code, identifiers, timestamps and compact metadata: IBM Plex Mono.
- Mono is not used for paragraphs or all labels.
- Sentence case throughout; title case only for product/proper nouns.
- Numerals use tabular figures in timelines, metrics and timestamps.

## Iconography

- 16px default, 20px for navigation, 24px only for prominent empty/action states.
- 1.75px optical stroke, rounded joins, simple geometric forms.
- Every status icon has a text label; icon shape must remain distinct in monochrome.
- AI sparkle, robot head and blockchain-chain icons are prohibited in primary navigation.

## Visual anti-goals

- Neon cyan/purple gradients.
- Glowing AI input fields.
- Glassmorphism over data-heavy content.
- Green as a universal “everything is good” status.
- Red for routine incomplete work.
- Avatar stacks as the main representation of project progress.
- Large decorative graphs on Project Pulse.
- Confidence percentages without calibrated meaning.

## Brand validation questions

- Does Shoo look credible next to OpenCode/Codex rather than like a consumer AI chat app?
- Can users identify current truth, conflict and durable status in five seconds?
- Does dark mode retain hierarchy without glowing accents?
- Do sources remain visually discoverable without dominating reading flow?
