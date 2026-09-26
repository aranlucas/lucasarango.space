import { Intro } from "@/components/intro";
import { PageTransition } from "@/components/page-transition";
import { PostList } from "@/components/post-list";
import { SectionHeading } from "@/components/section-heading";
import { TextLink } from "@/components/site-header";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { WorkList } from "@/components/work-list";
import { getPosts } from "@/lib/posts";
import { WORK } from "@/lib/site";

export default async function Home() {
  const posts = (await getPosts()).slice(0, 5);

  return (
    <PageTransition>
      <Intro />

      <section aria-labelledby="writing">
        <SectionHeading id="writing">Recent writing</SectionHeading>
        {posts.length > 0 ? (
          <>
            <PostList posts={posts} />
            <TextLink href="/blog" className="no-underline hover:underline">
              All writing
            </TextLink>
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
      </section>
    </PageTransition>
  );
}
