import type { CodexAdapterPort } from '@shoo/application';

/**
 * `@shoo/adapter-codex` — Codex hooks adapter (docs/31).
 *
 * OWNERSHIP: the Shoo Local engineer implements this package. The same boundary rules as
 * `@shoo/adapter-opencode` apply: report real capabilities, never fabricate events, never
 * mutate a developer's global agent configuration during a fixture install, and always
 * emit a stable adapter instance and native source event id.
 *
 * Codex advertises a different capability set from OpenCode; a session started under a
 * client that lacks a capability is `degraded`, not silently incomplete.
 */

export type CodexAdapterFactory = (options: {
  readonly repositoryPath: string;
  readonly adapterInstanceId: string;
}) => CodexAdapterPort;

export const CODEX_CAPABILITIES = [
  'session.lifecycle',
  'prompt.capture',
  'tool_call.capture',
  'file_change.capture',
  'stop.hook',
] as const;
export type CodexCapability = (typeof CODEX_CAPABILITIES)[number];

export const CODEX_CAPABILITY_MANIFEST_VERSION = 1;
