import { format } from "@aranlucas/oxforge/format";

const config = {
  ...format({ sortTailwindcss: { stylesheet: "./src/app/globals.css" } }),
  // Preserve the project's replacement ignore list rather than adding shared ignores.
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
