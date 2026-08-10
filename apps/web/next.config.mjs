/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TypeScript-built ESM; Next transpiles them for the browser.
  transpilePackages: ['@shoo/ui', '@shoo/design-tokens', '@shoo/contracts-http'],
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
