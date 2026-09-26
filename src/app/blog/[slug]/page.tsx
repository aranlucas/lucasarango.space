import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageTransition, PostTitleTransition } from "@/components/page-transition";
import { ReadingProgress } from "@/components/reading-progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { formatDate, getPost, getPosts } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <PageTransition>
      <ReadingProgress />
      <article>
        <header className="mb-10">
          <PostTitleTransition slug={post.slug}>
            <h1 className="mb-3 text-title font-semibold tracking-tight text-balance">
              {post.title}
            </h1>
          </PostTitleTransition>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <Badge variant="secondary">{post.readingMinutes} min read</Badge>
          </div>
        </header>
        <div
          className="prose prose-lg max-w-none prose-headings:font-semibold prose-h2:mt-11 prose-pre:rounded-md prose-pre:text-sm prose-pre:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <Separator className="mt-12 mb-4" />
        <Link
          href="/blog"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "text-base font-normal",
          })}
        >
          More writing
        </Link>
      </article>
    </PageTransition>
  );
}
