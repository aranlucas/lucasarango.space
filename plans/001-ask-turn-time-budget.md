# Plan 001: Every Ask answer ends with a visible result before the function limit

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 85f7e93..HEAD -- src/lib/ai/agent.ts "src/app/(chat)/api/chat/handler.ts" "src/app/(chat)/api/chat/route.ts" src/lib/errors.ts "test/app/(chat)/api/chat/"`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `85f7e93`, 2026-11-11

## Why this matters

The Ask route runs on Vercel with `maxDuration = 60`, but the agent sets no
time budget and keeps the AI SDK default of two retries per model call. The
repo's own research (`docs/research/freellmapi-ai-sdk-retries-2026-10-12.md`)
shows one turn can run far past 60 s: up to 5 steps × (SDK retries with backoff
or a `Retry-After` of up to 59.9 s) on top of FreeLLMAPI's own 45 s+ failover.
When Vercel kills the function, the reader's stream is cut off with no error and
no "Try again". Simply adding the SDK's `timeout` is not enough: an SDK timeout
reaches the browser as an `abort` chunk — the same chunk the reader's own Stop
produces — so the popup shows an empty or partial answer and no alert (verified
with a mock model at 85f7e93: the body was `start`, then
`{"type":"abort","reason":"TimeoutError: …"}`, then `[DONE]`). After this plan,
a slow or stalled provider ends the turn inside the function's lifetime and the
reader sees "The assistant took too long to answer. Try again".

## Current state

- `src/lib/ai/agent.ts` — builds the `ToolLoopAgent`; no `timeout`, no `maxRetries`:

  ```ts
  // src/lib/ai/agent.ts:22-32
  export function createAskAgent({ model, tools, loadInstructions }: CreateAskAgentProps) {
    return new ToolLoopAgent({
      model,
      tools,
      stopWhen: isStepCount(MAX_STEPS),
      prepareStep: ({ stepNumber }) =>
        stepNumber === MAX_STEPS - 1 ? { toolChoice: "none" } : undefined,
      prepareCall: async (settings) => ({ ...settings, instructions: await loadInstructions() }),
    });
  }
  ```

- `src/app/(chat)/api/chat/route.ts:9` — `export const maxDuration = 60;`
- `src/app/(chat)/api/chat/handler.ts:47-54` — merges the agent stream into the
  UI stream without inspecting chunks:

  ```ts
  writer.merge(toUIMessageStream({ stream: result.stream, sendReasoning: true, onError }));
  ```

- `src/lib/errors.ts:12-16` — reader-facing error catalog (`ChatbotError`);
  add new codes here rather than inline strings.
- `src/components/chat/messages.tsx:114-125` — the popup renders an alert with
  "Try again" only when `useChat`'s `error` is set, i.e. when the stream carries
  an `error` chunk. An `abort` chunk leaves `error` undefined.
- Installed SDK (`ai@7.0.148`): `ToolLoopAgentSettings` accepts `timeout`
  (`TimeoutConfiguration`: `totalMs`, `chunkMs`, …) and `maxRetries`;
  `totalMs` is implemented with `AbortSignal.timeout`, so Vitest fake timers do
  not advance it — tests must inject a short budget.
- Tests: `test/app/(chat)/api/chat/route.test.ts` runs the real handler + agent
  on `MockLanguageModelV4`. Match its style (`serve()`, `request()`, top-level
  `it`).

## Commands you will need

| Purpose   | Command                                                                            | Expected on success |
| --------- | ---------------------------------------------------------------------------------- | ------------------- |
| Install   | `pnpm install --frozen-lockfile`                                                   | exit 0              |
| Typecheck | `pnpm typecheck`                                                                   | exit 0              |
| Lint      | `pnpm lint && pnpm fmt:check`                                                      | exit 0              |
| Tests     | `pnpm exec vitest run --project node --maxWorkers=1 "test/app/(chat)" test/lib/ai` | all pass            |
| All tests | `pnpm test -- --maxWorkers=1`                                                      | all pass            |
| Build     | `NODE_OPTIONS=--max-old-space-size=1200 pnpm build`                                | exit 0              |

## Scope

**In scope**: `src/lib/ai/agent.ts`, `src/app/(chat)/api/chat/handler.ts`,
`src/lib/errors.ts`, `test/app/(chat)/api/chat/route.test.ts`,
`test/app/(chat)/api/chat/route-config.test.ts`.

**Out of scope**: `streamRetries` (research doc: retries after visible text
duplicate output); FreeLLMAPI proxy settings; the client components; the
docs/research file (historical record) except its sentence saying `agent.ts`
sets no retry or timeout options, which this change makes false.

## Steps

### Step 1: Give the agent a turn budget and one retry

In `agent.ts` export `ASK_TURN_TIMEOUT = { totalMs: 50_000, chunkMs: 20_000 }`
with a comment tying it to the route's `maxDuration` and the research doc; pass
`timeout` (overridable through an optional `timeout` prop for tests) and
`maxRetries: 1` to `ToolLoopAgent`. Leave out `firstChunkMs` and `stepMs`
(research doc explains why).

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Report a budget abort as an error

In `handler.ts`, pipe the UI stream through a `TransformStream` that replaces
an `abort` chunk with `{ type: "error", errorText: new ChatbotError("timeout:chat").message }`
**only when `req.signal` is not aborted** (the reader's Stop must stay a stop).
Log the reason with the existing `x-vercel-id` context. Add
`"timeout:chat": { status: 504, message: "The assistant took too long to answer." }`
to `errors.ts`.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Tests

See Test plan. **Verify**: focused test command → all pass.

## Test plan

In `route.test.ts` (pattern: existing `serve()` + `request()`):

1. A model that never responds until aborted, agent with `timeout: { totalMs: 50 }`
   → stream has an `error` chunk with "took too long", no `abort` chunk.
2. Same stalled model but the reader aborts the request → stream ends with
   `abort`, no `error` chunk (Stop is not reported as a failure).
3. Text already sent then a stall with `chunkMs` → the text deltas arrive and
   then the error chunk.

In `route-config.test.ts`: `ASK_TURN_TIMEOUT.totalMs` is below `maxDuration * 1000`
with at least 5 s left for sending the error (protects the contract between the
two constants).

## Done criteria

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm fmt:check` exit 0
- [ ] `pnpm test` exits 0 with the 4 new tests
- [ ] `pnpm build` exits 0
- [ ] `grep -n "maxRetries: 1" src/lib/ai/agent.ts` matches

## STOP conditions

- The SDK emits something other than an `abort` chunk on timeout (e.g. an `error`
  chunk already) — then Step 2 is unnecessary; report instead.
- `ToolLoopAgent` rejects `timeout` in its settings for the installed version.

## Maintenance notes

- If `maxDuration` changes, the contract test forces `ASK_TURN_TIMEOUT` to follow.
- If the popup ever distinguishes Stop from failure on its own, revisit Step 2.
- Deferred: tuning the self-hosted FreeLLMAPI budget (needs the proxy's config).
