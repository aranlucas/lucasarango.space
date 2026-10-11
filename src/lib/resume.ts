// The resume is a JSON Resume (https://jsonresume.org/schema) published from
// github.com/aranlucas/resume. It is fetched at build time and cached for 30
// days; the resume repo's deploy calls /api/revalidate to refresh it sooner.

import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";

export const RESUME_CACHE_TAG = "resume";

/** Closes the summary on the page and in its Markdown version. */
export const LOOKING_FOR =
  "I’m interested in senior and staff engineering roles where I can help shape a product, build it, and make it dependable.";

export const RESUME_API = (
  process.env.RESUME_API_URL ?? "https://resume-api.aranlucas.workers.dev"
).replace(/\/$/u, "");

const RESUME_URL = `${RESUME_API}/resume.json`;

const YearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/u, "expected YYYY-MM");

/** The subset of JSON Resume (https://jsonresume.org/schema) this site reads. */
const JsonResume = z.object({
  basics: z.object({
    name: z.string(),
    label: z.string(),
    summary: z.string(),
    location: z.object({ city: z.string(), region: z.string() }),
    profiles: z.array(z.object({ network: z.string(), url: z.url() })),
  }),
  work: z.array(
    z.object({
      name: z.string(),
      position: z.string(),
      location: z.string(),
      startDate: YearMonth,
      endDate: YearMonth.optional(),
      highlights: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      url: z.url().optional(),
      type: z.string(),
      highlights: z.array(z.string()),
    }),
  ),
  publications: z.array(
    z.object({
      name: z.string(),
      publisher: z.string(),
      releaseDate: YearMonth,
      url: z.url(),
      summary: z.string(),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      location: z.string(),
      studyType: z.string(),
      area: z.string(),
      score: z.string(),
      endDate: YearMonth,
    }),
  ),
  skills: z.array(z.object({ name: z.string(), keywords: z.array(z.string()) })),
});

export type ResumeRole = {
  company: string;
  title: string;
  location: string;
  dates: string;
  bullets: string[];
};

export type ResumeProject = { name: string; url?: string; kind: string; bullets: string[] };

export type Publication = {
  title: string;
  href: string;
  publisher: string;
  date: string;
  summary: string;
};

/** "2023-10" → "Oct 2023", or "October 2023" with style "long". */
export function formatMonth(yearMonth: string, style: "short" | "long" = "short"): string {
  return new Date(`${yearMonth}-15T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: style,
    year: "numeric",
  });
}

const formatRange = (start: string, end?: string) =>
  `${formatMonth(start)} – ${end === undefined ? "Present" : formatMonth(end)}`;

const displayUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/u, "").replace(/\/$/u, "");

async function fetchResume(): Promise<z.infer<typeof JsonResume>> {
  "use cache";
  cacheLife("max");
  cacheTag(RESUME_CACHE_TAG);

  const res = await fetch(RESUME_URL);

  if (!res.ok) throw new Error(`GET ${RESUME_URL} → ${res.status}`);

  return JsonResume.parse(await res.json());
}

export async function getResume() {
  const { basics, work, projects, publications, education, skills } = await fetchResume();

  const posts: Publication[] = publications.map((post) => ({
    title: post.name,
    href: post.url,
    publisher: post.publisher,
    date: post.releaseDate,
    summary: post.summary,
  }));

  return {
    name: basics.name,
    title: basics.label,
    location: `${basics.location.city}, ${basics.location.region}`,
    profiles: basics.profiles.map((p) => ({ label: displayUrl(p.url), href: p.url })),
    summary: basics.summary,
    roles: work.map((role): ResumeRole => ({
      company: role.name,
      title: role.position,
      location: role.location,
      dates: formatRange(role.startDate, role.endDate),
      bullets: role.highlights,
    })),
    projects: projects.map((project): ResumeProject => ({
      name: project.name,
      url: project.url,
      kind: project.type,
      bullets: project.highlights,
    })),
    publications: posts,
    skills: skills.map((skill) => ({ category: skill.name, items: skill.keywords })),
    education: education.map((school) => ({
      school: school.institution,
      degree: [school.studyType, school.area, school.score].join(", "),
      location: school.location,
      dates: formatMonth(school.endDate),
    })),
  };
}

export type Resume = Awaited<ReturnType<typeof getResume>>;
