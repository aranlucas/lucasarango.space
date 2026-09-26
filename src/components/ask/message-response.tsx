"use client";

import { cn } from "cn";
import Link from "next/link";
import { memo, type ComponentProps } from "react";
import { Streamdown, type Components } from "streamdown";

// Links to this site's pages (the agent cites posts as /blog/slug) navigate
// client-side, so the conversation stays open while the post loads. A path no
// tool returned is one the model made up, so it stays plain text.
function makeComponents(links: ReadonlyMap<string, string>, onNavigate: () => void): Components {
  return {
    a: ({ href, children }) => {
      if (typeof href !== "string" || !href.startsWith("/")) {
        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      }
      if (!links.has(href)) return <span>{children}</span>;
      return (
        <Link href={href} onClick={onNavigate}>
          {children}
        </Link>
      );
    },
  };
}

type Props = ComponentProps<typeof Streamdown> & {
  links: ReadonlyMap<string, string>;
  onNavigate: () => void;
};

// Streamdown renders half-finished Markdown (an unclosed **bold**, a partial
// list) cleanly while an answer streams; memo skips re-rendering until the text changes.
export const MessageResponse = memo(
  ({ className, links, onNavigate, ...props }: Props) => (
    <Streamdown
      className={cn("answer", className)}
      linkSafety={{ enabled: false }}
      components={makeComponents(links, onNavigate)}
      {...props}
    />
  ),
  // Links count too: a tool result can make an earlier link valid.
  (prev, next) =>
    prev.children === next.children &&
    prev.className === next.className &&
    prev.links.size === next.links.size,
);

MessageResponse.displayName = "MessageResponse";
