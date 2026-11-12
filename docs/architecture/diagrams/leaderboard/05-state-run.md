# State machine diagram — leaderboard — lifecycle of a run

> **Feature**: epic benoit-bremaud/retro-shmup#166
> **Related ADRs**: ADR-0001, ADR-0004
> **Realises**: UC1, UC3, UC4, UC5 · **See also**: `04-class-data-model.md`

## Context

`RunStatus` drives what is public and what is purged. `hidden` is an orthogonal flag set by the
owner (UC5); it only matters on a verified run.

## Diagram

```mermaid
---
title: state — Run
---
stateDiagram-v2
    [*] --> Pending : POST /v1/runs [guards pass] / store, return deletion token
    Pending --> Verified : verdict [replayed score = claimed]
    Pending --> Rejected : verdict [scores differ or CPU ceiling hit]
    Pending --> Unverifiable : verdict [game version not installed]
    Pending --> Expired : daily job [pending for 7 days] / purge replay data
    Verified --> Verified : daily job [older than 90 days and not top 100] / purge replay data
    Verified --> [*] : DELETE with token / erase row
    Pending --> [*] : DELETE with token / erase row
    Rejected --> [*] : daily job [older than 7 days] / erase row
    Unverifiable --> [*] : daily job [older than 7 days] / erase row
    Expired --> [*] : daily job [older than 7 days] / erase row
```

## Notes

- Only `Verified` and not hidden is public (UC2).
- `Unverifiable` exists so the owner sees a missing simulation version in the logs; publishing the
  version later does not revive the run (the player plays again).
- Every transition not shown is refused: a verdict on a non-pending run answers `409`.
