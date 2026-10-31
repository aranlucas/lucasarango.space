import type { Metadata } from "next";

import { PageTransition } from "@/components/page-transition";
import { PublicationList } from "@/components/publication-list";
import { SectionHeading } from "@/components/section-heading";
import { WritingArchive } from "@/components/writing-archive";
import { getAllPosts } from "@/lib/api";
import { markdownAlternate, SITE_OPEN_GRAPH } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes from Lucas Arango on building agents, AI products and software.",
  alternates: { canonical: "/blog", types: markdownAlternate("/blog/sitemap.md") },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <PageTransition>
      <div className="reading-index">
        <h1 className="page-title">Writing</h1>
        <p className="page-lede">
          Notes on building agents, AI products, and the tools I make along the way. Mostly things
          I’ve built, decisions I’ve made, and what I learned from using them.
        </p>
        <hr className="rule-double" />
        <WritingArchive posts={posts} />
        <section aria-labelledby="elsewhere">
          <SectionHeading id="elsewhere">Writing elsewhere</SectionHeading>
          <p className="mbe-3 text-muted-foreground">
            Articles I coauthored with the DoorDash engineering team.
          </p>
          <PublicationList />
        </section>
      </div>
    </PageTransition>
  );
}
