import { cn } from "cn";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { PostTitleTransition } from "@/components/page-transition";
import type { Post } from "@/interfaces/post";
import { formatDate } from "@/lib/utils";

export function PostList({ posts, className }: { posts: Post[]; className?: string }) {
  return (
    <ul className={cn("writing-list", className)}>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`} className="writing-row">
            <span className="writing-date">
              <time dateTime={post.date}>{formatDate(post.date, "short")}</time>
              <span>{post.readingMinutes} min read</span>
            </span>
            <span className="writing-copy">
              <PostTitleTransition slug={post.slug}>
                <span className="writing-title">{post.title}</span>
              </PostTitleTransition>
              <span className="writing-summary">{post.summary}</span>
            </span>
            <ArrowUpRight aria-hidden="true" className="writing-arrow" size={24} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
