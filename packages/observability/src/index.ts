/**
 * `@shoo/observability` — content-safe structured logging, metrics and correlation.
 *
 * docs/64 "Observability standards" requires structured logs with **allowlisted** fields:
 * raw objects are never logged, metrics never carry project content, and every journey
 * propagates a content-safe correlation id.
 *
 * The allowlist is enforced here rather than left to reviewer discipline: `log()` drops
 * any field that is not on it and records that it did.
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LEVEL_ORDER: Readonly<Record<LogLevel, number>> = Object.freeze({
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
});

/**
 * Fields permitted in a structured log line. All of them are identifiers, counts,
 * durations, versions or enum-like states — never content, prompts, source or secrets.
 */
export const ALLOWED_LOG_FIELDS = [
  'request_id',
  'correlation_id',
  'causation_id',
  'organization_id',
  'project_id',
  'work_unit_id',
  'session_id',
  'device_id',
  'agent_id',
  'memory_id',
  'revision_id',
  'conflict_id',
  'pack_id',
  'operation_id',
  'job_id',
  'job_class',
  'event_type',
  'action',
  'route',
  'method',
  'status',
  'status_code',
  'error_code',
  'reason_code',
  'result',
  'stage',
  'latency_ms',
  'queue_age_ms',
  'attempts',
  'count',
  'candidate_count',
  'selected_count',
  'token_budget',
  'token_used',
  'citation_coverage',
  'freshness',
  'completeness',
  'authority_status',
  'schema_version',
  'policy_version',
  'contract_version',
  'resolver_version',
  'ranker_version',
  'extractor_version',
  'adapter_version',
  'client',
  'component',
  'dropped_fields',
] as const;
export type AllowedLogField = (typeof ALLOWED_LOG_FIELDS)[number];

const ALLOWED = new Set<string>(ALLOWED_LOG_FIELDS);

export type LogValue = string | number | boolean | null;
export type LogFields = Readonly<Record<string, LogValue>>;

export interface LogRecord {
  readonly level: LogLevel;
  readonly time: string;
  readonly message: string;
  readonly fields: Readonly<Record<string, LogValue>>;
}

export interface LogSink {
  write(record: LogRecord): void;
}

/** Default sink: one JSON object per line on stdout. */
export const jsonConsoleSink: LogSink = {
  write(record) {
    process.stdout.write(
      `${JSON.stringify({ ...record.fields, level: record.level, time: record.time, msg: record.message })}\n`,
    );
  },
};

export interface Logger {
  readonly level: LogLevel;
  child(fields: LogFields): Logger;
  trace(message: string, fields?: LogFields): void;
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  fatal(message: string, fields?: LogFields): void;
}

/**
 * Filter a field bag down to the allowlist.
 *
 * Dropped keys are reported by name in `dropped_fields` so a developer notices the
 * omission without the value ever reaching the log.
 */
export function sanitizeFields(fields: LogFields): Record<string, LogValue> {
  const kept: Record<string, LogValue> = {};
  const dropped: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (ALLOWED.has(key)) {
      kept[key] = value;
    } else {
      dropped.push(key);
    }
  }
  if (dropped.length > 0) {
    kept['dropped_fields'] = dropped.sort().join(',');
  }
  return kept;
}

export function createLogger(options: {
  readonly level?: LogLevel;
  readonly base?: LogFields;
  readonly sink?: LogSink;
  readonly clock?: () => Date;
}): Logger {
  const level = options.level ?? 'info';
  const sink = options.sink ?? jsonConsoleSink;
  const clock = options.clock ?? (() => new Date());
  const base = sanitizeFields(options.base ?? {});

  const write = (recordLevel: LogLevel, message: string, fields?: LogFields): void => {
    if (LEVEL_ORDER[recordLevel] < LEVEL_ORDER[level]) return;
    sink.write({
      level: recordLevel,
      time: clock().toISOString(),
      message,
      fields: { ...base, ...sanitizeFields(fields ?? {}) },
    });
  };

  return {
    level,
    child(fields) {
      return createLogger({
        level,
        base: { ...base, ...sanitizeFields(fields) },
        sink,
        clock,
      });
    },
    trace: (message, fields) => write('trace', message, fields),
    debug: (message, fields) => write('debug', message, fields),
    info: (message, fields) => write('info', message, fields),
    warn: (message, fields) => write('warn', message, fields),
    error: (message, fields) => write('error', message, fields),
    fatal: (message, fields) => write('fatal', message, fields),
  };
}

// --- metrics ----------------------------------------------------------------

/** Metric names state stage, status and latency without project content (docs/64). */
export type MetricLabels = Readonly<Record<string, string>>;

export interface MetricsPort {
  counter(name: string, value: number, labels?: MetricLabels): void;
  histogram(name: string, value: number, labels?: MetricLabels): void;
  gauge(name: string, value: number, labels?: MetricLabels): void;
}

export const noopMetrics: MetricsPort = {
  counter: () => undefined,
  histogram: () => undefined,
  gauge: () => undefined,
};

/** In-memory metrics for tests and local development. */
export function createInMemoryMetrics(): MetricsPort & {
  snapshot(): readonly {
    name: string;
    kind: string;
    value: number;
    labels: MetricLabels;
  }[];
} {
  const entries: {
    name: string;
    kind: string;
    value: number;
    labels: MetricLabels;
  }[] = [];
  return {
    counter: (name, value, labels) =>
      entries.push({ name, kind: 'counter', value, labels: labels ?? {} }),
    histogram: (name, value, labels) =>
      entries.push({ name, kind: 'histogram', value, labels: labels ?? {} }),
    gauge: (name, value, labels) =>
      entries.push({ name, kind: 'gauge', value, labels: labels ?? {} }),
    snapshot: () => entries,
  };
}

// --- correlation ------------------------------------------------------------

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Correlation ids are server-issued or validated opaque values (docs/37 "Security headers
 * and content limits"): a caller-supplied id that is not a UUID is replaced, never trusted.
 */
export function resolveCorrelationId(supplied: string | undefined, generate: () => string): string {
  if (supplied !== undefined && UUID_PATTERN.test(supplied)) return supplied;
  return generate();
}

/** Standard metric names so every surface reports the same journey identically. */
export const METRICS = {
  httpRequestDuration: 'shoo_http_request_duration_ms',
  mcpToolDuration: 'shoo_mcp_tool_duration_ms',
  outboxQueueAge: 'shoo_outbox_queue_age_ms',
  outboxAttempts: 'shoo_outbox_attempts_total',
  outboxDeadLetter: 'shoo_outbox_dead_letter_total',
  extractionDuration: 'shoo_extraction_duration_ms',
  contextPackDuration: 'shoo_context_pack_duration_ms',
  contextPackTokens: 'shoo_context_pack_tokens',
  citationCoverage: 'shoo_citation_coverage_ratio',
  durablePendingAge: 'shoo_durable_pending_age_ms',
  authorizationDenied: 'shoo_authorization_denied_total',
} as const;
