import { cn } from "cn";
import Link from "next/link";

import { PostTitleTransition } from "@/components/page-transition";
import type { Post } from "@/interfaces/post";
import { formatDate } from "@/lib/utils";

/** Posts as receipt lines: date, title, a dotted leader, and the read time as the quantity. */
export function PostList({
  posts,
  summaries = false,
  className,
}: {
  posts: Post[];
  summaries?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn("line-items", className)}>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`} className="line-item line-link">
            <time className="line-date" dateTime={post.date}>
              {formatDate(post.date, "short")}
            </time>
            <PostTitleTransition slug={post.slug}>
              <span className="line-title">{post.title}</span>
            </PostTitleTransition>
            <span className="line-leader" aria-hidden="true" />
            <span className="line-qty">{post.readingMinutes} min</span>
          </Link>
          {summaries && <p className="line-note">{post.summary}</p>}
        </li>
      ))}
    </ul>
  );
}
