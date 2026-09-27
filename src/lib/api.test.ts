import { describe, expect, it } from "vitest";

import { getPostBySlug, parsePost } from "./api";
import markdownToHtml from "./markdown-to-html";
import { formatDate } from "./utils";

const post = (frontmatter: string, body = "Hello world.") => `---\n${frontmatter}\n---\n${body}`;

describe("parsePost", () => {
  it("reads frontmatter and normalizes YAML dates", () => {
    const parsed = parsePost(
      "hello",
      post("title: Hello\ndate: 2026-09-25\nsummary: A first post."),
    );
    expect(parsed).toMatchObject({ slug: "hello", title: "Hello", date: "2026-09-25" });
    expect(parsed.readingMinutes).toBe(1);
    expect(parsed.draft).toBe(false);
    expect(parsed.content).toBe("Hello world.");
  });

  it("flags drafts", () => {
    const { draft } = parsePost("x", post("title: X\ndate: 2026-01-01\nsummary: s\ndraft: true"));
    expect(draft).toBe(true);
  });

  it("rejects posts without a summary", () => {
    expect(() => parsePost("x", post("title: X\ndate: 2026-01-01"))).toThrow(/summary/u);
  });
});

describe("getPostBySlug", () => {
  it("returns undefined for missing posts and path traversal", () => {
    expect(getPostBySlug("no-such-post")).toBeUndefined();
    expect(getPostBySlug("../README")).toBeUndefined();
  });
});

describe("markdownToHtml", () => {
  it("adds heading ids and highlights code", async () => {
    const html = await markdownToHtml("## Why\n\n```ts\nconst a = 1;\n```");
    expect(html).toContain('<h2 id="why">');
    expect(html).toContain("data-rehype-pretty-code-figure");
  });
});

describe("formatDate", () => {
  it("formats without shifting the day", () => {
    expect(formatDate("2026-09-25")).toBe("September 25, 2026");
    expect(formatDate("2026-09-25", "short")).toBe("Sep 25");
  });
});
