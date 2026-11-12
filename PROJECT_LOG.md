# Project log — retro-leaderboard

Chronological operational log of the project, complementing `git log` with the decisions and context behind each step.

## 2026-11-12 — Repository created

- Owner MCDA (2026-11-12): a dedicated repository on Cloudflare Workers (460/500) over a folder in
  retro-shmup (275) or a monorepo (330). Tracking epic: benoit-bremaud/retro-shmup#166.
- Owner approval to create it public (ADR-0005 of the agents-skills rules) and to track it on the
  GitHub Project #80 `retro-shmup` (405/500 over a dedicated Project, 335).
- Bootstrap commit on `main`: local CI per skill `local-ci` (L0–L3, attestation, `just merge`),
  TypeScript strict, Vitest, ESLint, knip, Prettier, SonarQube config, a 501 placeholder Worker.
- Next: the conception study (use cases, submit/verify sequence, data model, ADRs) in one PR.
