import { chatTools, createAskAgent } from "@/lib/ai/agent";
import { systemPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";

import { createChatHandler } from "./handler";

// Free providers can take a while to start streaming when they are busy.
export const maxDuration = 60;

export const POST = createChatHandler(
  createAskAgent({
    model: getLanguageModel(),
    tools: chatTools,
    loadInstructions: systemPrompt,
  }),
);
