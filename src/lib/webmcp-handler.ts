import type { Post } from "@/interfaces/post";
import type { Resume } from "@/lib/resume";

import { SITE } from "@/lib/site";

export type ContentSources = {
  getAllPosts: () => Post[];
  getPostBySlug: (slug: string) => Post | undefined;
  getResume: () => Promise<Resume>;
};

export function createWebMCPHandler(sources: ContentSources) {
  return (request: Request) => readContent(request, sources);
}

function readContent(request: Request, sources: ContentSources) {
  const params = new URL(request.url).searchParams;
  const tool = params.get("tool");

  if (tool === "listPosts") {
    return Response.json(
      sources
        .getAllPosts()
        .filter((post) => !post.draft)
        .map((post) => ({
          slug: post.slug,
          title: post.title,
          date: post.date,
          summary: post.summary,
          url: `${SITE.url}/blog/${post.slug}`,
        })),
    );
  }

  if (tool === "readPost") {
    const slug = params.get("slug");

    if (slug === null || !/^[\w-]{1,200}$/u.test(slug)) {
      return Response.json({ error: "Provide a slug from listPosts." }, { status: 400 });
    }

    const post = sources.getPostBySlug(slug);

    if (post === undefined || post.draft) {
      return Response.json(
        { error: "Post not found. Call listPosts for published slugs." },
        { status: 404 },
      );
    }

    return Response.json({
      slug: post.slug,
      title: post.title,
      date: post.date,
      summary: post.summary,
      url: `${SITE.url}/blog/${post.slug}`,
      body: post.content,
    });
  }

  if (tool === "getResume") return readResume(sources);

  return Response.json({ error: "Use getResume, listPosts, or readPost." }, { status: 400 });
}

async function readResume(sources: ContentSources) {
  try {
    return Response.json({ url: `${SITE.url}/resume`, ...(await sources.getResume()) });
  } catch (error) {
    console.error("WebMCP resume fetch failed", error);

    return Response.json(
      { error: "The resume is temporarily unavailable. Try again later." },
      { status: 503 },
    );
  }
}
