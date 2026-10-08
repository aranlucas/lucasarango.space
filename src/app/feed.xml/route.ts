import { cacheLife } from "next/cache";

import { getAllPosts } from "@/lib/api";
import { SITE } from "@/lib/site";

const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// oxlint-disable-next-line require-await, typescript/require-await -- use cache requires an async function, even for local synchronous data.
async function getFeed() {
  "use cache";
  cacheLife("max");

  const posts = getAllPosts();

  const items = posts
    .map((post) => {
      const url = `${SITE.url}/blog/${post.slug}`;

      return `<item><title>${escape(post.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escape(post.summary)}</description></item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE.name}</title><link>${SITE.url}</link><description>${escape(SITE.description)}</description><language>en-us</language>${items}</channel></rss>`;

  return xml;
}

export async function GET() {
  return new Response(await getFeed(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
