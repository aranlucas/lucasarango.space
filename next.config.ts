import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // The Ask agent's tools read posts at request time, which tracing can't see.
  outputFileTracingIncludes: {
    "/api/chat": ["./_posts/**/*.md"],
  },
};

export default nextConfig;
