import type { Metadata } from "next";

import { PageTransition } from "@/components/page-transition";
import { PostList } from "@/components/post-list";
import { PublicationList } from "@/components/publication-list";
import { SectionHeading } from "@/components/section-heading";
import { getPosts } from "@/lib/posts";
import { FEED_ALTERNATE, SITE_OPEN_GRAPH } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes from Lucas Arango on building agents, AI products and software.",
  alternates: { canonical: "/blog", types: FEED_ALTERNATE },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/blog" },
};

export default async function BlogIndex() {
  const posts = await getPosts();
  const years = Map.groupBy(posts, (post) => post.date.slice(0, 4));

  return (
    <PageTransition>
      <h1 className="mb-4 text-display font-semibold tracking-tight">Writing</h1>
      <p className="text-lede text-pretty">
        Notes on building agents, AI products, and the tools I make along the way. Mostly things
        I’ve built, decisions I’ve made, and what I learned from using them.
      </p>
      {[...years].map(([year, yearPosts]) => (
        <section key={year} aria-labelledby={`y${year}`}>
          <SectionHeading id={`y${year}`} className="tabular-nums">
            {year}
          </SectionHeading>
          <PostList posts={yearPosts} />
        </section>
      ))}
      <section aria-labelledby="elsewhere">
        <SectionHeading id="elsewhere">Writing elsewhere</SectionHeading>
        <p className="mb-6 text-base text-muted-foreground">
          Articles I coauthored with the DoorDash engineering team.
        </p>
        <PublicationList />
      </section>
    </PageTransition>
  );
}
