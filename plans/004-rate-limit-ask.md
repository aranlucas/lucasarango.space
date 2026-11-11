# Plan 004 (investigate): Rate-limit /api/chat per client at the edge

> **Executor instructions**: Investigation plan. Do not change application code
> unless step 3 says so. Report findings and update this plan's row in
> `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 85f7e93..HEAD -- "src/app/(chat)/api/chat" next.config.ts`

## Status

- **Priority**: P3
- **Effort**: S (config) / M (code)
- **Risk**: MED — a wrong limit blocks real visitors
- **Depends on**: 002 (bounding request size first makes a per-request limit meaningful)
- **Category**: security
- **Planned at**: commit `85f7e93`, 2026-11-11

## Why this matters

`/api/chat` is unauthenticated and every request spends the shared FreeLLMAPI
pool (`src/lib/ai/providers.ts`). `CHAT_LIMITS` (`src/lib/constants.ts:11`) caps
one request, not the number of requests per client. The repo has no store
(no KV/DB), so an application-level limiter would add infrastructure; the
hosting platform's firewall can do this without code.

## Steps

1. Confirm the deployment target is Vercel (`@vercel/analytics` is a dependency;
   the handler logs `x-vercel-id`). STOP if not.
2. Draft a Vercel Firewall rate-limit rule for `POST /api/chat` (e.g. 20
   requests / 10 minutes per IP) and document it in README's "Ask and résumé
   configuration" section. Do not apply it — the maintainer applies firewall
   rules.
3. Only if the maintainer rejects the firewall: propose a code limiter design
   (store, key, limits) as a follow-up plan. Do not implement.

## Done criteria

- [ ] README documents the rule; no source files changed

## STOP conditions

- Deployment is not Vercel, or the account's plan lacks rate-limit rules.
