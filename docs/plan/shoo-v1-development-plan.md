# Kế Hoạch Phát Triển Shoo v1

- **Trạng thái:** Sẵn sàng triển khai theo Gate 10
- **Phạm vi:** MVP beta cho một developer, OpenCode → Codex
- **Nguồn chuẩn:** `docs/17`, `docs/66–70`, `docs/81–83`
- **Tệp kế hoạch:** `docs/plan/shoo-v1-development-plan.md`

## 1. Mục Tiêu Và Kết Quả

Shoo v1 phải cho phép một developer:

1. Kết nối một project và capture phiên OpenCode theo policy an toàn.
2. Tạo checkpoint có provenance, authority và trạng thái durability trung thực.
3. Resume cùng work unit trong Codex bằng context pack có citation, giới hạn token và kiểm tra quyền.
4. Kiểm tra, sửa hoặc supersede memory trong Shoo Web.
5. Nhận context và câu trả lời Ask Shoo không sử dụng memory đã lỗi thời hoặc bị sửa.

MVP chỉ được xem là hoàn thành khi có bằng chứng end-to-end, không chỉ khi màn hình, endpoint hoặc package đã tồn tại.

## 2. Phạm Vi Theo Release

### Phase 0 — Implementation Readiness

**Thời lượng:** 5 ngày làm việc, không phải thời gian giao MVP.

- Xác nhận allocation, owner/deputy, năng lực và consent của từng workstream.
- Tạo monorepo `pnpm + Turborepo`, package boundaries và GitHub Actions walking skeleton.
- Chạy spike encrypted local spool trên Windows, macOS và Linux; chốt R0 platform boundary.
- Chạy MemWal Manual account, namespace, delegate, remember/recall/restore với test namespace.
- Tạo OpenCode-first và Codex-second capability fixtures, normalized event fixtures và idempotency cases.
- Lập inventory Kage/Sensei; chỉ reuse code sau khi mapping với Shoo contract.
- Chuẩn bị Slice A demo path, failure rubric, privacy-safe telemetry dictionary và evidence board.
- Kết thúc bằng quyết định `GO`, `CONDITIONAL GO` hoặc `NO-GO`.

**Điều kiện GO:** Có owner/deputy; repository và CI skeleton reproducible; local encryption path đáng tin cậy; các contract/failure fixtures đã chạy; không còn rủi ro critical về secret, tenant, authority hoặc key custody.

### Slice A — Trusted Project Start And Capture

**Thời lượng:** 4–6 tuần.

- Sign-in, project link, trusted-project check và policy preview.
- CLI `init/connect/status`, OpenCode adapter, session detection và client capability manifests.
- Normalized session/event envelope với duplicate, reorder và idempotency semantics.
- Local capture policy, secret/path exclusion, content-safe tracing và audit diagnostics.
- Encrypted SQLite spool, crash/restart recovery, offline capture và idempotent reconciliation.
- PostgreSQL identity, project, session, work-unit, checkpoint và outbox baseline với FORCE RLS.
- Structured checkpoint candidate gồm objective, progress, files, tests, uncertainty và source references.

**Exit:** Một structured checkpoint chạy được từ supported client hoặc fixture; prohibited data không rời local scope; duplicate, reorder, offline, crash và cross-tenant tests đạt; cross-agent path kỹ thuật có thể tái lập.

### Slice B — Trusted Checkpoint And Durable Confirmation

**Thời lượng:** 4–6 tuần.

- Event normalization, typed memory extraction, provenance, confidence và authority state.
- Atomic aggregate/event/outbox transaction.
- Memory, evidence, revision, conflict, durable mapping và job lifecycle schemas.
- Outbox lease, retry, dead-letter, reconciliation và cost/SLO telemetry.
- Wallet signer, user-owned namespace, constrained delegate, revocation, key-loss và recovery UX.
- MemWal Manual adapter, local encryption/embedding và Walrus remember/recall/restore round trip.

**Exit:** Operational, queued, verified durable và canonical states được phân biệt; durable outage không làm mất hoặc chặn local work; restore không tự động canonicalize; invalid delegate, poison job, provider outage và key loss có recovery path.

### Slice C — Cross-Agent Continuation

**Thời lượng:** 4–6 tuần.

- Work-unit matching và targeted ambiguity choice.
- Current-truth resolver cho authority, supersession, conflict, scope và permission.
- Structured filtering trước FTS/pgvector retrieval và versioned ranking configuration.
- Token-bounded context pack với mandatory sections, limitations, freshness/completeness manifest và citation manifest.
- Codex MCP/session/resume/context interfaces cùng current/previous compatibility fixtures.
- Delivery-time authorization, prompt-injection fixtures và invalidation khi correction/supersession/permission thay đổi.
- SCRR, repeated-context, context recovery time và continuation funnel telemetry.

**Exit:** Codex resume đúng work unit với context current, scoped, authorized và cited; stale/superseded/conflict/durable-outage cases an toàn; first useful action và các R1/R2 quality thresholds đạt.

### Slice D — Inspect, Correct And Ask Shoo

**Thời lượng:** 4–6 tuần.

- Web shell, Pulse, Work detail, Activity, Decisions và Memory Explorer.
- Source Drawer hiển thị provenance, không mặc định mở raw transcript.
- Correction preview với expected version, audit, supersession, conflict resolution và cache invalidation.
- Ask Shoo evidence report phân biệt facts, inferences, suggestions và limitations; mọi factual claim có citation hoặc uncertainty.
- Policy/access configuration, Clerk adapter, export/delete/retention operation previews.
- Design tokens, responsive behavior, light/dark, keyboard, screen reader và các trạng thái offline/stale/conflict/denied.

**Exit:** Người dùng hoàn thành inspect → source → correction → resume; memory đã sửa không còn xuất hiện như current truth; Ask Shoo không fabricates unsupported truth; RLS, permission, accessibility và state comprehension tests đạt.

### Slice E — Beta Hardening And MVP Release

**Thời lượng:** 2–4 tuần sau Slice D, cộng thời gian xử lý defect.

- Signed Shoo Local update, rollback và compatibility manifest.
- Backup/PITR/tombstone restore rehearsal.
- Export, deletion, uninstall và delegate revoke end-to-end.
- Error-budget dashboards, alerts, support diagnostics và incident runbooks.
- Cost/entitlement reconciliation không ảnh hưởng privacy, correction hoặc export.
- Security, accessibility, migration, recovery và beta cohort review.

**MVP exit:** Đạt ngưỡng R3 trong `docs/78`, gồm tối thiểu 200 eligible resumes và 20 external users; SCRR, citation, canonical precision, capture completeness, correction burden và durability đạt; critical stale, cross-tenant, secret và key errors bằng `0`.

## 3. Kiến Trúc Triển Khai

Tạo monorepo theo target architecture trong `docs/63`:

```text
apps/web       # Shoo Web UI
apps/api       # HTTP/MCP gateway và domain commands/queries
apps/worker    # extraction, indexing, outbox, durable jobs, reconciliation
apps/local     # CLI, daemon, adapters, policy, encrypted spool
packages/contracts/{http,mcp,events}
packages/domain/{identity,continuity,memory,intelligence,platform}
packages/application
packages/{db-postgres,local-store,auth-clerk,adapter-opencode,adapter-codex}
packages/{adapter-memwal,embedding,retrieval,observability,ui,design-tokens}
fixtures/{contracts,retrieval-gold,security,migration}
tooling/{architecture-tests,release,dev}
```

Dependency direction bắt buộc:

```text
contracts → domain → application → adapters/apps
design-tokens → ui
```

Domain không được import app, database, Clerk, MCP SDK, provider SDK hoặc framework. Web chỉ gọi API, không truy cập PostgreSQL trực tiếp. Không tạo microservice, broker hoặc dedicated vector database mới trong MVP nếu chưa có trigger và ADR.

Technology baseline: TypeScript + Node LTS, PostgreSQL + pgvector, authored SQL migrations, Kysely-style typed SQL, PostgreSQL outbox, Clerk adapter, MemWal Manual và Walrus. Version cụ thể chỉ pin sau compatibility review; không dùng `latest`.

## 4. Kiểm Thử Và Evidence

Mỗi story phải có outcome, non-goal, failure behavior, test reference, owner, observability, cost impact và rollback/recovery approach.

Test layers:

- Static/architecture: types, imports, schemas, tokens, forbidden scope và public exports.
- Unit/property: domain invariants, policy, ordering, ranking và resolver.
- Component/adapter: local store, provider doubles, worker và UI state matrix.
- Contract: HTTP, MCP, events, provider và current/previous compatibility.
- Integration: PostgreSQL/RLS/pgvector/SQLite và isolated provider sandboxes.
- Journey E2E: capture, durable checkpoint, cross-agent resume, correction, export/delete.
- Resilience/security: crash, outage, restore, tamper, prompt injection, secret scan và tenant isolation.
- Evaluation: SCRR, relevance, citation, canonical accuracy, correction burden và user comprehension.

Bắt buộc kiểm chứng các invariants:

- Duplicate/out-of-order events hội tụ mà không mất evidence.
- Session completion không đồng nghĩa work completion.
- Durable confirmation không đồng nghĩa canonical authority.
- Conflict không tự resolve theo recency hoặc ranking.
- Correction/supersession/permission invalidates cached context.
- Cloud/MemWal outage không chặn local coding/capture.
- Prompt, source, path, secret và wallet material không xuất hiện trong telemetry.
- Không có cross-tenant, private-key hoặc canonical-truth leakage.

## 5. Ownership Và Governance

- Backend developer: accountable Slice A owner; DevOps deputy.
- Bernie: initial Local/OpenCode trust owner; backend deputy và transfer trước Slice B.
- Cryptography/backend developer: Durable Memory và security owner; DevOps security deputy.
- BA/frontend developer: evaluation owner; frontend deputy.
- DevOps: release/recovery owner và sealed-dataset custodian.
- Bernie và DevOps: break-glass administrators; private keys không được dùng chung.

Không cam kết external date trước khi có allocation thực tế và tối thiểu hai tuần throughput/blocker evidence. Mỗi slice phải demo được một happy path và một failure/recovery path. Thay đổi contract, authority, security semantics, UX state grammar hoặc MVP scope phải qua review/ADR tương ứng.

## 6. Không Thuộc v1

Không triển khai trong kế hoạch này:

- Team invitations, team blockers, dependency/critical-path workflow hoặc human handoff.
- Autonomous coordination và các agent client ngoài OpenCode/Codex.
- Mobile support, broad third-party integrations, billing self-service đầy đủ.
- Production predecessor-data migration hoặc uncontrolled code import.
- Multi-region, external broker, dedicated vector database hoặc microservice extraction.
- Public PMF claim, unrestricted real-user capture hoặc production launch trước các release gates.

## 7. Giả Định Và Cách Đo

- Planning envelope là 18–26 tuần với khoảng 4.0–4.8 effective delivery FTE; đây không phải commitment.
- Shoo Local là signed host package; headless container không được tuyên bố có OS-vault/wallet-signer parity.
- Test data là synthetic, multi-tenant và có canary secrets; không dùng production transcript.
- SCRR là north-star metric; telemetry chỉ lưu state, timing, count và opaque IDs, không lưu prompt/source/code.
- Threshold chỉ được thay đổi trước khi unblind evaluation window và phải có ADR.

## 8. Tài Liệu Tham Chiếu

- MVP và release boundary: `docs/17-mvp-definition-and-release-boundaries.md`
- Roadmap: `docs/66-vertical-slice-roadmap-and-release-plan.md`
- Backlog: `docs/67-implementation-backlog-epics-stories-and-tasks.md`
- Testing: `docs/69-implementation-testing-strategy.md`
- Governance: `docs/70-program-governance-definition-of-done-and-ownership.md`
- Readiness: `docs/81-implementation-readiness-capacity-ownership-and-recovery-proposal.md`, `docs/82-planning-closure-and-implementation-readiness-checklist.md`, `docs/83-implementation-readiness-week.md`
- Metrics and thresholds: `docs/73-product-metrics-and-measurement-model.md`, `docs/78-success-thresholds-and-calibration-plan.md`
