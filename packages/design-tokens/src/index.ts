/**
 * `@shoo/design-tokens` — primitive, semantic and component tokens (docs/57).
 *
 * The three layers exist so meaning never depends on a raw colour name: components
 * consume semantic tokens only, and authority, freshness and durability each have their
 * own semantic token. Durability deliberately does **not** reuse the verified/canonical
 * colours, because durable does not mean true (docs/57).
 *
 * The hex values here are the accepted Gate 7 contract candidate. Contrast compliance is
 * verified by the UI quality suite, not asserted by this file.
 */

// --- primitives -------------------------------------------------------------

export const primitives = {
  neutral: {
    50: '#F7F8FA',
    100: '#EEF0F3',
    300: '#C7CCD4',
    500: '#737B88',
    700: '#3D4552',
    900: '#151922',
  },
  cobalt: {
    50: '#EEF3FF',
    100: '#DDE7FF',
    300: '#91ACF8',
    500: '#4267DB',
    700: '#2949AF',
    900: '#172B6F',
  },
  teal: {
    50: '#ECF9F6',
    100: '#D4F1EA',
    300: '#75C8B5',
    500: '#238A76',
    700: '#176553',
    900: '#0C3F34',
  },
  amber: {
    50: '#FFF8E7',
    100: '#FCECC3',
    300: '#E8BD58',
    500: '#AD7414',
    700: '#7B4E09',
    900: '#472B03',
  },
  red: {
    50: '#FFF1F1',
    100: '#FFDCDC',
    300: '#F39A9A',
    500: '#C74747',
    700: '#912E2E',
    900: '#561919',
  },
  violet: {
    50: '#F5F1FF',
    100: '#E9E0FF',
    300: '#BCA5F3',
    500: '#7859C5',
    700: '#563C98',
    900: '#33235D',
  },
} as const;

// --- semantic colours -------------------------------------------------------

export type ThemeName = 'light' | 'dark';

export const semanticColors = {
  light: {
    'surface.canvas': '#F7F8FA',
    'surface.primary': '#FFFFFF',
    'surface.secondary': '#EEF0F3',
    'surface.raised': '#FFFFFF',
    'text.primary': '#151922',
    'text.secondary': '#596270',
    'text.muted': '#737B88',
    'border.default': '#D9DDE3',
    'border.strong': '#AEB5C0',
    'action.primary': '#3157C8',
    'focus.ring': '#4267DB',
    'status.verified': '#176553',
    'status.canonical': '#2949AF',
    'status.conflict': '#7B4E09',
    'status.stale': '#6A4B97',
    'status.critical': '#912E2E',
    /** Durability is neutral/cobalt plus an icon — never the verified green. */
    'status.durable': '#3D4552',
  },
  dark: {
    'surface.canvas': '#0E1116',
    'surface.primary': '#151922',
    'surface.secondary': '#1D232D',
    'surface.raised': '#222A35',
    'text.primary': '#F3F5F7',
    'text.secondary': '#AAB2BE',
    'text.muted': '#838D9B',
    'border.default': '#303946',
    'border.strong': '#4A5564',
    'action.primary': '#7596F0',
    'focus.ring': '#91ACF8',
    'status.verified': '#75C8B5',
    'status.canonical': '#91ACF8',
    'status.conflict': '#E8BD58',
    'status.stale': '#BCA5F3',
    'status.critical': '#F39A9A',
    'status.durable': '#AAB2BE',
  },
} as const;

export type SemanticColorToken = keyof (typeof semanticColors)['light'];

// --- typography -------------------------------------------------------------

export const typography = {
  'display.sm': { fontSize: 28, lineHeight: 36, fontWeight: 600 },
  'heading.lg': { fontSize: 24, lineHeight: 32, fontWeight: 600 },
  'heading.md': { fontSize: 20, lineHeight: 28, fontWeight: 600 },
  'heading.sm': { fontSize: 16, lineHeight: 24, fontWeight: 600 },
  'body.md': { fontSize: 14, lineHeight: 22, fontWeight: 400 },
  'body.sm': { fontSize: 13, lineHeight: 20, fontWeight: 400 },
  'label.md': { fontSize: 13, lineHeight: 18, fontWeight: 500 },
  'label.sm': { fontSize: 12, lineHeight: 16, fontWeight: 500 },
  'mono.md': { fontSize: 13, lineHeight: 20, fontWeight: 400 },
  'mono.sm': { fontSize: 12, lineHeight: 18, fontWeight: 400 },
} as const;

export type TypographyToken = keyof typeof typography;

/** Minimum default product body size; 12px is compact metadata only (docs/57). */
export const MINIMUM_BODY_FONT_SIZE = 14;

// --- space and size ---------------------------------------------------------

export const BASE_UNIT = 4;
export const space = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80] as const;

export const controlHeight = {
  compact: 28,
  default: 36,
  prominent: 44,
} as const;

export const size = {
  /** WCAG 2.2 minimum target; 36 preferred, 44 for mobile primary actions. */
  minTouchTarget: 24,
  preferredTouchTarget: 36,
  mobilePrimaryTarget: 44,
  narrativeReadableWidth: 720,
  operationalMaxWidth: 1440,
  navigationExpanded: 232,
  navigationCollapsed: 64,
  sourceDrawerMin: 400,
  sourceDrawerMax: 480,
  sourceDrawerOverlayBreakpoint: 1100,
} as const;

// --- CSS custom properties --------------------------------------------------

function cssVarName(token: string): string {
  return `--shoo-${token.replace(/\./g, '-')}`;
}

/** Render one theme as CSS custom properties for the web app's global stylesheet. */
export function themeCssVariables(theme: ThemeName): Record<string, string> {
  const output: Record<string, string> = {};
  for (const [token, value] of Object.entries(semanticColors[theme])) {
    output[cssVarName(token)] = value;
  }
  for (const [token, value] of Object.entries(typography)) {
    output[`${cssVarName(token)}-size`] = `${value.fontSize}px`;
    output[`${cssVarName(token)}-line`] = `${value.lineHeight}px`;
    output[`${cssVarName(token)}-weight`] = String(value.fontWeight);
  }
  space.forEach((value, index) => {
    output[`--shoo-space-${index}`] = `${value}px`;
  });
  return output;
}

export function themeCss(theme: ThemeName, selector = ':root'): string {
  const declarations = Object.entries(themeCssVariables(theme))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${selector} {\n${declarations}\n}`;
}

/** Reference a semantic token from component styles. */
export function token(name: SemanticColorToken | TypographyToken): string {
  return `var(${cssVarName(name)})`;
}
