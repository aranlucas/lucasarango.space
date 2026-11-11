import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type InferUIMessageChunk,
  safeValidateUIMessages,
  smoothStream,
  toUIMessageStream,
} from "ai";

import { chatTools, type createAskAgent } from "@/lib/ai/agent";
import { ChatbotError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";

import { postRequestBodySchema } from "./schema";

type AskAgent = ReturnType<typeof createAskAgent>;

type ChatChunk = InferUIMessageChunk<ChatMessage>;

/**
 * The turn's time budget aborts the stream the same way the reader's Stop
 * does, and the popup treats an abort as a stop: no error, no retry. Only the
 * reader's own Stop should read as one.
 */
function reportTimeout(req: Request, vercelId: string | null) {
  return new TransformStream<ChatChunk, ChatChunk>({
    transform(chunk, controller) {
      if (chunk.type !== "abort" || req.signal.aborted) {
        controller.enqueue(chunk);

        return;
      }

      console.error("Ask agent ran out of time:", chunk.reason, { vercelId });
      controller.enqueue({ type: "error", errorText: new ChatbotError("timeout:chat").message });
    },
  });
}

/**
 * Streams the agent's answer. After the AI SDK chatbot template's
 * app/(chat)/api/chat/route.ts, which this file backs: route modules can only
 * export handlers, and tests inject the agent.
 */
function streamAnswer(req: Request, messages: ChatMessage[], agent: AskAgent) {
  const vercelId = req.headers.get("x-vercel-id");

  const onError = (cause: unknown) => {
    // Readers see a generic message; the cause goes to the function logs.
    console.error("Ask agent failed:", cause, { vercelId });

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
        }).pipeThrough(reportTimeout(req, vercelId)),
      );
    },
    onError,
  });
}

/** Tests pass an Ask agent on a mock model. A missing provider key surfaces as a stream error. */
export function createChatHandler(agent: AskAgent) {
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
