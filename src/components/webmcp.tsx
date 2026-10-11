"use client";

import { useWebMCP, type WebMCPOptions } from "use-webmcp-tool";
import { z } from "zod";

const JsonValue = z.json();

type JsonContent = z.infer<typeof JsonValue>;

const PostInput = z.strictObject({
  slug: z
    .string()
    .regex(/^[\w-]{1,200}$/u)
    .describe("A post slug returned by listPosts."),
});

async function readContent(
  tool: string,
  slug?: string,
  signal?: AbortSignal,
): Promise<JsonContent> {
  const params = new URLSearchParams({ tool });

  if (slug !== undefined) params.set("slug", slug);

  const response = await fetch(`/api/webmcp?${params}`, { signal });

  if (!response.ok) {
    throw new Error(
      `Could not read ${tool} (HTTP ${response.status}). Call listPosts for valid post slugs or retry later.`,
    );
  }

  return JsonValue.parse(await response.json());
}

const emptySchema: z.core.JSONSchema.JSONSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

const tools: WebMCPOptions<JsonContent, JsonContent>[] = [
  {
    name: "getResume",
    description:
      "Read Lucas Arango's public resume, including experience, projects, education, skills, publications, and profile links.",
    inputSchema: emptySchema,
    annotations: { readOnlyHint: true },
    execute: (_input, options) => readContent("getResume", undefined, options?.signal),
  },
  {
    name: "listPosts",
    description:
      "List Lucas Arango's published blog posts, newest first, with slugs, titles, dates, summaries, and canonical URLs. Call before reading a post.",
    inputSchema: emptySchema,
    annotations: { readOnlyHint: true },
    execute: (_input, options) => readContent("listPosts", undefined, options?.signal),
  },
  {
    name: "readPost",
    description:
      "Read a published blog post in full as Markdown. Use a slug returned by listPosts. Read before quoting or answering details about a post.",
    inputSchema: z.toJSONSchema(PostInput),
    annotations: { readOnlyHint: true },
    execute: (input, options) => {
      const { slug } = PostInput.parse(input);

      return readContent("readPost", slug, options?.signal);
    },
  },
];

/** The library owns registration, cancellation, and cleanup for this document. */
export function WebMCP() {
  useWebMCP(tools[0]);
  useWebMCP(tools[1]);
  useWebMCP(tools[2]);

  return null;
}
