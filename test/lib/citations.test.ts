import { describe, expect, it } from "vitest";

import { safeCitationMarkdown } from "@/lib/citation-markdown";
import { citationUrl } from "@/lib/citations";

const posts = ["https://lucasarango.space/blog/published"];

describe("Ask citation sources", () => {
  it("accepts curated sources and listed posts", () => {
    expect(citationUrl("/resume#experience", posts)?.href).toBe(
      "https://lucasarango.space/resume#experience",
    );
    expect(citationUrl(posts[0], posts)?.href).toBe(posts[0]);
    expect(citationUrl("https://github.com/aranlucas/ikea-interior-design", posts)).toBeDefined();
  });

  it("rejects unlisted paths, lookalike hosts, and unsafe schemes", () => {
    for (const href of [
      "/blog/unpublished",
      "/resume#invented",
      "//evil.example/resume#experience",
      "https://lucasarango.space.evil.example/resume#experience",
      "javascript:alert(1)",
    ]) {
      expect(citationUrl(href, posts)).toBeUndefined();
    }
  });

  it("removes unverified destinations from copied Markdown", () => {
    const answer =
      "See [experience](/resume#experience), [a post](https://lucasarango.space/blog/published), [a claim](https://evil.example), and [another][bad].\n\n[bad]: https://evil.example";

    const safe = safeCitationMarkdown(answer, posts);

    expect(safe).toContain("[experience](/resume#experience)");
    expect(safe).toContain("[a post](https://lucasarango.space/blog/published)");
    expect(safe).toContain("a claim");
    expect(safe).not.toContain("https://evil.example");
  });
});
