"use client";

import { useWebMCP } from "use-webmcp-tool";
import { z } from "zod";

import { projectsMarkdown } from "@/lib/projects";
import { markdownPath, SITE } from "@/lib/site";
import {
  EmptyInput,
  ListPostsInput,
  ReadPostInput,
  type ReadPostArgs,
} from "@/lib/site-agent-inputs";

// WebMCP tools for agents built into the visitor's browser, reading the same
// Markdown routes served to crawling agents. Tools register once for the whole
// site, so client-side navigation never re-registers them. The hook is a no-op
// where `document.modelContext` is missing.

// Module scope: the hook compares schemas by their JSON, which is key-order sensitive.
const LIST_POSTS = {
  name: "list_posts",
  description: `Finds posts on ${SITE.name}'s blog from a question or keywords, ranked by relevance with excerpts. Without a query, lists posts newest first. Returns titles, dates, summaries, absolute page and Markdown links, and total match counts. Optionally choose sort order and limit results. Use to find posts before reading or linking one.`,
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

  if (response.status === 404) {
    throw new Error(missing);
  }

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}.`);
  }

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

  if (slug === undefined) {
    throw new Error(missing);
  }

  return fetchMarkdown(markdownPath(slug), signal, missing);
}

/** Registers the site's WebMCP tools; renders nothing. */
export function SiteAgentTools() {
  useWebMCP({
    ...LIST_POSTS,
    execute: (input, { signal }) => {
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
    },
  });

  useWebMCP<ReadPostArgs>({
    ...READ_POST,
    execute: ({ post }, { signal }) => readPost(post, signal),
  });

  useWebMCP({
    ...GET_RESUME,
    execute: (_, { signal }) => fetchMarkdown("/resume.md", signal),
  });

  useWebMCP({
    ...LIST_PROJECTS,
    execute: () => projectsMarkdown(),
  });

  return null;
}
