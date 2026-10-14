import { expect, test } from "vitest";

import { GET } from "@/app/blog/sitemap.md/route";

test("search route returns ranked question results and a total count with limited output", async () => {
  const response = GET(
    new Request(
      "https://lucasarango.space/blog/sitemap.md?query=How+does+Lucas+practice+system+design+with+an+AI+whiteboard%3F&limit=1",
    ),
  );

  const body = await response.text();
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("text/markdown");
  expect(body).toContain("Showing 1 of ");
  expect(body.match(/^- \[/gmu)).toHaveLength(1);
  expect(body).toContain("/blog/practicing-system-design-with-an-ai-on-the-whiteboard)");
});

test.each(["limit=0", "limit=1.5", "limit=51", "limit=banana", "sort=random"])(
  "search route rejects invalid query %s",
  async (query) => {
    const response = GET(new Request(`https://lucasarango.space/blog/sitemap.md?${query}`));
    expect(response.status).toBe(400);
    expect(await response.text()).toContain("Invalid search:");
  },
);
