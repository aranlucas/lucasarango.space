import type { Metadata, Viewport } from "next";
import { cn } from "cn";
import { IBM_Plex_Mono, Literata } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

import { SiteFooter, SiteHeader } from "@/components/site-header";
import { FEED_ALTERNATE, SITE, SITE_OPEN_GRAPH } from "@/lib/site";
import "./globals.css";

// Fonts sit on the LCP critical path, so only the upright weight axis is
// preloaded (~39 KB; the opsz axis nearly triples it). Italic and mono load
// on demand, only on pages that actually render them.
const serif = Literata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

const serifItalic = Literata({
  subsets: ["latin"],
  display: "swap",
  style: "italic",
  preload: false,
  variable: "--font-serif-italic",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  preload: false,
  variable: "--font-plex-mono",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#121b21" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  alternates: { types: FEED_ALTERNATE },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn(serif.variable, serifItalic.variable, mono.variable)}>
      <body>
        <a
          href="#main-content"
          className="fixed inset-s-4 top-4 z-50 -translate-y-24 rounded-md bg-background px-4 py-3 text-primary shadow-md focus:translate-y-0 print:hidden"
        >
          Skip to content
        </a>
        <div className="mx-auto flex min-h-dvh max-w-page flex-col px-5 text-body print:max-w-none print:px-0">
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="flex-1 pb-16 print:pb-0">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
