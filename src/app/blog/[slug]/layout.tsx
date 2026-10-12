import type { ReactNode } from "react";

import { ReadingProgress } from "@/components/reading-progress";

export default function PostLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ReadingProgress />
      <article className="reading-article">{children}</article>
    </>
  );
}
