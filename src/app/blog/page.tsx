import type { Metadata } from "next";

import { PageTransition } from "@/components/page-transition";
import { PostList } from "@/components/post-list";
import { SectionHeading } from "@/components/section-heading";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes from Lucas Arango on building agents, AI products and software.",
};

export default async function BlogIndex() {
  const posts = await getPosts();
  const years = Map.groupBy(posts, (post) => post.date.slice(0, 4));

  return (
    <PageTransition>
      <h1 className="mb-4 text-display font-semibold tracking-tight">Writing</h1>
      <p className="text-lede text-pretty">
        Notes on building agents, AI products, and the tools I make along the way.
      </p>
      {[...years].map(([year, yearPosts]) => (
        <section key={year} aria-labelledby={`y${year}`}>
          <SectionHeading id={`y${year}`} className="tabular-nums">
            {year}
          </SectionHeading>
          <PostList posts={yearPosts} />
        </section>
      ))}
    </PageTransition>
  );
}
