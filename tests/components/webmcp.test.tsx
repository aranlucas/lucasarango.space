import { StrictMode } from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { WebMCP as BrowserWebMCP } from "usewebmcp";
import { WebMCP } from "@/components/webmcp";

afterEach(() => {
  Reflect.deleteProperty(document, "modelContext");
  Reflect.deleteProperty(navigator, "modelContext");
  vi.restoreAllMocks();
});

it("does nothing in browsers without WebMCP", () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  render(<WebMCP />);
  expect(fetch).not.toHaveBeenCalled();
});

it("registers document tools and aborts registration on Strict Mode cleanup", () => {
  const registerTool = vi.fn<BrowserWebMCP.ModelContext["registerTool"]>().mockResolvedValue();

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
  const registerTool = vi.fn<BrowserWebMCP.ModelContext["registerTool"]>().mockResolvedValue();

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
  ).resolves.toEqual({ body: "Markdown" });
  expect(fetch.mock.calls[0]?.[0]).toBe("/api/webmcp?tool=readPost&slug=hello");
  expect(fetch.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  await expect(
    readPost.execute({ slug: "../private" }, { signal: new AbortController().signal }),
  ).rejects.toThrow();
  unmount();
});

it("handles asynchronous registration failure without breaking the page", async () => {
  const registerTool = vi.fn().mockRejectedValue(new Error("Disabled by browser"));
  Object.defineProperty(document, "modelContext", { configurable: true, value: { registerTool } });
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  const { unmount } = render(<WebMCP />);
  await waitFor(() => {
    expect(warning).toHaveBeenCalledTimes(3);
  });
  unmount();
});
