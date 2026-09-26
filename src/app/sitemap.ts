import type { MetadataRoute } from "next";

import { getPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    { url: SITE.url },
    { url: `${SITE.url}/blog` },
    { url: `${SITE.url}/resume` },
    ...posts.map((post) => ({ url: `${SITE.url}/blog/${post.slug}`, lastModified: post.date })),
  ];
}
