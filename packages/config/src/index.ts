import { z } from 'zod';

/**
 * `@shoo/config` — validated runtime configuration.
 *
 * Configuration is validated once, at process start, in the app composition root. A
 * missing or malformed variable fails the boot rather than surfacing as a confusing
 * runtime error later (docs/64 "Runtime validation at every external boundary").
 *
 * Secrets are read from the environment and never logged: `redactConfig` produces the
 * only shape that may be printed.
 */

export const shooEnvironment = z.enum(['local', 'preview', 'staging', 'production']);
export type ShooEnvironment = z.infer<typeof shooEnvironment>;

export const logLevel = z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
export type LogLevel = z.infer<typeof logLevel>;

const port = z.coerce.number().int().min(1).max(65535);

export const databaseConfig = z.object({
  /** Request-serving role. Must not be the table owner and must not have BYPASSRLS. */
  url: z.string().min(1),
  /** Migration/maintenance role. Never used to serve traffic. */
  migrationUrl: z.string().min(1).optional(),
  poolMax: z.coerce.number().int().min(1).max(100).default(10),
  statementTimeoutMillis: z.coerce.number().int().min(100).default(15_000),
});
export type DatabaseConfig = z.infer<typeof databaseConfig>;

export const apiConfig = z.object({
  host: z.string().min(1).default('127.0.0.1'),
  port: port.default(8787),
  publicUrl: z.string().min(1).default('http://localhost:8787'),
  logLevel: logLevel.default('info'),
});
export type ApiConfig = z.infer<typeof apiConfig>;

export const workerConfig = z.object({
  logLevel: logLevel.default('info'),
  leaseMillis: z.coerce.number().int().min(1_000).default(30_000),
  batchSize: z.coerce.number().int().min(1).max(500).default(25),
  pollIntervalMillis: z.coerce.number().int().min(50).default(1_000),
});
export type WorkerConfig = z.infer<typeof workerConfig>;

export const identityConfig = z.object({
  publishableKey: z.string().default(''),
  secretKey: z.string().default(''),
});

export const embeddingConfig = z.object({
  provider: z.enum(['none', 'local', 'remote']).default('none'),
  model: z.string().default(''),
  dimension: z.coerce.number().int().min(1).default(1536),
});
export type EmbeddingConfig = z.infer<typeof embeddingConfig>;

export const localConfig = z.object({
  dataDir: z.string().min(1).default('./.data/local'),
  keyProvider: z.enum(['os-vault', 'file', 'ephemeral']).default('os-vault'),
  keyFile: z.string().optional(),
  apiBaseUrl: z.string().min(1).default('http://localhost:8787/v1'),
});
export type LocalConfig = z.infer<typeof localConfig>;

export const shooConfig = z.object({
  environment: shooEnvironment.default('local'),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  database: databaseConfig,
  api: apiConfig,
  worker: workerConfig,
  identity: identityConfig,
  embedding: embeddingConfig,
  local: localConfig,
});
export type ShooConfig = z.infer<typeof shooConfig>;

export type EnvSource = Readonly<Record<string, string | undefined>>;

/**
 * Build the configuration from an environment source.
 *
 * Returns a Zod error rather than throwing so a composition root can print a complete
 * list of what is wrong instead of failing one variable at a time.
 */
export function loadConfig(env: EnvSource = process.env): z.ZodSafeParseResult<ShooConfig> {
  return shooConfig.safeParse({
    environment: env['SHOO_ENV'],
    nodeEnv: env['NODE_ENV'],
    database: {
      url: env['DATABASE_URL'],
      migrationUrl: env['DATABASE_MIGRATION_URL'],
      poolMax: env['DATABASE_POOL_MAX'],
      statementTimeoutMillis: env['DATABASE_STATEMENT_TIMEOUT_MS'],
    },
    api: {
      host: env['API_HOST'],
      port: env['API_PORT'],
      publicUrl: env['API_PUBLIC_URL'],
      logLevel: env['LOG_LEVEL'],
    },
    worker: {
      logLevel: env['LOG_LEVEL'],
      leaseMillis: env['WORKER_LEASE_MS'],
      batchSize: env['WORKER_BATCH_SIZE'],
      pollIntervalMillis: env['WORKER_POLL_INTERVAL_MS'],
    },
    identity: {
      publishableKey: env['CLERK_PUBLISHABLE_KEY'],
      secretKey: env['CLERK_SECRET_KEY'],
    },
    embedding: {
      provider: env['EMBEDDING_PROVIDER'],
      model: env['EMBEDDING_MODEL'],
      dimension: env['EMBEDDING_DIMENSION'],
    },
    local: {
      dataDir: env['SHOO_LOCAL_DATA_DIR'],
      keyProvider: env['SHOO_LOCAL_KEY_PROVIDER'],
      keyFile: env['SHOO_LOCAL_KEY_FILE'],
      apiBaseUrl: env['NEXT_PUBLIC_API_BASE_URL'],
    },
  });
}

/** Load or exit with a readable report. Intended for app entrypoints only. */
export function loadConfigOrThrow(env: EnvSource = process.env): ShooConfig {
  const parsed = loadConfig(env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`invalid Shoo configuration:\n${issues}`);
  }
  return parsed.data;
}

/** The only representation of the configuration that may be logged. */
export function redactConfig(config: ShooConfig): Record<string, unknown> {
  return {
    environment: config.environment,
    nodeEnv: config.nodeEnv,
    api: {
      host: config.api.host,
      port: config.api.port,
      logLevel: config.api.logLevel,
    },
    worker: config.worker,
    database: {
      poolMax: config.database.poolMax,
      statementTimeoutMillis: config.database.statementTimeoutMillis,
      urlPresent: config.database.url.length > 0,
      migrationUrlPresent: (config.database.migrationUrl ?? '').length > 0,
    },
    identity: {
      publishableKeyPresent: config.identity.publishableKey.length > 0,
      secretKeyPresent: config.identity.secretKey.length > 0,
    },
    embedding: {
      provider: config.embedding.provider,
      dimension: config.embedding.dimension,
    },
    local: {
      keyProvider: config.local.keyProvider,
      dataDir: config.local.dataDir,
    },
  };
}
