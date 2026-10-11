import type { Post } from "@/interfaces/post";
import { markdownPath, SITE } from "@/lib/site";

export const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  // The same URL serves HTML to browsers, so caches must key on Accept.
  Vary: "Accept",
};

/** A post as agents receive it: frontmatter, then the body the page renders. */
export function postToMarkdown(post: Post) {
  const path = `/blog/${post.slug}`;

  // JSON strings are valid YAML scalars, so titles with colons or quotes stay intact.
  const frontmatter = [
    `title: ${JSON.stringify(post.title)}`,
    `author: ${JSON.stringify(SITE.name)}`,
    `date: ${post.date}`,
    `url: ${path}`,
    `canonical_url: ${SITE.url}${path}`,
    `summary: ${JSON.stringify(post.summary)}`,
  ].join("\n");

  return `---\n${frontmatter}\n---\n\n# ${post.title}\n\n${post.content.trim()}\n`;
}

/**
 * The blog index as a Markdown sitemap. Each post links its page, which agents
 * cite to people, and its Markdown version, which they read.
 */
export function blogIndexMarkdown(posts: Post[], query = "") {
  const terms = query.trim().toLowerCase().split(/\s+/u).filter(Boolean);

  const matches = posts.filter((post) => {
    const searchable = `${post.title}\n${post.summary}\n${post.content}`.toLowerCase();

    return terms.every((term) => searchable.includes(term));
  });

  const items = matches
    .map(
      (post) =>
        `- [${post.title}](${SITE.url}/blog/${post.slug}) (${post.date}, [Markdown](${SITE.url}${markdownPath(post.slug)})): ${post.summary}${terms.length > 0 ? `\n  Excerpt: ${postExcerpt(post.content, terms)}` : ""}`,
    )
    .join("\n");

  const introduction =
    terms.length > 0
      ? `Search results for ${JSON.stringify(query.trim())}. Matches all query words in titles, summaries, or post bodies; newest first.\n\n${matches.length > 0 ? "Read the linked post for full context." : "No matching posts. Try fewer words or call list_posts without a query."}`
      : "Notes on building agents, AI products, and the tools I make along the way.";

  return `# Writing by ${SITE.name}\n\n${introduction}\n\n${items}\n`;
}

function postExcerpt(content: string, terms: string[]) {
  const body = content.trim().replaceAll(/\s+/gu, " ");

  const firstMatch = terms
    .values()
    .map((term) => body.toLowerCase().indexOf(term))
    .filter((index) => index >= 0)
    .toArray();

  const start = Math.max(0, (firstMatch.length > 0 ? Math.min(...firstMatch) : 0) - 80);
  const excerpt = body.slice(start, start + 240);

  return `${start ? "…" : ""}${excerpt}${start + 240 < body.length ? "…" : ""}`;
}

/** The site-wide index described at https://llmstxt.org. */
export function llmsTxt(posts: Post[]) {
  const items = posts
    .map((post) => `- [${post.title}](${SITE.url}${markdownPath(post.slug)}): ${post.summary}`)
    .join("\n");

  return `# ${SITE.name}

> ${SITE.description}

The home page, blog pages, and résumé return Markdown when requested with \`Accept: text/markdown\`. Each post is also available as Markdown by appending \`.md\` to its URL.

## Writing

${items}

## Elsewhere

- [Blog index](${SITE.url}/blog/sitemap.md): every post with its summary
- [Resume](${SITE.url}/resume.md): work history and skills
- [RSS feed](${SITE.url}/feed.xml)
- [GitHub](${SITE.github})
`;
}
