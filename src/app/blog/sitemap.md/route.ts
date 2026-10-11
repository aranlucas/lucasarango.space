import { getAllPosts } from "@/lib/api";
import { blogIndexMarkdown, MARKDOWN_HEADERS } from "@/lib/post-markdown";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query") ?? "";

  return new Response(blogIndexMarkdown(getAllPosts(), query), { headers: MARKDOWN_HEADERS });
}
