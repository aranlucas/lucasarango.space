import { afterEach, expect, it, vi } from "vitest";
import nextConfig from "../next.config";

afterEach(() => vi.unstubAllEnvs());

it("sends the configured origin-trial token on every page", async () => {
  vi.stubEnv("WEBMCP_ORIGIN_TRIAL_TOKEN", "issued-for-this-origin");
  expect(await nextConfig.headers?.()).toEqual([
    { source: "/:path*", headers: [{ key: "Origin-Trial", value: "issued-for-this-origin" }] },
  ]);
});

it("does not send an empty origin-trial token", async () => {
  vi.stubEnv("WEBMCP_ORIGIN_TRIAL_TOKEN", "");
  expect(await nextConfig.headers?.()).toEqual([]);
});
