"use client";

import { useChat } from "@ai-sdk/react";
import { SquarePen, X } from "lucide-react";

import { useAsk } from "@/components/chat/ask-provider";
import { Button } from "@/components/ui/button";
import { useActiveChat } from "@/hooks/use-active-chat";

export function ChatHeader({ titleId }: { titleId: string }) {
  const { close, inputRef } = useAsk();
  const { chat, clearChat } = useActiveChat();
  const { messages } = useChat({ chat });

  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-foreground py-2 ps-5 pe-3">
      <h2 id={titleId} className="font-heading text-lg">
        Ask about my work
      </h2>
      <div className="flex items-center gap-1">
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="New conversation"
            title="New conversation"
            onClick={() => {
              clearChat();
              inputRef.current?.focus();
            }}
            className="size-11 text-muted-foreground"
          >
            <SquarePen aria-hidden="true" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={close}
          aria-label="Close"
          title="Close"
          className="size-11 text-muted-foreground"
        >
          <X aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </div>
  );
}
