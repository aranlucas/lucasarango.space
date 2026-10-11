"use client";

import { useWebMCP } from "use-webmcp-tool";
import { z } from "zod";
import { readPageMarkdown } from "@/lib/page-markdown";

export type PublishedPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  url: string;
};

const PostInput = z.strictObject({
  slug: z
    .string()
    .regex(/^[\w-]{1,200}$/u)
    .describe("A post slug returned by listPosts."),
});

const emptySchema: z.core.JSONSchema.JSONSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

export function WebMCP({ posts }: { posts: PublishedPost[] }) {
  useWebMCP({
    name: "getResume",
    description:
      "Read Lucas Arango's public résumé page as Markdown, including experience, projects, skills, education, and profile links.",
    inputSchema: emptySchema,
    annotations: { readOnlyHint: true },
    execute: (_input, options) => readPageMarkdown("/resume", options?.signal),
  });
  useWebMCP({
    name: "listPosts",
    description:
      "List published blog posts, newest first, with slugs, titles, dates, summaries, and canonical URLs. Call before reading a post.",
    inputSchema: emptySchema,
    annotations: { readOnlyHint: true },
    execute: () => posts,
  });
  useWebMCP({
    name: "readPost",
    description:
      "Read a published blog article's original Markdown, including metadata and its canonical URL. Use a slug returned by listPosts. Read before quoting or answering details about a post.",
    inputSchema: z.toJSONSchema(PostInput),
    annotations: { readOnlyHint: true },
    execute: (input, options) => {
      const { slug } = PostInput.parse(input);

      if (!posts.some((post) => post.slug === slug)) {
        throw new Error("Post not found. Call listPosts for published slugs.");
      }

      return readPageMarkdown(`/blog/${slug}`, options?.signal);
    },
  });

  return null;
}
