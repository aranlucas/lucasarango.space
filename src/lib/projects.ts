// Public projects, verified against their repository READMEs.
export const PROJECTS = [
  {
    name: "Grocery shopping MCP",
    description:
      "An agent for my weekly grocery run. It finds Kroger/QFC products, plans around the pantry, and builds a cart I can review. This is the project that inspired my Ask DoorDash pitch.",
    source: "https://github.com/aranlucas/ai-shopping-mcp",
    story: "/blog/the-first-ask-doordash-prototype-was-an-mcp-server",
  },
  {
    name: "System Design Companion",
    description:
      "A whiteboard for thinking through system designs with an AI drawing alongside me. We share the same canvas, and version history makes it easy to try an idea and undo it.",
    source: "https://github.com/aranlucas/system-design-companion",
    story: "/blog/practicing-system-design-with-an-ai-on-the-whiteboard",
  },
  {
    name: "Lucas Plugins",
    description:
      "A small collection that keeps my grocery, workout, travel, repository-maintenance, and whiteboard tools together. I can bring the same tools to Claude Code and Cursor without setting each one up by hand.",
    source: "https://github.com/aranlucas/lucas-plugins",
    story: "/blog/one-plugin-repo-for-all-my-mcp-servers",
  },
] as const;
