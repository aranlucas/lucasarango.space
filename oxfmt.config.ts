import oxforge from "@aranlucas/oxforge/format-config";

const config = {
  ...oxforge,
  sortTailwindcss: {
    functions: ["cn", "cva"],
    stylesheet: "./src/app/globals.css",
  },
  ignorePatterns: [
    "pnpm-lock.yaml",
    ".agent/**",
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".continue/**",
    ".cursor/**",
    ".gemini/**",
    ".opencode/**",
    ".pi/**",
    ".roo/**",
    ".windsurf/**",
  ],
};

export default config;
