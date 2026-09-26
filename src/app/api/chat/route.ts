import { createAgentUIStreamResponse, safeValidateUIMessages } from "ai";

import { askAgent, env } from "@/lib/ask-agent";
import { askTools } from "@/lib/ask-tools";

import { postRequestBodySchema } from "./schema";

// Free providers can take a while to start streaming when they're busy.
export const maxDuration = 60;

const UNAVAILABLE = "The assistant is unavailable right now.";
const INVALID = "Send the conversation as chat messages.";

export async function POST(req: Request) {
  if (env("OPENROUTER_API_KEY") === undefined) {
    return new Response(UNAVAILABLE, { status: 503 });
  }

  const request = postRequestBodySchema.safeParse(await req.json().catch(() => null));
  if (!request.success) {
    return new Response(request.error.issues[0]?.message ?? INVALID, {
      status: 400,
    });
  }
  const messages = await safeValidateUIMessages({
    messages: request.data.messages,
    // Tool calls in earlier answers must match the tools' schemas.
    tools: askTools,
  });
  if (!messages.success) {
    return new Response(INVALID, { status: 400 });
  }

  const logFailure = (error: unknown) => {
    // Readers see a generic message; the cause goes to the function logs.
    console.error("Ask agent failed:", error, { vercelId: req.headers.get("x-vercel-id") });
  };

  try {
    return await createAgentUIStreamResponse({
      agent: askAgent,
      uiMessages: messages.data,
      abortSignal: req.signal,
      // The popup shows a "thinking" state while reasoning streams.
      sendReasoning: true,
      onError: (error) => {
        logFailure(error);
        return UNAVAILABLE;
      },
    });
  } catch (error) {
    // Anything that fails before the stream starts.
    logFailure(error);
    return new Response(UNAVAILABLE, { status: 500 });
  }
}
