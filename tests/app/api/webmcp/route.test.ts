import { beforeEach, expect, it, vi } from "vitest";
import { parsePost } from "@/lib/api";
import { createWebMCPHandler, type ContentSources } from "@/lib/webmcp-handler";

const getAllPosts = vi.fn<ContentSources["getAllPosts"]>();

const getPostBySlug = vi.fn<ContentSources["getPostBySlug"]>();

const getResume = vi.fn<ContentSources["getResume"]>();

const GET = createWebMCPHandler({ getAllPosts, getPostBySlug, getResume });

const post = parsePost(
  "hello",
  "---\ntitle: Hello\ndate: 2026-10-01\nsummary: A post\n---\nFull **Markdown** body",
);

const draft = { ...post, slug: "draft", draft: true };

const request = (query: string) => new Request(`http://localhost/api/webmcp?${query}`);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAllPosts).mockReturnValue([draft, post]);
  vi.mocked(getPostBySlug).mockImplementation((slug) =>
    slug === "hello" ? post : slug === "draft" ? draft : undefined,
  );
});

it("lists only published metadata and reads the full Markdown", async () => {
  const list = await GET(request("tool=listPosts"));
  expect(await list.json()).toEqual([
    {
      slug: "hello",
      title: "Hello",
      date: post.date,
      summary: post.summary,
      url: "https://lucasarango.space/blog/hello",
    },
  ]);
  const read = await GET(request("tool=readPost&slug=hello"));
  expect(await read.json()).toMatchObject({
    body: post.content,
    url: "https://lucasarango.space/blog/hello",
  });
});

it.each(["draft", "missing"])("does not expose %s", async (slug) => {
  expect((await GET(request(`tool=readPost&slug=${slug}`))).status).toBe(404);
});

it.each(["tool=readPost", "tool=readPost&slug=..%2Fsecret", "tool=unknown"])(
  "rejects invalid requests: %s",
  async (query) => {
    expect((await GET(request(query))).status).toBe(400);
    expect(getPostBySlug).not.toHaveBeenCalled();
  },
);

it("uses the existing resume source and hides upstream failures", async () => {
  vi.mocked(getResume).mockRejectedValue(new Error("private upstream detail"));
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await GET(request("tool=getResume"));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private upstream detail");
  log.mockRestore();
});
