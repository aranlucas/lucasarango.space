"use client";

import { cn } from "cn";
import Link from "next/link";
import type { ComponentProps } from "react";
import { Streamdown, type Components } from "streamdown";

import { citationUrl } from "@/lib/citations";
import { SITE } from "@/lib/site";

// Links to this site's pages navigate client-side, so the conversation stays
// open while the post loads; other links open in a new tab.
function makeComponents(onNavigate: () => void, postSources: string[]): Components {
  return {
    // A model cannot introduce a remote image into the conversation.
    img: ({ alt }) => <span>{alt}</span>,
    a: ({ href, children }) => {
      const url = citationUrl(href, postSources);

      if (url === undefined) {
        return <span>{children}</span>;
      }

      return url.origin === SITE.url ? (
        <Link href={`${url.pathname}${url.hash}`} onClick={onNavigate}>
          {children}
        </Link>
      ) : (
        <a href={url.href} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    },
  };
}

type Props = ComponentProps<typeof Streamdown> & { onNavigate: () => void; postSources: string[] };

// Streamdown renders half-finished Markdown (an unclosed **bold**, a partial
// list) cleanly while an answer streams; the compiler handles memoization.
export function MessageResponse({ className, onNavigate, postSources, ...props }: Props) {
  return (
    <Streamdown
      className={cn("answer", className)}
      linkSafety={{ enabled: false }}
      components={makeComponents(onNavigate, postSources)}
      {...props}
    />
  );
}
