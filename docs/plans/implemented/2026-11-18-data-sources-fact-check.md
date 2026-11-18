# Data sources fact-check

- Status: implemented
- Planned: 2026-11-18
- Merged: 2026-11-18, commit 8a72e79, PR #2 (xiscohonggono/BloodStat)
- Decisions: D10, D11

## Goal

The Data sources screen is the part of the demo a health-information-systems professor will inspect most closely. Every URL and code on it must be correct.

## Plan

Check each profile URL and terminology code in `src/more.ts` against the official sources, and fix any that are wrong.

## Done when

Every URL and code on the screen has been checked against an official source, and the check is recorded with its date.

## Outcome

**TW Core IG v1.0.0 canonical URLs confirmed:**
- `https://twcore.mohw.gov.tw/ig/twcore/StructureDefinition/Procedure-twcore`
- `.../Observation-laboratoryResult-twcore`

The lab profile requires category `laboratory` and `effective[x]`.

**Codes confirmed active on tx.fhir.org:**
- SNOMED 116859006
- LOINC 718-7, 6301-6, 34714-6 and 29463-7

Everything was already correct, so `src/more.ts` was left unchanged. The check is recorded in the checklist in `docs/demo-script.md`.
