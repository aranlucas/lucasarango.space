import { isStepCount, ToolLoopAgent, type LanguageModel, type TimeoutConfiguration } from "ai";

import { listPosts } from "@/lib/ai/tools/list-posts";
import { readPost } from "@/lib/ai/tools/read-post";

type CreateAskAgentProps = {
  model: LanguageModel;
  tools: typeof chatTools;
  loadInstructions: () => Promise<string>;
  /** Tests shorten the turn's budget; the route uses ASK_TURN_TIMEOUT. */
  timeout?: TimeoutConfiguration<typeof chatTools>;
};

const MAX_STEPS = 5;

/**
 * One answer's time budget. Vercel stops the route at its maxDuration (60 s)
 * mid-stream, which leaves the reader a cut-off answer, so the turn ends first
 * and the reader gets an error to retry. totalMs bounds every step, retry and
 * backoff; chunkMs ends a stream that stalls after it starts. Rationale in
 * docs/research/freellmapi-ai-sdk-retries-2026-10-12.md.
 */
export const ASK_TURN_TIMEOUT = { totalMs: 50_000, chunkMs: 20_000 } as const;

/** The tools the agent reads Lucas's writing with; the route validates history against them. */
export const chatTools = { listPosts, readPost };

/**
 * The Ask agent: answers from the résumé and projects in its instructions and
 * reads posts with tools. System messages from the client are rejected
 * (allowSystemInMessages defaults to false), so only these instructions apply.
 */
export function createAskAgent({
  model,
  tools,
  loadInstructions,
  timeout = ASK_TURN_TIMEOUT,
}: CreateAskAgentProps) {
  return new ToolLoopAgent({
    model,
    tools,
    stopWhen: isStepCount(MAX_STEPS),
    timeout,
    // FreeLLMAPI already fails over across providers and keys; one retry covers
    // the hop to the proxy without sleeping through the budget on a Retry-After.
    maxRetries: 1,
    // Reserve the last model call for an answer rather than another tool call.
    prepareStep: ({ stepNumber }) =>
      stepNumber === MAX_STEPS - 1 ? { toolChoice: "none" } : undefined,
    // The résumé comes from the resume API (cached), so instructions are built per call.
    prepareCall: async (settings) => ({ ...settings, instructions: await loadInstructions() }),
  });
}
