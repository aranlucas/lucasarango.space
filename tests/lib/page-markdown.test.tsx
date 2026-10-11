import { afterEach, expect, it, vi } from "vitest";
import { readPageMarkdown } from "@/lib/page-markdown";

afterEach(() => vi.restoreAllMocks());

it("returns negotiated Markdown unchanged without parsing HTML", async () => {
  const original = '---\ntitle: "Post"\n---\n\n# Post\n\nExact **Markdown**.\n';

  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(original, { headers: { "Content-Type": "text/markdown; charset=utf-8" } }),
    );

  const parser = vi.spyOn(DOMParser.prototype, "parseFromString");

  expect(await readPageMarkdown("/blog/post")).toBe(original);
  expect(fetch).toHaveBeenCalledWith("/blog/post", {
    signal: undefined,
    headers: { Accept: "text/markdown" },
  });
  expect(parser).not.toHaveBeenCalled();
});

it("preserves article headings, links, images, code, and GFM tables without site chrome", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(`
    <header>Site navigation</header><main><article class="reading-article">
      <h1>Article</h1><p>Read <a href="/resume">my résumé</a>.</p>
      <img src="/photo.jpg" alt="A photo">
      <pre><code class="language-ts">const answer = 42;\nconsole.log(answer);</code></pre>
      <table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody><tr><td>Answer</td><td>42</td></tr></tbody></table>
      <nav>Other writing</nav><button>Copy</button><script>secretFrameworkData()</script>
    </article></main><footer>Site footer</footer>`),
  );
  const markdown = await readPageMarkdown("/blog/article");
  expect(markdown).toContain("# Article");
  expect(markdown).toContain(`[my résumé](${window.location.origin}/resume)`);
  expect(markdown).toContain(`![A photo](${window.location.origin}/photo.jpg)`);
  expect(markdown).toContain("```ts\nconst answer = 42;\nconsole.log(answer);\n```");
  expect(markdown).toContain("| Name | Value |");
  expect(markdown).not.toMatch(
    /Site navigation|Other writing|Copy|secretFrameworkData|Site footer/u,
  );
});

it("reports missing article content rather than returning an empty success", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("<main>Loading…</main>"));
  await expect(readPageMarkdown("/blog/article")).rejects.toThrow("article is unavailable");
});
