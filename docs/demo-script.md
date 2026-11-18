# BloodStat demo script

Target length: about 7 minutes of demo inside a 15-minute pitch. Audience: one professor in health information system development, one in biostatistics and bioinformatics.

## Before you start

- Run `docker compose up -d --build` and open http://localhost:8765. Reload the page right before presenting: every reload resets the demo to the held October load.
- Browser zoom 100–110%, window at least 1280 px wide. Keep the language on English; switch to 中文 once to show it works.
- All figures below come from the default seed (`20261201`). A different seed changes every number.
- Say once, early: "Everything you see is synthetic data generated for this demo. No real patient or hospital data."

## The walkthrough

### 1. Data load (about 45 s)

**Screen:** Data load, October 2026, marked HELD.

**Do:** point at the two blocking checks (3 blood orders with no issue record, 2 issued units with no administration record). Click "Mark resolved in source system" on both, then "Approve and publish".

**Say:**
- "Each month's data lands around the 3rd working day and is held until the blood bank's data steward approves it. Wrong data never reaches the dashboards."
- "Missing weights are a warning, not a block: the load can publish, but plasma dose can't be computed for those orders, and we say so."

**For the HIS professor:** this is the reconciliation step between three separate records: the order, the blood bank issue and the bedside administration.

### 2. Overview (about 1 min)

**Screen:** Overview, now showing October.

**Point at:**
- 26.5% of red-cell orders were given at or above the committee's Hb threshold: 101 of 381 orders.
- "All orders are the denominator": we don't quietly drop the 12 orders with no Hb in the 24 hours before issue; they're counted and disclosed in the label's foot.
- "No flags reviewed yet for this month": the after-review figure appears only once someone has reviewed cases.
- Balancing measures sit next to usage: mortality and length of stay. Using less blood is not success if outcomes get worse.

**For the biostatistics professor:** the trend is flat on purpose. The synthetic data shows no improvement, because we haven't earned a result yet.

### 3. Review queue: flag, don't blame (about 1 min)

**Do:** open Review queue, filter the department to Intensive Care and open unit **F030226005627** (Hb 7.9 against a 7.0 threshold). Read the chart excerpt: "Intra-operative blood loss about 1.2 L." Click "Appropriate given context". The label is stamped.

**Say:**
- "The rule only flags. A committee reviewer decides with the chart. Active bleeding overrides an Hb above threshold, so this counts as justified, not as an error."
- Go back to Overview: the after-review line now shows how many flags have been reviewed.

### 4. Department report (about 1 min 30 s): the biostatistics moment

**Screen:** Department report, General Surgery, viewing as D01.

**Point at:**
- The department against the hospital on every measure.
- The funnel plot. "Each circle is one anonymous prescriber. The limits are 95% and 99.8% binomial limits around the department average, so a doctor with few orders isn't flagged for random variation. You, D01, see only your own point."
- "A point outside the limits is a prompt to look, not a verdict. No rankings, no names."

**Why a funnel plot and not a league table:** league tables rank noise. Funnel plots are the standard method for comparing healthcare providers with different volumes.

### 5. Thresholds (about 45 s)

**Do:** open Thresholds. In "Draft a change", keep Cardiovascular Surgery and pick 7.0 (it is 8.0 today).

**Point at:** "117 of 554 past transfusions would change classification; flagged now 211, would be flagged 328."

**Do:** click "Approve as chair". It is scheduled for 1 December 2026.

**Say:** "Clinicians set the rules, not the software. The chair sees the impact before approving, and a change applies only from its effective date: we never rewrite past months."

### 6. Plasma (about 1 min)

**Screen:** Plasma, October.

**Point at:**
- 13.1% of plasma orders had no INR in the 24 hours before issue.
- 77.6% of doses with a recorded weight were below 10 mL/kg; the median dose was 5.5 mL/kg, against an effective 10–15 mL/kg. The histogram shows the gap.
- "INR ≤ 1.5" carries an "Evidence uncertain" tag.
- Monthly plasma demand, for the Taiwan Blood Services Foundation's planning.

**Say:** "For plasma we don't claim 'transfuse less'. It's a measurement and evidence gap. The one place we'd suggest giving more is dose: fewer, adequately dosed transfusions."

### 7. Data sources (about 1 min): the HIS moment

**Screen:** Data sources.

**Point at:**
- Labs, weight and admissions come through TW Core via FHIR Box, with their LOINC codes.
- "TW Core v1.0.0 has no transfusion or blood-product profile, so transfusion events come from the blood bank system."
- The proposed profile and the sample bundle: a Procedure, a BiologicallyDerivedProduct and a lab Observation. "In R4, a Procedure can't reference a blood product through `usedReference`, so the profile links it by extension. We'd propose this to MOHW as the national transfusion profile."

### Close (about 15 s)

"Retrospective, private, clinician-governed feedback, on Taiwan's own data standard, with plasma treated honestly as an evidence gap."

### The ask (about 30 s)

End on a request, not a summary. Pick one or two before the day and say them plainly:

- "Is the transfusion profile worth proposing to MOHW? We'd value your view on what it would need."
- "Could you introduce us to someone in the blood bank or the transfusion committee, so we can check these rules against real practice?"
- "We'd like to keep building this inside the department. Would either of you supervise it, or know where it could continue?"

Keep it about what the project needs next. Don't explain why you started it.

## Likely questions

**Why retrospective instead of real-time alerts like Stanford?**
Alerts at the moment of ordering need deep integration with each hospital's ordering system and cause alert fatigue. Monthly feedback needs no clinician data entry and works on the data FHIR Box will already hold. It is a weaker intervention than Stanford's alerts, so we don't borrow their 42% reduction as our forecast. Audit and feedback typically gives modest improvements.

**How will you show it works?**
Monthly interrupted time series, with departments brought in one at a time so the departments still waiting serve as a comparison. A simple 12-months-before versus 12-months-after comparison would be confounded by the FHIR Box rollout and guideline changes happening at the same time.

**How will you validate the classifications?**
Two clinicians independently review a sample of about 200 transfusions with borderline cases over-sampled, and we report Cohen's kappa against the system rather than raw percentage agreement. Raw agreement looks high just because most cases are easy.

**Isn't the "last Hb" rule easy to game, for example by timing the blood draw?**
Partly. That's why units per 100 patient-days and the single-unit share sit next to it, and why every flag goes to human review.

**What about missing data?**
It's shown, never dropped: orders with no Hb, plasma with no INR or no weight, and unmatched records in the load checks.

**Doesn't FHIR Box already store transfusions?**
Hospital data will flow into FHIR Box, but TW Core v1.0.0 has no transfusion profile, so each hospital would record transfusions differently. Proposing that profile is part of our contribution.

**Who pays, and who has to use it?**
Be honest about what is still open: the likely owners are the hospital transfusion committee (accreditation), the Taiwan Blood Services Foundation (supply planning) and MOHW (FHIR Box apps).

**Where does the data go?**
It's deployed inside the hospital network under Taiwan's Personal Data Protection Act; nothing leaves the hospital.

## Check before the pitch

- Verified 18 Nov 2026: the TW Core profile canonical URLs (`Procedure-twcore`, `Observation-laboratoryResult-twcore`, IG v1.0.0), and the SNOMED and LOINC codes on the Data sources screen (116859006, 718-7, 6301-6, 34714-6, 29463-7, all active on tx.fhir.org).
- Still to check: the FHIR Box rollout dates quoted in the deck.
