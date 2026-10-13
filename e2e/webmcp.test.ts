// Calls the site's WebMCP tools through Chrome's own `document.modelContext`,
// the way an in-browser agent does, against the production build.

import { type Browser, chromium, type Page } from "playwright-core";
import { afterAll, afterEach, beforeAll, beforeEach, expect, inject, test } from "vitest";
import { z } from "zod";

import type { ListPostsArgs, ReadPostArgs } from "@/lib/site-agent-inputs";

interface ChromeModelContext extends WebMCP.ModelContext {
  // Chrome 154 takes JSON text; the current spec takes an object.
  executeTool(
    tool: WebMCP.RegisteredTool,
    input: Parameters<WebMCP.ModelContext["executeTool"]>[1] | string,
  ): Promise<string>;
}

const ToolResult = z.object({
  content: z.array(z.object({ type: z.literal("text"), text: z.string() })),
  isError: z.boolean().optional(),
});

type ToolArgs = ListPostsArgs & ReadPostArgs;

const TOOLS = ["get_resume", "list_posts", "list_projects", "read_post"];

let browser: Browser;

let page: Page;

beforeAll(async () => {
  browser = await chromium.launch({ channel: "chrome", args: ["--enable-features=WebMCPTesting"] });
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage({ baseURL: inject("baseURL") });
});

afterEach(async () => {
  await page.close();
});

/** Opens `path` and waits for the site's tools to register. */
async function open(path: string) {
  await page.goto(path);
  await page.evaluate(async (count) => {
    const context: ChromeModelContext | undefined = document.modelContext;

    if (context === undefined) {
      throw new Error("document.modelContext is missing. Is Chrome's WebMCPTesting feature on?");
    }

    const deadline = Date.now() + 10_000;

    const registered = async (): Promise<void> => {
      if ((await context.getTools()).length >= count) {
        return;
      }

      if (Date.now() > deadline) {
        throw new Error(`Fewer than ${count} tools registered in 10s`);
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      await registered();
    };

    await registered();
  }, TOOLS.length);
}

async function call(name: string, args: ToolArgs = {}) {
  const raw = await page.evaluate(
    async ({ tool: toolName, input }) => {
      const context: ChromeModelContext | undefined = document.modelContext;
      const tool = (await context?.getTools())?.find((candidate) => candidate.name === toolName);

      if (context === undefined || tool === undefined) {
        throw new Error(`${toolName} is missing`);
      }

      return context
        .executeTool(tool, input)
        .catch(() => context.executeTool(tool, JSON.stringify(input)));
    },
    { tool: name, input: args },
  );

  return ToolResult.parse(JSON.parse(raw ?? "null"));
}

const text = async (name: string, args?: ToolArgs) => {
  const result = await call(name, args);

  expect(result.isError).toBeUndefined();

  return result.content.map((block) => block.text).join("");
};

/** The first post in `list_posts`, by its page path. */
async function firstPostPath() {
  const path = /\]\(https:\/\/lucasarango\.space(\/blog\/[\w-]+)\)/u.exec(
    await text("list_posts"),
  )?.[1];

  if (path === undefined) {
    throw new Error("list_posts returned no post links");
  }

  return path;
}

test("Chrome registers every tool as read-only", async () => {
  await open("/");

  const readOnly = await page.evaluate(async () =>
    (await document.modelContext?.getTools())?.map((tool) => [
      tool.name,
      tool.annotations?.readOnlyHint ?? false,
    ]),
  );

  expect(Object.fromEntries(readOnly ?? [])).toEqual({
    get_resume: true,
    list_posts: true,
    list_projects: true,
    read_post: true,
  });
});

test("list_posts links post pages, with their Markdown alongside", async () => {
  await open("/");

  expect(await text("list_posts")).toMatch(
    /^- \[.+\]\(https:\/\/lucasarango\.space\/blog\/[\w-]+\) \(\d{4}-\d{2}-\d{2}, \[Markdown\]\(https:\/\/lucasarango\.space\/blog\/[\w-]+\.md\)\): /mu,
  );
});

test("read_post reads the post open in the tab, and rejects a missing one", async () => {
  await open("/");
  const path = await firstPostPath();

  await open(path);
  expect(await text("read_post")).toContain(`url: ${path}\n`);

  expect(await call("read_post", { post: "nope" })).toEqual({
    content: [{ type: "text", text: 'No post at "nope". Call list_posts for valid posts.' }],
    isError: true,
  });
});

test("get_resume returns the résumé as Markdown", async () => {
  await open("/");

  expect(await text("get_resume")).toMatch(/^---\ntitle: ".+ résumé"\n[\s\S]*\n## Experience\n/u);
});

test("list_posts searches body text, returns excerpts, and handles no matches", async () => {
  await open("/");
  const results = await text("list_posts", { query: "Kroger" });
  expect(results).toContain("Excerpt:");
  expect(results).toContain("https://lucasarango.space/blog/");
  expect(results.toLowerCase()).toContain("kroger");
  expect(await text("list_posts", { query: "zzzznonexistentkeyword" })).toContain(
    "No matching posts.",
  );
  expect(await text("list_posts", { query: "   " })).toBe(await text("list_posts"));
});

test("list_posts ranks a project question and honors result limits", async () => {
  await open("/");

  const results = await text("list_posts", {
    query: "How does Lucas practice system design with an AI whiteboard?",
    limit: 1,
  });

  expect(results).toContain("/blog/practicing-system-design-with-an-ai-on-the-whiteboard)");
  expect(results).toContain("Showing 1 of ");
  expect(results.match(/^- \[/gmu)).toHaveLength(1);
  const oldest = await text("list_posts", { sort: "oldest", limit: 1 });
  expect(oldest).toContain("/blog/a-website-for-every-adventure)");
});

test("list_posts rejects malformed agent input with a field-specific error", async () => {
  await open("/");

  const raw = await page.evaluate(async () => {
    const context: ChromeModelContext | undefined = document.modelContext;
    const tool = (await context?.getTools())?.find((candidate) => candidate.name === "list_posts");

    if (context === undefined || tool === undefined) {
      throw new Error("list_posts is missing");
    }

    return context
      .executeTool(tool, { query: 42 })
      .catch(() => context.executeTool(tool, JSON.stringify({ query: 42 })));
  });

  const result = ToolResult.parse(JSON.parse(raw ?? "null"));

  expect(result.isError).toBe(true);
  expect(result.content[0]?.text).toContain("Invalid list_posts input: query");
  expect(result.content[0]?.text).not.toContain("trim is not a function");
});

test("list_projects returns the home page's projects with shareable links", async () => {
  await open("/");
  const projects = await text("list_projects");
  expect(projects).toContain("Grocery shopping MCP");
  expect(projects).toContain("System Design Companion");
  expect(projects).toContain("Lucas Plugins");
  expect(projects).toContain("https://github.com/aranlucas/ai-shopping-mcp");
  expect(projects).toContain("https://lucasarango.space/blog/");
});
