export const SITE = {
  name: "Lucas Arango",
  url: "https://lucasarango.space",
  description:
    "Software engineer in Seattle building AI products, agent platforms, and the systems that make them reliable. Work, projects, and writing by Lucas Arango.",
  github: "https://github.com/aranlucas",
  linkedin: "https://www.linkedin.com/in/lucasarango/",
} as const;

export const FEED_ALTERNATE = { "application/rss+xml": "/feed.xml" };

export const markdownPath = (slug: string) => `/blog/${slug}.md`;

/** Points agents that don't negotiate content at a Markdown version of the page. */
export const markdownAlternate = (href: string) => ({ ...FEED_ALTERNATE, "text/markdown": href });

export const SITE_OPEN_GRAPH = {
  siteName: SITE.name,
  type: "website" as const,
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }],
};

// Absolute URLs and ready-made links help models cite the exact published source.
export const postUrl = (slug: string) => `${SITE.url}/blog/${slug}`;

export const postLink = (title: string, slug: string) => `[${title}](${postUrl(slug)})`;

export function postSlug(post: string) {
  const path = URL.parse(post, SITE.url)?.pathname ?? post;
  const slug = /^\/blog\/([^/]+?)(?:\.md)?\/?$/u.exec(path)?.[1] ?? post.replace(/\.md$/u, "");

  // Untrusted agent input must never escape the posts directory.
  return /^[\w-]+$/u.test(slug) ? slug : undefined;
}
