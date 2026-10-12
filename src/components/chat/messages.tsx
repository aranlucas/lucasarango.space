"use client";

import { useChat } from "@ai-sdk/react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Greeting } from "@/components/chat/greeting";
import { PreviewMessage, ThinkingMessage } from "@/components/chat/message";
import { SuggestedActions } from "@/components/chat/suggested-actions";
import { Button } from "@/components/ui/button";
import { isFull, useActiveChat } from "@/hooks/use-active-chat";

/** The greeting and suggestions before the first question, then the transcript. */
export function Messages() {
  const { chat } = useActiveChat();
  const { messages, status, error, regenerate } = useChat({ chat });

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-4 pb-2">
        <Greeting />
        <SuggestedActions />
      </div>
    );
  }

  return (
    <Conversation>
      <ConversationContent className="px-5">
        <div className="flex flex-col pt-4 pb-6">
          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              message={message}
              isLoading={status === "streaming" && index === messages.length - 1}
            />
          ))}
          {status === "submitted" && messages.at(-1)?.role !== "assistant" && <ThinkingMessage />}
          {error !== undefined && (
            <p className="mt-4 text-base text-destructive" role="alert">
              {error.message === "" ? "The answer didn’t come through." : error.message}{" "}
              <Button
                variant="link"
                onClick={() => {
                  void regenerate();
                }}
                className="h-auto p-0 text-base font-semibold text-destructive underline"
              >
                Try again
              </Button>
            </p>
          )}
          {isFull(messages) && (
            <p className="mt-6 text-sm text-muted-foreground" role="status">
              This conversation is full. Start a new conversation to keep asking.
            </p>
          )}
        </div>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
