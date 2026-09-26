# SDK 7 migration and compatibility

This reference targets SDK 7. Check the installed release before applying it to another major. Use the [official 6-to-7 migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0) and installed source to distinguish removals, deprecated aliases, and behavioral changes.

## Runtime and packages

SDK 7 requires Node.js 22 or later and ESM. Check the actual local and deployment runtimes, not just `@types/node`. Confirm peer dependencies for core, framework, and provider packages; their major version numbers need not match. Third-party provider adapters have their own compatibility requirements.

Upgrade when it serves the task. Review release notes and migration guidance, update compatible packages together, inspect any codemod diff, and verify affected behavior. The documented v7 codemod is `npx @ai-sdk/codemod v7`; do not apply it to an already migrated project without a reason.

## Common migration checkpoints

| Area                 | SDK 7 guidance                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompts              | Prefer `instructions`; `system` remains a deprecated fallback.                                                                                                         |
| Submitted messages   | System-role messages in `prompt`/`messages` are rejected by default. Use `allowSystemInMessages` only when preserving trusted server-controlled histories requires it. |
| Loop limits          | Use `isStepCount` in place of `stepCountIs`.                                                                                                                           |
| Generation lifecycle | Prefer `onEnd` and `onStepEnd` over deprecated `onFinish` and `onStepFinish`. Check the specific callback API: UI stream completion callbacks still use `onFinish`.    |
| Stream results       | Prefer `result.stream` over deprecated `fullStream`.                                                                                                                   |
| Response conversion  | Prefer standalone `toUIMessageStream`, `createUIMessageStreamResponse`, and text/Node response helpers over deprecated result methods.                                 |
| Structured output    | Use `output` and `Output` strategies. `experimental_output` has been removed.                                                                                          |
| Tool definitions     | Use `inputSchema`; check tool execution signatures and adapter compatibility.                                                                                          |
| UI tool parts        | Use `isToolUIPart`; `isToolOrDynamicToolUIPart` has been removed.                                                                                                      |
| Context              | Shared orchestration state uses `runtimeContext`; per-tool values use `toolsContext` and each tool's typed `context`.                                                  |
| Telemetry            | Prefer `telemetry`; OpenTelemetry integration is provided by `@ai-sdk/otel`.                                                                                           |

Do not blindly rename every callback or experimental API. Some aliases remain supported and others are removed; consult the relevant section before changing them.

## Behavioral changes worth checking

- `prepareStep` instruction and message overrides carry forward to later steps. Return an explicit replacement when an override should apply for only one step.
- Multi-step `usage` now aggregates all steps; prefer it over deprecated `totalUsage`. Top-level text and tool results also aggregate across steps. Use `finalStep` when final-step-only values are required.
- Prefer `finalStep` for final reasoning, request, response, and provider metadata instead of their deprecated top-level aliases.
- Request and response bodies are excluded by default; check `include` options before expecting raw payloads in results or debugging tools.
- Check provider-specific changes and persisted message compatibility separately from core symbol renames.
