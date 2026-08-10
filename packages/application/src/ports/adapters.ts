import type { AuthorizationContext, Role, VisibilityScope } from '@shoo/domain-identity';
import type { RetrievalCandidate, RetrievalRequest } from '@shoo/domain-intelligence';
import type {
  DeviceId,
  Instant,
  OrganizationId,
  ProjectId,
  Result,
  RevisionId,
  UserId,
} from '@shoo/domain-shared';

/**
 * Provider and client adapter ports.
 *
 * Adapter packages implement these and translate provider behaviour and errors at the
 * boundary (docs/64 "provider errors are translated at adapter boundaries"). Apps are the
 * only construction sites (docs/63 "App composition roots are the only provider
 * construction sites").
 */

// --- identity provider (Clerk) ---------------------------------------------

export interface VerifiedIdentity {
  readonly userId: UserId;
  readonly identityProviderSubject: string;
  readonly organizationId: OrganizationId;
  readonly role: Role;
  readonly visibilityCeiling: VisibilityScope;
  /** When the session last performed a step-up confirmation, if ever. */
  readonly stepUpVerifiedAt: Instant | null;
}

export interface IdentityProviderPort {
  /** Verify a bearer token and return the Shoo identity it maps to. */
  verifyToken(token: string): Promise<Result<VerifiedIdentity>>;
  /** Verify a step-up assertion issued for a specific high-impact action. */
  verifyStepUp(input: {
    readonly token: string;
    readonly userId: UserId;
    readonly action: string;
  }): Promise<Result<Instant>>;
}

/**
 * Preview tokens bind an approved impact preview to actor, target version and action, so
 * a commit cannot reuse a preview taken for something else (docs/37).
 */
export interface PreviewTokenPort {
  issue(input: {
    readonly userId: UserId;
    readonly action: string;
    readonly targetId: string;
    readonly expectedVersion: number;
    readonly ttlMillis: number;
  }): Promise<string>;
  verify(input: {
    readonly token: string;
    readonly userId: UserId;
    readonly action: string;
    readonly targetId: string;
    readonly expectedVersion: number;
  }): Promise<Result<true>>;
}

// --- client adapters (Shoo Local) -------------------------------------------

export interface CaptureEnvelopeInput {
  readonly sourceEventId: string;
  readonly adapterInstanceId: string;
  readonly eventType: string;
  readonly schemaVersion: number;
  readonly sourceSequence: number | null;
  readonly occurredAt: Instant;
  readonly contentHash: string;
  readonly classification: 'restricted' | 'operational' | 'durable_eligible';
  readonly payload: unknown;
}

export interface CapabilityManifest {
  readonly client: 'opencode' | 'codex';
  readonly clientVersion: string;
  readonly adapterVersion: string;
  readonly manifestVersion: number;
  readonly capabilities: readonly string[];
  /** Capabilities the installed client does not provide; capture is degraded, not faked. */
  readonly missingCapabilities: readonly string[];
}

/**
 * Common shape of a client adapter. An adapter never fabricates an event it did not
 * observe; it reports `unsupported`/`degraded` instead (docs/28 "Client adapters").
 */
export interface ClientAdapterPort {
  readonly client: 'opencode' | 'codex';
  describeCapabilities(): Promise<CapabilityManifest>;
  /** Subscribe to native lifecycle events; the callback receives normalized envelopes. */
  subscribe(handler: (envelope: CaptureEnvelopeInput) => Promise<void>): Promise<() => void>;
  /** Install or verify the adapter without touching a developer's global configuration. */
  install(options: {
    readonly repositoryPath: string;
    readonly dryRun: boolean;
  }): Promise<Result<true>>;
}

export interface OpenCodeAdapterPort extends ClientAdapterPort {
  readonly client: 'opencode';
}

export interface CodexAdapterPort extends ClientAdapterPort {
  readonly client: 'codex';
}

// --- local store ------------------------------------------------------------

export interface SpooledRequest {
  readonly operationKey: string;
  readonly endpoint: string;
  readonly method: 'POST' | 'PUT' | 'DELETE';
  readonly idempotencyKey: string;
  readonly body: unknown;
}

/**
 * The local encrypted spool as seen by use cases. Implemented by `@shoo/local-store`;
 * the port hides SQLite and the AEAD envelope entirely.
 */
export interface LocalStorePort {
  appendCaptureEvent(envelope: CaptureEnvelopeInput): Promise<Result<{ readonly id: string }>>;
  enqueueRequest(request: SpooledRequest): Promise<Result<true>>;
  claimRunnableRequests(limit: number): Promise<readonly SpooledRequest[]>;
  markRequestSucceeded(operationKey: string): Promise<void>;
  markRequestFailed(operationKey: string, errorCode: string, retryable: boolean): Promise<void>;
  cachePolicy(projectId: ProjectId, version: number, policy: unknown): Promise<void>;
  readCachedPolicy(projectId: ProjectId): Promise<{ version: number; policy: unknown } | null>;
  /** Records whose ciphertext could not be authenticated; never silently discarded. */
  listQuarantined(): Promise<readonly { table: string; recordId: string; reason: string }[]>;
}

// --- MemWal / Walrus --------------------------------------------------------

export interface DurablePersistRequest {
  readonly operationKey: string;
  readonly revisionId: RevisionId;
  readonly namespace: string;
  readonly trustMode: 'manual' | 'managed';
  /** Already encrypted on the device; the cloud never sees plaintext (docs/32, docs/37). */
  readonly ciphertext: Uint8Array;
  readonly payloadHash: string;
  readonly schemaVersion: number;
}

export interface DurablePersistResult {
  readonly jobId: string;
  readonly blobLocator: string | null;
  readonly status: 'submitted' | 'persisted' | 'failed';
  readonly remoteSchemaVersion: number | null;
}

/**
 * MemWal Manual adapter.
 *
 * `reconcile` exists because a timed-out accepted job must be queried, never blindly
 * resubmitted (docs/29 "MemWal accepted job timeout").
 */
export interface MemWalPort {
  persist(request: DurablePersistRequest): Promise<Result<DurablePersistResult>>;
  reconcile(input: {
    readonly operationKey: string;
    readonly jobId: string | null;
  }): Promise<Result<DurablePersistResult>>;
  recall(input: {
    readonly namespace: string;
    readonly blobLocator: string;
  }): Promise<Result<{ readonly ciphertext: Uint8Array }>>;
  /** Compatibility check against the installed SDK/package versions. */
  describeCompatibility(): Promise<{
    readonly localVersion: number;
    readonly remoteVersion: number;
    readonly minSupported: number;
    readonly maxSupported: number;
  }>;
}

// --- embedding and retrieval ------------------------------------------------

export interface EmbeddingVector {
  readonly model: string;
  readonly modelVersion: string;
  readonly dimension: number;
  readonly values: readonly number[];
}

export interface EmbeddingPort {
  readonly model: string;
  readonly modelVersion: string;
  readonly dimension: number;
  embed(texts: readonly string[]): Promise<Result<readonly EmbeddingVector[]>>;
}

/**
 * Candidate retrieval. The port returns *candidates*; hard rules, ranking and budgeting
 * are domain concerns applied afterwards, so a provider swap cannot change authority
 * semantics (docs/30 "Scaling and fallback").
 */
export interface RetrievalPort {
  lexicalCandidates(input: {
    readonly request: RetrievalRequest;
    readonly query: string;
    readonly limit: number;
  }): Promise<readonly RetrievalCandidate[]>;
  semanticCandidates(input: {
    readonly request: RetrievalRequest;
    readonly vector: EmbeddingVector;
    readonly limit: number;
  }): Promise<readonly RetrievalCandidate[]>;
  structuredCandidates(input: {
    readonly request: RetrievalRequest;
    readonly limit: number;
  }): Promise<readonly RetrievalCandidate[]>;
  /** Watermark of the index the candidates came from, reported in the pack manifest. */
  indexWatermark(projectId: ProjectId): Promise<Instant>;
}

// --- extraction -------------------------------------------------------------

export interface ExtractionCandidate {
  readonly memoryType: string;
  readonly subjectType: string;
  readonly subjectKey: string;
  readonly content: Record<string, unknown>;
  readonly evidenceIds: readonly string[];
  readonly confidence: number;
}

/**
 * Narrow structured extraction (docs/30 "narrow structured extraction is more reliable
 * than general transcript summarization"). Output is always a *candidate*.
 */
export interface ExtractionPort {
  readonly extractorVersion: string;
  readonly modelVersion: string | null;
  extract(input: {
    readonly evidence: readonly {
      readonly id: string;
      readonly text: string;
    }[];
    readonly allowedMemoryTypes: readonly string[];
  }): Promise<Result<readonly ExtractionCandidate[]>>;
}

// --- request context --------------------------------------------------------

/** Everything a use case needs about the caller and the request it is serving. */
export interface RequestContext {
  readonly authorization: AuthorizationContext;
  readonly requestId: string;
  readonly correlationId: string;
  readonly idempotencyKey: string | null;
  readonly deviceId: DeviceId | null;
  readonly now: Instant;
}
