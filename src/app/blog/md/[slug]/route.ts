import { getAllPosts, getPostBySlug } from "@/lib/api";
import { MARKDOWN_HEADERS, postToMarkdown } from "@/lib/post-markdown";

// Reached through the rewrites in next.config.ts, from `/blog/:slug.md` or an
// `Accept: text/markdown` request for `/blog/:slug`.
export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export async function GET(_: Request, ctx: RouteContext<"/blog/md/[slug]">) {
  const post = getPostBySlug((await ctx.params).slug);

  if (!post) {
    return new Response("Post not found.\n", { status: 404, headers: MARKDOWN_HEADERS });
  }

  return new Response(postToMarkdown(post), { headers: MARKDOWN_HEADERS });
}
