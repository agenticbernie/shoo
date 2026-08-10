import {
  type EvidenceId,
  type Instant,
  type Result,
  type RetrievalRequestId,
  type RevisionId,
  fail,
  ok,
} from '@shoo/domain-shared';

/**
 * Ask Shoo answer model (docs/30 "Ask Shoo behavior").
 *
 * Facts, inferences and suggestions are separate collections, not one prose blob, and a
 * fact without a permitted citation cannot be emitted at all. When evidence is
 * insufficient the answer says so and names what is missing — it never fills the gap.
 */

export type AskIntent = 'current' | 'history' | 'rationale' | 'occurrence' | 'resume' | 'unsupported';

export type ExcerptPolicy = 'permitted' | 'restricted' | 'local_unavailable';

export interface Citation {
  readonly claimKey: string;
  readonly revisionId: RevisionId | null;
  readonly evidenceId: EvidenceId | null;
  readonly excerptPolicy: ExcerptPolicy;
}

export interface FactClaim {
  readonly claimKey: string;
  readonly text: string;
  readonly citations: readonly Citation[];
}

export interface InferenceClaim extends FactClaim {
  readonly confidence: number;
}

export interface Suggestion {
  readonly text: string;
  readonly rationale: string | null;
}

export type EvidenceSufficiency = 'sufficient' | 'partial' | 'insufficient';

export interface Answer {
  readonly requestId: RetrievalRequestId;
  readonly classifiedIntent: AskIntent;
  readonly evidenceSufficiency: EvidenceSufficiency;
  readonly facts: readonly FactClaim[];
  readonly inferences: readonly InferenceClaim[];
  readonly suggestions: readonly Suggestion[];
  readonly missingEvidence: readonly string[];
  readonly contentHash: string;
  readonly createdAt: Instant;
}

export const UNKNOWN_ANSWER_TEXT = 'unknown from available project evidence' as const;

export function composeAnswer(input: {
  readonly requestId: RetrievalRequestId;
  readonly classifiedIntent: AskIntent;
  readonly facts: readonly FactClaim[];
  readonly inferences: readonly InferenceClaim[];
  readonly suggestions: readonly Suggestion[];
  readonly missingEvidence: readonly string[];
  readonly contentHash: string;
  readonly at: Instant;
}): Result<Answer> {
  for (const fact of input.facts) {
    if (fact.citations.length === 0) {
      return fail('EVIDENCE_REQUIRED', 'a fact cannot be emitted without a citation', {
        claim_key: fact.claimKey,
      });
    }
  }
  for (const inference of input.inferences) {
    if (inference.confidence < 0 || inference.confidence > 1) {
      return fail('INVALID_ARGUMENT', 'inference confidence must be within [0, 1]');
    }
    if (inference.citations.length === 0) {
      return fail('EVIDENCE_REQUIRED', 'an inference must cite the evidence it reasons from', {
        claim_key: inference.claimKey,
      });
    }
  }

  const sufficiency: EvidenceSufficiency =
    input.facts.length === 0
      ? 'insufficient'
      : input.missingEvidence.length > 0
        ? 'partial'
        : 'sufficient';

  if (sufficiency === 'insufficient' && input.missingEvidence.length === 0) {
    return fail(
      'EVIDENCE_REQUIRED',
      'an insufficient-evidence answer must state what evidence is missing',
    );
  }

  return ok({
    requestId: input.requestId,
    classifiedIntent: input.classifiedIntent,
    evidenceSufficiency: sufficiency,
    facts: input.facts,
    inferences: input.inferences,
    suggestions: input.suggestions,
    missingEvidence: input.missingEvidence,
    contentHash: input.contentHash,
    createdAt: input.at,
  });
}

/**
 * Classification is explicit; an unclassifiable question is `unsupported`, not a guess.
 * Retrieved content is untrusted data and can never redirect intent (docs/38 security).
 */
export function isAnswerableIntent(intent: AskIntent): boolean {
  return intent !== 'unsupported';
}
