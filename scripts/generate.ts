// Seeded synthetic data generator for the BloodStat pitch demo.
// Run: node scripts/generate.ts [seed]   (Node 23.6+ strips the types natively)
// Writes demo/data.js. Every value is synthetic; nothing here describes a real hospital.

import { writeFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const SEED = Number(process.argv[2] ?? 20261201);
const PLASMA_INR_THRESHOLD = 1.5;
const LAB_WINDOW_HOURS = 24;
// 12 complete months before the demo month (Nov 2026); the last one arrives held.
const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(Date.UTC(2025, 10 + i, 1));
  return d.toISOString().slice(0, 7);
});

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const between = (lo: number, hi: number) => lo + rand() * (hi - lo);
const int = (lo: number, hi: number) => Math.floor(between(lo, hi + 1));
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)];
const chance = (p: number) => rand() < p;
const round1 = (x: number) => Math.round(x * 10) / 10;

interface DeptProfile {
  dept: Dept;
  doctors: number;
  rbcPerMonth: [number, number];
  plasmaPerMonth: [number, number];
  /** Baseline probability that an RBC order is given at or above threshold. */
  liberal: number;
  singleUnit: number;
  patientDays: [number, number];
}

const PROFILES: DeptProfile[] = [
  { dept: { id: "GS", en: "General Surgery", zh: "一般外科", hbThreshold: 7.0 }, doctors: 8, rbcPerMonth: [45, 70], plasmaPerMonth: [8, 16], liberal: 0.3, singleUnit: 0.45, patientDays: [2600, 3200] },
  { dept: { id: "CVS", en: "Cardiovascular Surgery", zh: "心臟血管外科", hbThreshold: 8.0 }, doctors: 6, rbcPerMonth: [40, 60], plasmaPerMonth: [14, 26], liberal: 0.36, singleUnit: 0.3, patientDays: [1300, 1700] },
  { dept: { id: "ORTH", en: "Orthopaedics", zh: "骨科", hbThreshold: 8.0 }, doctors: 7, rbcPerMonth: [25, 40], plasmaPerMonth: [2, 6], liberal: 0.42, singleUnit: 0.55, patientDays: [2200, 2700] },
  { dept: { id: "MED", en: "Internal Medicine", zh: "內科", hbThreshold: 7.0 }, doctors: 9, rbcPerMonth: [55, 85], plasmaPerMonth: [6, 14], liberal: 0.24, singleUnit: 0.6, patientDays: [3800, 4500] },
  { dept: { id: "HEMONC", en: "Haematology-Oncology", zh: "血液腫瘤科", hbThreshold: 7.0 }, doctors: 6, rbcPerMonth: [60, 90], plasmaPerMonth: [4, 10], liberal: 0.2, singleUnit: 0.5, patientDays: [1900, 2300] },
  { dept: { id: "ICU", en: "Intensive Care", zh: "加護病房", hbThreshold: 7.0 }, doctors: 7, rbcPerMonth: [50, 75], plasmaPerMonth: [18, 32], liberal: 0.28, singleUnit: 0.35, patientDays: [900, 1100] },
  { dept: { id: "GI", en: "Gastroenterology", zh: "胃腸肝膽科", hbThreshold: 7.0 }, doctors: 6, rbcPerMonth: [30, 50], plasmaPerMonth: [10, 20], liberal: 0.26, singleUnit: 0.5, patientDays: [1500, 1900] },
];

type Note = { en: string; zh: string };
const RBC_BLEEDING: Note[] = [
  { en: "Active upper GI bleed; haemodynamically unstable in ED.", zh: "急性上消化道出血，急診時血行動力學不穩定。" },
  { en: "Intra-operative blood loss about 1.2 L.", zh: "術中失血約 1.2 公升。" },
  { en: "Post-operative haemorrhage; returned to theatre.", zh: "術後出血，返回手術室。" },
  { en: "Ongoing bleeding from drain; tachycardic.", zh: "引流管持續出血，心搏過速。" },
];
const RBC_STABLE: Note[] = [
  { en: "Stable and asymptomatic; Hb drifting down slowly.", zh: "病況穩定、無症狀；Hb 緩慢下降。" },
  { en: "Pre-discharge; no symptoms documented.", zh: "出院前；未記錄任何症狀。" },
  { en: "Top-up before elective surgery; no bleeding.", zh: "擇期手術前補充輸血；無出血。" },
  { en: "Mild fatigue reported; vital signs stable.", zh: "主訴輕微疲倦；生命徵象穩定。" },
];
const RBC_LOW: Note[] = [
  { en: "Symptomatic anaemia; dizziness on standing.", zh: "症狀性貧血；起身時頭暈。" },
  { en: "Chemotherapy-related anaemia; dyspnoea on exertion.", zh: "化療相關貧血；活動時呼吸困難。" },
];
const PLASMA_BLEEDING: Note[] = [
  { en: "Massive transfusion protocol activated.", zh: "啟動大量輸血流程。" },
  { en: "Bleeding oesophageal varices.", zh: "食道靜脈曲張出血。" },
  { en: "Diffuse bleeding after bypass.", zh: "體外循環後瀰漫性出血。" },
];
const PLASMA_PROPHYLACTIC: Note[] = [
  { en: "Prophylactic before central line; no bleeding.", zh: "置放中心靜脈導管前預防性輸注；無出血。" },
  { en: "Pre-procedure; INR mildly raised, no bleeding.", zh: "處置前；INR 輕度上升，無出血。" },
  { en: "Given with red cells by routine; no coagulopathy noted.", zh: "依慣例與紅血球一併輸注；未見凝血異常。" },
];

const ABO: Abo[] = ["O+", "O+", "O+", "A+", "A+", "B+", "B+", "AB+", "O-", "A-"];
const pad = (n: number, w: number) => String(n).padStart(w, "0");

const depts = PROFILES.map((p) => p.dept);
const transfusions: Transfusion[] = [];
const deptMonth: DemoData["deptMonth"] = {};
let seq = 0;

// Each doctor carries a stable personal tendency around the department baseline,
// so the anonymous spread has real structure rather than pure noise.
const doctorBias = new Map<string, number>();
let doctorNo = 0;
for (const p of PROFILES) {
  for (let i = 0; i < p.doctors; i++) {
    doctorNo++;
    doctorBias.set(`${p.dept.id}:D${pad(doctorNo, 2)}`, between(-0.15, 0.2));
  }
}
const doctorsOf = (deptId: string) => [...doctorBias.keys()].filter((k) => k.startsWith(deptId + ":"));

for (const month of MONTHS) {
  deptMonth[month] = {};
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  for (const p of PROFILES) {
    const pd = int(...p.patientDays);
    const discharges = Math.round(pd / between(5.5, 9));
    deptMonth[month][p.dept.id] = {
      patientDays: pd,
      discharges,
      deaths: Math.round(discharges * between(0.01, 0.035)),
      // Total length of stay of this month's discharges; stays crossing month ends make it differ from occupied patient-days.
      losDaysTotal: Math.round(discharges * between(5.5, 9.5)),
    };

    const docs = doctorsOf(p.dept.id);
    const make = (product: Product) => {
      seq++;
      const doctorKey = pick(docs);
      const doctor = doctorKey.split(":")[1];
      const day = int(1, daysInMonth);
      const date = new Date(Date.UTC(y, m - 1, day, int(0, 23), int(0, 59))).toISOString();
      // Missing pre-transfusion INR is far more common for plasma than missing Hb for red cells.
      const hasLab = !chance(product === "RBC" ? 0.04 : 0.18);
      const labHoursBefore = hasLab ? round1(between(0.5, LAB_WINDOW_HOURS - 0.5)) : null;
      const weightKg = chance(0.12) ? null : Math.round(between(42, 92));
      const unitId = `F0302${pad(26, 2)}${pad(seq, 6)}`;
      let units: number, volumeMl: number, preLab: number | null, threshold: number, status: RuleStatus, chartNote: Note;

      if (product === "RBC") {
        threshold = p.dept.hbThreshold;
        const liberal = chance(Math.min(0.9, Math.max(0.02, p.liberal + (doctorBias.get(doctorKey) ?? 0))));
        units = chance(p.singleUnit) ? 1 : 2;
        // Taiwan units are 250 mL donation equivalents; RBC component volume per unit is roughly 150 mL.
        volumeMl = Array.from({ length: units }, () => int(140, 165)).reduce((a, b) => a + b, 0);
        preLab = hasLab ? round1(liberal ? between(threshold, threshold + 1.8) : between(5.2, threshold - 0.1)) : null;
        status = preLab === null ? "no_lab" : preLab >= threshold ? "flagged" : "within";
        chartNote = status === "within" ? pick(RBC_LOW) : chance(0.3) ? pick(RBC_BLEEDING) : pick(RBC_STABLE);
      } else {
        threshold = PLASMA_INR_THRESHOLD;
        const bleeding = chance(0.45);
        units = pick([1, 2, 2, 3, 4, 4, 6, 8]);
        // Plasma per 250 mL-donation unit is roughly 110 mL.
        volumeMl = Array.from({ length: units }, () => int(100, 125)).reduce((a, b) => a + b, 0);
        preLab = hasLab ? round1(bleeding || chance(0.5) ? between(1.6, 3.2) : between(1.0, 1.5)) : null;
        status = preLab === null ? "no_lab" : preLab <= threshold ? "flagged" : "within";
        chartNote = bleeding ? pick(PLASMA_BLEEDING) : pick(PLASMA_PROPHYLACTIC);
      }

      transfusions.push({
        id: `T${pad(seq, 6)}`,
        unitId,
        month,
        date,
        dept: p.dept.id,
        doctor,
        product,
        abo: pick(ABO),
        units,
        volumeMl,
        preLab,
        labHoursBefore,
        weightKg,
        threshold,
        status,
        chartNote,
      });
    };
    for (let i = int(...p.rbcPerMonth); i > 0; i--) make("RBC");
    for (let i = int(...p.plasmaPerMonth); i > 0; i--) make("PLASMA");
  }
}
transfusions.sort((a, b) => a.date.localeCompare(b.date));

const loads: MonthLoad[] = MONTHS.map((month, i) => {
  const records = transfusions.filter((t) => t.month === month).length;
  const missingWeight = transfusions.filter((t) => t.month === month && t.product === "PLASMA" && t.weightKg === null).length;
  const last = i === MONTHS.length - 1;
  const [y, m] = month.split("-").map(Number);
  const issues: LoadIssue[] = [
    { kind: "missing_weight", count: missingWeight, blocking: false, examples: [] },
  ];
  if (last) {
    issues.unshift(
      { kind: "order_no_issue", count: 3, blocking: true, examples: ["ORD-26-10-0412", "ORD-26-10-0587", "ORD-26-10-0733"] },
      { kind: "issue_no_admin", count: 2, blocking: true, examples: ["F030226" + pad(seq - 7, 6), "F030226" + pad(seq - 2, 6)] },
    );
  }
  return {
    month,
    // Arrives on the 3rd working day of the following month.
    receivedAt: new Date(Date.UTC(y, m, 4, 2, 0)).toISOString(),
    records,
    status: last ? "held" : "approved",
    issues,
  };
});

const data: DemoData = {
  seed: SEED,
  hospital: { en: "Demo Medical Centre", zh: "示範醫學中心" },
  months: MONTHS,
  depts,
  transfusions,
  deptMonth,
  loads,
};

// Self-checks: the rules the app relies on must hold for every record.
assert.equal(MONTHS.length, 12);
assert.equal(MONTHS[11], "2026-10");
for (const t of transfusions) {
  if (t.preLab === null) assert.equal(t.status, "no_lab", t.id);
  else if (t.product === "RBC") assert.equal(t.status, t.preLab >= t.threshold ? "flagged" : "within", t.id);
  else assert.equal(t.status, t.preLab <= t.threshold ? "flagged" : "within", t.id);
  assert.ok(t.units >= 1 && t.volumeMl > 0, t.id);
  assert.ok(MONTHS.includes(t.month), t.id);
}
assert.equal(loads.filter((l) => l.status === "held").length, 1);
assert.equal(new Set(transfusions.map((t) => t.unitId)).size, transfusions.length, "unit IDs unique");
const rbc = transfusions.filter((t) => t.product === "RBC");
const flaggedShare = rbc.filter((t) => t.status === "flagged").length / rbc.length;
assert.ok(flaggedShare > 0.15 && flaggedShare < 0.5, `RBC flagged share plausible: ${flaggedShare}`);

const out = new URL("../demo/data.js", import.meta.url);
writeFileSync(out, `// Generated by scripts/generate.ts (seed ${SEED}). Synthetic data only.\nvar BLOODSTAT_DATA = ${JSON.stringify(data)};\n`);
console.log(`seed ${SEED}: ${transfusions.length} transfusions (${rbc.length} RBC, flagged ${(flaggedShare * 100).toFixed(1)}%), wrote demo/data.js`);
