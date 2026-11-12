# retro-leaderboard

One online leaderboard API shared by the owner's retro browser games, verified by replaying each run on the server.

**Status:** conception study — no service is deployed yet. Tracking epic:
[benoit-bremaud/retro-shmup#166](https://github.com/benoit-bremaud/retro-shmup/issues/166).

## What it will do

- Accept a finished run from a game (game id, game version, seed, recorded inputs, claimed score,
  display name, optional country).
- Replay the run with that game version's deterministic simulation and accept the score only when
  the replay reproduces it.
- Serve the top scores per game, mode and period.

## Stack

Cloudflare Worker, TypeScript strict, Vitest. Local CI only (`just`, `lefthook`, `mise`); see
[CLAUDE.md](CLAUDE.md).

## Development

```sh
mise install
mise x -- just setup
mise x -- just check
```

## License

[MIT](LICENSE).
