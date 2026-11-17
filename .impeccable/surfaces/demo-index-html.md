---
version: 1
slug: "demo-index-html"
primary_target: "demo/index.html"
related_targets: []
---

## Scope
Demo app shell (demo/index.html): data steward load, hospital overview, review queue. Mode: Operate. Audience: two professors (health information systems; biostatistics) at a pitch demo, projected and on a laptop.

## Direction contract
THESIS: Every transfusion is a blood component label. The screen reads like the label a blood bank prints: quadrants, heavy rules, unit ID and barcode, product band. Refuses the grey KPI-card analytics template.
OWN-WORLD: White label stock, black ink, 2px black rules. Component colours carry product only: red cells deep red band, plasma straw band. Ink-black left rail. Flag state is ink-inverse tag, not red. Square corners, no shadows except overlays. System sans with Traditional Chinese fallbacks, tabular numerals; monospace only for unit IDs and lab values.
STORY: Steward approves the held load, the overview updates, a reviewer opens a flagged label tile, reads the chart context, marks it appropriate, and the measure changes.
FIRST VIEWPORT: Left rail nav (Steward, Overview, Review queue) and EN/中文 toggle; top bar with month and synthetic-data notice; main area is the active screen. Overview leads with a four-quadrant measure label (above threshold, units/100 patient-days, single-unit share, outcomes), then a monthly trend chart and a department table.
FORM: Blood component label (ISBT 128 layout grammar), grounded pick #1. seed:278bc263747d43d1
SIGNATURE: Flagged cases rendered as label tiles with quadrant layout and a drawn barcode strip; reviewing a tile stamps it.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
