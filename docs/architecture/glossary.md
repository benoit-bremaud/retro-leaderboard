# Glossary — retro-leaderboard

Every domain term used in the conception documents, defined once, in alphabetical order.

| Term | Definition | Source |
|---|---|---|
| Board | The ordered list of the top 100 verified, not hidden runs of one game and mode, all-time or for the current UTC month | ADR-0002, `04-class-data-model.md` |
| Claimed score | The score the game client reports with a run; never shown before verification | ADR-0001 |
| Deletion token | A random 128-bit secret returned once at submission and kept by the game, which lets the player erase the run; stored only as its SHA-256 | ADR-0004 |
| Game id | Stable slug of a game (`^[a-z][a-z0-9-]{1,31}$`), chosen once, independent of the repository name | ADR-0005 |
| Game version | Semantic version of the game build that produced a run; selects the simulation package for replay | ADR-0005 |
| Hidden | Owner flag that takes a run off every board without deleting it | ADR-0003, UC5 |
| Input frames | The encoded per-step player input of a run, at the game's fixed timestep | retro-shmup client issue |
| Mode | A rules variant of a game with its own board (e.g. `arcade`) | ADR-0005 |
| Purge | Removal of a run's seed and input frames (or the whole row) by the daily job | ADR-0004 |
| Replay | Re-running a game's deterministic simulation from a run's seed and input frames, without display or sound, to recompute its score | ADR-0001 |
| Run | One finished play session submitted online: game, mode, version, seed, input frames, claimed score, name, optional country | `04-class-data-model.md` |
| Run status | `pending`, `verified`, `rejected`, `unverifiable` or `expired` | `05-state-run.md` |
| Salted address hash | SHA-256 of the client address and a salt rotated daily; the rate-limit key, never stored | ADR-0003 |
| Seed | The 32-bit integer that fixes a run's random sequence | retro-shmup ADR-0019 |
| Simulation package | A game's deterministic core published as `@retro/<game id>-sim@<version>`, loaded by the verifier | ADR-0001 |
| Verdict | The verifier's outcome for one run: `verified`, `rejected` or `unverifiable` | ADR-0001 |
| Verifier | The homelab service that pulls pending runs, replays them and posts verdicts | ADR-0001 |
