import { act, render } from "@testing-library/react";
import { useSyncExternalStore } from "react";
import type { WebMCPToolResponse } from "use-webmcp-tool";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { postSlug, useSiteAgentTools } from "./site-agent-tools";

// A client-side navigation: `push` moves `location` and re-renders the tools
// with the new pathname, as Next's router does.
const NAVIGATE = "test-navigate";

const navigation = {
  push: (path: string) => {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new Event(NAVIGATE));
  },
};

function subscribe(onNavigate: () => void) {
  window.addEventListener(NAVIGATE, onNavigate);

  return () => {
    window.removeEventListener(NAVIGATE, onNavigate);
  };
}

function TestTools() {
  const pathname = useSyncExternalStore(subscribe, () => window.location.pathname);

  useSiteAgentTools({ pathname, push: navigation.push });

  return null;
}

type ToolArgs = { post?: string };

type Tool = {
  name: string;
  annotations?: WebMCP.ToolAnnotations;
  execute: (args: ToolArgs, options: { signal: AbortSignal }) => Promise<WebMCPToolResponse>;
};

const tools = new Map<string, Tool>();

const fetchMock = vi.fn<typeof fetch>();

const POST = "---\ntitle: Hello world\n---\n\n# Hello world\n\nBody.\n";

const MARKDOWN_ROUTES = new Map<unknown, string>([
  ["/blog/sitemap.md", "the blog index"],
  ["/blog/hello-world.md", POST],
  ["/resume.md", "the résumé"],
]);

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
  vi.spyOn(navigation, "push");
});

afterEach(() => {
  Reflect.deleteProperty(document, "modelContext");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  fetchMock.mockReset();
  window.history.replaceState(null, "", "/");
});

function call(name: string, args: ToolArgs = {}) {
  const tool = tools.get(name);

  if (tool === undefined) throw new Error(`${name} is not registered`);

  return act(() => tool.execute(args, { signal: new AbortController().signal }));
}

const text = (value: string) => ({ content: [{ type: "text", text: value }] });

const error = (value: string) => ({ ...text(value), isError: true });

test("postSlug accepts slugs, paths, and URLs but never a path outside the blog", () => {
  expect(postSlug("hello-world")).toBe("hello-world");
  expect(postSlug("/blog/hello-world")).toBe("hello-world");
  expect(postSlug("/blog/hello-world.md")).toBe("hello-world");
  expect(postSlug("https://lucasarango.space/blog/hello-world/")).toBe("hello-world");
  expect(postSlug("../api/chat")).toBeUndefined();
  expect(postSlug("/resume")).toBeUndefined();
});

test("registers the tools while mounted, marking only the readers read-only", () => {
  const { unmount } = render(<TestTools />);

  expect(Object.fromEntries([...tools].map(([name, tool]) => [name, tool.annotations]))).toEqual({
    list_posts: { readOnlyHint: true },
    read_post: { readOnlyHint: true },
    open_post: undefined,
    get_resume: { readOnlyHint: true },
  });

  unmount();
  expect(tools.size).toBe(0);
});

test("list_posts and get_resume return their Markdown routes", async () => {
  render(<TestTools />);

  expect(await call("list_posts")).toEqual(text("the blog index"));
  expect(await call("get_resume")).toEqual(text("the résumé"));
});

test("read_post reads a named post, or the post open in this tab", async () => {
  render(<TestTools />);

  expect(await call("read_post", { post: "https://lucasarango.space/blog/hello-world" })).toEqual(
    text(POST),
  );

  window.history.replaceState(null, "", "/blog/hello-world");
  expect(await call("read_post")).toEqual(text(POST));
});

test("read_post reports missing posts as errors the agent can act on", async () => {
  render(<TestTools />);

  expect(await call("read_post", { post: "nope" })).toEqual(
    error('No post at "nope". Call list_posts for valid posts.'),
  );
  expect(await call("read_post")).toEqual(
    error("This tab isn't showing a post. Pass a post from list_posts."),
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("open_post navigates to the post and answers once it's on screen", async () => {
  render(<TestTools />);

  expect(await call("open_post", { post: "/blog/hello-world.md" })).toEqual(
    text('Opened "Hello world" at /blog/hello-world.'),
  );
  expect(navigation.push).toHaveBeenCalledWith("/blog/hello-world");
  expect(window.location.pathname).toBe("/blog/hello-world");

  // Already there: nothing to navigate.
  expect(await call("open_post", { post: "hello-world" })).toEqual(
    text('Opened "Hello world" at /blog/hello-world.'),
  );
  expect(navigation.push).toHaveBeenCalledTimes(1);
});

test("open_post never navigates to a missing post", async () => {
  render(<TestTools />);

  expect(await call("open_post", { post: "nope" })).toEqual(
    error('No post at "nope". Call list_posts for valid posts.'),
  );
  expect(navigation.push).not.toHaveBeenCalled();
});
