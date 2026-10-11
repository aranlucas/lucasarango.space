import { formatMonth, LOOKING_FOR, type Resume } from "@/lib/resume";
import { SITE } from "@/lib/site";

const bullets = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");

const link = (text: string, href?: string) => (href === undefined ? text : `[${text}](${href})`);

// The résumé page's sections, in page order.
const SECTIONS: [heading: string, render: (resume: Resume) => string][] = [
  ["Summary", (resume) => `${resume.summary}\n\n${LOOKING_FOR}`],
  [
    "Experience",
    (resume) =>
      resume.roles
        .map(
          (role) =>
            `### ${role.company}\n\n${role.title}, ${role.location} · ${role.dates}\n\n${bullets(role.bullets)}`,
        )
        .join("\n\n"),
  ],
  [
    "Personal projects",
    (resume) =>
      resume.projects
        .map((project) => `### ${link(project.name, project.url)}\n\n${bullets(project.bullets)}`)
        .join("\n\n"),
  ],
  [
    "Writing",
    (resume) =>
      resume.publications
        .map(
          (post) =>
            `- ${link(post.title, post.href)} · ${post.publisher}, ${formatMonth(post.date)}`,
        )
        .join("\n"),
  ],
  [
    "Skills",
    (resume) =>
      resume.skills.map((skill) => `- **${skill.category}:** ${skill.items.join(", ")}`).join("\n"),
  ],
  [
    "Education",
    (resume) =>
      resume.education
        .map(
          (school) =>
            `### ${school.school}\n\n${school.degree}, ${school.location} · ${school.dates}`,
        )
        .join("\n\n"),
  ],
];

/** The résumé page as agents receive it: frontmatter, then each section of the page. */
export function resumeToMarkdown(resume: Resume) {
  // JSON strings are valid YAML scalars, as in the post frontmatter.
  const frontmatter = [
    `title: ${JSON.stringify(`${resume.name} résumé`)}`,
    `author: ${JSON.stringify(SITE.name)}`,
    "url: /resume",
    `canonical_url: ${SITE.url}/resume`,
  ].join("\n");

  const profiles = resume.profiles.map((profile) => link(profile.label, profile.href)).join(" · ");
  const sections = SECTIONS.map(([heading, render]) => `## ${heading}\n\n${render(resume)}`);

  return `---\n${frontmatter}\n---\n\n# ${resume.name}\n\n${resume.title} · ${resume.location}\n\n${profiles}\n\n${sections.join("\n\n")}\n`;
}
