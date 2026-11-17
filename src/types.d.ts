// Shared data contract between scripts/generate.ts and the browser app.
// Global (no imports/exports) so the browser build stays a plain script.

type Product = "RBC" | "PLASMA";
type Abo = "O+" | "A+" | "B+" | "AB+" | "O-" | "A-";
/** within: lab beyond threshold; flagged: rule says review (RBC Hb >= threshold, plasma INR <= threshold); no_lab: no lab in window. */
type RuleStatus = "within" | "flagged" | "no_lab";

interface Dept {
  id: string;
  en: string;
  zh: string;
  /** Committee-approved Hb threshold for red cells in this department (g/dL). */
  hbThreshold: number;
}

interface Transfusion {
  id: string;
  /** Synthetic ISBT 128-style donation identification number. */
  unitId: string;
  month: string; // YYYY-MM
  date: string; // ISO datetime of issue
  dept: string;
  /** Anonymised prescriber code, e.g. "D07". */
  doctor: string;
  product: Product;
  abo: Abo;
  /** Units in this order (RBC) or bags (plasma). */
  units: number;
  /** Actual component volume in mL, summed over units. */
  volumeMl: number;
  /** Pre-transfusion Hb (g/dL) for RBC, INR for plasma; null when none in the window. */
  preLab: number | null;
  /** Hours between the lab draw and issue; null when no lab. */
  labHoursBefore: number | null;
  /** Patient weight in kg, null when not recorded. */
  weightKg: number | null;
  /** Threshold applied at classification time (Hb g/dL or INR). */
  threshold: number;
  status: RuleStatus;
  /** Synthetic chart excerpt shown to the reviewer. */
  chartNote: { en: string; zh: string };
}

type LoadIssueKind = "order_no_issue" | "issue_no_admin" | "missing_weight";

interface LoadIssue {
  kind: LoadIssueKind;
  count: number;
  /** Whether this issue blocks approval until resolved. */
  blocking: boolean;
  examples: string[];
}

interface MonthLoad {
  month: string;
  receivedAt: string;
  records: number;
  status: "approved" | "held";
  issues: LoadIssue[];
}

interface DeptMonth {
  patientDays: number;
  discharges: number;
  deaths: number;
  /** Sum of length of stay over the month's discharges (days). */
  losDaysTotal: number;
}

interface DemoData {
  seed: number;
  hospital: { en: string; zh: string };
  months: string[];
  depts: Dept[];
  transfusions: Transfusion[];
  /** deptMonth[month][deptId] */
  deptMonth: Record<string, Record<string, DeptMonth>>;
  loads: MonthLoad[];
}

/** Emitted by scripts/generate.ts into demo/data.js. */
declare var BLOODSTAT_DATA: DemoData;
