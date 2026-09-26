import { cn } from "cn";
import { MountainSnow } from "lucide-react";

import { HomeLink, SiteNav } from "@/components/site-nav";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-7 pb-10 sm:pb-14 print:hidden"
      style={{ viewTransitionName: "site-header" }}
    >
      <HomeLink className="flex items-center gap-2.5 font-semibold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-primary ring-1 ring-border">
          <MountainSnow aria-hidden="true" className="size-4.5" />
        </span>
        {SITE.name}
      </HomeLink>
      <SiteNav />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="pb-12 text-sm text-muted-foreground print:hidden"
      style={{ viewTransitionName: "site-footer" }}
    >
      <Separator className="mb-6" />
      <p className="mb-3 text-base text-foreground">Thanks for stopping by.</p>
      <p className="mb-1.5">
        Find my projects on <TextLink href={SITE.github}>GitHub</TextLink>, or say hello on{" "}
        <TextLink href={SITE.linkedin}>LinkedIn</TextLink>.
      </p>
      <p>
        <TextLink href="/feed.xml">Subscribe with RSS</TextLink>
      </p>
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
