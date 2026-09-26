"use client";

import { cn } from "cn";
import { ArrowDown } from "lucide-react";
import type { ComponentProps } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { Button } from "@/components/ui/button";

// A transcript that follows new text while an answer streams, but lets the
// reader scroll up without being pulled back down. Adapted from the AI SDK
// chatbot template's ai-elements/conversation.tsx.
export const Conversation = ({ className, ...props }: ComponentProps<typeof StickToBottom>) => (
  <StickToBottom
    className={cn("relative min-h-0 flex-1 overflow-y-hidden", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export const ConversationContent = (props: ComponentProps<typeof StickToBottom.Content>) => (
  <StickToBottom.Content {...props} />
);

export const ConversationScrollButton = () => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => void scrollToBottom()}
      aria-label="Scroll to latest"
      className="absolute inset-s-1/2 bottom-3 -translate-x-1/2 rounded-full bg-card text-muted-foreground shadow-sm"
    >
      <ArrowDown aria-hidden="true" />
    </Button>
  );
};
