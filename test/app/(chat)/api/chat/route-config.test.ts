import { afterEach, expect, it, vi } from "vitest";

import { errorResponseSchema } from "@/lib/errors";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("imports without AI credentials and returns the chat-unavailable response", async () => {
  vi.stubEnv("FREELLMAPI_BASE_URL", "");
  vi.stubEnv("FREELLMAPI_API_KEY", "");
  vi.stubEnv("CI", "");
  vi.resetModules();

  const { POST } = await import("@/app/(chat)/api/chat/route");

  const response = await POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ id: "question", role: "user", parts: [{ type: "text", text: "Hello" }] }],
      }),
    }),
  );

  expect(response.status).toBe(503);

  const body = errorResponseSchema.parse(await response.json());
  expect(body.code).toBe("offline:chat");
  expect(body.message).toContain("FREELLMAPI_BASE_URL");
});
