import { StrictMode } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { WebMCPOptions, WebMCPToolResponse } from "use-webmcp-tool";
import { WebMCP } from "@/components/webmcp";

type RegisteredTool = WebMCPOptions<{ slug: string }, WebMCPToolResponse>;

type RegisterTool = (tool: RegisteredTool, options: { signal: AbortSignal }) => void;

afterEach(() => {
  Reflect.deleteProperty(document, "modelContext");
  Reflect.deleteProperty(navigator, "modelContext");
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it("does nothing in browsers without WebMCP", () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  render(<WebMCP />);
  expect(fetch).not.toHaveBeenCalled();
});

it("registers document tools and aborts registration on Strict Mode cleanup", () => {
  const registerTool = vi.fn<RegisterTool>();

  Object.defineProperty(document, "modelContext", { configurable: true, value: { registerTool } });

  const { unmount } = render(
    <StrictMode>
      <WebMCP />
    </StrictMode>,
  );

  expect(registerTool.mock.calls.map(([tool]) => tool.name)).toEqual([
    "getResume",
    "listPosts",
    "readPost",
    "getResume",
    "listPosts",
    "readPost",
  ]);
  expect(registerTool.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  expect(registerTool.mock.calls[3]?.[1]?.signal?.aborted).toBe(false);
  unmount();
  expect(registerTool.mock.calls[3]?.[1]?.signal?.aborted).toBe(true);
});

it("fetches content on demand and validates post inputs", async () => {
  const registerTool = vi.fn<RegisterTool>();

  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: { registerTool },
  });

  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(Response.json({ body: "Markdown" }));

  const { unmount } = render(<WebMCP />);
  expect(fetch).not.toHaveBeenCalled();
  const readPost = registerTool.mock.calls[2]?.[0];
  await expect(
    readPost.execute({ slug: "hello" }, { signal: new AbortController().signal }),
  ).resolves.toEqual({ content: [{ type: "text", text: '{"body":"Markdown"}' }] });
  expect(fetch.mock.calls[0]?.[0]).toBe("/api/webmcp?tool=readPost&slug=hello");
  expect(fetch.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);

  const invalid = await readPost.execute(
    { slug: "../private" },
    { signal: new AbortController().signal },
  );

  expect(invalid.isError).toBe(true);
  expect(fetch).toHaveBeenCalledOnce();
  unmount();
});

it("handles synchronous registration failure without breaking the page", () => {
  const registerTool = vi.fn<RegisterTool>(() => {
    throw new Error("Disabled by browser");
  });

  Object.defineProperty(document, "modelContext", { configurable: true, value: { registerTool } });
  const { unmount } = render(<WebMCP />);
  expect(registerTool).toHaveBeenCalledTimes(3);
  unmount();
});

it("registers tools when the browser API is injected after mount", () => {
  vi.useFakeTimers();
  const { unmount } = render(<WebMCP />);
  const registerTool = vi.fn<RegisterTool>();
  Object.defineProperty(document, "modelContext", { configurable: true, value: { registerTool } });

  act(() => {
    vi.advanceTimersByTime(500);
  });

  expect(registerTool.mock.calls.map(([tool]) => tool.name)).toEqual([
    "getResume",
    "listPosts",
    "readPost",
  ]);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("returns an MCP error result when a content request fails", async () => {
  const registerTool = vi.fn<RegisterTool>();
  Object.defineProperty(document, "modelContext", { configurable: true, value: { registerTool } });
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json({ error: "Unavailable" }, { status: 503 }),
  );
  const { unmount } = render(<WebMCP />);
  const resumeTool = registerTool.mock.calls[0]?.[0];
  const result = await resumeTool.execute({ slug: "" }, { signal: new AbortController().signal });

  expect(result.isError).toBe(true);
  expect(result.content[0]?.text).toContain("HTTP 503");
  unmount();
});
