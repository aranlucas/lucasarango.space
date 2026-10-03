"use client";

import { cn } from "cn";
import Link from "next/link";
import { memo, type ComponentProps } from "react";
import { Streamdown, type Components } from "streamdown";

import { SITE } from "@/lib/site";

/** The path of a link to this site, e.g. a post the agent cites, or undefined for other sites. */
function sitePath(href: string): string | undefined {
  if (href.startsWith("/")) return href;
  const url = URL.parse(href);

  return url?.origin === SITE.url ? `${url.pathname}${url.hash}` : undefined;
}

// Links to this site's pages navigate client-side, so the conversation stays
// open while the post loads; other links open in a new tab.
function makeComponents(onNavigate: () => void): Components {
  return {
    a: ({ href, children }) => {
      const path = href === undefined ? undefined : sitePath(href);

      return path === undefined ? (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      ) : (
        <Link href={path} onClick={onNavigate}>
          {children}
        </Link>
      );
    },
  };
}

type Props = ComponentProps<typeof Streamdown> & { onNavigate: () => void };

// Streamdown renders half-finished Markdown (an unclosed **bold**, a partial
// list) cleanly while an answer streams; memo skips re-rendering until the text changes.
export const MessageResponse = memo(
  ({ className, onNavigate, ...props }: Props) => (
    <Streamdown
      className={cn("answer", className)}
      linkSafety={{ enabled: false }}
      components={makeComponents(onNavigate)}
      {...props}
    />
  ),
  (prev, next) => prev.children === next.children && prev.className === next.className,
);

MessageResponse.displayName = "MessageResponse";
