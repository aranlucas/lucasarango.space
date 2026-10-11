import { getAllPosts } from "@/lib/api";
import { SITE } from "@/lib/site";

const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function getFeed() {
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

export function GET() {
  return new Response(getFeed(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
