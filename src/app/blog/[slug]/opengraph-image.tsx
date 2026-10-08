import { getPost } from "./get-post";

import { ogImage, OG_SIZE } from "@/lib/og";
import { getAllPosts } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { SITE } from "@/lib/site";

export const alt = `A post by ${SITE.name}`;

export const size = OG_SIZE;

export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost(params);

  return ogImage({
    eyebrow: `${SITE.name} · Writing`,
    title: post.title,
    footer: `${formatDate(post.date)} · ${post.readingMinutes} min read`,
  });
}
