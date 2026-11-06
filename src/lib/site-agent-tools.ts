import { markdownPath, postSlug } from "@/lib/site";
import { ListPostsInput, type ListPostsArgs } from "@/lib/site-agent-inputs";

export async function fetchMarkdown(
  path: string,
  signal: AbortSignal,
  missing = `${path} not found.`,
) {
  const response = await fetch(path, { signal });

  if (response.status === 404) {
    throw new Error(missing);
  }

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}.`);
  }

  return response.text();
}

export function readPost(post: string | undefined, signal: AbortSignal) {
  if (post === undefined) {
    const current = postSlug(location.pathname);

    if (current === undefined) {
      throw new Error("This tab isn't showing a post. Pass a post from list_posts.");
    }

    return fetchMarkdown(markdownPath(current), signal);
  }

  const missing = `No post at "${post}". Call list_posts for valid posts.`;
  const slug = postSlug(post);

  if (slug === undefined) {
    throw new Error(missing);
  }

  return fetchMarkdown(markdownPath(slug), signal, missing);
}

export function listPosts(input: ListPostsArgs, signal: AbortSignal) {
  const parsed = ListPostsInput.safeParse(input);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(
      `Invalid list_posts input: ${issue?.path.join(".") || "arguments"} ${issue?.message}`,
    );
  }

  const { query, sort, limit } = parsed.data;
  const search = query?.trim() ?? "";
  const params = new URLSearchParams();

  if (search.length > 0) {
    params.set("query", search);
  }

  if (sort !== undefined) {
    params.set("sort", sort);
  }

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  const path = `/blog/sitemap.md${params.size > 0 ? `?${params}` : ""}`;

  return fetchMarkdown(path, signal);
}
