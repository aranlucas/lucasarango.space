---
name: "Lucas Arango’s portfolio"
description: "A personal engineering notebook in the Cascades."
colors:
  background: "#f4f1ea"
  foreground: "#17242c"
  card: "#faf7f0"
  primary: "#2c6654"
  primary-foreground: "#f1f6f4"
  secondary: "#eae6de"
  muted-foreground: "#56666e"
  accent: "#eae6de"
  accent-foreground: "#17242c"
  destructive: "#b3412f"
  border: "#d4d2c8"
  ridge: "#859b91"
  background-dark: "#121b21"
  foreground-dark: "#dce5e7"
  card-dark: "#17232a"
  primary-dark: "#86c3ae"
  primary-foreground-dark: "#0f2019"
  secondary-dark: "#1a262d"
  muted-foreground-dark: "#8d9da4"
  accent-dark: "#1f2e36"
  accent-foreground-dark: "#dce5e7"
  destructive-dark: "#e07a66"
  border-dark: "#2b3a42"
  ridge-dark: "#4c646d"
  night: "#0b1418"
  night-foreground: "#dce5e7"
  night-muted: "#8d9da4"
  lamp: "#f3d9a4"
  lamp-foreground: "#1d1408"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 600
    lineHeight: 1.4
  page-title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  article-title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  lede:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
  route-title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
  writing-title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.7
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.7
  control:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  input:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  ask-control:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
rounded:
  sm: "0.225rem"
  md: "0.3rem"
  lg: "0.375rem"
  xl: "0.525rem"
  panel: "0.5rem"
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
components:
  wordmark:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
  navigation:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    height: "44px"
  button-ask:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.ask-control}"
    rounded: "{rounded.full}"
    height: "44px"
  greeting:
    textColor: "{colors.foreground}"
    typography: "{typography.display}"
  forest-link:
    textColor: "{colors.primary}"
    height: "44px"
  route-panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.panel}"
    padding: "1.35rem"
  project-story:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    padding: "2rem 0"
  writing-row:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    padding: "1.35rem 0"
  input-question:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.input}"
    rounded: "{rounded.lg}"
    height: "44px"
  button-close:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    size: "2rem"
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.4xl}"
    height: "1.25rem"
---

# Design System: Lucas Arango’s portfolio

## Overview

**Creative North Star: "Cascades Notebook"**

A personal engineering notebook in the Cascades: warm paper, fir links, a mountain mark and the original conversational greeting. Literata carries the biography and reading voice. Modest mono labels identify tools, dates and diagrams. The mountain logo keeps the outdoor reference compact. The owl uses the existing critter silhouette as a small footer detour, after the work, rather than a detached hero ornament.

Clear project/source links, the dated writing archive and reversible route controls remain. Factual project stories sit in open ruled layouts. The interface follows the operating system’s theme, with native controls, reduced motion and the lazy Ask transcript retained.

This documentation includes a draft composition refinement responding to feedback on diagram alignment and detached outdoor decoration. The new draft is held for visual review before another production deployment. The prior Cascades Notebook restoration was approved. The cloud implementation was reconstructed from the approved desktop, phone and dark previews and this design specification, because the earlier local-only commit was unavailable. Source history supplies the original fonts, palette, ridge geometry and factual content.

**Key Characteristics:**

- The original mountain mark, kept at logo scale.
- Warm paper/fir palette and a conversational serif voice.
- Open project stories and a clear, dated writing archive.
- A playful detour into the preserved critter game.

## Colors

Use the adaptive paper, ink and fir tokens throughout the portfolio. The frontmatter records runtime values; the sidecar records matching palette metadata.

### Primary

Fir (`primary`) carries links, the selected project tab, route trace and native actions. The dark theme uses the original pale fir, paired with deep green foreground ink. A thin fir underline marks current navigation.

### Secondary

Ridge (`ridge`) carries the quieter contour lines and workflow connections. The secondary/muted surface supports the circular mountain mark and metadata. Input aliases border; popover aliases card. Focus rings use primary.

### Neutral

Warm paper, slate ink and raised paper preserve the earlier site’s reading character. The corresponding dark values use the original night slate palette. Supporting text uses muted foreground in both themes. Destructive tokens retain their form-state role.

The 404 forest retains its separate night/lamp palette regardless of the OS theme. Do not recolor the gameplay surface to match the reading canvas. Print uses white paper and slate ink.

## Typography

Literata is the display and reading voice, with Georgia/serif fallback. Its upright face is preloaded; italic loads only where used. IBM Plex Mono carries compact tool labels, dates and diagrams, and loads on use. Next.js self-hosts the font files, so browsers make no Google font requests.

The greeting uses a responsive, sentence-case 600 weight. Section headings are 1.875rem; project titles are 1.3rem. Full page and article headings use their own clamps. Prose stays in the same reading voice, with a more generous introductory lede. Route titles are restrained at 1.75rem, rather than poster-size branding.

At 740px and below, the greeting uses `clamp(2rem, 9vw, 2.5rem)`, biography text becomes 1rem, and the lede becomes 1.125rem. The archive retains visible titles, summaries, dates and reading times. Avoid uppercase transformations in the ordinary portfolio.

**The Personal Voice Rule.** Keep the greeting, reading typography, mountain identity and outdoor details ahead of a polished studio identity.

## Layout

The shell is centered at `min(100% - 4rem, 64rem)`; phone gutters are 1.25rem per side. The introduction begins directly below the header. The large hero ridge is removed so the landscape does not compete with the biography and technical diagrams. The forest invitation appears only in the footer.

The introduction pairs the full factual biography (1.4fr) with a quiet project workbench (1fr), separated by 3.5rem. Projects use open ruled rows with copy and a compact diagram (1.5fr/1fr), separated by 4rem. At 1000px gaps tighten; at 740px these compositions stack. Header navigation and Ask share a full-width row on phone.

Writing uses a 56rem index, with article and résumé reading bounded at 45rem. Archive rows use date/copy/arrow columns (5.5rem/1fr/1rem), moving dates above the copy on phone. Keep source order and all published information intact.

The header and footer stay in document flow. Print hides navigation, footer and interaction surfaces, releases résumé width constraints and uses a 13px base.

**The Quiet Work Rule.** Present factual work, source and reasoning in open readable layouts. Avoid marketing questions and oversized color exhibits.

## Elevation & Depth

The reading canvas and project stories are flat. Thin rules and spacing separate content. The workbench uses a thin border and 0.5rem corners without a shadow. Shadow is reserved for the open Ask overlay, its scroll control and the keyboard skip link. The sidecar retains the actual library shadow values.

## Shapes

The original mountain mark is circular. The workbench and form controls use restrained corners. Route stops and diagram nodes express selection and relationships; they are not decorative card motifs. The original owl silhouette is rendered as compact SVG geometry adapted directly from the game’s canvas texture.

## Components

### Mountain identity

Use the original mountain mark at logo scale. Do not add a separate landscape banner above the biography. Existing share images retain their warm palette, Literata and ridge geometry.

### Forest detour

The owl link visibly invites a wrong turn and explicitly labels its 404 forest destination for assistive technology. The detour appears only in the footer, with a smaller 24px owl. Its finite 800ms hover/focus blink stops under reduced motion. The intentionally missing route serves the existing forest game; no new gameplay route or engine is invented. Link prefetch is disabled, keeping the Three.js bundle off the home page until navigation.

**The Real Detour Rule.** Playful details should lead to actual behavior. The owl opens the retained 404 forest; it never prefetches the game on the home page.

### On my workbench

The retained route explorer describes three public projects using native selector and stage buttons. Direct stage changes, repeated exploration and reset remain reversible. Notes come from the public project stories, and a live region announces the selected note. The three stage buttons sit in equal grid columns on one straight rail. SVG endpoints and button dot centers share the same horizontal fractions (1/6, 1/2, 5/6) and 12px vertical center. The 650ms trace transition updates immediately for reduced motion. Stage buttons are at least 64px high; other controls retain 44px targets. This is a conceptual map, without live telemetry claims.

### Project stories

Titles, descriptions, source and story links remain factual. The rows are open and ruled, with small workflow diagrams in mono type. The grocery flow, shared canvas and plugin branches retain their real relationships without marketing-style questions. All diagrams are compact and left-aligned; text, nodes and connecting lines share SVG coordinates so they cannot drift independently. The plugin diagram uses a clear parent/children tree.

### Writing archive

Dates, reading times, titles and full summaries remain visible. Hover underlines the title; keyboard focus outlines the whole row. Mobile moves metadata above the copy rather than compressing the desktop grid.

### Ask

The header action is a 44px pill. The transcript remains dynamically imported on opening; conversation state survives navigation. The desktop panel is 26rem wide; below Tailwind’s 40rem threshold it fills the phone viewport. Close is available inside the panel at every breakpoint, and close/Escape restore focus after the closed state commits.

The question group supplies its border, radius and visible focus ring. An empty-question state disables only the submit button; the editable field retains full opacity and contrast. No chat or provider behavior is changed by this design correction.

### Navigation and metadata

Sentence-case serif navigation uses a thin current-page underline and 44px link targets. Date badges retain the adaptive secondary palette. The footer returns to “Thanks for stopping by” and provides the existing GitHub, LinkedIn and RSS links alongside the real forest detour.

## Do’s and Don’ts

- Preserve factual biography, published writing, project links and game correctness.
- Keep useful paths and native controls clear at narrow widths.
- Keep the heavy forest and Ask transcript lazy.
- Honor reduced motion and visible focus.
- Keep personal character ahead of studio-style branding.
- Add playful detail only when it has actual behavior or a meaningful destination.
- Never invent accomplishments, metrics, endorsements or product capabilities.

The sidecar records palette, type, motion and breakpoint metadata. Production-build browser checks are recorded separately in docs/portfolio-restoration-qa.md.
