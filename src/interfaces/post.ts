export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  draft: boolean;
  readingMinutes: number;
  content: string;
};

/** The fields needed to display a post in a list. */
export type PostSummary = Omit<Post, "content" | "draft">;
