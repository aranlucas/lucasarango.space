import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  smoothStream,
  toUIMessageStream,
  type ModelMessage,
  type StreamTextTransform,
  type TextStreamPart,
} from "ai";

import { chatTools } from "@/lib/ai/agent";
import { ChatbotError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";

import { postRequestBodySchema } from "./schema";

/** The part of the Ask agent the route uses; tests pass a fake. A missing provider key surfaces as a stream error. */
export type ChatAgent = {
  stream: (options: {
    messages: ModelMessage[];
    abortSignal: AbortSignal;
    experimental_transform: StreamTextTransform<typeof chatTools>;
  }) => Promise<{ stream: ReadableStream<TextStreamPart<typeof chatTools>> }>;
};

/**
 * Streams the agent's answer. After the AI SDK chatbot template's
 * app/(chat)/api/chat/route.ts, which this file backs: route modules can only
 * export handlers, and tests inject the agent.
 */
function streamAnswer(req: Request, messages: ChatMessage[], agent: ChatAgent) {
  const onError = (cause: unknown) => {
    // Readers see a generic message; the cause goes to the function logs.
    console.error("Ask agent failed:", cause, { vercelId: req.headers.get("x-vercel-id") });

    return new ChatbotError("offline:chat").message;
  };

  return createUIMessageStream<ChatMessage>({
    execute: async ({ writer }) => {
      req.signal.throwIfAborted();

      const result = await agent.stream({
        messages: await convertToModelMessages(messages, {
          tools: chatTools,
          // Stop can leave a tool call without its result in the UI history.
          ignoreIncompleteToolCalls: true,
        }),
        abortSignal: req.signal,
        // Free providers send text in uneven bursts; re-chunk it into words so
        // answers print at a steady pace.
        experimental_transform: smoothStream(),
      });

      writer.merge(
        toUIMessageStream({
          stream: result.stream,
          // The popup shows a "thinking" state while reasoning streams.
          sendReasoning: true,
          onError,
        }),
      );
    },
    onError,
  });
}

export function createChatHandler(agent: ChatAgent) {
  return async function POST(req: Request) {
    const request = postRequestBodySchema.safeParse(await req.json().catch(() => null));

    if (!request.success) {
      return new ChatbotError("bad_request:chat", request.error.issues[0]?.message).toResponse();
    }

    const messages = await safeValidateUIMessages<ChatMessage>({
      messages: request.data.messages,
      // Tool calls in earlier answers must match the tools' schemas.
      tools: chatTools,
    });

    if (!messages.success) {
      return new ChatbotError("bad_request:api").toResponse();
    }

    return createUIMessageStreamResponse({
      stream: streamAnswer(req, messages.data, agent),
    });
  };
}
