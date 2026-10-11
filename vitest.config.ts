import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts"],
          globals: false,
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./src/vitest.setup.ts"],
          globals: false,
        },
      },
      {
        // Real Chrome against the production build: `pnpm build && pnpm test:chrome`.
        extends: true,
        test: {
          name: "chrome",
          environment: "node",
          include: ["e2e/**/*.test.ts"],
          globalSetup: ["./e2e/serve.ts"],
          testTimeout: 30_000,
          hookTimeout: 60_000,
          globals: false,
        },
      },
    ],
  },
});
