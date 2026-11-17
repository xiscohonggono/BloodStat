# BloodStat
Jonathan and William's attempt at creating a dashboard for doctors, blood service committees, etc to measure their red cell and plasma transfusion habits against the AABB standards and the growing database  &amp; research in the case for plasma.

## Pitch demo

A static, offline demo with synthetic data (no server, no network).

```bash
npm install
npm run demo        # generates demo/data.js and compiles src/app.ts to demo/app.js
```

Then open `demo/index.html` in a browser. `npm run typecheck` checks both the app and the generator.
`node scripts/generate.ts <seed>` regenerates the data with a different seed. Every record is synthetic.
