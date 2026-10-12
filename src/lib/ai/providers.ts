import { createOpenRouter, openrouter } from "@openrouter/ai-sdk-provider";

import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

export function getLanguageModel() {
  const baseURL = process.env.FREELLMAPI_BASE_URL?.trim() ?? "";

  if (baseURL !== "") {
    const apiKey = process.env.FREELLMAPI_API_KEY?.trim() ?? "";

    if (apiKey === "") {
      throw new Error("FREELLMAPI_API_KEY is required when FREELLMAPI_BASE_URL is set.");
    }

    const provider = createOpenRouter({ baseURL, apiKey, compatibility: "compatible" });
    const freeModel = process.env.FREELLMAPI_MODEL?.trim() ?? "";

    return provider.chat(freeModel === "" ? "auto" : freeModel);
  }

  const model = process.env.OPENROUTER_MODEL?.trim();

  return openrouter.chat(model === undefined || model === "" ? DEFAULT_CHAT_MODEL : model);
}
