import { loadConfig, redactConfig } from '@shoo/config';
import { CONTRACT_SCHEMA_VERSION } from '@shoo/contracts-common';
import { HTTP_API_BASE_PATH, HTTP_ROUTES } from '@shoo/contracts-http';
import { MCP_CONTRACT_VERSION, MCP_TOOL_NAMES } from '@shoo/contracts-mcp';
import { createLogger } from '@shoo/observability';
import Fastify from 'fastify';

/**
 * apps/api — composition root for the Shoo API and MCP gateway.
 *
 * SCOPE: this file boots the process and answers `/health` and `/v1/capabilities`.
 * Route handlers, authorization, use cases and the MCP transport are owned by the API
 * engineer and are deliberately absent.
 *
 * Composition rules that apply to everything added here (docs/63, docs/64):
 * - this is the ONLY place providers are constructed;
 * - every route validates its request with the `@shoo/contracts-http` schema before any
 *   handler logic runs;
 * - authorization is re-evaluated per request; a transport schema never authorizes.
 */

export async function buildServer() {
  const parsed = loadConfig();
  const config = parsed.success ? parsed.data : null;
  const logger = createLogger({
    level: config?.api.logLevel ?? 'info',
    base: { component: 'api' },
  });

  const app = Fastify({
    logger: false,
    // Correlation ids are server-issued or validated; a caller cannot inject one.
    genReqId: () => crypto.randomUUID(),
    bodyLimit: 1_048_576,
  });

  app.get('/health', async () => ({
    status: 'ok',
    component: 'api',
    contract_version: CONTRACT_SCHEMA_VERSION,
    configuration_valid: parsed.success,
  }));

  /** Capability manifest so Shoo Local can negotiate before it writes anything. */
  app.get(`${HTTP_API_BASE_PATH}/capabilities`, async () => ({
    data: {
      http_contract_version: CONTRACT_SCHEMA_VERSION,
      mcp_contract_version: MCP_CONTRACT_VERSION,
      route_count: Object.keys(HTTP_ROUTES).length,
      mcp_tools: MCP_TOOL_NAMES,
    },
  }));

  app.setNotFoundHandler(async (request, reply) => {
    // 404 also covers deliberately concealed unauthorized resources (docs/37).
    await reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found.',
        retryable: false,
        details: [],
      },
      meta: { request_id: request.id },
    });
  });

  return { app, logger, config };
}

async function main(): Promise<void> {
  const { app, logger, config } = await buildServer();
  const host = config?.api.host ?? '127.0.0.1';
  const port = config?.api.port ?? 8787;

  await app.listen({ host, port });
  logger.info('shoo api listening', { component: 'api', status: 'started' });
  if (config !== null) {
    logger.debug('configuration loaded', { component: 'api' });
    console.log(JSON.stringify({ config: redactConfig(config) }));
  }
}

const entrypoint = process.argv[1] ?? '';
if (entrypoint.endsWith('index.ts') || entrypoint.endsWith('index.js')) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
