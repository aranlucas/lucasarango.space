import { render } from "@testing-library/react";
import type { WebMCPToolResponse } from "use-webmcp-tool";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { postSlug, SiteAgentTools } from "./site-agent-tools";

type ToolArgs = { post?: string };

type Tool = {
  name: string;
  annotations?: WebMCP.ToolAnnotations;
  execute: (args: ToolArgs, options: { signal: AbortSignal }) => Promise<WebMCPToolResponse>;
};

const tools = new Map<string, Tool>();

const fetchMock = vi.fn<typeof fetch>();

// Each Markdown route the tools read, answering with a body that names it.
const MARKDOWN_ROUTES = new Map<unknown, string>(
  ["/blog/sitemap.md", "/blog/hello-world.md", "/resume.md"].map((path) => [
    path,
    `markdown for ${path}`,
  ]),
);

beforeEach(() => {
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: {
      registerTool: (tool: Tool, { signal }: { signal: AbortSignal }) => {
        tools.set(tool.name, tool);
        signal.addEventListener("abort", () => {
          tools.delete(tool.name);
        });

        return Promise.resolve();
      },
    },
  });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockImplementation((path) => {
    const body = MARKDOWN_ROUTES.get(path);

    return Promise.resolve(
      body === undefined ? new Response("Post not found.\n", { status: 404 }) : new Response(body),
    );
  });
});

afterEach(() => {
  Reflect.deleteProperty(document, "modelContext");
  vi.unstubAllGlobals();
  fetchMock.mockReset();
  window.history.replaceState(null, "", "/");
});

function call(name: string, args: ToolArgs = {}) {
  const tool = tools.get(name);

  if (tool === undefined) throw new Error(`${name} is not registered`);

  return tool.execute(args, { signal: new AbortController().signal });
}

test("postSlug accepts slugs, paths, and URLs but never a path outside the blog", () => {
  expect(postSlug("hello-world")).toBe("hello-world");
  expect(postSlug("/blog/hello-world")).toBe("hello-world");
  expect(postSlug("/blog/hello-world.md")).toBe("hello-world");
  expect(postSlug("https://lucasarango.space/blog/hello-world/")).toBe("hello-world");
  expect(postSlug("../api/chat")).toBeUndefined();
  expect(postSlug("/resume")).toBeUndefined();
});

test("registers read-only tools while mounted", () => {
  const { unmount } = render(<SiteAgentTools />);

  expect([...tools.keys()]).toEqual(["list_posts", "read_post", "getResume"]);

  for (const tool of tools.values()) expect(tool.annotations).toEqual({ readOnlyHint: true });

  unmount();
  expect(tools.size).toBe(0);
});

test("list_posts returns the Markdown blog index", async () => {
  render(<SiteAgentTools />);

  expect(await call("list_posts")).toEqual({
    content: [{ type: "text", text: "markdown for /blog/sitemap.md" }],
  });
});

test("getResume returns the Markdown résumé", async () => {
  render(<SiteAgentTools />);

  expect(await call("getResume")).toEqual({
    content: [{ type: "text", text: "markdown for /resume.md" }],
  });
});

test("read_post reads a named post, or the post open in this tab", async () => {
  render(<SiteAgentTools />);
  const expected = { content: [{ type: "text", text: "markdown for /blog/hello-world.md" }] };

  expect(await call("read_post", { post: "https://lucasarango.space/blog/hello-world" })).toEqual(
    expected,
  );

  window.history.replaceState(null, "", "/blog/hello-world");
  expect(await call("read_post")).toEqual(expected);
});

test("read_post reports missing posts as errors the agent can act on", async () => {
  render(<SiteAgentTools />);

  expect(await call("read_post", { post: "nope" })).toEqual({
    content: [{ type: "text", text: 'No post at "nope". Call list_posts for valid posts.' }],
    isError: true,
  });
  expect(await call("read_post")).toEqual({
    content: [
      { type: "text", text: "This tab isn't showing a post. Pass a post from list_posts." },
    ],
    isError: true,
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
