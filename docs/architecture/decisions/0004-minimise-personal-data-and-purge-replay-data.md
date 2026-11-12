# ADR-0004: Minimise personal data and purge replay data after 90 days except the top 100

**Status:** Accepted — 2026-11-12 (owner decision).

The service stores a chosen display name, an optional country and the run itself, never an address, an account or an email; replay data is purged after 90 days unless the run is in its board's top 100, score rows outside the top 100 are erased after two years, and a deletion token lets a player erase a run without an account.

## Context

A display name and a country can identify a person when combined with other information: they are
personal data under the GDPR (Regulation (EU) 2016/679). The games already collect them locally
(retro-shmup ADR-0021: name of 1–8 characters from A–Z, 0–9 and space, trimmed; optional ISO
3166-1 alpha-2 country). Publishing them online is the player's choice, made at submission. Players
may be minors; in France the age of digital consent is 15.

## Decision drivers

Data minimisation (35), value to the player (30), auditability (15), simplicity (20).

## Options considered

| Option | Minimisation | Player value | Auditability | Simplicity | Total /500 |
|---|---|---|---|---|---|
| A. Purge replay data at 90 days, deletion token | 5 | 5 | 4 | 4 | 465 |
| A + keep the replay data of each board's top 100 | 4 | 5 | 5 | 4 | 445 |
| B. Keep replay data forever | 3 | 5 | 5 | 5 | 430 |
| C. Anonymous scores, no name | 5 | 1 | 4 | 5 | 365 |

## Decision

**A with the top-100 exception**, an owner override of the top-scored A (445 vs 465): the best runs
stay re-verifiable after a verifier bug fix and can later be watched as a replay, a stated purpose
that justifies keeping them.

1. **Lawful basis**: legitimate interest (GDPR art. 6(1)(f)), chosen by the owner on 2026-11-12
   (MCDA 430, over performance of a service 330 and consent 210). Publishing is optional and
   started by the player; the notice advises a pseudonym. Consent was rejected because parental
   consent under 15 cannot be checked without an account.
2. **Stored per run**: run id, game id, mode, game version, seed, input frames, run digest, claimed
   score, verified score, display name, optional country, status, hidden flag, verification attempt
   count, submission and verdict timestamps, SHA-256 of the deletion token. Nothing else.
3. **Never stored**: client address (even hashed), user agent, account, email, cookie.
4. **Validation** mirrors the game rule: name `^[A-Z0-9](?:[A-Z0-9 ]{0,6}[A-Z0-9])?$` (1–8
   characters, no leading or trailing space); country absent or in the ISO 3166-1 alpha-2
   allowlist.
5. **Retention** (daily cron trigger):
   - seed and input frames of a verified run older than 90 days and not in the top 100 of its
     (game, mode) all-time board: set to NULL;
   - every `rejected`, `expired` or `unverifiable` run 7 days after its `verdictAt`: erased;
   - the score row of a verified run older than two years and not in the top 100 of its all-time
     board: erased (owner decision 2026-11-12, MCDA 420 over "two years always" 380 and "kept
     forever" 340). A top-100 row stays until it falls out of the top 100 or the player erases it.
6. **Erasure without an account**: `POST /v1/runs` returns a random 256-bit deletion token once;
   the game keeps it in `localStorage`; `DELETE /v1/runs/{id}` with `Authorization: Bearer <token>`
   (compared as SHA-256 hashes in constant time) erases the whole row, whatever its status. Other
   requests (lost token) go to the contact on the privacy page; the owner erases the run by id with
   `wrangler d1 execute`.
7. **Privacy notice**: a short page served by the Worker (`GET /privacy`) and linked from each
   game's submit screen: controller, purpose, lawful basis and the legitimate interest, data,
   retention, recipients (Cloudflare as processor, D1 in the EU jurisdiction), rights (access,
   erasure, objection, complaint to the CNIL), contact. Submission is an explicit action of the
   player (a "Send online" choice), never automatic.
8. Logs carry run ids and error codes only, never names or addresses; invocation logs are disabled
   (ADR-0003).

## Consequences

- The top-100 replay data grows slowly and stays small (100 runs per board).
- A player who clears the browser storage loses the token and must ask the owner.
- Each game revision that adds online submission adds the "Send online" choice and the privacy
  link to its GDD and message catalogue.
