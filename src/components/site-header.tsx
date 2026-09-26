import { cn } from "cn";
import { MountainSnow } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/lib/site";

const navLink = cn(
  buttonVariants({ variant: "ghost", size: "sm" }),
  "text-base font-normal text-muted-foreground hover:text-foreground",
);

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-7 pb-14 print:hidden">
      <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-primary ring-1 ring-border">
          <MountainSnow aria-hidden="true" className="size-4.5" />
        </span>
        {SITE.name}
      </Link>
      <nav aria-label="Main" className="-me-2.5 flex gap-1">
        <Link href="/" className={navLink}>
          About
        </Link>
        <Link href="/blog" className={navLink}>
          Writing
        </Link>
        <Link href="/resume" className={navLink}>
          Resume
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="pb-12 text-sm text-muted-foreground print:hidden">
      <Separator className="mb-6" />
      <p className="mb-1.5">
        Find me on <TextLink href={SITE.github}>GitHub</TextLink> and{" "}
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
