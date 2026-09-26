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

export const PUBLICATIONS = [
  {
    title: "A platform for building and evolving agents",
    href: "https://careersatdoordash.com/blog/building-ask-doordash-part-four-a-platform-for-building_and_evolving_agents/",
    date: "2026-07-24",
    summary:
      "The shared platform behind Ask DoorDash: agent orchestration, MCP tools, durable state, and the tradeoffs in deciding what to standardize.",
  },
  {
    title: "Building DoorDash Assistant: an engineering overview",
    href: "https://careersatdoordash.com/blog/building-doordash-assistant-an-engineering-overview/",
    date: "2026-06-11",
    summary:
      "How intelligence, evaluation, platform, and user experience fit together in a conversational shopping product.",
  },
] as const;
