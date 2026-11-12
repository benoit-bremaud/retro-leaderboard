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
| C. Plausibility checks only, Free plan | 1 | 5 | 5 | 5 | 5 | 360 |
| D. Asynchronous replay on the homelab, Free plan | 5 | 2 | 5 | 2 | 2 | 365 |
| B. Asynchronous replay in a Queue consumer, Workers Paid | 5 | 2 | 3 | 3 | 4 | 355 |

## Decision

**D**, chosen by the owner over the top-scored A: no recurring cost, and a score that waits a few
minutes for its verdict is acceptable for a hobby leaderboard. Sensitivity: D leads as soon as cost
weighs 35 or more, which is the owner's stated priority.

1. The Worker never computes a score. It stores each submitted run as `pending`.
2. A verifier service on the homelab **pulls** pending runs over HTTPS (outbound only: the homelab
   exposes no port), replays each with the game's own simulation package at the exact game
   version of the run, and posts a verdict: `verified` when the replayed score equals the claimed
   score, `rejected` otherwise, `unverifiable` when it does not hold that game version.
3. The simulation is the game's code, not a copy: each game publishes its deterministic core as a
   versioned package (`@retro/<slug>-sim@<semver>`, private to the owner, built from the game's
   tag); the verifier keeps every published version side by side.
4. The verifier authenticates with a bearer token held as a Worker secret and in a homelab file,
   compared in constant time, scoped to the two verifier routes, named
   `retro-leaderboard-verifier-<tier>-<yyyy>` with an expiry of one year and create-then-revoke
   rotation.
5. Only `verified` runs appear on public boards. A run still `pending` after 7 days becomes
   `expired` (homelab down for a week): it is never shown and its replay data is purged.
6. The verifier runs as a systemd user timer every minute; one replay at a time, with a 10 s CPU
   ceiling per run.

## Consequences

- No Cloudflare cost; the Worker stays on the Free plan (10 ms per request is enough without the
  replay).
- A new score is visible only after the next verifier pass (about a minute), or after the homelab
  comes back. The game shows "pending verification" until then.
- The homelab becomes a dependency of the board's freshness, not of its availability: reads and
  submissions keep working when it is down.
- Each game must publish its simulation core as a package before it can join the board: that is
  the client-side brick of every game.
- A bot that really plays the game still gets a verified score: replay proves the inputs produce the
  score, not that a human pressed them. Accepted.
- Moving to option A later only moves the replay call from the verifier into the Worker: the
  contract (run format, verdicts) stays the same. A superseding ADR is needed.
