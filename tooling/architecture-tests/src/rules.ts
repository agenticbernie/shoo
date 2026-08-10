/**
 * Architecture fitness rules (docs/63 "Package dependency rules", docs/46 FIT-001/002).
 *
 * The rules are data so they can be asserted by both the CLI and the unit tests, and so a
 * reviewer can read the whole policy in one place.
 */

export interface PackageIdentity {
  /** Workspace-relative directory, e.g. `packages/domain/memory`. */
  readonly dir: string;
  /** Package name, e.g. `@shoo/domain-memory`. */
  readonly name: string;
}

export type Layer =
  | 'contracts'
  | 'domain'
  | 'application'
  | 'adapter'
  | 'ui'
  | 'design-tokens'
  | 'app'
  | 'tooling';

export function layerOf(pkg: PackageIdentity): Layer {
  if (pkg.dir.startsWith('apps/')) return 'app';
  if (pkg.dir.startsWith('tooling/')) return 'tooling';
  if (pkg.dir.startsWith('packages/contracts/')) return 'contracts';
  if (pkg.dir.startsWith('packages/domain/')) return 'domain';
  if (pkg.dir === 'packages/application') return 'application';
  if (pkg.dir === 'packages/ui') return 'ui';
  if (pkg.dir === 'packages/design-tokens') return 'design-tokens';
  return 'adapter';
}

/**
 * The core prohibition from docs/63:
 *
 *   domain must not import apps, database, Clerk, MCP SDK, MemWal SDK,
 *   Web framework or model provider.
 *
 * Expressed as module-name patterns so a new package or a new provider dependency is
 * caught the first time it is imported, not at review time.
 */
export const DOMAIN_FORBIDDEN_PATTERNS: readonly {
  readonly pattern: RegExp;
  readonly why: string;
}[] = [
  {
    pattern: /^@shoo\/(api|web|worker|local)$/,
    why: 'domain must not import an application',
  },
  {
    pattern: /^@shoo\/db-postgres/,
    why: 'domain must not import the database layer',
  },
  {
    pattern: /^@shoo\/local-store/,
    why: 'domain must not import the local store',
  },
  {
    pattern: /^@shoo\/auth-clerk/,
    why: 'domain must not import the identity adapter',
  },
  {
    pattern: /^@shoo\/adapter-/,
    why: 'domain must not import a provider adapter',
  },
  {
    pattern: /^@shoo\/application/,
    why: 'domain must not depend on the application layer',
  },
  { pattern: /^@shoo\/ui/, why: 'domain must not import UI' },
  { pattern: /^kysely/, why: 'domain must not import a database driver' },
  { pattern: /^pg(-|$)/, why: 'domain must not import a database driver' },
  {
    pattern: /^better-sqlite3/,
    why: 'domain must not import a database driver',
  },
  { pattern: /^@clerk\//, why: 'domain must not import Clerk' },
  {
    pattern: /^@modelcontextprotocol\//,
    why: 'domain must not import the MCP SDK',
  },
  { pattern: /^@memwal\//, why: 'domain must not import the MemWal SDK' },
  { pattern: /^@mysten\//, why: 'domain must not import the Sui/Walrus SDK' },
  {
    pattern: /^(fastify|express|hono|next|react|react-dom)$/,
    why: 'domain must not import a web framework',
  },
  { pattern: /^@fastify\//, why: 'domain must not import a web framework' },
  {
    pattern: /^(openai|@anthropic-ai\/|@google\/generative-ai|cohere-ai|@mistralai\/)/,
    why: 'domain must not import a model provider',
  },
  {
    pattern: /^node:(fs|http|https|net|dgram|child_process|worker_threads)/,
    why: 'domain must stay deterministic and free of IO',
  },
];

/** `contracts` owns transport schemas and never business authorization or persistence. */
export const CONTRACTS_FORBIDDEN_PATTERNS: readonly {
  readonly pattern: RegExp;
  readonly why: string;
}[] = [
  {
    pattern: /^@shoo\/domain-/,
    why: 'contracts must not depend on the domain',
  },
  {
    pattern: /^@shoo\/application/,
    why: 'contracts must not depend on the application layer',
  },
  {
    pattern: /^@shoo\/db-postgres/,
    why: 'contracts must not depend on the database layer',
  },
  {
    pattern: /^@shoo\/(api|web|worker|local)$/,
    why: 'contracts must not depend on an application',
  },
  { pattern: /^kysely/, why: 'contracts must not import a database driver' },
];

/** `ui` consumes semantic tokens and typed view models, not database rows (docs/63). */
export const UI_FORBIDDEN_PATTERNS: readonly {
  readonly pattern: RegExp;
  readonly why: string;
}[] = [
  {
    pattern: /^@shoo\/db-postgres/,
    why: 'ui must not import database row types',
  },
  {
    pattern: /^@shoo\/domain-/,
    why: 'ui renders view models, not domain aggregates',
  },
  { pattern: /^kysely/, why: 'ui must not import a database driver' },
  { pattern: /^pg(-|$)/, why: 'ui must not import a database driver' },
];

/** No package may import an application; apps are leaves (docs/63). */
export const UNIVERSAL_FORBIDDEN_PATTERNS: readonly {
  readonly pattern: RegExp;
  readonly why: string;
}[] = [
  {
    pattern: /^@shoo\/(api|web|worker|local)$/,
    why: 'apps are leaves and may not be imported',
  },
];

/** Predecessor product namespaces must not appear in Shoo contracts (FIT-002). */
export const FORBIDDEN_NAMESPACE_PATTERN = /\b(kage|sensei)\b/i;

/**
 * Coordination scope is out of MVP (FIT-025). These identifiers may exist as reserved
 * schema values but must never appear as an exported tool, route or event type.
 */
export const COORDINATION_TOOL_PATTERN =
  /(claim_task|assign_task|create_blocker|declare_dependency|request_handoff|recommend_available_work|team_pace|critical_path|team_activity)/;

export function forbiddenPatternsFor(
  layer: Layer,
): readonly { readonly pattern: RegExp; readonly why: string }[] {
  switch (layer) {
    case 'domain':
      return [...DOMAIN_FORBIDDEN_PATTERNS];
    case 'contracts':
      return [...CONTRACTS_FORBIDDEN_PATTERNS, ...UNIVERSAL_FORBIDDEN_PATTERNS];
    case 'ui':
      return [...UI_FORBIDDEN_PATTERNS, ...UNIVERSAL_FORBIDDEN_PATTERNS];
    case 'design-tokens':
      return [
        {
          pattern: /^@shoo\//,
          why: 'design-tokens is a leaf and depends on nothing',
        },
        ...UNIVERSAL_FORBIDDEN_PATTERNS,
      ];
    case 'application':
    case 'adapter':
    case 'app':
    case 'tooling':
      return [...UNIVERSAL_FORBIDDEN_PATTERNS];
  }
}

export interface Violation {
  readonly file: string;
  readonly importPath: string;
  readonly rule: string;
  readonly why: string;
}
