import { cn } from "cn";
import Link from "next/link";

import { PostTitleTransition } from "@/components/page-transition";
import type { PostSummary } from "@/interfaces/post";
import { formatDate } from "@/lib/utils";

type PostListProps = {
  posts: PostSummary[];
  summaries?: boolean;
  className?: string;
};

/** Posts as receipt lines: date, title, a dotted leader, and the read time as the quantity. */
export function PostList({ posts, summaries = false, className }: PostListProps) {
  return (
    <ul className={cn("line-items", className)}>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`} className="line-item line-link">
            <time className="line-date" dateTime={post.date}>
              {formatDate(post.date, "short")}
            </time>
            {/* The body flows as text, so a wrapped title keeps its leader and quantity on its last line. */}
            <span className="line-body">
              <PostTitleTransition slug={post.slug}>
                <span className="line-title">{post.title}</span>
              </PostTitleTransition>
              <span className="line-qty">{post.readingMinutes} min</span>
            </span>
          </Link>
          {summaries && <p className="line-note">{post.summary}</p>}
        </li>
      ))}
    </ul>
  );
}
