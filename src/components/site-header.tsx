import { cn } from "cn";
import { ArrowUpRight, MoveUpRight } from "lucide-react";

import { HomeLink, SiteNav } from "@/components/site-nav";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header print:hidden" style={{ viewTransitionName: "site-header" }}>
      <HomeLink className="site-wordmark">
        <span className="site-mark" aria-hidden="true">
          <MoveUpRight size={24} strokeWidth={2.5} />
        </span>
        {SITE.name}
      </HomeLink>
      <SiteNav />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer print:hidden" style={{ viewTransitionName: "site-footer" }}>
      <div>
        <p className="footer-title">Keep in touch.</p>
        <p>Thanks for stopping by.</p>
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
