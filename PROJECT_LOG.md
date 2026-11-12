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

## 2026-11-12 — Conception study merged (#1, PR #2, 783317d)

- Owner MCDA decisions: verification by replay on the homelab (D, 365, owner override of Workers
  Paid A 425 for zero cost), D1 (480), rate limits + salted hash + guards without Turnstile (465),
  replay purge at 90 days except top 100 (445, owner override), game id = slug + mode + semver
  (500), lawful basis = legitimate interest (430), score rows kept 2 years outside top 100 (420),
  client-chosen seed risk accepted (420).
- Agent choices recorded in the ADRs: no admin HTTP route (moderation with `wrangler d1 execute`),
  simulations built from signed game tags instead of a package registry.
- Adversarial review (Opus), three rounds: 9 Must → 2 Must → 0 Must; `just gate` green and
  attested on da64036, merged with `just merge 2`.
- SonarQube: `~/.config/sonar-tokens/retro-leaderboard` is a symlink to the global analysis token
  (skill `infra-accounts`); exporting `SONAR_TOKEN` breaks the "no token" wiring test.
- Follow-ups filed on Project #80 (Todo), sub-issues of retro-shmup#166: retro-shmup#167 (client
  run recording and "Send online"), #3 submit, #4 D1 store, #5 boards and status, #6 erasure,
  #7 verifier, #8 security limits, #9 purge cron, #10 allowlist and privacy page, #11 STRIDE threat
  model.
