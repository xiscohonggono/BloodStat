// Second set of screens: department report, threshold rules, plasma, data sources.
// Plain global script loaded before app.js; it uses app.js globals (state, D, t, esc, ...) only at render time.

const STRINGS2 = {
  en: {
    navPlasma: "Plasma",
    navDept: "Department report",
    navRules: "Thresholds",
    navSources: "Data sources",
    // department report
    deptTitle: "Department report",
    deptIntro: "Private monthly feedback for a department head. Doctors are never named; each doctor sees only their own point.",
    deptPick: "Department",
    viewer: "Viewing as (private)",
    compare: "{dept} compared with the hospital · all approved months",
    measure: "Measure",
    thisDept: "Department",
    hospital: "Hospital",
    funnelTitle: "Doctors in this department: share given at or above threshold",
    funnelNote: "Each circle is one anonymous prescriber. Funnel limits show how far a doctor's share can sit from the department average by chance alone, given how many orders they wrote (binomial, normal approximation). A point outside the limits is a prompt to look, not a verdict.",
    xOrders: "RBC orders in the period",
    you: "You",
    avg: "Department average {p}",
    lim95: "95% limits",
    lim998: "99.8% limits",
    youSummary: "Your share: {p} of {n} orders. Department average: {avg}.",
    guideline: "Guideline in force: Hb threshold {thr} g/dL for {dept}, approved by the transfusion committee.",
    // thresholds
    rulesTitle: "Threshold rules",
    rulesIntro: "Thresholds are set by the transfusion committee, not by the software. A change applies only from its effective date; past months are never reclassified.",
    current: "Rules in force",
    effective: "Effective",
    since: "Since start of period",
    scheduled: "Scheduled",
    draftTitle: "Draft a change",
    newThr: "Proposed Hb threshold (g/dL)",
    impact: "Impact preview on the last 12 approved months",
    wouldFlag: "Flagged now {a} · would be flagged {b}",
    reclass: "{n} of {total} past transfusions would change classification",
    reclassNote: "Preview only. Approving does not change past results.",
    effectiveFrom: "Takes effect {date}",
    approveRule: "Approve as chair",
    sameRule: "The proposed value equals the rule in force.",
    approvedRule: "Approved: {dept} threshold {thr} g/dL from {date}.",
    // plasma
    plasmaTitle: "Plasma stewardship",
    plasmaIntro: "Plasma is a measurement and evidence gap, not a 'transfuse less' target. These are review prompts and dose feedback, with uncertain evidence labelled as such.",
    pNoInr: "No INR within 24 h before issue",
    pLowInr: "INR at or below 1.5",
    pLowInrSub: "{n} orders · prophylactic use here has weak evidence of benefit",
    uncertain: "Evidence uncertain",
    pDose: "Dose below 10 mL/kg",
    pDoseSub: "Median dose {m} mL/kg · effective dose is usually 10–15 mL/kg",
    pWeight: "Weight not recorded",
    pWeightSub: "Dose cannot be computed for these orders",
    ofOrders: "{n} of {total} plasma orders",
    ofDosed: "{n} of {total} orders with a recorded weight",
    doseHist: "Dose distribution · all approved months",
    doseAxis: "Dose (mL/kg)",
    band: "Usual effective range",
    demand: "Hospital plasma demand · units per month (for blood service planning)",
    pByDept: "Plasma by department · all approved months",
    pOrders: "Orders",
    pUnits: "Units/100 pd",
    pNoInrCol: "No INR",
    pLowCol: "INR ≤ 1.5",
    pMedian: "Median dose",
    pUnder: "Dose < 10",
    // data sources
    srcTitle: "Data sources",
    srcIntro: "How BloodStat gets its data. Lab results, weight and admissions come from TW Core (FHIR R4) through the hospital's FHIR Box. Transfusion events come from the blood bank system, because TW Core v1.0.0 has no transfusion or blood-product profile.",
    fromTwCore: "From TW Core via FHIR Box",
    fromBbms: "From the blood bank system",
    proposed: "Proposed: TW Core transfusion profile",
    proposedNote: "Built on TW Core Procedure plus the base FHIR R4 BiologicallyDerivedProduct resource. Extension URLs are illustrative and unpublished. Example generated from one synthetic transfusion in this demo.",
    field: "Data",
    resource: "Resource / source",
    code: "Code",
  },
  zh: {
    navPlasma: "血漿",
    navDept: "科別報告",
    navRules: "閾值規則",
    navSources: "資料來源",
    deptTitle: "科別報告",
    deptIntro: "提供科主任的每月非公開回饋。不揭露醫師姓名；每位醫師只看得到自己的位置。",
    deptPick: "科別",
    viewer: "檢視身分（非公開）",
    compare: "{dept}與全院比較 · 全部已核可月份",
    measure: "指標",
    thisDept: "本科",
    hospital: "全院",
    funnelTitle: "本科醫師：於閾值以上輸血比例",
    funnelNote: "每個圓點代表一位匿名開立醫師。漏斗界線表示依其醫囑數，比例僅因隨機變異可偏離科平均的範圍（二項分布，常態近似）。落在界線外代表值得檢視，並非結論。",
    xOrders: "期間內紅血球醫囑數",
    you: "您",
    avg: "科平均 {p}",
    lim95: "95% 界線",
    lim998: "99.8% 界線",
    youSummary: "您的比例：{n} 筆醫囑中 {p}。科平均：{avg}。",
    guideline: "現行規範：{dept} Hb 閾值 {thr} g/dL，經輸血委員會核定。",
    rulesTitle: "閾值規則",
    rulesIntro: "閾值由輸血委員會訂定，而非軟體。變更僅自生效日起適用；過去月份不會重新分類。",
    current: "現行規則",
    effective: "生效",
    since: "自期間開始",
    scheduled: "已排定",
    draftTitle: "草擬變更",
    newThr: "建議 Hb 閾值（g/dL）",
    impact: "對最近 12 個核可月份的影響預覽",
    wouldFlag: "目前標記 {a} · 變更後將標記 {b}",
    reclass: "{total} 筆過去輸血中有 {n} 筆分類會改變",
    reclassNote: "僅供預覽。核可不會改變過去結果。",
    effectiveFrom: "{date} 生效",
    approveRule: "以主任委員身分核可",
    sameRule: "建議值與現行規則相同。",
    approvedRule: "已核可：{dept} 閾值 {thr} g/dL，自 {date} 起生效。",
    plasmaTitle: "血漿管理",
    plasmaIntro: "血漿是量測與實證的缺口，而非「少輸」目標。以下為審查提示與劑量回饋，實證不確定處皆已標示。",
    pNoInr: "發血前 24 小時內無 INR",
    pLowInr: "INR 小於或等於 1.5",
    pLowInrSub: "{n} 筆醫囑 · 此情境預防性使用的效益證據薄弱",
    uncertain: "實證不確定",
    pDose: "劑量低於 10 mL/kg",
    pDoseSub: "劑量中位數 {m} mL/kg · 有效劑量通常為 10–15 mL/kg",
    pWeight: "未記錄體重",
    pWeightSub: "這些醫囑無法計算劑量",
    ofOrders: "{total} 筆血漿醫囑中 {n} 筆",
    ofDosed: "{total} 筆有體重紀錄的醫囑中 {n} 筆",
    doseHist: "劑量分布 · 全部已核可月份",
    doseAxis: "劑量（mL/kg）",
    band: "常見有效範圍",
    demand: "全院血漿需求 · 每月單位數（供血液基金會規劃）",
    pByDept: "各科血漿使用 · 全部已核可月份",
    pOrders: "醫囑數",
    pUnits: "每百人日單位",
    pNoInrCol: "無 INR",
    pLowCol: "INR ≤ 1.5",
    pMedian: "劑量中位數",
    pUnder: "劑量 < 10",
    srcTitle: "資料來源",
    srcIntro: "BloodStat 的資料來源。檢驗、體重與住院資料經醫院 FHIR Box 取自 TW Core（FHIR R4）。輸血事件取自血庫系統，因為 TW Core v1.0.0 尚無輸血或血品的 Profile。",
    fromTwCore: "經 FHIR Box 取自 TW Core",
    fromBbms: "取自血庫系統",
    proposed: "提案：TW Core 輸血 Profile",
    proposedNote: "以 TW Core Procedure 加上 FHIR R4 基礎 BiologicallyDerivedProduct 資源建構。擴充 URL 僅為示意，尚未發布。範例由本展示中的一筆模擬輸血產生。",
    field: "資料",
    resource: "資源／來源",
    code: "代碼",
  },
} satisfies Record<Lang, Record<string, string>>;

type Key2 = keyof (typeof STRINGS2)["en"];

function t2(key: Key2, vars: Record<string, string | number> = {}): string {
  return STRINGS2[state.lang][key].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

/** Width available for a full-width chart, so SVG text renders at its CSS size. */
function chartWidth(): number {
  const screen = document.querySelector<HTMLElement>(".screen");
  const pad = screen ? parseFloat(getComputedStyle(screen).paddingLeft) * 2 : 64;
  return Math.max(300, Math.min(1180, (screen?.clientWidth ?? 1064) - pad - 4));
}

function median(xs: number[]): number {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ---------- department report ----------

function doctorsIn(dept: string): string[] {
  return [...new Set(D.transfusions.filter((x) => x.dept === dept && x.product === "RBC").map((x) => x.doctor))].sort();
}

/** Two-sided normal-approximation binomial limit around p0 for n trials, clipped to [0, 1]. */
function funnelLimit(p0: number, n: number, z: number): [number, number] {
  const se = Math.sqrt((p0 * (1 - p0)) / n);
  return [Math.max(0, p0 - z * se), Math.min(1, p0 + z * se)];
}

function funnelPlot(dept: string, viewer: string): string {
  const months = approvedMonths();
  const ts = D.transfusions.filter((x) => x.product === "RBC" && x.dept === dept && months.includes(x.month));
  const docs = doctorsIn(dept).map((d) => {
    const mine = ts.filter((x) => x.doctor === d);
    return { d, n: mine.length, p: mine.filter((x) => x.status === "flagged").length / Math.max(1, mine.length) };
  }).filter((r) => r.n > 0);
  const p0 = ts.filter((x) => x.status === "flagged").length / ts.length;
  const W = chartWidth(), H = W < 600 ? 260 : 320, L = 52, R = 24, T = 16, B = 44;
  const nMax = Math.ceil((Math.max(...docs.map((r) => r.n)) * 1.1) / 10) * 10;
  const yMax = Math.min(1, Math.ceil((Math.max(...docs.map((r) => r.p), funnelLimit(p0, Math.max(8, nMax / 12), 3.09)[1]) + 0.05) * 10) / 10);
  const x = (n: number) => L + (n / nMax) * (W - L - R);
  const y = (p: number) => T + (1 - p / yMax) * (H - T - B);
  const curve = (z: number, side: 0 | 1) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const n = Math.max(4, (nMax * i) / 60);
      pts.push(`${x(n).toFixed(1)},${y(Math.min(yMax, funnelLimit(p0, n, z)[side])).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const yt = Array.from({ length: Math.round(yMax / 0.2) + 1 }, (_, i) => i * 0.2);
  const xt = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(nMax * f));
  const grid =
    yt.map((v) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${Math.round(v * 100)}%</text>`).join("") +
    xt.map((v) => `<text class="axis" x="${x(v)}" y="${H - 22}" text-anchor="middle">${v}</text>`).join("") +
    `<text class="axis" x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle">${esc(t2("xOrders"))}</text>`;
  const limits = ([1.96, 3.09] as const)
    .map((z) => `<polyline class="${z < 3 ? "lim95" : "lim998"}" points="${curve(z, 0)}"/><polyline class="${z < 3 ? "lim95" : "lim998"}" points="${curve(z, 1)}"/>`)
    .join("");
  const avgLine = `<line class="avg" x1="${L}" x2="${W - R}" y1="${y(p0)}" y2="${y(p0)}"/>`;
  const others = docs.filter((r) => r.d !== viewer).map((r) => `<circle class="peer" cx="${x(r.n)}" cy="${y(r.p)}" r="5"/>`).join("");
  const me = docs.find((r) => r.d === viewer);
  const mine = me ? `<circle class="me" cx="${x(me.n)}" cy="${y(me.p)}" r="7"/><text class="me-label" x="${x(me.n) + 11}" y="${y(me.p) + 4}">${esc(t2("you"))} ${pct(me.p)}</text>` : "";
  const summary = me ? t2("youSummary", { p: pct(me.p), n: me.n, avg: pct(p0) }) : "";
  return `<section class="block"><h2>${esc(t2("funnelTitle"))}</h2>
    <svg class="chart funnel" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(summary)}">${grid}${limits}${avgLine}${others}${mine}</svg>
    <p class="legend"><span class="key"></span>${esc(t2("avg", { p: pct(p0) }))} <span class="key key-dash"></span>${t2("lim95")} <span class="key key-dot"></span>${t2("lim998")} <span class="key-me"></span>${t2("you")}</p>
    <p class="hint measure-note">${esc(t2("funnelNote"))}</p></section>`;
}

function renderDept(): string {
  const dept = state.deptView;
  const docs = doctorsIn(dept);
  if (!docs.includes(state.viewer)) state.viewer = docs[0];
  const months = approvedMonths();
  const dm = rbcMetrics(months, dept);
  const hm = rbcMetrics(months);
  const rows: [string, string, string][] = [
    [t("mFlagged"), pct(dm.flaggedPct), pct(hm.flaggedPct)],
    [t("mUnits"), dm.unitsPer100.toFixed(2), hm.unitsPer100.toFixed(2)],
    [t("mSingle"), pct(dm.singlePct), pct(hm.singlePct)],
    [t("mortality"), pct(dm.mortalityPct), pct(hm.mortalityPct)],
    [t("losCol"), dm.los.toFixed(1), hm.los.toFixed(1)],
  ];
  const deptOpts = D.depts.map((d) => `<option value="${d.id}" ${d.id === dept ? "selected" : ""}>${esc(d[state.lang])}</option>`).join("");
  const docOpts = docs.map((d) => `<option value="${d}" ${d === state.viewer ? "selected" : ""}>${d}</option>`).join("");
  const thr = deptById.get(dept)!.hbThreshold.toFixed(1);
  return `
    <header class="screen-head"><h1 tabindex="-1">${t2("deptTitle")}</h1><p class="lede">${t2("deptIntro")}</p></header>
    <div class="toolbar">
      <label class="field"><span>${t2("deptPick")}</span><select data-action="deptView" data-key="deptView">${deptOpts}</select></label>
      <label class="field"><span>${t2("viewer")}</span><select data-action="viewer" data-key="viewer">${docOpts}</select></label>
    </div>
    <section class="label compare-label">
      <div class="label-band band-rbc"><h2>${esc(t2("compare", { dept: deptName(dept) }))}</h2></div>
      <div class="table-wrap flush"><table><thead><tr><th scope="col">${t2("measure")}</th><th scope="col" class="num">${t2("thisDept")}</th><th scope="col" class="num">${t2("hospital")}</th></tr></thead>
      <tbody>${rows.map(([k, a, b]) => `<tr><th scope="row">${esc(k)}</th><td class="num strong">${a}</td><td class="num">${b}</td></tr>`).join("")}</tbody></table></div>
      <p class="label-text">${esc(t2("guideline", { thr, dept: deptName(dept) }))}</p>
    </section>
    ${funnelPlot(dept, state.viewer)}`;
}

// ---------- threshold rules ----------

function simulateRule(dept: string, value: number) {
  const ts = D.transfusions.filter((x) => x.product === "RBC" && x.dept === dept && x.preLab !== null && state.approved.has(x.month));
  const now = ts.filter((x) => x.preLab! >= x.threshold).length;
  const next = ts.filter((x) => x.preLab! >= value).length;
  const changed = ts.filter((x) => (x.preLab! >= x.threshold) !== (x.preLab! >= value)).length;
  return { total: ts.length, now, next, changed };
}

/** First day of the month after the demo's current month (the month after the last data month), as an ISO date. */
function nextEffectiveDate(): string {
  const [y, m] = D.months.at(-1)!.split("-").map(Number);
  return new Date(Date.UTC(y, m + 1, 1)).toISOString().slice(0, 10);
}

function dateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return state.lang === "zh" ? `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日` : d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function renderRules(): string {
  const rows = D.depts.map((d) => {
    const sched = state.rules.filter((r) => r.dept === d.id).map((r) => `<span class="tag tag-line">${t2("scheduled")}</span> ${r.value.toFixed(1)} · ${esc(dateLabel(r.effective))}`).join("<br>");
    return `<tr><th scope="row">${esc(d[state.lang])}</th><td class="num">${d.hbThreshold.toFixed(1)}</td><td>${t2("since")}</td><td>${sched || "–"}</td></tr>`;
  }).join("");
  const draft = state.draft;
  const cur = deptById.get(draft.dept)!.hbThreshold;
  const sim = simulateRule(draft.dept, draft.value);
  const same = Math.abs(draft.value - cur) < 1e-9;
  const deptOpts = D.depts.map((d) => `<option value="${d.id}" ${d.id === draft.dept ? "selected" : ""}>${esc(d[state.lang])}</option>`).join("");
  const steps = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
  const seg = steps.map((v) => `<button class="seg" aria-pressed="${v === draft.value}" data-action="draftValue" data-key="${v}">${v.toFixed(1)}</button>`).join("");
  const last = state.ruleMsg ? state.rules.at(-1) : undefined;
  const done = last ? `<p class="notice-line" role="status">${esc(t2("approvedRule", { dept: deptName(last.dept), thr: last.value.toFixed(1), date: dateLabel(last.effective) }))}</p>` : "";
  return `
    <header class="screen-head"><h1 tabindex="-1">${t2("rulesTitle")}</h1><p class="lede">${t2("rulesIntro")}</p></header>
    <section class="block"><h2>${t2("current")}</h2>
      <div class="table-wrap"><table class="dept-table nowrap-head"><thead><tr><th scope="col">${t("dept")}</th><th scope="col" class="num">${t("threshold")}</th><th scope="col">${t2("effective")}</th><th scope="col">${t2("scheduled")}</th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>
    <section class="label draft-label" aria-labelledby="draft-h">
      <div class="label-band band-ink"><h2 id="draft-h">${t2("draftTitle")}</h2><span>${esc(t2("effectiveFrom", { date: dateLabel(nextEffectiveDate()) }))}</span></div>
      <div class="draft-body">
        <label class="field"><span>${t("dept")}</span><select data-action="draftDept" data-key="draftDept">${deptOpts}</select></label>
        <div class="field"><span>${t2("newThr")}</span><div class="segs" role="group" aria-label="${esc(t2("newThr"))}">${seg}</div></div>
      </div>
      <dl class="quad">
        <div><dt>${t2("impact")}</dt><dd class="big num">${num(sim.changed)}</dd><dd class="sub">${esc(t2("reclass", { n: sim.changed, total: sim.total }))}</dd></div>
        <div><dt>${t("flagged")}</dt><dd class="impact-pair">${esc(t2("wouldFlag", { a: sim.now, b: sim.next }))}</dd><dd class="sub">${t2("reclassNote")}</dd></div>
      </dl>
      <div class="label-foot">
        <button class="btn btn-primary" data-action="approveRule" data-key="rule" ${same ? "disabled" : ""}>${t2("approveRule")}</button>
        ${same ? `<span class="hint">${t2("sameRule")}</span>` : ""}
      </div>
    </section>
    ${done}`;
}

// ---------- plasma ----------

function plasmaMetrics(months: string[], dept?: string) {
  const ts = D.transfusions.filter((x) => x.product === "PLASMA" && months.includes(x.month) && (!dept || x.dept === dept));
  const dosed = ts.filter((x) => x.weightKg !== null).map((x) => x.volumeMl / x.weightKg!);
  let pd = 0;
  for (const m of months) for (const [id, v] of Object.entries(D.deptMonth[m])) if (!dept || id === dept) pd += v.patientDays;
  const units = ts.reduce((a, x) => a + x.units, 0);
  return {
    orders: ts.length,
    units,
    unitsPer100: (units / pd) * 100,
    noInr: ts.filter((x) => x.status === "no_lab").length,
    lowInr: ts.filter((x) => x.status === "flagged").length,
    noWeight: ts.length - dosed.length,
    dosed,
    under10: dosed.filter((d) => d < 10).length,
    median: median(dosed),
  };
}

function doseHistogram(doses: number[]): string {
  const W = chartWidth(), H = W < 600 ? 220 : 240, L = 44, R = 16, T = 16, B = 40;
  const bins = Array.from({ length: 11 }, (_, i) => doses.filter((d) => (i === 10 ? d >= 20 : d >= i * 2 && d < i * 2 + 2)).length);
  const max = Math.max(10, Math.ceil(Math.max(...bins) / 10) * 10);
  const bw = (W - L - R) / bins.length;
  const x = (i: number) => L + i * bw;
  const y = (c: number) => T + (1 - c / max) * (H - T - B);
  const band = `<rect class="dose-band" x="${x(5)}" y="${T}" width="${bw * 2.5}" height="${H - T - B}"/><text class="axis band-label" x="${x(5) + 6}" y="${T + 14}">${esc(t2("band"))}</text>`;
  const bars = bins.map((c, i) => `<rect class="bar-ink" x="${x(i) + 2}" y="${y(c)}" width="${bw - 4}" height="${y(0) - y(c)}"><title>${i === 10 ? "≥20" : `${i * 2}–${i * 2 + 2}`} mL/kg: ${c}</title></rect>`).join("");
  // Ticks sit on bin edges (0, 2, 4 ... 20 mL/kg); the last bin holds everything at or above 20.
  const step = W < 600 ? 2 : 1;
  const labels = Array.from({ length: 11 }, (_, i) => (i % step ? "" : `<text class="axis" x="${x(i)}" y="${H - 22}" text-anchor="middle">${i * 2}</text>`)).join("") + `<text class="axis" x="${x(10) + bw / 2}" y="${H - 22}" text-anchor="middle">+</text>`;
  const yTicks = [0, 0.5, 1].map((f) => max * f).map((v) => `<text class="axis" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text><line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t2("doseHist"))}">${band}${yTicks}${bars}${labels}<text class="axis" x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle">${esc(t2("doseAxis"))}</text></svg>`;
}

function demandBars(): string {
  const W = chartWidth(), H = 180, L = 44, R = 16, T = 16, B = 28;
  const months = D.months;
  const vals = months.map((m) => (state.approved.has(m) ? plasmaMetrics([m]).units : null));
  const max = Math.max(50, Math.ceil(Math.max(...vals.map((v) => v ?? 0)) / 50) * 50);
  const bw = (W - L - R) / months.length;
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const every = W < 600 ? 2 : 1;
  const bars = vals.map((v, i) => (v === null ? `<rect class="bar-pending" x="${L + i * bw + 3}" y="${T}" width="${bw - 6}" height="${H - T - B}"/>` : `<rect class="bar-plasma" x="${L + i * bw + 3}" y="${y(v)}" width="${bw - 6}" height="${y(0) - y(v)}"><title>${esc(monthLabel(months[i]))}: ${v}</title></rect>`)).join("");
  const labels = months.map((m, i) => (i % every !== (months.length - 1) % every ? "" : `<text class="axis" x="${L + i * bw + bw / 2}" y="${H - 8}" text-anchor="middle">${esc(state.lang === "zh" ? m.slice(5) + "月" : monthLabel(m).split(" ")[0])}</text>`)).join("");
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f)).map((v) => `<text class="axis" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text><line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t2("demand"))}">${ticks}${bars}${labels}</svg>`;
}

function renderPlasma(): string {
  const months = approvedMonths();
  const latest = latestApproved();
  const m = plasmaMetrics([latest]);
  const all = plasmaMetrics(months);
  const pctOf = (a: number, b: number) => pct(a / b);
  const rows = D.depts.map((d) => ({ d, m: plasmaMetrics(months, d.id) })).filter((r) => r.m.orders > 0);
  const body = rows.map(({ d, m: r }) => `<tr><th scope="row">${esc(d[state.lang])}</th><td class="num">${num(r.orders)}</td><td class="num">${r.unitsPer100.toFixed(2)}</td><td class="num">${pctOf(r.noInr, r.orders)}</td><td class="num">${pctOf(r.lowInr, r.orders)}</td><td class="num">${Number.isFinite(r.median) ? r.median.toFixed(1) : "–"}</td><td class="num">${pctOf(r.under10, r.dosed.length)}</td></tr>`).join("");
  return `
    <header class="screen-head"><h1 tabindex="-1">${t2("plasmaTitle")}</h1><p class="lede">${t2("plasmaIntro")}</p></header>
    <section class="label measure-label">
      <div class="label-band band-plasma"><h2>${t("plasma")}</h2><span>${esc(t("latest", { month: monthLabel(latest) }))}</span></div>
      <div class="quad quad-4">
        <div><h3>${t2("pNoInr")}</h3><p class="big num">${pctOf(m.noInr, m.orders)}</p><p class="sub">${esc(t2("ofOrders", { n: m.noInr, total: m.orders }))}</p></div>
        <div><h3>${t2("pLowInr")} <span class="tag tag-line">${t2("uncertain")}</span></h3><p class="big num">${pctOf(m.lowInr, m.orders)}</p><p class="sub">${esc(t2("pLowInrSub", { n: m.lowInr }))}</p></div>
        <div><h3>${t2("pDose")}</h3><p class="big num">${pctOf(m.under10, m.dosed.length)}</p><p class="sub">${esc(t2("ofDosed", { n: m.under10, total: m.dosed.length }))}</p><p class="sub">${esc(t2("pDoseSub", { m: Number.isFinite(m.median) ? m.median.toFixed(1) : "–" }))}</p></div>
        <div><h3>${t2("pWeight")}</h3><p class="big num">${pctOf(m.noWeight, m.orders)}</p><p class="sub">${esc(t2("pWeightSub"))}</p></div>
      </div>
    </section>
    <section class="block"><h2>${t2("doseHist")}</h2>${doseHistogram(all.dosed)}</section>
    <section class="block"><h2>${t2("demand")}</h2>${demandBars()}</section>
    <section class="block"><h2>${t2("pByDept")}</h2><p class="hint scroll-hint">${t("scrollHint")}</p>
      <div class="table-wrap"><table class="dept-table"><thead><tr><th scope="col">${t("dept")}</th><th scope="col" class="num">${t2("pOrders")}</th><th scope="col" class="num">${t2("pUnits")}</th><th scope="col" class="num">${t2("pNoInrCol")}</th><th scope="col" class="num">${t2("pLowCol")}</th><th scope="col" class="num">${t2("pMedian")}</th><th scope="col" class="num">${t2("pUnder")}</th></tr></thead><tbody>${body}</tbody></table></div>
    </section>`;
}

// ---------- data sources ----------

function exampleBundle(x: Transfusion): string {
  const isRbc = x.product === "RBC";
  const ext = "https://bloodstat.example/fhir/StructureDefinition";
  const patient = "Patient/demo-" + x.id.slice(1);
  const bundle = {
    resourceType: "Bundle",
    type: "collection",
    entry: [
      {
        resource: {
          resourceType: "Procedure",
          meta: { profile: ["https://twcore.mohw.gov.tw/ig/twcore/StructureDefinition/Procedure-twcore"] },
          status: "completed",
          code: { coding: [{ system: "http://snomed.info/sct", code: "116859006", display: "Transfusion of blood product" }] },
          subject: { reference: patient },
          performedDateTime: x.date,
          // R4 Procedure.usedReference cannot target BiologicallyDerivedProduct, so the profile links it by extension.
          extension: [
            { url: `${ext}/transfused-product`, valueReference: { reference: "BiologicallyDerivedProduct/" + x.unitId } },
            { url: `${ext}/transfusion-volume`, valueQuantity: { value: x.volumeMl, unit: "mL", system: "http://unitsofmeasure.org", code: "mL" } },
          ],
        },
      },
      {
        resource: {
          resourceType: "BiologicallyDerivedProduct",
          id: x.unitId,
          productCategory: isRbc ? "cells" : "fluid",
          productCode: { text: isRbc ? "Red blood cells" : "Fresh frozen plasma" },
          identifier: [{ system: `https://bloodstat.example/fhir/sid/isbt128-din`, value: x.unitId }],
          quantity: x.units,
          extension: [
            { url: `${ext}/donation-equivalent`, valueQuantity: { value: x.units * 250, unit: "mL" } },
            { url: `${ext}/abo-rh`, valueString: x.abo },
          ],
        },
      },
      {
        resource: {
          resourceType: "Observation",
          meta: { profile: ["https://twcore.mohw.gov.tw/ig/twcore/StructureDefinition/Observation-laboratoryResult-twcore"] },
          status: "final",
          category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "laboratory" }] }],
          code: { coding: [isRbc ? { system: "http://loinc.org", code: "718-7", display: "Hemoglobin [Mass/volume] in Blood" } : { system: "http://loinc.org", code: "6301-6", display: "INR in Platelet poor plasma by Coagulation assay" }] },
          subject: { reference: patient },
          effectiveDateTime: new Date(new Date(x.date).getTime() - (x.labHoursBefore ?? 0) * 3600e3).toISOString(),
          valueQuantity: isRbc ? { value: x.preLab, unit: "g/dL", system: "http://unitsofmeasure.org", code: "g/dL" } : { value: x.preLab, unit: "{INR}", system: "http://unitsofmeasure.org", code: "{INR}" },
        },
      },
    ],
  };
  return JSON.stringify(bundle, null, 2);
}

function renderSources(): string {
  const tw: [string, string, string][] = [
    ["Hb", "TW Core Observation Laboratory Result", "LOINC 718-7"],
    ["INR", "TW Core Observation Laboratory Result", "LOINC 6301-6 / 34714-6"],
    [t("weight"), "TW Core Observation Body Weight", "LOINC 29463-7"],
    [state.lang === "zh" ? "住院、出院、科別" : "Admission, discharge, department", "TW Core Encounter", "—"],
    [state.lang === "zh" ? "病人" : "Patient", "TW Core Patient", "—"],
  ];
  const bbms = state.lang === "zh" ? "血庫系統匯出" : "BBMS export";
  const bb: [string, string, string][] = [
    [state.lang === "zh" ? "發血單位與時間" : "Issued unit and time", bbms, "ISBT 128 DIN"],
    [state.lang === "zh" ? "血品種類與實際容量" : "Product and actual component volume", bbms, "—"],
    [state.lang === "zh" ? "床邊輸注時間" : "Bedside administration time", state.lang === "zh" ? "護理紀錄（如可取得）" : "Nursing record (if available)", "—"],
    [state.lang === "zh" ? "開立醫師與科別" : "Ordering doctor and department", "BBMS / HIS order", "—"],
  ];
  const table = (rows: [string, string, string][]) =>
    `<div class="table-wrap flush"><table><thead><tr><th scope="col">${t2("field")}</th><th scope="col">${t2("resource")}</th><th scope="col">${t2("code")}</th></tr></thead><tbody>${rows.map(([a, b, c]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td><td class="mono">${esc(c)}</td></tr>`).join("")}</tbody></table></div>`;
  const sample = D.transfusions.find((x) => x.month === latestApproved() && x.product === "RBC" && x.preLab !== null)!;
  return `
    <header class="screen-head"><h1 tabindex="-1">${t2("srcTitle")}</h1><p class="lede">${t2("srcIntro")}</p></header>
    <div class="src-grid">
      <section class="label"><div class="label-band band-ink"><h2>${t2("fromTwCore")}</h2></div>${table(tw)}</section>
      <section class="label"><div class="label-band band-ink"><h2>${t2("fromBbms")}</h2></div>${table(bb)}</section>
    </div>
    <section class="label"><div class="label-band band-ink"><h2>${t2("proposed")}</h2></div>
      <p class="label-text">${esc(t2("proposedNote"))}</p>
      <pre class="code mono">${esc(exampleBundle(sample))}</pre>
    </section>`;
}
