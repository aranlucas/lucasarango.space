import { cacheLife } from "next/cache";

import { getAllPosts } from "@/lib/api";
import { llmsTxt } from "@/lib/post-markdown";

// oxlint-disable-next-line require-await, typescript/require-await -- use cache requires an async function, even for local synchronous data.
async function getLlmsTxt() {
  "use cache";
  cacheLife("max");

  return llmsTxt(getAllPosts());
}

export async function GET() {
  return new Response(await getLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
