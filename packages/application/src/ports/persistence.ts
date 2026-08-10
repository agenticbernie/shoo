import type { Checkpoint, Session, WorkUnit } from '@shoo/domain-continuity';
import type {
  Device,
  MemwalBinding,
  Organization,
  Project,
  ProjectGrant,
} from '@shoo/domain-identity';
import type { ContextPack } from '@shoo/domain-intelligence';
import type { Conflict, EvidenceRecord, MemoryRecord } from '@shoo/domain-memory';
import type { DurableOperation, Operation, OutboxJob, SyncPolicy } from '@shoo/domain-platform';
import type {
  ConflictId,
  ContextPackId,
  DeviceId,
  DomainEvent,
  EvidenceId,
  MemoryId,
  OperationId,
  OrganizationId,
  ProjectId,
  SessionId,
  TenantScope,
  TypedSubject,
  UserId,
  WorkUnitId,
} from '@shoo/domain-shared';

/**
 * Persistence ports.
 *
 * Adapters (`@shoo/db-postgres`) implement these; the domain never sees them. Every read
 * takes an explicit `TenantScope` so a query cannot accidentally span tenants before RLS
 * has to catch it.
 *
 * Cross-context reads go through these query ports or explicit read models — never by
 * importing another module's tables (docs/63 "Cross-domain reads").
 */

/**
 * One transactional boundary. The aggregate mutation, the ledger append and the outbox
 * job must be committed together (docs/29 "Transactional outbox"), which is why the
 * repositories are handed to the callback rather than injected globally.
 */
export interface UnitOfWork {
  execute<T>(scope: TenantScope, fn: (repos: Repositories) => Promise<T>): Promise<T>;
}

export interface Repositories {
  readonly organizations: OrganizationRepository;
  readonly projects: ProjectRepository;
  readonly grants: GrantRepository;
  readonly devices: DeviceRepository;
  readonly memwal: MemwalBindingRepository;
  readonly workUnits: WorkUnitRepository;
  readonly sessions: SessionRepository;
  readonly checkpoints: CheckpointRepository;
  readonly evidence: EvidenceRepository;
  readonly memories: MemoryRepository;
  readonly conflicts: ConflictRepository;
  readonly contextPacks: ContextPackRepository;
  readonly policies: SyncPolicyRepository;
  readonly outbox: OutboxRepository;
  readonly operations: OperationRepository;
  readonly durableOperations: DurableOperationRepository;
  readonly ledger: EventLedgerPort;
  readonly audit: AuditPort;
}

export interface OrganizationRepository {
  findById(id: OrganizationId): Promise<Organization | null>;
  save(organization: Organization): Promise<void>;
}

export interface ProjectRepository {
  findById(id: ProjectId): Promise<Project | null>;
  findBySlug(organizationId: OrganizationId, slug: string): Promise<Project | null>;
  findByRepositoryFingerprint(
    organizationId: OrganizationId,
    fingerprint: string,
  ): Promise<Project | null>;
  save(project: Project): Promise<void>;
}

export interface GrantRepository {
  findForSubject(projectId: ProjectId, subjectId: string): Promise<ProjectGrant | null>;
  save(grant: ProjectGrant): Promise<void>;
}

export interface DeviceRepository {
  findById(id: DeviceId): Promise<Device | null>;
  listForUser(userId: UserId): Promise<readonly Device[]>;
  save(device: Device): Promise<void>;
}

export interface MemwalBindingRepository {
  findForUser(userId: UserId): Promise<MemwalBinding | null>;
  save(binding: MemwalBinding): Promise<void>;
}

export interface WorkUnitRepository {
  findById(id: WorkUnitId): Promise<WorkUnit | null>;
  listOpen(projectId: ProjectId): Promise<readonly WorkUnit[]>;
  /** Candidate resolution for `work-units:resolve`; ranking happens in the use case. */
  findCandidates(input: {
    readonly projectId: ProjectId;
    readonly branch: string | null;
    readonly paths: readonly string[];
    readonly limit: number;
  }): Promise<readonly WorkUnit[]>;
  save(workUnit: WorkUnit): Promise<void>;
}

export interface SessionRepository {
  findById(id: SessionId): Promise<Session | null>;
  /** Idempotent start: the same adapter instance and native id is the same session. */
  findByNativeIdentity(input: {
    readonly projectId: ProjectId;
    readonly adapterInstanceId: string;
    readonly nativeSessionId: string;
  }): Promise<Session | null>;
  save(session: Session): Promise<void>;
}

export interface CheckpointRepository {
  findByTrigger(sessionId: SessionId, triggerIdempotencyKey: string): Promise<Checkpoint | null>;
  latestForWorkUnit(workUnitId: WorkUnitId): Promise<Checkpoint | null>;
  append(checkpoint: Checkpoint): Promise<void>;
}

export interface EvidenceRepository {
  findById(id: EvidenceId): Promise<EvidenceRecord | null>;
  findByDuplicateKey(key: string): Promise<EvidenceRecord | null>;
  append(evidence: EvidenceRecord): Promise<void>;
}

export interface MemoryRepository {
  findById(id: MemoryId): Promise<MemoryRecord | null>;
  findBySubject(input: {
    readonly projectId: ProjectId;
    readonly subject: TypedSubject;
  }): Promise<readonly MemoryRecord[]>;
  /** The active canonical revision for a subject, used to enforce single-canon. */
  findActiveCanonical(input: {
    readonly projectId: ProjectId;
    readonly subject: TypedSubject;
  }): Promise<MemoryRecord | null>;
  save(record: MemoryRecord): Promise<void>;
}

export interface ConflictRepository {
  findById(id: ConflictId): Promise<Conflict | null>;
  findActiveByFingerprint(projectId: ProjectId, fingerprint: string): Promise<Conflict | null>;
  listOpen(projectId: ProjectId): Promise<readonly Conflict[]>;
  save(conflict: Conflict): Promise<void>;
}

export interface ContextPackRepository {
  findById(id: ContextPackId): Promise<ContextPack | null>;
  findByContentHash(projectId: ProjectId, contentHash: string): Promise<ContextPack | null>;
  save(pack: ContextPack): Promise<void>;
  /** Invalidate packs affected by a correction, supersession or permission change. */
  invalidateForRevisions(revisionIds: readonly string[]): Promise<number>;
}

export interface SyncPolicyRepository {
  findActive(projectId: ProjectId): Promise<SyncPolicy | null>;
  findVersion(projectId: ProjectId, version: number): Promise<SyncPolicy | null>;
  append(policy: SyncPolicy): Promise<void>;
}

export interface OutboxRepository {
  enqueue(job: OutboxJob): Promise<void>;
  claimRunnable(input: {
    readonly jobClass: OutboxJob['jobClass'];
    readonly owner: string;
    readonly leaseMillis: number;
    readonly limit: number;
  }): Promise<readonly OutboxJob[]>;
  save(job: OutboxJob): Promise<void>;
}

export interface OperationRepository {
  findById(id: OperationId): Promise<Operation | null>;
  save(operation: Operation): Promise<void>;
}

export interface DurableOperationRepository {
  findByOperationKey(key: string): Promise<DurableOperation | null>;
  listPending(projectId: ProjectId, limit: number): Promise<readonly DurableOperation[]>;
  save(operation: DurableOperation): Promise<void>;
}

/** Append-only ledger. There is deliberately no update or delete method. */
export interface EventLedgerPort {
  append(events: readonly DomainEvent[]): Promise<void>;
  /** Returns true when this source identity has already been ingested (at-least-once). */
  hasSourceIdentity(duplicateKey: string): Promise<boolean>;
}

export interface AuditRecord {
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string | null;
  readonly result: 'allowed' | 'denied' | 'error';
  readonly reasonCode: string;
  readonly stepUpVerified: boolean;
  readonly requestId: string | null;
  readonly correlationId: string | null;
}

/** Append-only, content-minimized security audit trail (docs/36 `audit.security_events`). */
export interface AuditPort {
  record(entry: AuditRecord): Promise<void>;
}
