import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageTransition, PostTitleTransition } from "@/components/page-transition";
import { PostNavLink } from "@/components/post-nav-link";
import { ReadingProgress } from "@/components/reading-progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { formatDate, getPost, getPosts, type PostMeta } from "@/lib/posts";
import { FEED_ALTERNATE, SITE } from "@/lib/site";

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

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  // Posts are sorted newest first, so the next entry is the older one.
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.slug === post.slug);
  const newer: PostMeta | undefined = posts[index - 1];
  const older: PostMeta | undefined = posts[index + 1];

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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span>{SITE.name}</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <Badge variant="secondary">{post.readingMinutes} min read</Badge>
          </div>
        </header>
        <div
          className="prose prose-lg max-w-none wrap-break-word prose-headings:font-semibold prose-h2:mt-11 prose-pre:rounded-md prose-pre:text-sm prose-pre:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <Separator className="mt-12 mb-6" />
        <nav aria-label="More writing" className="grid gap-3 sm:grid-cols-2">
          {older !== undefined && <PostNavLink post={older} direction="older" />}
          {newer !== undefined && <PostNavLink post={newer} direction="newer" />}
          {older === undefined && newer === undefined && (
            <Link href="/blog" className="text-primary underline underline-offset-4">
              All writing
            </Link>
          )}
        </nav>
      </article>
    </PageTransition>
  );
}
