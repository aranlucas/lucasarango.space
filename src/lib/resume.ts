// Resume content is a JSON Resume (https://jsonresume.org/schema) published from
// github.com/aranlucas/resume and pulled by scripts/sync-resume.ts. Edit the
// resume there, not the snapshot.
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** JSON Resume dates are "YYYY", "YYYY-MM", or "YYYY-MM-DD". */
function formatDate(iso: string): string {
  const [year, month] = iso.split("-");
  return month === undefined ? year : `${MONTHS[Number(month) - 1]} ${year}`;
}

function formatRange(startDate: string, endDate?: string): string {
  return `${formatDate(startDate)} – ${endDate === undefined ? "Present" : formatDate(endDate)}`;
}

export const RESUME_BASICS = {
  name: resume.basics.name,
  title: "Senior Software Engineer — AI products & platforms",
  location: "Seattle, Washington",
  linkedin: SITE.linkedin,
  github: SITE.github,
  summary: resume.basics.summary,
  lookingFor:
    "I’m interested in senior and staff engineering roles where I can help shape a product, build it, and make it dependable.",
} as const;

export const RESUME_ROLES: ResumeRole[] = resume.work.map((role) => ({
  company: role.name,
  title: role.position,
  location: role.location,
  dates: formatRange(role.startDate, role.endDate),
  bullets: role.highlights,
  // The DoorDash engineering-blog posts live on this site, not the resume.
  links:
    role.name === "DoorDash"
      ? PUBLICATIONS.map((post) => ({ label: post.title, href: post.href }))
      : undefined,
}));

export const RESUME_PROJECTS: ResumeProject[] = resume.projects.map((project) => ({
  name: project.name,
  url: project.url,
  kind: project.type,
  bullets: project.highlights,
}));

export const RESUME_SKILLS = resume.skills.map((skill) => ({
  category: skill.name,
  items: skill.keywords,
}));

export const RESUME_EDUCATION = resume.education.map((school) => ({
  school: school.institution,
  degree: [school.studyType, school.area, school.score].join(", "),
  location: school.location,
  dates: formatDate(school.endDate),
}));
