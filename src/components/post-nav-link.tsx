import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { PostTitleTransition } from "@/components/page-transition";
import type { Post } from "@/interfaces/post";

export function PostNavLink({ post, direction }: { post: Post; direction: "older" | "newer" }) {
  const Arrow = direction === "newer" ? ArrowRight : ArrowLeft;
  return (
    <Link href={`/blog/${post.slug}`} className="line-item line-link">
      <span className="line-date">{direction === "newer" ? "Newer" : "Older"}</span>
      <PostTitleTransition slug={post.slug}>
        <span className="line-title">{post.title}</span>
      </PostTitleTransition>
      <span className="line-leader" aria-hidden="true" />
      <span className="line-qty">
        <Arrow aria-hidden="true" size={14} />
      </span>
    </Link>
  );
}

/** Older/newer lines under a post; `posts` is newest first. */
export function PostNav({ post, posts }: { post: Post; posts: Post[] }) {
  const index = posts.findIndex((p) => p.slug === post.slug);
  const newer: Post | undefined = posts[index - 1];
  const older: Post | undefined = posts[index + 1];
  return (
    <>
      <hr className="rule-double" />
      <nav aria-label="More writing">
        <ul className="line-items">
          {newer !== undefined && (
            <li>
              <PostNavLink post={newer} direction="newer" />
            </li>
          )}
          {older !== undefined && (
            <li>
              <PostNavLink post={older} direction="older" />
            </li>
          )}
          <li>
            <Link href="/blog" className="line-item line-link">
              <span className="line-title">All writing</span>
              <span className="line-leader" aria-hidden="true" />
              <span className="line-qty">
                <ArrowRight aria-hidden="true" size={14} />
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
