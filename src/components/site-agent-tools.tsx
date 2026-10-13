"use client";

import { useWebMCP } from "use-webmcp-tool";
import { z } from "zod";

import { fetchMarkdown, listPosts, readPost } from "@/lib/site-agent-tools";
import { projectsMarkdown } from "@/lib/projects";
import { SITE } from "@/lib/site";
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

/** Registers the site's WebMCP tools; renders nothing. */
export function SiteAgentTools() {
  useWebMCP({
    ...LIST_POSTS,
    execute: (input, { signal }) => listPosts(input, signal),
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
