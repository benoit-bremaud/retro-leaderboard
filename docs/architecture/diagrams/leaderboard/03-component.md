# Component diagram — leaderboard — Worker, verifier and their ports

> **Feature**: epic benoit-bremaud/retro-shmup#166
> **Related ADRs**: ADR-0001, ADR-0002, ADR-0003
> **Realises**: UC1–UC6 · **See also**: `02-sequence-submit-verify.md`

## Context

Two deployables: the Worker on Cloudflare (Free plan) and the verifier on the homelab. Inside the
Worker, the domain (run rules, validation, verdict rules) depends only on ports; the adapters
bind D1, the rate limiter and the secrets. The verifier reuses the same run codec (shared module
in this repository) and loads each game's simulation package by version.

## Diagram

```mermaid
---
title: component — Shared leaderboard
---
flowchart TB
    game["«component» Game client (retro-shmup …)"]
    subgraph worker ["«component» Leaderboard Worker (Cloudflare)"]
        http["HTTP router (routes v1, CORS, error codes)"]
        domain["Domain: run validation, run lifecycle, board query rules"]
        codec["Run codec (shared)"]
        storePort(["RunStore port"])
        limitPort(["RateLimit port"])
        d1Adapter["D1 adapter"]
        rlAdapter["Rate Limiting binding adapter"]
        cron["Cron: daily salt rotation, purge, expiry"]
    end
    d1[("D1 database")]
    subgraph homelab ["«component» Verifier (homelab, systemd timer)"]
        puller["Pending-run puller"]
        replayer["Replayer (10 s CPU ceiling)"]
        sims["Simulation packages by version (@retro/slug-sim@semver)"]
    end

    game -->|"HTTPS JSON"| http
    http --> domain
    domain --> codec
    domain --> storePort
    http --> limitPort
    storePort -.-> d1Adapter
    limitPort -.-> rlAdapter
    d1Adapter --> d1
    cron --> storePort
    puller -->|"HTTPS bearer token"| http
    puller --> replayer
    replayer --> codec
    replayer --> sims
```

## Notes

- Dependency rule: `domain` imports neither D1 nor the Workers runtime; adapters implement the
  ports. Tests replace the ports, never the domain.
- The run codec is the only code shared by the Worker and the verifier: one source of truth for the
  run format (see the retro-shmup client issue for its definition).
- The verifier never writes to D1 directly: every verdict goes through the Worker's rules.
