"use client";

import { isToolUIPart } from "ai";
import { cn } from "cn";
import { useEffect, useState } from "react";

import { MessageResponse } from "@/components/ai-elements/message";
import { useAsk } from "@/components/chat/ask-provider";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { PeakGlyph } from "@/components/chat/icons";
import { WAITING } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";

// Rotated while the model reasons, so a long wait still shows progress.
const REASONING_LABELS = ["Thinking it over", "Connecting the dots", "Picking the best examples"];

type MessageProps = {
  message: ChatMessage;
  isLoading: boolean;
};

export function PreviewMessage({ message, isLoading }: MessageProps) {
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
export function ThinkingMessage() {
  return (
    <div className="mt-2">
      <WaitingText />
    </div>
  );
}

/** The route's waiting status, which turns into "still waiting" when the model is slow. */
function WaitingText() {
  const { waitingStatus } = useDataStream();

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
  part: ChatMessage["parts"][number];
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

  const parts = message.parts.map((part, index) => (
    <AnswerPart
      // Parts only ever append, so their index is stable.
      // oxlint-disable-next-line react/no-array-index-key
      key={index}
      part={part}
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
      <PeakGlyph printing className="h-4 w-6" />
      <span key={label} className="ask-fade-in">
        {label}
      </span>
    </div>
  );
}
