---
name: ai-sdk
description: Answer Vercel AI SDK questions and implement or review SDK generation, agents, tools, structured output, provider integrations, and UI hooks such as useChat.
---

# AI SDK

Verify APIs against the project's installed version before writing code. SDK releases change core APIs, UI hooks, provider interfaces, and defaults; examples from memory or another major version may be incompatible.

## Use the Bundled, Version-Matched Docs

1. Inspect the target package's manifest, lockfile, runtime, and existing AI integration. Locate dependencies in the relevant workspace; resolve package paths when pnpm or workspace layouts differ from the root.
2. Read the installed `ai` package's `docs/` and `src/` when available. Confirm exact signatures, defaults, and deprecations in source or exported types when documentation is ambiguous.
3. Check provider and framework packages for docs, source, or declarations; do not assume they have a `docs/` directory. Core bundled docs also cover framework UI integrations. Use official provider documentation for provider-specific behavior, checking its examples against installed SDK types.
4. For current documentation, use https://ai-sdk.dev/docs. Append `.md` to a page URL for Markdown, or search with `https://ai-sdk.dev/api/search-docs?q=<URL-encoded-query>`. Live docs may describe a newer version than the installed package; identify differences explicitly.
5. If a claim cannot be supported by documentation or source, state the uncertainty.

Documentation reviews and questions do not require installing packages. For implementation, install only the dependencies needed in the target package using its existing package manager.

## Choose the relevant guide

Read only the references needed for the task, then consult the linked official documentation and installed source for exact APIs.

- [SDK 7 migration](references/sdk-7.md): runtime requirements, API changes, compatibility, and upgrade decisions.
- [React UI and streaming](references/ui-streaming.md): messages, transports, validation, custom data, and cancellation.
- [Generation, agents, and tools](references/generation-agents.md): execution patterns, structured output, loop control, and context.
- [Providers and models](references/providers-models.md): preserve configured providers, check compatibility, and choose models by capabilities and constraints.
- [Observability](references/observability.md): SDK 7 DevTools, telemetry, and diagnosing failures.

For other features such as embeddings, reranking, MCP, or media generation, find the matching core and provider guides rather than extrapolating from text generation. Verify experimental status and model support.

## Implement and review

Preserve the user's provider, framework, and version choices. Compare installed and published versions when compatibility or an upgrade is relevant (`npm view ai version` and package peer dependencies); recommend upgrades for concrete fixes, required features, or support requirements. An older major alone is not a reason to stop work or migrate the project.

Use the simplest execution pattern that meets the task. Set options when required by the behavior or constraints, checking defaults first. Keep server credentials and instructions on the server.

After implementation changes, run the project's type checker and applicable required checks. Scale behavioral verification to the change; documentation-only reviews do not require an application build. Report what changed, what was checked, and any unresolved limitations.
