import { cacheLife } from "next/cache";

import { getAllPosts, getPostBySlug } from "@/lib/api";
import { MARKDOWN_HEADERS, postToMarkdown } from "@/lib/post-markdown";

// Reached through the rewrites in next.config.ts, from `/blog/:slug.md` or an
// `Accept: text/markdown` request for `/blog/:slug`.
export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

// oxlint-disable-next-line require-await, typescript/require-await -- use cache requires an async function, even for local synchronous data.
async function getPostMarkdown(slug: string) {
  "use cache";
  cacheLife("max");

  const post = getPostBySlug(slug);

  return post && postToMarkdown(post);
}

export async function GET(_: Request, ctx: RouteContext<"/blog/md/[slug]">) {
  const { slug } = await ctx.params;
  const markdown = await getPostMarkdown(slug);

  if (markdown === undefined) {
    return new Response("Post not found.\n", { status: 404, headers: MARKDOWN_HEADERS });
  }

  return new Response(markdown, { headers: MARKDOWN_HEADERS });
}
