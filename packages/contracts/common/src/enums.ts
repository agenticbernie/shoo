import { z } from 'zod';

/**
 * Enumerations shared by HTTP, MCP and event contracts.
 *
 * The authority fields below are deliberately independent (docs/30 "Authority model"):
 * no transition of one field implies a transition of another. Contracts transport the
 * values; `@shoo/domain-memory` owns the legal transitions.
 */

/** Clients that can be the source of an evidence envelope or request. */
export const clientName = z.enum(['opencode', 'codex', 'web', 'api', 'worker']);
export type ClientName = z.infer<typeof clientName>;

/** Actor classes recognised by the event ledger and audit trail. */
export const actorType = z.enum(['user', 'device', 'worker', 'system']);
export type ActorType = z.infer<typeof actorType>;

/** MVP roles (docs/33 "MVP roles"). */
export const role = z.enum([
  'project_owner',
  'developer',
  'device_adapter',
  'background_worker',
  'support_operator',
]);
export type Role = z.infer<typeof role>;

/** Freshness reported with every retrieval or read result. */
export const freshness = z.enum(['current', 'stale', 'partial', 'unknown']);
export type Freshness = z.infer<typeof freshness>;

/** Freshness of a single memory revision (docs/30 `freshness_status`). */
export const freshnessStatus = z.enum(['current', 'stale', 'expired', 'unknown']);
export type FreshnessStatus = z.infer<typeof freshnessStatus>;

/** How a claim entered the system (docs/30 `claim_status`). */
export const claimStatus = z.enum(['observed', 'inferred', 'claimed']);
export type ClaimStatus = z.infer<typeof claimStatus>;

/** Verification state of a claim (docs/30 `verification_status`). */
export const verificationStatus = z.enum(['unverified', 'corroborated', 'verified', 'disputed']);
export type VerificationStatus = z.infer<typeof verificationStatus>;

/** Authority reached by a revision (docs/30 `authority_status`). */
export const authorityStatus = z.enum([
  'personal',
  'session',
  'branch',
  'team',
  'canonical',
  'historical',
]);
export type AuthorityStatus = z.infer<typeof authorityStatus>;

/** Who may see a record (docs/30 `visibility_scope`). Visibility never implies authority. */
export const visibilityScope = z.enum(['private', 'project', 'team', 'organization']);
export type VisibilityScope = z.infer<typeof visibilityScope>;

/** Where a record physically lives (docs/30 `durability_status`). */
export const durabilityStatus = z.enum([
  'local',
  'operational',
  'durable_pending',
  'durable',
  'durable_failed',
]);
export type DurabilityStatus = z.infer<typeof durabilityStatus>;

/** Lineage position of a revision (docs/30 `lineage_status`). */
export const lineageStatus = z.enum(['active', 'superseded', 'deprecated', 'conflicted']);
export type LineageStatus = z.infer<typeof lineageStatus>;

/** MVP structured memory taxonomy (docs/30). `handoff`/`dependency` are schema-reserved. */
export const memoryType = z.enum([
  'fact',
  'decision',
  'task_state',
  'progress',
  'code_change',
  'test_result',
  'bug',
  'blocker',
  'risk',
  'convention',
  'question',
  'conflict_resolution',
  'handoff',
  'dependency',
]);
export type MemoryType = z.infer<typeof memoryType>;

/** Memory types that MVP services may emit. The remainder are schema-reserved only. */
export const MVP_MEMORY_TYPES = [
  'fact',
  'decision',
  'task_state',
  'progress',
  'code_change',
  'test_result',
  'bug',
  'blocker',
  'risk',
  'convention',
  'question',
  'conflict_resolution',
] as const satisfies readonly MemoryType[];

/** Work unit lifecycle state (docs/29 continuity). */
export const workUnitState = z.enum([
  'proposed',
  'active',
  'paused',
  'blocked',
  'in_review',
  'completed',
  'abandoned',
]);
export type WorkUnitState = z.infer<typeof workUnitState>;

/** Session lifecycle state. Session completion is never work completion (docs/38). */
export const sessionState = z.enum(['starting', 'active', 'completed', 'failed', 'abandoned']);
export type SessionState = z.infer<typeof sessionState>;

/** Capture health reported by a client adapter. */
export const captureState = z.enum(['healthy', 'degraded', 'unsupported', 'disabled']);
export type CaptureState = z.infer<typeof captureState>;

/** Why a checkpoint was requested (docs/38 `shoo.checkpoint_session`). */
export const checkpointReason = z.enum([
  'explicit',
  'pre_compaction',
  'stop',
  'blocker',
  'test_transition',
  'recovery',
]);
export type CheckpointReason = z.infer<typeof checkpointReason>;

/** Retrieval intent (docs/30, docs/37, docs/38). */
export const retrievalIntent = z.enum(['current', 'history', 'rationale', 'occurrence', 'resume']);
export type RetrievalIntent = z.infer<typeof retrievalIntent>;

/** Ask Shoo intent classification, including the explicit unsupported bucket. */
export const askIntent = z.enum([
  'current',
  'history',
  'rationale',
  'occurrence',
  'resume',
  'unsupported',
]);
export type AskIntent = z.infer<typeof askIntent>;

/** Conflict lifecycle. */
export const conflictState = z.enum(['active', 'resolving', 'resolved', 'dismissed']);
export type ConflictState = z.infer<typeof conflictState>;

/** Conflict severity used for surfacing order, never for automatic resolution. */
export const conflictSeverity = z.enum(['low', 'medium', 'high', 'critical']);
export type ConflictSeverity = z.infer<typeof conflictSeverity>;

/** Authorized resolution actions (docs/37 `conflicts/{id}:resolve`). */
export const resolutionAction = z.enum(['select', 'merge', 'scope', 'deprecate']);
export type ResolutionAction = z.infer<typeof resolutionAction>;

/** Async operation lifecycle exposed through operation handles (docs/37). */
export const operationStatus = z.enum([
  'pending',
  'running',
  'succeeded',
  'failed',
  'cancelled',
  'expired',
]);
export type OperationStatus = z.infer<typeof operationStatus>;

/** Routing decision produced by the capture policy (docs/29, docs/36). */
export const routeDecision = z.enum(['local_only', 'operational', 'durable', 'shared', 'denied']);
export type RouteDecision = z.infer<typeof routeDecision>;

/** Durable (MemWal/Walrus) trust mode. */
export const trustMode = z.enum(['manual', 'managed']);
export type TrustMode = z.infer<typeof trustMode>;

/** Completeness of a partial result. */
export const completenessState = z.enum(['complete', 'partial', 'unknown']);
export type CompletenessState = z.infer<typeof completenessState>;
