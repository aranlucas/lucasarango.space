// Posts stay out of the system prompt; the agent looks them up with this tool
// and readPost when a question needs them.

import { tool } from "ai";
import { z } from "zod";

import { getAllPosts } from "@/lib/api";
import { postLink, postUrl } from "@/lib/site";

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
