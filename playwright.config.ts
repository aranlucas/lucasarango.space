import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3014";

const isCI = process.env.CI !== undefined && process.env.CI !== "";

export default defineConfig({
  testDir: "./test/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        launchOptions: { args: ["--enable-features=WebMCPTesting"] },
      },
    },
  ],
  webServer: {
    command: "pnpm start --hostname 127.0.0.1 --port 3014",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
