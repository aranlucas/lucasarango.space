import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Intro } from "@/components/intro";
import { PageTransition } from "@/components/page-transition";
import { PostList } from "@/components/post-list";
import { ProjectList } from "@/components/project-list";
import { SectionHeading } from "@/components/section-heading";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getAllPosts } from "@/lib/api";
import { FEED_ALTERNATE } from "@/lib/site";

export const metadata = { alternates: { canonical: "/", types: FEED_ALTERNATE } };

export default function Home() {
  const posts = getAllPosts().slice(0, 5);

  return (
    <PageTransition>
      <Intro />

      <section aria-labelledby="projects">
        <div className="section-intro">
          <SectionHeading id="projects">Things I’m building</SectionHeading>
          <p className="mb-6 text-base/relaxed text-muted-foreground">
            A few things I’ve made for everyday use, and what I learned along the way.
          </p>
        </div>
        <ProjectList />
      </section>

      <section className="home-writing" aria-labelledby="writing">
        <SectionHeading id="writing">Recent writing</SectionHeading>
        {posts.length > 0 ? (
          <>
            <PostList posts={posts} />
            <Link href="/blog" className="all-writing">
              All writing <ArrowRight aria-hidden="true" size={18} />
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
    </PageTransition>
  );
}
