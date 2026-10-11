import { describe, expect, it } from "vitest";

import type { Post } from "@/interfaces/post";

import { blogIndexMarkdown, llmsTxt, postToMarkdown } from "@/lib/post-markdown";
import { markdownPath } from "@/lib/site";

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
  it("links each post's Markdown URL from the blog sitemap", () => {
    expect(blogIndexMarkdown([post])).toContain(
      `- [${post.title}](/blog/hello-world.md) (2026-09-25): Where it starts.`,
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
