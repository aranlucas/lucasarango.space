import { PostTitleTransition } from "@/components/page-transition";
import type { Post } from "@/interfaces/post";
import { SITE } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export function PostHeader({ post }: { post: Post }) {
  return (
    <header className="mb-2">
      <PostTitleTransition slug={post.slug}>
        <h1 className="article-title">{post.title}</h1>
      </PostTitleTransition>
      <p className="post-meta">
        <span>{SITE.name}</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>{post.readingMinutes} min read</span>
      </p>
      <hr />
    </header>
  );
}
