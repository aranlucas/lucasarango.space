import {
  parseJsonEventStream,
  simulateReadableStream,
  type TimeoutConfiguration,
  type UIMessageChunk,
  uiMessageChunkSchema,
} from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { chatTools, createAskAgent } from "@/lib/ai/agent";

import { createChatHandler } from "@/app/(chat)/api/chat/handler";

type DoStream = MockLanguageModelV4["doStream"];

type StreamResult = Awaited<ReturnType<DoStream>>;

type StreamPart = StreamResult["stream"] extends ReadableStream<infer Part> ? Part : never;

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

/** Calls `fail` with the abort reason once the provider call is aborted, as fetch does. */
function onAbort(signal: AbortSignal | undefined, fail: (reason: Error) => void) {
  const abort = () => {
    const reason: unknown = signal?.reason;

    fail(reason instanceof Error ? reason : new Error("aborted"));
  };

  if (signal?.aborted === true) {
    abort();

    return;
  }

  signal?.addEventListener("abort", abort, { once: true });
}

/** A provider that never answers; its call only ends when it's aborted. */
const stalled: DoStream = ({ abortSignal }) =>
  new Promise((_resolve, reject) => {
    onAbort(abortSignal, reject);
  });

/** A provider that starts answering with this text, then goes quiet until it's aborted. */
function stallingAfter(text: string): DoStream {
  return ({ abortSignal }) =>
    Promise.resolve({
      stream: new ReadableStream<StreamPart>({
        start(controller) {
          controller.enqueue({ type: "text-start", id: "answer" });
          controller.enqueue({ type: "text-delta", id: "answer", delta: text });
          onAbort(abortSignal, (reason) => {
            controller.error(reason);
          });
        },
      }),
    });
}

let model: MockLanguageModelV4;

let POST: ReturnType<typeof createChatHandler>;

/** The route with the real Ask agent on a mock model, so no provider is called. */
function serve(doStream: DoStream, timeout?: TimeoutConfiguration<typeof chatTools>) {
  model = new MockLanguageModelV4({ doStream });
  POST = createChatHandler(
    createAskAgent({
      model,
      tools: chatTools,
      loadInstructions: () => Promise.resolve("Answer from the available facts."),
      timeout,
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

/** The chunks the reader's browser receives. */
async function chunks(response: Response) {
  if (!response.body) {
    throw new Error("Expected a chat response stream.");
  }

  const received: UIMessageChunk[] = [];

  await parseJsonEventStream({ stream: response.body, schema: uiMessageChunkSchema }).pipeTo(
    new WritableStream({
      write(chunk) {
        if (!chunk.success) {
          throw chunk.error;
        }

        received.push(chunk.value);
      },
    }),
  );

  return received;
}

/** The text deltas the reader's browser receives. */
async function deltas(response: Response) {
  return (await chunks(response)).flatMap((chunk) =>
    chunk.type === "text-delta" ? [chunk.delta] : [],
  );
}

const chunkTypes = (received: UIMessageChunk[]) => received.map((chunk) => chunk.type);

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

it("tells the reader to try again when the provider never answers in time", async () => {
  serve(stalled, { totalMs: 50 });

  const received = await chunks(await POST(request([question("Hello")])));

  expect(received).toContainEqual({
    type: "error",
    errorText: "The assistant took too long to answer.",
  });
  expect(chunkTypes(received)).not.toContain("abort");
});

it("keeps the words already sent when an answer stalls, then reports the stall", async () => {
  serve(stallingAfter("Lucas builds "), { chunkMs: 50 });

  const received = await chunks(await POST(request([question("What does Lucas do?")])));

  expect(received.flatMap((chunk) => (chunk.type === "text-delta" ? [chunk.delta] : []))).toEqual([
    "Lucas ",
    "builds ",
  ]);
  expect(received.at(-1)).toEqual({
    type: "error",
    errorText: "The assistant took too long to answer.",
  });
});

it("treats the reader's Stop as a stop, not a failure", async () => {
  const reader = new AbortController();

  serve(
    (options) => {
      reader.abort();

      return stalled(options);
    },
    { totalMs: 5000 },
  );

  const types = chunkTypes(await chunks(await POST(request([question("Hello")], reader.signal))));

  expect(types).toContain("abort");
  expect(types).not.toContain("error");
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
