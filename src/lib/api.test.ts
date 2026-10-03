import fs from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { getPostBySlug, parsePost } from "./api";
import markdownToHtml from "./markdown-to-html";
import { formatDate } from "./utils";

const post = (frontmatter: string, body = "Hello world.") => `---\n${frontmatter}\n---\n${body}`;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("parsePost", () => {
  it("reads frontmatter and preserves bare YAML dates", () => {
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

describe("post titles and summaries", () => {
  it("trims titles and summaries", () => {
    const parsed = parsePost(
      "hello",
      post('title: "  Hello  "\ndate: 2026-09-25\nsummary: "  A first post.  "'),
    );

    expect(parsed).toMatchObject({ title: "Hello", summary: "A first post." });
  });

  it.each(["title", "summary"])("rejects a blank %s with the slug and field name", (field) => {
    const fields = {
      title: "Hello",
      summary: "A first post.",
      date: "2026-09-25",
      [field]: '"   "',
    };

    const frontmatter = Object.entries(fields)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    expect(() => parsePost("blank-post", post(frontmatter))).toThrow(
      new RegExp(`blank-post: ${field}`, "u"),
    );
  });
});

describe("post frontmatter extraction", () => {
  it("accepts a UTF-8 byte order mark", () => {
    const parsed = parsePost("bom", `\uFEFF${post("title: Hello\ndate: 2026-09-25\nsummary: s")}`);
    expect(parsed).toMatchObject({ title: "Hello", date: "2026-09-25", content: "Hello world." });
  });

  it("preserves Windows line endings in the Markdown body", () => {
    const body = "First paragraph.\n\nSecond paragraph.";

    const parsed = parsePost(
      "windows",
      post("title: Hello\ndate: 2026-09-25\nsummary: s", body).replaceAll("\n", "\r\n"),
    );

    expect(parsed.content).toBe(body.replaceAll("\n", "\r\n"));
  });

  it("preserves thematic breaks and fenced YAML in the Markdown body", () => {
    const body = "First paragraph.\n\n---\n\n```yaml\n---\ntitle: Example\n---\n```";
    const parsed = parsePost("body", post("title: Hello\ndate: 2026-09-25\nsummary: s", body));
    expect(parsed.content).toBe(body);
  });
});

describe("post dates", () => {
  it.each(["2024-02-29", "2000-02-29", "2026-09-25"])(
    "accepts the exact calendar date %s, quoted or unquoted",
    (date) => {
      for (const value of [date, `"${date}"`]) {
        expect(parsePost("hello", post(`title: Hello\ndate: ${value}\nsummary: s`)).date).toBe(
          date,
        );
      }
    },
  );

  it.each([
    "2026-02-30",
    "2025-02-29",
    "1900-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-00-01",
    "2026-09-25T23:30:00Z",
  ])("rejects the invalid date %s, quoted or unquoted", (date) => {
    for (const value of [date, `"${date}"`]) {
      expect(() => parsePost("bad-date", post(`title: Hello\ndate: ${value}\nsummary: s`))).toThrow(
        /bad-date: date/u,
      );
    }
  });
});

describe("post draft flags", () => {
  it.each(['"true"', '"false"', "yes", "1", "null"])(
    "rejects draft: %s instead of treating it as published",
    (draft) => {
      expect(() =>
        parsePost(
          "private-draft",
          post(`title: Hello\ndate: 2026-09-25\nsummary: s\ndraft: ${draft}`),
        ),
      ).toThrow(/private-draft: draft/u);
    },
  );

  it("keeps an explicit false draft flag published", () => {
    expect(
      parsePost("hello", post("title: Hello\ndate: 2026-09-25\nsummary: s\ndraft: false")).draft,
    ).toBe(false);
  });
});

describe("post YAML errors", () => {
  it("identifies the post when YAML is malformed", () => {
    expect(() => parsePost("broken-yaml", post("title: [unclosed"))).toThrow(/broken-yaml/u);
  });

  it.each(["a scalar", "- a sequence"])("rejects non-mapping frontmatter: %s", (frontmatter) => {
    expect(() => parsePost("bad-shape", post(frontmatter))).toThrow(/bad-shape: frontmatter/u);
  });
});

describe("getPostBySlug", () => {
  it("returns undefined for missing posts and path traversal", () => {
    expect(getPostBySlug("no-such-post")).toBeUndefined();
    expect(getPostBySlug("../README")).toBeUndefined();
  });

  it.each(["production", "test"])("hides drafts in %s", (environment) => {
    vi.stubEnv("NODE_ENV", environment);
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      post("title: Draft\ndate: 2026-09-25\nsummary: s\ndraft: true"),
    );
    expect(getPostBySlug("private-draft")).toBeUndefined();
  });

  it("shows drafts in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      post("title: Draft\ndate: 2026-09-25\nsummary: s\ndraft: true"),
    );
    expect(getPostBySlug("private-draft")).toMatchObject({ slug: "private-draft", draft: true });
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
