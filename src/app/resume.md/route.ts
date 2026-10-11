import { MARKDOWN_HEADERS } from "@/lib/post-markdown";
import { getResume } from "@/lib/resume";
import { resumeToMarkdown } from "@/lib/resume-markdown";

// Reached directly, or through the rewrite in next.config.ts for an
// `Accept: text/markdown` request to `/resume`. `getResume` is cached and
// tagged, so this prerenders and refreshes with the page.
export async function GET() {
  return new Response(resumeToMarkdown(await getResume()), { headers: MARKDOWN_HEADERS });
}
