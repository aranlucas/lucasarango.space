"use client";

import { isToolUIPart } from "ai";
import { cn } from "cn";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAsk } from "@/components/ask/ask-context";
import { MessageResponse } from "@/components/ask/message-response";
import { RidgeGlyph } from "@/components/ask/ridge-glyph";
import { STARTERS, WAITING } from "@/lib/ask-config";
import type { AskMessage } from "@/lib/ask-types";

// Rotated while the model reasons, so a long wait still shows progress.
const REASONING_LABELS = ["Thinking it over", "Connecting the dots", "Picking the best examples"];

/** Suggested questions, shown before the first message. */
export function Starters() {
  const { send } = useAsk();
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-end overflow-y-auto px-5 pt-6 pb-2">
      <p className="text-base/relaxed text-muted-foreground">
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
              className="-mx-2 h-auto w-full justify-start px-2 py-3 text-start text-base/snug font-semibold text-pretty whitespace-normal hover:bg-transparent hover:text-primary"
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
  const { chat, isFull } = useAsk();
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
  const { waitingStatus } = useAsk();
  return <Thinking labels={[waitingStatus?.message ?? WAITING.message]} />;
}

/** A tool call that hasn't returned yet. */
function isRunning(state: string) {
  return state === "input-streaming" || state === "input-available";
}

/** One part of an answer. Tool calls and reasoning aren't shown, only what's happening right now. */
function AnswerPart({
  part,
  isLoading,
  isLast,
  onNavigate,
}: {
  part: AskMessage["parts"][number];
  isLoading: boolean;
  isLast: boolean;
  onNavigate: () => void;
}) {
  switch (part.type) {
    case "text":
      return (
        <MessageResponse onNavigate={onNavigate} className={cn(isLoading && isLast && "caret")}>
          {part.text}
        </MessageResponse>
      );
    case "reasoning":
      return isLoading && part.state === "streaming" ? (
        <Thinking labels={REASONING_LABELS} />
      ) : null;
    case "tool-listPosts":
      return isLoading && isRunning(part.state) ? (
        <Thinking labels={["Looking through the posts"]} />
      ) : null;
    case "tool-readPost":
      return isLoading && isRunning(part.state) ? <Thinking labels={["Reading a post"]} /> : null;
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
  const parts = message.parts.map((part, index) => (
    <AnswerPart
      // Parts only ever append, so their index is stable.
      // oxlint-disable-next-line react/no-array-index-key
      key={index}
      part={part}
      isLoading={isLoading}
      isLast={index === message.parts.length - 1}
      onNavigate={onNavigate}
    />
  ));
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
      <RidgeGlyph drawing className="h-4 w-10 text-primary" />
      <span key={label} className="animate-in fade-in">
        {label}
      </span>
    </div>
  );
}
