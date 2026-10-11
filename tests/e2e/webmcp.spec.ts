import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test, type APIRequestContext, type TestInfo } from "@playwright/test";
import { z } from "zod";

import { getAllPosts, parsePost } from "@/lib/api";

const PostMetadata = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.iso.date(),
  summary: z.string(),
  url: z.url(),
});

async function saveExchange(info: TestInfo, name: string, exchange: string) {
  const path = info.outputPath(`${name}.json`);
  await writeFile(path, exchange);
  await info.attach("request-result", { path, contentType: "application/json" });
}

async function capture(request: APIRequestContext, path: string, info: TestInfo) {
  const response = await request.get(path);
  const body = z.json().parse(await response.json());

  const exchange = {
    request: { method: "GET", url: response.url(), headers: { Accept: "application/json" } },
    response: { status: response.status(), headers: response.headers(), body },
  };

  const tool = new URL(response.url()).searchParams.get("tool") ?? "missing-tool";

  await saveExchange(info, `get-${tool}`, JSON.stringify(exchange, null, 2));

  console.log(`GET ${path} → ${response.status()}`);

  return { response, body };
}

test("lists every published post with canonical URLs and no article bodies", async ({
  request,
}, info) => {
  const { response, body } = await capture(request, "/api/webmcp?tool=listPosts", info);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");

  const posts = z.array(PostMetadata.strict()).parse(body);
  const published = getAllPosts().filter((post) => !post.draft);
  expect(posts.map((post) => post.slug)).toEqual(published.map((post) => post.slug));

  for (const post of posts) expect(post.url).toBe(`https://lucasarango.space/blog/${post.slug}`);
});

test("reads the complete Markdown body from a listed slug", async ({ request }, info) => {
  const list = await capture(request, "/api/webmcp?tool=listPosts", info);
  const posts = z.array(PostMetadata).parse(list.body);
  expect(posts.length).toBeGreaterThan(0);

  const slug = posts[0].slug;
  const { response, body } = await capture(request, `/api/webmcp?tool=readPost&slug=${slug}`, info);
  expect(response.status()).toBe(200);

  const post = PostMetadata.extend({ body: z.string() }).strict().parse(body);
  const source = parsePost(slug, readFileSync(join(process.cwd(), "_posts", `${slug}.md`), "utf8"));
  expect(post.body).toBe(source.content);
  expect(post.title).toBe(source.title);
  expect(post.url).toBe(`https://lucasarango.space/blog/${slug}`);
});

test("returns the real public resume with experience and skills", async ({ request }, info) => {
  const { response, body } = await capture(request, "/api/webmcp?tool=getResume", info);
  expect(response.status()).toBe(200);

  const resume = z
    .object({
      name: z.literal("Lucas Arango"),
      title: z.string().min(1),
      url: z.literal("https://lucasarango.space/resume"),
      roles: z
        .array(z.object({ company: z.string(), title: z.string(), bullets: z.array(z.string()) }))
        .min(1),
      skills: z.array(z.object({ category: z.string(), items: z.array(z.string()) })).min(1),
      education: z.array(z.object({ school: z.string() })).min(1),
    })
    .parse(body);

  expect(resume.roles[0].bullets.length).toBeGreaterThan(0);
});

for (const [query, status, error] of [
  ["tool=readPost", 400, "Provide a slug from listPosts."],
  ["tool=readPost&slug=..%2FREADME", 400, "Provide a slug from listPosts."],
  [
    "tool=readPost&slug=missing-e2e-post",
    404,
    "Post not found. Call listPosts for published slugs.",
  ],
  ["tool=unknown", 400, "Use getResume, listPosts, or readPost."],
  ["", 400, "Use getResume, listPosts, or readPost."],
] as const) {
  test(`rejects ${query || "a missing tool"} with HTTP ${status}`, async ({ request }, info) => {
    const { response, body } = await capture(request, `/api/webmcp?${query}`, info);
    expect(response.status()).toBe(status);
    expect(body).toEqual({ error });
  });
}

test("rejects unsupported POST requests", async ({ request }, info) => {
  const response = await request.post("/api/webmcp?tool=getResume");
  const body = await response.text();

  await saveExchange(
    info,
    "post-getResume",
    JSON.stringify(
      {
        request: { method: "POST", url: response.url() },
        response: { status: response.status(), body },
      },
      null,
      2,
    ),
  );

  expect(response.status()).toBe(405);
  console.log(`POST /api/webmcp?tool=getResume → ${response.status()}`);
});
