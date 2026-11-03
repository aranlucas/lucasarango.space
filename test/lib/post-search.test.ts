import { expect, test } from "vitest";

import type { Post } from "@/interfaces/post";
import { getAllPosts } from "@/lib/api";

import { indexPosts, searchPostIndex, searchPosts } from "@/lib/post-search";

const post = (slug: string, title: string, date: string, content = ""): Post => ({
  slug,
  title,
  date,
  summary: "",
  content,
  draft: false,
  readingMinutes: 1,
});

test("questions rank title and summary matches above repeated passing mentions", () => {
  const posts = [
    post("roundup", "My latest projects", "2026-10-10", "system design ".repeat(100)),
    post("whiteboard", "Practicing system design", "2026-09-01"),
    {
      ...post("overview", "A shared canvas", "2026-09-15"),
      summary: "A system design whiteboard.",
    },
  ];

  expect(
    searchPosts(posts, { query: "How does Lucas practice system design?" }).posts.map(
      (p) => p.slug,
    ),
  ).toEqual(["whiteboard", "overview", "roundup"]);
});

test("matches words rather than substrings, including common plurals", () => {
  const posts = [
    post("groceries", "Tools for groceries and agents", "2026-09-01", "Start a project."),
  ];

  expect(searchPosts(posts, { query: "grocery agent" }).total).toBe(1);
  expect(searchPosts(posts, { query: "art" }).total).toBe(0);
  expect(searchPosts(posts, { query: "What did Lucas write about?" }).total).toBe(0);
});

test("sorts deterministically and limits results without losing total counts", () => {
  const posts = [post("old", "AI", "2026-09-01"), post("new", "AI", "2026-10-01")];
  expect(searchPosts(posts).posts.map((p) => p.slug)).toEqual(["new", "old"]);
  expect(searchPosts(posts, { query: "AI", limit: 1 })).toMatchObject({
    total: 2,
    posts: [posts[1]],
  });
  expect(searchPosts(posts, { query: "AI", sort: "oldest" }).posts.map((p) => p.slug)).toEqual([
    "old",
    "new",
  ]);
  expect(searchPosts(posts, { sort: "newest" }).posts.map((p) => p.slug)).toEqual(["new", "old"]);
});

test.each([
  [
    "What was the grocery prototype behind Ask DoorDash?",
    "the-first-ask-doordash-prototype-was-an-mcp-server",
  ],
  [
    "How does Lucas practice system design with an AI whiteboard?",
    "practicing-system-design-with-an-ai-on-the-whiteboard",
  ],
  [
    "How does Lucas keep MCP servers together across clients?",
    "one-plugin-repo-for-all-my-mcp-servers",
  ],
] as const)("project question %s finds its dedicated story", (query, slug) => {
  const posts = getAllPosts();
  expect(searchPosts(posts, { query }).posts[0]?.slug).toBe(slug);
});

test("the browser index omits Markdown while preserving weighted full-body search", () => {
  const posts = [
    post("body", "A weekly task", "2026-10-02", "grocery agent ".repeat(100)),
    { ...post("summary", "Shopping", "2026-10-01"), summary: "Grocery agents" },
    post("title", "Grocery agents", "2026-09-01"),
    post("unrelated", "Another project", "2026-09-01", "An unrelated story"),
  ];

  const index = indexPosts(posts);

  for (const entry of index) {
    expect(entry).not.toHaveProperty("content");
    expect(entry).not.toHaveProperty("draft");
  }

  expect(JSON.stringify(index)).not.toContain("grocery agent ".repeat(100));
  expect(
    searchPostIndex(index, { query: "How does Lucas build grocery agents?" }).posts.map(
      (entry) => entry.slug,
    ),
  ).toEqual(["title", "summary", "body"]);
});

test("an empty query does not read or tokenize post bodies", () => {
  const entry = post("unread", "Listing only", "2026-10-01");
  Object.defineProperty(entry, "content", {
    get() {
      throw new Error("Listing should not read the body");
    },
  });

  expect(searchPosts([entry]).posts).toEqual([entry]);
});

test("object prototype names only match when present in a post", () => {
  const posts = [
    post("unrelated", "An article", "2026-10-01"),
    post("javascript", "Code", "2026-09-01", "Use the constructor."),
  ];

  expect(
    searchPostIndex(indexPosts(posts), { query: "constructor" }).posts.map((entry) => entry.slug),
  ).toEqual(["javascript"]);
});
