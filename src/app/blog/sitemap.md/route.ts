import { cacheLife } from "next/cache";

import { getAllPosts } from "@/lib/api";
import { blogIndexMarkdown, MARKDOWN_HEADERS } from "@/lib/post-markdown";

// oxlint-disable-next-line require-await, typescript/require-await -- use cache requires an async function, even for local synchronous data.
async function getIndex() {
  "use cache";
  cacheLife("max");

  return blogIndexMarkdown(getAllPosts());
}

export async function GET() {
  return new Response(await getIndex(), { headers: MARKDOWN_HEADERS });
}
