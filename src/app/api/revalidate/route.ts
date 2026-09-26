import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

import { RESUME_CACHE_TAG } from "@/lib/resume";

// Called by the resume repo's Cloudflare deploy so a resume change shows up
// right away instead of when the 30-day cache expires.
export function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret === undefined || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(null, { status: 401 });
  }
  // Serve the cached page while the fresh one renders in the background.
  revalidateTag(RESUME_CACHE_TAG, "max");
  return Response.json({ revalidated: true });
}
