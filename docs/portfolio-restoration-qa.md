# Cascades Notebook restoration QA

Cloud reconstruction from the approved desktop, phone and dark previews, the approved design specification and public source history. This is not a transfer of the unavailable local-only commit 3af2ac19.

## Source and automated verification

- Base: main 0ae0409e1a502c764bc9ab8efd89e8d537d1d822
- Production build passes with 32 generated pages
- TypeScript, strict lint, formatting, five test files and all 64 tests pass
- Published posts/frontmatter, project data/URLs, résumé API, metadata/canonical routes/RSS/sitemap/robots, chat endpoint/provider/transcript, and the 404 game remain unchanged
- PR16 expiration scoring guard and both regression tests remain intact
- The route explorer keeps all three choices, three selectable stages, next/reset, selection reset, polite live notes and matching story links
- Forest links use the existing not-found route and explicitly disable prefetch

## Browser verification

The repository’s existing deployment preview was inspected in the cloud browser. Desktop composition was visually compared with the approved references and accepted. Native route buttons support project changes, direct stages, next/reset and keyboard Enter. The Ask input receives focus on open; Escape and Close restore launcher focus. Writing, article, résumé, Back navigation and the forest destination render successfully. The browser’s non-WebGL fallback remains usable.

The initial preview exposed an overlay stacking issue: the header’s view-transition name creates a stacking context, so positioned page content could cover Ask. The header now has explicit positioning and stacking order; the final deployment overlay recheck and exact-head CI result are recorded in the pull request.

Browser zoom produced 472px and 393px CSS viewports with no horizontal overflow. Navigation, project selectors/stages and forest links measure 44px high. This verifies responsive layout, not native phone/touch emulation.

All eight principal light/dark foreground, muted-text, link and button token pairs exceed 5.2:1 contrast. Dark styling and reduced-motion rules were source-reviewed. This cloud browser does not expose supported dark/reduced-motion/device emulation or axe injection, and WebGL is unavailable; those runtime checks and interactive forest gameplay were not rerun here. Existing game and Ask implementations are byte-identical to main, and game expiration regression tests pass. No real AI requests were submitted. No earlier implementation’s browser or accessibility results are reused as evidence for this source.
