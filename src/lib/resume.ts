// Resume content comes from github.com/aranlucas/resume (generated from the
// LaTeX source) via scripts/sync-resume.ts. Edit the LaTeX, not the snapshot.
import resume from "@/generated/resume.json";
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

export type ResumeProject = {
  name: string;
  url?: string;
  kind: string;
  bullets: string[];
};

function uniqueLinks(links: ResumeLink[]): ResumeLink[] | undefined {
  const byHref = new Map(links.map((link) => [link.href, link]));
  return byHref.size > 0 ? [...byHref.values()] : undefined;
}

export const RESUME_BASICS = {
  name: resume.name,
  title: "Senior Software Engineer — AI products & platforms",
  location: "Seattle, Washington",
  linkedin: SITE.linkedin,
  github: SITE.github,
  summary: resume.summary,
  lookingFor:
    "I’m interested in senior and staff engineering roles where I can help shape a product, build it, and make it dependable.",
} as const;

export const RESUME_ROLES: ResumeRole[] = resume.experience.map((role) => ({
  company: role.company,
  title: role.title,
  location: role.location,
  dates: role.dates,
  bullets: role.bullets.map((bullet) => bullet.text),
  links: uniqueLinks([
    ...role.bullets.flatMap((bullet) => bullet.links),
    // The DoorDash engineering-blog posts live on this site, not the resume.
    ...(role.company === "DoorDash"
      ? PUBLICATIONS.map((post) => ({ label: post.title, href: post.href }))
      : []),
  ]),
}));

export const RESUME_PROJECTS: ResumeProject[] = resume.projects.map((project) => ({
  name: project.name,
  url: project.url,
  kind: project.kind,
  bullets: project.bullets.map((bullet) => bullet.text),
}));

export const RESUME_SKILLS: { category: string; items: string[] }[] = resume.skills;

export const RESUME_EDUCATION = resume.education;
