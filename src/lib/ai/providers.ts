import { openrouter } from "@openrouter/ai-sdk-provider";

import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

/** A trimmed environment variable, or undefined when unset or blank. */
function env(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value === undefined || value === "" ? undefined : value;
}

export function hasProviderKey(): boolean {
  return env("OPENROUTER_API_KEY") !== undefined;
}

export function getLanguageModel() {
  return openrouter.chat(env("OPENROUTER_MODEL") ?? DEFAULT_CHAT_MODEL);
}
