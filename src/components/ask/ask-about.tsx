"use client";

import { Button } from "@/components/ui/button";
import { useAsk } from "@/components/ask/ask-context";

/** A quiet link on the résumé that opens the Ask popup with a question about one role. */
export function AskAbout({ question }: { question: string }) {
  const { ask } = useAsk();
  return (
    <Button
      variant="link"
      onClick={() => {
        ask(question);
      }}
      className="h-auto p-0 font-normal underline decoration-1 underline-offset-3 hover:decoration-2 print:hidden"
    >
      Ask about this role
    </Button>
  );
}
