# Shoo Design Tokens and Foundations

- Version: 0.1
- Status: Accepted — Decision Gate 7; design contract candidate, not production code
- Owner role: Design Systems Lead / Staff Frontend Engineer
- Dependencies: Visual Direction; Phase 6 State Grammar; Accessibility Specification
- Assumptions: CSS custom properties or equivalent consume semantic tokens; implementation supports light/dark theme switching
- Unresolved questions: Exact font delivery strategy; final contrast calibration in browser rendering
- Last decision: Separate primitive, semantic and component tokens so authority, freshness and durability do not depend on raw color names
- Next action: Implement a token sandbox and run automated/manual contrast checks

## Token architecture

1. Primitive tokens: palette, dimensions and typography values.
2. Semantic tokens: text, surface, border, action and status meanings.
3. Component tokens: optional local aliases; components cannot reference primitive colors directly.

## Core color primitives

| Family | 50 | 100 | 300 | 500 | 700 | 900 |
|---|---|---|---|---|---|---|
| Neutral | `#F7F8FA` | `#EEF0F3` | `#C7CCD4` | `#737B88` | `#3D4552` | `#151922` |
| Cobalt | `#EEF3FF` | `#DDE7FF` | `#91ACF8` | `#4267DB` | `#2949AF` | `#172B6F` |
| Teal | `#ECF9F6` | `#D4F1EA` | `#75C8B5` | `#238A76` | `#176553` | `#0C3F34` |
| Amber | `#FFF8E7` | `#FCECC3` | `#E8BD58` | `#AD7414` | `#7B4E09` | `#472B03` |
| Red | `#FFF1F1` | `#FFDCDC` | `#F39A9A` | `#C74747` | `#912E2E` | `#561919` |
| Violet | `#F5F1FF` | `#E9E0FF` | `#BCA5F3` | `#7859C5` | `#563C98` | `#33235D` |

Final implementation must validate contrast; hex values are the initial contract candidate, not evidence of compliance by themselves.

## Semantic color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `surface.canvas` | `#F7F8FA` | `#0E1116` | Application background |
| `surface.primary` | `#FFFFFF` | `#151922` | Main panels |
| `surface.secondary` | `#EEF0F3` | `#1D232D` | Secondary regions |
| `surface.raised` | `#FFFFFF` | `#222A35` | Drawer/popover |
| `text.primary` | `#151922` | `#F3F5F7` | Main content |
| `text.secondary` | `#596270` | `#AAB2BE` | Metadata/supporting text |
| `text.muted` | `#737B88` | `#838D9B` | Noncritical context |
| `border.default` | `#D9DDE3` | `#303946` | Containers/dividers |
| `border.strong` | `#AEB5C0` | `#4A5564` | Active boundaries |
| `action.primary` | `#3157C8` | `#7596F0` | Primary control |
| `focus.ring` | `#4267DB` | `#91ACF8` | Keyboard focus |
| `status.verified` | `#176553` | `#75C8B5` | Verified/accepted evidence |
| `status.canonical` | `#2949AF` | `#91ACF8` | Canonical/current governing state |
| `status.conflict` | `#7B4E09` | `#E8BD58` | Unresolved conflicting truth |
| `status.stale` | `#6A4B97` | `#BCA5F3` | Historical/freshness warning |
| `status.critical` | `#912E2E` | `#F39A9A` | Security/destructive/terminal failure |

Durability uses a database/shield icon plus text and neutral/cobalt styling. It must not reuse verified/canonical green because durable does not mean true.

## Typography tokens

| Token | Size/line | Weight | Use |
|---|---|---:|---|
| `display.sm` | 28/36 | 600 | Rare project-level heading |
| `heading.lg` | 24/32 | 600 | Page heading |
| `heading.md` | 20/28 | 600 | Major section |
| `heading.sm` | 16/24 | 600 | Card/region heading |
| `body.md` | 14/22 | 400 | Default product text |
| `body.sm` | 13/20 | 400 | Dense secondary content |
| `label.md` | 13/18 | 500 | Controls/labels |
| `label.sm` | 12/16 | 500 | Chips/metadata |
| `mono.md` | 13/20 | 400 | Code and identifiers |
| `mono.sm` | 12/18 | 400 | Timestamp/compact provenance |

Minimum default product body is 14px; 12px is limited to nonessential compact metadata and still requires contrast compliance.

## Spacing and size

- Base unit: 4px.
- Space scale: `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`.
- Control heights: compact 28, default 36, prominent 44.
- Touch target: minimum 24×24 under WCAG 2.2, preferred 36×36; mobile primary actions 44px.
- Content readable width: 720px for narrative evidence; operational page max 1440px.
- Navigation width: 232px expanded, 64px collapsed.
- Source drawer: 400–480px, responsive overlay below 1100px.

## Radius, border and elevation

| Token | Value | Use |
|---|---:|---|
| `radius.sm` | 4px | Inline code/small control |
| `radius.md` | 6px | Inputs/chips |
| `radius.lg` | 10px | Cards/drawers |
| `border.default` | 1px | Primary separation |
| `elevation.1` | border + subtle shadow | Popover/raised card |
| `elevation.2` | stronger shadow | Modal/drawer only |

Cards on the same surface use borders, not layered shadows.

## Motion tokens

- `duration.fast`: 100ms.
- `duration.default`: 160ms.
- `duration.slow`: 240ms, only for major panel transitions.
- `easing.standard`: cubic-bezier(0.2, 0, 0, 1).
- `reduced-motion`: transitions become instant or opacity-only under 80ms.

No looping loading animation after a stage can be named; operation progress uses deterministic stages.

## Grid

- Desktop: 12 columns, 24px gutters, 24–32px page margins.
- Compact: 8 columns, 20px gutters.
- Mobile: 4 columns, 16px gutters/margins.
- Baseline aligns metadata and timelines to 4px increments.

## Token governance

- New raw values require design-system review.
- Status tokens require semantic owner and light/dark/contrast evidence.
- Components use semantic tokens; no hex values in component styles.
- Token change includes screenshot, contrast, interaction and regression review.
