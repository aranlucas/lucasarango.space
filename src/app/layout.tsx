import type { Metadata, Viewport } from "next";
import { Martian_Mono, Pixelify_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

import { AskProvider } from "@/components/ask/ask-provider";
import { AskPopup } from "@/components/ask/ask-popup";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { WebMCPContent } from "@/components/webmcp-content";
import { markdownAlternate, SITE, SITE_OPEN_GRAPH } from "@/lib/site";
import "./globals.css";

export const ensureStatic = "navigation";

// The receipt is set in one monospace at a condensed width; headings print in
// a bitmap face, like a till's logo. Both sit on the LCP path, so both preload.
const mono = Martian_Mono({
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
  variable: "--font-receipt",
});

const pixel = Pixelify_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#121211" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  alternates: { types: markdownAlternate("/llms.txt") },
  openGraph: { ...SITE_OPEN_GRAPH, url: "/" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${mono.variable} ${pixel.variable}`}>
      <body>
        <a
          href="#main-content"
          className="fixed inset-s-4 top-4 z-50 -translate-y-24 rounded-md bg-background px-4 py-3 text-primary shadow-md focus:translate-y-0 print:hidden"
        >
          Skip to content
        </a>
        <AskProvider>
          <div className="site-shell print:max-w-none print:px-0">
            <SiteHeader />
            <main id="main-content" tabIndex={-1} className="flex-1 pb-12 print:pb-0">
              {children}
            </main>
            <SiteFooter />
          </div>
          <AskPopup />
        </AskProvider>
        <Analytics />
        <WebMCPContent />
        <SpeedInsights />
      </body>
    </html>
  );
}
