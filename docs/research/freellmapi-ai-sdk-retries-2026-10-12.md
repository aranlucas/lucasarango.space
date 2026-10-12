# FreeLLMAPI and AI SDK retries

Checked 2026-10-12. Sources: FreeLLMAPI upstream at [`986b211`](https://github.com/tashfeenahmed/freellmapi/tree/986b2118226f5c2d1a0348e14d151a7005c1924e) (the HEAD on 2026-10-12), plus the installed `ai@7.0.138`, `@ai-sdk/openai@4.0.92`, `@ai-sdk/provider-utils@5.0.59` and `@ai-sdk/provider@4.0.27`. Local paths are `node_modules/...:line`. `provider-utils` is only reachable through pnpm, at `node_modules/.pnpm/@ai-sdk+provider-utils@5.0.59_zod@4.6.7/node_modules/@ai-sdk/provider-utils/dist/index.js` (written `provider-utils:line` below). The self-hosted proxy may be running an older FreeLLMAPI release than this HEAD. Where something isn't verified, it says so.

## Summary and recommendation

FreeLLMAPI already does the failover: up to 20 attempts across providers and keys, with cooldowns, inside a 45 s wall-clock budget. Two things work against this site's setup:

1. It sends no response headers until the first visible content or a finished tool call. Waiting on providers, and any reasoning the model does first, looks like one silent wait to the AI SDK.
2. Its first two attempts are exempt from the budget. One stalled upstream can hold a request for minutes.

With the SDK defaults (`maxRetries: 2`, backoff 2 s then 4 s, or a `Retry-After` of up to 59.9 s) applied to each of up to 5 steps, one chat turn can run far past `maxDuration = 60`. When Vercel kills the function, the reader gets a cut-off stream instead of the route's friendly error.

**Recommendation** (in `createAskAgent`, `src/lib/ai/agent.ts`):

```ts
new ToolLoopAgent({
  // ...existing settings
  maxRetries: 1, // covers proxy-hop blips; FreeLLMAPI already fails over between providers
  timeout: { totalMs: 50_000, chunkMs: 20_000 }, // finish before Vercel's 60 s kill; catch mid-stream stalls
  // streamRetries: leave unset (off)
});
```

- **`maxRetries: 1`, not 2.** By the time FreeLLMAPI returns an error, it has usually tried every candidate it could. A second SDK retry mostly re-runs the same exhausted pool, and can sleep for up to 59.9 s on a 429 `Retry-After`. Keep one retry for failures FreeLLMAPI can't cover: the hop between Vercel and the proxy itself (ECONNRESET, a restart).
- **`totalMs: 50_000`.** This is the only setting that bounds the whole turn: every step, retry, backoff sleep and header wait. It aborts the retry backoff delay, and an aborted call is never retried. The 10 s margin covers request parsing, loading the instructions, and sending the final error. Unverified: whether the reader then sees an `error` part or an `abort` part. Test this.
- **`chunkMs: 20_000`.** FreeLLMAPI's own mid-stream stall watchdog defaults to 90 s, longer than this function lives. `chunkMs` aborts the run sooner. It does not retry.
- **Leave out `firstChunkMs`.** The SDK starts that timer only after response headers arrive, and FreeLLMAPI sends headers together with the first content, so it would never fire on the slow part.
- **Leave out `stepMs`.** A step timeout aborts the whole run, not just the step, so with `totalMs` set it adds nothing.
- **Leave `streamRetries` off.** FreeLLMAPI only sends a mid-stream error after visible text has reached the reader. A stream retry would add repeated or divergent text that can't be taken back. FreeLLMAPI also doesn't bench the model that failed mid-stream, so the retry could land on it again.
- **Optional, on the proxy (inference, not tested).** Lower `FALLBACK_TIME_BUDGET_MS` (e.g. 25 s) and `PROVIDER_STREAM_STALL_TIMEOUT_MS` (e.g. 30 s) on the self-hosted FreeLLMAPI, so its first two attempts can't use up the 60 s alone.

**Side finding: reasoning is dropped.** `@ai-sdk/openai`'s chat model ignores `reasoning_content`, so `sendReasoning: true` in `handler.ts` has nothing to send. Details in §3.

## 1. Which repository is FreeLLMAPI's upstream

[`tashfeenahmed/freellmapi`](https://github.com/tashfeenahmed/freellmapi) is the upstream: created 2026-04-21, 33,886 stars, 4,653 forks, pushed 2026-10-12, not a fork.

[`Ahmed-M-Abdelkader/freellmapi`](https://github.com/Ahmed-M-Abdelkader/freellmapi) is a re-uploaded snapshot: created 2026-05-19, 11 stars, 1 fork, last push 2026-05-24. GitHub doesn't mark it as a fork, but:

- Its [README CI badge](https://github.com/Ahmed-M-Abdelkader/freellmapi/blob/c8cc5a62c57f39390e58e45deb53f774c9123a24/README.md?plain=1#L9) and [clone instructions](https://github.com/Ahmed-M-Abdelkader/freellmapi/blob/c8cc5a62c57f39390e58e45deb53f774c9123a24/README.md?plain=1#L98) point to `tashfeenahmed/freellmapi`.
- Its oldest commit (2026-05-01, "migrateModelsV7 … (#15)") predates the repo's own creation and carries upstream PR numbers.

Checked with `gh api repos/<owner>/freellmapi`.

## 2. How FreeLLMAPI fails over (source)

All links below are pinned to commit `986b211`. Paths are under `server/src/`.

**Attempts and budget**

- `/v1/chat/completions` allows up to 20 attempts: [`proxy.ts#L472`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L472), passed in at [`#L2144`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2144).
- The shared loop is in [`lib/fallback-loop.ts#L1397`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/fallback-loop.ts#L1397).
- The wall-clock budget defaults to 45 s. It can be changed with the `fallback_time_budget_ms` setting or the `FALLBACK_TIME_BUDGET_MS` env var; 0 turns it off ([`#L158-L196`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/fallback-loop.ts#L158-L196)).
- The budget only stops attempt 2 and later ([`#L1441`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/fallback-loop.ts#L1441)). From attempt 2 on, a "hedge" timer aborts an attempt that is still waiting for its first byte when the budget runs out ([`#L1493`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/fallback-loop.ts#L1493)). Attempts 0 and 1 always run to completion.
- Successful TTFB history can widen the budget for slow endpoints, up to 3× ([`lib/ttfb-budget.ts`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/ttfb-budget.ts)).

**Per-attempt timeouts**

- The header timeout defaults to 15 s ([`providers/base.ts#L319-L350`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/providers/base.ts#L319-L350)). The OpenAI-compatible adapter, used by most platforms, raises it to 60 s ([`openai-compat.ts#L124`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/providers/openai-compat.ts#L124)). Some platforms go higher, e.g. NVIDIA at 180 s ([`providers/index.ts#L160`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/providers/index.ts#L160)).
- After headers arrive, the first read gets `max(chat timeout, stall timeout)` ([`base.ts#L415`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/providers/base.ts#L415)).
- Each later read gets the stall timeout, 90 s by default ([`lib/provider-timeout.ts#L55`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/provider-timeout.ts#L55)).
- So one stalled OpenAI-compatible upstream can hold an attempt for about 60 s + 90 s.

**What triggers failover**

- `isRetryableError` ([`lib/error-classify.ts#L6-L24`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/error-classify.ts#L6)) fails over on:
  - HTTP status 408, 409, 410, 422, 429 or any 5xx.
  - Error text mentioning: timeouts, ECONNRESET/ECONNREFUSED, "fetch failed", 404/not found, 413/context too large, 403 on a model the key's tier can't use, "api error 400", 402, and degraded providers.
- 401s rotate to another key ([`fallback-loop.ts#L1567`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/fallback-loop.ts#L1567)). Anything else is fatal and returns 502 `provider_error` ([`proxy.ts#L2927`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2927)).
- If the client disconnects, the chain stops and nothing is benched ([`fallback-loop.ts#L1517`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/fallback-loop.ts#L1517)). The AI SDK's `abortSignal` (here `req.signal`) therefore cancels the proxy's chain too.

**When every attempt fails** ([`exhaustedRetryError`, `fallback-loop.ts#L925-L1100`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/fallback-loop.ts#L925))

- The response is JSON: `{ error: { message, type, code?, retryAtMs? }, execution_id }`, rendered at [`proxy.ts#L2938-L2948`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2938).
- Status depends on why the attempts failed:

  | Why it failed                                       | Status |
  | --------------------------------------------------- | ------ |
  | Every attempt failed provider auth                  | 502    |
  | Every candidate's context was too small             | 413    |
  | Model not found everywhere                          | 404    |
  | Provider degraded, or circuit breaker tripped       | 503    |
  | Every provider called the request invalid           | 400    |
  | Every candidate rate-limited or on a known cooldown | 429    |
  | Anything mixed (5xx, timeouts)                      | 502    |

- `Retry-After` is set only when the body has `retryAtMs` (the 429 case): the seconds until the soonest cooldown ends ([`#L895`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/fallback-loop.ts#L895)).
- Every status above except 400, 404 and 413 counts as retryable for the AI SDK (see §3).

**Streaming: when failover can still happen**

Failover can happen until FreeLLMAPI commits the response by flushing headers. Headers are flushed only when the first non-empty text arrives, or at the end of the stream for turns that only call tools ([`flushHeaders`, `proxy.ts#L2270`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2270)). Before that point:

- Reasoning-only and role frames are held back ([`#L2398-L2413`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2398)).
- Tool-call deltas are buffered ([`#L2376`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2376)).
- In-band error frames, empty completions, a truncated end of stream (no `[DONE]` and no `finish_reason`, [`base.ts#L515`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/providers/base.ts#L515)) and unparseable tool-call text all fail over invisibly ([`#L2332`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2332), [`#L2512`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2512), [`#L2681`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2681)).

**After headers are committed, there is no failover**

- If an upstream dies mid-stream, the client gets `data: {"error":{"message":"Provider error (<name>): stream interrupted","type":"stream_error"}}` followed by `data: [DONE]`. There is no status code and no `choices` field ([`#L2662-L2668`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2662)).
- An in-band error after the commit uses the same shape, with the provider's message ([`#L2333-L2335`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2333)).
- The attempt returns `'committed'`. It is logged, but the route is not benched.

**Headers**

- `X-Routed-Via: <platform>/<model>` on every response.
- `X-Fallback-Attempts` and `X-Fallback-Trail` when there were failed hops, plus an opt-in `X-Fallback-Detail` ([`fallback-loop.ts#L832-L853`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/fallback-loop.ts#L832); [REST docs](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/docs/en/api/01-rest-api.md#L284-L294)).
- `X-Request-ID` and `X-FreeLLM-Cache`.

**The `auto` model and sticky sessions**

- `auto`, `auto:<strategy or profile>`, or no model at all means the router chooses ([`proxy.ts#L48-L54`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L48); [`router.ts#L1377`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/services/router.ts#L1377)). Plain `auto` uses the active fallback chain.
- Sticky sessions keep a conversation on the model that last succeeded for it, for 30 min ([`#L171`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L171)). The session key is the `x-session-id` header, or else a SHA-1 of the first user message ([`#L257-L298`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L257)).
- The sticky model is consulted only once the conversation has an assistant turn ([`#L2055`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2055)), and recorded only on success ([`#L2637`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2637)).
- This site sends no `x-session-id`, so it gets the first-message hash.

**Tool calls and reasoning**

- Tool calls are supported: the README lists [tool calling across providers](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/README.md?plain=1#L149). In streams, though, tool calls are not streamed piece by piece. They arrive as one complete `tool_calls` chunk at the end, with arguments repaired against the schema and tool calls written as plain text converted, then `finish_reason: "tool_calls"` ([`#L2452-L2570`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L2452)).
- Reasoning is forwarded as `delta.reasoning_content`. `<think>` tags are converted into that field ([`lib/think-tags.ts`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/lib/think-tags.ts)), and `reasoning`/`reasoning_content` are both read ([`#L656`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/server/src/routes/proxy.ts#L656)). The reasoning is held back until the first answer text.

## 3. How the AI SDK reports these failures (installed source)

**(a) Non-2xx responses**

- `@ai-sdk/openai` chat streaming posts with `openaiFailedResponseHandler` (`node_modules/@ai-sdk/openai/dist/index.js:19-28`, `:1415-1421`). The result is an `APICallError`.
- Its `isRetryable` defaults to status 408, 409, 429 or ≥500 (`node_modules/.pnpm/@ai-sdk+provider@4.0.27/node_modules/@ai-sdk/provider/dist/index.js:70`).
- Fetch-level network errors (ECONNRESET, UND_ERR_*, etc.) also become retryable `APICallError`s (`provider-utils:547-580`).
- So FreeLLMAPI's 429/502/503 are retried; 400/404/413 are not.

**Retry loop**

- `retryWithExponentialBackoffRespectingRetryHeaders` defaults to `maxRetries = 2`, `initialDelayInMs = 2e3`, `backoffFactor = 2` (`node_modules/ai/dist/index.js:2637-2652`). `prepareRetries` also defaults to 2 (`:2658`).
- It honours `retry-after-ms`, then `retry-after`, when `0 <= ms < 60_000` (`:2611-2632`). FreeLLMAPI's exhaustion `Retry-After` therefore controls the delay when it's under 60 s.
- The loop rethrows abort errors without retrying (`provider-utils:3727-3732`). `isAbortError` covers `AbortError`, `ResponseAborted` and `TimeoutError` (`provider-utils:543-545`). The backoff `delay` can be aborted (`provider-utils:40-60`).
- The retry covers `doStream` up to the point where response headers arrive (`node_modules/ai/dist/index.js:9631`). With FreeLLMAPI, that is the entire failover and pre-content wait.

**(b) Errors in the stream**

- When a frame shaped like `{error:{...}}` arrives:
  - _Before any output:_ it's thrown as an `APICallError` that `maxRetries` can retry (`@ai-sdk/openai/dist/index.js:321-389`). FreeLLMAPI never does this, because it fails over before committing.
  - _After output:_ it's emitted as a `type: "error"` stream part (`:1470-1479`).
- For FreeLLMAPI's `type: "stream_error"` with no code, `getStatusCode` falls through to 500, so `isRetryable: true` (`:413-449`).
- A frame that fails to parse also becomes an `error` part (`:1458-1468`).
- If the stream ends with no `[DONE]` or `finish_reason`, the SDK just finishes with `finishReason: "other"` and no error (`:1433` initial value, `:1527-1540` flush).
- If reading the body throws (connection reset), the error propagates out of `languageModelStreamReader.read()`. It is not retried (`node_modules/ai/dist/index.js:9729-9733`).

**`streamRetries`**

- Defaults to 0, and the feature is off when the option is omitted (`index.js:9346-9351`, `:8773`).
- Automatic stream retries act only on `error` parts. They do **not** check `isRetryable`: the only condition is `!isToolChoiceViolation && count < streamRetries` (`:9777`).
- A retry calls `callLanguageModel()` again, which itself goes through `maxRetries` (`:9791`).
- Docs: text already sent can't be retracted, and a retry may append repeated text (`node_modules/ai/docs/03-ai-sdk-core/50-error-handling.mdx:104-176`).
- `ToolLoopAgentSettings` has no `streamRetries` field (`index.d.ts:5525`; it's on `streamText` at `:3918`). The settings are spread into `streamText` at runtime (`index.js:10407-10411`), but setting it on the agent would need a type workaround.

**Timeouts and `maxRetries`**

- `timeout.totalMs`, `stepMs`, `firstChunkMs` and `chunkMs` all merge into the single abort signal used for the call and its retries (`index.js:8717-8741`, `mergeAbortSignals` at `:2590`). So any timeout firing aborts the whole run, and an aborted call is never retried.
- The first-chunk timer starts only after the initial model call resolves, i.e. after headers (`:9683` then `:9812`).
- `chunkMs` resets on each output chunk (`:9753-9756`).
- The agent passes `timeout` and `maxRetries` from its constructor to `streamText` (`index.js:10467-10476`; docs in `node_modules/ai/docs/07-reference/01-ai-sdk-core/16-tool-loop-agent.mdx:725-730`).

**Reasoning**

- `openaiChatChunkSchema` has no reasoning fields in `delta`, only role, content, tool_calls and annotations (`@ai-sdk/openai/dist/index.js:755-807`). `delta.reasoning_content` is silently stripped.
- On `main` (not the installed version), `@ai-sdk/openai-compatible` does read `delta.reasoning_content ?? delta.reasoning` ([vercel/ai `216e2c9`](https://github.com/vercel/ai/blob/216e2c90b1fa4955c11cbb18709052a2d50a0451/packages/openai-compatible/src/chat/openai-compatible-chat-language-model.ts#L689)). Verified in the published `@ai-sdk/openai-compatible@3.0.68` (`dist/index.js:691` streaming, `:481` non-streaming). It also sends assistant reasoning back as `reasoning_content` in history (`:205`). It depends on the same `@ai-sdk/provider-utils@5.0.59` as the installed `ai`, so retry behaviour is identical.

## 4. Worst-case latency for one chat turn

Let P be the time FreeLLMAPI spends on one request before it commits or errors.

| Case                                       | P                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------- |
| Pool rate-limited or on cooldown           | ~instant (unmeasured); 429 with `Retry-After`                                    |
| Healthy failover, attempts 0 and 1 fast    | ≤ ~45 s budget, then 502 or 429                                                  |
| Attempts 0 and 1 stall (OpenAI-compatible) | up to ~2 × (60 s headers + 90 s first read) ≈ 300 s before the budget can apply  |
| Answer, or tool-only turn                  | P includes all model generation before the first visible text (headers are held) |

With the defaults, one step ≈ 3 × P + backoff (2 s + 4 s, or up to 59.9 s each when `Retry-After` is under 60 s). Up to 5 steps run one after another, each with its own retry budget:

- Budget-bound case: ≈ 5 × (3 × 45 + 6) ≈ 700 s.
- Even one step with one budget-bound P of 45 s plus a single 2 s backoff and retry passes 60 s.

Vercel then kills the function at `maxDuration = 60` and the reader sees a cut-off stream. With `totalMs: 50_000`, the SDK aborts first and the route can report the failure. With `maxRetries: 1`, a fast proxy-hop blip still gets one retry.

## 5. Others using the AI SDK with FreeLLMAPI

GitHub code search, via the REST `search/code` API; `gh search code` silently returned nothing once rate-limited. Found:

| Repository                                                                                                                                                                                                                                                                                                                                           | Setup                                                                                                                                                                                | Retry / timeout settings                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CSOAI-ORG/meok-ai `ui/src/lib/llm-router.ts#L357-L362`](https://github.com/CSOAI-ORG/meok-ai/blob/628c3cb159e08c524668b8665d8d0c2d15f00718/ui/src/lib/llm-router.ts#L357-L362)                                                                                                                                                                      | `createOpenAI({ baseURL: FREELLMAPI_BASE_URL })`, model `auto`; `ai@^6`, `@ai-sdk/openai@^3`. Uses `freellmapi(model)`, not `.chat()`                                                | None in this file                                                                                                                                                                                                                              |
| [imseby2002/ai-gate-app `src/lib/ai/proxy-fallback.ts#L205-L275`](https://github.com/imseby2002/ai-gate-app/blob/7833a378480febbd9586a85084903ab62ed3d326/src/lib/ai/proxy-fallback.ts#L205-L275)                                                                                                                                                    | `createOpenAI(...).chat(model)` + `streamText`, with its own provider chain. Peeks at `fullStream` until real content or an `error` part arrives before committing to an attempt     | `abortSignal: AbortSignal.timeout(30000)` per attempt; app-level `isRetryable`. [`free-llm.ts`](https://github.com/imseby2002/ai-gate-app/blob/7833a378480febbd9586a85084903ab62ed3d326/src/lib/ai/providers/free-llm.ts#L30-L54) sets nothing |
| [AshokSahani7390/ai_mock_interviews `lib/ai.ts#L14-L22`](https://github.com/AshokSahani7390/ai_mock_interviews/blob/a683b559ed1bbac7ed19965200cae175d56302fb/lib/ai.ts#L14-L22)                                                                                                                                                                      | `createOpenAI` with a generic `AI_BASE_URL` that the file's comment says is FreeLLMAPI                                                                                               | None in this file                                                                                                                                                                                                                              |
| [anandxdj/open_connect `backend/src/lib/llm/provider.ts#L8-L33`](https://github.com/anandxdj/open_connect/blob/9c491d14c46c8df9d18e9b34132de792dae92613/backend/src/lib/llm/provider.ts#L8-L33)                                                                                                                                                      | `createOpenAICompatible` against "Open Quota", a hosted proxy based on FreeLLMAPI. Notes that rerouting to a model that writes tool calls as text breaks the agent's tool loop       | None in this file                                                                                                                                                                                                                              |
| Upstream [`opencode.json`](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/opencode.json), [client docs](https://github.com/tashfeenahmed/freellmapi/blob/986b2118226f5c2d1a0348e14d151a7005c1924e/docs/en/clients/01-agent-clients.md#L100), [#48](https://github.com/tashfeenahmed/freellmapi/issues/48) | opencode through `@ai-sdk/openai-compatible`. [PR #805](https://github.com/tashfeenahmed/freellmapi/pull/805) works around AI SDK clients stripping `reasoning_content` from history | n/a                                                                                                                                                                                                                                            |

- None of these files set `maxRetries`, `streamRetries` or `timeout`.
- No FreeLLMAPI issue discusses AI SDK retry behaviour. The only `vercel` match is [#296](https://github.com/tashfeenahmed/freellmapi/issues/296), about Vercel AI Gateway.
- Web search turned up only third-party guides (instagit.com, skills.sh) using the OpenAI Python client. These are leads, not evidence.
