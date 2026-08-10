import type {
  AgentId,
  CorrelationId,
  DeviceId,
  EventId,
  OrganizationId,
  ProjectId,
  SessionId,
  UserId,
  WorkUnitId,
} from './brand.js';
import type { Instant } from './time.js';

/**
 * Domain events produced by aggregates.
 *
 * The domain emits intent, not transport. `@shoo/application` maps a `DomainEvent` onto
 * the wire envelope in `@shoo/contracts-events` and writes it to the ledger and outbox in
 * the same transaction as the aggregate mutation (docs/29 "Transactional outbox").
 */

export type ActorType = 'user' | 'device' | 'worker' | 'system';

export interface DomainActor {
  readonly actorType: ActorType;
  readonly userId: UserId | null;
  readonly deviceId: DeviceId | null;
  readonly agentId: AgentId | null;
}

export const SYSTEM_ACTOR: DomainActor = Object.freeze({
  actorType: 'system',
  userId: null,
  deviceId: null,
  agentId: null,
});

export interface DomainEvent<TType extends string = string, TPayload = unknown> {
  readonly eventId: EventId;
  readonly type: TType;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly workUnitId: WorkUnitId | null;
  readonly sessionId: SessionId | null;
  readonly actor: DomainActor;
  readonly occurredAt: Instant;
  readonly correlationId: CorrelationId;
  readonly causationId: string | null;
  readonly payload: TPayload;
}

/** Result of a command: the new aggregate state plus the events it produced. */
export interface CommandOutcome<TAggregate> {
  readonly aggregate: TAggregate;
  readonly events: readonly DomainEvent[];
}

export function outcome<TAggregate>(
  aggregate: TAggregate,
  events: readonly DomainEvent[],
): CommandOutcome<TAggregate> {
  return { aggregate, events };
}
