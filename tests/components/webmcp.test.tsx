import { StrictMode } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { WebMCPOptions, WebMCPToolResponse } from "use-webmcp-tool";
import { WebMCP } from "@/components/webmcp";

type RegisteredTool = WebMCPOptions<{ slug: string }, WebMCPToolResponse>;

type RegisterTool = (tool: RegisteredTool, options: { signal: AbortSignal }) => Promise<void>;

const posts = [
  {
    slug: "hello",
    title: "Hello",
    date: "2026-10-01",
    summary: "A post",
    url: "https://lucasarango.space/blog/hello",
  },
];

function install(registerTool = vi.fn<RegisterTool>().mockResolvedValue()) {
  Object.defineProperty(document, "modelContext", { configurable: true, value: { registerTool } });

  return registerTool;
}

async function mount() {
  const registerTool = install();
  const view = render(<WebMCP posts={posts} />);
  await act(async () => {});

  return { registerTool, ...view };
}

afterEach(() => {
  Reflect.deleteProperty(document, "modelContext");
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it("does nothing in browsers without WebMCP", () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  render(<WebMCP posts={posts} />);
  expect(fetch).not.toHaveBeenCalled();
});

it("handles async registration aborted during Strict Mode cleanup", async () => {
  const registerTool = install(
    vi.fn<RegisterTool>(
      (_tool, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => {
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
          setTimeout(resolve, 0);
        }),
    ),
  );

  const { unmount } = render(
    <StrictMode>
      <WebMCP posts={posts} />
    </StrictMode>,
  );

  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
  });
  expect(registerTool).toHaveBeenCalledTimes(6);
  expect(registerTool.mock.calls[0]?.[1].signal.aborted).toBe(true);
  expect(registerTool.mock.calls[3]?.[1].signal.aborted).toBe(false);
  unmount();
});

it("handles rejected registration promises", async () => {
  const registerTool = install(
    vi.fn<RegisterTool>().mockRejectedValue(new DOMException("Disabled", "NotAllowedError")),
  );

  render(<WebMCP posts={posts} />);
  await act(async () => {});
  expect(registerTool).toHaveBeenCalledTimes(3);
});

it("lists metadata without a network request and rejects unknown slugs", async () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  const { registerTool } = await mount();
  const list = registerTool.mock.calls[1]?.[0];
  expect(await list.execute({ slug: "" }, { signal: new AbortController().signal })).toEqual({
    content: [{ type: "text", text: JSON.stringify(posts) }],
  });
  const read = registerTool.mock.calls[2]?.[0];
  expect(
    await read.execute({ slug: "draft" }, { signal: new AbortController().signal }),
  ).toMatchObject({ isError: true });
  expect(
    await read.execute({ slug: "../private" }, { signal: new AbortController().signal }),
  ).toMatchObject({ isError: true });
  expect(fetch).not.toHaveBeenCalled();
});

it("reads existing HTML on demand as Markdown and forwards cancellation", async () => {
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(
        '<main><article class="reading-article"><h1>Hello</h1><p>Full article.</p><nav>Other posts</nav></article></main>',
      ),
    );

  const { registerTool } = await mount();
  expect(fetch).not.toHaveBeenCalled();
  const read = registerTool.mock.calls[2]?.[0];
  const signal = new AbortController().signal;
  const result = await read.execute({ slug: "hello" }, { signal });
  expect(result.content[0].text).toContain("# Hello\n\nFull article.");
  expect(result.content[0].text).not.toContain("Other posts");
  expect(fetch).toHaveBeenCalledWith("/blog/hello", {
    signal,
    headers: { Accept: "text/markdown" },
  });
});

it("gives résumé failures relevant recovery advice", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 503 }));
  const { registerTool } = await mount();
  const resume = registerTool.mock.calls[0]?.[0];
  const result = await resume.execute({ slug: "" }, { signal: new AbortController().signal });
  expect(result.isError).toBe(true);
  expect(result.content[0].text).toContain("/resume (HTTP 503)");
  expect(result.content[0].text).not.toContain("listPosts");
});

it("registers tools when the API arrives after mount", async () => {
  vi.useFakeTimers();
  render(<WebMCP posts={posts} />);
  const registerTool = install();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
  expect(registerTool).toHaveBeenCalledTimes(3);
});
