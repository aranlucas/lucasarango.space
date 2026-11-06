import { cn } from "cn";
import { ArrowUpRight } from "lucide-react";

import { ForestLink } from "@/components/forest-link";
import { AskPopup } from "@/components/chat/ask-popup";
import { Barcode } from "@/components/receipt-art";
import { SiteAgentToolsLoader } from "@/components/site-agent-tools-loader";
import { SiteNav } from "@/components/site-nav";
import { postUrl, SITE } from "@/lib/site";
import { getAllPosts } from "@/lib/api";

export function SiteAsk() {
  const postSources = getAllPosts().map((post) => postUrl(post.slug));

  return <AskPopup postSources={postSources} />;
}

// The tabs head the receipt. Lucas's name is printed once, by the page itself.
export function SiteHeader() {
  return (
    <header className="site-header print:hidden" style={{ viewTransitionName: "site-header" }}>
      <SiteNav />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer print:hidden" style={{ viewTransitionName: "site-footer" }}>
      <p className="footer-title">Thank you for stopping by.</p>
      <ul className="footer-links">
        <li>
          <TextLink href={SITE.github}>
            GitHub
            <ArrowUpRight aria-hidden="true" size={14} />
          </TextLink>
        </li>
        <li>
          <TextLink href={SITE.linkedin}>
            LinkedIn
            <ArrowUpRight aria-hidden="true" size={14} />
          </TextLink>
        </li>
        <li>
          <TextLink href="/feed.xml">
            RSS
            <ArrowUpRight aria-hidden="true" size={14} />
          </TextLink>
        </li>
      </ul>
      <Barcode />
      <ForestLink />
      {/* Every page has a footer, so in-browser agents can read the blog from any page. */}
      <SiteAgentToolsLoader />
    </footer>
  );
}

export function TextLink({ className, children, ...props }: React.ComponentProps<"a">) {
  return (
    <a className={cn("text-link", className)} {...props}>
      {children}
    </a>
  );
}
