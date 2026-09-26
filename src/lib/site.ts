export const SITE = {
  name: "Lucas Arango",
  url: "https://lucasarango.space",
  description:
    "Software engineer in Seattle building AI products, agent platforms, and the systems that make them reliable. Work, projects, and writing by Lucas Arango.",
  github: "https://github.com/aranlucas",
  linkedin: "https://www.linkedin.com/in/lucasarango/",
} as const;

export const FEED_ALTERNATE = { "application/rss+xml": "/feed.xml" };

export const SITE_OPEN_GRAPH = {
  siteName: SITE.name,
  type: "website" as const,
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }],
};
