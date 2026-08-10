import { describe, expect, it } from 'vitest';
import { MINIMUM_BODY_FONT_SIZE, semanticColors, themeCssVariables, typography } from './index.js';

describe('design tokens', () => {
  it('defines every semantic token in both themes', () => {
    expect(Object.keys(semanticColors.light).sort()).toEqual(
      Object.keys(semanticColors.dark).sort(),
    );
  });

  it('never renders durability with the verified or canonical colour', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(semanticColors[theme]['status.durable']).not.toBe(
        semanticColors[theme]['status.verified'],
      );
      expect(semanticColors[theme]['status.durable']).not.toBe(
        semanticColors[theme]['status.canonical'],
      );
    }
  });

  it('keeps default product body text at the documented minimum', () => {
    expect(typography['body.md'].fontSize).toBe(MINIMUM_BODY_FONT_SIZE);
  });

  it('emits prefixed CSS custom properties', () => {
    const vars = themeCssVariables('light');
    expect(vars['--shoo-surface-canvas']).toBe('#F7F8FA');
    expect(vars['--shoo-body-md-size']).toBe('14px');
  });
});
