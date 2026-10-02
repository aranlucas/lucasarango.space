---
name: "Lucas Arango’s portfolio"
description: "A systems atlas for useful tools, engineering work, and published decisions."
colors:
  background: "#f7f8f2"
  foreground: "#172125"
  card: "#ffffff"
  primary: "#273bc4"
  primary-foreground: "#ffffff"
  secondary: "#e9ecdf"
  muted-foreground: "#535d5e"
  accent: "#e6f28b"
  accent-foreground: "#172125"
  destructive: "#ae302d"
  border: "#cbd1c2"
  cobalt: "#273bc4"
  lime: "#e6f28b"
  route-soft: "#d2d9ff"
  route-line: "#6979e7"
  ridge: "#83936e"
  background-dark: "#171d29"
  foreground-dark: "#f1f4e9"
  card-dark: "#202838"
  primary-dark: "#b7c2ff"
  secondary-dark: "#293344"
  muted-foreground-dark: "#b0bac3"
  destructive-dark: "#ffaaa0"
  border-dark: "#434e60"
  night: "#0b1418"
  night-foreground: "#dce5e7"
  night-muted: "#8d9da4"
  lamp: "#f3d9a4"
  lamp-foreground: "#1d1408"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(4.5rem, 7.5vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.89
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(2.5rem, 4vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1
  title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(2.2rem, 3.8vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 1.05
  page-title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(3.5rem, 8vw, 6rem)"
    fontWeight: 600
    lineHeight: 1
  article-title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(2.75rem, 5vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.08
  route-title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(2.5rem, 3.5vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.02
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  reading-body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.85
  writing-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 700
    lineHeight: 1.4
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.7
  control:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  route-control:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.7
  ask-control:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  input:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  badge:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
rounded:
  square: "0"
  xs: "0.125rem"
  sm: "0.15rem"
  md: "0.2rem"
  lg: "0.25rem"
  xl: "0.35rem"
  4xl: "2rem"
  full: "calc(infinity * 1px)"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
  "14": "3.5rem"
  "16": "4rem"
  "18": "4.5rem"
  "20": "5rem"
  "24": "6rem"
  "28": "7rem"
components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    size: "2rem"
  button-ask:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.ask-control}"
    rounded: "{rounded.full}"
    padding: "0 1.25rem 0 1rem"
    height: "2.75rem"
  button-route:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.route-control}"
    rounded: "{rounded.square}"
    padding: "0.5rem 0.85rem"
    height: "44px"
  input-question:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.input}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 0.75rem"
  nav-link:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    height: "44px"
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    typography: "{typography.badge}"
    rounded: "{rounded.4xl}"
    padding: "0.125rem 0.5rem"
    height: "1.25rem"
  project-exhibit-lime:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.square}"
    padding: "3rem"
  writing-row:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    padding: "1.5rem 0"
  route-panel:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.card}"
    rounded: "{rounded.square}"
    padding: "1.75rem 2rem 1.4rem"
---

# Design System: Lucas Arango’s portfolio

## Overview

**Creative North Star: "Systems Atlas"**

Useful tools have visible relationships to the problems that inspired them. The visual system borrows the clarity of route maps: saturated fields, continuous lines, selectable stops, and strong alignment. Industrial condensed headings give the work a confident public identity; spacious Manrope text makes the reasoning comfortable to read.

The system is direct, practical, and playful. Its expressive surfaces are square cobalt and lime exhibits; writing and résumé pages use quieter, narrow reading columns. Diagrams describe actual workflows, and interaction remains reversible. The site follows the operating system’s color preference while keeping its signature route palette stable.

**Key Characteristics:**

- Condensed uppercase display type paired with legible sans-serif reading text.
- Fixed cobalt and lime exhibits within an adaptive neutral reading palette.
- Open layouts, ruled lists, and semantic relationship diagrams.
- Native controls, visible focus, and reduced-motion alternatives.

## Colors

Cobalt supplies the structure; acid lime marks the selected path; warm paper and ink support reading. The frontmatter is the normative token inventory. Sidecar tonal ramps are synthesized previews of these colors, not additional runtime tokens.

### Primary

- **Atlas Cobalt** (`cobalt`): fixed background of the interactive route, the plugin exhibit, and the square wordmark.
- **Action Cobalt** (`primary`): links, active navigation, reading progress, and primary controls in the light theme.
- **Periwinkle Action** (`primary-dark`): the dark-theme counterpart for links and controls. Its foreground uses dark background ink.
- **Route Mist** (`route-soft`) and **Route Line** (`route-line`): secondary route text, unvisited waypoints, separators, and the untraced path on cobalt.

### Secondary

- **Acid Lime** (`lime`, `accent`): selected route controls, reached waypoints, the grocery exhibit, and diagram emphasis on cobalt. It always pairs with the fixed dark accent ink, including in dark mode.
- **Ridge Olive** (`ridge`): the secondary contour of the retained Ask glyph.

### Neutral

- **Warm Paper** (`background`), **Ink** (`foreground`), **White Surface** (`card`): page canvas, text, and conversation surfaces.
- **Soft Paper** (`secondary`), **Slate Text** (`muted-foreground`), **Paper Rule** (`border`): restrained support surfaces, secondary prose, and thin separators. The source aliases muted to secondary, input to border, and popover to card.
- **Night Slate** (`background-dark`), **Pale Ink** (`foreground-dark`), **Raised Slate** (`card-dark`), **Soft Slate** (`secondary-dark`), **Cool Text** (`muted-foreground-dark`), and **Slate Rule** (`border-dark`): the operating-system dark theme. The ring becomes lime; signature cobalt and lime stay fixed.
- **Error Red** (`destructive`) and **Error Coral** (`destructive-dark`): invalid form states.
- The 404 forest uses the separate `night`, `night-foreground`, `night-muted`, `lamp`, and `lamp-foreground` tokens regardless of the operating system’s theme. These belong to that game surface.
- Print uses white paper, slate text, and a muted green link accent. Screen themes do not govern the printed résumé.

**The Fixed Route Rule.** Use fixed cobalt and lime for expressive route surfaces; use the adaptive primary and neutral tokens for reading, navigation, and general controls.

## Typography

**Display Font:** Barlow Condensed, with sans-serif fallback. The implementation loads weights (600, 700).
**Body Font:** Manrope, with sans-serif fallback. Both families are self-hosted through Next.js font loading.

**Character:** Tall, compact display lettering creates exhibit-scale hierarchy. Manrope carries facts, questions, dates, and prose without inheriting the compressed display voice.

### Hierarchy

- **Display:** the opening name uses the `display` token, bold (700), tightly stacked, with uppercase transformation and slightly negative tracking. Below the mobile threshold its clamp becomes (4.5rem, 18vw, 6rem).
- **Headline:** major section titles use `headline`, semibold (600), uppercase, with a firm single-line-height rhythm.
- **Title:** project headings use `title`; full page headings use `page-title`; article headings use `article-title`. These have distinct observed clamps rather than one interchangeable display size.
- **Route title:** `route-title` is uppercase and constrained to (15ch); on mobile it becomes (2.8rem).
- **Body:** `body` establishes the shell rhythm. Biography text is bounded at (65ch); the intro lede is shorter (32ch, then 38ch on mobile).
- **Reading body:** `reading-body` gives published articles a more generous line height. At the mobile threshold it becomes (1rem / 1.8).
- **Writing title:** `writing-title` is bold Manrope within list rows; on mobile it becomes (1rem). Summaries use smaller regular text and remain secondary.
- **Label and controls:** `label` is the main navigation role; `control` serves ordinary buttons, `route-control` serves the lime path action, `ask-control` keeps the launcher’s regular weight, `input` serves the composer, and `badge` serves résumé date labels. Dates use tabular numerals.

**The Two Voices Rule.** Reserve Barlow Condensed for headings and diagram terms; keep prose, navigation, and form text in Manrope.

## Layout

The outer shell is centered, bounded at (76rem), and uses a desktop width of `min(100% - 5rem, 76rem)`. At widths at or below (740px), it becomes `calc(100% - 2.5rem)`. The spacing inventory follows the observed quarter-rem rhythm, with large gaps used between exhibits rather than repeated padded cards.

The home opening uses an asymmetric two-column grid (1fr / 1.1fr) with a wide gap (5rem). Biography uses (0.85fr / 1.1fr); most project exhibits use (1.3fr / 0.8fr), with the plugin exhibit using equal columns. At or below (1000px), gaps and exhibit side padding tighten. At or below (740px), these compositions stack; the header wraps, and its navigation and Ask action share a full-width row.

Reading uses centered widths suited to the content: index (65rem), article (48rem), résumé (54rem). The writing list has date, copy, and arrow columns (7rem / 1fr / 1.5rem). Mobile moves the date and reading time above the title, with copy and arrow below. The copy measure is capped at (70ch).

The header and footer live in normal document flow. Ask is a regular header action and only opens an overlay after activation. At the Tailwind small threshold (40rem), the open conversation changes from a full-screen phone surface to a right-side panel (26rem wide), capped at `min(40rem, calc(100dvh - 6.5rem))`.

Print removes site navigation, footer, and interactive controls, releases résumé width constraints, and sets the base to (13px). Keep the document’s source order intact when adapting grids.

## Elevation & Depth

The portfolio is flat at rest: color fields, spacing, and thin rules separate content. Project exhibits and writing rows carry no decorative shadows. Soft library shadows are confined to overlays and auxiliary controls.

### Shadow Vocabulary

- **Conversation panel:** Tailwind `shadow-xl`, a diffuse two-part shadow for the open desktop Ask panel.
- **Conversation scroll control:** Tailwind `shadow-sm`, a smaller lift within the transcript.
- **Skip link:** Tailwind `shadow-md`, visible when keyboard focus reveals the skip control.

The exact shadow values are recorded in the sidecar. General controls use a focus border and translucent three-pixel ring; page links use a two-pixel outline offset by three pixels. On cobalt, the focus outline is white.

**The Flat Exhibit Rule.** Establish hierarchy with field color, type, and spacing; reserve soft shadow for actual overlays and auxiliary controls.

Motion follows the relationship being shown. Route tracing transitions over (650ms) with `cubic-bezier(0.16, 1, 0.3, 1)`; reduced motion changes it immediately. Navigation uses short crossfades, directional tab movement, and title morphs while the header stays still. Reduced motion removes travel and preserves the short crossfade. Reading progress is shown only when scroll timelines are supported.

## Shapes

Expressive exhibits and the wordmark are square. Route paths bend, and their stops are circular: curves communicate travel and selection rather than making every container soft. Workflow diagrams use small circular nodes, a square shared-canvas node, and branches or paired connections that reflect the workflow.

Ordinary form and conversation controls have restrained corners derived from the base radius (0.25rem). The header Ask launcher is a pill; résumé date badges use the library’s larger badge radius. Thin, solid borders structure neutral surfaces and writing rows. The route line is thicker (4px); diagram links are (2px), or (4px) in the shared-canvas pattern.

## Components

### Buttons

Direct and compact, with explicit state changes.

- The ordinary primary button uses adaptive primary and its contrasting foreground. Hover reduces the background to (80%); active state moves by (1px).
- The résumé print button uses the outline variant, a subtle rounded corner, and a (2.25rem) height. Hover moves to the muted surface; dark mode uses the input color at (30%), then (50%) on hover.
- Ghost icon buttons serve conversation controls. They gain a muted background on hover and show the same visible focus ring.
- The lime route action is square, touch-sized (minimum 44px), and changes to white on hover. Its padding is recorded in `button-route`.
- The Ask launcher is a header pill (44px tall), with full text on desktop and “Ask” at or below (740px). Its hover and focus follow the ordinary primary button. When the panel is open, it becomes a close control. The panel also carries a close control at every breakpoint so it remains dismissible when the header scrolls away. Close and Escape return focus to the header launcher after the closed state commits, on phone and desktop.

### Chips

Compact metadata, not a replacement for headings. Résumé date badges use the secondary surface, foreground text, a (20px) height, and tabular numerals. The route’s project selector is a button group with (44px) targets: unselected labels remain light on cobalt; selected labels use lime and dark ink; hover uses white and dark ink.

### Cards / Containers

Project exhibits are open, square, two-column content fields. Their backgrounds vary between lime, the page surface, and cobalt; their diagrams and action colors follow the field. Desktop padding is (3rem), with deliberate larger block spacing on the neutral and cobalt variants; mobile padding becomes (2rem 1.5rem). Keep titles, real questions, descriptions, source links, and workflow relationships visible.

The Ask panel is an overlay only while open, with the card palette, restrained rounded corners, a thin border, and the conversation shadow. Its title and controls form an internal row, without adding another site banner. Its transcript loads lazily on first opening and remains mounted after messages exist, preserving the reading position.

### Inputs / Fields

The Ask composer groups a content-sized textarea and action within one bordered surface. The outer group supplies the small radius, input stroke, and focus ring; the textarea itself is borderless and transparent. It starts at a (44px) minimum height and stops growing at (8rem). Placeholder and supporting text use the muted foreground.

Focus changes the group border to ring color and adds the translucent ring. Invalid states use destructive color. The disabled submit button loses opacity and interaction; an empty-question submit state keeps the editable field and its background at full contrast. The action becomes “Stop” while an answer streams.

### Navigation

A square cobalt wordmark anchors a compact row of Manrope links. Links use muted text by default and adaptive primary on hover or when current; a solid (3px) underline identifies the current page. Targets remain at least (44px) tall. Mobile wraps the header and preserves the same semantic link order.

### Writing rows

Ruled, readable archive entries with date and reading time at left, title and summary in the center, and an inline SVG arrow at right. Hover underlines the title and changes it to primary. Focus follows the global outline. Mobile places metadata above the copy rather than squeezing the desktop grid.

### Follow an idea

The signature route explorer uses a fixed cobalt field, a lime trace, and three native waypoint buttons. Selecting a project resets the selected stop; selecting any stop or following the path updates a factual note. Reached stops fill with lime; the current stop adds a fine outer ring. A live region announces the note, and the story link provides the full account. The diagram’s path and stops express a conceptual workflow, without implying live product status.

## Do's and Don'ts

### Do:

- **Do** use fixed cobalt and lime for route exhibits and adaptive semantic colors for reading and navigation.
- **Do** keep condensed uppercase headings and diagram terms distinct from Manrope prose and controls.
- **Do** preserve open exhibit layouts, thin archive rules, and the observed reading widths.
- **Do** use native controls, visible focus, minimum 44px route and navigation targets, and reduced-motion alternatives.
- **Do** base diagrams and interactions on actual project relationships and keep exploration reversible.
- **Do** place Ask in the header and preserve its lazy transcript and existing reading position.

### Don't:

- **Don't** replace the atlas with a generic dark gradient card grid.
- **Don't** apply display typography to paragraphs or long reading text.
- **Don't** round every exhibit or add decorative shadows to project and writing surfaces.
- **Don't** obscure reading with an always-floating Ask launcher.
- **Don't** imply live product telemetry through the conceptual project route.
- **Don't** carry the 404 game’s night palette into ordinary portfolio or reading surfaces.
