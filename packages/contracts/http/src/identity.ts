import {
  captureState,
  clientName,
  policyVersion,
  role,
  semver,
  sha256Hex,
  shortText,
  timestamp,
  trustMode,
  uuid,
  visibilityScope,
} from '@shoo/contracts-common';
import { z } from 'zod';
import { expectedVersion } from './common.js';

/** Identity, project, device and MemWal binding contracts (docs/37, docs/33). */

export const membershipView = z.object({
  organization_id: uuid,
  organization_name: shortText,
  role,
  status: z.enum(['active', 'invited', 'suspended']),
  joined_at: timestamp,
});
export type MembershipView = z.infer<typeof membershipView>;

/** `GET /v1/me`. Never returns wallet private material of any kind. */
export const meView = z.object({
  user_id: uuid,
  identity_provider_subject: shortText,
  display_name: shortText.nullable().default(null),
  status: z.enum(['active', 'suspended']),
  memberships: z.array(membershipView).max(200),
  step_up_verified_at: timestamp.nullable().default(null),
});
export type MeView = z.infer<typeof meView>;

export const retentionPolicySummary = z.object({
  retention_policy_id: uuid,
  local_evidence_days: z.number().int().positive(),
  operational_days: z.number().int().positive().nullable().default(null),
  legal_hold: z.boolean().default(false),
});

export const projectView = z.object({
  project_id: uuid,
  organization_id: uuid,
  name: shortText,
  slug: shortText,
  status: z.enum(['active', 'archived', 'deleting', 'deleted']),
  version: z.number().int().nonnegative(),
  repository: z
    .object({
      repository_fingerprint: sha256Hex,
      provider: shortText.nullable().default(null),
      ref: shortText.nullable().default(null),
      link_status: z.enum(['verified', 'unverified', 'mismatched']),
    })
    .nullable()
    .default(null),
  sync_policy_version: policyVersion,
  retention: retentionPolicySummary,
  default_visibility: visibilityScope,
  created_at: timestamp,
});
export type ProjectView = z.infer<typeof projectView>;

/** `POST /v1/projects`. */
export const createProjectRequest = z.object({
  organization_id: uuid,
  name: shortText,
  slug: shortText.regex(/^[a-z0-9][a-z0-9-]{0,62}$/, 'must be a lowercase slug'),
  repository_fingerprint: sha256Hex.nullable().default(null),
  repository_provider: shortText.nullable().default(null),
  repository_ref: shortText.nullable().default(null),
  local_identity_hash: sha256Hex.nullable().default(null),
});
export type CreateProjectRequest = z.infer<typeof createProjectRequest>;

/** `POST /v1/projects/{project_id}:reconcile-repository`. */
export const reconcileRepositoryRequest = expectedVersion.extend({
  repository_fingerprint: sha256Hex,
  local_identity_hash: sha256Hex,
  reason: shortText,
});
export type ReconcileRepositoryRequest = z.infer<typeof reconcileRepositoryRequest>;

export const deviceCapability = z.object({
  client: clientName,
  adapter_version: semver,
  capability_manifest_version: z.number().int().positive(),
  capabilities: z.array(shortText).max(100).default([]),
  capture_state: captureState,
});

/** `POST /v1/projects/{project_id}/devices`. Requires step-up. */
export const registerDeviceRequest = z.object({
  device_name: shortText,
  /** Public identity only — a private key is never accepted (docs/37). */
  public_key_fingerprint: sha256Hex,
  platform: z.enum(['windows', 'macos', 'linux']),
  capabilities: z.array(deviceCapability).max(10).default([]),
});
export type RegisterDeviceRequest = z.infer<typeof registerDeviceRequest>;

export const deviceView = z.object({
  device_id: uuid,
  user_id: uuid,
  device_name: shortText,
  public_key_fingerprint: sha256Hex,
  platform: z.enum(['windows', 'macos', 'linux']),
  capabilities: z.array(deviceCapability).max(10).default([]),
  status: z.enum(['active', 'revoked']),
  registered_at: timestamp,
  revoked_at: timestamp.nullable().default(null),
});
export type DeviceView = z.infer<typeof deviceView>;

export const memwalBindingView = z.object({
  binding_id: uuid,
  user_id: uuid,
  owner_address: shortText,
  account_id: shortText,
  package_id: shortText,
  network: z.enum(['mainnet', 'testnet', 'devnet', 'localnet']),
  status: z.enum(['pending', 'verified', 'revoked', 'mismatched']),
  verified_at: timestamp.nullable().default(null),
  trust_mode: trustMode,
  delegates: z
    .array(
      z.object({
        delegate_id: uuid,
        device_id: uuid,
        delegate_public_key_fingerprint: sha256Hex,
        onchain_status: z.enum(['pending', 'registered', 'removal_pending', 'removed', 'failed']),
        registered_at: timestamp.nullable().default(null),
      }),
    )
    .max(100)
    .default([]),
  namespaces: z
    .array(
      z.object({
        namespace_id: uuid,
        project_id: uuid,
        namespace: shortText,
        record_class: shortText,
        schema_version: z.number().int().positive(),
        immutable_since: timestamp.nullable().default(null),
      }),
    )
    .max(100)
    .default([]),
});
export type MemwalBindingView = z.infer<typeof memwalBindingView>;

/** `POST /v1/projects/{project_id}/memwal-binding:verify`. Proof only, never a key. */
export const verifyMemwalBindingRequest = z.object({
  owner_address: shortText,
  account_id: shortText,
  package_id: shortText,
  network: z.enum(['mainnet', 'testnet', 'devnet', 'localnet']),
  ownership_proof: z.object({
    scheme: z.enum(['sui_personal_message']),
    message: z.string().min(1).max(2048),
    signature: z.string().min(1).max(4096),
  }),
});
export type VerifyMemwalBindingRequest = z.infer<typeof verifyMemwalBindingRequest>;

/** `POST /v1/projects/{project_id}/delegates`. Records a pending registration only. */
export const registerDelegateRequest = z.object({
  device_id: uuid,
  delegate_public_key: z.string().min(1).max(2048),
  delegate_public_key_fingerprint: sha256Hex,
});
export type RegisterDelegateRequest = z.infer<typeof registerDelegateRequest>;

export const reconcileDelegateRequest = z.object({
  observed_onchain_status: z.enum(['registered', 'removed', 'absent']),
  transaction_digest: shortText.nullable().default(null),
});
export type ReconcileDelegateRequest = z.infer<typeof reconcileDelegateRequest>;
