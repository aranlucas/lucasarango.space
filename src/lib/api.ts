import fs from "node:fs";
import { join } from "node:path";

import matter from "gray-matter";

import type { Post } from "@/interfaces/post";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
}

/** Undefined for a missing post, or a draft outside `pnpm dev`. */
export function getPostBySlug(slug: string): Post | undefined {
  const realSlug = slug.replace(/\.md$/u, "");
  // Slugs can come from the Ask agent, so never let one leave the posts directory.
  if (!/^[\w-]+$/u.test(realSlug)) return undefined;
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  if (!fs.existsSync(fullPath)) return undefined;
  const post = parsePost(realSlug, fs.readFileSync(fullPath, "utf8"));
  return post.draft && process.env.NODE_ENV !== "development" ? undefined : post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post) => post !== undefined)
    // sort posts by date in descending order
    .toSorted((post1, post2) => post2.date.localeCompare(post1.date));
  return posts;
}

type Frontmatter = { title?: unknown; date?: unknown; summary?: unknown; draft?: unknown };

/** Validates frontmatter so a bad post fails the build instead of rendering broken. */
export function parsePost(slug: string, fileContents: string): Post {
  const { data, content } = matter(fileContents);
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
    slug,
    title: fm.title,
    date,
    summary: fm.summary,
    draft: fm.draft === true,
    readingMinutes: Math.max(1, Math.round(words / 230)),
    content,
  };
}
