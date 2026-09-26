import { openrouter } from "@openrouter/ai-sdk-provider";
import { isStepCount, ToolLoopAgent } from "ai";

import { getSystemPrompt } from "@/lib/ask";
import { askTools } from "@/lib/ask-tools";

// Routes to whichever free OpenRouter model is available; override with OPENROUTER_MODEL.
// See https://openrouter.ai/collections/free-models.
const DEFAULT_MODEL = "openrouter/free";

/** A trimmed environment variable, or undefined when unset or blank. */
export function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === undefined || value === "" ? undefined : value;
}

/**
 * The Ask agent: answers from the résumé and projects in its instructions and
 * reads posts with tools. System messages from the client are rejected
 * (allowSystemInMessages defaults to false), so only these instructions apply.
 */
export const askAgent = new ToolLoopAgent({
  model: openrouter.chat(env("OPENROUTER_MODEL") ?? DEFAULT_MODEL),
  tools: askTools,
  // Enough to list posts, read a couple, and answer.
  stopWhen: isStepCount(5),
  // The résumé comes from the resume API (cached), so instructions are built per call.
  prepareCall: async (settings) => ({ ...settings, instructions: await getSystemPrompt() }),
});
