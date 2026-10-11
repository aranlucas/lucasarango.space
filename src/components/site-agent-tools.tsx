"use client";

import { useWebMCP } from "use-webmcp-tool";

import { markdownPath, SITE } from "@/lib/site";

// WebMCP tools for agents built into the visitor's browser, reading the same
// Markdown routes served to crawling agents. Tools register once for the whole
// site, so client-side navigation never re-registers them. The hook is a no-op
// where `document.modelContext` is missing.

// Module scope: the hook compares schemas by their JSON, which is key-order sensitive.
const LIST_POSTS = {
  name: "list_posts",
  description: `Lists every post on ${SITE.name}'s blog, newest first, with its title, date, one-sentence summary, and Markdown link. Use to find posts on a topic before reading or linking one.`,
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
} as const;

const READ_POST = {
  name: "read_post",
  description:
    "Reads one blog post in full as Markdown, with its title, date, and canonical URL. Use before quoting, summarizing, or answering details from a post.",
  inputSchema: {
    type: "object",
    properties: {
      post: {
        type: "string",
        description:
          "The post's slug, path, or URL from list_posts. Omit to read the post open in this tab.",
      },
    },
  },
  annotations: { readOnlyHint: true },
} as const;

const GET_RESUME = {
  name: "get_resume",
  description: `Gets ${SITE.name}'s résumé as Markdown: summary, roles, projects, writing, skills, and education. Use for questions about his work history, experience, or skills.`,
  inputSchema: { type: "object", properties: {} },
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
  useWebMCP({
    ...LIST_POSTS,
    execute: (_, { signal }) => fetchMarkdown("/blog/sitemap.md", signal),
  });

  useWebMCP<{ post?: string }>({
    ...READ_POST,
    execute: ({ post }, { signal }) => readPost(post, signal),
  });

  useWebMCP({
    ...GET_RESUME,
    execute: (_, { signal }) => fetchMarkdown("/resume.md", signal),
  });

  return null;
}
