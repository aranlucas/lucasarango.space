# Plan 003 (spike): Ask's listPosts searches posts the way WebMCP's list_posts does

> **Executor instructions**: This is a design/spike plan. Prototype, measure,
> and report; ship only if the done criteria hold. Update this plan's row in
> `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 85f7e93..HEAD -- src/lib/ai/tools src/lib/post-search.ts src/lib/site-agent-inputs.ts src/lib/ai/prompts.ts`

## Status

- **Priority**: P3
- **Effort**: S–M (coarse)
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `85f7e93`, 2026-11-11

## Why this matters

The same content has two agent surfaces with different capabilities. Browser
agents call WebMCP `list_posts` with `query`/`sort`/`limit`
(`src/lib/site-agent-inputs.ts:3-22`, served by `/blog/sitemap.md` through
`searchPosts` in `src/lib/post-search.ts:62`). The server Ask agent's
`listPosts` (`src/lib/ai/tools/list-posts.ts:10-22`) takes `z.object({})` and
returns every post, so the model must pick posts from titles and summaries alone
and spends a step reading the whole catalog. ROADMAP.md item 2 asks to "share
source identifiers with the existing tools instead of duplicating content in
another retrieval store" — reusing `searchPosts` does exactly that.

## Current state

- `src/lib/ai/tools/list-posts.ts` — no input, returns all posts.
- `src/lib/post-search.ts:62` — `searchPosts(posts: Post[], options: ListPostsArgs = {})`.
- `src/lib/site-agent-inputs.ts` — `ListPostsInput` zod schema shared with WebMCP.
- `src/lib/ai/prompts.ts:21` — tells the model "call listPosts, then readPost".
- `test/lib/post-search.test.ts` — search behavior tests to reuse as pattern.

## Steps

1. Change `listPosts.inputSchema` to `ListPostsInput` and execute through
   `searchPosts(getAllPosts(), input)`; keep the existing output fields.
2. History compatibility: earlier tool parts with input `{}` must still validate
   (`safeValidateUIMessages` in `handler.ts`) — all fields are optional, verify.
3. Update the prompt line to mention an optional `query`.
4. Tests in `test/lib/ai/`: a query returns the matching post first; `{}` still
   lists newest first.

## Done criteria

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` exit 0
- [ ] the existing route test "accepts a follow-up after a tool call was stopped" passes unchanged

## STOP conditions

- Search results differ from `/blog/sitemap.md?query=` for the same input.

## Maintenance notes

Keep one search implementation; never add a separate index for Ask.
