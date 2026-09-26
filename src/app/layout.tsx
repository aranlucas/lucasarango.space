import type { Metadata, Viewport } from "next";
import { cn } from "cn";
import { IBM_Plex_Mono, Literata } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

import { SiteFooter, SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";
import "./globals.css";

const serif = Literata({
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8edee" },
    { media: "(prefers-color-scheme: dark)", color: "#121b21" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { siteName: SITE.name, type: "website", url: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn(serif.variable, mono.variable)}>
      <body>
        <div className="mx-auto flex min-h-dvh max-w-page flex-col px-5 text-body print:max-w-none print:px-0">
          <SiteHeader />
          <main className="flex-1 pb-16">{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
