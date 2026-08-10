# Fixtures

Shared corpora referenced by the fitness catalogue in docs/46. Default fixtures contain no
production data and no real private keys (docs/65 "Local development goals").

| Directory | Purpose | Owner |
|---|---|---|
| `contracts/` | HTTP, MCP and event conformance fixtures: supported/unsupported version negotiation, duplicate idempotency, stale expected version, oversized arguments. | API engineer |
| `retrieval-gold/` | Versioned gold continuation corpus for retrieval and context-pack quality (FIT-010). Changing the corpus creates a new baseline, never a retroactive pass. | Worker engineer |
| `security/` | Adversarial fixtures: prompt injection in retrieved content, forged tool scope, seeded (synthetic) secret strings for telemetry scanning (FIT-017, FIT-023). | All |
| `migration/` | Empty, representative and malformed predecessor data for migration dry runs (docs/64). | Foundation |

Synthetic secrets used by FIT-017 must be obviously fake and must never resemble a real
credential format that a scanner would treat as a live leak.
