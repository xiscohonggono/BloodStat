# Calculation unit tests

- Status: implemented
- Planned: 2026-11-18
- Merged: 2026-11-18, commit 43d2502, PR #2 (xiscohonggono/BloodStat)
- Decisions: D5, D6, D8, D13

## Goal

Pin the measure definitions down with tests, so a later change can't silently alter a number the pitch depends on.

## Plan

- Use `node:test` and `node:assert/strict` only, with no new dependencies.
- `tests/harness.ts` loads the compiled `demo/more.js` and `demo/app.js` into a `node:vm` context with minimal browser stubs.
- `tests/fixture.ts` is a small hand-built dataset. The expected values are computed by hand in comments next to each assertion.
- `npm test` builds first and then runs the tests. `tsconfig.scripts.json` includes `tests`, so `npm run typecheck` checks them too.

**Delegation:** Codex wrote the tests from a written brief. Claude reviewed them and re-ran the gates.

## Done when

- `npm run typecheck` is clean and `npm test` passes.
- Deliberately breaking a rule makes a test fail.

## Outcome

**Results:** 14 of 14 tests pass and typecheck is clean.

**Mutation checks:**
- Dropping orders with no lab from the denominator failed 2 tests.
- Removing the funnel's lower clip at 0 failed 1 test.

**Not covered:** the data generator and the HTML rendering.

**No CI:** the repo has no CI, so run `npm test` locally before merging.
