import Link from "next/link";

import { LostGame } from "@/components/lost/lost-game";

export default function NotFound() {
  return (
    <LostGame>
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-title font-semibold tracking-tight text-balance">
          Nothing at this address
        </h1>
        <p className="text-night-muted">The page may have moved or never existed.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-8 items-center rounded-lg bg-lamp px-2.5 text-sm font-medium text-lamp-foreground hover:bg-lamp/85"
        >
          Go to the front page
        </Link>
        <Link
          href="/blog"
          className="inline-flex h-8 items-center rounded-lg border border-night-muted/60 px-2.5 text-sm font-medium text-night-foreground hover:bg-night-foreground/10"
        >
          Browse all writing
        </Link>
      </div>
    </LostGame>
  );
}
