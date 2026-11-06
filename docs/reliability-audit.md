# Correctness and reliability audit — 2026-11-06

Baseline: remote main `f5fe3edc3c7524bd355f57f3ffc42ce357c64cc9`, after #65. Clean isolated worktree. No structural cleanup. All execution of tests and builds is CI-only.

## Inventory and trust boundaries

- Public portfolio, résumé, writing archive, article HTML/Markdown, RSS, sitemap and llms.txt. Local Markdown is trusted editorial input; frontmatter is validated with Zod, drafts excluded outside development, slug validation prevents filesystem traversal. Search serializes an index rather than full bodies.
- Résumé JSON/Markdown comes from a configured public service, cached with Next cache tags. JSON is schema checked and failed responses throw. Revalidation intentionally refreshes public information without authentication (documented contract). No accounts, tenants, database writes or transactions exist.
- Ask accepts bounded text histories, validates SDK message/tool schemas, reads curated content and streams model responses. Provider credentials stay server-side. Request abort signals propagate to the model; stream failures produce generic public errors and server logs. Client uses SDK transport/state, retry and Stop, with one persistent conversation and queued question IDs.
- WebMCP tools are read-only same-origin fetches with abort propagation and explicit HTTP errors. Article citations use a curated URL allowlist; Markdown rendering uses the existing unified pipeline.
- 404 forest game owns mutable per-frame state, keyboard/pointer controls and optional local best-score storage. Effects remove listeners; animation pauses for hidden/offscreen content. Storage exceptions are tolerated.
- CI retains lint/format, typecheck, production build, unit/component tests and native Chrome WebMCP/loading tests. No local test/build commands are permitted for this audit.

## Confirmed finding (before source edits)

**R1 — held movement survives release inside Ask (medium impact, high confidence).** In `src/components/lost/hooks.ts`, `useMovementKeys` ignores both keydown and keyup when the target is an editable field. Trigger: hold W during a game, focus the persistent Ask textarea, then release W. Actual: the held set still contains KeyW and movement continues until blur/another release/round end. Expected: releasing a movement key always clears that key, while typing must never begin movement. Regression: dispatch keydown to the window and keyup to a focused textarea; assert the controls return to zero. Also protect typing-only input and blur/unmount cleanup. No visual layout changes are needed.

## Reconciled / rejected hypotheses

- Unauthenticated revalidation is explicit intended behavior for public cache invalidation, not an account-isolation defect.
- Slug traversal and arbitrary citation links already have validation and tests; no speculative parser rewrite.
- Provider availability and résumé dependency failures are real external risks, but no evidence justifies changing their public contracts or introducing fallbacks containing invented facts.
- No persistent user conversations or mutation endpoints exist; database transactions, tenant isolation and mutation idempotency are inapplicable.
- Game simulation, collision, spawn/spot timing, stream cancellation, draft visibility, search and route validation already have meaningful regression coverage. Preserve it.

## Requested e2e framework

Published npm metadata verifies `e2e@0.23.0` (tester-army/e2e) and `@e2e-dev/web@0.15.5`, Node `^22.22.3 || >=24.8.0`; repo CI Node 24.22.1 is compatible. Their published scripts have no install lifecycle hooks; install uses `--ignore-scripts`. Upstream README explicitly supports locator/action/assertion tests without agent steps or model credentials. Read published bundled docs before authoring config. Add a deterministic archive → search → article → archive recovery journey using this real runner, retaining existing Playwright coverage. No model calls or production credentials.

## Validation and review

Pending CI execution and independent review. A CI pre-fix job will restore the baseline hooks file and require the focused regression to fail, then run the fixed suite in the normal CI job. Failure artifacts will be uploaded. No tests or builds have run locally.

Independent static review confirmed R1 and found no additional concrete runtime defects across content routes, citations, streaming, cache invalidation and game lifecycle. Review objections addressed: corrected the journey's nonexistent article selector to the rendered main landmark; CI serves representative résumé JSON/Markdown with Python's native HTTP server and passes its URL to build/runtime; existing Chrome suite now records the game → Ask focus/release interaction for review. The hook regression establishes stopped movement; the video demonstrates the interaction, not an independent proof of camera position. No custom server script or provider credentials added.

Sources read: published `e2e/docs/{quickstart,ci,ci/github-actions,web}.mdx`, installed `skills/e2e/SKILL.md` and setup/writing-tests references; installed Next `use-client.md`. Upstream: https://github.com/tester-army/e2e. The user’s CI-only policy overrides upstream interactive initialization and local execution instructions.
