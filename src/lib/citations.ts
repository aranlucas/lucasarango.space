import { PROJECTS } from "@/lib/projects";
import { SITE } from "@/lib/site";

const RESUME_SECTIONS = ["summary", "experience", "projects", "writing", "skills", "education"];

/** Only link to published site content and explicitly curated public sources. */
export function citationUrl(href: string | undefined, postSources: readonly string[]) {
  if (href === undefined || href.startsWith("//")) {
    return;
  }

  const url = URL.parse(href, SITE.url);

  if (url?.username !== "" || url.password !== "") {
    return;
  }

  const allowed = new Set([
    SITE.github,
    SITE.linkedin,
    `${SITE.url}/#projects`,
    `${SITE.url}/resume`,
    ...RESUME_SECTIONS.map((section) => `${SITE.url}/resume#${section}`),
    ...PROJECTS.flatMap((project) => [
      project.source,
      ...(project.demo === undefined ? [] : [project.demo]),
      ...(project.story === undefined ? [] : [`${SITE.url}${project.story}`]),
    ]),
    ...postSources,
  ]);

  return allowed.has(url.href) ? url : undefined;
}
