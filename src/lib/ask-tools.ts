// Tools the Ask agent uses to read this site's writing. Posts stay out of the
// system prompt; the agent looks them up when a question needs them.

import { tool } from "ai";
import { z } from "zod";

import { getAllPosts, getPostBySlug } from "@/lib/api";
import { SITE } from "@/lib/site";

// Absolute: models copy full URLs more faithfully than bare paths. The popup
// turns links to this site back into client-side navigation.
const postUrl = (slug: string) => `${SITE.url}/blog/${slug}`;

/** A Markdown link the agent can copy as-is, so post links don't depend on its formatting. */
const postLink = (title: string, slug: string) => `[${title}](${postUrl(slug)})`;

export const askTools = {
  listPosts: tool({
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
  }),
  readPost: tool({
    description:
      "Read one blog post in full, as Markdown. Use a url from listPosts. Read a post before quoting it or answering details from it.",
    inputSchema: z.object({
      url: z.string().describe(`The post's url from listPosts, e.g. ${SITE.url}/blog/some-slug`),
    }),
    execute: ({ url }) => {
      const post = getPostBySlug(/\/blog\/([^/?#]+)/u.exec(url)?.[1] ?? url);
      if (post === undefined) return { error: `No post at ${url}. Call listPosts for valid urls.` };
      return {
        title: post.title,
        date: post.date,
        url: postUrl(post.slug),
        link: postLink(post.title, post.slug),
        body: post.content,
      };
    },
  }),
};
