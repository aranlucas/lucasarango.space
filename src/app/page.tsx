import Link from "next/link";

import { Intro } from "@/components/intro";
import { PageTransition } from "@/components/page-transition";
import { PostList } from "@/components/post-list";
import { ProjectList } from "@/components/project-list";
import { SectionHeading } from "@/components/section-heading";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { WorkList } from "@/components/work-list";
import { getPosts } from "@/lib/posts";
import { FEED_ALTERNATE, WORK } from "@/lib/site";

export const metadata = { alternates: { canonical: "/", types: FEED_ALTERNATE } };

export default async function Home() {
  const posts = (await getPosts()).slice(0, 5);

  return (
    <PageTransition>
      <Intro />

      <section aria-labelledby="projects">
        <SectionHeading id="projects">Things I’m building</SectionHeading>
        <p className="mb-6 text-base/relaxed text-muted-foreground">
          Personal tools I use, maintain, and learn from. The source and the decisions behind them.
        </p>
        <ProjectList />
      </section>

      <section aria-labelledby="writing">
        <SectionHeading id="writing">Recent writing</SectionHeading>
        {posts.length > 0 ? (
          <>
            <PostList posts={posts} />
            <Link href="/blog" className="text-primary underline-offset-3 hover:underline">
              All writing
            </Link>
          </>
        ) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No posts yet</EmptyTitle>
              <EmptyDescription>The first one is on its way.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      <section aria-labelledby="work">
        <SectionHeading id="work">Work</SectionHeading>
        <WorkList roles={WORK} />
        <Link
          href="/resume"
          className="mt-4 inline-block text-base text-primary underline underline-offset-3 hover:decoration-2"
        >
          Full experience and résumé
        </Link>
      </section>
    </PageTransition>
  );
}
