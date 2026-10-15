import { z } from "zod";

export const ListPostsInput = z.object({
  query: z
    .string()
    .describe(
      "Optional question or keywords. Matches relevant words in titles, summaries, and bodies; question wording is ignored. Omit or leave blank to list posts newest first.",
    )
    .optional(),
  sort: z
    .enum(["relevance", "newest", "oldest"])
    .describe("Result order. Defaults to relevance with a query, newest without one.")
    .optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .describe("Maximum posts to return, from 1 to 50. Omit to return all matches.")
    .optional(),
});

export const ReadPostInput = z.object({
  post: z
    .string()
    .describe(
      "The post's slug, page URL, or Markdown URL from list_posts. Omit to read the post open in this tab.",
    )
    .optional(),
});

export const EmptyInput = z.object({});

export type ListPostsArgs = z.infer<typeof ListPostsInput>;

export type ReadPostArgs = z.infer<typeof ReadPostInput>;
