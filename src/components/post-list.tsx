import { cn } from "cn";
import Link from "next/link";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { formatDate, type PostMeta } from "@/lib/posts";

export function PostList({ posts, className }: { posts: PostMeta[]; className?: string }) {
  return (
    <ItemGroup className={cn("-mx-3 mb-5 w-auto gap-1", className)}>
      {posts.map((post) => (
        <div key={post.slug} role="listitem">
          <Item className="items-start" render={<Link href={`/blog/${post.slug}`} />}>
            <ItemContent>
              <ItemTitle className="line-clamp-none text-base font-semibold">
                {post.title}
              </ItemTitle>
              <ItemDescription className="line-clamp-none">{post.summary}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <time dateTime={post.date} className="text-sm text-muted-foreground tabular-nums">
                {formatDate(post.date, "short")}
              </time>
            </ItemActions>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}
