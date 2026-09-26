// The Ask popup's request body, after the AI SDK chatbot template's
// app/(chat)/api/chat/schema.ts. Readers only send text; assistant messages
// come back with their tool parts. There's no system role: the agent's
// instructions are the only system prompt.

import { z } from "zod";

import { ASK_LIMITS } from "@/lib/ask-config";

const textPartSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(ASK_LIMITS.questionChars, `Keep questions under ${ASK_LIMITS.questionChars} characters.`),
  type: z.enum(["text"]),
});

const userMessageSchema = z.object({
  id: z.string(),
  parts: z.array(textPartSchema),
  role: z.enum(["user"]),
});

const assistantMessageSchema = z.object({
  id: z.string(),
  parts: z.array(z.record(z.string(), z.unknown())),
  role: z.enum(["assistant"]),
});

export const postRequestBodySchema = z.object(
  {
    messages: z
      .array(z.discriminatedUnion("role", [userMessageSchema, assistantMessageSchema]))
      .min(1, "Send at least one message.")
      .max(ASK_LIMITS.messages, "This conversation is full. Start a new one to keep asking."),
  },
  { error: "Send the conversation as chat messages." },
);
