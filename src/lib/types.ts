// Message types shared by the Ask popup and its API route. Type-only, so the
// client never bundles the server-side tools.

import type { InferUITool, UIMessage } from "ai";

import type { listPosts } from "@/lib/ai/tools/list-posts";
import type { readPost } from "@/lib/ai/tools/read-post";

export type ChatTools = {
  listPosts: InferUITool<typeof listPosts>;
  readPost: InferUITool<typeof readPost>;
};

/** Sent by the route while it waits for the model's first output; never saved in the conversation. */
export type WaitingStatusData = {
  phase: "waiting" | "still-waiting";
  message: string;
};

export type CustomUIDataTypes = {
  "waiting-status": WaitingStatusData;
};

export type ChatMessage = UIMessage<unknown, CustomUIDataTypes, ChatTools>;
