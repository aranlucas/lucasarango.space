import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { rehypePrettyCode } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  readingMinutes: number;
};

export type Post = PostMeta & { html: string };

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

type Frontmatter = { title?: unknown; date?: unknown; summary?: unknown; draft?: unknown };

export function parsePost(
  slug: string,
  source: string,
): { meta: PostMeta; body: string; draft: boolean } {
  const { data, content } = matter(source);
  const fm = data as Frontmatter;
  if (typeof fm.title !== "string" || !fm.title) throw new Error(`${slug}: missing title`);
  if (typeof fm.summary !== "string" || !fm.summary) throw new Error(`${slug}: missing summary`);
  // YAML turns bare dates into Date objects; keep them as YYYY-MM-DD strings.
  const date = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : fm.date;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
    throw new Error(`${slug}: date must be YYYY-MM-DD`);
  }
  const words = content.split(/\s+/u).filter(Boolean).length;
  return {
    meta: {
      slug,
      title: fm.title,
      date,
      summary: fm.summary,
      readingMinutes: Math.max(1, Math.round(words / 230)),
    },
    body: content,
    draft: fm.draft === true,
  };
}

async function readAll() {
  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/u, "");
      return parsePost(slug, await fs.readFile(path.join(POSTS_DIR, file), "utf8"));
    }),
  );
  const showDrafts = process.env.NODE_ENV === "development";
  return posts
    .filter((p) => showDrafts || !p.draft)
    .toSorted((a, b) => b.meta.date.localeCompare(a.meta.date));
}

export async function getPosts(): Promise<PostMeta[]> {
  return (await readAll()).map((p) => p.meta);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const post = (await readAll()).find((p) => p.meta.slug === slug);
  if (!post) return undefined;
  return { ...post.meta, html: await renderMarkdown(post.body) };
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark-dimmed" },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

export function formatDate(date: string, style: "long" | "short" = "long"): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    ...(style === "long" ? { year: "numeric" } : {}),
  });
}
