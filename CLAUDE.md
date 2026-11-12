# CLAUDE.md — retro-leaderboard

## Project overview

**Name:** retro-leaderboard.
**Type:** one online leaderboard API shared by every retro browser game of the owner (retro-shmup
first). Cloudflare Worker, TypeScript strict. Scores are verified server-side by replaying the run
from its seed and recorded inputs.
**Status:** conception study (epic
[benoit-bremaud/retro-shmup#166](https://github.com/benoit-bremaud/retro-shmup/issues/166)). No
implementation code until the UML study and the ADRs are merged; `src/worker.ts` is a 501
placeholder that gives the local CI something to check.
**Kanban:** GitHub Project #80 `retro-shmup` (owner decision 2026-11-12).
**Language:** English only in the repository (code, comments, commits, docs, issues, PRs).

Global rules (Conventional Commits, branch from `main`, no `any`, no default exports, pre-push
review gate, public by default, security defaults) are inherited from `~/.claude/CLAUDE.md` and
`~/.agent-rules/common.md` — not duplicated here.

## Non-negotiables (project)

- **Design before code.** A route, a store or a verification rule is implemented only after its
  UML diagrams (`docs/architecture/diagrams/<feature>/`) and its ADR (`docs/decisions/`) are merged.
- **Validated decisions are not reopened silently**: a change needs a superseding ADR.
- **Security policy on every diff** (`security-policy`, `security-ci-baseline`). Every request body
  is untrusted: validated by allowlist, size-capped, parsing never throws. No secret in code or
  logs. Any security finding is a Must.
- **Privacy by design.** Store the minimum (display name, optional country, score, run data);
  no account, no email, no raw IP address at rest.
- **The verifier is the game's own simulation.** The server replays a run with the exact game
  version that produced it; it never trusts a client-computed score.
- **Tests:** unit tests on the domain, integration tests on the Worker with its bindings mocked at
  their ports, never the domain.

## Repository layout

```
docs/decisions/     ADRs (Nygard format, NNNN-kebab-title.md)
docs/architecture/  UML diagrams (Mermaid) and the conception README
src/                Worker source (placeholder until the first brick)
tests/              Vitest, mirroring src/
scripts/            local CI scripts (attestation, wiring tests, doc coverage, drift)
```

## Commit scopes (Conventional Commits)

`adr`, `uml`, `docs`, `ci`, `repo`, `deps`, `api` (routes, contracts), `verify` (run replay),
`store` (persistence), `security`, `tests`. Enforced by `scripts/check-commit-msg.sh`.

## Quality gate — local only (skill `local-ci`)

- `just fast` (pre-commit), `just check` (pre-push: typecheck, lint, knip, format, Vitest with
  coverage, doc coverage, wiring tests, Semgrep CE, `pnpm audit --audit-level high`, gitleaks full
  history), `just gate` (before every merge, on the pushed head: `check` + local SonarQube, then the
  signed `gate` attestation), `just nightly` (TruffleHog, toolchain drift).
- `just merge <pr>` is the only merge path. Run tiers as `mise x -- just <tier>`.
- The SonarQube token lives in `~/.config/sonar-tokens/retro-leaderboard` — never in the repo.
- A branch that changes the files defining the gate (`justfile`, `lefthook.yml`, `mise.*`,
  `scripts/`, `package.json`, tool configs) is gated only with `GATE_CI_CHANGE=1`, after reading them.

## Workflow reminders

- After every merged PR: `PROJECT_LOG.md` entry, post-merge cleanup, memory compression.
- The repository is **public**; never commit anything that must stay private.
