// Public projects, verified against their repository READMEs.
export const PROJECTS = [
  {
    name: "Grocery shopping MCP",
    description:
      "An agent that helps with my actual grocery run: finding Kroger/QFC products, planning around the pantry, and building a cart. Shopping lists are editable right in the conversation.",
    detail: "The personal project that inspired my Ask DoorDash pitch.",
    stack: "TypeScript · Cloudflare · MCP Apps · Kroger OAuth",
    source: "https://github.com/aranlucas/ai-shopping-mcp",
    story: "/blog/the-first-ask-doordash-prototype-was-an-mcp-server",
  },
  {
    name: "System Design Companion",
    description:
      "A shared whiteboard where people and an AI agent draw together. The agent works with components and connections, sees what I select, and can review a design without losing the conversation’s context.",
    detail: "Built for system design practice, with multiplayer presence and version history.",
    stack: "React · Excalidraw · Durable Objects · MCP",
    source: "https://github.com/aranlucas/system-design-companion",
    story: "/blog/practicing-system-design-with-an-ai-on-the-whiteboard",
  },
  {
    name: "Lucas Plugins",
    description:
      "A single home for my grocery, workout, travel, repository-maintenance, and whiteboard tools. Each plugin packages a hosted MCP server with instructions for using it well.",
    detail: "One maintained source, with generated catalogs for Claude Code and Cursor.",
    stack: "MCP · Agent Plugins · Python · CI validation",
    source: "https://github.com/aranlucas/lucas-plugins",
    story: "/blog/one-plugin-repo-for-all-my-mcp-servers",
  },
] as const;
