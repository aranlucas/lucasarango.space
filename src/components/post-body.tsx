import { cacheLife } from "next/cache";

import markdownToHtml from "@/lib/markdown-to-html";

type PostBodyProps = { markdown: string };

export async function PostBody({ markdown }: PostBodyProps) {
  "use cache";
  cacheLife("max");

  const content = await markdownToHtml(markdown);

  return (
    <div
      className="prose prose-lg max-w-none wrap-break-word prose-headings:font-semibold prose-h2:mbs-11 prose-pre:rounded-md prose-pre:text-sm prose-pre:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
