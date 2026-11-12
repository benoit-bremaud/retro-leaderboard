# Sequence diagram — leaderboard — submit a run, then verify it by replay

> **Feature**: epic benoit-bremaud/retro-shmup#166
> **Related ADRs**: ADR-0001, ADR-0002, ADR-0003, ADR-0004, ADR-0005
> **Realises**: UC1, UC4 · **See also**: `05-state-run.md`, `04-class-data-model.md`

## Context

The submission and its verification are two separate exchanges: the game never waits for the
replay. The verifier only makes outbound calls, so the homelab exposes no port.

## Diagram

```mermaid
sequenceDiagram
    title SEQ-1 Submit a run, then verify it by replay
    actor P as Player
    participant G as Game client
    participant W as Leaderboard Worker
    participant RL as Rate limiter
    participant DB as D1
    participant V as Verifier (homelab)
    participant S as Game simulation package

    P->>G: choose "Send online" after the run
    G->>W: POST /v1/runs (game, mode, version, seed, inputs, claimed score, name, country)
    W->>RL: limit(key = sha256(address + daily salt))
    alt over the limit
        RL-->>W: refused
        W-->>G: 429 Retry-After
    else under the limit
        RL-->>W: allowed
        W->>W: check guards (size, schema, allowlist, name, country)
        alt guard fails
            W-->>G: 400 error code
        else valid
            W->>DB: insert run (status pending, hash of deletion token)
            DB-->>W: run id
            W-->>G: 202 run id, deletion token
            G->>G: keep run id and token in localStorage
            G-->>P: show "pending verification"
        end
    end

    loop every minute (systemd timer)
        V->>W: GET /v1/verifier/pending (bearer token)
        W->>DB: select oldest pending runs (limit 20)
        DB-->>W: runs
        W-->>V: runs
        loop each run, one at a time
            alt game version installed
                V->>S: replay(seed, inputs) with a 10 s CPU ceiling
                S-->>V: replayed score
                V->>V: verdict = verified if equal, else rejected
            else version missing
                V->>V: verdict = unverifiable
            end
            V->>W: POST /v1/verifier/verdicts (run id, verdict, replayed score)
            W->>DB: update run status and verdict time
        end
    end

    P->>G: open the online board
    G->>W: GET /v1/boards/{game}/{mode}?period=all
    W->>DB: top 100 verified, not hidden
    DB-->>W: rows
    W-->>G: 200 board (name, country, score, date)
```

## Notes

- `202 Accepted`, not `201`: the run exists but is not on the board yet.
- The verifier posts a verdict per run, so a crash mid-batch loses at most one replay; a run with
  no verdict stays `pending` and comes back next tick.
- A verdict for a run that is no longer `pending` (deleted, expired) is ignored with `409`.
