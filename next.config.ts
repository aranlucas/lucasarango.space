import type { NextConfig } from "next";

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
  // The Ask agent's tools read posts at request time, which tracing can't see.
  outputFileTracingIncludes: {
    "/api/chat": ["./_posts/**/*.md"],
  },
};

export default nextConfig;
