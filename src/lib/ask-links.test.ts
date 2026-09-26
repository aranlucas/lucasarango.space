import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";

import { knownLinks } from "./ask-links";

const assistant = (parts: unknown[]) =>
  ({ id: "a", role: "assistant", parts }) as unknown as UIMessage;

describe("knownLinks", () => {
  it("allows only the site's sections before any tool runs", () => {
    expect([...knownLinks([]).keys()]).toEqual(["/", "/blog", "/resume"]);
  });

  it("adds urls and titles from finished tool results", () => {
    const links = knownLinks([
      assistant([
        {
          type: "tool-listPosts",
          toolCallId: "1",
          state: "output-available",
          input: {},
          output: [{ title: "One plugin repo", url: "/blog/one-plugin-repo", date: "2026-09-01" }],
        },
        {
          type: "tool-readPost",
          toolCallId: "2",
          state: "output-available",
          input: { url: "/blog/whiteboard" },
          output: { title: "Whiteboard", url: "/blog/whiteboard", body: "…" },
        },
      ]),
    ]);
    expect(links.get("/blog/one-plugin-repo")).toBe("One plugin repo");
    expect(links.get("/blog/whiteboard")).toBe("Whiteboard");
  });

  it("ignores tool calls that haven't returned, and errors", () => {
    const links = knownLinks([
      assistant([
        {
          type: "tool-readPost",
          toolCallId: "1",
          state: "input-available",
          input: { url: "/blog/made-up" },
        },
        {
          type: "tool-readPost",
          toolCallId: "2",
          state: "output-available",
          input: { url: "/blog/also-made-up" },
          output: { error: "No post at /blog/also-made-up." },
        },
      ]),
    ]);
    expect(links.has("/blog/made-up")).toBe(false);
    expect(links.has("/blog/also-made-up")).toBe(false);
  });
});
