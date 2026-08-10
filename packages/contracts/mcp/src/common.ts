import {
  citation,
  clientContext,
  completeness,
  freshness,
  idempotencyKey,
  requestScope,
  schemaVersion,
  uuid,
  warning,
} from '@shoo/contracts-common';
import { z } from 'zod';

/**
 * MCP common input/result shapes — docs/38 "Common input" and "Common result".
 *
 * The server derives `organization_id`, user and grants from the authenticated transport
 * identity; arguments cannot select another tenant. Credentials never appear in
 * model-visible arguments or results.
 */

/** MCP specification version this build is tested against (docs/38 "Protocol posture"). */
export const MCP_PROTOCOL_VERSIONS_SUPPORTED = ['2025-11-25'] as const;
export type McpProtocolVersion = (typeof MCP_PROTOCOL_VERSIONS_SUPPORTED)[number];

export const MCP_CONTRACT_VERSION = 1 as const;

export const toolCommonInput = z.object({
  project_id: uuid,
  work_unit_id: uuid.nullable().default(null),
  session_id: uuid.nullable().default(null),
  request_scope: requestScope,
  client_context: clientContext,
  idempotency_key: idempotencyKey,
});
export type ToolCommonInput = z.infer<typeof toolCommonInput>;

export const toolStatus = z.enum([
  'complete',
  'accepted',
  'pending',
  'partial',
  'degraded',
  'conflict',
  'denied',
  'failed',
]);
export type ToolStatus = z.infer<typeof toolStatus>;

export const toolOperation = z.object({
  operation_id: uuid.nullable().default(null),
  poll_after_ms: z.number().int().positive().default(1000),
});

export const toolCommonResult = z.object({
  status: toolStatus,
  request_id: uuid,
  schema_version: schemaVersion.default(MCP_CONTRACT_VERSION),
  operation: toolOperation.default({ operation_id: null, poll_after_ms: 1000 }),
  freshness: freshness.default('current'),
  completeness: completeness.default({ state: 'complete', missing_capabilities: [] }),
  warnings: z.array(warning).max(50).default([]),
  citations: z.array(citation).max(200).default([]),
});
export type ToolCommonResult = z.infer<typeof toolCommonResult>;

/** Build a tool result schema: the common result plus tool-specific fields. */
export function toolResult<T extends z.ZodRawShape>(shape: T) {
  return toolCommonResult.extend(shape);
}

/** Build a tool input schema: the common input plus tool-specific fields. */
export function toolInput<T extends z.ZodRawShape>(shape: T) {
  return toolCommonInput.extend(shape);
}

/** Capability manifest advertised to clients during negotiation. */
export const capabilityManifest = z.object({
  contract_version: z.number().int().positive(),
  protocol_versions: z.array(z.string().min(1)).min(1),
  tools: z.array(z.string().min(1)),
  resources: z.array(z.string().min(1)),
  prompts: z.array(z.string().min(1)),
  supports_structured_results: z.boolean(),
  supports_resources: z.boolean(),
});
export type CapabilityManifest = z.infer<typeof capabilityManifest>;
