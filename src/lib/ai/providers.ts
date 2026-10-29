import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { env } from "@/env";
import { ChatbotError } from "@/lib/errors";

// FreeLLMAPI speaks Chat Completions with `reasoning_content`, which only this provider reads.
export function getLanguageModel() {
  if (env.FREELLMAPI_BASE_URL === undefined || env.FREELLMAPI_API_KEY === undefined) {
    throw new ChatbotError(
      "offline:chat",
      "Chat is unavailable: configure FREELLMAPI_BASE_URL and FREELLMAPI_API_KEY.",
    );
  }

  const provider = createOpenAICompatible({
    name: "freellmapi",
    baseURL: env.FREELLMAPI_BASE_URL,
    apiKey: env.FREELLMAPI_API_KEY,
  });

  return provider.chatModel(env.FREELLMAPI_MODEL);
}
