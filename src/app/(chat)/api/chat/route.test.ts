import type { TextStreamPart, UIMessageChunk } from "ai";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { chatTools } from "@/lib/ai/agent";

import { createChatHandler, type ChatAgent } from "./handler";

const stream = vi.fn<ChatAgent["stream"]>();

const POST = createChatHandler({ stream });

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

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  stream.mockReset();
  stream.mockResolvedValue({
    stream: new ReadableStream({
      start: (controller) => {
        controller.close();
      },
    }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
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
  expect(stream).toHaveBeenCalledOnce();
  expect(stream.mock.calls[0]?.[0].messages).toEqual([
    { role: "user", content: [{ type: "text", text: "List the posts" }] },
    { role: "user", content: [{ type: "text", text: "What experience does Lucas have?" }] },
  ]);
});

it("re-chunks a burst of answer text into words", async () => {
  // Like streamText, the fake agent runs its output through the route's transform.
  stream.mockImplementation(({ experimental_transform }) => {
    const parts: TextStreamPart<typeof chatTools>[] = [
      { type: "text-start", id: "answer" },
      { type: "text-delta", id: "answer", text: "Lucas builds developer tools." },
      { type: "text-end", id: "answer" },
    ];

    const burst = new ReadableStream<TextStreamPart<typeof chatTools>>({
      start: (controller) => {
        for (const part of parts) controller.enqueue(part);
        controller.close();
      },
    });

    return Promise.resolve({
      stream: burst.pipeThrough(experimental_transform({ tools: chatTools, stopStream: () => {} })),
    });
  });

  const body = await (await POST(request([question("What does Lucas do?")]))).text();

  // SAFETY: every `data: {` line of a UI message stream response is one JSON-encoded UIMessageChunk.
  const deltas = body
    .split("\n")
    .flatMap((line) =>
      line.startsWith("data: {") ? [JSON.parse(line.slice(6)) as UIMessageChunk] : [],
    )
    .flatMap((chunk) => (chunk.type === "text-delta" ? [chunk.delta] : []));

  expect(deltas).toEqual(["Lucas ", "builds ", "developer ", "tools."]);
});

it("hides provider failures that happen before the first chunk", async () => {
  stream.mockResolvedValue({
    stream: new ReadableStream({
      start: (controller) => {
        controller.error(new Error("private provider failure"));
      },
    }),
  });
  const response = await POST(request([question("Hello")]));
  const body = await response.text();
  expect(body).toContain("The assistant is unavailable right now.");
  expect(body).not.toContain("private provider failure");
});

it("does not start a generation for an already aborted request", async () => {
  const controller = new AbortController();
  controller.abort();
  const response = await POST(request([question("Hello")], controller.signal));
  await response.text();
  expect(stream).not.toHaveBeenCalled();
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
  expect(stream).not.toHaveBeenCalled();
});
