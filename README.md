# BloodStat
Jonathan and William's attempt at creating a dashboard for doctors, blood service committees, etc to measure their red cell and plasma transfusion habits against the AABB standards and the growing database  &amp; research in the case for plasma.

## Docs

- [docs/decisions.md](docs/decisions.md): why it's designed the way it is.
- [docs/plans/](docs/plans/README.md): how it was built. Covers what has been built (`implemented/`) and what is planned (`pending/`).
- [docs/demo-script.md](docs/demo-script.md): the pitch walkthrough.

## Pitch demo

A static, offline demo with synthetic data (no server, no network).

```bash
npm install
npm run demo        # generates demo/data.js and compiles src/app.ts to demo/app.js
```

Then open `demo/index.html` in a browser. `npm run typecheck` checks the app, the generator and the tests; `npm test` runs the calculation tests.
`node scripts/generate.ts <seed>` regenerates the data with a different seed. Every record is synthetic.

## Run in Docker

```bash
docker compose up -d --build
```

Open http://localhost:8765. The image builds the data and compiles the TypeScript once, then serves the static files from a non-root nginx. Stop it with `docker compose down`. Build with a different data seed using `docker compose build --build-arg SEED=42`.
