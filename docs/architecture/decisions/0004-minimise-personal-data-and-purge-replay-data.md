# ADR-0004: Minimise personal data and purge replay data after 90 days except the top 100

**Status:** Accepted — 2026-11-12 (owner decision).

The service stores a chosen display name, an optional country and the run itself, never an address, an account or an email; replay data is purged after 90 days unless the run is in its board's top 100, and a deletion token lets a player erase a run without an account.

## Context

A display name and a country can identify a person when combined with other information: they are
personal data under the GDPR (Regulation (EU) 2016/679). The games already collect them locally
(retro-shmup ADR-0021: name of 1–8 characters from A–Z, 0–9 and space or `???`, optional ISO
3166-1 alpha-2 country). Publishing them online is the player's choice, made at submission.

## Decision drivers

Data minimisation (35), value to the player (30), auditability (15), simplicity (20).

## Options considered

| Option | Minimisation | Player value | Auditability | Simplicity | Total /500 |
|---|---|---|---|---|---|
| A. Purge replay data at 90 days, deletion token | 5 | 5 | 4 | 4 | 465 |
| A + keep the replay data of each board's top 100 | 4 | 5 | 5 | 4 | 455 (estimate) |
| B. Keep replay data forever | 3 | 5 | 5 | 5 | 430 |
| C. Anonymous scores, no name | 5 | 1 | 4 | 5 | 365 |

## Decision

**A with the top-100 exception**, chosen by the owner: the best runs stay re-verifiable after a
verifier bug fix and can later be watched as a replay, a stated purpose that justifies keeping them.

1. **Stored per run**: run id, game id, mode, game version, seed, input frames, claimed score,
   verified score, display name, optional country, status, submission and verdict timestamps,
   SHA-256 of the deletion token. Nothing else.
2. **Never stored**: client address (even hashed), user agent, account, email, cookie.
3. **Validation** mirrors the game rule: name `^(?=.*[A-Z0-9])[A-Z0-9 ]{1,8}$` trimmed, or `???`;
   country absent or in the ISO 3166-1 alpha-2 allowlist.
4. **Purge**: a daily cron trigger deletes the seed and input frames of runs older than 90 days that
   are not in the top 100 of their (game, mode) all-time board, and every `rejected`, `expired` or
   `unverifiable` run older than 7 days entirely. The score row (name, country, score, dates) of a
   verified run stays until the player deletes it.
5. **Erasure without an account**: `POST /v1/runs` returns a random 128-bit deletion token once;
   the game keeps it in `localStorage`; `DELETE /v1/runs/{id}` with that token erases the whole row.
   Other requests (lost token) go to the contact on the privacy page; the owner hides then deletes
   the run by id.
6. **Privacy notice**: a short page served by the Worker (`GET /privacy`) and linked from each
   game's submit screen: controller, purpose, data, retention, rights, contact. Submission is an
   explicit action of the player (a "Send online" choice), never automatic.
7. Logs (Workers observability) carry run ids and error codes only, never names or addresses.

## Consequences

- The top-100 replay data grows slowly and stays small (100 runs per board).
- A player who clears the browser storage loses the token and must ask the owner.
- Each game revision that adds online submission adds the "Send online" choice and the privacy
  link to its GDD and message catalogue.
