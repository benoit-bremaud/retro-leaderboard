# ADR-0005: Identify games by a stable slug, a mode and a semantic version

**Status:** Accepted — 2026-11-12 (owner decision).

Every run names its game by a stable slug chosen once and independent of the repository name, a mode, and the game's semantic version, all checked against a server allowlist.

## Context

The service is shared by several games. The first, retro-shmup, has a provisional repository name:
the commercial title is still open. Boards are per game and per mode; replay needs the exact game
version (ADR-0001).

## Decision drivers

Stability on rename (30), readability in URLs and logs (30), simplicity (25), URL safety (15).

## Options considered

| Option | Stability | Readability | Simplicity | URL safety | Total /500 |
|---|---|---|---|---|---|
| A'. Stable slug chosen once + mode + semver | 5 | 5 | 5 | 5 | 500 |
| A. Repository name | 2 | 5 | 5 | 5 | 410 |
| B. Integer id | 5 | 2 | 4 | 5 | 385 |
| C. UUID | 5 | 1 | 3 | 5 | 330 |

## Decision

1. **Game id**: `^[a-z][a-z0-9-]{1,31}$`, chosen when the game joins and never changed, even when
   the game is renamed. retro-shmup's is `shmup`.
2. **Mode**: `^[a-z][a-z0-9-]{0,15}$`, one board per (game, mode), e.g. `arcade`.
3. **Game version**: semantic version `MAJOR.MINOR.PATCH` without pre-release (only tagged
   releases submit; a dev build has no online submission).
4. **Allowlist**: `src/games.ts` lists each game with its modes, its allowed origins (CORS,
   ADR-0003), its maximum run length in frames (`maxFrames`, which also sets the replay CPU
   ceiling, ADR-0001) and its accepted versions. Adding a game or a version
   is a pull request through the gate.
5. Routes use the ids as path segments: `/v1/boards/{game}/{mode}`.

## Consequences

- Renaming retro-shmup changes nothing on the board.
- A new game version must be published to the verifier (ADR-0001) and allowlisted before its runs
  can be verified; runs of an unknown version are refused with `400 unknown-version`.
