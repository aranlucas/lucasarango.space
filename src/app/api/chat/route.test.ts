import type { ModelMessage } from "ai";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { POST } from "./route";

const { stream } = vi.hoisted(() => ({
  stream: vi.fn<(options: { messages: ModelMessage[] }) => Promise<{ stream: ReadableStream }>>(),
}));

vi.mock("@/lib/ask-agent", () => ({
  askAgent: { stream },
  env: () => "test-key",
}));

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
  vi.useFakeTimers();
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
  vi.useRealTimers();
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
  expect(vi.getTimerCount()).toBe(0);
});

it("cleans up waiting when the provider stream fails before emitting a chunk", async () => {
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
  expect(vi.getTimerCount()).toBe(0);
});

it("does not start a generation for an already aborted request", async () => {
  const controller = new AbortController();
  controller.abort();
  const response = await POST(request([question("Hello")], controller.signal));
  await response.text();
  expect(stream).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
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
  expect(stream).not.toHaveBeenCalled();
});
