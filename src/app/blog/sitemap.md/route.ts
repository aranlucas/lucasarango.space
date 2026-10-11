import { getAllPosts } from "@/lib/api";
import { blogIndexMarkdown, MARKDOWN_HEADERS } from "@/lib/post-markdown";
import { ListPostsInput } from "@/lib/site-agent-inputs";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const input = ListPostsInput.safeParse({
    query: params.get("query") ?? undefined,
    sort: params.get("sort") ?? undefined,
    limit: params.has("limit") ? Number(params.get("limit")) : undefined,
  });

  if (!input.success) {
    const issue = input.error.issues[0];

    return new Response(
      `Invalid search: ${issue?.path.join(".") || "arguments"} ${issue?.message}\n`,
      {
        status: 400,
        headers: MARKDOWN_HEADERS,
      },
    );
  }

  const { query, sort, limit } = input.data;

  return new Response(blogIndexMarkdown(getAllPosts(), query, { sort, limit }), {
    headers: MARKDOWN_HEADERS,
  });
}
