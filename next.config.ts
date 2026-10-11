import type { NextConfig } from "next";

// Public origin-trial token for https://lucasarango.space:443, expires March 29, 2027.
// It is delivered to every visitor; it is not an authentication credential.
const WEBMCP_ORIGIN_TRIAL_TOKEN =
  "AjJY27Ugx8OTgMyemTTvFF+qJ6Q81djNQ1jjLNv+CUZnaBr6aC+NnylVZqQlvS0UQssDJ2F3mfIRv1cB1xR95gEAAABReyJvcmlnaW4iOiJodHRwczovL2x1Y2FzYXJhbmdvLnNwYWNlOjQ0MyIsImZlYXR1cmUiOiJXZWJNQ1AiLCJleHBpcnkiOjE4MDYzNjQ4MDB9";

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
  // Origin-trial tokens are issued for the deployment's exact public origin.
  headers() {
    const token = process.env.WEBMCP_ORIGIN_TRIAL_TOKEN ?? WEBMCP_ORIGIN_TRIAL_TOKEN;

    return token === ""
      ? []
      : [{ source: "/:path*", headers: [{ key: "Origin-Trial", value: token }] }];
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
