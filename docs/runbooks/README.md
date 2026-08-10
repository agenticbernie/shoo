# Runbooks

Every new asynchronous job class and every new external dependency ships with a runbook
(docs/64 "Observability standards").

A runbook states: what the alert means, the safe first diagnostic (content-safe telemetry
only), the containment action including the operational kill switch, the recovery
procedure, and what must never be done — for example, never blindly resubmit an accepted
MemWal job; query the job or mapping first (docs/29).

Runbooks required before the relevant slice ships:

- `outbox-backlog.md` — queue age, lease contention, poison jobs (FIT-015)
- `durable-pending.md` — MemWal/Walrus delay, failure, reconciliation (FIT-011)
- `capture-degraded.md` — adapter capability loss and partial tails
- `index-watermark-lag.md` — pgvector/FTS staleness and degraded retrieval
- `deletion-and-export.md` — layer-by-layer deletion status and what Shoo cannot guarantee
