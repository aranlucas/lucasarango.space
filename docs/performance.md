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

## Decisions to preserve

Articles render complete HTML without a loading boundary to avoid a skeleton-to-content layout shift. `partialPrefetching: false` retains standard static prefetch. **Upgrade note:** the Next 16.4.2 documentation inspected for this measurement says this opt-out will disappear in the next major version; retain the [no-JavaScript article test](../test/e2e/loading.e2e.ts) when migrating.

WebMCP validation loads only in capable browsers, while the loader retains a ten-second extension-injection window. Chat-only CSS stays deferred, with shared theme tokens available to it. [Loading tests](../test/e2e/loading.e2e.ts) guard the JavaScript budget, readable articles, and streamed Markdown typography. These protect the deferred-loading decisions against accidental eager imports or missing styles.

[Font provenance](../src/app/fonts/README.md) records the OFL license, hashes, metric tradeoffs, and native FontTools reproduction commands. Application builds need no font-processing script.

## Method and limits

Lighthouse 13.6.0, Chromium 155, Next 16.4.2, local `next start` on port 3015. Default simulated mobile profile: 412×823, DPR 1.75, 150 ms RTT, 1,638.4 Kbps throughput, 4× CPU slowdown. Timing runs were sequential, with no concurrent builds or tests. A server interruption invalidated intermediate runs; they were rerun rather than counted.

| Route   | Before largest-paint range | After largest-paint range |
| ------- | -------------------------- | ------------------------- |
| Home    | 0.92–0.93 s                | 0.91–1.91 s               |
| Writing | 0.92–0.97 s                | 0.92–2.21 s               |
| Résumé  | 0.91–0.92 s                | 0.92–0.92 s               |
| Article | 3.44–3.49 s                | 0.92–0.93 s               |

Small changes on home/writing/résumé are within observed variation; CPU performance did not improve in every sample. The article paint/layout-shift improvement and exact resource reductions are the strongest results. Raw reports retain the outliers. TBT is a lab measure, not field INP. These tests do not establish production CDN/geographic TTFB, deployed analytics overhead, or AI-provider response latency.

## Reproduce

Use the native CLI, repeating three times with distinct output paths for each route:

```bash
pnpm build
pnpm start --hostname 127.0.0.1 --port 3015
# In another terminal:
CHROME_PATH=/usr/bin/chromium pnpm dlx lighthouse@13.6.0 http://127.0.0.1:3015/ --chrome-flags='--headless --no-sandbox' --only-categories=performance --output=json --output-path=/tmp/performance-home-1.json --quiet
```

Compare medians and retained raw samples, not the best run. See [Lighthouse's measurement-variability guidance](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring). The original raw reports and screenshots are not stored in this repository.
