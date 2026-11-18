# Pitch demo frontend

- Status: implemented
- Planned: 2026-11-18
- Merged: 2026-11-18, commit 91f0ec2 (MVP_v0.1) and PR #1 (xiscohonggono/BloodStat)
- Decisions: D1–D8, D10, D11, D13, D15

## Goal

Two professors at the early-December 2026 pitch should come away believing the data model, the measures and the evaluation design are sound. One works in health information system development, the other in biostatistics and bioinformatics.

## Plan

A static browser demo on synthetic data, in English with a Traditional Chinese toggle, with seven screens:

1. **Data load:** the steward approves the held October load.
2. **Overview:** a 2×2 measure label, with balancing measures.
3. **Review queue:** flagged cases, each stamped with the reviewer's decision.
4. **Department report:** an anonymous funnel plot of prescribers.
5. **Thresholds:** draft a change, simulate its impact, approve it with a future effective date.
6. **Plasma:** INR and dose, demand.
7. **Data sources:** TW Core mapping and the proposed transfusion bundle.

**Deliberately left out:** backend, authentication, real data ingest, persistence (a page reload resets the demo).

## Done when

- Every screen renders at 1280 px and at 390 px with no horizontal overflow.
- The language toggle covers every string.
- Figures for the default seed match the demo script.

## Outcome

**Built:**
- `scripts/generate.ts`: seeded generator for 12 months, 7 departments and about 5,744 transfusions.
- `src/app.ts`: the shell and the load, overview and review screens.
- `src/more.ts`: the department report, thresholds, plasma and data sources screens.
- `demo/styles.css`: styles.

The design process (product brief, design direction, `DESIGN.md`) is recorded in `PRODUCT.md`, `DESIGN.md` and `.impeccable/`.

**Reviews:**
- The design finish review first returned "fix" with 8 findings; all were fixed and the second pass returned "ship".
- A Codex code review raised:
  - the length-of-stay aggregate;
  - after-review coverage not disclosed;
  - missing labs hidden;
  - department length of stay;
  - focus lost on re-render;
  - half-implemented tabs;
  - "pt" left untranslated in Chinese.

  All were fixed.
- A self-review fixed:
  - the invalid R4 `usedReference` (now an extension);
  - an effective date that could fall in the past;
  - overflow on the sources page.

**Not done:** an independent review of the four later screens (the review agents were blocked by a tool hook).
