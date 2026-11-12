# Traceability matrix — retro-leaderboard

Each use case and non-functional requirement mapped to the diagrams, decisions and components that realise it; the test column is filled by the implementation bricks.

## Use cases

| ID | Goal | Diagrams | ADRs | Components | Tests |
|---|---|---|---|---|---|
| UC1 | Publish a run online | 01, 02 (SEQ-submit-verify), 04, 05 | ADR-0003, ADR-0004, ADR-0005 | HTTP router, domain, RunStore | to come (submit brick) |
| UC2 | Browse a board | 01, 02 (SEQ-submit-verify), 04 | ADR-0002 | HTTP router, RunStore | to come (boards brick) |
| UC3 | Erase my run | 01, 05 | ADR-0004 | HTTP router, domain, RunStore | to come (erasure brick) |
| UC4 | Verify pending runs | 01, 02 (SEQ-submit-verify), 03, 05 | ADR-0001 | Verifier, run codec, simulation packages | to come (verifier brick) |
| UC5 | Hide an offensive run | 01, 05 | ADR-0003 | `wrangler d1 execute` runbook (no route) | to come (moderation runbook) |
| UC6 | Add a game or a game version | 01 | ADR-0005, ADR-0001 | `src/games.ts`, verifier builds from signed tags | to come (allowlist brick) |

## Non-functional requirements

| ID | Requirement | Realised by | ADRs | Tests |
|---|---|---|---|---|
| NFR-1 | No score appears on a board without a matching replay | Verifier, run lifecycle | ADR-0001 | to come |
| NFR-2 | No client address, account or email at rest or in logs; invocation logs disabled | Rate-limit adapter, Worker configuration, logging rules | ADR-0003, ADR-0004 | to come |
| NFR-3 | Replay data purged after 90 days and score rows erased after 2 years, except each board's top 100; failed runs erased 7 days after their verdict | Cron job | ADR-0004 | to come |
| NFR-4 | Malformed, oversized or unknown-game requests refused with a stable code, parsing never throws | Domain validation | ADR-0003, ADR-0005 | to come |
| NFR-6 | A crashing or slow replay never blocks the queue | Verifier sandbox, attempt counter | ADR-0001 | to come |
| NFR-5 | No recurring hosting cost | Free plan Worker, homelab verifier | ADR-0001, ADR-0002 | — |
