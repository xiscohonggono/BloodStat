import assert from "node:assert/strict";
import { test } from "node:test";
import { fixture } from "./fixture.ts";
import { harness } from "./harness.ts";

test("rbcMetrics includes no-lab orders in denominators and uses department outcomes", () => {
  const run = harness(fixture);
  assert.deepEqual(run("rbcMetrics(['2026-08'])"), {
    orders: 4, // r1-r4, excluding plasma and other months.
    flagged: 2, // r1 + r4.
    flaggedPct: 2 / 4, // Two flags / all four RBC orders, including r3 with no lab.
    reviewed: 0, // No review decisions yet.
    noLab: 1, // r3.
    unjustifiedPct: 2 / 4, // (Two flags - zero appropriate) / four orders.
    units: 6, // 1 + 2 + 1 + 2.
    pd: 300, // GS 100 + CVS 200.
    unitsPer100: (6 / 300) * 100, // Six units / 300 patient-days * 100 = 2.
    single: 2, // r1 + r3.
    singlePct: 2 / 4, // Two single-unit orders / four orders.
    mortalityPct: 3 / 30, // (1 + 2) deaths / (10 + 20) discharges.
    los: 150 / 30, // (40 + 110) stay days / 30 discharges = 5.
  });
  assert.deepEqual(run("rbcMetrics(['2026-08'], 'GS')"), {
    orders: 3, // r1-r3.
    flagged: 1, // r1 only; CVS r4 is excluded.
    flaggedPct: 1 / 3, // r3 remains in the denominator.
    reviewed: 0, // No review decisions yet.
    noLab: 1, // r3.
    unjustifiedPct: 1 / 3, // One flag - zero appropriate / three orders.
    units: 4, // 1 + 2 + 1.
    pd: 100, // GS only.
    unitsPer100: (4 / 100) * 100, // Four units / 100 patient-days * 100 = 4.
    single: 2, // r1 + r3.
    singlePct: 2 / 3, // Two singles / three GS orders.
    mortalityPct: 1 / 10, // One death / ten discharges.
    los: 40 / 10, // 40 stay days / ten discharges = 4.
  });
});

test("rbcMetrics aggregates multiple months", () => {
  const run = harness(fixture);
  assert.equal(run("rbcMetrics(approvedMonths()).orders"), 6); // r1-r6; held r7-r8 excluded.
  assert.equal(run("rbcMetrics(approvedMonths()).unitsPer100"), (9 / 700) * 100); // 6 + 3 units / (300 + 400) days * 100.
  assert.equal(run("rbcMetrics(approvedMonths()).mortalityPct"), 4 / 70); // (3 + 1) deaths / (30 + 40) discharges.
  assert.equal(run("rbcMetrics(approvedMonths()).los"), 375 / 70); // (150 + 225) stay days / 70 discharges.
});

test("appropriate reviews reduce unjustifiedPct but other decisions do not", () => {
  const run = harness(fixture);
  run("state.reviews.set('r1', 'appropriate'); state.reviews.set('r4', 'not_justified'); undefined");
  assert.equal(run("rbcMetrics(['2026-08']).reviewed"), 2); // Both flagged orders reviewed.
  assert.equal(run("rbcMetrics(['2026-08']).unjustifiedPct"), 1 / 4); // (2 - 1 appropriate) / all four.
  assert.equal(run("rbcMetrics(['2026-08']).flaggedPct"), 2 / 4); // Review never changes the original flags.
  run("state.reviews.set('r2', 'appropriate'); undefined");
  assert.equal(run("rbcMetrics(['2026-08']).unjustifiedPct"), 1 / 4); // An appropriate unflagged order removes no flag.
});

test("approvedMonths excludes held months and latestApproved follows approval state", () => {
  const run = harness(fixture);
  assert.deepEqual(run("approvedMonths()"), ["2026-08", "2026-09"]); // October is held.
  assert.equal(run("latestApproved()"), "2026-09"); // Last approved month in data order.
  run("state.approved.add('2026-10'); undefined");
  assert.deepEqual(run("approvedMonths()"), fixture.months); // All three months now approved.
  assert.equal(run("latestApproved()"), "2026-10"); // Newly approved last month.
  run("state.approved.clear()");
  assert.deepEqual(run("approvedMonths()"), []); // No approvals remain.
  assert.equal(run("latestApproved()"), "2026-08"); // Source-defined fallback to first data month.
});

test("pct formats finite fractions and marks non-finite values", () => {
  const run = harness(fixture);
  assert.equal(run("pct(1 / 3)"), "33.3%"); // 100 / 3 rounded to one decimal.
  assert.equal(run("pct(0)"), "0.0%"); // Zero fraction * 100.
  assert.equal(run("pct(1)"), "100.0%"); // Unit fraction * 100.
  for (const value of ["NaN", "Infinity", "-Infinity"]) assert.equal(run(`pct(${value})`), "–");
});

test("median handles odd, even and empty arrays without mutating input", () => {
  const run = harness(fixture);
  assert.equal(run("median([10, 2, 3])"), 3); // Sorted [2, 3, 10], middle 3; numeric sorting matters.
  assert.equal(run("median([10, 2, 4, 8])"), 6); // Sorted [2, 4, 8, 10], (4 + 8) / 2.
  assert.equal(run("median([5])"), 5); // Sole middle value.
  assert.ok(Number.isNaN(run("median([])")));
  assert.deepEqual(run("const xs = [10, 2, 4, 8]; median(xs); xs"), [10, 2, 4, 8]); // Original order preserved.
});

test("funnelLimit computes normal limits and clips both boundaries", () => {
  const run = harness(fixture);
  assert.deepEqual(run("funnelLimit(0.5, 100, 2)"), [0.4, 0.6]); // SE = sqrt(0.25 / 100) = .05, margin .1.
  assert.deepEqual(run("funnelLimit(0.125, 7, 2)"), [0, 0.375]); // SE = sqrt(.109375 / 7) = .125; -.125 clips to 0.
  assert.deepEqual(run("funnelLimit(0.875, 7, 2)"), [0.625, 1]); // SE = .125, margin .25; 1.125 clips to 1.
  assert.deepEqual(run("funnelLimit(0.5, 1, 2)"), [0, 1]); // SE .5, raw limits [-.5, 1.5].
  assert.deepEqual(run("funnelLimit(0, 10, 2)"), [0, 0]); // Zero binomial variance.
  assert.deepEqual(run("funnelLimit(1, 10, 2)"), [1, 1]); // Zero binomial variance.
});

test("simulateRule uses stored thresholds, inclusive comparisons and approved RBC labs", () => {
  const run = harness(fixture);
  assert.deepEqual(run("simulateRule('GS', 7)"), { total: 4, now: 2, next: 3, changed: 1 }); // r1,r2,r5,r6; r1+r5 now, plus r6 next.
  assert.deepEqual(run("simulateRule('GS', 8)"), { total: 4, now: 2, next: 1, changed: 1 }); // Only r5 reaches 8; r1 loses its flag.
  assert.deepEqual(run("simulateRule('GS', 6)"), { total: 4, now: 2, next: 4, changed: 2 }); // All four reach 6; r2+r6 gain flags.
  assert.deepEqual(run("simulateRule('CVS', 8)"), { total: 1, now: 1, next: 1, changed: 0 }); // Only r4; no GS or plasma orders.
  assert.deepEqual(run("simulateRule('missing', 7)"), { total: 0, now: 0, next: 0, changed: 0 }); // No matching orders.
});

test("plasmaMetrics counts statuses and doses only orders with recorded weight", () => {
  const run = harness(fixture);
  assert.deepEqual(run("plasmaMetrics(approvedMonths())"), {
    orders: 5, // p1-p5, no RBC orders.
    units: 9, // 2 + 2 + 2 + 2 + 1 bags.
    unitsPer100: (9 / 700) * 100, // Nine bags / (100 + 200 + 150 + 250) days * 100.
    noInr: 1, // p2 status no_lab.
    lowInr: 2, // p1 + p5 status flagged.
    noWeight: 1, // Five orders - four doses; p2 lacks weight.
    dosed: [8, 12, 10, 5], // 400/50, 600/50, 500/50, 300/60; omit p2.
    under10: 2, // Doses 8 and 5; exactly 10 is excluded.
    median: 9, // Sorted [5,8,10,12], (8 + 10) / 2.
  });
  assert.deepEqual(run("plasmaMetrics(['2026-08'], 'GS')"), {
    orders: 2, // p1+p2 only.
    units: 4, // 2+2 bags.
    unitsPer100: (4 / 100) * 100, // GS August patient-days only.
    noInr: 1, // p2.
    lowInr: 1, // p1.
    noWeight: 1, // p2 omitted from doses.
    dosed: [8], // p1: 400/50.
    under10: 1, // 8 < 10.
    median: 8, // Sole dose.
  });
});

test("empty metric scopes return zero counts and NaN for undefined ratios", () => {
  const run = harness(fixture);
  assert.equal(run("rbcMetrics([]).orders"), 0); // No selected months.
  assert.equal(run("plasmaMetrics([]).orders"), 0); // No selected months.
  assert.deepEqual(run("plasmaMetrics([]).dosed"), []); // No doses available.
  assert.equal(run("plasmaMetrics([]).under10"), 0); // No doses below ten.
  for (const field of ["flaggedPct", "unjustifiedPct", "singlePct", "unitsPer100", "mortalityPct", "los"]) {
    assert.ok(Number.isNaN(run(`rbcMetrics([]).${field}`)), field); // Each ratio is 0/0.
  }
  assert.ok(Number.isNaN(run("plasmaMetrics([]).median"))); // Median of no doses.
});

test("nextEffectiveDate advances two months from October and rolls December into next year", () => {
  const run = harness(fixture);
  assert.equal(run("nextEffectiveDate()"), "2026-12-01"); // October (10) + 2 = December (12), even though held.
  run("D.months = ['2026-12']");
  assert.equal(run("nextEffectiveDate()"), "2027-02-01"); // December (12) + 2 = February of next year.
});

test("doctorsIn returns sorted distinct RBC prescribers for the department", () => {
  const run = harness(fixture);
  assert.deepEqual(run("doctorsIn('GS')"), ["D01", "D02", "D03"]); // D01/D02 deduplicated, held-month D03 included, plasma P01 excluded.
  assert.deepEqual(run("doctorsIn('CVS')"), ["D04"]); // r4+r8 share D04; no GS prescribers.
  assert.deepEqual(run("doctorsIn('missing')"), []); // No matching department.
});

for (const [id, loinc] of [["r1", "718-7"], ["p1", "6301-6"]]) {
  test(`exampleBundle links ${id} product by extension and supplies laboratory observation ${loinc}`, () => {
    const run = harness(fixture);
    const text = run<string>(`exampleBundle(D.transfusions.find(x => x.id === '${id}'))`);
    assert.equal(typeof text, "string");
    const bundle = JSON.parse(text);
    assert.equal(bundle.resourceType, "Bundle");
    assert.equal(bundle.type, "collection");
    assert.equal(bundle.entry.length, 3); // Procedure, product, Observation.
    const [procedure, product, observation] = bundle.entry.map((entry: { resource: unknown }) => entry.resource);
    assert.equal(procedure.resourceType, "Procedure");
    assert.equal(Object.hasOwn(procedure, "usedReference"), false);
    const link = procedure.extension.find((extension: { url: string }) => extension.url.endsWith("transfused-product"));
    assert.ok(link);
    assert.equal(product.resourceType, "BiologicallyDerivedProduct");
    assert.equal(link.valueReference.reference, `BiologicallyDerivedProduct/${product.id}`);
    assert.equal(product.id, `UNIT-${id}`); // Corresponding fixture donation identifier.
    assert.equal(observation.resourceType, "Observation");
    assert.equal(observation.category[0].coding[0].code, "laboratory");
    assert.equal(observation.effectiveDateTime, "2026-08-10T10:00:00.000Z"); // Noon issue minus two lab hours.
    assert.equal(observation.code.coding[0].system, "http://loinc.org");
    assert.equal(observation.code.coding[0].code, loinc); // RBC Hb 718-7; plasma INR 6301-6.
  });
}
