# Shoo Feature Inventory

- Version: 0.2
- Status: Accepted — Decision Gate 3
- Owner role: Principal Product Manager / Staff Software Architect
- Dependencies: Product Scope; Phase 2 JTBD and scenario workflows
- Assumptions: Feature IDs describe product capabilities, not final service or package boundaries
- Unresolved questions: Exact authentication method; client packaging; model/provider choices
- Last decision: Sponsor approved feature classifications and MVP inclusion boundaries
- Next action: Assign requirement IDs and acceptance criteria in Phase 4

## Classification vocabulary

- **Core:** Required to complete the MVP continuation loop.
- **Supporting:** Improves usability/trust but is not independently differentiating.
- **Differentiating:** Materially separates Shoo from files, transcripts, or vector-memory wrappers.
- **Operational:** Required to run the Commercial SaaS safely and reliably.
- **Future:** Valuable after core validation.
- **Reject:** Conflicts with Product Goal, principles, or MVP evidence strategy.

## Foundation and trust

| ID | Feature | Class | MVP | Traceability |
|---|---|---|---:|---|
| FND-001 | Commercial SaaS sign-in/session | Operational | Yes | Scenario 1 precondition; privacy and tenant isolation |
| FND-002 | Link local repository to Shoo project identity | Core | Yes | JTBD-001; Scenario 1 start |
| FND-003 | OpenCode/Codex/MCP connectivity and capture-health diagnostics | Differentiating | Yes | RSK-001, RSK-019; Journey A |
| FND-004 | Solo project isolation with team-ready scope identifiers | Operational | Yes | Principle 4/9; Scenario 2 readiness |
| FND-005 | Effective sync-policy preview and exclusions | Supporting | Yes | JTBD-004; ADR-PROD-014 |

## Work and session continuity

| ID | Feature | Class | MVP | Traceability |
|---|---|---|---:|---|
| WRK-001 | Create, infer, select, and reassign work unit | Core | Yes | ADR-PROD-010; JTBD-001 |
| WRK-002 | Session lifecycle tracking independent from work-unit state | Differentiating | Yes | ADR-PROD-012; Scenario 1 |
| WRK-003 | Work-unit state and unfinished-work representation | Core | Yes | JTBD-001/002; Project overview |
| WRK-004 | Interrupted/degraded session recovery | Core | Yes | Journey C; edge-case baseline |
| WRK-005 | Optional branch/worktree/external-issue links | Supporting | Partial | Context relevance; no issue tracker dependency |

## Capture and checkpoint

| ID | Feature | Class | MVP | Traceability |
|---|---|---|---:|---|
| CAP-001 | OpenCode event adapter | Core | Yes | ADR-PROD-007; Scenario 1 capture |
| CAP-002 | Codex lifecycle-hook adapter | Core | Yes | ADR-PROD-007; cross-agent resume |
| CAP-003 | Shoo normalized evidence envelope | Differentiating | Yes | Agent map; multi-client capability gaps |
| CAP-004 | Local exclusions, secret detection, redaction, and local-only routing | Operational | Yes | RSK-004; ADR-PROD-014 |
| CAP-005 | Hybrid semantic checkpoint triggers | Differentiating | Yes | ADR-PROD-011; JTBD-002 |
| CAP-006 | Explicit checkpoint and outcome correction | Supporting | Yes | Failure recovery; user control |
| CAP-007 | Capture completeness/capability manifest | Differentiating | Yes | RSK-019; trust journey |

## Structured memory and authority

| ID | Feature | Class | MVP | Traceability |
|---|---|---|---:|---|
| MEM-001 | Narrow extraction: work state, decision, code reference, test, blocker, summary, artifact | Core | Yes | MVP taxonomy; JTBD-002 |
| MEM-002 | Evidence and provenance on every candidate | Differentiating | Yes | Principle 9; Ask Shoo citations |
| MEM-003 | Observed/candidate/verified/accepted/canonical authority states | Differentiating | Yes | ADR-PROD-005/013 |
| MEM-004 | Correction, restriction, supersession, and lineage | Differentiating | Yes | JTBD-004; Journey B |
| MEM-005 | Basic contradiction detection within work unit/branch | Core | Yes | MVP boundary; stale/conflict cases |
| MEM-006 | Full team conflict-resolution workflow | Future | No | Scenario 2 expansion |

## Synchronization and durable memory

| ID | Feature | Class | MVP | Traceability |
|---|---|---|---:|---|
| SYN-001 | Operational sync outbox and acknowledgements | Core | Yes | Offline/degraded workflow |
| SYN-002 | Versioned policy routing: local, operational, durable, shared | Differentiating | Yes | ADR-PROD-009/014 |
| SYN-003 | MemWal remember/bulk job adapter and durable metadata | Core | Yes | Mandatory Walrus constraint |
| SYN-004 | Durable retry, reconciliation, compatibility, and status | Operational | Yes | RSK-005; MemWal beta |
| SYN-005 | Restore/re-index recovery path | Operational | Yes | Durable recovery acceptance |
| SYN-006 | Full team promotion/sharing policy UI | Future | No | Scenario 2/Journey D |

## Retrieval, context, and resume

| ID | Feature | Class | MVP | Traceability |
|---|---|---|---:|---|
| RET-001 | Structured filters by project/work unit/branch/type/status/visibility | Core | Yes | Principle 3; Scenario 3 |
| RET-002 | Semantic retrieval over eligible memory | Supporting | Yes | Recall capability; not sufficient alone |
| RET-003 | Authority, supersession, recency, source, and task-aware ranking | Differentiating | Yes | HYP-MVP-002/003 |
| RET-004 | Token-bounded context-pack builder | Core | Yes | JTBD-001; SCRR |
| RET-005 | Citation/pack manifest with freshness and completeness | Differentiating | Yes | Trust and correction journey |
| RES-001 | Likely work-unit matching and targeted ambiguity choice | Core | Yes | RSK-017; session start |
| RES-002 | OpenCode-to-Codex resume delivery | Core | Yes | Primary MVP outcome |
| RES-003 | Resume feedback and manual-recap signal | Operational | Yes | SCRR evaluation |

## Shoo Web and Ask Shoo

| ID | Feature | Class | MVP | Traceability |
|---|---|---|---:|---|
| WEB-001 | Project overview/current state | Supporting | Yes | Scenario 3; governance |
| WEB-002 | Recent activity and session timeline | Supporting | Yes | JTBD-002/003 |
| WEB-003 | Current decisions with supersession state | Differentiating | Yes | Decision visibility |
| WEB-004 | Unfinished work and resume recommendation | Core | Yes | JTBD-001 |
| WEB-005 | Source drawer, memory inspection, correction, restriction | Differentiating | Yes | JTBD-004 |
| WEB-006 | Policy/capture settings and durable status | Operational | Yes | Trust and degraded behavior |
| ASK-001 | Project-question intent and scope resolution | Supporting | Yes | Scenario 3 |
| ASK-002 | Cited answer with fact/inference/suggestion separation | Differentiating | Yes | JTBD-003; anti-chatbot boundary |
| ASK-003 | General-purpose assistant behavior | Reject | No | Anti-goal |

## Operability and evaluation

| ID | Feature | Class | MVP | Traceability |
|---|---|---|---:|---|
| OPS-001 | Audit events for capture, policy, authority, sync, and correction | Operational | Yes | Security/provenance |
| OPS-002 | Pipeline health and failure observability | Operational | Yes | Capture/durable risk |
| OPS-003 | SCRR, recovery-time, relevance, citation, correction telemetry | Operational | Yes | North Star/evaluation |
| OPS-004 | Export, recall deletion, retention-state disclosure | Operational | Yes | Privacy; Walrus semantics |
| OPS-005 | Billing and subscription enforcement | Operational | Limited beta | Commercial SaaS; not core hypothesis |

## Future team and coordination

| ID | Feature | Class | MVP | Traceability |
|---|---|---|---:|---|
| TEAM-001 | Organizations, teams, invitations, and role administration | Future | No | Scenario 2 |
| TEAM-002 | Personal-to-project memory promotion UX | Future | No | Journey D |
| TEAM-003 | Cross-member handoff packs | Future | No | JTBD-005 |
| COORD-001 | Dependency graph | Future | No | Scenario 4 |
| COORD-002 | Blocker classification and impact | Future | No, schema only | Scenario 4 |
| COORD-003 | Parallel-work recommendations | Future | No | Scenario 4 |
| COORD-004 | Team pace and critical path | Future | No | Principle 6 |

## Inventory rule

An `MVP = Yes` label means the capability is required before MVP completion, not that every advanced configuration, visualization, integration, or team mode for that capability is included.
