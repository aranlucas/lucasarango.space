// The resume is a JSON Resume (https://jsonresume.org/schema) published from
// github.com/aranlucas/resume. It is fetched at build time and cached for 30
// days; the resume repo's deploy calls /api/revalidate to refresh it sooner.

export const RESUME_CACHE_TAG = "resume";

const RESUME_API = (
  process.env.RESUME_API_URL ?? "https://resume-api.aranlucas.workers.dev"
).replace(/\/$/u, "");
const RESUME_URL = `${RESUME_API}/resume.json`;

/** The subset of JSON Resume this site reads. Dates are always "YYYY-MM". */
type JsonResume = {
  basics: {
    name: string;
    label: string;
    summary: string;
    location: { city: string; region: string };
    profiles: { network: string; url: string }[];
  };
  work: {
    name: string;
    position: string;
    location: string;
    startDate: string;
    endDate?: string;
    highlights: string[];
  }[];
  projects: { name: string; url?: string; type: string; highlights: string[] }[];
  publications: {
    name: string;
    publisher: string;
    releaseDate: string;
    url: string;
    summary: string;
  }[];
  education: {
    institution: string;
    location: string;
    studyType: string;
    area: string;
    score: string;
    endDate: string;
  }[];
  skills: { name: string; keywords: string[] }[];
};

export type ResumeLink = { label: string; href: string };

export type ResumeRole = {
  company: string;
  title: string;
  location: string;
  dates: string;
  bullets: string[];
  links?: ResumeLink[];
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

function isJsonResume(value: unknown): value is JsonResume {
  return typeof value === "object" && value !== null && "basics" in value && "work" in value;
}

async function fetchResume(): Promise<JsonResume> {
  const res = await fetch(RESUME_URL, {
    next: { revalidate: 60 * 60 * 24 * 30, tags: [RESUME_CACHE_TAG] },
  });
  if (!res.ok) throw new Error(`GET ${RESUME_URL} → ${res.status}`);
  const data: unknown = await res.json();
  if (!isJsonResume(data)) throw new Error(`${RESUME_URL} is not a JSON Resume`);
  return data;
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
      // The DoorDash engineering-blog posts belong with the DoorDash role.
      links:
        role.name === "DoorDash"
          ? posts.map((post) => ({ label: post.title, href: post.href }))
          : undefined,
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
