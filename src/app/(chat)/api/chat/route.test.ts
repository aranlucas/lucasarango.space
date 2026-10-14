import { parseJsonEventStream, simulateReadableStream, uiMessageChunkSchema } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { chatTools, createAskAgent } from "@/lib/ai/agent";

import { createChatHandler } from "./handler";

type StreamResult = Awaited<ReturnType<MockLanguageModelV4["doStream"]>>;

/** A model that answers with these text deltas, the way a provider streams them. */
function answering(texts: string[]): StreamResult {
  return {
    stream: simulateReadableStream({
      chunks: [
        { type: "text-start", id: "answer" },
        ...texts.map((delta) => ({ type: "text-delta" as const, id: "answer", delta })),
        { type: "text-end", id: "answer" },
        {
          type: "finish",
          finishReason: { unified: "stop", raw: undefined },
          usage: {
            inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
            outputTokens: { total: 1, text: 1, reasoning: undefined },
          },
        },
      ],
    }),
  };
}

let model: MockLanguageModelV4;

let POST: ReturnType<typeof createChatHandler>;

/** The route with the real Ask agent on a mock model, so no provider is called. */
function serve(doStream: MockLanguageModelV4["doStream"]) {
  model = new MockLanguageModelV4({ doStream });
  POST = createChatHandler(
    createAskAgent({
      model,
      tools: chatTools,
      loadInstructions: () => Promise.resolve("Answer from the available facts."),
    }),
  );
}

const question = (text: string) => ({
  id: "question",
  role: "user",
  parts: [{ type: "text", text }],
});

function request(messages: unknown[], signal?: AbortSignal) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
    headers: { "Content-Type": "application/json" },
    signal,
  });
}

/** The text deltas the reader's browser receives. */
async function deltas(response: Response) {
  if (!response.body) {
    throw new Error("Expected a chat response stream.");
  }

  const textDeltas: string[] = [];

  await parseJsonEventStream({ stream: response.body, schema: uiMessageChunkSchema }).pipeTo(
    new WritableStream({
      write(chunk) {
        if (!chunk.success) {
          throw chunk.error;
        }

        if (chunk.value.type === "text-delta") {
          textDeltas.push(chunk.value.delta);
        }
      },
    }),
  );

  return textDeltas;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  serve(() => Promise.resolve(answering(["Hello."])));
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("re-chunks a burst of answer text into words", async () => {
  serve(() => Promise.resolve(answering(["Lucas builds developer tools."])));

  const response = await POST(request([question("What does Lucas do?")]));

  expect(await deltas(response)).toEqual(["Lucas ", "builds ", "developer ", "tools."]);
});

it("accepts a follow-up after a tool call was stopped before its result", async () => {
  const response = await POST(
    request([
      question("List the posts"),
      {
        id: "interrupted",
        role: "assistant",
        parts: [
          { type: "tool-listPosts", toolCallId: "call", state: "input-available", input: {} },
        ],
      },
      { ...question("What experience does Lucas have?"), id: "follow-up" },
    ]),
  );

  await response.text();
  expect(response.status).toBe(200);
  expect(model.doStreamCalls).toHaveLength(1);
  expect(model.doStreamCalls[0]?.prompt.filter((message) => message.role !== "system")).toEqual([
    { role: "user", content: [{ type: "text", text: "List the posts" }] },
    { role: "user", content: [{ type: "text", text: "What experience does Lucas have?" }] },
  ]);
});

it("hides provider failures that happen before the first chunk", async () => {
  serve(() => Promise.reject(new Error("private provider failure")));

  const body = await (await POST(request([question("Hello")]))).text();

  expect(body).toContain("The assistant is unavailable right now.");
  expect(body).not.toContain("private provider failure");
});

it("does not start a generation for an already aborted request", async () => {
  const controller = new AbortController();

  controller.abort();
  await (await POST(request([question("Hello")], controller.signal))).text();
  expect(model.doStreamCalls).toHaveLength(0);
});

it.each([
  { parts: [] },
  { parts: [{ type: "text", text: "   " }] },
  {
    parts: [
      { type: "text", text: "a".repeat(600) },
      { type: "text", text: "b".repeat(600) },
    ],
  },
])("rejects an empty or oversized question: %j", async ({ parts }) => {
  const response = await POST(request([{ ...question(""), parts }]));
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ code: "bad_request:chat" });
  expect(model.doStreamCalls).toHaveLength(0);
});
