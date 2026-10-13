"use client";

import type { Chat } from "@ai-sdk/react";
import type { ChatStatus } from "ai";
import { createContext, use } from "react";

import { CHAT_LIMITS } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";

/**
 * One conversation shared by the Ask panel, after the AI SDK's shared chat
 * context cookbook: components read it with useChat({ chat }).
 */
type ActiveChatContextValue = {
  chat: Chat<ChatMessage>;
  /** Stops any answer and starts a new conversation. */
  clearChat: () => void;
  input: string;
  setInput: (input: string) => void;
  /** Sends a question unless it's empty or the chat is busy or full; false when it didn't. */
  send: (text: string) => boolean;
};

export const ActiveChatContext = createContext<ActiveChatContextValue | null>(null);

export const isAnswering = (status: ChatStatus) => status === "submitted" || status === "streaming";

export const isFull = (messages: ChatMessage[]) => messages.length >= CHAT_LIMITS.messages;

export function useActiveChat(): ActiveChatContextValue {
  const value = use(ActiveChatContext);

  if (value === null) {
    throw new Error("useActiveChat must be used inside <ActiveChatProvider>");
  }

  return value;
}
