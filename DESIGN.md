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

## One-bit receipt

The site is a thermal till receipt from a Seattle engineer: one narrow column of itemized work and writing. The receipt supplies dashed and double rules, dotted leaders, and uppercase metadata. HyperCard supplies dithered artwork, bitmap headings, and pressed states that invert to solid ink. The owner rejected earlier systems-atlas and cream-and-serif notebook directions as busy and over-designed; retain the single column and personal voice.

Use ink and paper on reading surfaces. Express emphasis through inversion, weight, case, and rules. Dark mode exchanges paper and ink; the 404 forest keeps its separate night and lamp palette. Uppercase belongs to metadata, while headings and prose use sentence case. Pixelify Sans supplies bitmap headings; condensed Martian Mono supplies the receipt’s printing. Token values and component metrics above support design tooling; runtime styles live in [theme.css](src/app/theme.css) and [globals.css](src/app/globals.css).

## Composition and interaction

- Keep reading routes in one centred column. Dotted leaders and flush-right quantities provide horizontal structure; article Older/Newer navigation can share a row.
- Keep availability and a résumé link in the first viewport so hiring visitors can reach professional details without scrolling. Résumé section breaks should read larger than the space between roles; compact internships and selective Ask prompts keep experience readable.
- Use linked line items for work and writing, with reverse-print hover and visible keyboard focus. Source links remain available beneath project descriptions.
- Keep surfaces flat and square, with a small radius for inverted tabs and active rows. The Ask panel is a bordered sheet; avoid shadows, gradients, pill badges, and project cards.
- Print one-bit artwork with crisp dither patterns. The peak’s stepped entrance must respect reduced motion.
- Keep the footer’s owl detour into the forest discoverable without prefetching the game.
- Keep Ask outside the primary navigation and compact on narrow screens so it covers less of the reading column. Closing its sheet retains the conversation and draft and returns focus to the launcher; the transcript runtime stays lazy.

[PRODUCT.md](PRODUCT.md) defines content and accessibility constraints. [ROADMAP.md](ROADMAP.md) defines proposed product work.
