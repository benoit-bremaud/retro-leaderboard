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

1. **Rate limits** (binding, 60 s window): `POST /v1/runs` 5 per key, read routes 60 per key,
   `DELETE /v1/runs/{id}` 5 per key. Over the limit: `429` with `Retry-After`.
2. **Key** = SHA-256(client address ‖ daily salt) as hex. The salt is a Worker secret rotated
   daily by a cron trigger; the address and the hash are never written to storage or logs.
3. **Guards on `POST /v1/runs`**: `Content-Type: application/json`, body at most 64 KiB, a strict
   schema (unknown fields refused), game id and mode on the server allowlist (ADR-0005), name and
   country per ADR-0004, input frames within the game's maximum run length. Any violation: `400`
   with a stable error code, never a stack trace.
4. **Verifier cost ceiling**: 10 s of CPU per replay (ADR-0001); a run that hits it is `rejected`.
5. **Names**: a server-side deny list of offensive words (substring match on the normalised name);
   the owner can hide any run by its id (`hidden` flag, admin route behind the verifier token).
6. **CORS**: only the games' origins (allowlist per game); no credentials.
7. A challenge widget (Turnstile) is added only by a superseding ADR, after an abuse the
   measures above did not stop.

## Consequences

- No third-party script in the games, no CSP change, no friction on mobile.
- A distributed attack can exceed the per-location limits; the verifier's one-at-a-time queue and
  the 7-day expiry bound the damage. Accepted for a hobby board.
- The rate limits are not testable locally against the real binding: tests mock the binding at its
  port (Cloudflare documentation: local development simulates it).
