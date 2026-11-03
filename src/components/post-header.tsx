import type { ReactNode } from "react";

import { PostTitleTransition } from "@/components/page-transition";
import type { Post } from "@/interfaces/post";
import { SITE } from "@/lib/site";
import { formatDate } from "@/lib/utils";

type PostHeaderProps = { post: Post };

type PostHeaderLayoutProps = { title: ReactNode; metadata: ReactNode };

export function PostHeader({ post }: PostHeaderProps) {
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

function PostHeaderLayout({ title, metadata }: PostHeaderLayoutProps) {
  return (
    <header className="mbe-2">
      <div className="article-title">{title}</div>
      <div className="post-meta">{metadata}</div>
      <hr />
    </header>
  );
}
