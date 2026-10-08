import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageTransition } from "@/components/page-transition";
import { PostBody } from "@/components/post-body";
import { PostHeader } from "@/components/post-header";
import { PostNav } from "@/components/post-nav-link";
import { ReadingProgress } from "@/components/reading-progress";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { FEED_ALTERNATE, SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);

  if (!post) notFound();

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}`, types: FEED_ALTERNATE },
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
  const post = getPostBySlug((await params).slug);

  if (!post) notFound();

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
