import { Suspense } from "react";

import { PostBody } from "@/components/post-body";
import { PostHeader, PostHeaderSkeleton } from "@/components/post-header";
import { PostNav } from "@/components/post-nav-link";
import { ReadingProgress } from "@/components/reading-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllPosts } from "@/lib/api";

import { getPost } from "./get-post";

type Props = { params: Promise<{ slug: string }> };

export function PostArticle({ params }: Props) {
  return (
    <>
      <ReadingProgress />
      <article className="reading-article">
        <Suspense fallback={<PostSkeleton />}>
          <PostContent params={params} />
        </Suspense>
      </article>
    </>
  );
}

async function PostContent({ params }: Props) {
  const post = await getPost(params);

  return (
    <>
      <PostHeader post={post} />
      <PostBody markdown={post.content} />
      <PostNav post={post} posts={getAllPosts()} />
    </>
  );
}

function PostSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading post…</span>
      <div aria-hidden="true">
        <PostHeaderSkeleton />
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
