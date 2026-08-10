import { z } from 'zod';

/** Read-only MCP resources and optional prompts — docs/38. */

export interface McpResourceDefinition {
  /** URI template using RFC 6570 style placeholders. */
  readonly uriTemplate: string;
  readonly name: string;
  readonly description: string;
  readonly cache: 'private_short_ttl' | 'private_versioned' | 'private_immutable';
  /** Whether a permission change can invalidate an already delivered representation. */
  readonly invalidatedByAuthorityChange: boolean;
}

export const MCP_RESOURCES = {
  projectPulse: {
    uriTemplate: 'shoo://projects/{project_id}/pulse',
    name: 'Project pulse',
    description: 'Current project and work pulse with resolver watermark.',
    cache: 'private_short_ttl',
    invalidatedByAuthorityChange: true,
  },
  workContext: {
    uriTemplate: 'shoo://projects/{project_id}/work/{work_unit_id}/context',
    name: 'Work unit context',
    description: 'Latest permitted context pack; may redirect to an immutable pack id.',
    cache: 'private_short_ttl',
    invalidatedByAuthorityChange: true,
  },
  currentDecisions: {
    uriTemplate: 'shoo://projects/{project_id}/decisions/current',
    name: 'Current decisions',
    description: 'Current decisions and conflicts, invalidated on authority changes.',
    cache: 'private_short_ttl',
    invalidatedByAuthorityChange: true,
  },
  recentActivity: {
    uriTemplate: 'shoo://projects/{project_id}/activity/recent',
    name: 'Recent activity',
    description: 'Cursor-based activity snapshot.',
    cache: 'private_short_ttl',
    invalidatedByAuthorityChange: true,
  },
  memory: {
    uriTemplate: 'shoo://memories/{memory_id}',
    name: 'Memory record',
    description: 'Memory, revisions, authority and lineage.',
    cache: 'private_versioned',
    invalidatedByAuthorityChange: true,
  },
  source: {
    uriTemplate: 'shoo://sources/{source_id}',
    name: 'Evidence source',
    description:
      'Permitted evidence metadata and excerpt. May return local_unavailable; never fabricates content.',
    cache: 'private_versioned',
    invalidatedByAuthorityChange: true,
  },
  operation: {
    uriTemplate: 'shoo://operations/{operation_id}',
    name: 'Operation status',
    description: 'Async operation status and safe metadata. No project content by default.',
    cache: 'private_short_ttl',
    invalidatedByAuthorityChange: false,
  },
} as const satisfies Record<string, McpResourceDefinition>;

export type McpResourceName = keyof typeof MCP_RESOURCES;

export const MCP_RESOURCE_URI_TEMPLATES = Object.values(MCP_RESOURCES).map((r) => r.uriTemplate);

/** Result shape when evidence exists but its body is not locally available. */
export const sourceUnavailableResult = z.object({
  status: z.literal('local_unavailable'),
  source_id: z.string().min(1),
  reason: z.enum(['retention_expired', 'device_offline', 'policy_denied', 'purged']),
});
export type SourceUnavailableResult = z.infer<typeof sourceUnavailableResult>;

export interface McpPromptDefinition {
  readonly name: string;
  readonly description: string;
  readonly arguments: readonly {
    readonly name: string;
    readonly required: boolean;
  }[];
}

/** Prompts cannot bypass tool permission, confirmation or policy (docs/38). */
export const MCP_PROMPTS = {
  'shoo.resume_work': {
    name: 'shoo.resume_work',
    description: 'Select a target work unit and request cited continuation context.',
    arguments: [
      { name: 'project_id', required: true },
      { name: 'work_unit_id', required: false },
    ],
  },
  'shoo.create_checkpoint': {
    name: 'shoo.create_checkpoint',
    description: 'Review evidence before requesting an explicit checkpoint.',
    arguments: [
      { name: 'project_id', required: true },
      { name: 'session_id', required: true },
    ],
  },
  'shoo.explain_decision': {
    name: 'shoo.explain_decision',
    description: 'Retrieve the current rationale for a decision and its superseded lineage.',
    arguments: [
      { name: 'project_id', required: true },
      { name: 'decision_key', required: true },
    ],
  },
} as const satisfies Record<string, McpPromptDefinition>;

export type McpPromptName = keyof typeof MCP_PROMPTS;
