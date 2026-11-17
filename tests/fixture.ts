function order(x: Pick<Transfusion, "id" | "month" | "dept" | "doctor" | "product" | "units" | "preLab" | "threshold" | "status"> & Partial<Transfusion>): Transfusion {
  return {
    unitId: `UNIT-${x.id}`,
    date: `${x.month}-10T12:00:00Z`,
    abo: "O+",
    volumeMl: x.units * 250,
    labHoursBefore: x.preLab === null ? null : 2,
    weightKg: null,
    chartNote: { en: "Synthetic test order", zh: "合成測試醫囑" },
    ...x,
  };
}

export const fixture: DemoData = {
  seed: 1,
  hospital: { en: "Test hospital", zh: "測試醫院" },
  months: ["2026-08", "2026-09", "2026-10"],
  depts: [
    { id: "GS", en: "General surgery", zh: "一般外科", hbThreshold: 7 },
    { id: "CVS", en: "Cardiac surgery", zh: "心臟外科", hbThreshold: 8 },
  ],
  transfusions: [
    order({ id: "r1", month: "2026-08", dept: "GS", doctor: "D02", product: "RBC", units: 1, preLab: 7, threshold: 7, status: "flagged" }),
    order({ id: "r2", month: "2026-08", dept: "GS", doctor: "D01", product: "RBC", units: 2, preLab: 6, threshold: 7, status: "within" }),
    order({ id: "r3", month: "2026-08", dept: "GS", doctor: "D02", product: "RBC", units: 1, preLab: null, threshold: 7, status: "no_lab" }),
    order({ id: "r4", month: "2026-08", dept: "CVS", doctor: "D04", product: "RBC", units: 2, preLab: 8, threshold: 8, status: "flagged" }),
    order({ id: "r5", month: "2026-09", dept: "GS", doctor: "D01", product: "RBC", units: 2, preLab: 8, threshold: 8, status: "flagged" }),
    order({ id: "r6", month: "2026-09", dept: "GS", doctor: "D02", product: "RBC", units: 1, preLab: 7, threshold: 8, status: "within" }),
    order({ id: "r7", month: "2026-10", dept: "GS", doctor: "D03", product: "RBC", units: 2, preLab: 9, threshold: 7, status: "flagged" }),
    order({ id: "r8", month: "2026-10", dept: "CVS", doctor: "D04", product: "RBC", units: 1, preLab: null, threshold: 8, status: "no_lab" }),
    order({ id: "p1", month: "2026-08", dept: "GS", doctor: "P01", product: "PLASMA", units: 2, preLab: 1.5, threshold: 1.5, status: "flagged", volumeMl: 400, weightKg: 50 }),
    order({ id: "p2", month: "2026-08", dept: "GS", doctor: "P01", product: "PLASMA", units: 2, preLab: null, threshold: 1.5, status: "no_lab", volumeMl: 500 }),
    order({ id: "p3", month: "2026-08", dept: "CVS", doctor: "P02", product: "PLASMA", units: 2, preLab: 2, threshold: 1.5, status: "within", volumeMl: 600, weightKg: 50 }),
    order({ id: "p4", month: "2026-09", dept: "GS", doctor: "P01", product: "PLASMA", units: 2, preLab: 2, threshold: 1.5, status: "within", volumeMl: 500, weightKg: 50 }),
    order({ id: "p5", month: "2026-09", dept: "CVS", doctor: "P02", product: "PLASMA", units: 1, preLab: 1.2, threshold: 1.5, status: "flagged", volumeMl: 300, weightKg: 60 }),
  ],
  deptMonth: {
    "2026-08": {
      GS: { patientDays: 100, discharges: 10, deaths: 1, losDaysTotal: 40 },
      CVS: { patientDays: 200, discharges: 20, deaths: 2, losDaysTotal: 110 },
    },
    "2026-09": {
      GS: { patientDays: 150, discharges: 15, deaths: 0, losDaysTotal: 75 },
      CVS: { patientDays: 250, discharges: 25, deaths: 1, losDaysTotal: 150 },
    },
    "2026-10": {
      GS: { patientDays: 100, discharges: 10, deaths: 0, losDaysTotal: 40 },
      CVS: { patientDays: 200, discharges: 20, deaths: 0, losDaysTotal: 100 },
    },
  },
  loads: [
    { month: "2026-08", receivedAt: "2026-09-01T00:00:00Z", records: 7, status: "approved", issues: [] },
    { month: "2026-09", receivedAt: "2026-10-01T00:00:00Z", records: 4, status: "approved", issues: [] },
    { month: "2026-10", receivedAt: "2026-11-01T00:00:00Z", records: 2, status: "held", issues: [] },
  ],
};
