import { notFound } from "next/navigation";

import type { Post } from "@/interfaces/post";
import { getPostBySlug } from "@/lib/api";

/** Await route params where called, including inside the page's Suspense boundary. */
export async function getPost(params: Promise<{ slug: string }>): Promise<Post> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return post;
}
