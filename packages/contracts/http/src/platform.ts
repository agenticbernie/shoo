import {
  durabilityStatus,
  longText,
  memoryType,
  operationStatus,
  policyVersion,
  routeDecision,
  sha256Hex,
  shortText,
  timestamp,
  trustMode,
  uuid,
  visibilityScope,
} from '@shoo/contracts-common';
import { z } from 'zod';
import { pageQuery, previewToken } from './common.js';

/** Sync policy, durable operations, operations, export and deletion (docs/37). */

export const syncPolicyRule = z.object({
  rule_id: shortText,
  match: z.object({
    memory_types: z.array(memoryType).max(20).default([]),
    classifications: z
      .array(z.enum(['restricted', 'operational', 'durable_eligible']))
      .max(10)
      .default([]),
    path_globs: z.array(shortText).max(100).default([]),
    min_verification: z.enum(['unverified', 'corroborated', 'verified']).nullable().default(null),
  }),
  route: routeDecision,
  visibility_ceiling: visibilityScope,
  explanation: longText,
});
export type SyncPolicyRule = z.infer<typeof syncPolicyRule>;

export const syncPolicyView = z.object({
  project_id: uuid,
  version: policyVersion,
  default_route: routeDecision,
  rules: z.array(syncPolicyRule).max(200).default([]),
  trust_mode: trustMode,
  active_from: timestamp,
  authored_by_user_id: uuid,
  /** Flags can never disable RLS, authorization, citations or consent (docs/65). */
  immutable: z.literal(true).default(true),
});
export type SyncPolicyView = z.infer<typeof syncPolicyView>;

export const putSyncPolicyRequest = z.object({
  expected_version: policyVersion,
  default_route: routeDecision,
  rules: z.array(syncPolicyRule).max(200),
  trust_mode: trustMode,
  preview_token: previewToken,
});
export type PutSyncPolicyRequest = z.infer<typeof putSyncPolicyRequest>;

export const syncPolicyPreviewResult = z.object({
  affected_route_counts: z.record(routeDecision, z.number().int().nonnegative()),
  newly_durable_eligible: z.number().int().nonnegative(),
  newly_restricted: z.number().int().nonnegative(),
  explanations: z.array(longText).max(200).default([]),
  preview_token: previewToken,
  expires_at: timestamp,
});
export type SyncPolicyPreviewResult = z.infer<typeof syncPolicyPreviewResult>;

export const durableOperationView = z.object({
  durable_operation_id: uuid,
  revision_id: uuid,
  namespace_binding_id: uuid,
  trust_mode: trustMode,
  operation_key: shortText,
  status: durabilityStatus,
  job_id: shortText.nullable().default(null),
  blob_locator: shortText.nullable().default(null),
  payload_hash: sha256Hex.nullable().default(null),
  attempts: z.number().int().nonnegative(),
  last_error_code: shortText.nullable().default(null),
  requested_at: timestamp,
  updated_at: timestamp,
});
export type DurableOperationView = z.infer<typeof durableOperationView>;

export const listDurableOperationsQuery = pageQuery.extend({
  status: durabilityStatus.optional(),
  revision_id: uuid.optional(),
});
export type ListDurableOperationsQuery = z.infer<typeof listDurableOperationsQuery>;

export const reconcileDurableOperationRequest = z.object({
  observed_status: durabilityStatus,
  job_id: shortText.nullable().default(null),
  blob_locator: shortText.nullable().default(null),
});
export type ReconcileDurableOperationRequest = z.infer<typeof reconcileDurableOperationRequest>;

export const restoreNamespaceRequest = z.object({
  reason: longText,
  reindex: z.boolean().default(true),
  preview_token: previewToken,
});
export type RestoreNamespaceRequest = z.infer<typeof restoreNamespaceRequest>;

export const operationView = z.object({
  operation_id: uuid,
  operation_type: shortText,
  status: operationStatus,
  progress: z.number().min(0).max(1).nullable().default(null),
  /** Safe metadata only: no project content is exposed through operation handles. */
  result_ref: shortText.nullable().default(null),
  error_code: shortText.nullable().default(null),
  created_at: timestamp,
  updated_at: timestamp,
  expires_at: timestamp,
});
export type OperationView = z.infer<typeof operationView>;

export const createExportRequest = z.object({
  scope: z.enum(['project_memory', 'namespace_manifest', 'audit_trail']),
  include_history: z.boolean().default(true),
  preview_token: previewToken,
});
export type CreateExportRequest = z.infer<typeof createExportRequest>;

/**
 * Deletion is reported layer by layer. Shoo never claims physical durable deletion it
 * cannot verify (docs/29 "Deletion and correction semantics").
 */
export const deletionLayerState = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'failed',
  'not_guaranteed',
]);

export const deletionStatusView = z.object({
  project_id: uuid,
  local: deletionLayerState,
  operational: deletionLayerState,
  search_index: deletionLayerState,
  backups: deletionLayerState,
  durable_recall_mapping: deletionLayerState,
  durable_blob_expiry: deletionLayerState,
  unsupported_guarantees: z.array(shortText).max(20).default([]),
  updated_at: timestamp,
});
export type DeletionStatusView = z.infer<typeof deletionStatusView>;

export const deletionPreviewResult = z.object({
  impact: deletionStatusView,
  affected_record_counts: z.record(z.string(), z.number().int().nonnegative()).default({}),
  preview_token: previewToken,
  expires_at: timestamp,
});
export type DeletionPreviewResult = z.infer<typeof deletionPreviewResult>;

export const deleteProjectRequest = z.object({
  expected_version: z.number().int().nonnegative(),
  preview_token: previewToken,
  confirmation_phrase: shortText,
});
export type DeleteProjectRequest = z.infer<typeof deleteProjectRequest>;

/** Compatibility manifest exchanged with Shoo Local (docs/64, docs/65). */
export const compatibilityManifest = z.object({
  component: z.enum(['shoo_local', 'shoo_api', 'shoo_worker', 'memwal_sdk']),
  contract_version: z.number().int().positive(),
  min_supported_contract_version: z.number().int().positive(),
  max_supported_contract_version: z.number().int().positive(),
  security_minimum_version: shortText.nullable().default(null),
  checked_at: timestamp,
  result: z.enum(['compatible', 'upgrade_recommended', 'blocked']),
});
export type CompatibilityManifest = z.infer<typeof compatibilityManifest>;
