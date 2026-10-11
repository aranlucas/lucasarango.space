import type { NextConfig } from "next";

const ACCEPTS_MARKDOWN = [
  { type: "header" as const, key: "accept", value: "(.*)text/markdown(.*)" },
];

const nextConfig: NextConfig = {
  // Automatically memoize React rendering with the native Turbopack compiler.
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  turbopack: {
    resolveAlias: { "tailwind-merge": "cn", clsx: "cn" },
  },
  experimental: {
    turbopackRustReactCompiler: true,
    // Compile the Ask and three.js imports on demand.
    turbopackLazyDynamicImports: true,
    // Collect unused development cache work.
    turbopackGc: true,
  },
  // The Ask agent's tools and the Markdown routes read posts at request time,
  // which tracing can't see.
  outputFileTracingIncludes: {
    "/api/chat": ["./_posts/**/*.md"],
    "/blog/md/[slug]": ["./_posts/**/*.md"],
    "/blog/sitemap.md": ["./_posts/**/*.md"],
    "/llms.txt": ["./_posts/**/*.md"],
  },
  // Serve agents Markdown from the same URLs people read, and from `.md` URLs
  // they can share. Slug patterns exclude dots so `/blog/sitemap.md` isn't
  // mistaken for a post.
  rewrites() {
    return {
      // Before files, because `/` and `/blog` are static pages.
      beforeFiles: [
        { source: "/", has: ACCEPTS_MARKDOWN, destination: "/llms.txt" },
        { source: "/blog", has: ACCEPTS_MARKDOWN, destination: "/blog/sitemap.md" },
        { source: "/resume", has: ACCEPTS_MARKDOWN, destination: "/resume.md" },
        { source: "/blog/:slug([\\w-]+)", has: ACCEPTS_MARKDOWN, destination: "/blog/md/:slug" },
      ],
      // After files, so the `/blog/sitemap.md` route handler wins.
      afterFiles: [{ source: "/blog/:slug([\\w-]+).md", destination: "/blog/md/:slug" }],
      fallback: [],
    };
  },
};

export default nextConfig;
