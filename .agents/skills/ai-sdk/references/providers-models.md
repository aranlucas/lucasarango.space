# Providers and models

Preserve the project's configured provider unless a provider change is part of the task. This project uses `@openrouter/ai-sdk-provider`; AI Gateway is an option for other integrations, not an automatic replacement.

## Compatibility and documentation

Inspect provider package peer dependencies, exports, source/types, and release notes. Package majors do not necessarily match the core SDK major. Provider documentation can contain older SDK examples: verify core options such as `inputSchema`, callbacks, and stream helpers against the installed SDK.

- [AI SDK provider management](https://ai-sdk.dev/docs/ai-sdk-core/provider-management)
- [AI Gateway provider](https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway)
- [OpenRouter integration](https://openrouter.ai/docs/guides/community/vercel-ai-sdk)
- [OpenRouter adapter source](https://github.com/OpenRouterTeam/ai-sdk-provider)

## Model selection

Check the configured provider's current catalog when introducing or changing a model ID. Preserve an existing model when the task does not require a change; verify availability when diagnosing routing or model errors.

For catalog inspection, these endpoints return public model metadata:

```bash
# AI Gateway
curl -fsSL https://ai-gateway.vercel.sh/v1/models | jq -r '.data[].id'

# OpenRouter
curl -fsSL https://openrouter.ai/api/v1/models | jq '.data'
```

Filter by required capabilities and inspect metadata rather than assuming list order means newest or best. Choose based on tool calling, structured output, context window, modality, latency, pricing, availability, and the user's constraints. A higher version number alone does not establish suitability. Router aliases can select different underlying models across requests; check routing guarantees when behavior depends on a capability.

## Gateway authentication when selected

AI Gateway can accept supported provider/model strings through the SDK's default provider. Verify the current setup and credentials in the Gateway guide. API-key authentication uses `AI_GATEWAY_API_KEY`; supported Vercel OIDC authentication is a separate path and does not require setting that API key. Keep credentials server-side and follow the actual deployment's authentication requirements.
