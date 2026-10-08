import { cacheLife } from "next/cache";

import markdownToHtml from "@/lib/markdown-to-html";

export async function PostBody({ markdown }: { markdown: string }) {
  "use cache";
  cacheLife("max");

  const content = await markdownToHtml(markdown);

  return (
    <div
      className="prose prose-lg max-w-none wrap-break-word prose-headings:font-semibold prose-h2:mt-11 prose-pre:rounded-md prose-pre:text-sm prose-pre:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
