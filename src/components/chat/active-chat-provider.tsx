"use client";

import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport, type ChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

import { useAsk } from "@/hooks/use-ask";
import { ActiveChatContext, isAnswering, isFull } from "@/hooks/use-active-chat";
import type { ChatMessage } from "@/lib/types";
import { fetchWithErrorHandlers } from "@/lib/utils";

const askTransport = () =>
  new DefaultChatTransport<ChatMessage>({ api: "/api/chat", fetch: fetchWithErrorHandlers });

// Client-only mounting lets the SDK safely generate its default random chat ID.
function createChat(transport: ChatTransport<ChatMessage>) {
  return new Chat<ChatMessage>({ transport });
}

/** Sends questions queued from elsewhere on the site, such as "Ask about this role". */
function useQueuedQuestions(send: (text: string) => boolean, setInput: (input: string) => void) {
  const { questions, consume } = useAsk();
  const handled = useRef(-1);

  useEffect(() => {
    const question = questions.at(0);

    if (!question || question.id <= handled.current) {
      return;
    }
    // Mark before sending so effect replay cannot submit the same queued question twice.

    handled.current = question.id;
    consume(question.id);

    if (!send(question.text)) {
      setInput(question.text);
    }
  }, [questions, consume, send, setInput]);
}

type ProviderProps = {
  children: React.ReactNode;
  /** Where questions go; the Ask API route unless a test scripts the answers. */
  transport?: ChatTransport<ChatMessage>;
};

/** Mounted once on the client and retained by the root layout across navigation. */
export function ActiveChatProvider({ children, transport = askTransport() }: ProviderProps) {
  const [chat, setChat] = useState(() => createChat(transport));
  const [input, setInput] = useState("");

  const clearChat = () => {
    chat.stop().catch(() => null);
    setChat(createChat(transport));
  };

  const send = (text: string) => {
    const question = text.trim();

    if (question === "" || isAnswering(chat.status) || isFull(chat.messages)) {
      return false;
    }

    chat.sendMessage({ text: question }).catch(() => null);
    setInput("");

    return true;
  };

  useQueuedQuestions(send, setInput);

  return (
    <ActiveChatContext value={{ chat, clearChat, input, setInput, send }}>
      {children}
    </ActiveChatContext>
  );
}
