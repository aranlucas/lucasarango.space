import { expect, it } from "vitest";
import { MockLanguageModelV4 } from "ai/test";
import { askTools } from "@/lib/ask-tools";
import { createAskAgent } from "@/lib/ask-agent";

const { languageModel } = (() => {
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
})();

const askAgent = createAskAgent({
  model: languageModel,
  loadInstructions: () => Promise.resolve("Answer from the available facts."),
  tools: {
    listPosts: { ...askTools.listPosts, execute: () => Promise.resolve([]) },
    readPost: {
      ...askTools.readPost,
      execute: () => Promise.resolve({ error: "No post in this synthetic fixture." }),
    },
  },
});

it("answers on the last step when the model keeps requesting tools", async () => {
  const result = await askAgent.generate({ prompt: "What has Lucas written?" });
  expect(result.text).toContain("Here is what I found.");
  expect(result.steps).toHaveLength(5);
  expect(result.finalStep.finishReason).toBe("stop");
  expect(languageModel.doGenerateCalls.at(-1)?.toolChoice).toEqual({ type: "none" });
});
