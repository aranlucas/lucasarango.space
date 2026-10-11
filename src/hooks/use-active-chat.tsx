"use client";

import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAsk } from "@/components/chat/ask-provider";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { CHAT_LIMITS } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";
import { fetchWithErrorHandlers } from "@/lib/utils";

type ActiveChatContextValue = {
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  status: UseChatHelpers<ChatMessage>["status"];
  error: UseChatHelpers<ChatMessage>["error"];
  stop: UseChatHelpers<ChatMessage>["stop"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  isFull: boolean;
  /** Sends a question unless it's empty or the chat is busy or full; false when it didn't. */
  send: (text: string) => boolean;
};

const ActiveChatContext = createContext<ActiveChatContextValue | null>(null);

/** Sends questions queued from elsewhere on the site, such as "Ask about this role". */
function useQueuedQuestions(send: (text: string) => boolean, setInput: (input: string) => void) {
  const { questions, consume } = useAsk();
  const handled = useRef(-1);

  useEffect(() => {
    const question = questions.at(0);

    if (!question || question.id <= handled.current) return;
    // Mark before sending so effect replay cannot submit the same queued question twice.
    handled.current = question.id;
    consume(question.id);

    if (!send(question.text)) setInput(question.text);
  }, [questions, consume, send, setInput]);
}

/** Wraps useChat with the route's transport and its waiting status. */
function useAskChat() {
  const { setWaitingStatus } = useDataStream();

  // Client-only mounting lets the SDK safely generate its default random chat ID.
  return useChat<ChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat", fetch: fetchWithErrorHandlers }),
    onData: (part) => {
      if (part.type === "data-waiting-status") setWaitingStatus(part.data);
    },
  });
}

/** Mounted once on the client and retained by the root layout across navigation. */
export function ActiveChatProvider({ children }: { children: React.ReactNode }) {
  const { setWaitingStatus } = useDataStream();
  const [input, setInput] = useState("");
  const { messages, setMessages, sendMessage, status, error, stop, regenerate } = useAskChat();

  const isLoading = status === "submitted" || status === "streaming";
  const isFull = messages.length >= CHAT_LIMITS.messages;

  const send = useCallback(
    (text: string) => {
      const question = text.trim();

      if (question === "" || isLoading || isFull) return false;

      setWaitingStatus(undefined);
      void sendMessage({ text: question });
      setInput("");

      return true;
    },
    [isLoading, isFull, sendMessage, setWaitingStatus],
  );

  useQueuedQuestions(send, setInput);

  const value = useMemo<ActiveChatContextValue>(
    () => ({
      messages,
      setMessages,
      status,
      error,
      stop,
      regenerate,
      input,
      setInput,
      isLoading,
      isFull,
      send,
    }),
    [messages, setMessages, status, error, stop, regenerate, input, isLoading, isFull, send],
  );

  return <ActiveChatContext value={value}>{children}</ActiveChatContext>;
}

export function useActiveChat(): ActiveChatContextValue {
  const value = use(ActiveChatContext);

  if (value === null) throw new Error("useActiveChat must be used inside <ActiveChatProvider>");

  return value;
}
