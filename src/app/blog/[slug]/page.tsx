import type { Metadata } from "next";
import { Suspense } from "react";

import { PageTransition } from "@/components/page-transition";
import { PostBody } from "@/components/post-body";
import { PostHeader } from "@/components/post-header";
import { PostNav } from "@/components/post-nav-link";
import { ReadingProgress } from "@/components/reading-progress";
import { getAllPosts } from "@/lib/api";
import { markdownAlternate, markdownPath, SITE } from "@/lib/site";

import { getPost } from "./get-post";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params);

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `/blog/${post.slug}`,
      types: markdownAlternate(markdownPath(post.slug)),
    },
    openGraph: {
      type: "article",
      siteName: SITE.name,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      authors: [SITE.name],
      url: `/blog/${post.slug}`,
    },
  };
}

export default function PostPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <p className="page-lede" role="status">
          Loading post…
        </p>
      }
    >
      <PostContent params={params} />
    </Suspense>
  );
}

async function PostContent({ params }: Props) {
  const post = await getPost(params);

  return (
    <PageTransition>
      <ReadingProgress />
      <article className="reading-article">
        <PostHeader post={post} />
        <PostBody markdown={post.content} />
        <PostNav post={post} posts={getAllPosts()} />
      </article>
    </PageTransition>
  );
}
