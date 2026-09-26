import { cn } from "cn";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { PostTitleTransition } from "@/components/page-transition";
import type { PostMeta } from "@/lib/posts";

export function PostNavLink({ post, direction }: { post: PostMeta; direction: "older" | "newer" }) {
  const newer = direction === "newer";
  const Arrow = newer ? ArrowRight : ArrowLeft;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        newer && "items-end text-end sm:col-start-2",
      )}
    >
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        {!newer && (
          <Arrow className="size-3.5 transition-transform motion-safe:group-hover:-translate-x-0.5" />
        )}
        {newer ? "Newer" : "Older"}
        {newer && (
          <Arrow className="size-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
        )}
      </span>
      <PostTitleTransition slug={post.slug}>
        <span className="font-semibold text-balance">{post.title}</span>
      </PostTitleTransition>
    </Link>
  );
}
