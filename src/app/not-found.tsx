import { MountainSnow } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MountainSnow />
        </EmptyMedia>
        <EmptyTitle>
          <h1 className="text-title font-semibold tracking-tight">Nothing at this address</h1>
        </EmptyTitle>
        <EmptyDescription>The page may have moved or never existed.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Link href="/" className={buttonVariants()}>
          Go to the front page
        </Link>
        <Link href="/blog" className={buttonVariants({ variant: "outline" })}>
          Browse all writing
        </Link>
      </EmptyContent>
    </Empty>
  );
}
