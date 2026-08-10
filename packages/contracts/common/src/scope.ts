import { z } from 'zod';
import { actorType, clientName } from './enums.js';
import { relativePath, semver, shortText, timestamp, uuid } from './scalars.js';

/**
 * Tenant scope, actor and source descriptors.
 *
 * The server derives organization, user and grants from the authenticated transport
 * identity. Caller-supplied scope is transported for observability and routing and is
 * always revalidated (docs/33 "Rejected: trusting caller-supplied organization_id").
 */

export const tenantScope = z.object({
  organization_id: uuid,
  project_id: uuid,
  work_unit_id: uuid.nullable().default(null),
  session_id: uuid.nullable().default(null),
});
export type TenantScope = z.infer<typeof tenantScope>;

export const eventActor = z.object({
  user_id: uuid.nullable().default(null),
  device_id: uuid.nullable().default(null),
  agent_id: uuid.nullable().default(null),
  actor_type: actorType,
});
export type EventActor = z.infer<typeof eventActor>;

export const eventSource = z.object({
  client: clientName,
  source_event_id: z.string().min(1).max(512),
  adapter_version: semver.nullable().default(null),
  source_sequence: z.number().int().nonnegative().nullable().default(null),
});
export type EventSource = z.infer<typeof eventSource>;

/**
 * Branch / worktree / module scope of a request or record.
 *
 * Branch is not an identity (docs/29): it is a normalized reference stored beside the
 * repository fingerprint, never a primary key.
 */
export const requestScope = z.object({
  branch: shortText.nullable().default(null),
  worktree_id: shortText.nullable().default(null),
  module_paths: z.array(relativePath).max(64).default([]),
});
export type RequestScope = z.infer<typeof requestScope>;

export const clientContext = z.object({
  name: clientName,
  version: shortText,
  adapter_version: semver.nullable().default(null),
});
export type ClientContext = z.infer<typeof clientContext>;

/**
 * Typed subject key of a memory record. Resolution never keys on free text
 * (docs/30 "Canonical resolver").
 */
export const typedSubject = z.object({
  subject_type: shortText,
  subject_key: shortText,
  branch_scope: shortText.nullable().default(null),
});
export type TypedSubject = z.infer<typeof typedSubject>;

/** Distinct time axes kept separate everywhere (docs/64 "TypeScript standards"). */
export const timeAxes = z.object({
  occurred_at: timestamp,
  received_at: timestamp,
  effective_at: timestamp.nullable().default(null),
  recorded_at: timestamp,
});
export type TimeAxes = z.infer<typeof timeAxes>;
