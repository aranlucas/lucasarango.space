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

Pending the existing deployment preview. No browser or accessibility result from the earlier local-only implementation is reused as evidence for this source.
