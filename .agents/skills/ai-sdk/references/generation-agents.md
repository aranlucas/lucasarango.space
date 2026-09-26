# Generation, agents, and tools

Sources: [Generating text](https://ai-sdk.dev/docs/ai-sdk-core/generating-text), [Structured output](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data), [Agents](https://ai-sdk.dev/docs/agents/overview), [Workflows](https://ai-sdk.dev/docs/agents/workflows), [Loop control](https://ai-sdk.dev/docs/agents/loop-control), and [Runtime and tool context](https://ai-sdk.dev/docs/ai-sdk-core/runtime-and-tool-context).

## Choose an execution pattern

- Use `generateText` or `streamText` for a generation request or a small explicit flow. Core functions can also handle tools and multi-step execution with appropriate loop controls.
- Use `ToolLoopAgent` when the model should repeatedly select tools and determine its next action, especially when reusing the same instructions and tools across calls.
- Use an explicit workflow when application code must control sequencing, branching, routing, or parallel operations. Do not introduce an autonomous agent for a fixed sequence that is clearer in ordinary code.

For SDK 7, `ToolLoopAgent` defaults to `isStepCount(20)`. Choose a task-appropriate bound; the default is not a latency or token budget. Verify defaults for other agent abstractions separately. Allow sufficient steps for tool results and a final answer; reaching a step cap does not guarantee a useful final response. Use `prepareStep` when behavior must change between steps.

## Structured output

Use `generateText` or `streamText` with `output`:

- `Output.object({ schema })` for a typed object.
- `Output.array({ element })` for typed array elements; check version support before adding bounds such as `minItems` or `maxItems`.
- `Output.choice({ options })` for a fixed string selection.
- `Output.json()` for valid JSON without a shape constraint.

Final structured output is validated according to the selected strategy. `partialOutputStream` can contain incomplete values that have not passed full schema validation. `elementStream` for array output emits completed, validated elements. Handle parsing/validation failures and missing final output; do not treat a partial object as a valid business record.

Structured output can be combined with tools. Reserve enough steps to produce the final structured answer after tool execution, and verify that the selected provider/model supports the required combination.

## Tools and context

Use descriptive tools with `inputSchema` and typed execution. Keep credentials and scoped permissions in server-side context rather than model-visible arguments. In SDK 7, shared agent state uses `runtimeContext`; each tool receives its own declared context from `toolsContext`, validated by `contextSchema`.

Check tool approval and execution APIs when actions require application-level approval. Distinguish a schema-valid request from an authorized action. Read the installed tool and provider documentation before using provider-executed tools, experimental sandboxes, or MCP.
