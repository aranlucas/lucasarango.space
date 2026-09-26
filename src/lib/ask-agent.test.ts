import { expect, it, vi } from "vitest";

import { askAgent } from "./ask-agent";

const { languageModel } = await vi.hoisted(async () => {
  const { MockLanguageModelV4 } = await import("ai/test");
  let call = 0;
  return {
    languageModel: new MockLanguageModelV4({
      doGenerate: ({ toolChoice }) => {
        call += 1;
        const answering = toolChoice?.type === "none";
        return Promise.resolve({
          content: answering
            ? [{ type: "text", text: "Here is what I found." }]
            : [
                {
                  type: "tool-call",
                  toolCallId: `call-${call}`,
                  toolName: "listPosts",
                  input: "{}",
                },
              ],
          finishReason: { unified: answering ? "stop" : "tool-calls", raw: undefined },
          usage: {
            inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
            outputTokens: { total: 1, text: 1, reasoning: 0 },
          },
          warnings: [],
        });
      },
    }),
  };
});

vi.mock("@openrouter/ai-sdk-provider", () => ({ openrouter: { chat: () => languageModel } }));
vi.mock("@/lib/ask", () => ({
  getSystemPrompt: () => Promise.resolve("Answer from the available facts."),
}));
vi.mock("@/lib/ask-tools", async () => {
  const { tool } = await import("ai");
  const { z } = await import("zod");
  return {
    askTools: {
      listPosts: tool({ inputSchema: z.object({}), execute: () => Promise.resolve([]) }),
    },
  };
});

it("answers on the last step when the model keeps requesting tools", async () => {
  const result = await askAgent.generate({ prompt: "What has Lucas written?" });
  expect(result.text).toContain("Here is what I found.");
  expect(result.steps).toHaveLength(5);
  expect(result.finalStep.finishReason).toBe("stop");
  expect(languageModel.doGenerateCalls.at(-1)?.toolChoice).toEqual({ type: "none" });
});
