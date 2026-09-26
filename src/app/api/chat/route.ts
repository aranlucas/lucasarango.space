import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  toUIMessageStream,
} from "ai";

import { askAgent, env } from "@/lib/ask-agent";
import { WAITING } from "@/lib/ask-config";
import { askTools } from "@/lib/ask-tools";
import type { AskMessage, WaitingStatus } from "@/lib/ask-types";

import { postRequestBodySchema } from "./schema";

// Free providers can take a while to start streaming when they're busy.
export const maxDuration = 60;

const UNAVAILABLE = "The assistant is unavailable right now.";
const INVALID = "Send the conversation as chat messages.";

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

/**
 * Streams the agent's answer, preceded by a transient waiting status that
 * turns into "still waiting" if the model is silent for too long. After the AI
 * SDK chatbot template's app/(chat)/api/chat/route.ts.
 */
function streamAnswer(req: Request, messages: AskMessage[]) {
  const onError = (error: unknown) => {
    // Readers see a generic message; the cause goes to the function logs.
    console.error("Ask agent failed:", error, { vercelId: req.headers.get("x-vercel-id") });
    return UNAVAILABLE;
  };

  return createUIMessageStream<AskMessage>({
    execute: async ({ writer }) => {
      const writeWaitingStatus = (phase: WaitingStatus["phase"], message: string) => {
        // Transient parts reach onData; the client replaces its waiting status in state.
        writer.write({
          type: "data-waiting-status",
          id: "waiting-status",
          data: { phase, message },
          transient: true,
        });
      };
      writeWaitingStatus("waiting", WAITING.message);
      const timer = setTimeout(() => {
        writeWaitingStatus("still-waiting", WAITING.stillWaitingMessage);
      }, WAITING.stillWaitingAfterMs);
      const stopWaiting = () => {
        clearTimeout(timer);
      };
      req.signal.addEventListener("abort", stopWaiting);

      try {
        const result = await askAgent.stream({
          messages: await convertToModelMessages(messages, { tools: askTools }),
          abortSignal: req.signal,
        });
        writer.merge(
          toUIMessageStream<typeof askTools, AskMessage>({
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

export async function POST(req: Request) {
  if (env("OPENROUTER_API_KEY") === undefined) {
    return new Response(UNAVAILABLE, { status: 503 });
  }

  const request = postRequestBodySchema.safeParse(await req.json().catch(() => null));
  if (!request.success) {
    return new Response(request.error.issues[0]?.message ?? INVALID, { status: 400 });
  }
  const messages = await safeValidateUIMessages<AskMessage>({
    messages: request.data.messages,
    // Tool calls in earlier answers must match the tools' schemas.
    tools: askTools,
  });
  if (!messages.success) {
    return new Response(INVALID, { status: 400 });
  }

  return createUIMessageStreamResponse({ stream: streamAnswer(req, messages.data) });
}
