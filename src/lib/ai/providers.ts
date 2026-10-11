import { openrouter } from "@openrouter/ai-sdk-provider";

import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

export function getLanguageModel() {
  const model = process.env.OPENROUTER_MODEL?.trim();

  return openrouter.chat(model === undefined || model === "" ? DEFAULT_CHAT_MODEL : model);
}
