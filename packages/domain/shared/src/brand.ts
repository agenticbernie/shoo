/**
 * Branded identifier types.
 *
 * docs/64 requires domain identifiers to be branded value types, not interchangeable
 * strings, so an `OrganizationId` can never be passed where a `ProjectId` is expected.
 * The brand exists only in the type system: at runtime these are plain strings.
 */

declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isUuidLike(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export type OrganizationId = Brand<string, 'OrganizationId'>;
export type ProjectId = Brand<string, 'ProjectId'>;
export type UserId = Brand<string, 'UserId'>;
export type MembershipId = Brand<string, 'MembershipId'>;
export type DeviceId = Brand<string, 'DeviceId'>;
export type AgentId = Brand<string, 'AgentId'>;
export type GrantId = Brand<string, 'GrantId'>;
export type BindingId = Brand<string, 'BindingId'>;
export type DelegateId = Brand<string, 'DelegateId'>;
export type NamespaceId = Brand<string, 'NamespaceId'>;

export type WorkUnitId = Brand<string, 'WorkUnitId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type CheckpointId = Brand<string, 'CheckpointId'>;

export type EvidenceId = Brand<string, 'EvidenceId'>;
export type MemoryId = Brand<string, 'MemoryId'>;
export type RevisionId = Brand<string, 'RevisionId'>;
export type ConflictId = Brand<string, 'ConflictId'>;
export type ResolutionId = Brand<string, 'ResolutionId'>;

export type ContextPackId = Brand<string, 'ContextPackId'>;
export type RetrievalRequestId = Brand<string, 'RetrievalRequestId'>;

export type EventId = Brand<string, 'EventId'>;
export type OutboxJobId = Brand<string, 'OutboxJobId'>;
export type OperationId = Brand<string, 'OperationId'>;
export type DurableOperationId = Brand<string, 'DurableOperationId'>;
export type CorrelationId = Brand<string, 'CorrelationId'>;

/** Every branded id the domain uses, for generic id helpers. */
export type AnyId =
  | OrganizationId
  | ProjectId
  | UserId
  | MembershipId
  | DeviceId
  | AgentId
  | GrantId
  | BindingId
  | DelegateId
  | NamespaceId
  | WorkUnitId
  | SessionId
  | CheckpointId
  | EvidenceId
  | MemoryId
  | RevisionId
  | ConflictId
  | ResolutionId
  | ContextPackId
  | RetrievalRequestId
  | EventId
  | OutboxJobId
  | OperationId
  | DurableOperationId
  | CorrelationId;

/**
 * Cast a validated string into a branded id.
 *
 * Validation happens at the boundary (contracts / persistence), not here: the domain is
 * deterministic and does not perform IO. This helper only records the intent in types.
 */
export function asId<T extends AnyId>(value: string): T {
  return value as T;
}
