import oxforge from "@aranlucas/oxforge/format-config";

const config = {
  ...oxforge,
  sortTailwindcss: {
    functions: ["cn", "cva"],
    stylesheet: "./src/app/globals.css",
  },
  ignorePatterns: [
    "pnpm-lock.yaml",
    "src/components/ui/**",
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
