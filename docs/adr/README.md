# Implementation ADRs

Create an ADR when a choice (docs/64 "Decision and ADR governance"):

- changes a Gate 5–7 invariant;
- adds a persistence, consistency or security boundary;
- introduces a provider or platform dependency;
- changes public contracts or migration strategy;
- creates material lock-in or ongoing operational cost.

A minor local implementation detail does not need one. Reversing an accepted gate decision
requires returning to the owning decision gate, not an implementation-only PR.

Filename: `ADR-IMPL-NNN-short-title.md`. Sections: context, decision, alternatives,
consequences, reversal condition.
