import oxforge from "@aranlucas/oxforge/format-tailwind";

const config = {
  ...oxforge,
  sortTailwindcss: {
    ...oxforge.sortTailwindcss,
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
