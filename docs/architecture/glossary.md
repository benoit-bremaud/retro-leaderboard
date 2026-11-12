# Glossary — retro-leaderboard

Every domain term used in the conception documents of epic benoit-bremaud/retro-shmup#166, defined once, in alphabetical order.

| Term | Definition | Source |
|---|---|---|
| Allowlist | The list in `src/games.ts` of each game's modes, origins, `maxFrames` and accepted versions | ADR-0005 |
| Attempts | Number of times the verifier pulled a pending run without reporting; at 3 the run becomes `unverifiable` | ADR-0001 |
| Board | The ordered list of the top 100 verified, not hidden runs of one game and mode, all-time or for the current UTC month | ADR-0002, `04-class-data-model.md` |
| Claimed score | The score the game client reports with a run; never shown before verification | ADR-0001 |
| Deletion token | A random 256-bit secret returned once at submission and kept by the game, which lets the player erase the run; stored only as its SHA-256 | ADR-0004 |
| Deny list | Server-side list of offensive words matched against the normalised name | ADR-0003 |
| Duplicate run | A run whose run digest is already stored; refused with `409 duplicate-run` | ADR-0003 |
| Game id | Stable slug of a game (`^[a-z][a-z0-9-]{1,31}$`), chosen once, independent of the repository name | ADR-0005 |
| Game version | Semantic version of the game build that produced a run; selects the simulation the verifier replays with | ADR-0005 |
| Hidden | Owner flag that takes a run off every board without deleting it, set with `wrangler d1 execute` | ADR-0003, UC5 |
| Input frames | The encoded per-step player input of a run, at the game's fixed timestep | client-side brick of each game (run codec) |
| Lawful basis | Legitimate interest (GDPR art. 6(1)(f)) for publishing a run the player chose to send | ADR-0004 |
| Mode | A rules variant of a game with its own board (e.g. `arcade`) | ADR-0005 |
| Owner | The person who runs and moderates the service | `01-use-case.md` |
| Period | The span of a board: all-time or the current UTC month | `04-class-data-model.md` |
| Player | A person who plays a game and chooses to publish a run | `01-use-case.md` |
| Purge | Removal of a run's seed and input frames (or the whole row) by the daily job | ADR-0004 |
| Replay | Re-running a game's deterministic simulation from a run's seed and input frames, without display or sound, to recompute its score | ADR-0001 |
| Report | What the verifier posts for one run: the replayed score, `replay-error` or `version-missing`; the Worker turns it into a verdict | ADR-0001 |
| Request guard | A check on `POST /v1/runs` (type, size, schema, allowlist, name, country) that refuses with `400` | ADR-0003 |
| Run | One finished play session submitted online: game, mode, version, seed, input frames, claimed score, name, optional country | `04-class-data-model.md` |
| Run codec | The shared module that encodes and decodes a run's input frames, one source of truth for the run format | `03-component.md` |
| Run digest | SHA-256 of game id, mode, game version, seed and canonical input frames (re-encoded by the run codec); unique per run | `04-class-data-model.md` |
| Run status | `pending`, `verified`, `rejected`, `unverifiable` or `expired` | `05-state-run.md` |
| Salted address hash | SHA-256 of the client address and a daily salt HMAC-SHA-256(secret, UTC date); the rate-limit key, never stored | ADR-0003 |
| Seed | The 32-bit integer that fixes a run's random sequence | retro-shmup ADR-0019 |
| Simulation | A game's deterministic core, built by the verifier from the game's signed release tag, one build per version | ADR-0001 |
| Verdict | The Worker's outcome for one run, computed from the verifier's report: `verified`, `rejected` or `unverifiable` | ADR-0001 |
| Verifier | The homelab service that pulls pending runs, replays them in a sandbox and posts reports | ADR-0001 |
