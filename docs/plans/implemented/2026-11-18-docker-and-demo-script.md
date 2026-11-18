# Docker image and demo script

- Status: implemented
- Planned: 2026-11-18
- Merged: 2026-11-18, commit b949b53, PR #1 (xiscohonggono/BloodStat)
- Decisions: D13, D14

## Goal

Make the demo something you start once and leave running, not a build that has to be redone each time. Write down exactly what to say and click during the pitch.

## Plan

- **Dockerfile:**
  - build stage on `node:24-alpine`: generate the data and compile the TypeScript;
  - runtime on `nginxinc/nginx-unprivileged:alpine`, so nginx runs as non-root.
- **`compose.yaml`:** binds `127.0.0.1:8765:8080` and restarts unless stopped. `SEED` is a build argument.
- **`docs/demo-script.md`:** a 7-minute walkthrough with exact figures for the default seed, likely questions, and a checklist before the pitch.

## Done when

- `docker compose up -d --build` serves the demo on http://localhost:8765 as a non-root user.
- The browser console is clean.

## Outcome

**Built as planned.** An empty `data:` favicon removed a 404 in the console. The README has a "Run in Docker" section.

**Figures checked:** the demo-script figures were computed from the generated data for seed 20261201, for example October red cells at 26.5% (101 of 381 orders).
