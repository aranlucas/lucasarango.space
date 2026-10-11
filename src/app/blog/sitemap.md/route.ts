import { getAllPosts } from "@/lib/api";
import { blogIndexMarkdown, MARKDOWN_HEADERS } from "@/lib/post-markdown";

export function GET() {
  return new Response(blogIndexMarkdown(getAllPosts()), { headers: MARKDOWN_HEADERS });
}
