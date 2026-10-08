import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { PostTitleTransition } from "@/components/page-transition";
import type { Post } from "@/interfaces/post";

export function PostNavLink({ post, direction }: { post: Post; direction: "older" | "newer" }) {
  const Arrow = direction === "newer" ? ArrowRight : ArrowLeft;

  return (
    <Link
      href={`/blog/${post.slug}`}
      prefetch={true}
      className={
        direction === "older" ? "post-nav-link post-nav-older" : "post-nav-link post-nav-newer"
      }
    >
      <span className="post-nav-direction">
        {direction === "older" && <Arrow aria-hidden="true" size={14} />}
        {direction === "newer" ? "Newer" : "Older"}
        {direction === "newer" && <Arrow aria-hidden="true" size={14} />}
      </span>
      <PostTitleTransition slug={post.slug}>
        <span className="post-nav-title">{post.title}</span>
      </PostTitleTransition>
    </Link>
  );
}

/** Split article navigation; `posts` is newest first. */
export function PostNav({ post, posts }: { post: Post; posts: Post[] }) {
  const index = posts.findIndex((p) => p.slug === post.slug);

  if (index === -1) return null;

  const newer: Post | undefined = posts[index - 1];
  const older: Post | undefined = posts[index + 1];

  if (newer === undefined && older === undefined) return null;

  return (
    <>
      <hr className="rule-double" />
      <nav className="post-nav" aria-label="More writing">
        {older !== undefined && <PostNavLink post={older} direction="older" />}
        {newer !== undefined && <PostNavLink post={newer} direction="newer" />}
      </nav>
    </>
  );
}
