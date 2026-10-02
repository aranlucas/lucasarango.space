import { cn } from "cn";
import { ArrowUpRight, MountainSnow } from "lucide-react";

import { ForestLink } from "@/components/forest-link";
import { AskPopup } from "@/components/ask/ask-popup";
import { HomeLink, SiteNav } from "@/components/site-nav";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header print:hidden" style={{ viewTransitionName: "site-header" }}>
      <HomeLink className="site-wordmark">
        <span className="site-mark" aria-hidden="true">
          <MountainSnow size={18} strokeWidth={1.5} />
        </span>
        {SITE.name}
      </HomeLink>
      <div className="site-header-actions">
        <SiteNav />
        <AskPopup />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer print:hidden" style={{ viewTransitionName: "site-footer" }}>
      <div>
        <p className="footer-title">Thanks for stopping by.</p>
        <ForestLink />
      </div>
      <div className="footer-links">
        <TextLink href={SITE.github}>
          GitHub <ArrowUpRight aria-hidden="true" size={17} />
        </TextLink>
        <TextLink href={SITE.linkedin}>
          LinkedIn <ArrowUpRight aria-hidden="true" size={17} />
        </TextLink>
        <TextLink href="/feed.xml">
          Subscribe with RSS <ArrowUpRight aria-hidden="true" size={17} />
        </TextLink>
      </div>
    </footer>
  );
}

export function TextLink({ className, children, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "text-primary underline decoration-1 underline-offset-3 hover:decoration-2",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
