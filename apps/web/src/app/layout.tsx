import { globalThemeStylesheet } from '@shoo/ui';
import type { ReactNode } from 'react';

/**
 * apps/web — Shoo Web root layout.
 *
 * SCOPE: shell only. Screens, data fetching and interaction are owned by the web
 * engineer. Web talks to the Shoo API and never queries operational PostgreSQL
 * directly (docs/63 "Runtime/deployable boundaries").
 */
export const metadata = {
  title: 'Shoo',
  description: 'Agent work continuity, evidence-backed project memory and cited context.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Semantic tokens from @shoo/design-tokens; components never use raw palette values. */}
        <style dangerouslySetInnerHTML={{ __html: globalThemeStylesheet() }} />
      </head>
      <body
        style={{
          margin: 0,
          background: 'var(--shoo-surface-canvas)',
          color: 'var(--shoo-text-primary)',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: 'var(--shoo-body-md-size)',
          lineHeight: 'var(--shoo-body-md-line)',
        }}
      >
        {children}
      </body>
    </html>
  );
}
