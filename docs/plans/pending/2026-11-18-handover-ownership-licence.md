# Handover: ownership and licence

- Status: pending
- Planned: 2026-11-18
- Decisions: D13

## Goal

Let the department take BloodStat over, or someone continue it, with no doubt about who owns it, how it may be used, or what it actually is.

## Plan

1. **Ownership:** check the university's and the TEEP programme's rules on intellectual property for student work. They may assign it to the university by default. Agree ownership with Jonathan before choosing a licence.
2. **Licence:** add a `LICENSE` file. MIT or Apache-2.0 makes a goodwill handover unambiguous.
3. **README:** state plainly what it is and isn't:
   - it is a static demo on synthetic data;
   - there's no backend, authentication or real data ingest;
   - it hasn't been clinically validated.

   Link `docs/decisions.md` and `docs/plans/`.
4. **Keep the ledger current:** move each finished plan into `implemented/` and add a decision whenever a design choice changes.

## Done when

- The `LICENSE` file is present.
- The README states the demo's limits.
- Ownership is confirmed in writing (an email is enough).
