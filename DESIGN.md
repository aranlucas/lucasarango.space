---
name: "Lucas Arango’s portfolio"
description: "A one-bit thermal receipt from a Seattle engineer."
colors:
  background: "#f7f7f3"
  foreground: "#111111"
  card: "#fbfbf8"
  primary: "#111111"
  primary-foreground: "#f7f7f3"
  secondary: "#ebebe5"
  muted-foreground: "#5a5a56"
  accent: "#e4e4dd"
  accent-foreground: "#111111"
  destructive: "#b3261e"
  border: "#c8c8c1"
  leader: "#8e8e88"
  background-dark: "#121211"
  foreground-dark: "#ecece6"
  card-dark: "#181817"
  primary-dark: "#ecece6"
  primary-foreground-dark: "#121211"
  secondary-dark: "#222220"
  muted-foreground-dark: "#a3a39c"
  accent-dark: "#2a2a28"
  destructive-dark: "#f2867a"
  border-dark: "#3b3b38"
  leader-dark: "#6a6a65"
  night: "#0b1418"
  night-foreground: "#dce5e7"
  night-muted: "#8d9da4"
  lamp: "#f3d9a4"
  lamp-foreground: "#1d1408"
typography:
  display:
    fontFamily: "Pixelify Sans, Martian Mono, monospace"
    fontSize: "clamp(2.5rem, 12vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1
  article-title:
    fontFamily: "Pixelify Sans, Martian Mono, monospace"
    fontSize: "clamp(2rem, 8vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.05
  headline:
    fontFamily: "Pixelify Sans, Martian Mono, monospace"
    fontSize: "1.3125rem"
    fontWeight: 600
    lineHeight: 1.3
  nav:
    fontFamily: "Pixelify Sans, Martian Mono, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.75
  article-body:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.8
  note:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
  meta:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0.1em"
  footer-link:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0.08em"
rounded:
  none: "0"
  line: "0.25rem"
  tab: "0.375rem"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
components:
  nav-tab:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.nav}"
    height: "44px"
  nav-tab-current:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.nav}"
    rounded: "{rounded.tab}"
  line-item:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.line}"
    height: "44px"
  line-item-active:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.line}"
  line-note:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.note}"
  text-link:
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
  ask-panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    width: "26rem"
  forest-link:
    textColor: "{colors.foreground}"
    typography: "{typography.nav}"
    height: "44px"
---

# Design System: Lucas Arango’s portfolio

## Overview

**Creative North Star: "One-bit receipt"**

The site is one long thermal till receipt from a Seattle engineer: a single narrow column of the things he has built and written, itemized. The greeting is printed under a dithered Cascades peak, the way a till prints its logo, and the receipt closes with "Thank you for stopping by." It refuses the two-column hero, project cards and diagrams, and the cream-and-serif notebook the earlier iterations wore.

The world fuses two sources. The receipt supplies the structure: one column, dashed and double rules, dotted leaders between an item and its quantity, uppercase meta. HyperCard supplies the one-bit discipline: dithered artwork, bitmap headings, and a pressed state that inverts to solid ink. The interface follows the operating system's theme. Dark mode exchanges paper and ink rather than introducing a new palette.

**Key Characteristics:**

- One column, about 34rem, centred; nothing sits beside anything else.
- Ink and paper only: no hue anywhere on the reading surfaces.
- Bitmap headings over a condensed monospace that sets every other word.
- Line items with dotted leaders; whatever is active reverse-prints.
- A dithered peak at the top and a barcode and owl at the bottom.

## Colors

Restrained to one bit: cool thermal paper and carbon ink, with greys only where text must recede.

### Primary

Ink (`foreground`, `#111111`) carries text, rules, links and every active state. `primary` aliases ink so library controls print in the same black.

### Neutral

Paper (`background`, `#f7f7f3`) is cool, not cream. `card` is a slightly brighter sheet for the Ask panel. `muted-foreground` (`#5a5a56`, 6.4:1 on paper) carries notes, dates and meta. `leader` greys the dotted leaders so they read as connective, not as content. `border` is reserved for library form controls; receipt rules use ink.

Dark mode is night printing: `#121211` paper and `#ecece6` ink, the same roles exchanged. The 404 forest keeps its separate night and lamp palette regardless of theme. Print uses white paper and black ink. `destructive` exists only for form errors.

**The One-Bit Rule.** No hue on any reading surface. Emphasis comes from inversion, weight, case and rules, never from color.

## Typography

**Display font:** Pixelify Sans, a bitmap face (self-hosted by next/font).
**Body font:** Martian Mono at `wdth` 87, a condensed monospace (self-hosted by next/font).

Pixelify Sans sets the greeting, page and article titles, section headings, the nav tabs, the footer sign-off and the owl link. Martian Mono sets everything else, at a condensed width so the column stays narrow without cramping. The mono is the receipt's printing, not a "technical" costume; it is what the paper is.

### Hierarchy

- **Display** (700, `clamp(2.5rem, 12vw, 3.5rem)`, line-height 1): the home greeting and page titles, centred.
- **Article title** (700, `clamp(2rem, 8vw, 2.75rem)`): post headings, centred.
- **Headline** (600, 1.3125rem): section headings such as "Things I’m building".
- **Body** (0.875rem, 1.75): biography and line items. Articles step up to 0.9375rem at 1.8 for long reading.
- **Note** (0.8125rem, muted): the description under a line item.
- **Meta** (0.6875rem, 0.1em tracking, uppercase, tabular numerals): sub-lines, tallies, dates and quantities.

**The Printed Meta Rule.** Uppercase belongs to receipt metadata only: tallies, dates, quantities, the sub-line. Headings and prose stay in sentence case.

## Layout

The shell is centred at `min(100% - 2rem, 34rem)` on every route. The header is a centred row of tabs. The home page reads top to bottom: printed peak (max 26rem), greeting, sub-line, dashed rule, biography, double rule, projects, dashed rule, recent writing, then the footer behind a double rule.

Dashed rules separate items within a story; double rules separate the receipt's major parts (after the message, before the footer, before an article's older/newer lines). Section headings carry a flush-right tally or link on the same baseline.

**The Single Column Rule.** Nothing sits beside anything else. Leaders and flush-right quantities are the only horizontal structure.

## Elevation & Depth

Flat. Paper has no shadow and no layers except the Ask panel, which is a sheet with a 2px ink border on desktop and the full screen on phones. Depth is expressed by inversion, not elevation.

## Shapes

Square by default. The current tab and an active line take a small radius (0.375rem and 0.25rem) so the reverse-print reads as a stamped block rather than a selection bug. Artwork is one-bit: ordered dither patterns at 12, 25, 50 and 75 percent, crisp edges, no anti-aliased greys.

## Components

### Navigation tabs

About, Writing and Resume are the centred Pixelify tabs, each with a 44px target. The current tab is an inverted ink block that glides between tabs with a view transition. Hover inverts too. Ask lives outside the header as a fixed bottom-right launcher, keeping the navigation row focused on the site's primary routes.

### Line items

The receipt's core pattern: a name, a dotted leader that fills the gap, and a quantity flush right (`STORY →`, `3 MIN`). Writing lines lead with a muted date. The whole line is one link with a 44px target; hover and keyboard focus reverse-print the line, leader and date included. A muted note may follow, indented two characters; project notes end with a `Source` link.

### Text links

Underlined ink (1px, 0.2em offset). Hover reverse-prints the word.

### Printed artwork

`ReceiptArt`: a dithered peak with firs over a 2px ground rule, printed in from the top in 15 steps on load (skipped for reduced motion). The share card renders the same artwork, the bitmap title and a receipt meta line.

### Footer

A double rule, "Thank you for stopping by." in Pixelify, GitHub / LinkedIn / RSS as uppercase meta links, a decorative barcode, and the owl's return policy: "Returns: take a wrong turn" with a pixel owl sprite whose eyes blink once on hover. The owl link opens the retained 404 forest and never prefetches it.

### Ask

Ask is a fixed bottom-right 16rem × 48px bar with a 1rem (or safe-area) bottom gap and a 9×6 pixel peak glyph that prints row by row while an answer is loading. Clicking it opens a flat 26rem-wide compact sheet above the bar: 27rem when empty and up to 34rem with a transcript, capped to the viewport. It keeps a square 2px ink border and the receipt's monochrome paper-and-ink treatment; small mobile gutters keep the bar reachable. Hide or Escape closes the sheet while retaining the conversation and draft, then returns focus to the launcher. The transcript runtime stays dynamically imported.

## Do's and Don'ts

### Do:

- **Do** keep every route in the one centred column.
- **Do** express state by reverse-printing: ink block, paper text.
- **Do** keep artwork one-bit and dithered, with crisp edges.
- **Do** keep the forest and Ask transcript lazy, and honor reduced motion and visible focus.
- **Do** keep factual biography, published writing, project links and game behavior intact.

### Don't:

- **Don't** add a second column, cards, or diagrams beside copy.
- **Don't** introduce hue, gradients or soft shadows on reading surfaces.
- **Don't** use pill badges or rounded chips; dates and counts are uppercase meta text.
- **Don't** print Lucas's name twice on one page.
- **Don't** invent accomplishments, metrics, endorsements or product capabilities.
