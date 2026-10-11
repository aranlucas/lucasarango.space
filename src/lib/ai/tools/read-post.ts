import { tool } from "ai";
import { z } from "zod";

import { getPostBySlug } from "@/lib/api";
import { postLink, postUrl } from "@/lib/ai/tools/list-posts";
import { SITE } from "@/lib/site";

export const readPost = tool({
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
});
