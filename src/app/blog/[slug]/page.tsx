import type { Metadata } from "next";

import { PageTransition } from "@/components/page-transition";
import { getAllPosts } from "@/lib/api";
import { markdownAlternate, markdownPath, SITE } from "@/lib/site";

import { getPost } from "./get-post";
import { PostArticle } from "./post-article";

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
    <PageTransition>
      <PostArticle params={params} />
    </PageTransition>
  );
}
