"use client";

import { cn } from "cn";
import Link from "next/link";
import { memo, type ComponentProps } from "react";
import { Streamdown, type Components } from "streamdown";

// Links to this site's pages (the agent cites posts as /blog/slug) navigate
// client-side, so the conversation stays open while the post loads.
function makeComponents(onNavigate: () => void): Components {
  return {
    a: ({ href, children }) =>
      typeof href === "string" && href.startsWith("/") ? (
        <Link href={href} onClick={onNavigate}>
          {children}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      ),
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
