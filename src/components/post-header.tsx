import type { ReactNode } from "react";

import { PostTitleTransition } from "@/components/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@/interfaces/post";
import { SITE } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export function PostHeader({ post }: { post: Post }) {
  return (
    <PostHeaderLayout
      title={
        <PostTitleTransition slug={post.slug}>
          <h1>{post.title}</h1>
        </PostTitleTransition>
      }
      metadata={
        <>
          <span>{SITE.name}</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{post.readingMinutes} min read</span>
        </>
      }
    />
  );
}

export function PostHeaderSkeleton() {
  return (
    <PostHeaderLayout
      title={
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-7 w-5/6 sm:h-9" />
          <Skeleton className="h-7 w-3/5 sm:h-9" />
        </div>
      }
      metadata={
        <>
          <span className="flex items-center">
            <Skeleton className="h-3 w-24" />
          </span>
          <span className="flex items-center">
            <Skeleton className="h-3 w-28" />
          </span>
          <span className="flex items-center">
            <Skeleton className="h-3 w-16" />
          </span>
        </>
      }
    />
  );
}

function PostHeaderLayout({ title, metadata }: { title: ReactNode; metadata: ReactNode }) {
  return (
    <header className="mb-2">
      <div className="article-title">{title}</div>
      <div className="post-meta">{metadata}</div>
      <hr />
    </header>
  );
}
