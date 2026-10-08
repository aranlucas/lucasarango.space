"use client";

import { useChat, type UseChatHelpers } from "@ai-sdk/react";
import {
  startTransition,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

import { AskContext, type AskState } from "@/components/ask/ask-context";
import { ASK_LIMITS } from "@/lib/ask-config";
import type { AskMessage, WaitingStatus } from "@/lib/ask-types";

function useSend(
  chat: UseChatHelpers<AskMessage>,
  setInput: (input: string) => void,
  setWaitingStatus: (status: WaitingStatus | undefined) => void,
) {
  const isLoading = chat.status === "submitted" || chat.status === "streaming";
  const isFull = chat.messages.length >= ASK_LIMITS.messages;
  const { sendMessage } = chat;

  const send = useCallback(
    (text: string) => {
      const question = text.trim();

      if (question === "" || isLoading || isFull) return false;
      // The last question's status must not linger until the route sends a new one.
      setWaitingStatus(undefined);
      void sendMessage({ text: question });
      setInput("");

      return true;
    },
    [isLoading, isFull, sendMessage, setInput, setWaitingStatus],
  );

  return { isLoading, isFull, send };
}

/** The conversation, plus the route's latest waiting status from its transient data parts. */
function useAskChat() {
  const id = useId();
  const [waitingStatus, setWaitingStatus] = useState<WaitingStatus>();

  // Posts to /api/chat, the default endpoint.
  const chat = useChat<AskMessage>({
    // The SDK's default random ID cannot be evaluated during a static prerender.
    id,
    onData: (part) => {
      if (part.type === "data-waiting-status") setWaitingStatus(part.data);
    },
  });

  return { chat, waitingStatus, setWaitingStatus };
}

function useFocusReturn(open: boolean, launcherRef: RefObject<HTMLButtonElement | null>) {
  const requested = useRef(false);
  useEffect(() => {
    if (!open && requested.current) {
      requested.current = false;
      launcherRef.current?.focus();
    }
  }, [open, launcherRef]);

  return useCallback(() => {
    requested.current = true;
  }, []);
}

function useVisibilityActions(setOpen: (open: boolean) => void, returnFocus: () => void) {
  const show = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  // Commit hiding with navigation so its transition morphs the panel into the launcher.
  const hide = useCallback(() => {
    startTransition(() => {
      setOpen(false);
    });
  }, [setOpen]);

  const close = useCallback(() => {
    returnFocus();
    setOpen(false);
  }, [setOpen, returnFocus]);

  return { show, hide, close };
}

function useAskState(): AskState {
  const { chat, waitingStatus, setWaitingStatus } = useAskChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useFocusReturn(open, launcherRef);
  const { isLoading, isFull, send } = useSend(chat, setInput, setWaitingStatus);

  const ask = useCallback(
    (question: string) => {
      setOpen(true);

      if (!send(question)) setInput(question);
    },
    [send],
  );

  const { show, hide, close } = useVisibilityActions(setOpen, returnFocus);

  return useMemo(
    () => ({
      chat,
      waitingStatus,
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
    [chat, waitingStatus, open, isLoading, isFull, input, send, ask, show, close, hide],
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

  return <AskContext value={state}>{children}</AskContext>;
}
