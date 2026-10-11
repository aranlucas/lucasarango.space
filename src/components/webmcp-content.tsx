import { WebMCP } from "@/components/webmcp";
import { getAllPosts } from "@/lib/api";
import { SITE } from "@/lib/site";

export function WebMCPContent() {
  const posts = getAllPosts().flatMap((post) =>
    post.draft
      ? []
      : [
          {
            slug: post.slug,
            title: post.title,
            date: post.date,
            summary: post.summary,
            url: `${SITE.url}/blog/${post.slug}`,
          },
        ],
  );

  return <WebMCP posts={posts} />;
}
