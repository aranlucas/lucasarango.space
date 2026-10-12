"use client";

import { useChat } from "@ai-sdk/react";

import { Greeting } from "@/components/chat/greeting";
import { PreviewMessage, ThinkingMessage } from "@/components/chat/message";
import { SuggestedActions } from "@/components/chat/suggested-actions";
import { Button } from "@/components/ui/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { isAnswering, isFull, useActiveChat } from "@/hooks/use-active-chat";

/** The greeting and suggestions before the first question, then the transcript. */
export function Messages() {
  const { chat } = useActiveChat();
  const { messages } = useChat({ chat });

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pbs-4 pbe-2">
        <Greeting />
        <SuggestedActions />
      </div>
    );
  }

  // A new question pins near the top while its answer prints below it; the
  // transcript follows once the answer outgrows the panel, until the reader
  // scrolls away.
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport aria-label="Conversation">
          <Transcript />
        </MessageScrollerViewport>
        <MessageScrollerButton
          variant="outline"
          size="icon"
          behavior={prefersReducedMotion() ? "auto" : "smooth"}
          className="rounded-none border-2 border-foreground bg-card text-foreground hover:bg-foreground hover:text-background motion-reduce:transition-none"
        />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

/** Each message is one scroller item; questions are the anchors. */
function Transcript() {
  const { chat } = useActiveChat();
  const { messages, status, error, regenerate } = useChat({ chat });
  const answering = isAnswering(status);

  const retry = () => {
    void regenerate();
  };

  return (
    // Busy while answering, so screen readers read the finished answer, not every chunk.
    <MessageScrollerContent aria-busy={answering} className="gap-0 px-5 pbs-4 pbe-6">
      {messages.map((message, index) => {
        const isLast = index === messages.length - 1;

        return (
          <MessageScrollerItem
            key={message.id}
            messageId={message.id}
            scrollAnchor={message.role === "user"}
            // Every question after the first is ruled off from the answer above it.
            className={
              message.role === "user"
                ? "not-first:mbs-6 not-first:border-bs not-first:pbs-6"
                : undefined
            }
          >
            <PreviewMessage
              message={message}
              isLoading={status === "streaming" && isLast}
              onRetry={isLast && !answering && error === undefined ? retry : undefined}
            />
          </MessageScrollerItem>
        );
      })}
      <TranscriptStatus retry={retry} />
    </MessageScrollerContent>
  );
}

/** What follows the last message: a wait, an error to retry, or a full conversation. */
function TranscriptStatus({ retry }: { retry: () => void }) {
  const { chat } = useActiveChat();
  const { messages, status, error } = useChat({ chat });

  return (
    <>
      {status === "submitted" && messages.at(-1)?.role !== "assistant" && (
        <MessageScrollerItem>
          <ThinkingMessage />
        </MessageScrollerItem>
      )}
      {error !== undefined && (
        <MessageScrollerItem>
          <p className="mbs-4 text-base text-destructive" role="alert">
            {error.message === "" ? "The answer didn’t come through." : error.message}{" "}
            <Button
              variant="link"
              onClick={retry}
              className="h-auto p-0 text-base font-semibold text-destructive underline"
            >
              Try again
            </Button>
          </p>
        </MessageScrollerItem>
      )}
      {isFull(messages) && (
        <MessageScrollerItem>
          <p className="mbs-6 text-sm text-muted-foreground" role="status">
            This conversation is full. Start a new conversation to keep asking.
          </p>
        </MessageScrollerItem>
      )}
    </>
  );
}

// The chat only mounts on the client (ssr: false), so window is always there.
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
