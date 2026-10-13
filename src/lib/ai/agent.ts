import { isStepCount, ToolLoopAgent, type LanguageModel } from "ai";

import { systemPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";
import { listPosts } from "@/lib/ai/tools/list-posts";
import { readPost } from "@/lib/ai/tools/read-post";

type CreateAskAgentProps = {
  model: LanguageModel;
  tools: typeof chatTools;
  loadInstructions: () => Promise<string>;
};

const MAX_STEPS = 5;

/** The tools the agent reads Lucas's writing with; the route validates history against them. */
export const chatTools = { listPosts, readPost };

/**
 * The Ask agent: answers from the résumé and projects in its instructions and
 * reads posts with tools. System messages from the client are rejected
 * (allowSystemInMessages defaults to false), so only these instructions apply.
 */
export function createAskAgent({ model, tools, loadInstructions }: CreateAskAgentProps) {
  return new ToolLoopAgent({
    model,
    tools,
    stopWhen: isStepCount(MAX_STEPS),
    // Reserve the last model call for an answer rather than another tool call.
    prepareStep: ({ stepNumber }) =>
      stepNumber === MAX_STEPS - 1 ? { toolChoice: "none" } : undefined,
    // The résumé comes from the resume API (cached), so instructions are built per call.
    prepareCall: async (settings) => ({ ...settings, instructions: await loadInstructions() }),
  });
}

export const askAgent = createAskAgent({
  model: getLanguageModel(),
  tools: chatTools,
  loadInstructions: systemPrompt,
});
