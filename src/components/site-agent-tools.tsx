"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useWebMCP } from "use-webmcp-tool";

import { markdownPath, SITE } from "@/lib/site";

// WebMCP tools for agents built into the visitor's browser, reading the same
// Markdown routes served to crawling agents. Tools register once for the whole
// site, so client-side navigation never re-registers them. The hook is a no-op
// where `document.modelContext` is missing.

const POST_ARGUMENT = {
  type: "string",
  description: "The post's slug, page URL, or Markdown URL from list_posts.",
} as const;

// Module scope: the hook compares schemas by their JSON, which is key-order sensitive.
const LIST_POSTS = {
  name: "list_posts",
  description: `Lists every post on ${SITE.name}'s blog, newest first, with its title, date, one-sentence summary, and page link. Use to find posts on a topic before reading, opening, or linking one.`,
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
        ...POST_ARGUMENT,
        description: `${POST_ARGUMENT.description} Omit to read the post open in this tab.`,
      },
    },
  },
  annotations: { readOnlyHint: true },
} as const;

// No annotations: navigating changes what the visitor sees, but nothing they'd need to confirm.
const OPEN_POST = {
  name: "open_post",
  description:
    "Opens a blog post in this tab so the visitor can read it. Use when they ask to go to, show, or open a post.",
  inputSchema: { type: "object", properties: { post: POST_ARGUMENT }, required: ["post"] },
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

/** Fetches a post the agent named, as its slug and Markdown. */
async function fetchPost(post: string, signal: AbortSignal) {
  const missing = `No post at "${post}". Call list_posts for valid posts.`;
  const slug = postSlug(post);

  if (slug === undefined) throw new Error(missing);

  return { slug, markdown: await fetchMarkdown(markdownPath(slug), signal, missing) };
}

async function readPost(post: string | undefined, signal: AbortSignal) {
  if (post !== undefined) return (await fetchPost(post, signal)).markdown;

  const current = postSlug(location.pathname);

  if (current === undefined) {
    throw new Error("This tab isn't showing a post. Pass a post from list_posts.");
  }

  return fetchMarkdown(markdownPath(current), signal);
}

/** The client-side navigation `open_post` drives: Next's router on the site. */
export type Navigation = { pathname: string; push: (path: string) => void };

type Arrival = { path: string; arrive: () => void };

/** Navigates to a post and resolves once its page is on screen. */
function useOpenPost({ pathname, push }: Navigation) {
  const arrival = useRef<Arrival>(null);

  useEffect(() => {
    if (arrival.current?.path !== pathname) return;

    arrival.current.arrive();
    arrival.current = null;
  }, [pathname]);

  return useCallback(
    async (post: string, signal: AbortSignal) => {
      // Fetching first turns a missing post into an error instead of a 404 page.
      const { slug, markdown } = await fetchPost(post, signal);
      const path = `/blog/${slug}`;
      const title = /^# (.+)$/mu.exec(markdown)?.[1] ?? slug;

      if (location.pathname !== path) {
        await new Promise<void>((arrive, fail) => {
          arrival.current = { path, arrive };
          signal.addEventListener(
            "abort",
            () => {
              fail(new Error(`Stopped opening ${path}.`, { cause: signal.reason }));
            },
            { once: true },
          );
          push(path);
        });
      }

      return `Opened "${title}" at ${path}.`;
    },
    [push],
  );
}

/** Registers the site's WebMCP tools, navigating with `navigation`. */
export function useSiteAgentTools(navigation: Navigation) {
  const openPost = useOpenPost(navigation);

  useWebMCP({
    ...LIST_POSTS,
    execute: (_, { signal }) => fetchMarkdown("/blog/sitemap.md", signal),
  });

  useWebMCP<{ post?: string }>({
    ...READ_POST,
    execute: ({ post }, { signal }) => readPost(post, signal),
  });

  useWebMCP<{ post: string }>({
    ...OPEN_POST,
    execute: ({ post }, { signal }) => openPost(post, signal),
  });

  useWebMCP({
    ...GET_RESUME,
    execute: (_, { signal }) => fetchMarkdown("/resume.md", signal),
  });
}

/** Registers the site's WebMCP tools; renders nothing. */
export function SiteAgentTools() {
  const router = useRouter();

  useSiteAgentTools({
    pathname: usePathname(),
    push: (path) => {
      router.push(path);
    },
  });

  return null;
}
