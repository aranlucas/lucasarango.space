import { web } from "@e2e-dev/web";
import type { E2EConfig } from "e2e";

export default {
  tests: "test/journeys/**/*.e2e.ts",
  targets: [
    {
      name: "chromium",
      engine: web(),
      app: {
        url: "http://127.0.0.1:3015",
        command: {
          executable: "pnpm",
          args: ["start", "--hostname", "127.0.0.1", "--port", "3015"],
          log: ".e2e/logs/app.log",
          inheritEnv: ["RESUME_API_URL"],
        },
      },
    },
  ],
  workers: 1,
  trace: "retain-on-failure",
  video: "retain-on-failure",
} satisfies E2EConfig;
