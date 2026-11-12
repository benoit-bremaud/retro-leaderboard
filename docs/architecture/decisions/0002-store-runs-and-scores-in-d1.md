# ADR-0002: Store runs and scores in Cloudflare D1

**Status:** Accepted — 2026-11-12 (owner decision).

Runs, their verdicts and the public boards live in one Cloudflare D1 database (SQLite), queried by index for the top scores.

## Context

The service needs ordered top-N reads per (game, mode, period), a run lifecycle with a few state
changes, and a purge job. Volumes are small (hobby games: thousands of runs, not millions).

## Decision drivers

Top-N queries (35), simplicity (25), consistency (20), cost (20).

## Options considered

| Option | Top-N | Simplicity | Consistency | Cost | Total /500 |
|---|---|---|---|---|---|
| D1 (SQLite) | 5 | 5 | 4 | 5 | 480 |
| Durable Object with SQLite storage | 4 | 3 | 5 | 4 | 395 |
| Workers KV | 1 | 4 | 2 | 5 | 275 |

## Decision

D1, one database per tier (`retro-leaderboard-staging`, `retro-leaderboard-prod`), schema in
versioned migrations (`migrations/NNNN_<topic>.sql`, applied by `wrangler d1 migrations apply`).
Tables and indexes: the class diagram `04-class-data-model.md`. Every query is a prepared statement
with bound parameters, never string concatenation.

## Consequences

- Free plan quotas (5 GB, daily read and write limits) are far above the expected volume.
- D1 is eventually consistent across read replicas: a run verified a second ago may not show yet.
  Accepted.
- Tests run against a local D1 (Miniflare) through the store port; the domain never imports D1.
