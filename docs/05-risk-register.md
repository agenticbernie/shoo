# Shoo Initial Risk Register

- Version: 1.9
- Status: Open
- Owner role: Technical Program Manager / Security Architect
- Dependencies: Current-State Audit; Assumption Ledger
- Assumptions: Probability and impact are qualitative until prototype evidence exists
- Unresolved questions: Technical maturity, research cohort, named readiness evidence and observed implementation outcomes
- Last decision: Gate 10 accepted ART-82 as the planning-closure guardrail without retiring RSK-081–084
- Next action: Confirm named allocation/consent/capability and rehearse Slice A, dataset and account-recovery duties; keep RSK-081–084 open until evidence exists

## Top five risks

| ID | Risk | Probability | Impact | Early indicator | Mitigation | Validation / exit criterion |
|---|---|---|---|---|---|---|
| RSK-001 | Automatic capture is incomplete, invasive, or inconsistent across agents. | High | Critical | Missing completion events; high opt-out; manual cleanup | Start with two audited clients; local redaction; explicit capture boundaries; graceful manual completion fallback | ≥90% eligible session outcomes captured in supported clients; privacy usability pass |
| RSK-002 | Extracted memory is wrong, stale, or promoted beyond its authority. | High | Critical | Frequent corrections; contradictions in resume packs | Narrow memory taxonomy; provenance; verification states; supersession; no auto-canonical high-impact decisions | Canonical accuracy threshold approved in Evaluation; stale exposure below agreed guardrail |
| RSK-003 | Context packs are noisy and do not improve continuation. | Medium-high | Critical | Users ignore context; agents repeat questions; token cost rises | Hybrid scoped retrieval; token budget; dependency/branch filters; relevance feedback | Statistically meaningful SCRR improvement over baseline/manual summary |
| RSK-004 | Security/privacy incident exposes source code, secrets, or sensitive session content. | Medium | Critical | Secret detections; unclear consent; overbroad access | Local filtering, deny patterns, encryption, least privilege, deletion/export, audit trail, threat model before beta | Security review passed; secret leakage tests pass; deletion SLA verified |
| RSK-005 | Mandatory MemWal/Walrus adds latency, cost, beta churn, and retention constraints. | High | High | Failed jobs; SDK/relayer incompatibility; restore failures; deletion expectation mismatch | Version pinning; compatibility checks; asynchronous outbox; reconciliation; retention disclosure; no hot-state dependency | Durable writes recover without losing coding progress; deletion/retention semantics pass legal and UX review |

## Secondary risks

| ID | Risk | Impact | Treatment |
|---|---|---:|---|
| RSK-006 | Native agent memory features reduce differentiation. | High | Compete on cross-agent provenance, canonical state, and portability; monitor market before each release gate. |
| RSK-007 | Unified product scope becomes too broad. | High | Enforce continuation-first goal and reject coordination features not required for the core loop. |
| RSK-008 | Solo users validate usage but not willingness to pay. | High | Test team expansion and buyer hypotheses after core value, without building team orchestration first. |
| RSK-009 | Permission model retrofit becomes expensive. | High | Include organization/project/member/source scopes in domain constraints from day one; expose only solo UX in MVP. |
| RSK-010 | Dual operational/durable persistence creates divergence. | Medium-high | Define source of truth, idempotency, reconciliation, and observable retry states during AICD. |
| RSK-011 | Q&A becomes a generic chatbot surface. | Medium | Limit Ask Shoo to project evidence, cite facts, label inference/suggestion, and refuse unsupported claims. |
| RSK-012 | Metrics become employee surveillance in team expansion. | High | Measure workflow latency and continuity only; prohibit individual productivity inference in policy and UI. |
| RSK-013 | OpenCode and Codex adapters produce semantically different event coverage. | High | Define a normalized event contract, capability matrix, per-client completeness scores, and explicit unsupported states. |
| RSK-014 | Predecessor dependency drift makes builds non-reproducible. | High | Replace `latest`, converge MemWal versions, add lockfile/compatibility CI, and stage migration behind adapter tests. |
| RSK-015 | Walrus deletion semantics conflict with SaaS privacy or contractual expectations. | Critical | Separate recall deletion from blob expiry, disclose retention, minimize durable payloads, encrypt where supported, and obtain legal review before beta. |
| RSK-016 | Shoo markets MemWal managed flow as end-to-end encrypted even though the managed relayer processes plaintext before SEAL encryption. | Critical | Record explicit trust mode; restrict R0 payloads; validate manual/self-hosted/TEE options; never make unsupported E2E claims. |
| RSK-017 | Shoo matches a session to the wrong work unit and contaminates future context. | Critical | Confidence threshold, explicit ambiguity choice, reassignment with audit trail, and context-pack invalidation. |
| RSK-018 | Checkpoint boundaries miss partial work or falsely imply completion. | High | Separate checkpoint from completion, preserve partial tails, and test crash/idle/compaction cases per client. |
| RSK-019 | Users ignore capture degradation and over-trust incomplete context. | High | Persistent but low-noise health indicator, pack completeness metadata, and failure-state usability testing. |
| RSK-020 | Policy-driven sync becomes configuration-heavy and blocks first value. | High | Opinionated safe defaults, progressive disclosure, policy preview, and project/team templates after validation. |
| RSK-021 | The “minimal” MVP remains too broad because trustworthy continuation crosses capture, Web, retrieval, operations, and Walrus. | Critical | Four vertical slices, early R0 proof, reduce depth before guardrails, and stop later slices when an earlier hypothesis fails. |
| RSK-022 | Reusing predecessor code preserves Kage/Sensei coupling and creates a renamed monolith rather than Shoo contracts. | High | Capability-by-capability reuse behind new contracts; no bulk rename; migration acceptance per slice. |
| RSK-023 | Shoo Web or Ask Shoo creates a parallel current-state projection inconsistent with agent context. | Critical | One resolver/retrieval/citation path and cross-surface consistency tests. |
| RSK-024 | “Team-ready” schema expands into premature organization, permission, and coordination infrastructure. | High | Explicit schema-only boundary, backlog audit, and reject team UI/services from MVP DoD. |
| RSK-025 | Requirement volume creates false confidence while the end-to-end continuation loop remains unproven. | Critical | Release by vertical evidence gates; stop later slices when R0/R1 fails; report coverage separately from outcome. |
| RSK-026 | Global security, data, UX, and reliability requirements become unowned between modules. | High | Assign one accountable owner per cross-cutting requirement at backlog creation; block orphan requirements. |
| RSK-027 | Future Coordination requirements leak into MVP through “schema-ready” implementation. | High | Mark SHOO-FR-301–307 not authorized; automated backlog audit; new scope gate required for re-entry. |
| RSK-028 | Deferred numeric thresholds are interpreted as optional quality. | High | Mandatory instrumentation, qualitative release guards, pre-registered Phase 9 method, and no R3 without approved thresholds. |
| RSK-029 | PRD accidentally constrains AICD to predecessor technologies or contracts. | Medium-high | Requirements specify behavior/evidence; Gate 5 decision matrices own APIs, consistency, stores, and topology. |
| RSK-030 | Modular monolith boundaries decay into a renamed Kage/Sensei monolith. | High | Enforce domain package dependencies, ports, architecture tests, and slice-by-slice strangler migration. |
| RSK-031 | PostgreSQL outbox/backlog causes durable or extraction lag without clear user truth. | High | Per-job watermark/SLO, worker leases, backpressure, visible lag, dead-letter and replay tests. |
| RSK-032 | MCP/client protocol changes break capture or context delivery. | High | Pin versions, capability manifests, conformance CI, supported range, compatibility quarantine. |
| RSK-033 | Local SQLite spool exposes restricted evidence or corrupts during crash/update. | Critical | OS key storage/application encryption, least retention, integrity checks, migrations, crash/fuzz tests. |
| RSK-034 | Managed MemWal plaintext processing violates customer, legal, or security expectations. | Critical | Trust-mode gate before R2, payload classification, DPA/legal review, manual/self-hosted spike, deny route if uncertain. |
| RSK-035 | User loses the Sui key required to decrypt Manual memories. | Critical | Wallet-signer default, explicit recovery readiness check, encrypted export/recovery guidance, no “setup complete” without recovery acknowledgement. |
| RSK-036 | Headless mode stores a powerful wallet key on a compromised developer machine. | Critical | Separate low-value Shoo Memory Wallet, OS vault, opt-in warning, no primary wallet key, revocable delegate and device removal flow. |
| RSK-037 | Application authorization and PostgreSQL RLS disagree, causing leakage or false denial. | Critical | Shared scope context, FORCE RLS, non-bypass runtime role, matrix tests, fail-closed transaction wrapper. |
| RSK-038 | Region/provider migration disrupts memory indexes or durable mappings. | High | PostgreSQL-portable schema, provider-neutral containers, tested backup/restore, no provider-specific truth semantics. |
| RSK-039 | Local embedding provider receives plaintext despite MemWal Manual relayer privacy. | Critical | Data-class policy, explicit provider disclosure, minimization, approved provider terms, and local-embedding option evaluation. |
| RSK-040 | Stored vectors leak semantic information across tenant or operator boundaries. | High | Treat vectors as sensitive metadata, RLS/access control, retention, no vector logs, inference testing. |
| RSK-041 | Repository or retrieved memory prompt-injects agents into unsafe MCP/API actions. | Critical | Treat content as untrusted data, independent schema/permission checks, human-bound high-impact confirmation, adversarial corpus. |
| RSK-042 | Compromised dependency or updater exfiltrates local project memory/keys. | Critical | Lockfiles, SBOM, provenance/signing, minimal dependencies, secure update verification, incident revocation path. |
| RSK-043 | Backup restore resurrects deleted tenant data. | Critical | Tombstone journal outside ordinary backup snapshot, restore-before-serve deletion replay, periodic deletion drills. |
| RSK-044 | Identity-provider semantics or outage leak into Shoo authorization and tenant ownership. | Critical | Internal subject/role mapping, RLS independent of provider claims, outage tests, export/migration path. |
| RSK-045 | Initial SLOs hide correctness failures by measuring only latency/availability. | Critical | Count stale, uncited, unauthorized and falsely complete responses as correctness failures; separate budgets. |
| RSK-046 | Cost estimates are wrong because retries, p95 users, embeddings or Walrus epochs dominate. | High | Per-operation meters, invoice reconciliation, sensitivity tests and optional-workload caps. |
| RSK-047 | Update signing or rollback failure compromises local keys/evidence. | Critical | Segmented signing keys, signed manifests/packages, tamper tests, rollback-safe spool/schema, revocation runbook. |
| RSK-048 | Shadow migration appears successful while authority/scope semantics differ. | Critical | Semantic golden fixtures, difference budget, quarantine ambiguity, no automatic canonical promotion. |
| RSK-049 | Work Unit is interpreted as duplicate task-management overhead. | High | Infer/link when confident, targeted ambiguity choice, terminology testing, no forced issue-tracker workflow. |
| RSK-050 | Wallet and Durable Memory setup causes abandonment before first value. | Critical | Staged/resumable onboarding, local progress preserved, round-trip test and explicit recovery guidance. |
| RSK-051 | Multiple independent status dimensions overwhelm users or produce false reassurance. | Critical | Priority hierarchy, progressive detail, comprehension tests, no aggregate success badge. |
| RSK-052 | Ask Shoo becomes visually and behaviorally indistinguishable from a generic chatbot. | High | Evidence-report layout, project scope bar, labelled facts/inferences/suggestions/limits, refusal outside evidence. |
| RSK-053 | Minimal Web scope expands through disabled/future coordination navigation. | High | Hide Flow routes entirely until new scope gate; enforce UX/backlog audit. |
| RSK-054 | Technical simplification hides Walrus retention, cloud embedding or key-loss boundaries. | Critical | Outcome-first copy plus mandatory technical disclosure at consent/impact points; comprehension test. |
| RSK-055 | Accessibility defects block terminal/Web recovery or high-impact confirmation. | High | WCAG 2.2 AA target, CLI plain-text mode, keyboard/screen-reader critical-flow tests. |
| RSK-056 | Visual polish obscures evidence/state limitations or makes durable look canonical. | Critical | Independent semantic components, state-comprehension tests, no aggregate success badge. |
| RSK-057 | Candidate palette fails contrast or color-vision distinction in rendered themes. | Critical | Semantic labels/icons, measured contrast, grayscale and color-vision testing before token lock. |
| RSK-058 | Font loading or Vietnamese glyph behavior creates performance/readability defects. | High | Bundle/subset evaluation, system fallback, long-text and cross-platform rendering tests. |
| RSK-059 | Evidence density turns Pulse/Ask into noisy expert-only screens. | High | Reading-width limits, prioritized exceptions, progressive Source Drawer and realistic-density usability tests. |
| RSK-060 | Dark mode drifts into neon AI styling and weakens calm hierarchy. | Medium-high | Theme-specific token review, accent budgets and visual regression. |
| RSK-061 | Future Coordination component specs are mistaken for MVP authorization. | High | Explicit lineage-only labels, bundle/backlog/route audit and Gate 3 scope enforcement. |
| RSK-062 | Monorepo boundaries erode and recreate a renamed predecessor monolith. | Critical | Import graph/public export/table-owner tests; semantic packages; no shared-utils dump. |
| RSK-063 | Framework/ORM convenience bypasses explicit authorization, RLS or contract semantics. | Critical | Adapter/application boundaries, authored SQL, composition spike and security review. |
| RSK-064 | Cross-platform Local packaging/encrypted SQLite delays or compromises Slice A. | Critical | Timeboxed SPIKE-01/03, OS vault/store ports, fail-closed fallback and scope reduction trigger. |
| RSK-065 | 18–26 week roadmap is mistaken for commitment without team/capacity evidence. | High | Range labelled hypothesis; authorize one tranche; reforecast after Slice A/B throughput. |
| RSK-066 | Component/platform work reports progress while continuation outcome remains incomplete. | Critical | Vertical-slice DoD, real journey demos and stop gates; no component-only release progress. |
| RSK-067 | Test suite grows slow/flaky and teams bypass critical gates. | High | Pyramid, CI budget, flake ownership/expiry, critical-test no-waiver rules. |
| RSK-068 | Broad backlog authorization causes Web/beta work before capture/resume proof. | Critical | Gate 8 authorizes Slice A only; later tranches require exit evidence. |
| RSK-069 | Provider/test secrets or wallets leak through CI/developer environments. | Critical | Isolated test tenants/wallets, secret store, no production data, content-safe fixtures and scans. |
| RSK-070 | Docker is treated as sufficient isolation for Local wallets/vaults and broad host mounts. | Critical | Host package default; constrained optional headless container; prohibit wallet/vault/home-directory mounts. |
| RSK-071 | Application-level encryption is implemented incorrectly or omits sensitive fields. | Critical | Reviewed libsodium AEAD wrapper, field allowlist/denylist, tamper/known-answer tests, crypto owner approval. |
| RSK-072 | Minimal plaintext SQLite metadata enables project/activity inference after file theft. | High | Opaque IDs, coarse time, no paths/content, metadata threat review, optional SQLCipher defense. |
| RSK-073 | Bernie becomes account, architecture, release and incident single point of failure. | Critical | Organization accounts, hardware MFA, deputies, two break-glass admins, recovery drills and no key sharing. |
| RSK-074 | User-owned memory is used to disclaim Shoo's authorization, encryption or legal responsibilities. | Critical | Explicit shared-responsibility model, safe-policy floor, disclosures, DPA/legal review and incident duties. |
| RSK-075 | Latest dependency pins are adopted without compatibility/security validation. | High | Initial snapshot only; lockfile/CI matrix/SBOM; version PRs and no `latest`. |
| RSK-076 | SCRR is misclassified or instrumented invasively, creating false claims or privacy harm. | Critical | Minimal event dictionary, sampled consent, evaluator agreement ≥0.70, independent privacy review. |
| RSK-077 | Small self-selected/Web3-native cohorts overstate activation and durability value. | High | Recruit mixed client/Web3 experience, report sponsor separately, disclose cohort and uncertainty. |
| RSK-078 | Synthetic gold data rewards benchmark tuning but misses long-lived repository failures. | Critical | Sealed partition, consented real samples, versioned drift review and worst-slice reporting. |
| RSK-079 | Delivery owners weaken thresholds after seeing poor results. | Critical | Pre-registration, blinded/sealed scoring, ADR for changes, post-unblinding changes cannot pass same gate. |
| RSK-080 | Aggregate quality hides critical stale, secret or cross-tenant failures. | Critical | Zero-tolerance gates and critical-type slices override averages. |
| RSK-081 | Treating 1.5 FTE/person as sustainable overcommits dates and removes recovery/review capacity. | Critical | Cap baseline at 1.0/person, apply allocation/focus factors, track surge separately and reforecast from throughput. |
| RSK-082 | Role-title fit is mistaken for security/evaluation competence. | Critical | Capability assessment, explicit consent, rehearsals, two-reviewer controls and external AppSec review trigger. |
| RSK-083 | Dataset custody, release privilege and break-glass access concentrate in DevOps. | High | Separate authorization scopes, immutable audit, two-person unseal, no automatic wallet/dataset access from emergency-admin role. |
| RSK-084 | Planning closure is mistaken for product validation, date commitment or authorization for the full roadmap. | Critical | Gate 10 wording limits authorization to repository skeleton, approved spikes and Slice A; public claims, production launch, Team Coordination and external dates require evidence and later gates. |

## Trade-off posture

- Favor trust over capture volume.
- Favor a narrow supported-client matrix over nominal universal compatibility.
- Favor inspectable citations over fluent unsupported answers.
- Favor local degradation and queued persistence over blocking coding work on cloud or Walrus availability.
- Favor reversible adapter boundaries over early infrastructure lock-in.
