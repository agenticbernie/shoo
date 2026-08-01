# PRD — Shoo Memory

- Version: 0.2
- Status: Accepted — Decision Gate 4
- Owner role: AI Systems Architect / Data Architect / Principal Product Manager
- Dependencies: PRD Overview; Memory Lifecycle; Safe Sync Policy; Feature Inventory
- Assumptions: Narrow extraction can reach acceptable correction burden; raw transcripts remain evidence, not primary memory
- Unresolved questions: Verification rules per memory type; extraction model/evaluation thresholds
- Last decision: Sponsor approved Memory requirements and taxonomy
- Next action: Define schemas, resolver rules, persistence classes, and extraction interfaces in Phase 5

## Executive summary

Shoo Memory converts normalized evidence and checkpoints into structured, source-backed memory while preserving authority, visibility, correction, conflict, policy, and durable eligibility. It prevents plausible agent output from silently becoming project truth.

## Goals

- Extract only memory types required for continuation.
- Preserve provenance and source quality.
- Support verification, acceptance, canonicalization, correction, and supersession.
- Route data according to safe sync policy.
- Keep durable persistence asynchronous and observable.

## Non-goals

- Full transcript as canonical knowledge.
- Open-ended personal memory taxonomy.
- Automatic canonical high-impact decisions.
- Team conflict-resolution workflow in MVP.

## MVP memory taxonomy

- work-unit state and unfinished work;
- accepted decision and rationale;
- code-change/artifact reference;
- test result;
- blocker;
- session/checkpoint summary;
- source/artifact reference.

## Functional requirements

| ID | Requirement | Priority | Acceptance criteria | Trace |
|---|---|---|---|---|
| SHOO-FR-101 | Shoo shall normalize supported client evidence into a versioned event envelope. | P0/B | OpenCode/Codex fixtures map to one schema with explicit unsupported fields and original source retained. | PROB-01/02; GOAL-02/03; SCN-01; CAP-003; TC-MEM-001 |
| SHOO-FR-102 | Shoo shall deduplicate events and preserve source/ingestion ordering metadata. | P0/B | Duplicate/reordered fixtures converge without duplicate memory and retain both time dimensions. | PROB-02; GOAL-02/03; SCN-01; CAP-003; TC-MEM-002 |
| SHOO-FR-103 | Shoo shall extract candidates only from the approved MVP taxonomy. | P0/B | Extraction fixture produces permitted types; unsupported types remain evidence/backlog, not new canonical categories. | PROB-03; GOAL-02; SCN-01; MEM-001; TC-MEM-003 |
| SHOO-FR-104 | Every memory candidate shall link organization/team/project/developer/agent/session/work unit/branch/source/time/confidence where applicable. | P0/B | Schema validation rejects unscoped candidate and accepts explicit not-applicable/not-supported states. | PROB-01/04; GOAL-03; SCN-01/02; MEM-002; TC-MEM-004 |
| SHOO-FR-105 | Shoo shall distinguish observed, candidate, verified, accepted, canonical, historical, rejected, restricted, and superseded states. | P0/B | Lifecycle test allows only defined transitions and shows state/source to consumers. | PROB-03; GOAL-03; SCN-01/03; MEM-003; TC-MEM-005 |
| SHOO-FR-106 | Deterministic evidence rules may verify low-impact observations; high-impact decisions require authorized acceptance before canonical status. | P0/B | Test output/file-reference rules verify scoped observation; agent decision remains proposed until authorized. | PROB-03; GOAL-03; SCN-01; MEM-003; TC-MEM-006 |
| SHOO-FR-107 | User shall correct, restrict, reject, or supersede a memory with impact preview and preserved lineage. | P0/D | Correction fixture creates successor/state change, invalidates affected packs, and preserves history subject to policy. | PROB-03; GOAL-03/05; SCN-01/03; MEM-004; TC-MEM-007 |
| SHOO-FR-108 | Shoo shall detect direct contradictions among eligible current candidates in the same relevant scope. | P0/B | Conflicting decision/test fixtures create unresolved conflict; recency alone does not resolve it. | PROB-03/04; GOAL-03; SCN-01/02; MEM-005; TC-MEM-008 |
| SHOO-FR-109 | Shoo shall exclude superseded/rejected/restricted memories from current truth unless explicitly requested and permitted as history. | P0/C | Current query omits superseded claim; history query returns lineage with status. | PROB-03; GOAL-03/05; SCN-03; MEM-003/004; TC-MEM-009 |
| SHOO-FR-110 | Shoo shall evaluate a versioned routing policy for local-only, operational, durable, shared, or denied outcomes. | P0/B | Default policy routes raw transcript/source local, structured operational state cloud, accepted durable types to queue, secrets denied. | PROB-03/04; GOAL-03/04; SCN-01/02; SYN-002; TC-MEM-010 |
| SHOO-FR-111 | Durable eligibility shall be independent of memory authority and visibility. | P0/B | Accepted local-only decision is not durable; durable historical memory is not current; visibility does not imply authority. | GOAL-03/04; SCN-01/02; SYN-002; TC-MEM-011 |
| SHOO-FR-112 | Shoo shall expose extraction confidence, verification state, source quality, and correction history to retrieval and Web consumers. | P1/D | Source drawer and ranking fixture receive all required fields. | PROB-03; GOAL-03/05; SCN-03; MEM-002/003/004; TC-MEM-012 |

## Data requirements

Minimum memory fields:

- memory ID and schema version;
- type and structured payload;
- organization/team/project/developer/agent/session/work-unit scope;
- branch/worktree and optional artifact/file/commit/test references;
- evidence references;
- source, source time, ingestion time, extraction time;
- confidence and verification method/status;
- authority and accepted-by identity;
- visibility and policy version;
- durability eligibility/status/reference;
- supersedes/superseded-by/conflict relationships;
- retention/deletion state.

## Non-functional requirements

- Extraction failure must not discard evidence or checkpoint.
- Reprocessing the same evidence under the same extractor/version must be idempotent.
- Extractor and rule versions must be retained for evaluation and rollback.
- Memory projection must be rebuildable from evidence/lineage within retained policy boundaries.

## UX requirements

- Candidate/verified/accepted/canonical states use plain-language explanations.
- Correction is available from context item, source drawer, and Ask response.
- Conflict view shows sources and scope without declaring a winner.
- The UI must not equate “stored on Walrus” with “true,” “shared,” or “encrypted.”

## Telemetry

- candidates by type/source/client;
- extraction success/failure/latency;
- verification and acceptance transitions;
- correction/rejection/supersession rate;
- conflict detection/dismissal;
- policy route counts without raw content;
- durable eligibility and later outcome.

## Security requirements

- Local policy/secret filtering precedes cloud extraction where policy requires.
- Restricted evidence cannot be exposed through derived explanations.
- High-impact mutations require reauthorization and audit.
- Sensitive durable content is denied/quarantined until effective encryption/retention policy permits it.

## Rollout

- R0: checkpoint summary, work state, decision, code/test reference with provenance.
- R1: full MVP taxonomy, conflict fixtures, correction/supersession.
- R2: Web authority/correction UX and policy comprehension.
- R3: calibrated extraction/accuracy thresholds from Phase 9.

## Risks

- Taxonomy grows from every agent output.
- Confidence is mistaken for authority.
- Correction burden outweighs value.
- Evidence retention conflicts with privacy.
- Durable status is presented as truth.

## Open questions

- Per-type deterministic verification rules.
- Extraction provider/model and fallback are deferred to AICD/evaluation.
- Correction authority for future team scopes.
