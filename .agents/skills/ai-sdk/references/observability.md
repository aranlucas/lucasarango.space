# Observability

Sources: [DevTools](https://ai-sdk.dev/docs/ai-sdk-core/devtools), [Telemetry](https://ai-sdk.dev/docs/ai-sdk-core/telemetry), and [Error handling](https://ai-sdk.dev/docs/ai-sdk-core/error-handling). This setup targets SDK 7; verify the installed integration package's API and compatibility.

## Local DevTools

When local debugging calls for it, install a compatible `@ai-sdk/devtools` package and register its telemetry integration in server initialization, once per process, only in development:

```ts
import { registerTelemetry } from "ai";

if (process.env.NODE_ENV === "development") {
  const { DevToolsTelemetry } = await import("@ai-sdk/devtools");
  registerTelemetry(DevToolsTelemetry());
}
```

Alternatively, attach `DevToolsTelemetry()` through the call's `telemetry.integrations` when debugging specific generations. Registration enables telemetry automatically; do not copy an older middleware setup without checking version support.

Launch the viewer from the same workspace as the AI code:

```bash
npx @ai-sdk/devtools@latest
```

The documented default viewer URL is `http://localhost:4983`. DevTools is intended for local development. It captures prompts, output, tool interactions, token usage, and timing; raw request/response payloads require body retention. Consult `include` and telemetry options before enabling additional capture.

## Diagnose generation failures

Distinguish HTTP/request validation failures, provider failures, stream error chunks, tool execution errors, and structured-output failures. Capture enough server-side context to diagnose the problem while returning appropriate client-facing errors.

For SDK 7 production OpenTelemetry integration, consult `@ai-sdk/otel` and `registerTelemetry`. Use current lifecycle callbacks and inspect aggregated `usage`, step records, and `finalStep` deliberately; do not assume the final step represents the whole run. Add instrumentation when the task requires it rather than installing debugging packages during a documentation review.
