import { ArrowUpRight } from "lucide-react";

import { TextLink } from "@/components/site-header";
import { formatDate } from "@/lib/posts";
import { PUBLICATIONS } from "@/lib/site";

export function PublicationList() {
  return (
    <ul className="flex flex-col gap-6">
      {PUBLICATIONS.map((post) => (
        <li key={post.href}>
          <p className="mb-1 text-xs text-muted-foreground">
            DoorDash Engineering · <time dateTime={post.date}>{formatDate(post.date)}</time>
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
