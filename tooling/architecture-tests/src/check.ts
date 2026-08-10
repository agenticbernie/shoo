import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import {
  COORDINATION_TOOL_PATTERN,
  FORBIDDEN_NAMESPACE_PATTERN,
  forbiddenPatternsFor,
  layerOf,
  type PackageIdentity,
  type Violation,
} from './rules.js';

/**
 * Import-graph fitness check (FIT-001) and contract namespace snapshot (FIT-002).
 *
 * Implemented directly rather than through dependency-cruiser configuration because the
 * rules are layer-aware and Shoo-specific, and because a failing check must name the file,
 * the import and the documented reason a reviewer can act on.
 */

const IMPORT_PATTERN =
  /(?:^|\n)\s*(?:import|export)[\s\S]*?from\s*['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts'];
const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  '.next',
  '.turbo',
  '.git',
  'coverage',
]);

export interface CheckOptions {
  readonly repoRoot: string;
}

export interface CheckReport {
  readonly packagesChecked: number;
  readonly filesChecked: number;
  readonly violations: readonly Violation[];
}

async function listWorkspacePackages(repoRoot: string): Promise<readonly PackageIdentity[]> {
  const roots = ['apps', 'packages', 'packages/contracts', 'packages/domain', 'tooling'];
  const found: PackageIdentity[] = [];

  for (const root of roots) {
    const absoluteRoot = join(repoRoot, root);
    let entries: string[];
    try {
      entries = await readdir(absoluteRoot);
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (IGNORED_DIRECTORIES.has(entry)) continue;
      const dir = join(absoluteRoot, entry);
      const manifest = join(dir, 'package.json');
      try {
        const raw = await readFile(manifest, 'utf8');
        const parsed = JSON.parse(raw) as { name?: string };
        if (parsed.name === undefined) continue;
        found.push({
          dir: relative(repoRoot, dir).replace(/\\/g, '/'),
          name: parsed.name,
        });
      } catch {
        // Not a package directory (e.g. `packages/contracts` itself); skip.
      }
    }
  }

  return found;
}

async function listSourceFiles(dir: string): Promise<readonly string[]> {
  const files: string[] = [];
  const walk = async (current: string): Promise<void> => {
    let entries: string[];
    try {
      entries = await readdir(current);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORED_DIRECTORIES.has(entry)) continue;
      const full = join(current, entry);
      const info = await stat(full);
      if (info.isDirectory()) {
        await walk(full);
      } else if (SOURCE_EXTENSIONS.some((extension) => entry.endsWith(extension))) {
        files.push(full);
      }
    }
  };
  await walk(dir);
  return files;
}

function extractImports(source: string): readonly string[] {
  const imports: string[] = [];
  IMPORT_PATTERN.lastIndex = 0;
  let match = IMPORT_PATTERN.exec(source);
  while (match !== null) {
    const specifier = match[1] ?? match[2] ?? match[3];
    if (specifier !== undefined && !specifier.startsWith('.')) {
      imports.push(specifier);
    }
    match = IMPORT_PATTERN.exec(source);
  }
  return imports;
}

export async function checkArchitecture(options: CheckOptions): Promise<CheckReport> {
  const repoRoot = resolve(options.repoRoot);
  const packages = await listWorkspacePackages(repoRoot);
  const violations: Violation[] = [];
  let filesChecked = 0;

  for (const pkg of packages) {
    const layer = layerOf(pkg);
    const patterns = forbiddenPatternsFor(layer);
    const files = await listSourceFiles(join(repoRoot, pkg.dir, 'src'));

    for (const file of files) {
      filesChecked += 1;
      const source = await readFile(file, 'utf8');
      const relativeFile = relative(repoRoot, file).replace(/\\/g, '/');

      for (const importPath of extractImports(source)) {
        // A package importing itself by name is legitimate in test files.
        if (importPath === pkg.name || importPath.startsWith(`${pkg.name}/`)) continue;
        for (const rule of patterns) {
          if (rule.pattern.test(importPath)) {
            violations.push({
              file: relativeFile,
              importPath,
              rule: `${layer}:${String(rule.pattern)}`,
              why: rule.why,
            });
          }
        }
      }

      // Test files legitimately name the forbidden strings in order to assert their
      // absence, so the text scans below apply to shipped source only.
      const isTestFile = /\.(test|spec)\.tsx?$/.test(relativeFile);

      // FIT-002: no predecessor product namespace in contracts.
      if (layer === 'contracts' && !isTestFile && FORBIDDEN_NAMESPACE_PATTERN.test(source)) {
        violations.push({
          file: relativeFile,
          importPath: '(source text)',
          rule: 'contracts:namespace-snapshot',
          why: 'public contracts must not reference a predecessor product namespace (FIT-002)',
        });
      }

      // FIT-025: coordination tools stay out of MVP contracts.
      if (layer === 'contracts' && !isTestFile && COORDINATION_TOOL_PATTERN.test(source)) {
        const isDenylist = /DEFERRED_MCP_TOOL_NAMES|RESERVED_EVENT_TYPES|COORDINATION/.test(source);
        if (!isDenylist) {
          violations.push({
            file: relativeFile,
            importPath: '(source text)',
            rule: 'contracts:coordination-scope',
            why: 'coordination tools are deferred and may only appear in the denylist (FIT-025)',
          });
        }
      }
    }
  }

  return { packagesChecked: packages.length, filesChecked, violations };
}
