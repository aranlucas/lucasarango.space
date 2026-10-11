import { describe, expect, it } from "vitest";

import type { Post } from "@/interfaces/post";

import { blogIndexMarkdown, llmsTxt, postToMarkdown } from "./post-markdown";
import { markdownPath } from "./site";

const post: Post = {
  slug: "hello-world",
  title: 'Hello: a "first" post',
  date: "2026-09-25",
  summary: "Where it starts.",
  draft: false,
  readingMinutes: 1,
  content: "\nSome **markdown**.\n\n",
};

describe("postToMarkdown", () => {
  it("leads with frontmatter an agent can parse, then the post body", () => {
    expect(postToMarkdown(post)).toBe(`---
title: "Hello: a \\"first\\" post"
author: "Lucas Arango"
date: 2026-09-25
url: /blog/hello-world
canonical_url: https://lucasarango.space/blog/hello-world
summary: "Where it starts."
---

# Hello: a "first" post

Some **markdown**.
`);
  });
});

describe("indexes", () => {
  it("links each post's page and Markdown URL from the blog sitemap", () => {
    expect(blogIndexMarkdown([post])).toContain(
      `- [${post.title}](https://lucasarango.space/blog/hello-world) (2026-09-25, [Markdown](https://lucasarango.space/blog/hello-world.md)): Where it starts.`,
    );
  });

  it("lists posts with absolute Markdown URLs in llms.txt", () => {
    const index = llmsTxt([post]);

    expect(index).toMatch(/^# Lucas Arango\n\n> /u);
    expect(index).toContain(
      `(https://lucasarango.space${markdownPath(post.slug)}): Where it starts.`,
    );
  });
});

describe("post search", () => {
  it("matches relevant words across title, summary, and body, ignoring question wording and case", () => {
    const result = blogIndexMarkdown([post], " FIRST markdown ");
    expect(result).toContain("https://lucasarango.space/blog/hello-world");
    expect(result).toContain("Excerpt: Some **markdown**.");
    expect(blogIndexMarkdown([post], "starts")).toContain(post.title);
    expect(blogIndexMarkdown([post], "nonexistentword")).toContain("No matching posts.");
    expect(blogIndexMarkdown([post], "What does the first post discuss?")).toContain(post.title);
  });

  it("reports total matches when a limit leaves some posts out", () => {
    const result = blogIndexMarkdown([post, { ...post, slug: "another" }], "markdown", {
      limit: 1,
    });

    expect(result).toContain("Showing 1 of 2 matching posts.");
    expect(result).toContain("Increase limit or omit it");
    expect(result.match(/^- \[/gmu)).toHaveLength(1);
  });

  it("treats blank queries as the full index and bounds body excerpts", () => {
    expect(blogIndexMarkdown([post], "  ")).toBe(blogIndexMarkdown([post]));

    const result = blogIndexMarkdown(
      [{ ...post, content: `${"prefix ".repeat(100)}needle ${"tail ".repeat(100)}` }],
      "needle",
    );

    const excerpt = result.split("Excerpt: ")[1]?.trim();
    expect(excerpt).toContain("needle");
    expect(excerpt?.length).toBeLessThanOrEqual(242);
  });
});
