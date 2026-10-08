"use client";

import { useChat } from "@ai-sdk/react";
import { SquarePen, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { useAsk } from "@/components/ask/ask-context";
import { AskContent } from "@/components/ask/ask-content";
import { AskRuntimeContext, useAskRuntime } from "@/components/ask/ask-runtime-context";
import { Composer, type ComposerDraft } from "@/components/ask/composer";
import { Button } from "@/components/ui/button";
import { ASK_LIMITS } from "@/lib/ask-config";
import type { AskMessage, WaitingStatus } from "@/lib/ask-types";

function useAskChat(draftRef: RefObject<ComposerDraft | null>) {
  const [waitingStatus, setWaitingStatus] = useState<WaitingStatus>();

  // Client-only mounting lets the SDK safely generate its default random chat ID.
  const chat = useChat<AskMessage>({
    onData: (part) => {
      if (part.type === "data-waiting-status") setWaitingStatus(part.data);
    },
  });

  const isLoading = chat.status === "submitted" || chat.status === "streaming";
  const isFull = chat.messages.length >= ASK_LIMITS.messages;
  const { sendMessage } = chat;

  const send = useCallback(
    (text: string) => {
      const question = text.trim();

      if (question === "" || isLoading || isFull) return false;

      setWaitingStatus(undefined);
      void sendMessage({ text: question });
      draftRef.current?.setInput("");

      return true;
    },
    [isLoading, isFull, sendMessage, draftRef],
  );

  return useMemo(
    () => ({ chat, waitingStatus, isLoading, isFull, send }),
    [chat, waitingStatus, isLoading, isFull, send],
  );
}

function useRuntimeLifecycle(
  send: (text: string) => boolean,
  isLoading: boolean,
  draftRef: RefObject<ComposerDraft | null>,
) {
  const { open, inputRef, questions, consume, setLoading } = useAsk();
  const handled = useRef(-1);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, inputRef]);

  useEffect(() => {
    const question = questions.at(0);

    if (!question || question.id <= handled.current) return;
    // Mark before sending so effect replay cannot submit the same queued question twice.
    handled.current = question.id;
    consume(question.id);

    if (!send(question.text)) draftRef.current?.setInput(question.text);
  }, [questions, consume, send, draftRef]);
}

/** Mounted once on the client and retained by the root layout across navigation. */
export function AskRuntime({ titleId, inputId }: { titleId: string; inputId: string }) {
  const draftRef = useRef<ComposerDraft>(null);
  const state = useAskChat(draftRef);
  useRuntimeLifecycle(state.send, state.isLoading, draftRef);

  return (
    <AskRuntimeContext value={state}>
      <PanelHeader titleId={titleId} />
      <AskContent />
      <Composer id={inputId} ref={draftRef} />
    </AskRuntimeContext>
  );
}

function PanelHeader({ titleId }: { titleId: string }) {
  const { close, inputRef } = useAsk();
  const { chat } = useAskRuntime();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-foreground py-2 ps-5 pe-3">
      <h2 id={titleId} className="font-heading text-lg">
        Ask about my work
      </h2>
      <div className="flex items-center gap-1">
        {chat.messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="New conversation"
            title="New conversation"
            onClick={() => {
              void chat.stop();
              chat.setMessages([]);
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
