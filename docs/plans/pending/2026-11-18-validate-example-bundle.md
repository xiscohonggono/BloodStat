# Validate the example bundle

- Status: pending
- Planned: 2026-11-18
- Decisions: D11

## Goal

Before the pitch, be able to show that the transfusion bundle on the Data sources screen is valid FHIR R4. A real integration team would check this first, and it's a strong answer to "how do you know?"

## Plan

1. Export the JSON from `exampleBundle()` for one red-cell transfusion and one plasma transfusion.
2. Run the official HL7 FHIR validator (`validator_cli.jar`) on both, with the TW Core IG v1.0.0 package loaded.
3. Fix the errors in `src/more.ts`. Record which warnings remain and why; for example, the proposed extensions have no published definitions.
4. Optional: if the fixes are stable, add a test that checks the bundle shape still passes.

**Not part of this plan:** writing StructureDefinitions for the proposed profile. That's a separate plan if the panel is interested.

## Done when

- The validator reports no errors for either bundle.
- The remaining warnings are listed in this file's Outcome.
- The validator command used is recorded, so someone else can repeat it.

## Note

The validator needs Java. Run it with Docker if you'd rather not install Java locally.
