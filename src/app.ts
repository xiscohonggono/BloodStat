// BloodStat pitch demo. Plain browser script (no imports) so demo/index.html opens from disk.

type Lang = "en" | "zh";
type View = "load" | "overview" | "plasma" | "review" | "dept" | "rules" | "sources";
type Decision = "appropriate" | "not_justified";
type ChartMeasure = "flagged" | "units" | "single";
type SortKey = "name" | "orders" | "flagged" | "unjustified" | "noLab" | "units" | "single" | "mortality" | "los";

const D = BLOODSTAT_DATA;
const deptById = new Map(D.depts.map((d) => [d.id, d]));

const state = {
  lang: "en" as Lang,
  screen: "load" as View,
  approved: new Set(D.loads.filter((l) => l.status === "approved").map((l) => l.month)),
  resolved: new Set<string>(),
  reviews: new Map<string, Decision>(),
  reviewProduct: "RBC" as Product,
  reviewDept: "all",
  reviewShow: "pending" as "pending" | "reviewed",
  reviewLimit: 24,
  selected: null as string | null,
  chart: "flagged" as ChartMeasure,
  sort: { key: "flagged" as SortKey, dir: -1 },
  published: null as string | null,
  deptView: "GS",
  viewer: "",
  draft: { dept: "CVS", value: 7.5 },
  rules: [] as { dept: string; value: number; effective: string }[],
  ruleMsg: "",
};

// ---------- i18n ----------

const STRINGS = {
  en: {
    synthetic: "Synthetic data · concept demo",
    navLoad: "Data load",
    navOverview: "Overview",
    navReview: "Review queue",
    period: "Reporting period",
    loadTitle: "Monthly data load",
    loadIntro: "Each month's transfusion records are held here until the data steward approves them. Measures do not update before approval.",
    received: "Received",
    records: "Records",
    status: "Status",
    issues: "Checks",
    held: "Held",
    approved: "Approved",
    blocking: "Blocks approval",
    warning: "Warning",
    resolvedTag: "Resolved",
    markResolved: "Mark resolved in source system",
    approve: "Approve and publish",
    approveHint: "Resolve every blocking check to approve.",
    publishedMsg: "{month} approved. Measures and the review queue now include it.",
    goOverview: "Open overview",
    order_no_issue: "Blood orders with no matching issue record",
    issue_no_admin: "Issued units with no administration record",
    missing_weight: "Plasma transfusions with no recorded weight (dose in mL/kg cannot be computed)",
    history: "Load history",
    month: "Month",
    noIssues: "No issues",
    overviewTitle: "Red-cell transfusion overview",
    latest: "Latest approved month: {month}",
    mFlagged: "Given at or above threshold",
    mFlaggedSub: "{n} of {total} RBC orders (all orders are the denominator)",
    mReviewed: "{r} of {n} flags reviewed · {after} remain after removing cases judged appropriate",
    mNoReview: "No flags reviewed yet for this month",
    mNoLab: "{k} orders had no Hb within 24 h before issue",
    pt: "pt",
    noLabCol: "No Hb",
    losCol: "Mean stay",
    mUnits: "Units per 100 patient-days",
    mUnitsSub: "{units} units · {pd} patient-days",
    mSingle: "Single-unit orders",
    mSingleSub: "{n} of {total} orders",
    mOutcome: "Balancing measures",
    mOutcomeSub: "In-hospital mortality · mean stay {los} days",
    vsPrev: "{d} vs previous month",
    trend: "Monthly trend",
    cFlagged: "At or above threshold",
    cUnits: "Units / 100 patient-days",
    cSingle: "Single-unit share",
    afterReview: "After review",
    pending: "Not yet approved",
    byDept: "By department · all approved months in the period",
    dept: "Department",
    threshold: "Hb threshold",
    orders: "Orders",
    flagged: "At/above",
    unjustified: "After review",
    units: "Units/100 pd",
    single: "Single-unit",
    mortality: "Mortality",
    reviewTitle: "Review queue",
    reviewIntro: "The rule flags a transfusion for review; a committee reviewer decides with the chart. A flag is not a verdict.",
    scope: "Flagged in {month}",
    rbc: "Red cells",
    plasma: "Plasma",
    allDepts: "All departments",
    showPending: "Awaiting review",
    showReviewed: "Reviewed",
    showMore: "Show {n} more",
    emptyPending: "Every flagged case in this filter has been reviewed.",
    emptyReviewed: "No reviewed cases in this filter yet. Open a label to review it.",
    hb: "Pre-transfusion Hb",
    inr: "Pre-transfusion INR",
    unitsShort: "Units",
    selectHint: "Select a label to see the chart context and record a decision.",
    chart: "Chart excerpt (synthetic)",
    labTiming: "Lab drawn {h} h before issue",
    noLab: "No lab within 24 h before issue",
    weight: "Weight",
    notRecorded: "not recorded",
    dose: "Dose",
    doseNote: "Effective plasma dose is usually 10–15 mL/kg.",
    prescriber: "Prescriber (anonymised)",
    appropriate: "Appropriate given context",
    notJustified: "Not justified",
    undo: "Undo decision",
    stampAppropriate: "Appropriate",
    stampNot: "Not justified",
    ruleRbc: "Rule: Hb at or above {thr} g/dL",
    rulePlasma: "Rule: INR at or below {thr}",
    sortBy: "Sort by {col}",
    scrollHint: "Scroll sideways for more columns.",
    blockingCol: "Blocking checks",
    weightCol: "Missing weights",
    measureId: "Measure label {id}",
  },
  zh: {
    synthetic: "模擬資料 · 概念展示",
    navLoad: "資料載入",
    navOverview: "總覽",
    navReview: "審查清單",
    period: "報告期間",
    loadTitle: "每月資料載入",
    loadIntro: "每月輸血紀錄會先暫存於此，經資料管理人核可後才發布。核可前，各項指標不會更新。",
    received: "接收時間",
    records: "筆數",
    status: "狀態",
    issues: "檢核",
    held: "暫緩",
    approved: "已核可",
    blocking: "須先處理",
    warning: "提醒",
    resolvedTag: "已處理",
    markResolved: "標記為已於來源系統修正",
    approve: "核可並發布",
    approveHint: "所有須先處理的檢核完成後才能核可。",
    publishedMsg: "{month} 已核可。指標與審查清單已納入本月資料。",
    goOverview: "前往總覽",
    order_no_issue: "有備血醫囑但無對應發血紀錄",
    issue_no_admin: "已發血但無輸注紀錄",
    missing_weight: "血漿輸注未記錄體重（無法計算 mL/kg 劑量）",
    history: "載入紀錄",
    month: "月份",
    noIssues: "無異常",
    overviewTitle: "紅血球輸血總覽",
    latest: "最新核可月份：{month}",
    mFlagged: "於閾值以上輸血",
    mFlaggedSub: "{total} 筆紅血球醫囑中 {n} 筆（分母為全部醫囑）",
    mReviewed: "{n} 筆標記中已審查 {r} 筆 · 排除判定適當者後剩 {after}",
    mNoReview: "本月尚未審查任何標記",
    mNoLab: "{k} 筆醫囑於發血前 24 小時內無 Hb",
    pt: "個百分點",
    noLabCol: "無 Hb",
    losCol: "平均住院",
    mUnits: "每百住院人日單位數",
    mUnitsSub: "{units} 單位 · {pd} 住院人日",
    mSingle: "單一單位醫囑",
    mSingleSub: "{total} 筆中 {n} 筆",
    mOutcome: "平衡指標",
    mOutcomeSub: "院內死亡率 · 平均住院 {los} 天",
    vsPrev: "較上月 {d}",
    trend: "每月趨勢",
    cFlagged: "閾值以上比例",
    cUnits: "每百住院人日單位數",
    cSingle: "單一單位比例",
    afterReview: "審查後",
    pending: "尚未核可",
    byDept: "各科別 · 期間內所有已核可月份",
    dept: "科別",
    threshold: "Hb 閾值",
    orders: "醫囑數",
    flagged: "閾值以上",
    unjustified: "審查後",
    units: "每百人日單位",
    single: "單一單位",
    mortality: "死亡率",
    reviewTitle: "審查清單",
    reviewIntro: "規則僅標記需審查的輸血；由輸血委員會審查者對照病歷判斷。標記不等於結論。",
    scope: "{month} 標記案例",
    rbc: "紅血球",
    plasma: "血漿",
    allDepts: "全部科別",
    showPending: "待審查",
    showReviewed: "已審查",
    showMore: "再顯示 {n} 筆",
    emptyPending: "此篩選條件下的標記案例皆已審查。",
    emptyReviewed: "此篩選條件下尚無已審查案例。點選標籤即可審查。",
    hb: "輸血前 Hb",
    inr: "輸血前 INR",
    unitsShort: "單位",
    selectHint: "點選標籤以查看病歷內容並記錄審查結果。",
    chart: "病歷摘要（模擬）",
    labTiming: "發血前 {h} 小時抽血",
    noLab: "發血前 24 小時內無檢驗",
    weight: "體重",
    notRecorded: "未記錄",
    dose: "劑量",
    doseNote: "有效血漿劑量通常為 10–15 mL/kg。",
    prescriber: "開立醫師（匿名）",
    appropriate: "依臨床情境屬適當",
    notJustified: "不適當",
    undo: "撤銷審查",
    stampAppropriate: "適當",
    stampNot: "不適當",
    ruleRbc: "規則：Hb 大於或等於 {thr} g/dL",
    rulePlasma: "規則：INR 小於或等於 {thr}",
    sortBy: "依{col}排序",
    scrollHint: "左右滑動可查看更多欄位。",
    blockingCol: "須處理檢核",
    weightCol: "缺體重",
    measureId: "指標標籤 {id}",
  },
} satisfies Record<Lang, Record<string, string>>;

type Key = keyof (typeof STRINGS)["en"];

function t(key: Key, vars: Record<string, string | number> = {}): string {
  return STRINGS[state.lang][key].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const pct = (x: number) => (Number.isFinite(x) ? (x * 100).toFixed(1) + "%" : "–");
const num = (x: number, d = 0) => x.toLocaleString(state.lang === "en" ? "en-GB" : "zh-TW", { minimumFractionDigits: d, maximumFractionDigits: d });

function monthLabel(m: string): string {
  const [y, mo] = m.split("-").map(Number);
  if (state.lang === "zh") return `${y}年${mo}月`;
  return new Date(Date.UTC(y, mo - 1, 1)).toLocaleString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}
function dayLabel(iso: string): string {
  const d = new Date(iso);
  return state.lang === "zh" ? `${d.getUTCMonth() + 1}/${d.getUTCDate()}` : d.toLocaleString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}
const deptName = (id: string) => {
  const d = deptById.get(id);
  return d ? d[state.lang] : id;
};

// ---------- measures ----------

const approvedMonths = () => D.months.filter((m) => state.approved.has(m));
const latestApproved = () => approvedMonths().at(-1) ?? D.months[0];

function rbcMetrics(months: string[], dept?: string) {
  const ts = D.transfusions.filter((x) => x.product === "RBC" && months.includes(x.month) && (!dept || x.dept === dept));
  const flagged = ts.filter((x) => x.status === "flagged");
  const appropriate = flagged.filter((x) => state.reviews.get(x.id) === "appropriate").length;
  const reviewed = flagged.filter((x) => state.reviews.has(x.id)).length;
  const units = ts.reduce((a, x) => a + x.units, 0);
  let pd = 0, deaths = 0, discharges = 0, los = 0;
  for (const m of months) {
    for (const [id, v] of Object.entries(D.deptMonth[m])) {
      if (dept && id !== dept) continue;
      pd += v.patientDays; deaths += v.deaths; discharges += v.discharges; los += v.losDaysTotal;
    }
  }
  return {
    orders: ts.length,
    flagged: flagged.length,
    flaggedPct: flagged.length / ts.length,
    reviewed,
    noLab: ts.filter((x) => x.status === "no_lab").length,
    unjustifiedPct: (flagged.length - appropriate) / ts.length,
    units,
    pd,
    unitsPer100: (units / pd) * 100,
    single: ts.filter((x) => x.units === 1).length,
    singlePct: ts.filter((x) => x.units === 1).length / ts.length,
    mortalityPct: deaths / discharges,
    los: los / discharges,
  };
}

// ---------- shared pieces ----------

/** Deterministic decorative barcode drawn from the unit ID. */
function barcode(id: string): string {
  let x = 4;
  let bars = "";
  for (let i = 0; i < id.length; i++) {
    const c = id.charCodeAt(i);
    for (let j = 0; j < 3; j++) {
      const w = ((c >> j) & 3) + 1;
      if (j % 2 === 0) bars += `<rect x="${x}" y="0" width="${w}" height="28"/>`;
      x += w + 1;
    }
  }
  return `<svg class="barcode" viewBox="0 0 ${x + 4} 28" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
}

function deltaText(cur: number, prev: number | undefined, asPct: boolean): string {
  if (prev === undefined || !Number.isFinite(prev)) return "";
  const d = cur - prev;
  const s = (d > 0 ? "+" : d < 0 ? "−" : "±") + (asPct ? (Math.abs(d) * 100).toFixed(1) + " " + t("pt") : Math.abs(d).toFixed(2));
  return `<span class="delta">${esc(t("vsPrev", { d: s }))}</span>`;
}

// ---------- screens ----------

function renderLoad(): string {
  const held = D.loads.filter((l) => !state.approved.has(l.month));
  const current = held[0];
  let panel = "";
  if (current) {
    const blockers = current.issues.filter((i) => i.blocking && !state.resolved.has(`${current.month}:${i.kind}`));
    const checks = current.issues
      .map((i) => {
        const key = `${current.month}:${i.kind}`;
        const done = state.resolved.has(key);
        const tag = done ? `<span class="tag tag-line">${t("resolvedTag")}</span>` : i.blocking ? `<span class="tag tag-ink">${t("blocking")}</span>` : `<span class="tag tag-line">${t("warning")}</span>`;
        const ex = i.examples.length ? `<div class="mono examples">${i.examples.map(esc).join(" · ")}</div>` : "";
        const action = i.blocking && !done ? `<button class="btn" data-action="resolve" data-key="${esc(key)}">${t("markResolved")}</button>` : "";
        return `<li class="check${done ? " is-done" : ""}"><div class="check-head">${tag}<span class="check-count">${num(i.count)}</span><span>${esc(t(i.kind))}</span></div>${ex}${action}</li>`;
      })
      .join("");
    panel = `
      <section class="label load-label" aria-labelledby="load-h">
        <div class="label-band band-ink"><h2 id="load-h">${esc(monthLabel(current.month))}</h2><span class="tag tag-inverse">${t("held")}</span></div>
        <dl class="quad">
          <div><dt>${t("received")}</dt><dd>${esc(new Date(current.receivedAt).toLocaleString(state.lang === "en" ? "en-GB" : "zh-TW", { dateStyle: "medium", timeStyle: "short" }))}</dd></div>
          <div><dt>${t("records")}</dt><dd class="num">${num(current.records)}</dd></div>
        </dl>
        <ul class="checks">${checks}</ul>
        <div class="label-foot">
          <button class="btn btn-primary" data-action="approve" data-key="${current.month}" ${blockers.length ? "disabled" : ""}>${t("approve")}</button>
          ${blockers.length ? `<span class="hint">${t("approveHint")}</span>` : ""}
        </div>
      </section>`;
  } else if (state.published) {
    panel = `<section class="label notice" role="status"><p>${esc(t("publishedMsg", { month: monthLabel(state.published) }))}</p><button class="btn btn-primary" data-action="nav" data-key="overview">${t("goOverview")}</button></section>`;
  }

  const rows = [...D.loads]
    .reverse()
    .map((l) => {
      const ok = state.approved.has(l.month);
      const open = l.issues.filter((i) => i.blocking && i.count > 0).map((i) => `${num(i.count)} ${esc(t(i.kind))}`).join("<br>");
      const weights = l.issues.find((i) => i.kind === "missing_weight")?.count ?? 0;
      return `<tr><td>${esc(monthLabel(l.month))}</td><td class="num">${num(l.records)}</td><td class="issues-cell">${open || t("noIssues")}</td><td class="num">${num(weights)}</td><td>${ok ? `<span class="tag tag-line">${t("approved")}</span>` : `<span class="tag tag-inverse">${t("held")}</span>`}</td></tr>`;
    })
    .join("");

  return `
    <header class="screen-head"><h1 tabindex="-1">${t("loadTitle")}</h1><p class="lede">${t("loadIntro")}</p></header>
    ${panel}
    <section class="block"><h2>${t("history")}</h2>
      <div class="table-wrap"><table><thead><tr><th scope="col">${t("month")}</th><th scope="col" class="num">${t("records")}</th><th scope="col">${t("blockingCol")}</th><th scope="col" class="num">${t("weightCol")}</th><th scope="col">${t("status")}</th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>`;
}

function trendChart(): string {
  // Size the viewBox to the rendered width so SVG text stays at its CSS size on any screen.
  const screen = document.querySelector<HTMLElement>(".screen");
  const pad = screen ? parseFloat(getComputedStyle(screen).paddingLeft) * 2 : 64;
  const W = Math.max(300, Math.min(1180, (screen?.clientWidth ?? 1064) - pad - 4));
  const H = W < 600 ? 220 : 260, L = 44, R = 96, T = 16, B = 32;
  const months = D.months;
  const vals = months.map((m) => (state.approved.has(m) ? rbcMetrics([m]) : null));
  const val = (x: ReturnType<typeof rbcMetrics>) => (state.chart === "flagged" ? x.flaggedPct * 100 : state.chart === "units" ? x.unitsPer100 : x.singlePct * 100);
  const nums = vals.filter((v) => v !== null).map((v) => val(v!));
  const max = Math.max(10, Math.ceil((Math.max(...nums) * 1.15) / 5) * 5);
  const x = (i: number) => L + (i * (W - L - R)) / (months.length - 1);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const grid = ticks.map((v) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}${state.chart === "units" ? "" : "%"}</text>`).join("");
  const every = W < 600 ? 2 : 1;
  const xs = months.map((m, i) => (i % every !== (months.length - 1) % every ? "" : `<text class="axis" x="${x(i)}" y="${H - 10}" text-anchor="middle">${esc(state.lang === "zh" ? m.slice(5) + "月" : monthLabel(m).split(" ")[0])}</text>`)).join("");
  const line = (f: (v: ReturnType<typeof rbcMetrics>) => number, cls: string) => {
    const pts = vals.map((v, i) => (v ? `${x(i)},${y(f(v))}` : null)).filter(Boolean).join(" ");
    return `<polyline class="${cls}" points="${pts}"/>`;
  };
  const dots = vals.map((v, i) => (v ? `<circle class="dot" cx="${x(i)}" cy="${y(val(v))}" r="3.5"><title>${esc(monthLabel(months[i]))}: ${val(v).toFixed(1)}</title></circle>` : `<g class="pending-mark"><line x1="${x(i)}" x2="${x(i)}" y1="${T}" y2="${H - B}"/><text x="${x(i) - 6}" y="${T + 12}" text-anchor="end">${esc(t("pending"))}</text></g>`)).join("");
  // The after-review series is drawn only for months where a decision changed it.
  const afterPts = state.chart === "flagged" ? vals.map((v, i) => (v && v.unjustifiedPct < v.flaggedPct ? { i, v } : null)).filter((p) => p !== null) : [];
  const after = afterPts.map(({ i, v }) => `<line class="line-after" x1="${x(i)}" x2="${x(i)}" y1="${y(v.flaggedPct * 100)}" y2="${y(v.unjustifiedPct * 100)}"/><circle class="dot-after" cx="${x(i)}" cy="${y(v.unjustifiedPct * 100)}" r="3.5"/>`).join("");
  const lastI = vals.map((v, i) => (v ? i : -1)).filter((i) => i >= 0).at(-1)!;
  const lastV = vals[lastI]!;
  const unit = state.chart === "units" ? "" : "%";
  const endLabel = `<text class="end-label" x="${x(lastI) + 10}" y="${y(val(lastV)) + 4}">${val(lastV).toFixed(1)}${unit}</text>` +
    (state.chart === "flagged" && lastV.unjustifiedPct < lastV.flaggedPct ? `<text class="end-label end-after" x="${x(lastI) + 10}" y="${y(lastV.unjustifiedPct * 100) + 16}">${(lastV.unjustifiedPct * 100).toFixed(1)}%</text>` : "");
  const tabs = (["flagged", "units", "single"] as ChartMeasure[])
    .map((k) => `<button class="seg" aria-pressed="${state.chart === k}" data-action="chart" data-key="${k}">${t(k === "flagged" ? "cFlagged" : k === "units" ? "cUnits" : "cSingle")}</button>`)
    .join("");
  const legend = afterPts.length ? `<p class="legend"><span class="key key-main"></span>${t("cFlagged")} <span class="key key-after"></span>${t("afterReview")}</p>` : "";
  return `<section class="block"><div class="block-head"><h2>${t("trend")}</h2><div class="segs" role="group" aria-label="${esc(t("trend"))}">${tabs}</div></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("trend"))}">${grid}${xs}${line(val, "line-main")}${dots}${after}${endLabel}</svg>${legend}</section>`;
}

function renderOverview(): string {
  const latest = latestApproved();
  const months = approvedMonths();
  const prevMonth = months.at(-2);
  const cur = rbcMetrics([latest]);
  const prev = prevMonth ? rbcMetrics([prevMonth]) : undefined;

  const labelId = `RBC-${latest}`;
  const reviewLine = cur.reviewed ? t("mReviewed", { r: cur.reviewed, n: cur.flagged, after: pct(cur.unjustifiedPct) }) : t("mNoReview");
  const quad = `
    <section class="label measure-label" aria-label="${esc(t("latest", { month: monthLabel(latest) }))}">
      <div class="label-band band-rbc"><h2>${t("rbc")}</h2><span>${esc(t("latest", { month: monthLabel(latest) }))}</span></div>
      <div class="quad quad-4">
        <div><h3>${t("mFlagged")}</h3><p class="big num">${pct(cur.flaggedPct)}</p><p class="sub">${esc(t("mFlaggedSub", { n: cur.flagged, total: cur.orders }))}</p><p class="sub">${esc(reviewLine)}</p>${deltaText(cur.flaggedPct, prev?.flaggedPct, true)}</div>
        <div><h3>${t("mUnits")}</h3><p class="big num">${cur.unitsPer100.toFixed(2)}</p><p class="sub">${esc(t("mUnitsSub", { units: num(cur.units), pd: num(cur.pd) }))}</p>${deltaText(cur.unitsPer100, prev?.unitsPer100, false)}</div>
        <div><h3>${t("mSingle")}</h3><p class="big num">${pct(cur.singlePct)}</p><p class="sub">${esc(t("mSingleSub", { n: cur.single, total: cur.orders }))}</p>${deltaText(cur.singlePct, prev?.singlePct, true)}</div>
        <div><h3>${t("mOutcome")}</h3><p class="big num">${pct(cur.mortalityPct)}</p><p class="sub">${esc(t("mOutcomeSub", { los: cur.los.toFixed(1) }))}</p>${deltaText(cur.mortalityPct, prev?.mortalityPct, true)}</div>
      </div>
      <div class="label-id">${barcode(labelId)}<span class="mono">${esc(t("measureId", { id: labelId }))}</span><span class="label-note">${esc(t("mNoLab", { k: cur.noLab }))}</span></div>
    </section>`;

  const rows = D.depts.map((d) => ({ d, m: rbcMetrics(months, d.id) }));
  const keyOf = (r: (typeof rows)[number]): number | string => {
    switch (state.sort.key) {
      case "name": return r.d[state.lang];
      case "orders": return r.m.orders;
      case "flagged": return r.m.flaggedPct;
      case "unjustified": return r.m.unjustifiedPct;
      case "units": return r.m.unitsPer100;
      case "single": return r.m.singlePct;
      case "mortality": return r.m.mortalityPct;
      case "los": return r.m.los;
      case "noLab": return r.m.noLab / r.m.orders;
    }
  };
  rows.sort((a, b) => {
    const ka = keyOf(a), kb = keyOf(b);
    return (typeof ka === "string" ? ka.localeCompare(kb as string) : ka - (kb as number)) * state.sort.dir;
  });
  const maxFlag = Math.max(...rows.map((r) => r.m.flaggedPct));
  const th = (key: SortKey, label: Key, numeric = true) => {
    const active = state.sort.key === key;
    const aria = active ? (state.sort.dir === 1 ? "ascending" : "descending") : "none";
    return `<th scope="col" class="${numeric ? "num" : ""}" aria-sort="${aria}"><button class="sort" data-action="sort" data-key="${key}" aria-label="${esc(t("sortBy", { col: t(label) }))}">${t(label)}${active ? `<svg class="sort-ind" viewBox="0 0 10 10" aria-hidden="true"><path d="${state.sort.dir === 1 ? "M5 1 9 8H1z" : "M1 2h8L5 9z"}"/></svg>` : ""}</button></th>`;
  };
  const body = rows
    .map(({ d, m }) => `<tr><th scope="row">${esc(d[state.lang])}</th><td class="num">${d.hbThreshold.toFixed(1)}</td><td class="num">${num(m.orders)}</td>
      <td class="num"><div class="bar-cell"><span class="bar" style="--w:${((m.flaggedPct / maxFlag) * 100).toFixed(1)}%"></span><span>${pct(m.flaggedPct)}</span></div></td>
      <td class="num">${pct(m.unjustifiedPct)}</td><td class="num">${num(m.noLab)}</td><td class="num">${m.unitsPer100.toFixed(2)}</td><td class="num">${pct(m.singlePct)}</td><td class="num">${pct(m.mortalityPct)}</td><td class="num">${m.los.toFixed(1)}</td></tr>`)
    .join("");

  return `
    <header class="screen-head"><h1 tabindex="-1">${t("overviewTitle")}</h1></header>
    ${quad}
    ${trendChart()}
    <section class="block"><h2>${t("byDept")}</h2>
      <p class="hint scroll-hint">${t("scrollHint")}</p><div class="table-wrap"><table class="dept-table"><thead><tr>${th("name", "dept", false)}<th scope="col" class="num">${t("threshold")}</th>${th("orders", "orders")}${th("flagged", "flagged")}${th("unjustified", "unjustified")}${th("noLab", "noLabCol")}${th("units", "units")}${th("single", "single")}${th("mortality", "mortality")}${th("los", "losCol")}</tr></thead><tbody>${body}</tbody></table></div>
    </section>`;
}

function queueItems(): Transfusion[] {
  const month = latestApproved();
  return D.transfusions.filter(
    (x) =>
      x.month === month &&
      x.status === "flagged" &&
      x.product === state.reviewProduct &&
      (state.reviewDept === "all" || x.dept === state.reviewDept) &&
      (state.reviewShow === "pending" ? !state.reviews.has(x.id) : state.reviews.has(x.id)),
  );
}

const pendingCount = () => D.transfusions.filter((x) => x.month === latestApproved() && x.status === "flagged" && !state.reviews.has(x.id)).length;

function tile(x: Transfusion): string {
  const dec = state.reviews.get(x.id);
  const isRbc = x.product === "RBC";
  const lab = x.preLab === null ? "–" : isRbc ? x.preLab.toFixed(1) : x.preLab.toFixed(1);
  const rule = isRbc ? `≥ ${x.threshold.toFixed(1)} g/dL` : `≤ ${x.threshold.toFixed(1)}`;
  const stamp = dec ? `<span class="stamp stamp-${dec}">${t(dec === "appropriate" ? "stampAppropriate" : "stampNot")}</span>` : "";
  return `<button class="tile${state.selected === x.id ? " is-selected" : ""}" data-action="select" data-key="${x.id}" aria-pressed="${state.selected === x.id}">
    <span class="tile-band ${isRbc ? "band-rbc" : "band-plasma"}">${t(isRbc ? "rbc" : "plasma")}</span>
    <span class="tq tq-tl"><span class="ql">${t("unitsShort")}</span><span class="qv">${x.units} U · ${x.volumeMl} mL</span></span>
    <span class="tq tq-tr abo">${x.abo}</span>
    <span class="tq tq-bl"><span class="ql">${isRbc ? "Hb" : "INR"}</span><span class="qv mono">${lab}</span><span class="qr">${rule}</span></span>
    <span class="tq tq-br"><span class="ql">${esc(deptName(x.dept))}</span><span class="qv">${x.doctor} · ${esc(dayLabel(x.date))}</span></span>
    <span class="tile-foot">${barcode(x.unitId)}<span class="mono">${x.unitId}</span></span>
    ${stamp}
  </button>`;
}

function detail(): string {
  const x = state.selected ? D.transfusions.find((y) => y.id === state.selected) : undefined;
  if (!x) return `<aside class="detail detail-empty"><p>${t("selectHint")}</p></aside>`;
  const isRbc = x.product === "RBC";
  const dec = state.reviews.get(x.id);
  const dose = !isRbc && x.weightKg ? x.volumeMl / x.weightKg : null;
  const rows = [
    [t("unitsShort"), `${x.units} U · ${x.volumeMl} mL`],
    [t(isRbc ? "hb" : "inr"), x.preLab === null ? "–" : `${x.preLab.toFixed(1)}${isRbc ? " g/dL" : ""}`],
    ["", x.labHoursBefore === null ? t("noLab") : t("labTiming", { h: x.labHoursBefore.toFixed(1) })],
    [t("weight"), x.weightKg ? `${x.weightKg} kg` : t("notRecorded")],
    ...(isRbc ? [] : [[t("dose"), dose ? `${dose.toFixed(1)} mL/kg` : "–"]]),
    [t("prescriber"), x.doctor],
  ];
  const actions = dec
    ? `<button class="btn" data-action="undo" data-key="${x.id}">${t("undo")}</button>`
    : `<button class="btn btn-primary" data-action="decide" data-key="appropriate">${t("appropriate")}</button><button class="btn" data-action="decide" data-key="not_justified">${t("notJustified")}</button>`;
  return `<aside class="detail label" aria-labelledby="detail-h">
    <div class="label-band ${isRbc ? "band-rbc" : "band-plasma"}"><h2 id="detail-h">${t(isRbc ? "rbc" : "plasma")} · <span class="mono">${x.unitId}</span></h2></div>
    <div class="detail-body">
      <p class="rule">${esc(t(isRbc ? "ruleRbc" : "rulePlasma", { thr: x.threshold.toFixed(1) }))}</p>
      <dl class="kv">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
      ${!isRbc ? `<p class="hint">${t("doseNote")}</p>` : ""}
      <h3>${t("chart")}</h3>
      <blockquote>${esc(x.chartNote[state.lang])}</blockquote>
      <div class="actions">${actions}</div>
    </div>
  </aside>`;
}

function renderReview(): string {
  const items = queueItems();
  const shown = items.slice(0, state.reviewLimit);
  const more = items.length - shown.length;
  const deptOpts = [`<option value="all">${t("allDepts")}</option>`, ...D.depts.map((d) => `<option value="${d.id}" ${state.reviewDept === d.id ? "selected" : ""}>${esc(d[state.lang])}</option>`)].join("");
  const seg = (action: string, key: string, label: string, on: boolean) => `<button class="seg" aria-pressed="${on}" data-action="${action}" data-key="${key}">${label}</button>`;
  const empty = `<p class="empty">${t(state.reviewShow === "pending" ? "emptyPending" : "emptyReviewed")}</p>`;
  return `
    <header class="screen-head"><h1 tabindex="-1">${t("reviewTitle")}</h1><p class="lede">${t("reviewIntro")}</p></header>
    <div class="toolbar">
      <span class="scope">${esc(t("scope", { month: monthLabel(latestApproved()) }))}</span>
      <div class="segs">${seg("product", "RBC", t("rbc"), state.reviewProduct === "RBC")}${seg("product", "PLASMA", t("plasma"), state.reviewProduct === "PLASMA")}</div>
      <label class="select"><span class="sr-only">${t("dept")}</span><select data-action="dept" data-key="dept">${deptOpts}</select></label>
      <div class="segs">${seg("show", "pending", t("showPending"), state.reviewShow === "pending")}${seg("show", "reviewed", t("showReviewed"), state.reviewShow === "reviewed")}</div>
    </div>
    <div class="review-grid">
      <div class="tiles-col">
        ${shown.length ? `<div class="tiles">${shown.map(tile).join("")}</div>` : empty}
        ${more > 0 ? `<button class="btn more" data-action="more">${t("showMore", { n: Math.min(more, 24) })}</button>` : ""}
      </div>
      ${detail()}
    </div>`;
}

// ---------- shell ----------

const SCREENS: Record<View, () => string> = {
  load: renderLoad,
  overview: renderOverview,
  plasma: renderPlasma,
  review: renderReview,
  dept: renderDept,
  rules: renderRules,
  sources: renderSources,
};

function render(): void {
  // Re-rendering replaces the DOM; restore focus to the control with the same action and key.
  const active = document.activeElement as HTMLElement | null;
  const focusSel = active?.dataset?.action ? `[data-action="${active.dataset.action}"][data-key="${active.dataset.key ?? ""}"]` : null;
  document.documentElement.lang = state.lang === "en" ? "en" : "zh-Hant";
  const blockers = D.loads
    .filter((l) => !state.approved.has(l.month))
    .flatMap((l) => l.issues.filter((i) => i.blocking && !state.resolved.has(`${l.month}:${i.kind}`))).length;
  const nav = (key: View, label: string, badge: number) =>
    `<li><button class="nav-item" data-action="nav" data-key="${key}" ${state.screen === key ? 'aria-current="page"' : ""}><span>${label in STRINGS.en ? t(label as Key) : label}</span>${badge ? `<span class="badge">${badge}</span>` : ""}</button></li>`;
  const months = approvedMonths();
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <nav class="rail" aria-label="BloodStat">
      <div class="brand"><span class="wordmark">BloodStat</span><span class="hospital">${esc(D.hospital[state.lang])}</span></div>
      <ul class="nav">${nav("load", "navLoad", blockers)}${nav("overview", "navOverview", 0)}${nav("plasma", t2("navPlasma"), 0)}${nav("review", "navReview", pendingCount())}${nav("dept", t2("navDept"), 0)}${nav("rules", t2("navRules"), 0)}${nav("sources", t2("navSources"), 0)}</ul>
      <div class="rail-foot">
        <div class="lang" role="group" aria-label="Language / 語言">
          <button class="lang-btn" data-action="lang" data-key="en" aria-pressed="${state.lang === "en"}">EN</button>
          <button class="lang-btn" data-action="lang" data-key="zh" aria-pressed="${state.lang === "zh"}" lang="zh-Hant">中文</button>
        </div>
        <p class="synthetic">${t("synthetic")}</p>
      </div>
    </nav>
    <main class="main">
      <div class="topbar"><span>${t("period")}: ${esc(monthLabel(months[0]))} – ${esc(monthLabel(months.at(-1)!))}</span><span class="synthetic-pill">${t("synthetic")}</span></div>
      <div class="screen">${SCREENS[state.screen]()}</div>
    </main>`;
  if (focusSel) {
    const target =
      app.querySelector<HTMLElement>(focusSel) ??
      app.querySelector<HTMLElement>(`[data-action="${active!.dataset.action}"]:not(:disabled)`) ??
      app.querySelector<HTMLElement>(".detail .actions .btn, .label-foot .btn:not(:disabled), .notice .btn") ??
      app.querySelector<HTMLElement>(".screen h1");
    target?.focus();
  }
}

document.addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!el || el.tagName === "SELECT") return;
  const key = el.dataset.key ?? "";
  switch (el.dataset.action) {
    case "nav": state.screen = key as View; window.scrollTo(0, 0); break;
    case "lang": state.lang = key as Lang; break;
    case "resolve": state.resolved.add(key); break;
    case "approve": state.approved.add(key); state.published = key; state.selected = null; break;
    case "chart": state.chart = key as ChartMeasure; break;
    case "sort":
      state.sort = state.sort.key === key ? { key: key as SortKey, dir: -state.sort.dir } : { key: key as SortKey, dir: key === "name" ? 1 : -1 };
      break;
    case "product": state.reviewProduct = key as Product; state.selected = null; state.reviewLimit = 24; break;
    case "show": state.reviewShow = key as "pending" | "reviewed"; state.selected = null; break;
    case "more": state.reviewLimit += 24; break;
    case "select": state.selected = state.selected === key ? null : key; break;
    case "decide":
      if (state.selected) state.reviews.set(state.selected, key as Decision);
      break;
    case "undo": state.reviews.delete(key); break;
    case "draftValue": state.draft.value = Number(key); state.ruleMsg = ""; break;
    case "approveRule": {
      const effective = nextEffectiveDate();
      state.rules = state.rules.filter((r) => !(r.dept === state.draft.dept && r.effective === effective));
      state.rules.push({ dept: state.draft.dept, value: state.draft.value, effective });
      state.ruleMsg = "approved";
      break;
    }
    default: return;
  }
  render();
});

document.addEventListener("change", (e) => {
  const el = e.target as HTMLSelectElement;
  switch (el.dataset.action) {
    case "dept": state.reviewDept = el.value; state.selected = null; break;
    case "deptView": state.deptView = el.value; state.viewer = ""; break;
    case "viewer": state.viewer = el.value; break;
    case "draftDept": state.draft.dept = el.value; state.ruleMsg = ""; break;
    default: return;
  }
  render();
});

// The chart sizes itself to the screen width, so redraw after resizing settles.
let resizeTimer = 0;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => ["overview", "plasma", "dept"].includes(state.screen) && render(), 150);
});

render();
