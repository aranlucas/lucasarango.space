# Untangle decision log — 2026-11-06

## Baseline and scope

Clean checkout at bab8568. Preserve the documentation decisions in #63 and test cleanup in #64. Reviewed source, test contracts, routes, configuration, CI, design/product documents, and editorial material. Editorial research and drafts are content, not implementation clutter. Both optional comment and test reviews are selected. Tests/builds run only in CI; no baseline local test claim is made. Existing CI runs lint, formatting, types, production build, Vitest node/jsdom tests, and Chrome E2E.

## Inventory and redesign (recorded before implementation)

- Make post identity a shared content contract in `lib/site.ts`.
  - `read-post.ts` depends on sibling tool `list-posts.ts` for URL/link helpers.
  - Browser tools and server tools independently interpret post URLs, with different slug regular expressions. Share parsing while keeping each tool's input/error vocabulary.
  - Citation sources in the site shell independently construct the same canonical URL.
- Keep renderer-independent game contracts in `game-types.ts`.
  - Keyboard hooks, overlays and the game shell import Controls/Hud from `scene/director.tsx`.
- Make game rendering depend on simulation/world data.
  - Owl perch radius/base in `world.ts` silently duplicate the middle cone in `scene/forest.tsx`. Share base, radius and height; preserve existing dimensions.
  - Point textures hardcode 1/2/5 separately from the scoring catalog. Derive unique label values from CRITTERS.
  - `serif()` names the old design despite reading the current page font. Rename without changing its fallback.
- Share receipt peak geometry between the DOM and OG renderers.
  - Mountain, snow, foreground and fir paths are copied into `og-card.tsx`. Retain separate renderers because OG needs an image and explicit colors, but share paths.
- Remove comments that only describe their adjacent implementation. Keep external constraints, units, coordinate conventions, interoperability and compiler/lifetime rationale.
- Review tests last. No justified deletion identified: heading semantics, deterministic forest replay, citation restrictions, weighted search and streaming boundaries can all catch real regressions. Preserve them. Add a URL-form regression at the server tool boundary: the listed canonical URL, its Markdown variant and query/hash forms must read the same post; traversal/invalid paths must remain rejected.

## Special cases retained deliberately

- Owl-to-deer fallback and bounded spawn attempts are game rules for sparse forests, not orchestration workarounds.
- Storage/WebGL/clipboard failures have usable UI fallbacks; SDK send/stop failures are surfaced through SDK state.
- Ten-second WebMCP polling matches late browser-extension injection; dynamic chat/game imports protect initial loading. Keep these boundaries.
- Reasoning-label hold and copy confirmation timers support readability; keep timing unchanged.
- Screenshot-specific dimensions are content metadata. Cache tags, runtime file tracing, Markdown rewrites/Vary, and origin-trial handling encode deployment/HTTP constraints.
- Explicit citation allowlists and assistant/user schema differences protect public boundaries. Keep them.
- JSON Resume adaptation reflects the external schema; separate HTML and Markdown rendering preserves their distinct semantics.

## Review and validation

Initial independent whole-repository review confirmed the items above and found no justified test deletion. No local tests, benchmarks, browser checks or builds are permitted. PR CI is the behavioral validation authority. Follow-up review and CI results will be recorded here.

Final review found two more simulation/rendering links: the critter pool duplicated the simulation's five-critter cap, and the instructions repeated scoring values. Both now derive from simulation data; instruction grouping retains the existing visible wording. Canonical feed/sitemap links use the shared helper. Bare `<slug>.md` inputs remain supported, preserving the server tool's accepted forms. Removed a moved type's unused import. Baseline GitHub CI for bab8568 was successful. All prior tests remain; no test was removed or weakened. Geometry values and rendered paths are unchanged, so no visual redesign/evidence assets are needed.

Closure review: independent reviewer found no further worthwhile issues after the follow-up fixes. Reviewed React boundary changes against the React best-practices skill and installed Next.js 16.4.2 lazy-loading, client directive, Vitest and sitemap guides. Local work was limited to dependency setup (scripts disabled), reading/static review, formatting and whitespace checks. CI results remain pending on publication.

PR CI round 1 (run 42258438771) compiled the application but found introduced test-fixture lint/type errors before behavioral tests ran: awaited loops and missing AI SDK 7 tool execution context. Corrected the fixture with independent Promise.all cases and an explicit empty context, preserving all assertions. No local test/build reproduction; PR CI will rerun the full validation.
