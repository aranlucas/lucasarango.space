import { getAllPosts } from "@/lib/api";
import { llmsTxt } from "@/lib/post-markdown";

export function GET() {
  return new Response(llmsTxt(getAllPosts()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
