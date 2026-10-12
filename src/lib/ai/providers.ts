import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { env } from "@/env";

// FreeLLMAPI speaks Chat Completions with `reasoning_content`, which only this provider reads.
const provider = createOpenAICompatible({
  name: "freellmapi",
  baseURL: env.FREELLMAPI_BASE_URL,
  apiKey: env.FREELLMAPI_API_KEY,
});

export function getLanguageModel() {
  return provider.chatModel(env.FREELLMAPI_MODEL);
}
