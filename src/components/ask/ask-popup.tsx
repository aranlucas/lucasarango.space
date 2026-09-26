"use client";

import { cn } from "cn";
import { SquarePen, X } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { useAsk } from "@/components/ask/ask-context";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ask/conversation";
import { RidgeGlyph } from "@/components/ask/ridge-glyph";
import { Starters, Transcript } from "@/components/ask/transcript";
import { ASK_LIMITS } from "@/lib/ask-config";

/** A launcher in the corner and the chat panel it opens, over every page. */
export function AskPopup() {
  const { open, chat } = useAsk();
  const panelId = useId();
  const titleId = useId();

  return (
    <div className="print:hidden" style={{ viewTransitionName: "ask-popup" }}>
      <section
        id={panelId}
        role="dialog"
        aria-labelledby={titleId}
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col bg-card text-card-foreground sm:inset-auto sm:inset-e-5 sm:bottom-18 sm:h-popup sm:w-popup sm:rounded-xl sm:border sm:shadow-xl"
      >
        <PanelHeader titleId={titleId} />
        {chat.messages.length > 0 ? (
          <Conversation>
            <ConversationContent className="px-5">
              <Transcript />
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        ) : (
          <Starters />
        )}
        <Composer id={`${panelId}-question`} />
      </section>
      <Launcher panelId={panelId} />
    </div>
  );
}

function PanelHeader({ titleId }: { titleId: string }) {
  const { chat, close, inputRef } = useAsk();
  return (
    <header className="flex items-center justify-between gap-3 border-b py-2 ps-5 pe-3">
      <h2 id={titleId} className="font-semibold">
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
            className="text-muted-foreground"
          >
            <SquarePen aria-hidden="true" />
          </Button>
        )}
        {/* Phones only: the panel covers the launcher, which closes it elsewhere. */}
        <Button
          variant="ghost"
          size="icon"
          onClick={close}
          aria-label="Close"
          className="text-muted-foreground sm:hidden"
        >
          <X aria-hidden="true" className="size-5" />
        </Button>
      </div>
    </header>
  );
}

function Composer({ id }: { id: string }) {
  const { input, setInput, inputRef, send } = useAsk();
  return (
    <form
      className="border-t px-4 pt-3 pb-4"
      onSubmit={(e) => {
        e.preventDefault();
        send(input);
      }}
    >
      <div className="flex items-end gap-2 rounded-lg border bg-background p-1.5 focus-within:border-ring">
        <label htmlFor={id} className="sr-only">
          Your question
        </label>
        <textarea
          ref={inputRef}
          id={id}
          rows={1}
          maxLength={ASK_LIMITS.questionChars}
          placeholder="Ask a question"
          className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-base outline-none placeholder:text-muted-foreground"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send(input);
            }
          }}
          autoComplete="off"
        />
        <ComposerAction />
      </div>
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        A free AI model writes these answers, and it can be wrong.
      </p>
    </form>
  );
}

function ComposerAction() {
  const { chat, input, isLoading, isFull } = useAsk();
  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          void chat.stop();
        }}
      >
        Stop
      </Button>
    );
  }
  return (
    <Button type="submit" size="lg" disabled={input.trim() === "" || isFull} className="px-4">
      Ask
    </Button>
  );
}

function Launcher({ panelId }: { panelId: string }) {
  const { open, isLoading, launcherRef, show, close } = useAsk();
  return (
    <Button
      ref={launcherRef}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Close" : undefined}
      onClick={open ? close : show}
      className={cn(
        "fixed inset-e-5 bottom-5 z-40 h-11 rounded-full text-base font-normal shadow-lg",
        open ? "w-11 max-sm:hidden" : "gap-2.5 ps-4 pe-5",
      )}
    >
      {open ? (
        <X aria-hidden="true" className="size-5" />
      ) : (
        <>
          <RidgeGlyph drawing={isLoading} className="h-3 w-6" />
          Ask about my work
        </>
      )}
    </Button>
  );
}
