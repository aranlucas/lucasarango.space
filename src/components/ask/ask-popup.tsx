"use client";

import { cn } from "cn";
import { SquarePen, X } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAsk } from "@/components/ask/ask-context";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ask/conversation";
import { Composer } from "@/components/ask/composer";
import { RidgeGlyph } from "@/components/ask/ridge-glyph";
import { Starters, Transcript } from "@/components/ask/transcript";

/** A launcher in the corner and the chat panel it opens, over every page. */
export function AskPopup() {
  const { open, chat } = useAsk();
  const panelId = useId();
  const titleId = useId();

  return (
    // The panel and the launcher pill share one view-transition name, carried
    // by whichever is showing: closing during a navigation morphs the panel
    // into the pill, and an open panel holds still while the page changes.
    <div className="print:hidden">
      <section
        id={panelId}
        role="dialog"
        aria-labelledby={titleId}
        hidden={!open}
        style={open ? { viewTransitionName: "ask-surface" } : undefined}
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
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="New conversation"
                  onClick={() => {
                    void chat.stop();
                    chat.setMessages([]);
                    inputRef.current?.focus();
                  }}
                  className="text-muted-foreground"
                />
              }
            >
              <SquarePen aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>New conversation</TooltipContent>
          </Tooltip>
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

function Launcher({ panelId }: { panelId: string }) {
  const { open, isLoading, launcherRef, show, close } = useAsk();
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            ref={launcherRef}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close" : undefined}
            onClick={open ? close : show}
            style={{ viewTransitionName: open ? "ask-launcher" : "ask-surface" }}
            className={cn(
              "fixed inset-e-5 bottom-5 z-40 h-11 rounded-full text-base font-normal shadow-lg",
              open ? "w-11 max-sm:hidden" : "gap-2.5 ps-4 pe-5",
            )}
          />
        }
      >
        {open ? (
          <X aria-hidden="true" className="size-5" />
        ) : (
          <>
            <RidgeGlyph drawing={isLoading} className="h-3 w-6" />
            Ask about my work
          </>
        )}
      </TooltipTrigger>
      {/* The pill labels itself; only the round close button needs a tooltip. */}
      {open && <TooltipContent side="left">Close</TooltipContent>}
    </Tooltip>
  );
}
