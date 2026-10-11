"use client";

import { isToolUIPart } from "ai";
import { cn } from "cn";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAsk } from "@/components/ask/ask-context";
import { useAskRuntime } from "@/components/ask/ask-runtime-context";
import { MessageResponse } from "@/components/ask/message-response";
import { PeakGlyph } from "@/components/ask/peak-glyph";
import { STARTERS, WAITING } from "@/lib/ask-config";
import type { AskMessage } from "@/lib/ask-types";

// Rotated while the model reasons, so a long wait still shows progress.
const REASONING_LABELS = ["Thinking it over", "Connecting the dots", "Picking the best examples"];

/** Suggested questions, shown before the first message. */
export function Starters() {
  const { send } = useAskRuntime();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-4 pb-2">
      <p className="text-sm/relaxed text-muted-foreground">
        This is an agent that has read my résumé and everything I’ve written here. Ask it what you’d
        ask me in a first call.
      </p>
      <ul className="mt-4 border-t">
        {STARTERS.map((question) => (
          <li key={question} className="border-b">
            <Button
              variant="ghost"
              onClick={() => {
                send(question);
              }}
              className="-mx-2 h-auto min-h-11 w-full justify-start px-2 py-3 text-start text-sm/snug font-semibold text-pretty whitespace-normal hover:bg-transparent hover:text-primary"
            >
              {question}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Transcript() {
  const { chat, isFull } = useAskRuntime();
  const { messages, status, error } = chat;

  return (
    <div className="flex flex-col pt-4 pb-6">
      {messages.map((message, index) => (
        <Message
          key={message.id}
          message={message}
          isLoading={status === "streaming" && index === messages.length - 1}
        />
      ))}
      {status === "submitted" && messages.at(-1)?.role !== "assistant" && <ThinkingMessage />}
      {error !== undefined && (
        <p className="mt-4 text-base text-destructive" role="alert">
          {error.message === "" ? "The answer didn’t come through." : error.message}{" "}
          <Button
            variant="link"
            onClick={() => {
              void chat.regenerate();
            }}
            className="h-auto p-0 text-base font-semibold text-destructive underline"
          >
            Try again
          </Button>
        </p>
      )}
      {isFull && (
        <p className="mt-6 text-sm text-muted-foreground" role="status">
          This conversation is full. Start a new conversation to keep asking.
        </p>
      )}
    </div>
  );
}

type MessageProps = {
  message: AskMessage;
  isLoading: boolean;
};

function Message({ message, isLoading }: MessageProps) {
  // Questions read as the headings of an interview transcript; every one
  // after the first is ruled off from the answer above it.
  if (message.role === "user") {
    const text = message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

    return (
      <h3 className="text-lg/snug font-semibold text-pretty text-primary not-first:mt-6 not-first:border-t not-first:pt-6">
        {text}
      </h3>
    );
  }

  const hasAnyContent = message.parts.some(
    (part) =>
      ((part.type === "text" || part.type === "reasoning") && part.text.trim() !== "") ||
      isToolUIPart(part),
  );

  const isThinking = isLoading && !hasAnyContent;

  return (
    <div className="mt-2 text-base/relaxed">
      {isThinking ? <WaitingText /> : <AnswerParts message={message} isLoading={isLoading} />}
    </div>
  );
}

/** Shown after a question is sent, before the reply exists. */
function ThinkingMessage() {
  return (
    <div className="mt-2">
      <WaitingText />
    </div>
  );
}

/** The route's waiting status, which turns into "still waiting" when the model is slow. */
function WaitingText() {
  const { waitingStatus } = useAskRuntime();

  return <Thinking labels={[waitingStatus?.message ?? WAITING.message]} />;
}

const TOOL_LABELS = {
  "tool-listPosts": "Looking through the posts",
  "tool-readPost": "Reading a post",
} as const;

/**
 * One part of an answer, by its own state: tool calls and reasoning show
 * what's happening while they run, and text shows a caret while it streams.
 */
function AnswerPart({
  part,
  onNavigate,
}: {
  part: AskMessage["parts"][number];
  onNavigate: () => void;
}) {
  switch (part.type) {
    case "text":
      return (
        <MessageResponse
          onNavigate={onNavigate}
          className={cn(part.state === "streaming" && "caret")}
        >
          {part.text}
        </MessageResponse>
      );
    case "reasoning":
      return part.state === "streaming" ? <Thinking labels={REASONING_LABELS} /> : null;
    case "tool-listPosts":
    case "tool-readPost":
      switch (part.state) {
        case "input-streaming":
        case "input-available":
          return <Thinking labels={[TOOL_LABELS[part.type]]} />;
        case "approval-requested":
        case "approval-responded":
        case "output-available":
        case "output-denied":
        case "output-error":
          return null;
      }

      break;
    // Parts this agent doesn't produce, or that the popup doesn't show.
    case "custom":
    case "data-waiting-status":
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

function AnswerParts({ message, isLoading }: MessageProps) {
  const { hide } = useAsk();

  // Full screen on phones, so step aside to show the linked page.
  const onNavigate = () => {
    if (!window.matchMedia("(min-width: 40rem)").matches) hide();
  };

  const last = message.parts.at(-1);

  const betweenSteps =
    isLoading && last !== undefined && isToolUIPart(last) && last.state === "output-available";

  const occurrences = new Map<AskMessage["parts"][number]["type"], number>();

  const parts = message.parts.map((part) => {
    const occurrence = occurrences.get(part.type) ?? 0;
    occurrences.set(part.type, occurrence + 1);

    const key = isToolUIPart(part) ? part.toolCallId : `${part.type}:${occurrence}`;

    return <AnswerPart key={key} part={part} onNavigate={onNavigate} />;
  });

  return (
    <>
      {parts}
      {betweenSteps && <Thinking labels={REASONING_LABELS} />}
    </>
  );
}

function Thinking({ labels }: { labels: readonly string[] }) {
  const [tick, setTick] = useState(0);
  const count = labels.length;
  useEffect(() => {
    const id =
      count > 1
        ? setInterval(() => {
            setTick((t) => t + 1);
          }, 2400)
        : undefined;

    return () => {
      clearInterval(id);
    };
  }, [count]);

  const label = labels[tick % labels.length];

  return (
    <div className="flex items-center gap-3 text-muted-foreground" role="status">
      <PeakGlyph printing className="h-4 w-6" />
      <span key={label} className="ask-fade-in">
        {label}
      </span>
    </div>
  );
}
