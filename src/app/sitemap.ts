import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/api";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    { url: SITE.url },
    { url: `${SITE.url}/blog` },
    { url: `${SITE.url}/resume` },
    ...posts.map((post) => ({ url: `${SITE.url}/blog/${post.slug}`, lastModified: post.date })),
  ];
}
