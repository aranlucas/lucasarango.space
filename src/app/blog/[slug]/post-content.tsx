import { PostBody } from "@/components/post-body";
import { PostHeader } from "@/components/post-header";
import { PostNav } from "@/components/post-nav-link";
import { getAllPosts } from "@/lib/api";

import { getPost } from "./get-post";

type Props = { params: Promise<{ slug: string }> };

/** Published posts are static; render their content before the shell can paint. */
export async function PostContent({ params }: Props) {
  const post = await getPost(params);

  return (
    <>
      <PostHeader post={post} />
      <PostBody markdown={post.content} />
      <PostNav post={post} posts={getAllPosts()} />
    </>
  );
}
