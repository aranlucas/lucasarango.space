import { expect, test } from "vitest";

import { getAllPosts } from "@/lib/api";
import { readPost } from "@/lib/ai/tools/read-post";

// The tool must accept the URL forms visitors and browser agents share, without
// turning arbitrary paths or traversal into a local post read.
test("reads canonical, Markdown, and query/hash post URLs", async () => {
  const post = getAllPosts()[0];

  if (post === undefined || readPost.execute === undefined) {
    throw new Error("The published blog and readPost tool must be available");
  }

  for (const url of [
    `https://lucasarango.space/blog/${post.slug}`,
    `/blog/${post.slug}.md`,
    `/blog/${post.slug}?from=agent#section`,
    post.slug,
    `${post.slug}.md`,
  ]) {
    const result = await readPost.execute({ url }, { toolCallId: "read", messages: [] });
    expect(result).toMatchObject({ title: post.title, body: post.content });
  }

  for (const url of ["../api/chat", "/resume", `/other/blog/${post.slug}`, "/blog/a/b"]) {
    const result = await readPost.execute({ url }, { toolCallId: "read", messages: [] });
    expect(result).toHaveProperty("error");
    expect(result).not.toHaveProperty("body");
  }
});
