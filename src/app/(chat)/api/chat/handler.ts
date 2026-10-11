import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  toUIMessageStream,
  type UIMessageStreamWriter,
  type ModelMessage,
  type TextStreamPart,
} from "ai";

import { chatTools } from "@/lib/ai/agent";
import { WAITING } from "@/lib/constants";
import { ChatbotError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";

import { postRequestBodySchema } from "./schema";

/** The part of the Ask agent the route uses; tests pass a fake. A missing provider key surfaces as a stream error. */
export type ChatAgent = {
  stream: (options: {
    messages: ModelMessage[];
    abortSignal: AbortSignal;
  }) => Promise<{ stream: ReadableStream<TextStreamPart<typeof chatTools>> }>;
};

/** Anything past the stream's framing means the model has started. */
function isModelStreamActivity(chunk: { type: string }) {
  return !["start", "start-step", "finish-step", "finish", "raw"].includes(chunk.type);
}

/** Passes a stream through unchanged, calling onActivity as the model produces output and when it ends. */
function watchActivity<T extends { type: string }>(onActivity: () => void) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      if (isModelStreamActivity(chunk)) onActivity();
      controller.enqueue(chunk);
    },
    flush: onActivity,
  });
}

/** Emits temporary waiting statuses and returns cleanup for every completion path. */
function startWaiting(writer: UIMessageStreamWriter<ChatMessage>, signal: AbortSignal) {
  signal.throwIfAborted();

  const writeWaitingStatus = (message: string) => {
    // Transient parts reach onData; the client replaces its waiting status in state.
    writer.write({
      type: "data-waiting-status",
      id: "waiting-status",
      data: { message },
      transient: true,
    });
  };

  writeWaitingStatus(WAITING.message);

  const timer = setTimeout(() => {
    writeWaitingStatus(WAITING.stillWaitingMessage);
  }, WAITING.stillWaitingAfterMs);

  const stopWaiting = () => {
    clearTimeout(timer);
    signal.removeEventListener("abort", stopWaiting);
  };

  signal.addEventListener("abort", stopWaiting, { once: true });

  return stopWaiting;
}

/**
 * Streams the agent's answer, preceded by a transient waiting status that
 * turns into "still waiting" if the model is silent for too long. After the AI
 * SDK chatbot template's app/(chat)/api/chat/route.ts, which this file backs:
 * route modules can only export handlers, and tests inject the agent.
 */
function streamAnswer(req: Request, messages: ChatMessage[], agent: ChatAgent) {
  let stopWaiting: (() => void) | undefined;

  const onError = (cause: unknown) => {
    stopWaiting?.();
    // Readers see a generic message; the cause goes to the function logs.
    console.error("Ask agent failed:", cause, { vercelId: req.headers.get("x-vercel-id") });

    return new ChatbotError("offline:chat").message;
  };

  return createUIMessageStream<ChatMessage>({
    execute: async ({ writer }) => {
      stopWaiting = startWaiting(writer, req.signal);

      try {
        const result = await agent.stream({
          messages: await convertToModelMessages(messages, {
            tools: chatTools,
            // Stop can leave a tool call without its result in the UI history.
            ignoreIncompleteToolCalls: true,
          }),
          abortSignal: req.signal,
        });

        writer.merge(
          toUIMessageStream({
            stream: result.stream.pipeThrough(watchActivity(stopWaiting)),
            // The popup shows a "thinking" state while reasoning streams.
            sendReasoning: true,
            onError,
          }),
        );
      } catch (error) {
        stopWaiting();
        throw error;
      }
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
