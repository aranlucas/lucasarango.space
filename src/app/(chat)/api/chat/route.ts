import { askAgent } from "@/lib/ai/agent";
import { hasProviderKey } from "@/lib/ai/providers";

import { createChatHandler } from "./handler";

// Free providers can take a while to start streaming when they are busy.
export const maxDuration = 60;

export const POST = createChatHandler({
  stream: (options) => askAgent.stream(options),
  hasKey: hasProviderKey,
});
