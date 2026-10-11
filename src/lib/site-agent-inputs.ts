import { z } from "zod";

export const ListPostsInput = z.object({
  query: z
    .string()
    .describe(
      "Optional case-insensitive keywords; all words must match. Omit or leave blank to list every post.",
    )
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

export type EmptyArgs = z.infer<typeof EmptyInput>;
