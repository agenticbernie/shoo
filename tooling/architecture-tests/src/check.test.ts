import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkArchitecture } from './check.js';
import { DOMAIN_FORBIDDEN_PATTERNS, forbiddenPatternsFor, layerOf } from './rules.js';

const repoRoot = resolve(import.meta.dirname, '..', '..', '..');

describe('architecture fitness (FIT-001, FIT-002, FIT-025)', () => {
  it('finds no forbidden imports anywhere in the workspace', async () => {
    const report = await checkArchitecture({ repoRoot });
    expect(report.violations).toEqual([]);
    expect(report.packagesChecked).toBeGreaterThan(20);
  }, 60_000);

  it('classifies packages into the documented layers', () => {
    expect(layerOf({ dir: 'packages/domain/memory', name: '@shoo/domain-memory' })).toBe('domain');
    expect(layerOf({ dir: 'packages/contracts/http', name: '@shoo/contracts-http' })).toBe(
      'contracts',
    );
    expect(layerOf({ dir: 'packages/db-postgres', name: '@shoo/db-postgres' })).toBe('adapter');
    expect(layerOf({ dir: 'apps/api', name: '@shoo/api' })).toBe('app');
  });

  it('forbids exactly the dependencies docs/63 names for the domain', () => {
    const reasons = DOMAIN_FORBIDDEN_PATTERNS.map((rule) => rule.why).join(' ');
    for (const forbidden of [
      'application',
      'database',
      'Clerk',
      'MCP SDK',
      'MemWal SDK',
      'web framework',
      'model provider',
    ]) {
      expect(reasons).toContain(forbidden);
    }
  });

  it('applies the universal app-is-a-leaf rule to every layer', () => {
    for (const layer of ['contracts', 'application', 'adapter', 'ui', 'app', 'tooling'] as const) {
      const patterns = forbiddenPatternsFor(layer).map((rule) => String(rule.pattern));
      expect(patterns.some((pattern) => pattern.includes('api|web|worker|local'))).toBe(true);
    }
  });
});
