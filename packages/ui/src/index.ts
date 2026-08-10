import {
  type SemanticColorToken,
  type ThemeName,
  type TypographyToken,
  themeCss,
  token,
} from '@shoo/design-tokens';

/**
 * `@shoo/ui` — Shoo component primitives.
 *
 * OWNERSHIP: the web engineer implements the component library on top of this base.
 *
 * Two rules from docs/63 and docs/57 are fixed here:
 * - `ui` consumes semantic design tokens and typed view models, never database rows;
 * - components reference semantic tokens only. `cssColor`/`cssType` are the only way to
 *   reach a colour, so a component cannot hard-code a primitive palette value.
 */

export type { SemanticColorToken, ThemeName, TypographyToken };

export function cssColor(name: SemanticColorToken): string {
  return token(name);
}

export function cssType(name: TypographyToken): {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
} {
  return {
    fontSize: `var(--shoo-${name.replace(/\./g, '-')}-size)`,
    lineHeight: `var(--shoo-${name.replace(/\./g, '-')}-line)`,
    fontWeight: `var(--shoo-${name.replace(/\./g, '-')}-weight)`,
  };
}

/** Global stylesheet for the web app: light by default, dark under the media query. */
export function globalThemeStylesheet(): string {
  return [
    themeCss('light', ':root'),
    themeCss('dark', ':root[data-theme="dark"]'),
    '@media (prefers-color-scheme: dark) {',
    themeCss('dark', ':root:not([data-theme="light"])'),
    '}',
  ].join('\n');
}

/**
 * View-model contracts the UI renders. They are deliberately transport-shaped, not
 * row-shaped: the UI never sees a database row (docs/63).
 */
export interface AuthorityBadgeViewModel {
  readonly authority: 'personal' | 'session' | 'branch' | 'team' | 'canonical' | 'historical';
  readonly verification: 'unverified' | 'corroborated' | 'verified' | 'disputed';
  readonly freshness: 'current' | 'stale' | 'expired' | 'unknown';
  readonly durability: 'local' | 'operational' | 'durable_pending' | 'durable' | 'durable_failed';
  readonly hasUnresolvedConflict: boolean;
}

/** Semantic token a state badge should use; state never picks its own colour. */
export function badgeToken(view: AuthorityBadgeViewModel): SemanticColorToken {
  if (view.hasUnresolvedConflict) return 'status.conflict';
  if (view.freshness === 'stale' || view.freshness === 'expired') return 'status.stale';
  if (view.authority === 'canonical') return 'status.canonical';
  if (view.verification === 'verified') return 'status.verified';
  if (view.durability === 'durable') return 'status.durable';
  return 'text.secondary';
}
