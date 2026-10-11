import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { z } from "zod";
import { getAllPosts } from "@/lib/api";
import markdownToHtml from "@/lib/markdown-to-html";

const ToolResult = z.object({
  content: z.array(z.object({ type: z.literal("text"), text: z.string() })),
  isError: z.boolean().optional(),
});

const PostMetadata = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.iso.date(),
  summary: z.string(),
  url: z.url(),
});

async function execute(page: Page, info: TestInfo, name: string, input: { slug?: string } = {}) {
  // Chrome 154 still expects JSON text for executeTool input, unlike the newest draft's object signature.
  const result = await page.evaluate<string>(`(async () => {
    const call = ${JSON.stringify({ name, input })};
    const tools = (await document.modelContext?.getTools()) ?? [];
    const tool = tools.find((entry) => entry.name === call.name);
    if (!tool) throw new Error("Tool not registered: " + call.name);
    return document.modelContext.executeTool(tool, JSON.stringify(call.input));
  })()`);

  const parsed = ToolResult.parse(JSON.parse(result));
  await info.attach(`tool-${name}-${input.slug ?? "empty"}-request-result`, {
    body: JSON.stringify({ request: { tool: name, input }, result: parsed }, null, 2),
    contentType: "application/json",
  });

  return parsed;
}

async function expectArticleContent(page: Page, slug: string, markdown: string) {
  const source = getAllPosts().find((entry) => entry.slug === slug);

  if (!source) throw new Error(`Missing source: ${slug}`);

  const [originalHtml, convertedHtml] = await Promise.all([
    markdownToHtml(source.content),
    markdownToHtml(markdown),
  ]);

  const text = await page.evaluate(
    ({ original, converted }) => {
      const parser = new DOMParser();

      const normalized = (html: string) =>
        parser.parseFromString(html, "text/html").body.textContent.replaceAll(/\s+/gu, " ").trim();

      return { original: normalized(original), converted: normalized(converted) };
    },
    { original: originalHtml, converted: convertedHtml },
  );

  expect(text.converted).toContain(text.original);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const tools = (await document.modelContext?.getTools()) ?? [];

        return tools.map((tool) => tool.name).toSorted();
      }),
    )
    .toEqual(["getResume", "listPosts", "readPost"]);
});

test("native Chrome discovers tools and reads the real résumé and every published article", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.headers().accept === "text/html") requests.push(request.url());
  });
  const listed = await execute(page, info, "listPosts");
  const posts = z.array(PostMetadata).parse(JSON.parse(listed.content[0].text));
  expect(posts.map((post) => post.slug)).toEqual(
    getAllPosts().flatMap((post) => (post.draft ? [] : [post.slug])),
  );
  expect(requests).toEqual([]);

  const resume = await execute(page, info, "getResume");
  const markdown = resume.content[0].text;
  expect(markdown).toContain("# Résumé Lucas Arango");
  expect(markdown).toContain("## Experience");
  expect(markdown).toContain("DoorDash");
  expect(markdown).toContain("## Education");
  expect(markdown).not.toContain("Print résumé");

  await Promise.all(
    posts.map(async (post) => {
      const article = await execute(page, info, "readPost", { slug: post.slug });
      expect(article.isError).not.toBe(true);
      expect(article.content[0].text).toContain(`# ${post.title}`);
      expect(article.content[0].text.length).toBeGreaterThan(500);
      await expectArticleContent(page, post.slug, article.content[0].text);
      expect(article.content[0].text).not.toContain("Ask about my work");
      expect(article.content[0].text).not.toContain("post-nav");
    }),
  );

  expect(requests.some((url) => url.includes("/api/webmcp"))).toBe(false);
  expect(requests.some((url) => url.endsWith("/resume"))).toBe(true);
  expect(errors).toEqual([]);
  await info.attach("content-page-requests", {
    body: JSON.stringify(requests, null, 2),
    contentType: "application/json",
  });
});

test("unknown and draft slugs return useful errors without fetching a page", async ({
  page,
}, info) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.headers().accept === "text/html") requests.push(request.url());
  });
  const result = await execute(page, info, "readPost", { slug: "not-a-published-post" });
  expect(result.isError).toBe(true);
  expect(result.content[0].text).toContain("Call listPosts");
  expect(requests).toEqual([]);
});

test("page fetch failures return relevant tool errors", async ({ page }, info) => {
  await page.route("**/resume", (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  const result = await execute(page, info, "getResume");
  expect(result.isError).toBe(true);
  expect(result.content[0].text).toContain("/resume (HTTP 503)");
  expect(result.content[0].text).not.toContain("listPosts");
});

test("tools survive client navigation without duplicate registration", async ({ page }, info) => {
  await page.getByRole("link", { name: "Writing", exact: true }).first().click();
  await expect(page).toHaveURL(/\/blog$/u);
  const result = await execute(page, info, "listPosts");
  expect(result.isError).not.toBe(true);
  expect(await page.evaluate(async () => (await document.modelContext?.getTools())?.length)).toBe(
    3,
  );
});
