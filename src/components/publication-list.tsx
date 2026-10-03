import { ArrowUpRight } from "lucide-react";

import { TextLink } from "@/components/site-header";
import { formatMonth, getResume } from "@/lib/resume";

export async function PublicationList() {
  const { publications } = await getResume();

  return (
    <ul className="flex flex-col gap-6">
      {publications.map((post) => (
        <li key={post.href}>
          <p className="mb-1 text-xs text-muted-foreground">
            {post.publisher} · <time dateTime={post.date}>{formatMonth(post.date, "long")}</time>
          </p>
          <h3 className="text-base font-semibold">
            <TextLink href={post.href} className="no-underline hover:underline">
              {post.title} <ArrowUpRight aria-hidden="true" className="inline size-4" />
            </TextLink>
          </h3>
          <p className="mt-1 text-sm/relaxed text-muted-foreground">{post.summary}</p>
        </li>
      ))}
    </ul>
  );
}
