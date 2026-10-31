"use client";

import { useState } from "react";

import { PostList } from "@/components/post-list";
import { SectionHeading } from "@/components/section-heading";
import type { Post } from "@/interfaces/post";
import { searchPosts } from "@/lib/post-search";

type ArchiveProps = { posts: Post[] };

type SearchResultsProps = ArchiveProps & { query: string; clear: () => void };

export function WritingArchive({ posts }: ArchiveProps) {
  const [query, setQuery] = useState("");
  const search = query.trim();
  const matches = searchPosts(posts, { query: search }).posts;

  const clear = () => {
    setQuery("");
  };

  return (
    <>
      <div className="writing-search" role="search">
        <label htmlFor="writing-query">Search writing</label>
        <div className="writing-search-controls">
          <input
            id="writing-query"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            maxLength={200}
            placeholder="A topic, project, or question"
          />
          {search !== "" && (
            <button type="button" onClick={clear}>
              Clear
            </button>
          )}
        </div>
      </div>
      {search === "" ? (
        <YearArchive posts={posts} />
      ) : (
        <SearchResults posts={matches} query={search} clear={clear} />
      )}
    </>
  );
}

function YearArchive({ posts }: ArchiveProps) {
  const years = Map.groupBy(posts, (post) => post.date.slice(0, 4));

  return [...years].map(([year, yearPosts]) => (
    <section key={year} aria-labelledby={`y${year}`}>
      <SectionHeading
        id={`y${year}`}
        className="tabular-nums"
        aside={<span className="tally">Qty {yearPosts.length}</span>}
      >
        {year}
      </SectionHeading>
      <PostList posts={yearPosts} summaries />
    </section>
  ));
}

function SearchResults({ posts, query, clear }: SearchResultsProps) {
  return (
    <section aria-labelledby="search-results" aria-live="polite">
      <SectionHeading id="search-results" aside={<span className="tally">Qty {posts.length}</span>}>
        Search results
      </SectionHeading>
      {posts.length === 0 ? (
        <p className="mbe-6 text-sm text-muted-foreground">
          No posts matched “{query}”. Try another topic or{" "}
          <button type="button" className="text-link" onClick={clear}>
            browse all writing
          </button>
          .
        </p>
      ) : (
        <PostList posts={posts} summaries />
      )}
    </section>
  );
}
