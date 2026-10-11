import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3217",
    extraHTTPHeaders: { Accept: "application/json" },
  },
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3217",
    url: "http://127.0.0.1:3217",
    reuseExistingServer: false,
  },
});
