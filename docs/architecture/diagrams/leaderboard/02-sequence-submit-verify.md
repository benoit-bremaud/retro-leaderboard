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
    title SEQ-submit-verify Submit a run, then verify it by replay
    actor P as Player
    participant G as Game client
    participant W as Leaderboard Worker
    participant RL as Rate limiter
    participant DB as D1
    participant V as Verifier (homelab)
    participant S as Game simulation (built from the signed tag)

    P->>G: choose "Send online" after the run
    G->>W: POST /v1/runs (game, mode, version, seed, inputs, claimed score, name, country)
    W->>RL: limit(key = sha256(address + HMAC(secret, UTC date)))
    alt over the limit
        RL-->>W: refused
        W-->>G: 429 Retry-After
    else under the limit
        RL-->>W: allowed
        W->>W: check guards (size, schema, allowlist, name, country)
        alt guard fails
            W-->>G: 400 error code
        else valid
            W->>DB: insert run (status pending, run digest, hash of deletion token)
            alt run digest already stored
                DB-->>W: unique constraint
                W-->>G: 409 duplicate-run
            else new run
            DB-->>W: run id
            W-->>G: 202 run id, deletion token
            G->>G: keep run id and token in localStorage
            G-->>P: show "pending verification"
            end
        end
    end

    loop every minute (systemd timer)
        loop until 204 no pending run, one run per request
        V->>W: GET /v1/verifier/pending (bearer token)
        W->>DB: select the oldest pending run, increment its attempts
        Note over W,DB: a run at 3 attempts becomes unverifiable (verdictAt = now) instead
        DB-->>W: run
        W-->>V: 200 run, or 204 no pending run
            alt game version installed
                V->>S: replay(seed, inputs) in a sandboxed child process
                S-->>V: replayed score, or replay-error
            else version missing
                V->>V: report = version-missing
            end
            V->>W: POST /v1/verifier/reports (run id, report)
            W->>W: verdict from report and claimed score
            W->>DB: update run if still pending
            W-->>V: 204, or 404 unknown or deleted, or 409 not pending
        end
    end

    G->>W: GET /v1/runs/{id}
    W->>DB: select status
    W-->>G: 200 {status}, or 404 unknown or deleted

    P->>G: open the online board
    G->>W: GET /v1/boards/{game}/{mode}?period=all
    W->>DB: top 100 verified, not hidden
    DB-->>W: rows
    W-->>G: 200 board (run id, name, country, score, date)
```

## Notes

- `202 Accepted`, not `201`: the run exists but is not on the board yet.
- The verifier pulls and reports one run at a time, so an outage costs at most one attempt to one
  run; a run with no report stays `pending` and comes back next tick, three times at most.
- `GET /v1/runs/{id}` returns the status only: no name or score while the run is pending.
- A report for an unknown or deleted run answers `404`; for a run that is no longer `pending`
  (expired, already decided) `409`. The verifier logs both and moves on.
- The Worker, not the verifier, compares the scores: the verifier token can only report what the
  replay produced.
