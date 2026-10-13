"use client";

import { cn } from "cn";
import { useEffect, useRef, useState } from "react";

import { MessageResponse } from "@/components/ai-elements/message";
import { finishedToolLabel } from "@/components/chat/activity";
import { useAsk } from "@/components/chat/ask-provider";
import { PeakGlyph } from "@/components/chat/icons";
import { Button } from "@/components/ui/button";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import type { ChatMessage } from "@/lib/types";

type AnswerActionsProps = { answer: string; onRetry?: () => void };

type CopyActionProps = { text: string };

type ToolStepProps = { label: string | null };

type AnswerStatusProps = { label: string };

type MessageProps = {
  message: ChatMessage;
  isLoading: boolean;
  /** Asks again for this answer; only the latest finished answer has it. */
  onRetry?: () => void;
};

type MessagePart = ChatMessage["parts"][number];

/** Whether a part has anything to show yet. Reasoning only ever shows in the status row. */
function hasContent(part: MessagePart): boolean {
  switch (part.type) {
    case "text":
      return part.text.trim() !== "";
    case "tool-listPosts":
    case "tool-readPost":
      return finishedToolLabel(part) !== null;
    // Parts this agent doesn't produce, or that the popup doesn't show.
    case "reasoning":
    case "custom":
    case "dynamic-tool":
    case "file":
    case "reasoning-file":
    case "source-document":
    case "source-url":
    case "step-start":
      break;
  }

  return false;
}

/** Questions read as the headings of an interview transcript; answers follow part by part. */
export function PreviewMessage({ message, isLoading, onRetry }: MessageProps) {
  const { hide } = useAsk();

  // Full screen on phones, so step aside to show the linked page.
  const onNavigate = () => {
    if (!window.matchMedia("(min-width: 40rem)").matches) {
      hide();
    }
  };

  // Until the answer has something to show, the status row below speaks for it.
  if (message.role === "assistant" && !message.parts.some(hasContent)) {
    return null;
  }

  const parts = message.parts.map((part, index) => (
    <PreviewPart
      // Parts only ever append, so their index is stable.
      // oxlint-disable-next-line react/no-array-index-key
      key={index}
      part={part}
      role={message.role}
      onNavigate={onNavigate}
    />
  ));

  if (message.role === "user") {
    return (
      <Message className="text-base">
        <MessageContent className="gap-0">{parts}</MessageContent>
      </Message>
    );
  }

  return (
    <Message className="mbs-2 text-base/relaxed">
      <MessageContent className="gap-2">
        <div>{parts}</div>
        {!isLoading && <AnswerActions answer={answerText(message)} onRetry={onRetry} />}
      </MessageContent>
    </Message>
  );
}

/** Copy, and Retry on the latest answer, once it has finished printing. */
function AnswerActions({ answer, onRetry }: AnswerActionsProps) {
  if (answer === "") {
    return null;
  }

  return (
    <MessageFooter className="-ms-1.5 gap-1 px-0">
      <CopyAction text={answer} />
      {onRetry !== undefined && (
        <Button variant="ghost" onClick={onRetry} className="answer-action">
          Retry
        </Button>
      )}
    </MessageFooter>
  );
}

/** The answer's Markdown, as the reader would paste it elsewhere. */
function answerText(message: ChatMessage): string {
  return message.parts
    .flatMap((part) => (part.type === "text" ? [part.text.trim()] : []))
    .join("\n\n")
    .trim();
}

const COPIED_MS = 2000;

/** Copies the answer and says so for a moment. */
function CopyAction({ text }: CopyActionProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = copied
      ? setTimeout(() => {
          setCopied(false);
        }, COPIED_MS)
      : undefined;

    return () => {
      clearTimeout(id);
    };
  }, [copied]);

  return (
    <Button
      variant="ghost"
      onClick={() => {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setCopied(true);

            return null;
          })
          .catch(() => {
            setCopied(false);

            return null;
          });
      }}
      className="answer-action"
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

type PreviewPartProps = {
  part: MessagePart;
  role: ChatMessage["role"];
  onNavigate: () => void;
};

/** One part, narrowed by its type: text streams with a caret, a finished tool leaves a step. */
function PreviewPart({ part, role, onNavigate }: PreviewPartProps) {
  switch (part.type) {
    case "text":
      return role === "user" ? (
        <h3 className="text-lg/snug font-semibold text-pretty text-primary">{part.text}</h3>
      ) : (
        <MessageResponse
          onNavigate={onNavigate}
          className={cn(part.state === "streaming" && "caret")}
        >
          {part.text}
        </MessageResponse>
      );
    case "tool-listPosts":
    case "tool-readPost":
      return <ToolStep label={finishedToolLabel(part)} />;
    // Parts this agent doesn't produce, or that the popup doesn't show.
    case "reasoning":
    case "custom":
    case "dynamic-tool":
    case "file":
    case "reasoning-file":
    case "source-document":
    case "source-url":
    case "step-start":
      break;
  }

  return null;
}

/** A finished tool, printed like a receipt line above the answer; running tools show in the status row. */
function ToolStep({ label }: ToolStepProps) {
  if (label === null) {
    return null;
  }

  return (
    // The last step in a row leaves room before the answer.
    <p
      data-tool-step
      className="flex items-center gap-3 pbe-1 text-sm text-muted-foreground [&:not(:has(+[data-tool-step]))]:pbe-3"
    >
      <PeakGlyph className="h-3 w-6 shrink-0" />
      <span className="truncate">{label}</span>
    </p>
  );
}

// Long enough to read a short line before the next one replaces it.
const HOLD_MS = 1000;

/**
 * What the answer is doing, from the moment the question is sent until it
 * prints. One row for the whole wait, so the glyph keeps printing across
 * steps instead of starting over.
 */
export function AnswerStatus({ label }: AnswerStatusProps) {
  const shown = useHeldLabel(label);

  return (
    <Message className="mbs-2 text-base/relaxed">
      <div
        className="ask-fade-in flex min-w-0 items-center gap-3 text-muted-foreground"
        role="status"
      >
        <PeakGlyph printing className="h-4 w-6 shrink-0" />
        <span className="truncate">{shown}</span>
      </div>
    </Message>
  );
}

/** Follows `label`, but keeps each one on screen for at least HOLD_MS so fast steps don't flicker. */
function useHeldLabel(label: string) {
  const [shown, setShown] = useState(label);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    shownAt.current ??= Date.now();

    const wait = Math.max(0, shownAt.current + HOLD_MS - Date.now());

    const id =
      label === shown
        ? undefined
        : setTimeout(() => {
            shownAt.current = Date.now();
            setShown(label);
          }, wait);

    return () => {
      clearTimeout(id);
    };
  }, [label, shown]);

  return shown;
}
