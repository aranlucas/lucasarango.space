"use client";

import { useAskRuntime } from "@/components/ask/ask-runtime-context";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ask/conversation";
import { Starters, Transcript } from "@/components/ask/transcript";

/** Loaded when Ask opens, while the provider keeps the conversation across navigation. */
export function AskContent() {
  const { chat } = useAskRuntime();

  return chat.messages.length > 0 ? (
    <Conversation>
      <ConversationContent className="px-5">
        <Transcript />
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  ) : (
    <Starters />
  );
}
