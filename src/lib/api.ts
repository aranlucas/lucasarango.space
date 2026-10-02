import fs from "node:fs";
import { join } from "node:path";

import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

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

const PostMetadata = z.object({
  title: z.string().trim().min(1, "must not be blank"),
  date: z.iso.date({ error: "must be a valid calendar date in YYYY-MM-DD format" }),
  summary: z.string().trim().min(1, "must not be blank"),
  draft: z.boolean().default(false),
});

function parseFrontmatter(source: string): object {
  // Core YAML keeps bare dates as strings, so invalid days cannot roll over
  // into another date before validation and timestamps cannot lose their time.
  const data: unknown = parseYaml(source, { schema: "core" });
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("frontmatter must be a mapping");
  }
  return data;
}

function readPostFile(slug: string, fileContents: string) {
  try {
    return matter(fileContents, { engines: { yaml: parseFrontmatter } });
  } catch (error) {
    throw new Error(`${slug}: ${error instanceof Error ? error.message : "invalid frontmatter"}`, {
      cause: error,
    });
  }
}

/** Validates frontmatter so a bad post fails the build instead of rendering broken. */
export function parsePost(slug: string, fileContents: string): Post {
  const { data, content } = readPostFile(slug, fileContents);
  const metadata = PostMetadata.safeParse(data);
  if (!metadata.success) {
    const issue = metadata.error.issues[0];
    throw new Error(`${slug}: ${issue?.path.join(".") || "frontmatter"} ${issue?.message}`);
  }
  const words = content.split(/\s+/u).filter(Boolean).length;
  return {
    slug,
    ...metadata.data,
    readingMinutes: Math.max(1, Math.round(words / 230)),
    content,
  };
}
