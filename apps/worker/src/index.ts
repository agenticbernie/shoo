import { loadConfig } from '@shoo/config';
import { DEFAULT_MAX_ATTEMPTS, type JobClass } from '@shoo/domain-platform';
import { createLogger, METRICS } from '@shoo/observability';

/**
 * apps/worker — composition root for Shoo background workers.
 *
 * SCOPE: this file boots, reports the job classes it will run, and exits. Extraction,
 * indexing, outbox processing, durable orchestration and reconciliation are owned by the
 * worker engineer.
 *
 * Rules that apply to every job added here (docs/29, docs/64):
 * - a job claims work by lease and is idempotent under redelivery;
 * - a permanent or poison failure dead-letters visibly instead of retrying forever;
 * - every job class reports queue age, retries, terminal state and has a runbook.
 */

export const JOB_CLASSES: readonly JobClass[] = [
  'extraction',
  'indexing',
  'context_build',
  'durable_persist',
  'durable_reconcile',
  'projection_rebuild',
  'retention',
  'export',
  'deletion',
];

async function main(): Promise<void> {
  const parsed = loadConfig();
  const logger = createLogger({
    level: parsed.success ? parsed.data.worker.logLevel : 'info',
    base: { component: 'worker' },
  });

  logger.info('shoo worker starting', {
    component: 'worker',
    status: 'started',
    count: JOB_CLASSES.length,
    attempts: DEFAULT_MAX_ATTEMPTS,
  });

  for (const jobClass of JOB_CLASSES) {
    logger.debug('job class registered', {
      component: 'worker',
      job_class: jobClass,
    });
  }

  logger.info('shoo worker has no processors registered yet; exiting', {
    component: 'worker',
    status: 'idle',
    stage: METRICS.outboxQueueAge,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
