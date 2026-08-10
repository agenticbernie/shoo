/**
 * Placeholder home screen.
 *
 * The screen inventory in docs/51 and docs/60 is owned by the web engineer; this page
 * exists only so `pnpm -w build` and `pnpm -w dev` succeed for every app.
 */
export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1
        style={{
          fontSize: 'var(--shoo-heading-lg-size)',
          lineHeight: 'var(--shoo-heading-lg-line)',
        }}
      >
        Shoo
      </h1>
      <p style={{ color: 'var(--shoo-text-secondary)' }}>
        Web shell placeholder. Screens are implemented against the Shoo API contracts in
        <code> @shoo/contracts-http</code>.
      </p>
    </main>
  );
}
