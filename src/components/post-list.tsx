import { cn } from "cn";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PostTitleTransition } from "@/components/page-transition";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import type { Post } from "@/interfaces/post";
import { formatDate } from "@/lib/utils";

export function PostList({ posts, className }: { posts: Post[]; className?: string }) {
  return (
    <ItemGroup className={cn("-mx-3 mb-5 w-auto gap-1", className)}>
      {posts.map((post) => (
        <div key={post.slug} role="listitem" className="reveal">
          <Item
            className="items-start max-sm:flex-col"
            render={<Link href={`/blog/${post.slug}`} />}
          >
            <ItemContent>
              <PostTitleTransition slug={post.slug}>
                <ItemTitle className="line-clamp-none text-base font-semibold">
                  {post.title}
                </ItemTitle>
              </PostTitleTransition>
              <ItemDescription className="line-clamp-none">{post.summary}</ItemDescription>
            </ItemContent>
            {/* On hover the date gives way to the reading time and an arrow. */}
            <ItemActions className="grid justify-items-end text-sm text-muted-foreground tabular-nums *:col-start-1 *:row-start-1">
              <span className="transition-opacity group-hover/item:opacity-0 group-focus-visible/item:opacity-0">
                <time dateTime={post.date}>{formatDate(post.date, "short")}</time>
                <span className="sm:sr-only"> · {post.readingMinutes} min read</span>
              </span>
              <span
                aria-hidden="true"
                className="flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-visible/item:opacity-100"
              >
                {post.readingMinutes} min
                <ArrowRight className="size-3.5 transition-transform motion-safe:-translate-x-1 motion-safe:group-hover/item:translate-x-0 motion-safe:group-focus-visible/item:translate-x-0" />
              </span>
            </ItemActions>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}
