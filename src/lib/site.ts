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

export type Role = { company: string; title: string; years: string; note?: string };

export const WORK: Role[] = [
  {
    company: "DoorDash",
    title: "Senior Software Engineer",
    years: "Oct 2023 – Aug 2026",
    note: "Prototyped and led Ask DoorDash’s grocery agent; built shared agent infrastructure and reliability tooling.",
  },
  {
    company: "Amazon Web Services",
    title: "Software Development Engineer, AWS IoT",
    years: "2019 – 2022",
    note: "Launched the IoT SiteWise Monitor control plane; moved the IoT Console to microfrontends.",
  },
  {
    company: "Amazon",
    title: "Software Development Engineer, Compliance Technologies",
    years: "2015 – 2019",
    note: "Built the case management platform for financial crime investigations.",
  },
];

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
