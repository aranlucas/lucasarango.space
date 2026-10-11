import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Intro } from "@/components/intro";
import { PageTransition } from "@/components/page-transition";
import { PostList } from "@/components/post-list";
import { ProjectsSection } from "@/components/project-list";
import { SectionHeading } from "@/components/section-heading";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getAllPosts } from "@/lib/api";
import { markdownAlternate } from "@/lib/site";

export const metadata = { alternates: { canonical: "/", types: markdownAlternate("/llms.txt") } };

export default function Home() {
  const posts = getAllPosts().slice(0, 5);

  return (
    <PageTransition>
      <Intro />

      <hr className="rule-double" />

      <ProjectsSection />

      <hr />

      <section aria-labelledby="writing">
        <SectionHeading
          id="writing"
          aside={
            posts.length > 0 && (
              <Link href="/blog" className="tally text-link">
                All writing
                <ArrowRight aria-hidden="true" className="inline" size={13} />
              </Link>
            )
          }
        >
          Recent writing
        </SectionHeading>
        {posts.length > 0 ? (
          <PostList posts={posts} />
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
