"use client";

import { Button } from "@/components/ui/button";
import { useActiveChat } from "@/hooks/use-active-chat";
import { suggestions } from "@/lib/constants";

/** Suggested questions, shown before the first message. */
export function SuggestedActions() {
  const { send } = useActiveChat();

  return (
    <ul className="mbs-4 border-bs">
      {suggestions.map((question) => (
        <li key={question} className="border-be">
          <Button
            variant="ghost"
            onClick={() => {
              send(question);
            }}
            className="-mx-2 h-auto min-h-11 w-full justify-start px-2 py-3 text-start text-sm/snug font-semibold text-pretty whitespace-normal hover:bg-transparent hover:text-primary"
          >
            {question}
          </Button>
        </li>
      ))}
    </ul>
  );
}
