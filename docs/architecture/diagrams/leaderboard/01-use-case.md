# Use case diagram — leaderboard — who wants what from the shared board

> **Feature**: epic benoit-bremaud/retro-shmup#166 — shared online leaderboard API for retro games
> **Related ADRs**: ADR-0001, ADR-0003, ADR-0004, ADR-0005
> **Realises**: UC1–UC6 · **See also**: `02-sequence-submit-verify.md`, `05-state-run.md`

## Context

The subject is the leaderboard Worker. The player acts through a game, so the game client is not
an actor of its own: it is the player's tool. The owner administers. The verifier on the homelab
is an external system actor: it initiates its own goal (UC4), triggered by its timer.

## Diagram

```mermaid
---
title: uc — Shared leaderboard
---
flowchart LR
    player(["Player"])
    owner(["Owner"])
    verifier(["Verifier (homelab)"])
    subgraph svc ["Leaderboard service"]
        uc1(("UC1 Publish a run online"))
        uc2(("UC2 Browse a board"))
        uc3(("UC3 Erase my run"))
        uc4(("UC4 Verify pending runs"))
        uc5(("UC5 Hide an offensive run"))
        uc6(("UC6 Add a game or a game version"))
        inc1(("Check request guards and rate limit"))
    end
    player --> uc1
    player --> uc2
    player --> uc3
    verifier --> uc4
    owner --> uc5
    owner --> uc6
    uc1 -. "«include»" .-> inc1
    uc3 -. "«include»" .-> inc1
    uc2 -. "«include»" .-> inc1
```

## Use cases (brief form)

| ID | Goal | Primary actor | Main success scenario | Extensions |
|---|---|---|---|---|
| UC1 | Publish a finished run on the online board | Player | The player chooses "Send online" after a run; the game sends the run; the service stores it as `pending` and returns the run id and a deletion token; the game shows "pending verification" and can poll `GET /v1/runs/{id}` | Guard or rate limit fails → refused with a code; unknown game version → refused; same run already stored → `409 duplicate-run` |
| UC2 | See the best verified scores of a game and mode, all-time or this month | Player | The game (or a page) asks for the board; the service returns the top 100 verified, not hidden runs | Empty board |
| UC3 | Remove my run and my name from the board | Player | The game sends the run id and the deletion token kept at UC1; the service erases the row | Wrong token → `404` (same answer as an unknown id); lost token → contact the owner |
| UC4 | Turn pending runs into verdicts | Verifier | Every minute the verifier pulls pending runs, replays each at its game version and posts a report (replayed score, `replay-error` or `version-missing`); the Worker sets the verdict | Service unreachable → retry next tick; replay crash or ceiling hit → `rejected`; three pulls without a report → `unverifiable`; run deleted meanwhile → `404` |
| UC5 | Take an offensive or abusive run off the board | Owner | The owner sets `hidden = 1` on the run by id with `wrangler d1 execute` (no admin HTTP route, ADR-0003) | Run unknown → no row changed |
| UC6 | Let a new game or a new version submit runs | Owner | The owner adds it to the allowlist (`src/games.ts`) and tags a signed release the verifier builds its simulation from, through a gated PR | — |

## Notes

- Purge and expiry (ADR-0004) are scheduled system behaviour, not actor goals: they appear in the
  state diagram, not here. The daily rate-limit salt is derived from the date, not rotated by a
  job (ADR-0003).
- UC1 says nothing about the score being genuine: UC4 decides that, after the fact.
