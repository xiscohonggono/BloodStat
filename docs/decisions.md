# Design decisions

Why BloodStat is built the way it is. Each entry records the decision, the reason, and what was rejected. When a decision changes, don't edit the old entry: mark it **Superseded by D<n>** and add a new one. How each piece was built is in [plans/](plans/README.md).

## Product

### D1. Retrospective monthly feedback, not alerts at the moment of ordering

**Decision:** BloodStat reviews last month's transfusions in a monthly batch and feeds the results back to departments. It doesn't interrupt clinicians while they order.

**Why:** alerts at the point of order (for example Stanford's red-cell decision support) need deep integration with each hospital's ordering system and cause alert fatigue. A monthly review needs no data entry from clinicians and can run on data that FHIR Box will already hold.

**Cost:** audit and feedback is a weaker intervention than ordering alerts. We don't borrow Stanford's 42% reduction as our forecast; audit and feedback typically gives modest improvements.

### D2. Flag, don't blame

**Decision:** a rule only *flags* a transfusion. A committee reviewer decides with the chart whether it was justified (the review queue). No doctor is named or ranked publicly; each doctor sees only their own position in the department.

**Why:** the "last Hb" rule can't see context such as active bleeding, so a flag is a prompt to look, not a verdict. Feedback that clinicians read as an accusation gets disputed instead of acted on.

### D3. Clinicians own the thresholds

**Decision:** each department's threshold is stored data that the committee chair approves. Before approving a change, the chair sees how many past transfusions it would reclassify. A change applies from its effective date and never rewrites past months.

**Why:** the software applies rules and doesn't make them. Not rewriting history keeps the monthly figures comparable over time.

**Open:** which guideline is the source of the default thresholds: AABB 2023, or the guideline effective 1 April 2026.

### D4. Plasma is an evidence gap, not a "transfuse less" target

**Decision:** for plasma, BloodStat reports a missing INR and low dose (under 10 mL/kg) and tags INR ≤ 1.5 as "Evidence uncertain". It doesn't present plasma use as overuse.

**Why:** the evidence for plasma thresholds is weaker than for red cells. The only place we suggest giving *more* is dose: fewer transfusions, each adequately dosed.

### D5. Missing data is shown, never dropped

**Decision:**
- Orders with no lab result in the window stay in the denominator and are counted separately.
- Plasma without a weight is counted but gets no dose.
- A month's data load is held until the data steward approves it.

**Why:** dropping orders with no lab makes the flag rate look lower than it really is. Showing data quality openly is the basis for trusting the figures.

## Measures and statistics

### D6. Definitions of the core measures

- **Flagged:** a lab result in the 24 hours before issue that is *at or above* the threshold (Hb for red cells, INR for plasma).
- **No lab:** no result in that window.
- **Flag rate:** flagged ÷ *all* orders in scope.
- **Not justified after review:** (flagged − reviewed "appropriate") ÷ all orders.
- **Usage:** units per 100 patient-days.
- **Single-unit share:** orders of one unit ÷ all orders.

The calculation tests (`tests/calc.test.ts`) pin these definitions down.

### D7. Balancing measures sit next to usage

**Decision:** mortality and length of stay are shown next to the transfusion measures.

**Why:** using less blood isn't success if outcomes get worse.

### D8. Funnel plots, not league tables

**Decision:** prescribers within a department are compared on a funnel plot. The limits are p0 ± z·√(p0(1−p0)/n), with z = 1.96 (95%) and z = 3.09 (99.8%), clipped to [0, 1].

**Why:** a league table ranks noise. A funnel plot widens the limits for doctors with few orders, so random variation isn't flagged. It's the standard method for comparing providers with different volumes.

### D9. Evaluation design, if piloted

**Decision:**
- Show the effect with a monthly interrupted time series, with departments brought in one at a time so the departments still waiting serve as a comparison.
- Validate the flags with two clinicians who independently review about 200 transfusions, with borderline cases over-sampled, and report Cohen's kappa.

**Why:**
- A simple before-and-after comparison is confounded by the FHIR Box rollout and guideline changes happening at the same time.
- Raw percentage agreement looks high just because most cases are easy.

## Data and standards

### D10. Labs come from TW Core; transfusions come from the blood bank system

**Decision:**
- Labs, weight and encounters come through TW Core (FHIR R4) via MOHW FHIR Box.
- Transfusion events and blood products come from the hospital blood bank system.

**Why:** TW Core IG v1.0.0 has no transfusion or BiologicallyDerivedProduct profile. MOHW plans FHIR Box to go live in medical centres by the end of 2026 (reported September 2026), so lab data via FHIR Box is a near-term assumption, not a speculative one.

### D11. Propose a TW Core transfusion profile

**Decision:** the example bundle models a transfusion as three resources:
- a Procedure with SNOMED 116859006 "Transfusion of blood product";
- a BiologicallyDerivedProduct;
- a TW Core lab Observation.

The Procedure links to the product through an extension.

**Why:** in R4, `Procedure.usedReference` can't reference a BiologicallyDerivedProduct. Without a national profile, each hospital would record transfusions differently, so proposing one is part of the contribution.

**Verified:** the profile URLs and all codes were checked against the TW Core IG and tx.fhir.org on 18 Nov 2026. **Not yet done:** validating the bundle with the HL7 FHIR validator.

### D12. Dose uses the actual component volume

**Decision:** plasma dose = component volume (mL) ÷ patient weight (kg), not units × a nominal volume.

**Why:** Taiwan blood bags come in 250 mL and 500 mL donation equivalents, so unit counts don't map to a fixed volume.

## Demo build

### D13. Static TypeScript and HTML with synthetic data

**Decision:**
- TypeScript compiled to plain browser scripts, with no framework, server or network.
- The data is synthetic, from a seeded generator (default seed `20261201`), and labelled as synthetic on screen.

**Why:**
- The goal is a pitch demo that has to run on a laptop with nothing that can fail on the day.
- There's no real hospital data, and we must not fabricate outcomes or partnerships.
- A fixed seed keeps every number in the demo script reproducible.

**Cost:**
- There's no backend, authentication or real data ingest.
- The calculations live in global scripts, not modules, so the tests load the compiled scripts into a `node:vm` context.

### D14. Docker for running the demo

**Decision:** a two-stage image. Node builds the data and compiles the scripts; a non-root nginx serves the static files on `127.0.0.1:8765`.

**Why:** the build happens once and the demo stays up across reboots, matching the team's Docker workflow.

### D15. Fictional hospital, "blood label" visual design

**Decision:**
- The hospital is shown as "Demo Medical Centre", with no Tzu Chi name or logo.
- The visual design borrows from blood component labels: ink on white stock, red (#9f1820) and straw (#e0ac1f) bands for the product type, square corners.
- English first, with a Traditional Chinese toggle.

**Why:**
- A fictional name avoids implying a hospital partnership.
- The label design makes every transfusion read like the physical unit it came from.

See `DESIGN.md` and `PRODUCT.md`.
