---
name: BloodStat
description: Retrospective transfusion audit and feedback, set like a blood component label.
colors:
  label-ink: "#121417"
  ink-secondary: "#3c434d"
  label-stock: "#ffffff"
  bench-grey: "#e9ecef"
  hairline: "#c9ced5"
  rail-text: "#f3f4f6"
  rail-muted: "#a9b0ba"
  red-cell-band: "#9f1820"
  plasma-straw: "#e0ac1f"
  focus-blue: "#1f4fd1"
typography:
  headline:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, Noto Sans TC, Microsoft JhengHei, PingFang TC, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  measure:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, Noto Sans TC, Microsoft JhengHei, PingFang TC, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  blood-group:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, Noto Sans TC, Microsoft JhengHei, PingFang TC, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, Noto Sans TC, Microsoft JhengHei, PingFang TC, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, Noto Sans TC, Microsoft JhengHei, PingFang TC, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, Noto Sans TC, Microsoft JhengHei, PingFang TC, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.04em"
  data-mono:
    fontFamily: "ui-monospace, Cascadia Mono, SF Mono, Consolas, Noto Sans Mono CJK TC, monospace"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
rounded:
  none: "0px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
components:
  button-primary:
    backgroundColor: "{colors.label-ink}"
    textColor: "{colors.label-stock}"
    rounded: "{rounded.none}"
    padding: "8px 14px"
  button-secondary:
    backgroundColor: "{colors.label-stock}"
    textColor: "{colors.label-ink}"
    rounded: "{rounded.none}"
    padding: "8px 14px"
  button-secondary-hover:
    backgroundColor: "{colors.bench-grey}"
  segment:
    backgroundColor: "{colors.label-stock}"
    textColor: "{colors.label-ink}"
    padding: "6px 12px"
  segment-pressed:
    backgroundColor: "{colors.label-ink}"
    textColor: "{colors.label-stock}"
  tag-inverse:
    backgroundColor: "{colors.label-ink}"
    textColor: "{colors.label-stock}"
    typography: "{typography.label}"
    padding: "1px 8px"
  band-red-cells:
    backgroundColor: "{colors.red-cell-band}"
    textColor: "{colors.label-stock}"
    padding: "8px 16px"
  band-plasma:
    backgroundColor: "{colors.plasma-straw}"
    textColor: "{colors.label-ink}"
    padding: "8px 16px"
  nav-item-current:
    backgroundColor: "{colors.label-stock}"
    textColor: "{colors.label-ink}"
    padding: "10px 8px"
---

# Design System: BloodStat

## Overview

**Creative North Star: "The Component Label"**

Every surface is set like the label a blood bank prints on a component bag: white label stock, black ink, heavy rules dividing the area into quadrants, a product band across the top, and an identifier with a barcode at the foot. The interface behaves like a working analytics tool (rail navigation, tables, charts, standard controls), and the label grammar supplies its type, palette, density and one signature move. Every reviewable transfusion is drawn as a label tile.

The system is flat, square and high-contrast because it is projected in a lit seminar room and read on a laptop. Colour is spent on product identity only: red cells and plasma each own a band colour, and nothing else uses them for decoration. Status is expressed the way a printed label would express it, in ink: inverse tags, outline tags, struck text and an ink stamp.

Density is moderate. Numbers are tabular everywhere, monospace appears only where a value is a measurement or an identifier, and the page always says when data is synthetic.

**Key Characteristics:**
- White label stock on a cool bench-grey field, black ink rules at 2px (frames) and 1px (quadrants).
- Product bands are the only saturated colour: red cells deep red, plasma straw.
- Square corners everywhere; no radius.
- Status in ink grammar, never in traffic-light colours.
- Label tiles with quadrants, a drawn barcode and a mono unit ID are the signature component.

## Colors

A restrained ink-on-stock palette where two product colours carry meaning and everything else is ink or grey.

### Primary
- **Red-Cell Band** (`red-cell-band`): the band across every red-cell label, the main series in charts, and the department bar in tables. It means "red cells", never "error".

### Secondary
- **Plasma Straw** (`plasma-straw`): the band across every plasma label. Also the count badge in the rail and the text-selection highlight, where it reads as a highlighter mark.

### Tertiary
- **Focus Blue** (`focus-blue`): keyboard focus rings only (3px outline, 2px offset). It appears nowhere else.

### Neutral
- **Label Ink** (`label-ink`): body text, all rules and frames, the rail background, primary buttons, inverse tags and the after-review chart series.
- **Ink Secondary** (`ink-secondary`): supporting text, axis labels, column headers, quadrant captions.
- **Label Stock** (`label-stock`): every label, table, chart frame and the top bar.
- **Bench Grey** (`bench-grey`): the page field behind labels, and the hover fill on secondary buttons and segments.
- **Hairline** (`hairline`): table row dividers and chart gridlines.
- **Rail Text / Rail Muted** (`rail-text`, `rail-muted`): text on the ink rail.

### Named Rules
**The Product Owns the Colour Rule.** Red and straw mean red cells and plasma. Never use them for alerts, success, decoration or emphasis.

**The Ink Status Rule.** States are printed marks: ink-inverse for blocking or held, an ink outline for warnings and approved, strike-through for resolved checks, an ink stamp for review decisions. No green, amber or red status colours.

## Typography

**Display Font:** none. The product sets headings in the same system sans as body.
**Body Font:** system sans (Segoe UI, Helvetica Neue, Arial) with Traditional Chinese fallbacks (Noto Sans TC, Microsoft JhengHei, PingFang TC).
**Label/Mono Font:** system monospace (ui-monospace, Cascadia Mono, SF Mono, Consolas).

**Character:** One workhorse sans in heavy weights for numbers and the blood group, like label lettering, with monospace reserved for values a machine would print.

### Hierarchy
- **Measure** (800, 2.75rem, 1.1; 2.25rem below 760px): the headline number in each measure quadrant.
- **Blood Group** (900, 2.5rem, 1): the ABO/Rh glyph on a label tile, the heaviest lettering on the label.
- **Headline** (700, 1.75rem, 1.2): the screen title.
- **Title** (700, 1.0625rem, 1.3): section and band headings.
- **Body** (400, 15px, 1.5): running text; ledes capped at 70ch.
- **Label** (700, 0.75rem, 0.04em, uppercase): column headers, quadrant captions, tags and bands.
- **Data Mono** (700, 1.5rem, 1.1): Hb and INR values on tiles; unit IDs and order IDs at 0.75–0.8125rem.

### Named Rules
**The Tabular Rule.** All numerals are tabular (`font-variant-numeric: tabular-nums`) so columns and deltas line up.

**The Printed Value Rule.** Monospace is used only for lab values and identifiers, never as decoration.

## Layout

A 232px ink rail on the left and a fluid main column capped at 1280px, with 32px screen padding and 32px gaps between blocks. The 4px-based spacing scale (4, 8, 12, 16, 24, 32, 48) sets every gap. Measure labels use a 2×2 quadrant grid; label tiles flow in an auto-fill grid with a 248px minimum, and the review detail panel is a fixed 360px sticky column beside them.

Below 1100px the review detail panel drops under the tiles. Below 760px the rail collapses into a compact top bar (wordmark, inline nav, language toggle), measure quadrants stack in one column, screen padding drops to 16px, and wide tables keep the department column pinned with a "scroll sideways" hint above. Charts size their viewBox to the rendered width so axis text stays at its CSS size, and month labels thin to every other month under 600px.

## Elevation & Depth

The system is flat. Depth comes from ink frames and the contrast between white label stock and the bench-grey field, not from shadows.

### Shadow Vocabulary
- **Rule thickening** (`box-shadow: inset 0 0 0 2px #121417`): hover on a label tile; reads as the frame getting heavier, not lifting.
- **Pinned column edge** (`box-shadow: 1px 0 0 #c9ced5`): the edge of a sticky table column.

### Named Rules
**The No Lift Rule.** Nothing floats. Hover and selection change rule weight or add an ink outline; no drop shadows and no translate lifts.

## Shapes

Square corners on every surface and control (0px radius); the only round forms are chart data markers and their legend key. Frames are 2px ink; internal quadrant dividers are 1px ink; row dividers are 1px hairline. Empty states and the unselected detail panel use a 2px dashed secondary-ink border, the "nothing printed yet" mark. The only rotated element is the review stamp (−4°).

## Components

### Buttons
- **Shape:** square (0px), 2px ink border.
- **Primary:** ink fill, white text, 600 weight, 0.875rem, padding 8px 14px. Used for the one decisive action in a region (Approve and publish, Appropriate given context).
- **Secondary:** white fill, ink text and border, same padding.
- **Hover / Active:** secondary fills bench grey on hover and hairline on press; primary lightens slightly on hover. 150ms ease-out colour transitions.
- **Disabled:** hairline border, white fill, grey text (#6b7380), not-allowed cursor; always paired with a hint saying what unlocks it.

### Segmented Controls
- **Style:** a 2px ink frame holding text buttons, separated by 2px inset ink rules. The pressed segment is ink-filled with white text (`aria-pressed`).
- **Use:** product filter, review status filter, and the chart measure switcher.

### Tags
- **Inverse:** ink fill, white uppercase label text, for Held and Blocks approval. On an ink band the tag inverts to white on ink.
- **Outline:** 1px ink border, for Warning, Approved and Resolved.

### Labels / Containers
- **Corner Style:** square.
- **Background:** label stock on the bench-grey field.
- **Border:** 2px ink frame; a product or ink band across the top with a 2px ink rule below it.
- **Internal Padding:** 12–24px, set by the quadrant.
- **Measure Label:** 2×2 ruled quadrants under a red-cell band, with an ID foot carrying a drawn barcode, the label ID in mono and a data-quality note.

### Inputs / Fields
- **Select:** square, 2px ink border, white fill, 0.875rem.
- **Focus:** 3px focus-blue outline with 2px offset on every interactive element.

### Navigation
- **Rail:** ink background, 600-weight items separated by 1px dark rules. Current item is a white block with ink text (`aria-current="page"`); hover darkens slightly. Count badges are straw with ink text.
- **Language toggle:** a two-button outline group (EN / 中文); the active language is filled.
- **Mobile:** the rail becomes a compact top bar with nav items inline.

### Label Tile (signature component)
A clickable label for one transfusion: a product band across the top, four ruled quadrants (units and volume; blood group at display weight; lab value in mono with the rule under it; department, prescriber code and date), and a foot with a drawn barcode and the mono unit ID. Selection adds a 3px ink outline with 2px offset. A review decision lands as a stamp on the barcode strip only, so the blood group, lab value and unit ID stay legible: an ink-outline stamp for Appropriate and an ink-filled stamp for Not justified, entering with a 220ms scale-in that is disabled under reduced motion.

## Do's and Don'ts

### Do:
- **Do** frame every content region as a label: white stock, 2px ink frame, a band across the top when it belongs to a product.
- **Do** keep red (#9f1820) and straw (#e0ac1f) for red cells and plasma only.
- **Do** express status with ink: inverse tags, outline tags, strike-through and stamps.
- **Do** set numbers in tabular figures and lab values and identifiers in monospace.
- **Do** keep the blood group the heaviest lettering on any label tile.
- **Do** label synthetic data on every screen.

### Don't:
- **Don't** add border radius to any surface or control; the only round forms are chart data markers.
- **Don't** use drop shadows or hover lifts; change rule weight instead.
- **Don't** introduce green, amber or red status colours.
- **Don't** place a stamp, badge or overlay over the blood group, lab value or unit ID.
- **Don't** use monospace for headings, labels or decoration.
