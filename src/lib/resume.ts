import { SITE, PUBLICATIONS } from "@/lib/site";

export type ResumeLink = { label: string; href: string };

export type ResumeRole = {
  company: string;
  title: string;
  location: string;
  dates: string;
  bullets: string[];
  links?: ResumeLink[];
};

export const RESUME_BASICS = {
  name: SITE.name,
  title: "Senior Software Engineer — AI products & platforms",
  location: "Seattle, Washington",
  linkedin: SITE.linkedin,
  github: SITE.github,
  summary:
    "I’m a software engineer with 10+ years at DoorDash, AWS, and Amazon. I build AI products and cloud services, working across product, backend, and infrastructure. Most recently, I led Ask DoorDash’s grocery agent from prototype to launch, built shared agent infrastructure, and helped teams make their services more reliable.",
  lookingFor:
    "I’m interested in senior and staff engineering roles where I can help shape a product, build it, and make it dependable.",
} as const;

export const RESUME_ROLES: ResumeRole[] = [
  {
    company: "DoorDash",
    title: "Senior Software Engineer",
    location: "Seattle, WA",
    dates: "Oct 2023 – Aug 2026",
    bullets: [
      "Prototyped and led engineering for Ask DoorDash’s grocery agent, launched June 2026: turned recipe links, photos, and natural-language requests into personalized shopping lists and carts.",
      "Wrote the agent-platform strategy and secured leadership support to expand from external MCP grocery ordering to the in-app Assistant, coordinating delivery across engineering, ML, product, and design.",
      "Owned New Verticals agent infrastructure and reliability, including shared Model Context Protocol (MCP) tools used by the grocery and restaurant agents, DoorDash’s ChatGPT integration, and developer CLI.",
      "Built DashMart’s integration-test framework on isolated test tenants and moved execution from Jenkins to Buildkite on Kubernetes. Set org-wide performance standards with golden-path SLOs and blocking CI regression gates.",
      "Shipped DashMart warehouse workflow and consumer web personalization improvements for first-party grocery and convenience.",
      "Mentored engineers on agent architecture and MCP tool design; drove adoption of Claude Code and Codex with architecture and security review before merge.",
    ],
    links: [
      {
        label: "Ask DoorDash announcement",
        href: "https://about.doordash.com/en-us/news/ask-doordash",
      },
      ...PUBLICATIONS.map((post) => ({ label: post.title, href: post.href })),
    ],
  },
  {
    company: "Career Break",
    title: "Intentional time off",
    location: "Seattle, WA",
    dates: "Jul 2022 – Oct 2023",
    bullets: [
      "Took intentional time off for travel, hiking, camping, and personal projects before joining DoorDash.",
    ],
  },
  {
    company: "Amazon Web Services",
    title: "Software Development Engineer, AWS IoT",
    location: "Seattle, WA",
    dates: "Jul 2019 – Jul 2022",
    bullets: [
      "Built the AWS IoT SiteWise Monitor control plane (Go, DynamoDB, API Gateway), announced at re:Invent; led operational readiness review and launched the service to general availability.",
      "Led the IoT Console migration from Angular to React via microfrontends with independent CDK pipelines — 5+ sub-teams shipping independently, release lead time from weeks to days.",
      "Designed SSO federation for SiteWise Monitor and built AWS Synthetics canaries for the IoT Console.",
    ],
  },
  {
    company: "Amazon",
    title: "Software Development Engineer, Compliance Technologies",
    location: "Seattle, WA",
    dates: "Jul 2015 – Jul 2019",
    bullets: [
      "Built a case-management platform for anti-money-laundering and identity-theft investigations using Ruby on Rails and Java Spring, with encryption, granular access controls, audit logging, and secure artifact storage.",
      "Led design and development of suspicious-transaction reporting (STR/SAR) systems for the Luxembourg Financial Intelligence Unit and UK National Crime Agency, meeting requirements for Amazon payments in both markets.",
    ],
  },
  {
    company: "Amazon",
    title: "Software Development Engineer Intern",
    location: "Seattle, WA",
    dates: "May 2014 – Aug 2014",
    bullets: ["Integrated Kindle Unlimited books into Goodreads."],
  },
  {
    company: "BlackBerry",
    title: "Software Development Engineer Intern",
    location: "Sunrise, FL",
    dates: "Jan 2013 – Aug 2013",
    bullets: [
      "Developed and maintained software for BlackBerry handhelds; smoke, regression, GUI, and functional testing on device hardware.",
    ],
  },
];

export const RESUME_PROJECTS = {
  heading: "Personal projects",
  intro:
    "I build and operate a personal agent platform for grocery shopping, travel, fitness, and coordinated wellness planning.",
  bullets: [
    "Go agents built with Google ADK behind a gateway on Railway; Cloudflare D1 stores sessions and R2 stores artifacts. A Next.js/CopilotKit web console, Telegram worker, and Expo mobile app bring the agents into everyday use.",
    "A wellness agent delegates to grocery and fitness agents through shared typed state. Live Kroger and travel integrations ground recommendations in real data; the mobile app syncs Android Health Connect activity for fitness planning.",
    "Built System Design Companion, a multiplayer Excalidraw whiteboard with an MCP server, semantic diagram editing, version history, and one Cloudflare Durable Object per diagram.",
    "Maintain public MCP tools and plugins for groceries, workouts, travel, repository maintenance, and collaborative system design. The grocery project inspired my Ask DoorDash pitch.",
  ],
} as const;

export const RESUME_SKILLS = {
  languages: "Go, TypeScript, JavaScript, Java, Kotlin, Python, Ruby, SQL",
  agents: "Google ADK, MCP, AG-UI, CopilotKit, Claude Code, Codex",
  platforms:
    "AWS, DynamoDB, API Gateway, CDK, Synthetics, Cloudflare Workers, Durable Objects, D1, R2, Docker, Kubernetes, Buildkite",
  web: "React, Next.js, Expo, Redux, Java Spring, Ruby on Rails",
} as const;

export const RESUME_EDUCATION = {
  school: "University of Florida",
  degree: "B.S., Computer Engineering",
  location: "Gainesville, FL",
  dates: "Sept 2010 – May 2015",
  details: "Graduated cum laude",
} as const;
