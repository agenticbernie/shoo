#!/usr/bin/env node
import { loadConfig } from '@shoo/config';
import { EVENT_ENVELOPE_SCHEMA_VERSION } from '@shoo/contracts-events';
import { LocalStore, resolveKeyProvider } from '@shoo/local-store';
import { createLogger } from '@shoo/observability';
import { Command } from 'commander';

/**
 * apps/local — Shoo Local CLI and daemon composition root.
 *
 * SCOPE: `--version`, `status` and `doctor` only. Capture, the OpenCode/Codex adapters,
 * the local MCP server, the encrypted spool drain and MemWal Manual flows are owned by the
 * Shoo Local engineer.
 *
 * Rules that apply to everything added here (docs/34, docs/65):
 * - secrets come from the OS vault and never from tool arguments or environment dumps;
 * - attaching to a fixture repository must not mutate a developer's real global agent
 *   configuration;
 * - a missing key quarantines the store; it never recreates identity silently.
 */

const VERSION = '0.1.0';

export function buildCli(): Command {
  const program = new Command();
  program
    .name('shoo')
    .description('Shoo Local — capture, continuity and cited context for coding agents')
    .version(VERSION, '-v, --version', 'print the Shoo Local version');

  program
    .command('status')
    .description('show local runtime status and contract versions')
    .action(() => {
      const parsed = loadConfig();
      console.log(
        JSON.stringify(
          {
            version: VERSION,
            event_schema_version: EVENT_ENVELOPE_SCHEMA_VERSION,
            configuration_valid: parsed.success,
            key_provider: parsed.success ? parsed.data.local.keyProvider : 'unknown',
          },
          null,
          2,
        ),
      );
    });

  program
    .command('doctor')
    .description('check that the encrypted local store opens and report quarantined records')
    .option('--data-dir <path>', 'override the local data directory')
    .action(async (options: { dataDir?: string }) => {
      const parsed = loadConfig();
      const logger = createLogger({ base: { component: 'local' } });
      const dataDir =
        options.dataDir ?? (parsed.success ? parsed.data.local.dataDir : './.data/local');
      const keyProvider = resolveKeyProvider({
        providerName: parsed.success ? parsed.data.local.keyProvider : undefined,
        keyFilePath: parsed.success ? parsed.data.local.keyFile : undefined,
      });

      const store = await LocalStore.open({
        filePath: `${dataDir}/shoo.sqlite`,
        keyProvider,
      });
      const quarantined = store.listQuarantined();
      store.close();

      logger.info('local store healthy', {
        component: 'local',
        status: 'ok',
        count: quarantined.length,
      });
      console.log(JSON.stringify({ ok: true, quarantined_records: quarantined.length }, null, 2));
    });

  return program;
}

const entrypoint = process.argv[1] ?? '';
if (
  entrypoint.endsWith('index.ts') ||
  entrypoint.endsWith('index.js') ||
  entrypoint.endsWith('shoo')
) {
  buildCli()
    .parseAsync(process.argv)
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
