import {
  type EvidenceId,
  fail,
  type Instant,
  type OrganizationId,
  ok,
  type ProjectId,
  type Result,
  type SessionId,
} from '@shoo/domain-shared';

/**
 * Evidence record (docs/36 `memory.evidence_records`).
 *
 * Evidence is immutable. Correction never rewrites evidence; it creates a new memory
 * revision and a supersession edge (docs/29 "Deletion and correction semantics").
 *
 * By default the cloud holds evidence *metadata* only: the body lives in the encrypted
 * local store and `cloudContentAvailable` says whether a permitted excerpt exists at all.
 */

export const EVIDENCE_SOURCE_TYPES = [
  'prompt',
  'assistant_message',
  'tool_call',
  'file_change',
  'test_run',
  'command',
  'git',
  'user_note',
] as const;
export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];

export type EvidenceClassification = 'restricted' | 'operational' | 'durable_eligible';
export type LocalAvailability = 'available' | 'expired' | 'purged' | 'unknown';

export interface EvidenceRecord {
  readonly id: EvidenceId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly sessionId: SessionId | null;
  readonly sourceType: EvidenceSourceType;
  readonly sourceRef: string | null;
  /** Content hash is part of evidence identity and is never recomputed after creation. */
  readonly contentHash: string;
  readonly occurredAt: Instant;
  readonly receivedAt: Instant;
  readonly policyVersion: number;
  readonly classification: EvidenceClassification;
  readonly localAvailability: LocalAvailability;
  readonly cloudContentAvailable: boolean;
  readonly affectedPaths: readonly string[];
}

export function recordEvidence(input: {
  readonly id: EvidenceId;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  readonly sessionId: SessionId | null;
  readonly sourceType: EvidenceSourceType;
  readonly sourceRef: string | null;
  readonly contentHash: string;
  readonly occurredAt: Instant;
  readonly receivedAt: Instant;
  readonly policyVersion: number;
  readonly classification: EvidenceClassification;
  readonly localAvailability: LocalAvailability;
  readonly cloudContentAvailable?: boolean;
  readonly affectedPaths?: readonly string[];
}): Result<EvidenceRecord> {
  if (input.contentHash.trim() === '') {
    return fail('INVALID_ARGUMENT', 'evidence requires a content hash');
  }
  const cloudContentAvailable = input.cloudContentAvailable ?? false;
  if (input.classification === 'restricted' && cloudContentAvailable) {
    return fail(
      'POLICY_DENIED',
      'restricted evidence may not carry cloud-resident content by default',
    );
  }
  return ok({
    id: input.id,
    organizationId: input.organizationId,
    projectId: input.projectId,
    sessionId: input.sessionId,
    sourceType: input.sourceType,
    sourceRef: input.sourceRef,
    contentHash: input.contentHash,
    occurredAt: input.occurredAt,
    receivedAt: input.receivedAt,
    policyVersion: input.policyVersion,
    classification: input.classification,
    localAvailability: input.localAvailability,
    cloudContentAvailable,
    affectedPaths: input.affectedPaths ?? [],
  });
}

export type SupportType = 'supports' | 'contradicts' | 'contextualizes';

/** Link between a revision and the evidence backing (or contradicting) it. */
export interface EvidenceSupport {
  readonly evidenceId: EvidenceId;
  readonly supportType: SupportType;
}

/**
 * An excerpt can only be emitted when policy permits it and the body still exists. When it
 * does not, the caller must say `local_unavailable` rather than fabricate content
 * (docs/38 `shoo://sources/{source_id}`).
 */
export type ExcerptAvailability = 'permitted' | 'restricted' | 'local_unavailable';

export function excerptAvailability(evidence: EvidenceRecord): ExcerptAvailability {
  if (evidence.classification === 'restricted') return 'restricted';
  if (evidence.localAvailability !== 'available' && !evidence.cloudContentAvailable) {
    return 'local_unavailable';
  }
  return 'permitted';
}
