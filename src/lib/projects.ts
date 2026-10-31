import { SITE } from "@/lib/site";

type Project = {
  name: string;
  description: string;
  status: string;
  source: string;
  story?: string;
  demo?: string;
};

// Public projects, verified against their repository READMEs.
export const PROJECTS: readonly Project[] = [
  {
    name: "Grocery shopping MCP",
    description:
      "An agent for my weekly grocery run. It finds Kroger/QFC products, plans around the pantry, and builds a cart I can review. This is the project that inspired my Ask DoorDash pitch.",
    status: "Source available",
    source: "https://github.com/aranlucas/ai-shopping-mcp",
    story: "/blog/the-first-ask-doordash-prototype-was-an-mcp-server",
  },
  {
    name: "System Design Companion",
    description:
      "A whiteboard for thinking through system designs with an AI drawing alongside me. We share the same canvas, and version history makes it easy to try an idea and undo it.",
    status: "Hosted app · Sign-in to create a board",
    source: "https://github.com/aranlucas/system-design-companion",
    story: "/blog/practicing-system-design-with-an-ai-on-the-whiteboard",
    demo: "https://system-design-companion.aranlucas.workers.dev/",
  },
  {
    name: "Lucas Plugins",
    description:
      "A small collection that keeps my grocery, workout, travel, repository-maintenance, and whiteboard tools together. I can bring the same tools to Claude Code and Cursor without setting each one up by hand.",
    status: "Source available",
    source: "https://github.com/aranlucas/lucas-plugins",
    story: "/blog/one-plugin-repo-for-all-my-mcp-servers",
  },
  {
    name: "Roomform",
    description:
      "An interior design studio for exploring ideas from room photos, product references, and estimated 3D layouts. Generated designs are visualizations, not measurements.",
    status: "Source available",
    source: "https://github.com/aranlucas/ikea-interior-design",
  },
];

/** The same public projects shown on the home page, with links agents can share. */
export function projectsMarkdown() {
  return `# Projects by ${SITE.name}\n\n${PROJECTS.map(
    (project) =>
      `## ${project.name}\n\n${project.description}\n\nStatus: ${project.status}\n\n- [Source](${project.source})${project.story === undefined ? "" : `\n- [Story](${SITE.url}${project.story})`}${project.demo === undefined ? "" : `\n- [Hosted app](${project.demo})`}`,
  ).join("\n\n")}\n`;
}
