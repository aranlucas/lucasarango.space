"use client";

import { useWebMCP } from "use-webmcp-tool";
import { z } from "zod";

import { projectsMarkdown } from "@/lib/projects";
import { markdownPath, SITE } from "@/lib/site";

// WebMCP tools for agents built into the visitor's browser, reading the same
// Markdown routes served to crawling agents. Tools register once for the whole
// site, so client-side navigation never re-registers them. The hook is a no-op
// where `document.modelContext` is missing.

// Module scope: the hook compares schemas by their JSON, which is key-order sensitive.
const ListPostsInput = z.object({
  query: z
    .string()
    .describe(
      "Optional case-insensitive keywords; all words must match. Omit or leave blank to list every post.",
    )
    .optional(),
});

const ReadPostInput = z.object({
  post: z
    .string()
    .describe(
      "The post's slug, page URL, or Markdown URL from list_posts. Omit to read the post open in this tab.",
    )
    .optional(),
});

const EmptyInput = z.object({});

const LIST_POSTS = {
  name: "list_posts",
  description: `Lists posts on ${SITE.name}'s blog, newest first, with titles, dates, summaries, and absolute page and Markdown links. Optionally search titles, summaries, and bodies to get matching posts with excerpts. Use to find posts before reading or linking one.`,
  inputSchema: z.toJSONSchema(ListPostsInput, { io: "input" }),
  annotations: { readOnlyHint: true },
} as const;

const READ_POST = {
  name: "read_post",
  description:
    "Reads one blog post in full as Markdown, with its title, date, and canonical URL. Use before quoting, summarizing, or answering details from a post.",
  inputSchema: z.toJSONSchema(ReadPostInput, { io: "input" }),
  annotations: { readOnlyHint: true },
} as const;

const GET_RESUME = {
  name: "get_resume",
  description: `Gets ${SITE.name}'s résumé as Markdown: summary, roles, projects, writing, skills, and education. Use for questions about his work history, experience, or skills.`,
  inputSchema: z.toJSONSchema(EmptyInput, { io: "input" }),
  annotations: { readOnlyHint: true },
} as const;

const LIST_PROJECTS = {
  name: "list_projects",
  description: `Lists ${SITE.name}'s featured public projects with descriptions, source repositories, and related blog posts. Use for questions about what he has built; read the linked post for details.`,
  inputSchema: z.toJSONSchema(EmptyInput, { io: "input" }),
  annotations: { readOnlyHint: true },
} as const;

/** The slug in a post slug, path, or URL, or undefined when it names no post. */
export function postSlug(post: string) {
  const path = URL.parse(post, SITE.url)?.pathname ?? post;
  const slug = /^\/blog\/([^/]+?)(?:\.md)?\/?$/u.exec(path)?.[1] ?? post;

  // Slugs come from the agent, so never let one leave `/blog/`.
  return /^[\w-]+$/u.test(slug) ? slug : undefined;
}

async function fetchMarkdown(path: string, signal: AbortSignal, missing = `${path} not found.`) {
  const response = await fetch(path, { signal });

  if (response.status === 404) throw new Error(missing);

  if (!response.ok) throw new Error(`${path} returned ${response.status}.`);

  return response.text();
}

function readPost(post: string | undefined, signal: AbortSignal) {
  if (post === undefined) {
    const current = postSlug(location.pathname);

    if (current === undefined) {
      throw new Error("This tab isn't showing a post. Pass a post from list_posts.");
    }

    return fetchMarkdown(markdownPath(current), signal);
  }

  const missing = `No post at "${post}". Call list_posts for valid posts.`;
  const slug = postSlug(post);

  if (slug === undefined) throw new Error(missing);

  return fetchMarkdown(markdownPath(slug), signal, missing);
}

/** Registers the site's WebMCP tools; renders nothing. */
export function SiteAgentTools() {
  useWebMCP<z.infer<typeof ListPostsInput>>({
    ...LIST_POSTS,
    execute: ({ query }, { signal }) => {
      const search = query?.trim() ?? "";

      const path =
        search.length > 0
          ? `/blog/sitemap.md?query=${encodeURIComponent(search)}`
          : "/blog/sitemap.md";

      return fetchMarkdown(path, signal);
    },
  });

  useWebMCP<z.infer<typeof ReadPostInput>>({
    ...READ_POST,
    execute: ({ post }, { signal }) => readPost(post, signal),
  });

  useWebMCP<z.infer<typeof EmptyInput>>({
    ...GET_RESUME,
    execute: (_, { signal }) => fetchMarkdown("/resume.md", signal),
  });

  useWebMCP<z.infer<typeof EmptyInput>>({
    ...LIST_PROJECTS,
    execute: () => projectsMarkdown(),
  });

  return null;
}
