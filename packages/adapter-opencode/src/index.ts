import type { OpenCodeAdapterPort } from '@shoo/application';

/**
 * `@shoo/adapter-opencode` — OpenCode plugin adapter (docs/31).
 *
 * OWNERSHIP: the Shoo Local engineer implements this package.
 *
 * Boundary rules fixed by the foundation:
 * - the adapter reports the capabilities it actually has and marks the rest
 *   `unsupported`/`degraded`; it never fabricates a lifecycle event it did not observe;
 * - installation must be able to attach to a fixture repository without mutating a
 *   developer's real global agent configuration (docs/65 "Local development goals");
 * - every emitted envelope carries a stable `adapterInstanceId` and native
 *   `sourceEventId` so at-least-once delivery stays deduplicable (docs/29).
 */

export type OpenCodeAdapterFactory = (options: {
  readonly repositoryPath: string;
  readonly adapterInstanceId: string;
}) => OpenCodeAdapterPort;

/** Capability names this adapter is expected to advertise once implemented. */
export const OPENCODE_CAPABILITIES = [
  'session.lifecycle',
  'prompt.capture',
  'tool_call.capture',
  'file_change.capture',
  'test_run.capture',
  'pre_compaction.hook',
  'stop.hook',
] as const;
export type OpenCodeCapability = (typeof OPENCODE_CAPABILITIES)[number];

export const OPENCODE_CAPABILITY_MANIFEST_VERSION = 1;
