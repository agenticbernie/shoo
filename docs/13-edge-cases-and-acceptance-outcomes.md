# Shoo Edge-Case Catalogue and Acceptance Outcomes

- Version: 0.2
- Status: Accepted — Decision Gate 2
- Owner role: Principal Product Manager / QA Architect / Security Architect
- Dependencies: Scenario Workflows; Lifecycle Models; Risk Register
- Assumptions: Detailed numeric thresholds belong to the Evaluation Framework after baseline measurement
- Unresolved questions: Legal retention requirements; supported offline duration; capture-completeness rubric
- Last decision: Sponsor approved recoverable and explainable failure behavior as the acceptance baseline
- Next action: Trace Phase 3 features and later PRD requirements to these outcomes

## Cross-scenario edge cases

| State | Expected behavior | Prohibited behavior | Validation evidence |
|---|---|---|---|
| Empty project | Explain no prior memory; offer new work unit | Invent project state | Empty-state usability test |
| Partial capture | Label missing interval/source and use last safe checkpoint | Present complete summary | Simulated adapter loss |
| Stale state | Show freshness and seek newer evidence | Treat stale as current | Supersession/freshness test |
| Conflicting state | Split claims by scope/source or mark unresolved | Last-write-wins by default | Contradiction fixture |
| Permission denied | Exclude content and explain limited evidence | Leak title, snippet, or existence beyond policy | Cross-tenant permission tests |
| Offline | Queue permitted work locally and show sync state | Block coding or claim cloud persistence | Offline/restore test |
| Walrus unavailable | Continue operational workflow and queue durable write | Lose checkpoint or mark durable | Failure injection |
| MemWal incompatible | Stop durable writes, surface compatibility error, retain outbox | Retry indefinitely without diagnosis | Version-contract test |
| Duplicate event | Deduplicate by idempotency identity | Create duplicate checkpoint/memory | Replay test |
| Out-of-order event | Recompute derived state with ordering metadata | Overwrite by arrival time | Reordering test |
| Agent hallucination | Store as claim/proposal until verified | Promote to fact/canonical | Adversarial extraction test |
| Unverified output | Label authority and exclude from fact answer when required | Cite it as verified result | Answer-quality test |
| User correction | Create supersession/restriction and invalidate affected packs | Rewrite history invisibly | Correction journey test |
| Rollback | Restore prior accepted state through new decision lineage | Delete intervening history | Decision rollback test |
| Wrong branch | Separate branch context and ask only if material | Mix branch memories | Multi-branch continuation test |
| Wrong work unit | Reassign captured evidence with audit trail | Delete and recreate silently | Work-unit recovery test |
| Secret detected | Keep local/deny sync and notify according to policy | Persist raw secret | Secret canary test |
| Client hook disabled | Mark capture degraded and offer explicit checkpoint | Claim automatic capture healthy | Hook-disabled test |
| Session compaction | Capture pre/post boundary and preserve uncertainty | Assume compact summary is complete truth | Compaction test |
| Durable deletion request | State what became unrecallable and what remains until retention expiry | Promise immediate physical deletion without proof | Retention/deletion test |

## Scenario 1 acceptance outcomes

- Developer can link one project and see the effective capture/sync policy.
- OpenCode adapter and Shoo MCP health are independently visible.
- A work unit can span multiple sessions.
- Meaningful checkpoint is created without requiring “remember this.”
- Codex can resume the work unit with objective, progress, decisions, files, tests, blockers, next action, and citations.
- A stopped/idle session does not auto-complete the work unit.
- Manual re-explanation is measurable and not inferred solely from tool use.
- Wrong memory can be corrected and disappears from current context while remaining in history.
- MemWal/Walrus failure does not block continuation.

## Scenario 2 acceptance outcomes

- Personal memory does not appear in project/team context without permitted promotion.
- Role and visibility are enforced independently from canonical authority.
- Branch-scoped conflict is not promoted to project-wide conflict without evidence.
- Revoked access removes data from future retrieval and invalidates cached packs.
- Handoff consumer sees enough context to continue but no unrelated private transcript.

## Scenario 3 acceptance outcomes

- Every factual project-state claim has an accessible citation or is explicitly labeled unsupported.
- Current accepted state is preferred over superseded memory.
- Inference and suggestion are visually/semantically distinct from fact.
- “Shoo does not know” is a valid outcome.
- Branch ambiguity results in split answers or a targeted scope question.
- User correction changes subsequent answers.

## Scenario 4 acceptance outcomes

- Blocker type and affected scope are explicit.
- Local blocker does not mark the whole team blocked.
- Recommendations are linked to constraints/evidence and require acceptance.
- Parallel work can be suggested without automatic assignment.
- Team flow metrics exclude individual performance inference.

## Discovery validation plan

### Research participants

- 5 solo developers using at least two agent/session contexts.
- At least 3 participants who use OpenCode or Codex.
- Later: 3–5 person software teams after solo workflow passes concept testing.

### Tasks

1. Resume an interrupted OpenCode task in Codex.
2. Identify why a decision was made and which decision is current.
3. Correct a false captured decision.
4. Recover when durable persistence is unavailable.
5. Decide whether a personal memory should be promoted to project scope.
6. Interpret a blocker without judging individual productivity.

### Evidence to collect

- Whether manual context recap occurred.
- Time to first useful action.
- Incorrect or missing context elements.
- Policy comprehension.
- Source/citation usage.
- Correction success and burden.
- Trust before and after a failure.

## Phase 2 success condition

Gate 2 can pass when stakeholders agree that these workflows solve the stated jobs, failure behavior is acceptable, and the proposed work-unit/checkpoint/policy concepts are understandable enough to define product scope. It does not require production architecture or UI visual design.
