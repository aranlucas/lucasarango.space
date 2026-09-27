import { PostTitleTransition } from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/interfaces/post";
import { SITE } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export function PostHeader({ post }: { post: Post }) {
  return (
    <header className="mb-10">
      <PostTitleTransition slug={post.slug}>
        <h1 className="mb-3 text-title font-semibold tracking-tight text-balance">{post.title}</h1>
      </PostTitleTransition>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <span>{SITE.name}</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <Badge variant="secondary">{post.readingMinutes} min read</Badge>
      </div>
    </header>
  );
}
