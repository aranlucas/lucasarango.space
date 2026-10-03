import { askAgent, env } from "@/lib/ask-agent";
import { createChatHandler } from "@/lib/chat-handler";

// Free providers can take a while to start streaming when they are busy.
export const maxDuration = 60;

export const POST = createChatHandler({
  stream: (options) => askAgent.stream(options),
  hasKey: () => env("OPENROUTER_API_KEY") !== undefined,
});
