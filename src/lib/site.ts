export const SITE = {
  name: "Lucas Arango",
  url: "https://lucasarango.space",
  description:
    "Lucas Arango is a software engineer in Seattle who builds conversational AI products and agents. Notes on what he's building.",
  github: "https://github.com/aranlucas",
  linkedin: "https://www.linkedin.com/in/lucasarango/",
} as const;

export type Role = { company: string; title: string; years: string; note?: string };

export const WORK: Role[] = [
  {
    company: "DoorDash",
    title: "Senior Software Engineer",
    years: "2023 – 2026",
    note: "Pitched, prototyped and led Ask DoorDash, the conversational shopping assistant.",
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
