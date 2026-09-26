import { ViewTransition } from "react";

// Tab links tag navigations nav-forward/nav-back and slide; anything untyped
// (post links, browser back/forward) crossfades. Lives in each page, not the
// layout, because layouts persist and never enter or exit.
const PAGE_ANIMATION = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "page-fade",
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={PAGE_ANIMATION} exit={PAGE_ANIMATION} default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}

// Titles only morph when opening or leaving a post. On tab switches the whole
// page slides, and a title flying on its own would fight that motion.
const TITLE_MORPH = { "nav-forward": "none", "nav-back": "none", default: "morph" };

/** Shared name for a post title, so the list row morphs into the article heading. */
export function PostTitleTransition({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <ViewTransition name={`post-title-${slug}`} share={TITLE_MORPH} default="none">
      {children}
    </ViewTransition>
  );
}
