# ADR-0003: Limit abuse with rate limits and request guards, no challenge widget

**Status:** Accepted — 2026-11-12 (owner decision).

The public routes are protected by the Workers Rate Limiting binding keyed on a salted hash of the client address, strict request guards, and the replay itself; no challenge widget is added to the games.

## Context

Replay (ADR-0001) stops forged scores. What remains: spam of real runs, offensive names, oversized
or malformed bodies, and runs crafted to make the verifier spend CPU. The Rate Limiting binding is
generally available, takes a 10 or 60 s window, and is approximate and per Cloudflare location
(documentation read on 2026-11-12).

## Decision drivers

Protection (35), privacy (25), simplicity (25), player friction (15).

## Options considered

| Option | Protection | Privacy | Simplicity | Friction | Total /500 |
|---|---|---|---|---|---|
| A. Rate Limiting + salted address hash + guards | 4 | 5 | 5 | 5 | 465 |
| B. A + Turnstile challenge on submit | 5 | 3 | 3 | 3 | 370 |
| C. HMAC token signed by the client | 2 | 4 | 2 | 4 | 280 |

C is rejected outright: the key would ship in the client, so the signature proves nothing.

## Decision

1. **Rate limits** (binding, 60 s window): `POST /v1/runs` 5 per key, read routes (`GET /v1/boards/{game}/{mode}`, `GET /v1/runs/{id}`) 60
   per key,
   `DELETE /v1/runs/{id}` 5 per key. Over the limit: `429` with `Retry-After`.
2. **Key** = SHA-256(client address ‖ daily salt) as hex, with daily salt =
   HMAC-SHA-256(`RATE_KEY_SECRET`, current UTC date). The secret is a Worker secret rotated yearly;
   the salt changes every day without any job or storage. The address, the salt and the key are
   never written to storage or logs.
3. **Guards on `POST /v1/runs`**: `Content-Type: application/json`, body at most 64 KiB, a strict
   schema (unknown fields refused), game id and mode on the server allowlist (ADR-0005), name and
   country per ADR-0004, input frames within the game's maximum run length. Any violation: `400`
   with a stable error code, never a stack trace. The body size is checked while reading the
   stream, not from `Content-Length` alone. A run identical to a stored one (same `runDigest`)
   answers `409 duplicate-run`.
4. **Verifier cost ceiling**: a CPU ceiling derived from `maxFrames`, 10 s at most, plus memory
   and wall-clock ceilings (ADR-0001); a run that hits one is `rejected`.
5. **Names**: a server-side deny list of offensive words (substring match on the normalised name);
   the owner hides any run by its id with `wrangler d1 execute` (sets `hidden = 1`). No admin HTTP
   route exists, so no admin secret can leak; the verifier token cannot moderate.
6. **CORS**: only the games' origins (allowlist per game); no credentials.
7. **Logs**: Workers invocation logs are disabled in the Worker configuration
   (`observability.logs.invocation_logs = false`), so request URLs and headers are never recorded;
   the code logs run ids and error codes only.
8. A challenge widget (Turnstile) is added only by a superseding ADR, after an abuse the
   measures above did not stop.

## Consequences

- No third-party script in the games, no CSP change, no friction on mobile.
- A distributed attack can exceed the per-location limits; the verifier's one-at-a-time queue and
  the 7-day expiry bound the damage. Accepted for a hobby board.
- The rate limits are not testable locally against the real binding: tests mock the binding at its
  port (Cloudflare documentation: local development simulates it).
