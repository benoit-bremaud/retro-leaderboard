# Class diagram — leaderboard — data model

> **Feature**: epic benoit-bremaud/retro-shmup#166
> **Related ADRs**: ADR-0002, ADR-0004, ADR-0005
> **Realises**: UC1–UC5 · **See also**: `05-state-run.md`

## Context

One table holds every run; the boards are queries on it, not tables. The game allowlist lives in
code (ADR-0005), not in the database. Types are the D1 (SQLite) storage types.

## Diagram

```mermaid
---
title: class — Leaderboard data model
---
classDiagram
    class Run {
        +id : TEXT  «ULID, primary key»
        +gameId : TEXT
        +mode : TEXT
        +gameVersion : TEXT  «semver»
        +seed : INTEGER  «uint32, NULL once purged»
        +inputs : BLOB  «encoded frames, NULL once purged»
        +runDigest : TEXT  «SHA-256 hex, UNIQUE»
        +claimedScore : INTEGER
        +verifiedScore : INTEGER  «NULL until verified»
        +name : TEXT  «1–8 of A–Z 0–9 space, trimmed»
        +country : TEXT  «ISO 3166-1 alpha-2, NULL»
        +status : RunStatus
        +hidden : INTEGER  «0 or 1»
        +attempts : INTEGER  «verifier pulls, 0..3»
        +deletionTokenHash : TEXT  «SHA-256 hex»
        +submittedAt : INTEGER  «epoch ms»
        +verdictAt : INTEGER  «NULL until verdict or expiry»
    }
    class RunStatus {
        <<enumeration>>
        pending
        verified
        rejected
        unverifiable
        expired
    }
    class GameEntry {
        <<code allowlist>>
        +id : string
        +modes : string[]
        +origins : string[]
        +maxFrames : number
        +versions : string[]
    }
    Run --> RunStatus
    Run ..> GameEntry : gameId, mode, gameVersion checked against
```

## Indexes

- `runs_board` on `(game_id, mode, status, hidden, verified_score DESC, verdict_at)` — board reads
  (UC2): `WHERE status = 'verified' AND hidden = 0 ORDER BY verified_score DESC, verdict_at ASC
  LIMIT 100`. Ties go to the earlier verdict.
- `runs_pending` on `(status, submitted_at)` — verifier pulls (UC4) and the expiry job.
- `runs_digest` UNIQUE on `(run_digest)` — refuses a resubmitted run (`409 duplicate-run`).

## Notes

- `id` is a ULID: sortable by time, no counter to leak volume. It is public (board rows carry it);
  erasure needs the deletion token, not the id.
- `runDigest` = SHA-256(gameId ‖ mode ‖ gameVersion ‖ seed ‖ inputs): the same run cannot be
  submitted twice under different names.
- The monthly board filters `submitted_at` on the current UTC month.
- Purge (ADR-0004) sets `seed` and `inputs` to NULL and keeps `runDigest`; a purged run keeps its
  board row until the two-year retention ends.
