import type { ReactNode } from "react";

import { ReadingProgress } from "@/components/reading-progress";

type PostLayoutProps = { children: ReactNode };

export default function PostLayout({ children }: PostLayoutProps) {
  return (
    <>
      <ReadingProgress />
      <article className="reading-article">{children}</article>
    </>
  );
}
