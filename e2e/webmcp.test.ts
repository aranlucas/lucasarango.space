// Calls the site's WebMCP tools through Chrome's own `document.modelContext`,
// the way an in-browser agent does, against the production build.

import { type Browser, chromium, type Page } from "playwright-core";
import { afterAll, afterEach, beforeAll, beforeEach, expect, inject, test } from "vitest";
import { z } from "zod";

declare global {
  namespace WebMCP {
    interface ModelContext {
      // Chrome 154 takes the input as JSON text; the spec now takes an object.
      executeTool(tool: RegisteredTool, input: string): Promise<string>;
    }
  }
}

const ToolResult = z.object({
  content: z.array(z.object({ type: z.literal("text"), text: z.string() })),
  isError: z.boolean().optional(),
});

type ToolArgs = { post?: string };

const TOOLS = ["get_resume", "list_posts", "read_post"];

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
    const context = document.modelContext;

    if (context === undefined) {
      throw new Error("document.modelContext is missing. Is Chrome's WebMCPTesting feature on?");
    }

    const deadline = Date.now() + 10_000;

    const registered = async (): Promise<void> => {
      if ((await context.getTools()).length >= count) return;

      if (Date.now() > deadline) throw new Error(`Fewer than ${count} tools registered in 10s`);

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
      const context = document.modelContext;
      const tool = (await context?.getTools())?.find((candidate) => candidate.name === toolName);

      if (context === undefined || tool === undefined) throw new Error(`${toolName} is missing`);

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
  const path = /\]\((\/blog\/[\w-]+)\)/u.exec(await text("list_posts"))?.[1];

  if (path === undefined) throw new Error("list_posts returned no post links");

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
    read_post: true,
  });
});

test("list_posts links post pages, with their Markdown alongside", async () => {
  await open("/");

  expect(await text("list_posts")).toMatch(
    /^- \[.+\]\(\/blog\/[\w-]+\) \(\d{4}-\d{2}-\d{2}, \[Markdown\]\(\/blog\/[\w-]+\.md\)\): /mu,
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
