// Message types shared by the Ask popup and its API route. Type-only, so the
// client never bundles the server-side tools.

import type { InferUITools, UIMessage } from "ai";

import type { chatTools } from "@/lib/ai/agent";

/** Sent by the route while it waits for the model's first output; never saved in the conversation. */
export type WaitingStatusData = { message: string };

export type ChatMessage = UIMessage<
  unknown,
  { "waiting-status": WaitingStatusData },
  InferUITools<typeof chatTools>
>;
