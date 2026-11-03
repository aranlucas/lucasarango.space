import { notFound } from "next/navigation";

import type { Post } from "@/interfaces/post";
import { getPostBySlug } from "@/lib/api";

type GetPostOptions = { slug: string };

/** Resolve route params and return the post, or render the 404. */
export async function getPost(params: Promise<GetPostOptions>): Promise<Post> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return post;
}
