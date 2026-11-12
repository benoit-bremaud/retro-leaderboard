# ADR-0001: Verify each run by replaying it on the homelab

**Status:** Accepted — 2026-11-12 (owner decision, MCDA in the session of epic
benoit-bremaud/retro-shmup#166).

The leaderboard accepts a score only after a verifier on the owner's homelab has replayed the run from its seed and recorded inputs and found the same score.

## Context

- The games are deterministic: a fixed 60 Hz timestep and a seeded random generator (retro-shmup
  ADR-0002, ADR-0019). The same (game version, seed, input frames) always yields the same score.
- A score sent by a browser cannot be trusted: anyone can edit it in the developer tools.
- Measured on 2026-11-12: a headless run of retro-shmup level 1 (two to three minutes of play)
  costs 16–22 ms of CPU in Node 22. Later levels will cost more.
- Cloudflare limits (documentation read on 2026-11-12): a Worker on the Free plan gets 10 ms of
  CPU per request (a replay is cut with error 1102); the Paid plan (5 USD per month) gets 30 s by
  default, up to 5 minutes. Whether a Durable Object on the Free plan gets 30 s is ambiguous in the
  documentation.

## Decision drivers

Integrity of the board (35), simplicity (25), running cost (20), player experience (10),
operational reliability (10).

## Options considered

| Option | Integrity | Simplicity | Cost | Player UX | Ops | Total /500 |
|---|---|---|---|---|---|---|
| A. Synchronous replay in the Worker, Workers Paid | 5 | 4 | 3 | 4 | 5 | 425 |
| E. Replay in a Durable Object on the Free plan (unproven) | 5 | 3 | 5 | 4 | 3 | 420 |
| D. Asynchronous replay on the homelab, Free plan | 5 | 2 | 5 | 2 | 2 | 365 |
| C. Plausibility checks only, Free plan | 1 | 5 | 5 | 5 | 5 | 360 |
| B. Asynchronous replay in a Queue consumer, Workers Paid | 5 | 2 | 3 | 3 | 4 | 355 |

## Decision

**D**, an owner override of the top-scored A: no recurring cost is a hard constraint for a hobby
leaderboard, and a score that waits a few minutes for its verdict is acceptable. With these
weights D does not lead; it is chosen because A and B fail the zero-cost constraint and E rests on
an unproven Free-plan limit.

1. The Worker never trusts a client score. It stores each submitted run as `pending`.
2. A verifier service on the homelab **pulls** pending runs over HTTPS (outbound only: the homelab
   exposes no port), replays each with the game's own simulation at the exact game version of the
   run, and posts a **report**: the replayed score, or `replay-error`, or `version-missing`. The
   **Worker** computes the verdict from that report: `verified` when the replayed score equals the
   claimed score, `rejected` when it differs or on `replay-error`, `unverifiable` on
   `version-missing`.
3. The simulation is the game's code, not a copy: the verifier builds each game version from the
   game's **signed release tag** (`git verify-tag` against the owner's allowed signers) and keeps
   every built version side by side. No package registry, no cost.
4. The verifier authenticates with a bearer token held as a Worker secret and in a homelab file,
   compared in constant time, scoped to the two verifier routes only, named
   `retro-leaderboard-verifier-<tier>-<yyyy>` with an expiry of one year and create-then-revoke
   rotation. It grants no other right (no moderation, ADR-0003).
5. Only `verified`, not hidden runs appear on public boards. A run still `pending` 7 days after
   `submittedAt` becomes `expired` (homelab down for a week): `verdictAt` is set to the expiry time,
   it is never shown and its replay data is purged.
6. **Replay sandbox**: each replay runs in a child process with no token in its environment, a CPU
   ceiling derived from the game's `maxFrames` (ADR-0005; 10 s at most), a wall-clock ceiling of
   twice that, a memory ceiling (`MemoryMax`) and no network (`IPAddressDeny=any`). Hitting any
   ceiling or crashing is `replay-error`.
7. **Poison runs**: the Worker counts verification attempts per run; a run handed out three times
   without a report becomes `unverifiable`, so one run can never block the queue.
8. The verifier runs as a systemd user timer every minute, one replay at a time.

## Consequences

- No Cloudflare cost; the Worker stays on the Free plan (10 ms per request is enough without the
  replay).
- A new score is visible only after the next verifier pass (about a minute), or after the homelab
  comes back. The game shows "pending verification" until then.
- The homelab becomes a dependency of the board's freshness, not of its availability: reads and
  submissions keep working when it is down.
- Each game must tag signed releases whose simulation core builds headless: that is the client-side
  brick of every game.
- A bot that really plays the game still gets a verified score: replay proves the inputs produce the
  score, not that a human pressed them. Accepted.
- The seed is chosen by the client, so a player can replay the same seed until a lucky run
  (owner decision 2026-11-12: risk accepted, the games stay playable offline). A server-issued seed
  needs a superseding ADR.
- Moving to option A later only moves the replay call from the verifier into the Worker: the
  contract (run format, reports, verdicts) stays the same. A superseding ADR is needed.
