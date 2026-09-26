"use client";

import { cn } from "cn";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ViewTransition } from "react";

import { buttonVariants } from "@/components/ui/button";

// Tab order sets the slide direction: moving right slides content left.
const TABS = [
  { href: "/", segment: null, label: "About" },
  { href: "/blog", segment: "blog", label: "Writing" },
  { href: "/resume", segment: "resume", label: "Resume" },
] as const;

const navLink = cn(
  buttonVariants({ variant: "ghost", size: "sm" }),
  "relative text-base font-normal text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground",
);

function useActiveTabIndex() {
  // Route segments agree during server rendering and hydration, including a
  // static 404 served for an unknown /blog/slug. The requested pathname may not.
  const activeSegment = useSelectedLayoutSegment();
  return TABS.findIndex(({ segment }) => segment === activeSegment);
}

/** Tags a tab navigation with its direction; same-tab moves stay untyped and crossfade. */
function useTransitionTypes(href: string) {
  const from = useActiveTabIndex();
  const to = TABS.findIndex((tab) => tab.href === href);
  if (from === -1 || from === to) return [];
  return [to > from ? "nav-forward" : "nav-back"];
}

export function HomeLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href="/" transitionTypes={useTransitionTypes("/")} className={className}>
      {children}
    </Link>
  );
}

export function SiteNav() {
  const active = useActiveTabIndex();
  return (
    <nav aria-label="Main" className="-me-2.5 flex gap-1">
      {TABS.map((tab, i) => (
        <TabLink key={tab.href} href={tab.href} current={i === active}>
          {tab.label}
        </TabLink>
      ))}
    </nav>
  );
}

function TabLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      transitionTypes={useTransitionTypes(href)}
      aria-current={current ? "page" : undefined}
      className={navLink}
    >
      {children}
      {current && (
        // Only one indicator exists at a time, so the shared name glides it between tabs.
        <ViewTransition name="nav-indicator" share="nav-indicator" default="none">
          <span
            aria-hidden="true"
            className="absolute inset-x-2.5 bottom-0 h-0.5 rounded-full bg-primary"
          />
        </ViewTransition>
      )}
    </Link>
  );
}
