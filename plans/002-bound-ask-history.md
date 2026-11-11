# Plan 002: Ask rejects oversized conversation histories before calling the model

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report. When done, update this plan's row in
> `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 85f7e93..HEAD -- "src/app/(chat)/api/chat/schema.ts" src/lib/constants.ts "test/app/(chat)/api/chat/route.test.ts"`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: MED — a cap that is too tight rejects real conversations that read several posts
- **Depends on**: none (independent of 001)
- **Category**: security
- **Planned at**: commit `85f7e93`, 2026-11-11

## Why this matters

`/api/chat` is public and stateless: the browser sends the whole history every
turn. User text is capped (1000 chars) but assistant messages are accepted as
`z.record(z.string(), z.unknown())` with no size bound, and their tool outputs
(including full `readPost` bodies) are converted into the model prompt. A single
crafted request can therefore push megabytes of text into FreeLLMAPI, burning
the shared free-provider quota that every visitor depends on, or forcing 413
"context too large" failover across every provider. Legitimate histories are
already large (each `readPost` echoes a whole post back), so the cap must be
measured, not guessed.

## Current state

- `src/app/(chat)/api/chat/schema.ts:35-39`:

  ```ts
  const assistantMessageSchema = z.object({
    id: z.string(),
    parts: z.array(z.record(z.string(), z.unknown())),
    role: z.enum(["assistant"]),
  });
  ```

- `src/lib/constants.ts:11` — `export const CHAT_LIMITS = { messages: 24, questionChars: 1000 } as const;`
  (shared with the client, so keep it free of server imports).
- `src/app/(chat)/api/chat/handler.ts:63-67` — schema failures return
  `ChatbotError("bad_request:chat", issue.message)`, which the popup shows verbatim.
- `docs/untangle-decisions.md` records "assistant/user schema differences
  protect public boundaries. Keep them." — tighten, don't merge them.

## Commands you will need

| Purpose   | Command                                                                | Expected |
| --------- | ---------------------------------------------------------------------- | -------- |
| Typecheck | `pnpm typecheck`                                                       | exit 0   |
| Tests     | `pnpm exec vitest run --project node --maxWorkers=1 "test/app/(chat)"` | all pass |
| Lint      | `pnpm lint && pnpm fmt:check`                                          | exit 0   |

## Scope

**In scope**: `schema.ts`, `src/lib/constants.ts`, `route.test.ts`.
**Out of scope**: re-executing tool calls server-side; client components;
`safeValidateUIMessages` usage in `handler.ts`.

## Steps

1. Measure: sum `JSON.stringify(...)` of every post's `readPost` output
   (`getAllPosts()` bodies). Record the largest and the total in this plan.
   **Verify**: a number is written down.
2. Add `CHAT_LIMITS.historyChars` ≥ 2× the size of the five largest posts
   (the agent reads at most 4 posts per turn before its forced answer step).
   STOP if that exceeds ~1,000,000 chars — report instead.
3. Add a `.refine` on the `messages` array that sums `JSON.stringify(message.parts).length`
   for assistant messages and fails with "This conversation is too long. Start a
   new one to keep asking." **Verify**: typecheck exit 0.
4. Tests: a history just under the cap is accepted (200), one over it returns
   400 `bad_request:chat` and `model.doStreamCalls` is empty.

## Done criteria

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm fmt:check` exit 0
- [ ] new tests pass; existing route tests unchanged
- [ ] the measured sizes are recorded in step 1

## STOP conditions

- Measured legitimate history size makes any cap meaningless (> 1 MB).
- The popup needs a new UI state for this error (it should reuse the existing alert).

## Maintenance notes

When posts get much longer, re-measure. A later improvement is to drop prior
`readPost` bodies from history server-side (the model can re-read), which would
let the cap shrink a lot.
