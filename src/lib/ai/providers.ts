import { createOpenAI } from "@ai-sdk/openai";

import { env } from "@/env";

const provider = createOpenAI({
  baseURL: env.FREELLMAPI_BASE_URL,
  apiKey: env.FREELLMAPI_API_KEY,
});

export function getLanguageModel() {
  return provider.chat(env.FREELLMAPI_MODEL);
}
