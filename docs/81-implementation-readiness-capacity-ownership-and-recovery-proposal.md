# Shoo Implementation Readiness — Capacity, Ownership and Recovery Proposal

- Version: 0.2
- Status: Accepted — Implementation Readiness Decision
- Owner role: Founder/CTO / Technical Program Manager / Security Architect
- Dependencies: Accepted Gates 8–9; ART-66; ART-70; ART-72; ART-80
- Assumptions: Six technical contributors are available primarily for Shoo; individual names other than Bernie are not yet recorded
- Unresolved questions: Actual Shoo allocation per person; application-security competence of the cryptography/backend contributor; named-person consent to accepted duties
- Last decision: Sponsor approved the sustainable capacity model, proposed owner/deputy map, sealed-dataset custody and break-glass baseline on 2026-07-15
- Next action: Record names, allocation, capability and consent; then run the readiness review before any Slice A date commitment

## Capacity correction

FTE is normalized sustained capacity, not effort intensity. One full-time person is at most 1.0 planning FTE even if that person temporarily works 50–60 hours.

Use:

`effective delivery FTE = employment FTE × allocation to Shoo × focus factor`

Recommended focus factors:

| Work pattern | Focus factor | Use |
|---|---:|---|
| Stable product contributor | 0.80–0.85 | Planned feature/delivery capacity |
| Multi-role founder/lead | 0.50–0.70 | Bernie, because product, architecture, hiring, incidents and external work compete |
| Shared/part-time contributor | 0.60–0.80 | Depends on explicit Shoo allocation |
| Short surge | Track separately | Never included in roadmap baseline |

If all six technical contributors are fully assigned to Shoo, a credible first planning envelope is **4.0–4.8 effective delivery FTE**, not 6–9. Marketing capacity is valuable for research/GTM but does not increase engineering FTE.

The company-size range of 6–20 people does not change the roadmap until specific people, skills and Shoo allocation are committed. Historical companies with 8 or 18 employees are context, not evidence of current delivery capacity.

### Surge policy

- Baseline: maximum 1.0 employment FTE/person.
- Planned surge: at most 1.15 capacity equivalent for up to two weeks, followed by recovery/reforecast.
- Incident surge above that is not feature capacity.
- Never use 1.5 FTE/person to set external dates, on-call redundancy or review throughput.

## Recommended ownership map

| Control area | Accountable owner | Deputy | Bernie role | Reason |
|---|---|---|---|---|
| Slice A delivery | Backend developer | DevOps engineer | Product/architecture sponsor and escalation | Cross-layer delivery needs domain/data integration; avoids founder-only execution |
| Local/OpenCode trust path | Bernie initially | Backend developer | Working technical owner until capability transfer | Current team has no explicit Local/platform specialist; transfer is a Slice A outcome |
| Security engineering | Cryptography + backend developer | DevOps engineer | Risk acceptance for high-impact residual risk | Best available security-adjacent skill plus operational deputy; cryptography alone is not presumed to equal application security |
| Durable Memory/MemWal | Cryptography + backend developer | Backend developer | Architecture/product boundary approval | Direct skill fit; deputy understands domain/data and can recover operations |
| Evaluation program | BA + frontend developer | Frontend developer | Gate sponsor, not sole scorer | Strongest fit for requirements, acceptance, research and disconfirming evidence |
| Sealed dataset custody | DevOps engineer | BA + frontend developer | No routine access | Separate protected storage/access operation from feature tuning |
| Research recruitment | Marketing | BA + frontend developer | Consulted | Keeps recruitment/GTM evidence outside engineering delivery |
| Release/recovery | DevOps engineer | Backend developer | High-impact production approval | Operational ownership with domain-aware deputy |

### Conditions on the map

- “Accountable” means one outcome owner, not the only implementer.
- Deputies must execute at least one real recovery/release path; being named is insufficient.
- Security changes require two reviewers: security owner plus domain/platform reviewer.
- If the cryptography/backend contributor lacks application security/threat-model experience, retain ownership of Durable Memory but use DevOps as interim security owner and obtain an external security review before restricted-data beta.
- If the backend developer is allocated below 0.8 to Shoo, Bernie may temporarily own Slice A delivery, but a dated transfer to the backend developer is mandatory before Slice B.

## Decision matrix summary

| Decision | Recommended candidate | Main advantage | Main trade-off | Reversal trigger |
|---|---|---|---|---|
| Slice A owner | Backend developer | Domain/data integration and lower founder bus factor | Must grow cross-surface coordination skill | Allocation <0.8 or inability to run full slice review |
| Security owner | Crypto/backend | Closest current security competency | Crypto skill may not cover AppSec/cloud/privacy | Capability assessment fails |
| Durable owner | Crypto/backend | MemWal/key/trust fit | Concentrates two high-risk areas | Workload or review independence fails |
| Evaluation owner | BA/frontend | Acceptance/research orientation and less model-tuning conflict | Needs technical evaluator support | Cannot adjudicate technical memory cases |
| Second break-glass admin | DevOps engineer | Operational/recovery responsibility | Privilege concentration with release custody | Trust/employment/on-call conditions change |
| Sealed dataset custodian | DevOps engineer | Can enforce protected, auditable automation | Must not expose labels to feature team | Access-control separation cannot be enforced |

## Sealed regression dataset operating model

Separate four duties:

1. **Dataset owner:** BA/frontend evaluation lead owns rubric, consent, version and study integrity.
2. **Custodian:** DevOps controls encrypted protected storage, immutable versions, audit logs and evaluation workflow; cannot silently rewrite labels.
3. **Annotators/adjudicators:** Evaluation lead plus a rotating technical reviewer; disagreements are logged and blinded from candidate configuration.
4. **Release approvers:** Evaluation lead, security owner and Bernie use a two-of-three approval rule for cohort advancement. They cannot edit results during approval.

Feature implementers receive development/calibration cases, aggregate sealed scores and sanitized failure IDs. They do not receive sealed labels or cases before a release window closes. Unsealing requires two-person approval and creates a new dataset version; the exposed case leaves the sealed partition.

## Break-glass recommendation

### Administrators

- Primary break-glass administrator: Bernie.
- Second break-glass administrator: DevOps engineer.
- Recovery trustee/deputy before R2: cryptography/backend contributor, without automatically granting daily production admin.

### Controls

- Use named individual emergency accounts; never share one account/password/key.
- Hardware-backed MFA with separate primary and spare keys per administrator.
- Recovery codes stored separately with access logging and quarterly verification.
- Emergency accounts are not used for normal operations.
- Every login alerts at least the other administrator and opens an incident record.
- Conduct a restore/account-recovery drill before R2 and after any administrator change.
- Separate billing, domain, GitHub, cloud, identity and signing-key recovery where providers allow.
- Second break-glass status does not automatically grant sealed-dataset or wallet/private-key access.

## RACI for Slice A exit

| Outcome | A | R | C | I |
|---|---|---|---|---|
| Slice A integrated outcome | Backend developer | Backend, DevOps, Bernie, frontend contributors | Crypto/backend, BA/frontend | Marketing |
| Safe local capture | Bernie initially | Bernie + backend | Security owner, DevOps | Evaluation lead |
| Secret/path exclusion and AEAD | Crypto/backend | Crypto/backend + backend | DevOps, Bernie | Evaluation lead |
| CI/package/recovery | DevOps | DevOps | Backend, security owner | Team |
| R0 protocol and scoring | BA/frontend | BA/frontend + frontend deputy | Technical reviewer, security owner | Bernie |
| R0 advancement decision | Two of three: evaluation, security, Bernie | Evaluation lead prepares evidence | Slice owner, DevOps | Team |

## Readiness acceptance criteria

- Each person reports weekly Shoo allocation, not claimed intensity.
- Total baseline and effective delivery FTE are calculated with focus factors.
- All owner/deputy assignments are accepted by the named people.
- DevOps emergency admin account and hardware MFA recovery are tested.
- Sealed dataset storage, access and two-person unseal workflow are demonstrated.
- Slice A owner can explain outcome, dependencies, stop gate and rollback without Bernie.
- No external date is committed until two weeks of throughput and blocker data exist.

## Decision statement

“Shoo will plan people at no more than 1.0 sustainable FTE each and treat overtime as temporary surge. The proposed owner/deputy, sealed-dataset custody and break-glass model in ART-81 is accepted subject to named-person consent and capability checks. Slice A timing will be committed only after actual Shoo allocation and two weeks of delivery evidence are recorded.”

Approval date: 2026-07-15. This approval makes the operating model canonical; it does not validate ASM-070 or ASM-071 and does not commit a delivery date.
