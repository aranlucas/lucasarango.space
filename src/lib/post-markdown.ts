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
export function blogIndexMarkdown(posts: Post[]) {
  const items = posts
    .map(
      (post) =>
        `- [${post.title}](/blog/${post.slug}) (${post.date}, [Markdown](${markdownPath(post.slug)})): ${post.summary}`,
    )
    .join("\n");

  return `# Writing by ${SITE.name}\n\nNotes on building agents, AI products, and the tools I make along the way.\n\n${items}\n`;
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
