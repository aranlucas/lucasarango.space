"use client";

import { cn } from "cn";
import { useEffect, useState } from "react";

import { MessageResponse } from "@/components/ai-elements/message";
import { useAsk } from "@/components/chat/ask-provider";
import { PeakGlyph } from "@/components/chat/icons";
import { WAITING_MESSAGE } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";

// Rotated while the model reasons, so a long wait still shows progress.
const REASONING_LABELS = ["Thinking it over", "Connecting the dots", "Picking the best examples"];

type MessageProps = {
  message: ChatMessage;
  isLoading: boolean;
};

type MessagePart = ChatMessage["parts"][number];

const TOOL_LABELS = {
  "tool-listPosts": "Looking through the posts",
  "tool-readPost": "Reading a post",
} as const;

/** Whether a part has anything to show yet. */
function hasContent(part: MessagePart): boolean {
  switch (part.type) {
    case "text":
    case "reasoning":
      return part.text.trim() !== "";
    case "tool-listPosts":
    case "tool-readPost":
      return true;
    // Parts this agent doesn't produce, or that the popup doesn't show.
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
export function PreviewMessage({ message, isLoading }: MessageProps) {
  const { hide } = useAsk();

  // Full screen on phones, so step aside to show the linked page.
  const onNavigate = () => {
    if (!window.matchMedia("(min-width: 40rem)").matches) hide();
  };

  if (message.role === "assistant" && isLoading && !message.parts.some(hasContent)) {
    return (
      <div className="mt-2 text-base/relaxed">
        <Thinking labels={[WAITING_MESSAGE]} />
      </div>
    );
  }

  const parts = message.parts.map((part, index) => (
    <PreviewPart
      // Parts only ever append, so their index is stable.
      // oxlint-disable-next-line react/no-array-index-key
      key={index}
      part={part}
      role={message.role}
      // Only the last part can be between steps.
      isLoading={isLoading && index === message.parts.length - 1}
      onNavigate={onNavigate}
    />
  ));

  return message.role === "user" ? parts : <div className="mt-2 text-base/relaxed">{parts}</div>;
}

type PreviewPartProps = {
  part: MessagePart;
  role: ChatMessage["role"];
  isLoading: boolean;
  onNavigate: () => void;
};

/** One part, narrowed by its type: text streams with a caret, reasoning shows a thinking label. */
function PreviewPart({ part, role, isLoading, onNavigate }: PreviewPartProps) {
  switch (part.type) {
    case "text":
      // Every question after the first is ruled off from the answer above it.
      return role === "user" ? (
        <h3 className="text-lg/snug font-semibold text-pretty text-primary not-first:mt-6 not-first:border-t not-first:pt-6">
          {part.text}
        </h3>
      ) : (
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
      return <ToolPart part={part} isLoading={isLoading} />;
    // Parts this agent doesn't produce, or that the popup doesn't show.
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

type ToolPartProps = {
  part: Extract<MessagePart, { type: keyof typeof TOOL_LABELS }>;
  isLoading: boolean;
};

/** A tool call, narrowed by its state: what it's doing while it runs, nothing once it's done. */
function ToolPart({ part, isLoading }: ToolPartProps) {
  switch (part.state) {
    case "input-streaming":
    case "input-available":
      return <Thinking labels={[TOOL_LABELS[part.type]]} />;
    case "output-available":
      // Between steps: the tool is done and the next model call hasn't streamed yet.
      return isLoading ? <Thinking labels={REASONING_LABELS} /> : null;
    case "approval-requested":
    case "approval-responded":
    case "output-denied":
    case "output-error":
      break;
  }

  return null;
}

/** Shown after a question is sent, before the reply exists. */
export function ThinkingMessage() {
  return (
    <div className="mt-2">
      <Thinking labels={[WAITING_MESSAGE]} />
    </div>
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
