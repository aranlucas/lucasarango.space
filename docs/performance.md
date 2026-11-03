# Loading performance — 2026-11-02

Baseline: commit `5181845`. Five measured passes reduced downloads and eliminated the article's skeleton-to-content layout shift. These are local production-build results, not measurements of a deployed change.

## Before and after

Medians of three independent cold mobile Lighthouse runs per route. KB means 1,000 bytes.

| Route   | Largest paint before → after | Blocking time before → after | Layout shift before → after | Performance score |
| ------- | ---------------------------- | ---------------------------- | --------------------------- | ----------------- |
| Home    | 0.92 → 0.91 s                | 117 → 89 ms                  | 0 → 0                       | 99 → 99           |
| Writing | 0.93 → 0.92 s                | 135 → 152 ms                 | 0 → 0                       | 99 → 98           |
| Résumé  | 0.92 → 0.92 s                | 173 → 96 ms                  | 0 → 0                       | 98 → 99           |
| Article | 3.45 → 0.92 s                | 271 → 140 ms                 | 0.315 → 0                   | 70 → 99           |

The article is `/blog/practicing-system-design-with-an-ai-on-the-whiteboard`.

| Compressed resource                           | Before   | After    | Reduction |
| --------------------------------------------- | -------- | -------- | --------- |
| Page JavaScript, including automatic prefetch | 204.0 KB | 164.5 KB | 19.4%     |
| Initial fonts                                 | 50.4 KB  | 41.7 KB  | 17.2%     |
| Initial CSS                                   | 17.7 KB  | 15.3 KB  | 13.9%     |
| Writing-page HTML                             | 33.1 KB  | 23.4 KB  | 29.3%     |

Resource sizes are response-body bytes recorded in fresh Chromium contexts at 390×844 after two seconds, separately from Lighthouse. The 404's JavaScript also falls from 452.2 to 412.6 KB, retaining the game. Fonts transfer zero bytes on measured warm reloads. The below-fold article screenshot no longer downloads during initial loading.

## Iterations

1. Gate WebMCP on browser support and precompute the writing search index. This exposed another validation dependency arriving through prefetch.
2. Separate chat transport from date formatting to remove that dependency. Try CSS splitting; reject the first approach after detecting missing shared theme variables.
3. Render static articles directly instead of swapping a skeleton. Add dimensions, responsive sources, and lazy loading to known local screenshots.
4. Optimize Martian Mono's unused font axis and weights, retaining full character coverage. Check the font with the original shared stylesheet.
5. Extract shared theme definitions and correctly defer chat-only CSS. Restrict Tailwind's automatic scanning to application source.

The final CSS split is pixel-identical to the preceding pass on all four content routes. A production browser test streams a Markdown answer and checks its computed typography, guarding against the rejected experiment's missing theme values.

## Fonts

Martian Mono shrinks from **38,392 to 29,720 bytes (22.6%)**. The site always used width 87; the new file pins that axis and limits variable weights to the used range, 400–700. It retains the full upstream character set, including every character in the previous Google subsets. Pixelify Sans remains unchanged.

Preload, swap behavior, and the original fallback metrics remain intact. Page dimensions and line wrapping are unchanged in the four mobile captures. Font instancing introduces small outline-rounding differences on some glyphs; the home capture is pixel-identical. The article's screenshot also changes slightly because it now uses Next's responsive image optimization.

The font asset, OFL license, source hashes, and exact native FontTools commands are in [the font README](../src/app/fonts/README.md). Application builds need no font-processing script.

## Implementation and regression coverage

- WebMCP schemas and validation load only in capable browsers, retaining the ten-second extension-injection detection window and timer cleanup.
- Date formatting no longer imports chat error validation, so writing-page prefetch cannot bring that deferred dependency back.
- Writing search sends metadata and normalized token weights rather than full Markdown. Body matching, ranking, sorting, and empty results are tested. Gzipped search data alone falls from 23,957 to 14,088 bytes.
- Articles deliver complete HTML without a loading boundary. `partialPrefetching: false` retains standard static prefetch. **Upgrade note:** the installed Next documentation says this opt-out will disappear in the next major version; retain the no-JavaScript article test when migrating.
- The existing Markdown pipeline uses Next's `getImageProps` for the two known local screenshots. Other image URLs retain their behavior.
- Shared theme tokens allow the lazy chat stylesheet to generate its own required variables without importing the global reset or its scan sources.

Validation: production build, TypeScript, lint, formatting, **133 unit/component tests**, and **13 production browser tests** passed. Browser coverage includes native WebMCP, search, chat, lazy Markdown styling, an initial-JS budget, readable articles with JavaScript disabled, image dimensions, and normal 404 behavior. Delayed WebMCP injection is covered by unit tests.

## Method and limits

Lighthouse 13.6.0, Chromium 155, Next 16.4.2, local `next start` on port 3015. Default simulated mobile profile: 412×823, DPR 1.75, 150 ms RTT, 1,638.4 Kbps throughput, 4× CPU slowdown. Timing runs were sequential, with no concurrent builds or tests. A server interruption invalidated intermediate runs; they were rerun rather than counted.

| Route   | Before largest-paint range | After largest-paint range |
| ------- | -------------------------- | ------------------------- |
| Home    | 0.92–0.93 s                | 0.91–1.91 s               |
| Writing | 0.92–0.97 s                | 0.92–2.21 s               |
| Résumé  | 0.91–0.92 s                | 0.92–0.92 s               |
| Article | 3.44–3.49 s                | 0.92–0.93 s               |

Small changes on home/writing/résumé are within observed variation; CPU performance did not improve in every sample. The article paint/layout-shift improvement and exact resource reductions are the strongest results. Raw reports retain the outliers. TBT is a lab measure, not field INP. These tests do not establish production CDN/geographic TTFB, deployed analytics overhead, or AI-provider response latency. A separate 30-request warm local Markdown-search sample changed from 15.0 to 13.1 ms median; that is not a significant user-facing claim.

Stopped after five passes with no further clear, low-risk savings identified. Remaining costs include framework code, the two intentional fonts, page styling, and the game/chat when used. Removing features, changing typography, disabling useful prefetch, or inlining all CSS would introduce behavior or caching tradeoffs. This is not proof of an absolute performance ceiling; production field monitoring remains necessary.

## Reproduce

Use the native CLI, repeating three times with distinct output paths for each route:

```bash
pnpm build
pnpm start --hostname 127.0.0.1 --port 3015
# In another terminal:
CHROME_PATH=/usr/bin/chromium pnpm dlx lighthouse@13.6.0 http://127.0.0.1:3015/ --chrome-flags='--headless --no-sandbox' --only-categories=performance --output=json --output-path=/tmp/performance-home-1.json --quiet
```

Compare medians and retained raw samples, not the best run. See [Lighthouse's measurement-variability guidance](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring). Before/after screenshots and raw JSON are delivered as local evidence, not committed PR assets.
