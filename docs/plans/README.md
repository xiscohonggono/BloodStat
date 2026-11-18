# Plans

A ledger of how BloodStat was built. Each plan is one file covering one piece of work.

- `pending/`: planned but not yet built.
- `implemented/`: built and merged. Includes what was actually done and how it was verified.

Why each design choice was made lives in [../decisions.md](../decisions.md). Plans link to those decisions instead of repeating them.

## Conventions

- **File name:** `YYYY-MM-DD-short-name.md`, using the date the plan was written.
- **When work merges:** move the file from `pending/` to `implemented/` with `git mv`, so its history is kept. Fill in **Outcome**, and leave the original plan text as it was.
- **Abandoned plans:** keep them in `pending/` with `Status: dropped` and the reason.
- **Template:**

```markdown
# <Title>

- Status: pending | implemented | dropped
- Planned: YYYY-MM-DD
- Merged: YYYY-MM-DD, <PR or commit>
- Decisions: D<n>, D<n>

## Goal
What this achieves, and for whom.

## Plan
What will change, and what is deliberately left out.

## Done when
Observable checks that prove it works.

## Outcome
Filled in on merge: what was built, how it was verified, and what was deferred.
```

## Ledger

| Plan | Status |
|---|---|
| [Pitch demo frontend](implemented/2026-11-18-pitch-demo-frontend.md) | implemented |
| [Docker image and demo script](implemented/2026-11-18-docker-and-demo-script.md) | implemented |
| [Data sources fact-check](implemented/2026-11-18-data-sources-fact-check.md) | implemented |
| [Calculation unit tests](implemented/2026-11-18-calc-unit-tests.md) | implemented |
| [Verify FHIR Box rollout dates](pending/2026-11-18-fhir-box-rollout-dates.md) | pending |
| [Validate the example bundle](pending/2026-11-18-validate-example-bundle.md) | pending |
| [Handover: ownership and licence](pending/2026-11-18-handover-ownership-licence.md) | pending |
