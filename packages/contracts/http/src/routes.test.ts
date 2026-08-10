import { describe, expect, it } from 'vitest';
import { HTTP_API_BASE_PATH } from './common.js';
import { HTTP_ROUTES, routeSignatures } from './routes.js';

describe('HTTP route registry', () => {
  it('exposes every route under the /v1 major path', () => {
    for (const route of Object.values(HTTP_ROUTES)) {
      expect(route.path.startsWith(HTTP_API_BASE_PATH)).toBe(true);
    }
  });

  it('has unique method+path signatures', () => {
    const signatures = routeSignatures();
    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it('requires a body schema for every mutating route except pure command paths', () => {
    for (const [name, route] of Object.entries(HTTP_ROUTES)) {
      if (!route.mutating) continue;
      const commandWithoutBody = ['revokeDevice', 'cancelOperation'];
      if (commandWithoutBody.includes(name)) continue;
      expect(route.body, `${name} must declare a request body`).toBeDefined();
    }
  });

  it('requires a preview token on every high impact authority mutation (docs/37)', () => {
    expect(HTTP_ROUTES.markCanonical.previewToken).toBe(true);
    expect(HTTP_ROUTES.supersedeMemory.previewToken).toBe(true);
    expect(HTTP_ROUTES.resolveConflict.previewToken).toBe(true);
    expect(HTTP_ROUTES.deleteProject.previewToken).toBe(true);
    expect(HTTP_ROUTES.putSyncPolicy.previewToken).toBe(true);
  });

  it('carries no predecessor product namespace (FIT-002)', () => {
    const serialized = routeSignatures().join('\n').toLowerCase();
    expect(serialized).not.toMatch(/kage|sensei/);
  });
});
