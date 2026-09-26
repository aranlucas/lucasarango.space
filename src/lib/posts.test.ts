import { describe, expect, it } from "vitest";

import { formatDate, parsePost, renderMarkdown } from "./posts";

const post = (frontmatter: string, body = "Hello world.") => `---\n${frontmatter}\n---\n${body}`;

describe("parsePost", () => {
  it("reads frontmatter and normalizes YAML dates", () => {
    const { meta, draft } = parsePost(
      "hello",
      post("title: Hello\ndate: 2026-09-25\nsummary: A first post."),
    );
    expect(meta).toMatchObject({ slug: "hello", title: "Hello", date: "2026-09-25" });
    expect(meta.readingMinutes).toBe(1);
    expect(draft).toBe(false);
  });

  it("flags drafts", () => {
    const { draft } = parsePost("x", post("title: X\ndate: 2026-01-01\nsummary: s\ndraft: true"));
    expect(draft).toBe(true);
  });

  it("rejects posts without a summary", () => {
    expect(() => parsePost("x", post("title: X\ndate: 2026-01-01"))).toThrow(/summary/u);
  });
});

describe("renderMarkdown", () => {
  it("adds heading ids and highlights code", async () => {
    const html = await renderMarkdown("## Why\n\n```ts\nconst a = 1;\n```");
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
