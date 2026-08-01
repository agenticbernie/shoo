# Shoo User Journeys

- Version: 0.2
- Status: Accepted — Decision Gate 2
- Owner role: Principal Product Designer / UX Research Lead
- Dependencies: Scenario Workflows; JTBD Map
- Assumptions: The first evaluation journey uses OpenCode followed by Codex on the same repository and work unit
- Unresolved questions: Exact onboarding packaging; capture-health presentation
- Last decision: Sponsor approved cross-agent continuation as the first-value journey
- Next action: Trace Phase 3 features to the accepted journey stages

## Journey A — First successful cross-agent continuation

| Stage | User intent | User action | Shoo response | Trust question | Failure/recovery | Success signal |
|---|---|---|---|---|---|---|
| Discover | Decide whether Shoo solves repeated context loss | Reviews product and supported clients | Explains continuation outcome and data boundaries | “What will Shoo read and upload?” | Unsupported expectation is stated early | User understands the core loop |
| Connect | Enable OpenCode and Codex | Installs adapter/MCP and signs in | Verifies client connectivity and shows permissions | “Can I limit capture?” | Diagnostic identifies missing hook, MCP, or auth | Both clients show healthy or explicitly degraded |
| Link project | Establish scope | Selects repository/project | Resolves project identity and default policy | “Will another project see this?” | Duplicate project or remote mismatch can be reconciled | Project identity is stable |
| Start work | Begin or choose work unit | Selects existing work or creates a concise work unit | Provides available prior context or empty state | “Why is this context included?” | No memory produces honest empty state | Agent begins with correct objective |
| Work | Make useful changes | Codes normally in OpenCode | Captures permitted evidence and shows unobtrusive health | “Is raw content leaving my machine?” | Policy exclusion or adapter failure is visible | Meaningful evidence captured without manual note-taking |
| Checkpoint | Preserve a resumable state | Stops, compacts, blocks, or requests checkpoint | Produces checkpoint preview/status and queues durable memory | “Did Shoo mark this complete?” | Ambiguous outcome remains in progress | Objective, progress, test state, uncertainty, next action recorded |
| Switch | Continue in Codex | Opens Codex in same project | Matches likely work unit and supplies context pack | “Is this current and sourced?” | User can select another work unit | No manual project-state recap |
| Verify value | Judge continuation | Observes Codex's first useful actions | Offers compact feedback/correction path | “Did Shoo save effort?” | Wrong context can be corrected and regenerated | SCRR event recorded with user feedback |

## Journey B — Correct a wrong or stale memory

| Stage | User action | Expected Shoo behavior | Non-negotiable rule |
|---|---|---|---|
| Notice | Sees wrong claim in context or Ask Shoo | Exposes source, authority, time, and scope | Never hide provenance |
| Diagnose | Opens source trail | Shows raw/normalized evidence subject to permission | Redacted evidence remains redacted |
| Correct | Edits claim, changes scope, or marks superseded | Creates a new correction/supersession event; preserves history | No destructive history rewrite as default |
| Recompute | Requests answer/context again | Invalidates affected pack and prefers corrected state | Superseded memory cannot remain current truth |
| Learn | Continues work | Records correction feedback for extraction/ranking evaluation | Do not auto-generalize correction beyond scope |

## Journey C — Interrupted session recovery

1. OpenCode process stops before normal completion.
2. Shoo marks the session `interrupted` or `capture_incomplete`, not `completed`.
3. Last safe checkpoint and later partial evidence remain distinct.
4. On the next start, Shoo offers recovery with an explicit freshness/completeness warning.
5. Developer confirms work unit and whether partial changes still exist.
6. Context pack contains last verified state plus a clearly labeled partial tail.

Success means the user can resume safely; it does not require pretending the interrupted session produced a full summary.

## Journey D — Promote personal memory to project scope

1. Developer works privately on an approach.
2. Shoo captures local/personal candidates.
3. A decision or verified result becomes useful to the project.
4. Developer or policy proposes promotion.
5. Shoo previews content, evidence, target scope, durability, and affected consumers.
6. Authorized user confirms.
7. New project-scoped memory is created with lineage to personal evidence; private evidence is not exposed beyond permission.

This journey is schema-ready in MVP and becomes a core team workflow later.

## Emotional trajectory

- Before: frustration and uncertainty about lost state.
- During setup: concern about privacy and integration fragility.
- During capture: desire for invisibility without loss of control.
- At switch: skepticism about relevance and correctness.
- After successful continuation: confidence grounded in evidence, not novelty.

UX must optimize trust recovery when Shoo is wrong, not only delight when it is right.
