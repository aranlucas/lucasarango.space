// Message types shared by the Ask popup and its API route. Type-only, so the
// client never bundles the server-side tools.

import type { InferUITools, UIMessage } from "ai";

import type { chatTools } from "@/lib/ai/agent";

export type ChatMessage = UIMessage<unknown, never, InferUITools<typeof chatTools>>;
