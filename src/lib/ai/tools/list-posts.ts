// Posts stay out of the system prompt; the agent looks them up with this tool
// and readPost when a question needs them.

import { tool } from "ai";
import { z } from "zod";

import { getAllPosts } from "@/lib/api";
import { SITE } from "@/lib/site";

// Absolute: models copy full URLs more faithfully than bare paths. The popup
// turns links to this site back into client-side navigation.
export const postUrl = (slug: string) => `${SITE.url}/blog/${slug}`;

/** A Markdown link the agent can copy as-is, so post links don't depend on its formatting. */
export const postLink = (title: string, slug: string) => `[${title}](${postUrl(slug)})`;

export const listPosts = tool({
  description:
    "List every post on Lucas's blog, newest first, with its title, date, one-sentence summary, url, and a Markdown link to copy into answers. Call this before discussing or linking any of his writing.",
  inputSchema: z.object({}),
  execute: () =>
    getAllPosts().map((post) => ({
      title: post.title,
      date: post.date,
      summary: post.summary,
      url: postUrl(post.slug),
      link: postLink(post.title, post.slug),
    })),
});
