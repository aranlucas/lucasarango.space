import { chatTools, createAskAgent } from "@/lib/ai/agent";
import { systemPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";
import { ChatbotError } from "@/lib/errors";

import { createChatHandler } from "./handler";

// Free providers can take a while to start streaming when they are busy.
export const maxDuration = 60;

export const POST = async (req: Request) => {
  try {
    const agent = createAskAgent({
      model: getLanguageModel(),
      tools: chatTools,
      loadInstructions: systemPrompt,
    });

    return await createChatHandler(agent)(req);
  } catch (error) {
    if (error instanceof ChatbotError) {
      return error.toResponse();
    }

    throw error;
  }
};
