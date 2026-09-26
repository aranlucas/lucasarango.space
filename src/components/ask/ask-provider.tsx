"use client";

import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AskContext, type AskState } from "@/components/ask/ask-context";
import { AskPopup } from "@/components/ask/ask-popup";
import { ASK_LIMITS } from "@/lib/ask-config";

function useSend(chat: UseChatHelpers<UIMessage>, setInput: (input: string) => void) {
  const isLoading = chat.status === "submitted" || chat.status === "streaming";
  const isFull = chat.messages.length >= ASK_LIMITS.messages;
  const { sendMessage } = chat;
  const send = useCallback(
    (text: string) => {
      const question = text.trim();
      if (question === "" || isLoading || isFull) return false;
      void sendMessage({ text: question });
      setInput("");
      return true;
    },
    [isLoading, isFull, sendMessage, setInput],
  );
  return { isLoading, isFull, send };
}

function useAskState(): AskState {
  // Posts to /api/chat, the default endpoint.
  const chat = useChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const { isLoading, isFull, send } = useSend(chat, setInput);

  const ask = useCallback(
    (question: string) => {
      setOpen(true);
      if (!send(question)) setInput(question);
    },
    [send],
  );
  const show = useCallback(() => {
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    setOpen(false);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  return useMemo(
    () => ({
      chat,
      open,
      isLoading,
      isFull,
      input,
      setInput,
      inputRef,
      launcherRef,
      send,
      ask,
      show,
      close,
      hide,
    }),
    [chat, open, isLoading, isFull, input, send, ask, show, close, hide],
  );
}

/**
 * The site-wide Ask popup. It lives in the root layout, so a conversation
 * survives navigation: a reader can follow a linked post and keep asking.
 */
export function AskProvider({ children }: { children: React.ReactNode }) {
  const state = useAskState();
  const { open, close, inputRef } = state;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (open) {
      inputRef.current?.focus();
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, inputRef]);

  return (
    <AskContext value={state}>
      {children}
      <AskPopup />
    </AskContext>
  );
}
