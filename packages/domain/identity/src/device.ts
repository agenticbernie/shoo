import {
  type AggregateVersion,
  type BindingId,
  type DelegateId,
  type DeviceId,
  INITIAL_VERSION,
  type Instant,
  type NamespaceId,
  type ProjectId,
  type Result,
  type UserId,
  type Versioned,
  checkExpectedVersion,
  fail,
  nextVersion,
  ok,
} from '@shoo/domain-shared';

/**
 * Device identity and user-owned MemWal binding
 * (docs/36 `iam.devices`, `iam.memwal_bindings`, `iam.memwal_delegates`,
 * `iam.namespace_registry`; docs/33 "User-owned durable identity").
 *
 * Shoo stores public material only: an owner address, an account id, a package id and
 * delegate *public* identifiers. Owner and delegate private keys never reach the cloud and
 * have no representation in this domain.
 */

export type DevicePlatform = 'windows' | 'macos' | 'linux';
export type DeviceStatus = 'active' | 'revoked';

export interface Device extends Versioned {
  readonly id: DeviceId;
  readonly userId: UserId;
  readonly name: string;
  readonly platform: DevicePlatform;
  /** Public key fingerprint. Unique per user (docs/36). */
  readonly publicKeyFingerprint: string;
  readonly status: DeviceStatus;
  readonly registeredAt: Instant;
  readonly revokedAt: Instant | null;
}

export function registerDevice(input: {
  readonly id: DeviceId;
  readonly userId: UserId;
  readonly name: string;
  readonly platform: DevicePlatform;
  readonly publicKeyFingerprint: string;
  readonly registeredAt: Instant;
}): Result<Device> {
  if (input.publicKeyFingerprint.trim() === '') {
    return fail('INVALID_ARGUMENT', 'device public key fingerprint is required');
  }
  if (input.name.trim() === '') {
    return fail('INVALID_ARGUMENT', 'device name is required');
  }
  return ok({
    id: input.id,
    userId: input.userId,
    name: input.name.trim(),
    platform: input.platform,
    publicKeyFingerprint: input.publicKeyFingerprint,
    status: 'active',
    registeredAt: input.registeredAt,
    revokedAt: null,
    version: INITIAL_VERSION,
  });
}

export function revokeDevice(
  device: Device,
  at: Instant,
  expectedVersion: AggregateVersion,
): Result<Device> {
  const versionCheck = checkExpectedVersion(device.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (device.status === 'revoked') {
    return fail('ALREADY_TERMINAL', 'device is already revoked');
  }
  return ok({ ...device, status: 'revoked', revokedAt: at, version: nextVersion(device.version) });
}

export type MemwalNetwork = 'mainnet' | 'testnet' | 'devnet' | 'localnet';
export type BindingStatus = 'pending' | 'verified' | 'revoked' | 'mismatched';
export type DelegateOnchainStatus =
  | 'pending'
  | 'registered'
  | 'removal_pending'
  | 'removed'
  | 'failed';

export interface MemwalDelegate {
  readonly id: DelegateId;
  readonly deviceId: DeviceId;
  /** Public identifier only — a delegate private key is never stored (docs/33). */
  readonly publicKeyFingerprint: string;
  readonly onchainStatus: DelegateOnchainStatus;
  readonly registeredAt: Instant | null;
}

export interface ProjectNamespace {
  readonly id: NamespaceId;
  readonly projectId: ProjectId;
  readonly namespace: string;
  readonly recordClass: string;
  readonly schemaVersion: number;
  /** Namespace is immutable after the first durable write (docs/36). */
  readonly immutableSince: Instant | null;
}

export interface MemwalBinding extends Versioned {
  readonly id: BindingId;
  readonly userId: UserId;
  readonly ownerAddress: string;
  readonly accountId: string;
  readonly packageId: string;
  readonly network: MemwalNetwork;
  readonly status: BindingStatus;
  readonly verifiedAt: Instant | null;
  readonly delegates: readonly MemwalDelegate[];
  readonly namespaces: readonly ProjectNamespace[];
}

export function createMemwalBinding(input: {
  readonly id: BindingId;
  readonly userId: UserId;
  readonly ownerAddress: string;
  readonly accountId: string;
  readonly packageId: string;
  readonly network: MemwalNetwork;
}): Result<MemwalBinding> {
  for (const [field, value] of [
    ['owner address', input.ownerAddress],
    ['account id', input.accountId],
    ['package id', input.packageId],
  ] as const) {
    if (value.trim() === '') {
      return fail('INVALID_ARGUMENT', `MemWal ${field} is required`);
    }
  }
  return ok({
    id: input.id,
    userId: input.userId,
    ownerAddress: input.ownerAddress,
    accountId: input.accountId,
    packageId: input.packageId,
    network: input.network,
    status: 'pending',
    verifiedAt: null,
    delegates: [],
    namespaces: [],
    version: INITIAL_VERSION,
  });
}

/** Verification requires a wallet ownership proof validated by the adapter, then this command. */
export function markBindingVerified(
  binding: MemwalBinding,
  at: Instant,
  expectedVersion: AggregateVersion,
): Result<MemwalBinding> {
  const versionCheck = checkExpectedVersion(binding.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (binding.status === 'revoked') {
    return fail('ILLEGAL_TRANSITION', 'a revoked binding cannot be verified');
  }
  return ok({
    ...binding,
    status: 'verified',
    verifiedAt: at,
    version: nextVersion(binding.version),
  });
}

export function addDelegate(
  binding: MemwalBinding,
  delegate: MemwalDelegate,
  expectedVersion: AggregateVersion,
): Result<MemwalBinding> {
  const versionCheck = checkExpectedVersion(binding.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  if (binding.status !== 'verified') {
    return fail('ILLEGAL_TRANSITION', 'delegates require a verified binding', {
      status: binding.status,
    });
  }
  if (binding.delegates.some((d) => d.deviceId === delegate.deviceId && d.onchainStatus !== 'removed')) {
    return fail('INVARIANT_VIOLATION', 'device already has an active delegate on this binding');
  }
  return ok({
    ...binding,
    delegates: [...binding.delegates, delegate],
    version: nextVersion(binding.version),
  });
}

/**
 * Revoking Shoo device access and removing the onchain delegate are separate states.
 * Partial failure stays visible; Shoo access is never restored because the onchain step
 * failed (docs/33 "Revocation behavior").
 */
export function markDelegateRemovalPending(
  binding: MemwalBinding,
  delegateId: DelegateId,
  expectedVersion: AggregateVersion,
): Result<MemwalBinding> {
  const versionCheck = checkExpectedVersion(binding.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  const found = binding.delegates.find((d) => d.id === delegateId);
  if (found === undefined) {
    return fail('INVALID_ARGUMENT', 'delegate does not belong to this binding');
  }
  return ok({
    ...binding,
    delegates: binding.delegates.map((d) =>
      d.id === delegateId ? { ...d, onchainStatus: 'removal_pending' as const } : d,
    ),
    version: nextVersion(binding.version),
  });
}

export function registerNamespace(
  binding: MemwalBinding,
  namespace: ProjectNamespace,
  expectedVersion: AggregateVersion,
): Result<MemwalBinding> {
  const versionCheck = checkExpectedVersion(binding.version, expectedVersion);
  if (!versionCheck.ok) return versionCheck;
  const existing = binding.namespaces.find((n) => n.projectId === namespace.projectId);
  if (existing !== undefined) {
    if (existing.immutableSince !== null && existing.namespace !== namespace.namespace) {
      return fail(
        'INVARIANT_VIOLATION',
        'namespace is immutable after the first durable write and cannot be renamed',
      );
    }
    if (existing.namespace === namespace.namespace) {
      return ok(binding);
    }
  }
  if (binding.namespaces.some((n) => n.namespace === namespace.namespace && n.projectId !== namespace.projectId)) {
    return fail('INVARIANT_VIOLATION', 'namespace is already bound to another project');
  }
  return ok({
    ...binding,
    namespaces: [
      ...binding.namespaces.filter((n) => n.projectId !== namespace.projectId),
      namespace,
    ],
    version: nextVersion(binding.version),
  });
}
