import { expect, test } from "vitest";

import markdownToHtml from "@/lib/markdown-to-html";

test.each([
  ["system-design-entry", 720],
  ["roomform-studio", 1000],
] as const)(
  "sizes and defers the local %s screenshot while preserving Markdown text",
  async (name, height) => {
    const html = await markdownToHtml(
      `![A screenshot](/case-studies/${name}.webp "Screenshot caption")`,
    );

    expect(html).toContain(`src="/case-studies/${name}.webp"`);
    expect(html).toContain('alt="A screenshot"');
    expect(html).toContain('title="Screenshot caption"');
    expect(html).toContain('width="1280"');
    expect(html).toContain(`height="${height}"`);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain(`srcset="/_next/image?url=%2Fcase-studies%2F${name}.webp`);
    expect(html).toContain('sizes="(min-width: 36rem) 34rem, calc(100vw - 2rem)"');
    expect(html).not.toContain("[object Object]");
  },
);

test.each(["/another-image.webp", "https://example.com/image.webp"])(
  "preserves the default Markdown behavior for %s",
  async (url) => {
    const html = await markdownToHtml(`![Another image](${url} "Caption")`);

    expect(html).toBe(`<p><img src="${url}" alt="Another image" title="Caption"></p>`);
  },
);
