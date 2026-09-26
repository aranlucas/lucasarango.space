// Message types shared by the Ask popup and its API route, after the AI SDK
// chatbot template's lib/types.ts. Type-only, so the client never bundles the
// server-side tools.

import type { InferUITools, UIMessage } from "ai";

import type { askTools } from "@/lib/ask-tools";

/** Sent by the route while it waits for the model's first output; never saved in the conversation. */
export type WaitingStatus = {
  phase: "waiting" | "still-waiting";
  message: string;
};

export type AskDataTypes = {
  "waiting-status": WaitingStatus;
};

export type AskMessage = UIMessage<unknown, AskDataTypes, InferUITools<typeof askTools>>;
